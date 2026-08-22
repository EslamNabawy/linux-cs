# 👤 Linux User & Group Management — Extended Topics

Companion to `linux-user-group-management.md`. Covers the deeper topics that sit beneath and around everyday user/group administration: how authentication actually gets enforced (PAM), how accounts scale across many machines (centralized auth), how new accounts get their starter files (`/etc/skel`), per-user/group disk limits (quotas), switching active groups mid-session (`newgrp`), and tracking login activity (auditing).

---

## PART 1: PAM — Pluggable Authentication Modules

PAM is the layer that actually decides "is this login allowed?" — `passwd`, `sudo`, `su`, `sshd`, and login managers don't implement authentication themselves; they all call into PAM and follow whatever policy is configured there.

### How it fits together
```
User runs `sudo` ──▶ sudo consults PAM config (/etc/pam.d/sudo) ──▶ PAM runs a stack of modules ──▶ allow / deny
```

| Concept | What it means |
| :--- | :--- |
| **Service** | The application asking for auth (`sudo`, `sshd`, `login`, `passwd`) — each has its own config file in `/etc/pam.d/` |
| **Module type** | `auth` (who are you), `account` (is the account valid — expired? locked?), `password` (how passwords are set/changed), `session` (setup/teardown when a session starts/ends) |
| **Control flag** | `required`, `requisite`, `sufficient`, `optional` — determines how a module's pass/fail affects the overall stack result |
| **Module path** | The actual `.so` file doing the work, e.g. `pam_unix.so`, `pam_faillock.so` |

### Common Files & Commands

| File / Command | Purpose | ⚠️ Notes / Gotchas |
| :--- | :--- | :--- |
| `/etc/pam.d/system-auth` (or `common-auth` on Debian) | Shared baseline policy most services include | This is usually the file you actually want to edit, rather than every individual service file. |
| `/etc/pam.d/sudo` | PAM policy specifically for `sudo` | Broken syntax here can lock out `sudo` — always keep a root shell open while testing changes. |
| `pam_faillock.so` | Locks accounts after N failed login attempts | Configured via `/etc/security/faillock.conf` on modern RHEL. |
| `pam_pwquality.so` | Enforces password complexity rules | Configured via `/etc/security/pwquality.conf` (min length, character classes, etc.). |
| `faillock --user username` | View failed login attempts for a user | Replaces the older `pam_tally2` on modern RHEL. |
| `faillock --user username --reset` | Clear failed attempt count / unlock | Use after legitimately unlocking someone who mistyped a password too many times. |

> ⚠️ PAM configs are read top-to-bottom, and order matters. A misplaced `sufficient` line can accidentally let a stack "pass" earlier than intended, and a syntax mistake in a core file can lock out **all** authentication on the system — test in a non-production environment first, and never edit these over a session you can't recover if it breaks.

---

## PART 2: Centralized Authentication (LDAP / AD / SSSD)

For more than a handful of machines, managing local `/etc/passwd` entries on every box doesn't scale — centralized auth lets many machines share one user directory.

### The Pieces

| Component | Role |
| :--- | :--- |
| **LDAP** (e.g. FreeIPA, OpenLDAP) | A directory server holding user/group records, queried over the network |
| **Active Directory (AD)** | Microsoft's directory service — common in mixed Windows/Linux environments |
| **SSSD** (System Security Services Daemon) | The client-side service on each Linux machine that talks to LDAP/AD/FreeIPA/Kerberos and caches results locally |
| **Kerberos** | Ticket-based authentication protocol, often paired with LDAP/AD for actual credential verification |

### Why This Matters for Commands You Already Know
Commands like `id`, `getent passwd`, and `getent group` don't just read local files — they query **whatever's configured in `/etc/nsswitch.conf`**, which can point to SSSD (and therefore LDAP/AD) instead of, or in addition to, local files.

```bash
cat /etc/nsswitch.conf | grep passwd     # shows lookup order, e.g. "files sss"
getent passwd someuser                    # works whether the user is local OR in LDAP/AD, transparently
id someuser                                # same — works across both
systemctl status sssd                       # check if the SSSD client is running
sssctl user-checks someuser                  # (FreeIPA/SSSD) diagnose why a lookup for a user is succeeding/failing
```

> ⚠️ If a user "exists in AD/LDAP" but `id username` fails locally, the problem is almost always SSSD (not running, misconfigured, or can't reach the directory server) — not the directory itself. Check `systemctl status sssd` and `journalctl -u sssd` before assuming the account itself is broken.

**Where this typically shows up on the RHCSA track:** FreeIPA/IdM integration and `realmd`/`sssd` join commands (`realm join domain.example.com`) are common Red Hat Academy / real-world topics, though not always core RHCSA exam objectives — worth knowing conceptually even if your exam version doesn't test it directly.

---

## PART 3: `/etc/skel` — Default Home Directory Contents

When you create a user with `useradd -m`, the new home directory isn't empty — it's a **copy of `/etc/skel`**.

```bash
ls -la /etc/skel/          # see what every new user currently gets by default
# typically: .bashrc  .bash_profile  .bash_logout
```

**Customizing what new users get:**
```bash
echo 'export EDITOR=vim' >> /etc/skel/.bashrc     # every NEW user created from now on inherits this
mkdir /etc/skel/Projects                            # every new user gets a starter "Projects" folder
```

> ⚠️ `/etc/skel` only affects **future** account creation — editing it does nothing for users who already exist. To retroactively apply a change to existing users, you'd need to copy the relevant file into each existing home directory yourself.

---

## PART 4: Disk Quotas — Limiting Usage Per User/Group

Prevents one user or group from filling an entire filesystem.

### Setup Overview
```bash
# 1. Filesystem must be mounted with quota support (in /etc/fstab):
#    /dev/sdb1  /home  xfs  defaults,uquota,gquota  0 0

mount -o remount /home              # apply after editing fstab
quotacheck -cug /home                # create initial quota files (u=user, g=group)
quotaon /home                         # turn quota enforcement on
```

### Setting & Viewing Limits

| Command | Description | ⚠️ Notes |
| :--- | :--- | :--- |
| `edquota -u username` | Edit a user's quota limits interactively (opens `$EDITOR`) | Sets both a **soft** limit (warning) and **hard** limit (hard stop). |
| `edquota -g groupname` | Edit a group's quota limits | Same soft/hard concept, applied to the group total. |
| `quota -u username` | View a user's current usage vs. limits | Run as the user themselves, or root to check anyone. |
| `repquota /home` | Summary report of everyone's usage on a filesystem | Good for an at-a-glance audit of a shared volume. |
| `edquota -t` | Set the **grace period** — how long a soft limit can be exceeded before it's enforced as hard | E.g. "7 days over soft limit before writes are blocked." |

> ⚠️ **Soft vs. hard limit, the distinction that actually matters:** soft limits can be exceeded temporarily (user gets a warning, has a grace period to clean up); hard limits cannot be exceeded at all — further writes simply fail once hit. Setting only a hard limit with no soft limit/grace period gives users no warning before things start failing.

**RHEL note:** on XFS (the RHEL default filesystem), quotas are managed slightly differently at mount time (`uquota`/`gquota`/`pquota` mount options) compared to the traditional `quotacheck`-based ext4 workflow — check which filesystem you're on before following older ext-focused tutorials verbatim.

---

## PART 5: `newgrp` — Switching Active Primary Group Mid-Session

If a user belongs to multiple groups but wants files they create *right now* to be owned by a different group than their default primary — without logging out and back in.

```bash
newgrp developers        # starts a new shell with "developers" as the active primary group
# ... create files here, they'll be group-owned by "developers" ...
exit                       # return to the previous shell/group context
```

| vs. | Behavior |
| :--- | :--- |
| `newgrp groupname` | Temporary, only affects the current shell session, reverts on `exit` |
| `usermod -g groupname user` | Permanent change to the account's actual primary group |

> ⚠️ `newgrp` only works for groups the user is **already a member of** (primary or supplementary) — it doesn't grant new access, it just changes which existing group is "active" for newly created files in that session.

---

## PART 6: Auditing — Tracking Logins & Failures

| Command | Description | ⚠️ Notes / Gotchas |
| :--- | :--- | :--- |
| `last` | Successful login history (who, when, from where) | Reads `/var/log/wtmp`. Add a username to filter: `last jdoe`. |
| `lastb` | **Failed** login attempts | Reads `/var/log/btmp` — requires root to read. Good first stop when investigating brute-force attempts. |
| `lastlog` | Most recent login per user (all accounts, one line each) | Shows "Never logged in" for unused/system accounts — useful for spotting dormant accounts. |
| `faillock --user username` | PAM-based failed attempt count (modern RHEL) | Pairs with `pam_faillock.so` from Part 1 — this is what actually triggers auto-lockouts. |
| `journalctl -u sshd` | Full systemd journal for the SSH service | More verbose than `last`/`lastb` — useful for seeing the *reason* a login failed, not just that it failed. |
| `who` / `w` | Who's logged in **right now** | `w` additionally shows what each session is currently doing. |

**A basic audit routine:**
```bash
lastlog | grep -v "Never logged in"    # who's actually used their account recently
lastb -n 20                              # last 20 failed login attempts
faillock --user jdoe                      # check if a specific account is close to auto-lockout
```

---

## Quick Reference Card

```
# PAM
faillock --user NAME              # check failed attempts
faillock --user NAME --reset       # clear/unlock

# Centralized auth
getent passwd NAME                 # works for local or LDAP/AD users
systemctl status sssd               # check the client daemon

# Skeleton files
ls -la /etc/skel/                    # what new users inherit

# Quotas
edquota -u NAME     |   edquota -g NAME
quota -u NAME         |   repquota /home

# Active group switch
newgrp GROUPNAME     # temporary, this session only

# Auditing
last NAME   |   lastb   |   lastlog   |   w
```
