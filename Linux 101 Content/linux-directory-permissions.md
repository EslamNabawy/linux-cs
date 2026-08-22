# 📁 Linux Directory Permissions — Complete Guide

Directories are files too, but `rwx` means something different on them than on regular files — this is the #1 source of "why can't I `cd` into this even though I have read access" confusion. This guide is directory-specific; pair it with `linux-user-group-management.md` for the general permission model.

---

## PART 1: What `rwx` Actually Means on a Directory

This is the single most important table in this guide — the meaning shifts entirely from what it means on a file.

| Permission | On a **file** | On a **directory** |
| :--- | :--- | :--- |
| **r** (read) | View the file's contents | **List** the directory's contents (`ls` works) |
| **w** (write) | Modify the file's contents | **Create, delete, or rename** entries inside the directory (even files you don't own!) |
| **x** (execute) | Run the file as a program/script | **Enter/traverse** the directory (`cd` works, and you can access files *inside* by exact path) |

### The classic gotcha
```bash
chmod 644 mydir/     # r + w, no x
cd mydir/            # ❌ "Permission denied" — even though you can technically "read" it
ls mydir/             # ❌ Also fails — ls needs to traverse to stat each entry
```

> ⚠️ **Read without execute on a directory is nearly useless.** You need **execute** to enter/traverse a directory at all — without it, `cd`, `ls`, and any attempt to access a file inside by path (`cat mydir/file.txt`) fails, *regardless* of read permission. Read alone only lets tools list filenames in very limited cases and is not something to rely on.

### The other classic gotcha — write on a directory is powerful
```bash
chmod 777 shared/     # anyone can write here
```
Anyone with **write** on the directory can delete or rename files inside it — **even files they don't own** — unless the sticky bit is set (see Part 3). This surprises people who think file permissions alone protect their files; the *directory's* write permission matters just as much.

---

## PART 2: Directory Permission Recipes

| Numeric | Symbolic | Meaning | Typical use |
| :--- | :--- | :--- | :--- |
| `755` | `rwxr-xr-x` | Owner full control, everyone else can enter/list but not modify | Most personal/project directories |
| `750` | `rwxr-x---` | Owner full control, group can enter/list, others nothing | Directories restricted to a team |
| `700` | `rwx------` | Owner-only, no one else can even enter | Private directories (e.g. `~/.ssh`) |
| `775` | `rwxrwxr-x` | Owner + group full read/write/enter, others read-only entry | Collaborative directories (often paired with SGID, see Part 3) |
| `770` | `rwxrwx---` | Owner + group full access, others completely locked out | Team-only working directories |
| `1777` | `rwxrwxrwt` | Everyone can create files, but only delete their **own** (sticky bit) | `/tmp`-style shared drop directories |
| `2775` | `rwxrwsr-x` | Group full access + new files auto-inherit the directory's group (SGID) | Shared project directories with consistent group ownership |

```bash
chmod 755 mydir/
chmod -R 750 project/          # recursive — apply to every file AND subdirectory inside
find project/ -type d -exec chmod 750 {} \;    # apply ONLY to directories, leave file permissions alone
find project/ -type f -exec chmod 640 {} \;    # apply ONLY to files, separately
```

> ⚠️ **`chmod -R` applies the exact same numeric mode to files and directories alike** — which usually isn't what you want, since files rarely need the execute bit but directories almost always do (to be enterred). The two-step `find -type d` / `find -type f` pattern above is the safer approach for mixed trees.

---

## PART 3: Special Bits on Directories

These behave differently on directories than the general special-permissions summary you'd see for files.

### SGID on a Directory — Group Inheritance
Normally, a new file's group ownership comes from the **creating user's** primary group. SGID on a directory overrides that: new files/subdirectories inside automatically inherit **the directory's group**, not the creator's.

```bash
mkdir /srv/teamshare
chgrp devteam /srv/teamshare
chmod g+s /srv/teamshare          # or: chmod 2775 /srv/teamshare
```
Now, no matter who creates a file inside `/srv/teamshare`, it's automatically owned by group `devteam` — solving the classic "shared folder where everyone's uploads end up with the wrong group" problem.

> ⚠️ SGID is **inherited recursively by subdirectories that get created afterward** — a new subfolder made inside an SGID directory is itself SGID automatically, continuing the inheritance chain. But this only applies going forward; it doesn't retroactively fix subdirectories that already existed before you set SGID on the parent.

### Sticky Bit on a Directory — Restricted Deletion
Normally, anyone with **write** access to a directory can delete or rename *any* file inside it (Part 1). The sticky bit changes this: users can only delete/rename files **they personally own**, even in a directory that's otherwise world-writable.

```bash
chmod +t /srv/dropbox          # or: chmod 1777 /srv/dropbox
ls -ld /srv/dropbox
# drwxrwxrwt ... /srv/dropbox
```
This is exactly how `/tmp` works system-wide: everyone can create files there, but you can't delete someone else's temp file just because the directory is world-writable.

### Combining Both
```bash
chmod 3775 /srv/teamshare     # SGID (2000) + sticky bit (1000) = 3000, plus rwxrwxr-x
```
Group-consistent ownership **and** "you can only delete your own stuff" in the same shared directory.

---

## PART 4: `umask` — Default Permissions for New Directories & Files

`umask` doesn't set permissions directly — it **subtracts** from the maximum defaults whenever something new is created.

| Item type | Maximum default before umask | Typical umask | Resulting permission |
| :--- | :--- | :--- | :--- |
| New directory | `777` (rwxrwxrwx) | `022` | `755` (rwxr-xr-x) |
| New file | `666` (rw-rw-rw-, **no execute by default**) | `022` | `644` (rw-r--r--) |

```bash
umask                  # view current umask
umask 027                # set: group loses write, others get nothing
umask -S                  # view umask in symbolic form instead of octal
```

> ⚠️ Note the asymmetry: directories start from a max of `777` but files start from `666` — new files never get execute permission automatically from `umask` alone, even with `umask 000`. That's deliberate; you have to `chmod +x` a new file explicitly (or it needs to already be a compiled/scripted executable you intend to run).

`umask` is usually set per-session in `~/.bashrc` / `/etc/profile` (per-user) or `/etc/login.defs` (system default for new accounts).

---

## PART 5: Auditing & Troubleshooting Directory Permissions

```bash
ls -ld directory/                     # view a directory's OWN permissions (note the -d — without it, ls lists its CONTENTS instead)
namei -l /path/to/deep/directory       # show permissions of EVERY component in a path — great for tracing a "permission denied" up the chain
find / -type d -perm -002 2>/dev/null    # find world-writable directories (a common security audit check)
find /home -type d -perm 777 2>/dev/null  # find suspiciously wide-open directories
stat directory/                             # detailed metadata including octal permission mode
```

> ⚠️ **A "permission denied" error doesn't always mean the target directory itself is misconfigured** — it can be *any parent directory in the path* missing execute permission. `namei -l` is the fastest way to check every level at once instead of manually `ls -ld`-ing each parent directory one by one.

### Common real-world directory permissions (for reference)

| Directory | Typical permissions | Why |
| :--- | :--- | :--- |
| `/tmp` | `1777` | World-writable, sticky bit prevents cross-user deletion |
| `/root` | `700` | Only root can even enter |
| `/home/username` | `700` or `750` | Private by default on most modern distros |
| `~/.ssh` | `700` (dir), keys inside `600` | SSH refuses to work at all if these are too open |
| `/var/log` | `755` (dir), individual logs often `640` | World-readable directory listing, but log contents often restricted |
| `/etc` | `755` | World-readable/traversable (most configs aren't secret), but only root can write |

---

## Quick Reference Card

```
# What rwx means on a directory
r = list contents   w = create/delete/rename entries   x = enter/traverse

# Recipes
755   rwxr-xr-x    normal shared-read directory
750   rwxr-x---    team-restricted
700   rwx------    private
2775  rwxrwsr-x    SGID — group inheritance
1777  rwxrwxrwt    sticky — /tmp style
3775  rwxrwsr-t    SGID + sticky combined

# Special bits
chmod g+s dir/     # SGID: new files inherit dir's group
chmod +t dir/       # sticky: users can only delete their own files

# umask
umask               # view
umask 022             # set (dirs→755, files→644)

# Troubleshooting
ls -ld dir/          # the directory's OWN permissions (not its contents)
namei -l /a/b/c        # check every parent in a path at once
find / -perm -002 -type d 2>/dev/null   # audit world-writable dirs
```
