# 👤 Linux User & Group Management — Complete Guide

Everything about creating, modifying, and managing users, groups, and the permissions tied to them. Structured to pair with the RHCSA-aligned course roadmap (Module 3: User & Group Administration, Module 4: File Permissions & Access Control).

---

## PART 1: Core Concepts

### How Linux Tracks Users
Every user has a **UID** (User ID) and belongs to at least one **GID** (Group ID). Linux stores this in plain text system files:

| File | Purpose | Notes / Gotchas |
| :--- | :--- | :--- |
| `/etc/passwd` | User account info (username, UID, GID, home dir, shell) | Password field here is just `x` — real hash lives in `/etc/shadow`. World-readable by design. |
| `/etc/shadow` | Encrypted passwords + password aging info | Only root can read this. Never world-readable — a common security misconfig is loosening its permissions. |
| `/etc/group` | Group names, GIDs, and member lists | Supplementary group memberships are listed here. |
| `/etc/gshadow` | Group passwords (rarely used) | Mostly legacy; group admin/password features are uncommon in modern setups. |
| `/etc/login.defs` | Default policies (UID ranges, password aging defaults) | Where `useradd` gets its defaults from if you don't specify flags. |

**Reading a `/etc/passwd` line:**
```
maradona:x:1001:1001:Maradona Dev:/home/maradona:/bin/bash
```
`username : password-placeholder : UID : GID : comment/full-name : home-dir : login-shell`

### User Types
| Type | UID Range (typical) | Example |
| :--- | :--- | :--- |
| Root | 0 | `root` |
| System users | 1–999 (RHEL) / 1–999 or 1–99 (Debian varies) | `nginx`, `sshd` — used by services, not humans |
| Regular users | 1000+ | Your actual login accounts |

### Primary vs. Supplementary Groups
- **Primary group** — every user has exactly one; owns files the user creates by default. Stored in `/etc/passwd` (GID field).
- **Supplementary (secondary) groups** — a user can belong to many; used to grant extra access (e.g. `sudo`, `docker`, `wheel`). Stored in `/etc/group`.

---

## PART 2: User Commands

### Viewing User Info

| Command | Description | Example | ⚠️ Notes / Gotchas |
| :--- | :--- | :--- | :--- |
| `whoami` | Print current username | `whoami` | Simplest identity check. |
| `id` | Show UID, GID, and all group memberships | `id maradona` | Best single command to confirm exactly what groups a user is really in. |
| `groups` | List groups a user belongs to | `groups maradona` | Shorter output than `id`, names only. |
| `finger` | Detailed user info (if installed) | `finger maradona` | Not installed by default on most modern distros. |
| `getent passwd` | Query user database (works with LDAP/AD too) | `getent passwd maradona` | Preferred over `grep`-ing `/etc/passwd` directly — works with any configured user backend, not just local files. |
| `last` | Show login history | `last maradona` | Reads `/var/log/wtmp`; useful for auditing. |

### Creating Users

```bash
useradd username                        # create user with defaults from /etc/login.defs
useradd -m username                      # create with a home directory (needed on some distros — RHEL does this by default, Debian does not)
useradd -m -s /bin/bash username          # set login shell explicitly
useradd -m -c "Full Name" username         # add a comment/full name
useradd -m -u 1050 username                 # set a specific UID
useradd -m -g developers username            # set primary group
useradd -m -G sudo,docker username            # set supplementary groups (comma-separated, no spaces)
useradd -e 2026-12-31 username                  # set account expiration date
```

| Flag | Meaning | ⚠️ Notes |
| :--- | :--- | :--- |
| `-m` | Create home directory | Debian/Ubuntu: **required** if you want a home dir. RHEL/CentOS: created by default even without `-m`. Always safest to include it explicitly. |
| `-s` | Login shell | Omitting this often defaults to `/bin/sh` or no shell — set it explicitly for interactive accounts. |
| `-g` | **Primary** group (singular) | Must already exist, or `useradd` fails. |
| `-G` | **Supplementary** groups (plural) | Comma-separated. This is the flag people reach for to add someone to `sudo`/`wheel`. |
| `-u` | Specific UID | Useful for keeping UIDs consistent across servers (e.g. for NFS). |
| `-e` | Expiration date (`YYYY-MM-DD`) | Account is disabled automatically after this date — good for contractor/temp accounts. |

After creating, always set a password:
```bash
passwd username        # prompts to set the password interactively
```

### Modifying Users — `usermod` (Deep Dive)

`usermod` changes an **existing** account's settings. This is the command you'll use most often after initial account creation.

```bash
usermod -aG groupname username        # ADD to a supplementary group (see warning below)
usermod -g groupname username          # CHANGE primary group
usermod -s /bin/zsh username             # change login shell
usermod -c "New Full Name" username       # change comment/full name
usermod -d /new/home -m username            # change home dir and MOVE existing contents
usermod -l newusername oldusername            # rename the login (username itself)
usermod -L username                             # lock the account (disable password login)
usermod -U username                              # unlock the account
usermod -e 2027-01-01 username                    # change expiration date
usermod -e "" username                              # remove expiration date
```

> ⚠️ **The single most common `usermod` mistake:**
> ```bash
> usermod -G sudo username     # ❌ WRONG — this REPLACES all supplementary groups with just "sudo"
> usermod -aG sudo username    # ✅ CORRECT — the -a (append) flag ADDS to existing groups
> ```
> Forgetting `-a` silently **removes** the user from every other supplementary group they were in (Docker, developers, etc.) — a classic "why did their access break" incident. Always pair `-G` with `-a` unless you deliberately want to overwrite the group list.

| Flag | Meaning | ⚠️ Notes |
| :--- | :--- | :--- |
| `-aG` | Append to supplementary groups | Always use `-a` together with `-G`. |
| `-g` | Set primary group | Group must exist first. |
| `-L` / `-U` | Lock / unlock account | Locks by putting `!` in front of the password hash in `/etc/shadow` — doesn't delete the password, just disables it. |
| `-l` | Rename username | Does **not** rename the home directory — use `-d` with `-m` separately if you want that too. |
| `-e` | Expiration date | Empty string clears it. |

### Deleting Users

```bash
userdel username           # delete user, LEAVE home directory intact
userdel -r username         # delete user AND remove home directory + mail spool
```
> ⚠️ `-r` is permanent — the home directory and its contents are gone, same as `rm -rf`. Back up first if there's any doubt.

### Password & Account Aging

```bash
passwd username                  # set/change password
passwd -l username                # lock password (same effect as usermod -L)
passwd -u username                 # unlock password
passwd -e username                  # force password change at next login
chage -l username                    # list current aging settings
chage -M 90 username                  # max password age: 90 days
chage -m 7 username                    # min days between password changes
chage -W 14 username                    # warn user 14 days before expiration
chage -E 2026-12-31 username             # set account expiration via chage instead of usermod
```

---

## PART 3: Group Commands

### Creating & Managing Groups

```bash
groupadd groupname                # create a new group
groupadd -g 2050 groupname         # create with a specific GID
groupmod -n newname oldname          # rename a group
groupmod -g 2100 groupname            # change a group's GID
groupdel groupname                     # delete a group
```
> ⚠️ You can't delete a group that's still set as any user's **primary** group — reassign those users first, or you'll get an error.

### Managing Group Membership

```bash
gpasswd -a username groupname     # add a user to a group (alternative to usermod -aG)
gpasswd -d username groupname      # remove a user from a group
gpasswd -M user1,user2 groupname    # set the entire member list at once (overwrites existing members)
```

| Task | Best Command | Why |
| :--- | :--- | :--- |
| Add one user to a group | `usermod -aG group user` or `gpasswd -a user group` | Either works; `usermod -aG` is more commonly taught/used. |
| Remove one user from a group | `gpasswd -d user group` | `usermod` has no clean single-user "remove from group" flag — `gpasswd -d` is the direct tool. |
| See who's in a group | `getent group groupname` | Shows the member list straight from the group database. |

---

## PART 4: File Permissions Tied to Users & Groups

This is where user/group setup actually pays off — permissions are enforced based on **owning user**, **owning group**, and **everyone else**.

### The Permission Triad

```
-rwxr-xr--  1 maradona developers  1234 Aug 22 file.sh
 │└┬┘└┬┘└┬┘    │         │
 │ │  │  │     │         └─ group owner
 │ │  │  │     └─ user owner
 │ │  │  └─ others (rwx → r--)
 │ │  └─ group (rwx → r-x)
 │ └─ owner (rwx → rwx)
 └─ file type (- = file, d = directory, l = symlink)
```

```bash
chmod u+x file.sh          # owner: add execute
chmod g-w file.sh           # group: remove write
chmod o=r file.sh            # others: set to read-only exactly
chmod 750 file.sh             # numeric: owner=rwx(7), group=rx(5), other=none(0)
chown maradona file.sh          # change owning user
chown maradona:developers file.sh # change owning user AND group in one command
chgrp developers file.sh          # change owning group only
chown -R maradona:developers dir/  # recursive — apply to a whole directory tree
```

### Special Permissions (Beyond rwx)

| Permission | Symbol | Numeric | What it does | Typical use |
| :--- | :--- | :--- | :--- | :--- |
| **SUID** | `s` in owner's execute slot | `4xxx` | Program runs with the **file owner's** privileges, not the caller's | `passwd` runs as root so any user can update their own shadow entry |
| **SGID** | `s` in group's execute slot | `2xxx` | On a file: runs with the group's privileges. On a **directory**: new files inherit the directory's group automatically | Shared team directories — everyone's files land in the same group |
| **Sticky bit** | `t` in others' execute slot | `1xxx` | In a shared directory, users can only delete/rename **their own** files, even with write access to the dir | `/tmp` uses this by default |

```bash
chmod u+s file            # set SUID
chmod g+s directory/        # set SGID on a directory
chmod +t directory/          # set sticky bit
chmod 2775 directory/          # SGID + rwxrwxr-x, numeric form
```

> ⚠️ SUID on a script (not a compiled binary) is ignored by the Linux kernel for security reasons — if you need "run as another user," use `sudo` rules instead of trying to SUID a shell script.

### Access Control Lists (ACLs) — Beyond Owner/Group/Other

When the basic owner/group/other model isn't granular enough (e.g. "give this *one specific extra user* access without changing group ownership"):

```bash
getfacl file.txt                       # view current ACLs
setfacl -m u:someuser:rwx file.txt       # grant a specific user rwx, without changing normal ownership
setfacl -m g:someteam:rx file.txt         # grant a specific group access
setfacl -x u:someuser file.txt              # remove that user's specific ACL entry
setfacl -b file.txt                          # remove ALL ACL entries, back to basic permissions
setfacl -R -m u:someuser:rwx directory/         # apply recursively
setfacl -d -m u:someuser:rwx directory/           # DEFAULT ACL — new files created inside inherit this automatically
```
> ⚠️ A file with ACLs set shows a `+` after its permission string in `ls -l` (e.g. `-rwxr-x---+`) — that `+` is your visual cue to run `getfacl` and check what's really going on, since `ls -l` alone won't show the extra entries.

---

## PART 5: `sudo` — Privileged Access Without Full Root

```bash
visudo                        # ALWAYS use this to edit sudoers — validates syntax before saving, prevents lockout
```

Typical sudoers entries:
```
username    ALL=(ALL:ALL) ALL          # full sudo access for one user
%wheel      ALL=(ALL)     ALL          # anyone in the "wheel" group gets full sudo (common on RHEL)
username    ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx   # passwordless, but ONLY for this one command
```

> ⚠️ **Never edit `/etc/sudoers` directly with a text editor.** A syntax error can lock out `sudo` entirely, and without another root session open, recovery means booting into single-user/rescue mode. `visudo` checks syntax before writing the file — there's no good reason to skip it.

| Command | Description | ⚠️ Notes |
| :--- | :--- | :--- |
| `sudo command` | Run one command as root | Prompts for **your own** password, not root's. |
| `sudo -l` | List what commands you're allowed to run | Good first check when troubleshooting permission denials. |
| `sudo -u otheruser command` | Run as a specific user (not just root) | Useful for service accounts. |
| `su - username` | Fully switch to another user's shell/environment | The `-` matters — it loads that user's full environment (PATH, home dir), a plain `su username` doesn't. |
| `su -` | Switch to root, full environment | Requires the **root** password, unlike `sudo`. |

---

## PART 6: Practical Walkthrough — Common Scenarios

### Scenario 1: Onboard a new developer with sudo + Docker access
```bash
useradd -m -s /bin/bash -c "New Developer" jdoe
passwd jdoe
usermod -aG sudo,docker jdoe      # -a is critical here — see Part 2 warning
id jdoe                            # verify group membership immediately
```

### Scenario 2: Shared team directory where everyone's files land in the same group automatically
```bash
groupadd devteam
mkdir /srv/shared
chown :devteam /srv/shared
chmod 2775 /srv/shared              # SGID so new files inherit "devteam" group
usermod -aG devteam alice
usermod -aG devteam bob
```

### Scenario 3: Give one extra user read access to a file without changing its group
```bash
setfacl -m u:contractor:r-- report.pdf
getfacl report.pdf                    # confirm
```

### Scenario 4: Temporarily disable a departing employee's account without deleting anything
```bash
usermod -L jdoe             # lock password login
usermod -e 2026-08-22 jdoe   # also set expiration to today, belt-and-suspenders
# later, once fully offboarded:
userdel -r jdoe
```

---

## Quick Reference Card

```
# Users
useradd -m -s /bin/bash -G group1,group2 username
usermod -aG groupname username     # ADD to group (never forget -a)
usermod -L / -U username             # lock / unlock
userdel -r username                    # delete + home dir

# Groups
groupadd groupname
gpasswd -a user group    # add member
gpasswd -d user group     # remove member
getent group groupname      # list members

# Permissions
chmod 750 file    |   chmod u+x,g-w file
chown user:group file
setfacl -m u:user:rwx file
getfacl file

# Privilege
visudo
sudo -l
su - username
```
