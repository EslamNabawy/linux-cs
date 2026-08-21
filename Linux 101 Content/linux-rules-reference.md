# Linux System & Command Rules — Reference Guide

A reference for how the Linux system is *built* and how commands are *structured* — not a command dump, but the underlying rules that make the rest predictable.

---

## 1. Core Mental Model

- **Everything is a file.** Devices, processes, sockets, even kernel interfaces (`/proc`, `/sys`) are represented as files.
- **Single unified tree.** There's one root (`/`) — no drive letters. Everything, including other disks/partitions, gets *mounted* into this tree.
- **Case-sensitive.** `File.txt` ≠ `file.txt` ≠ `FILE.txt`.
- **Extensions are cosmetic.** `.sh`, `.txt`, `.py` are conventions for humans — the OS determines file type by content/permissions, not name.
- **Multi-user by design.** Every process runs *as* a user; every file is *owned* by a user and group.
- **Configuration is text.** Almost every system setting lives in a plain-text file (usually under `/etc`), not a binary registry.

---

## 2. Filesystem Hierarchy Rules (FHS)

| Path | Purpose |
|---|---|
| `/` | Root of everything |
| `/bin`, `/usr/bin` | Essential user command binaries |
| `/sbin`, `/usr/sbin` | System admin binaries (often need root) |
| `/etc` | System-wide configuration files |
| `/home` | Personal user directories |
| `/root` | Root user's home (separate from `/home`) |
| `/var` | Variable data: logs, caches, spool files |
| `/tmp` | Temporary files, usually cleared on reboot |
| `/opt` | Optional/third-party software |
| `/lib`, `/usr/lib` | Shared libraries |
| `/dev` | Device files (disks, terminals, etc.) |
| `/proc` | Virtual filesystem exposing kernel/process info live |
| `/sys` | Virtual filesystem exposing kernel/device info live |
| `/mnt`, `/media` | Mount points for filesystems/removable media |
| `/boot` | Kernel, bootloader files |

**Rule of thumb:** if it's a log → `/var/log`; if it's a config → `/etc`; if it's a live kernel stat → `/proc` or `/sys`.

---

## 3. Path Rules

- **Absolute path**: starts with `/` — always resolved from root (`/home/solo/project`).
- **Relative path**: resolved from your current directory (`../project`, `./script.sh`).
- `.` = current directory, `..` = parent directory, `~` = current user's home directory.
- Spaces and special characters (`$`, `*`, `&`, `!`) must be escaped (`\ `) or the whole path quoted (`"my file.txt"`).
- Hidden files/directories start with `.` (e.g. `.bashrc`) — invisible to plain `ls`, shown with `ls -a`.

---

## 4. Command Syntax Rules

General anatomy:

```
command [options] [arguments]
```

- **Short options**: single dash, single letter — `-a`, `-l`. Can often be combined: `-la` = `-l -a`.
- **Long options**: double dash, full word — `--all`, `--verbose`.
- **`--`** signals "end of options" — everything after is treated as a literal argument, even if it looks like a flag. Useful for filenames starting with `-`.
- **Case matters** in flags too: `-R` (recursive, e.g. `chmod`) is not the same as `-r`.
- Every standard command supports `--help`; every installed command has a manual: `man <command>`.
- Exit codes: `0` = success, non-zero = failure. Check with `echo $?` right after a command.

---

## 5. Permissions Rules

Every file/directory has three permission sets: **owner (u)**, **group (g)**, **others (o)** — each with **read (r)**, **write (w)**, **execute (x)**.

```
-rwxr-xr--  1 solo devs  4096 Aug 21 file.sh
 │└┬┘└┬┘└┬┘
 │ u  g  o
 └ file type (- file, d directory, l symlink)
```

**Numeric (octal) values:**

| Permission | Value |
|---|---|
| read | 4 |
| write | 2 |
| execute | 1 |

Sum them per group: `rwx` = 7, `rw-` = 6, `r-x` = 5, `r--` = 4.

```bash
chmod 755 script.sh     # rwxr-xr-x
chmod u+x script.sh     # symbolic: add execute for owner
chown solo:devs file    # change owner:group
chgrp devs file         # change group only
```

**Special bits:**
- **setuid** (`4000`) — run binary as the file's owner, not the caller.
- **setgid** (`2000`) — run as file's group; on a directory, new files inherit that group.
- **sticky bit** (`1000`) — in a shared directory (e.g. `/tmp`), only the file's owner can delete/rename it.

**Default permissions**: governed by `umask` — the value subtracted from the system default (666 for files, 777 for dirs).

---

## 6. Users & Groups Rules

- **root (UID 0)** — unrestricted; every other user is UID ≥ 1000 (varies by distro).
- Identity lives in `/etc/passwd` (users), `/etc/shadow` (password hashes), `/etc/group` (groups).
- **`sudo`** runs a *single command* as root (or another user), logged and password-gated.
- **`su`** switches your *entire shell session* to another user.
- Every user has one **primary group** and can belong to multiple **secondary groups** — this is what group-based permission checks use.

### 6.1 Checking who you currently are

Before switching anything, know where you stand:

```bash
whoami          # prints your current username
id              # prints your UID, GID, and every group you belong to
echo $UID        # 0 = root, anything else = regular user
```

Your shell prompt is also a live indicator: it typically ends in `$` for a regular user and `#` for root.

### 6.2 Step-by-Step: Becoming Root — Method 1 (`su`)

`su` ("switch user") drops you into a full new shell session as another user — you stay in that session until you explicitly exit it.

**Step 1 — Run the command:**
```bash
su -
```
The trailing `-` matters: it loads root's *own* environment (its `$PATH`, its home directory `/root`, its shell config) instead of keeping your current user's environment. Without the `-`, you become root but keep your old user's environment, which can cause confusing `$PATH`/permission mismatches.

**Step 2 — Enter root's password** (not your own password — `su` asks for the *target* account's password):
```
Password: ********
```

**Step 3 — Confirm you're root:**
```bash
whoami    # should now print: root
```

**Step 4 — Exit back to your normal user when done:**
```bash
exit
# or press Ctrl+D
```

**Downside:** `su` requires knowing root's actual password, which many modern distros (Ubuntu included) disable by default — root has no password set at all out of the box, so plain `su -` will fail until you explicitly set one with `sudo passwd root`.

### 6.3 Step-by-Step: Becoming Root — Method 2 (`sudo`)

`sudo` is the modern, more common approach — it uses *your own* password (not root's) and only works if your user is listed in `/etc/sudoers` or belongs to the `sudo`/`wheel` group.

**Step 1 — Confirm you have sudo rights:**
```bash
groups    # look for "sudo" (Debian/Ubuntu) or "wheel" (RHEL/Fedora) in the output
```

**Step 2a — Run a single command as root (most common day-to-day use):**
```bash
sudo apt update
```
You'll be prompted for **your own** password, not root's. `sudo` caches that authorization for a few minutes, so repeated `sudo` commands in a row won't keep re-prompting.

**Step 2b — Get a full root shell instead of one command at a time:**
```bash
sudo -i
# or equivalently:
sudo su -
```
`sudo -i` behaves like `su -` — full root environment, root's home directory — but authenticated with your own password instead of root's.

**Step 3 — Confirm:**
```bash
whoami    # root
```

**Step 4 — Exit back to your normal user:**
```bash
exit
```

### 6.4 Which Method Should You Actually Use?

| Situation | Use |
|---|---|
| One-off admin command (install a package, edit a config) | `sudo <command>` |
| Need several root commands in a row | `sudo -i` (or `sudo su -`) |
| Root has a set password and you specifically want classic `su` behavior | `su -` |
| Best practice on any modern personal/server system | **`sudo`** — it's logged (check `/var/log/auth.log`), tied to your own identity, and doesn't require a separate root password to exist at all |

**Golden rule:** don't stay logged in as root longer than you need to. Run what you need, then `exit` back to your normal user — staying in a root shell out of convenience is how a typo turns into a system-wide disaster (see the `chmod -R 777 /` and `rm -rf` scenarios in the failure-scenarios guide).

---

## 7. Process Rules

- Every process has a **PID** (process ID) and a **PPID** (parent process ID) — Linux processes form a tree, rooted at PID 1 (`systemd` on modern distros).
- **States**: running, sleeping, stopped, zombie (finished but not yet reaped by its parent).
- **Foreground vs background**: `&` at the end backgrounds a job; `jobs` lists them; `fg`/`bg` bring them forward/resume them; `Ctrl+Z` suspends the current one.
- **Signals** are how processes are told to do something — not killed by force by default:

| Signal | Meaning |
|---|---|
| `SIGHUP` (1) | Hangup / reload config |
| `SIGINT` (2) | Interrupt (Ctrl+C) |
| `SIGTERM` (15) | Polite "please exit" (default for `kill`) |
| `SIGKILL` (9) | Force-kill, cannot be caught or ignored |

```bash
kill -15 1234      # ask nicely
kill -9 1234        # force it, last resort
pkill -f "process_name"
```

---

## 8. I/O Redirection & Pipe Rules

Every process starts with three open streams:

| FD | Stream | Symbol |
|---|---|---|
| 0 | stdin | `<` |
| 1 | stdout | `>`, `>>` |
| 2 | stderr | `2>` |

```bash
command > out.txt        # overwrite stdout to file
command >> out.txt       # append stdout to file
command 2> err.txt       # redirect only errors
command &> all.txt       # redirect stdout AND stderr
command < input.txt      # feed a file in as stdin
```

**Pipes (`|`)** chain commands — stdout of the left becomes stdin of the right:

```bash
ps aux | grep python | awk '{print $2}'
```

`xargs` bridges commands that expect *arguments*, not stdin:

```bash
find . -name "*.log" | xargs rm
```

---

## 9. Wildcards & Globbing Rules

| Pattern | Matches |
|---|---|
| `*` | Any number of characters (not hidden files unless combined with `.`) |
| `?` | Exactly one character |
| `[abc]` | Any one of a, b, or c |
| `[0-9]` | Any digit |
| `{a,b,c}` | Brace expansion — literal set: `file{1,2,3}.txt` → `file1.txt file2.txt file3.txt` |

Globbing is expanded **by the shell**, before the command ever sees it — not by the command itself.

---

## 10. Environment & Shell Rules

- **Environment variables** are key=value pairs available to a process and its children: `export VAR=value`.
- **`$PATH`** is an ordered, colon-separated list of directories the shell searches for executables — first match wins. `which <cmd>` shows which one gets used.
- **Shell startup file load order** (bash, login shell): `/etc/profile` → `~/.bash_profile` (or `~/.profile`) → for interactive non-login shells: `~/.bashrc`.
- **Aliases** are shell-only shortcuts (`alias ll='ls -la'`) — they don't exist for scripts run by other programs.
- Quoting matters: `"$VAR"` expands the variable; `'$VAR'` treats it as a literal string.

---

## 11. Package Management Rules

| Family | Distros | Low-level | High-level |
|---|---|---|---|
| Debian | Ubuntu, Debian | `dpkg` | `apt`, `apt-get` |
| Red Hat | RHEL, Fedora, CentOS | `rpm` | `dnf`, `yum` |

- High-level tools (`apt`, `dnf`) resolve **dependencies** automatically; low-level tools (`dpkg`, `rpm`) install a single package file and expect dependencies to already be present.
- Always `apt update` (refresh package index) before `apt install` (actually install) — these are two different, sequential steps.

---

## 12. Service Management Rules (systemd)

- Modern distros use **systemd** (PID 1) to manage services via **unit files**, typically in `/etc/systemd/system/` or `/lib/systemd/system/`.

```bash
systemctl start nginx      # start now
systemctl stop nginx       # stop now
systemctl enable nginx     # start automatically on boot
systemctl status nginx     # current state
journalctl -u nginx -f     # live-tail that service's logs
```

- `enable` and `start` are independent — enabling doesn't start it now, starting doesn't survive a reboot. Do both if you want "on now, and on every boot."

---

## 13. Networking Rules

- Ports below **1024** are "privileged" — binding to them requires root (or a capability grant).
- `ss -tulnp` — show listening ports and the process using them (modern replacement for `netstat`).
- `ssh user@host` — remote shell; key-based auth (`~/.ssh/id_ed25519`) is the standard over passwords.
- `curl` / `wget` — fetch over HTTP(S); `curl` is better for APIs (headers, methods), `wget` for straight downloads.

### 13.1 Viewing & Configuring Network Interfaces — Two Ways

There are two tool families for this: the legacy `net-tools` package (`ifconfig`, `route`) and the modern `iproute2` package (`ip`). Modern distros ship `ip` by default; `ifconfig` often needs manual install now. Both are shown here since you'll run into either depending on the machine.

**Check which you have installed:**
```bash
which ifconfig    # empty output = not installed
which ip           # this one is almost always present
sudo apt install net-tools -y     # installs ifconfig if it's missing
```

#### Method 1 — `ifconfig` (legacy, still common on older systems)

**Step 1 — View all active interfaces:**
```bash
ifconfig
```

**Step 2 — View all interfaces, including inactive ones:**
```bash
ifconfig -a
```

**Step 3 — View just one interface:**
```bash
ifconfig eth0
```

**Step 4 — Bring an interface up or down:**
```bash
sudo ifconfig eth0 up
sudo ifconfig eth0 down
```

**Step 5 — Manually assign an IP address:**
```bash
sudo ifconfig eth0 192.168.1.50 netmask 255.255.255.0
```

**Step 6 — Check the routing table (companion command):**
```bash
route -n
```

#### Method 2 — `ip` (modern, the current standard)

**Step 1 — View all interfaces and addresses:**
```bash
ip a
# or the more explicit form:
ip addr show
```

**Step 2 — View just one interface:**
```bash
ip addr show eth0
```

**Step 3 — Bring an interface up or down:**
```bash
sudo ip link set eth0 up
sudo ip link set eth0 down
```

**Step 4 — Manually assign an IP address (note: CIDR notation, not a separate netmask):**
```bash
sudo ip addr add 192.168.1.50/24 dev eth0
```

**Step 5 — Remove an assigned IP:**
```bash
sudo ip addr del 192.168.1.50/24 dev eth0
```

**Step 6 — Check the routing table:**
```bash
ip route
```

**Important distinction for both methods:** changes made this way are **temporary** — they're wiped on reboot or interface restart. For a permanent change, edit your distro's network config instead (Netplan's YAML files on modern Ubuntu, `/etc/network/interfaces` on older Debian-based systems, or `nmcli`/`nmtui` if NetworkManager is running the show).

### 13.2 Command Equivalence Table

| Task | `ifconfig` (legacy) | `ip` (modern) |
|---|---|---|
| Show all interfaces | `ifconfig` | `ip a` |
| Show one interface | `ifconfig eth0` | `ip addr show eth0` |
| Bring interface up | `ifconfig eth0 up` | `ip link set eth0 up` |
| Bring interface down | `ifconfig eth0 down` | `ip link set eth0 down` |
| Assign an IP | `ifconfig eth0 <ip> netmask <mask>` | `ip addr add <ip>/<cidr> dev eth0` |
| View routing table | `route -n` | `ip route` |

**Which to actually learn:** default to `ip` — it's the maintained tool and what you'll find on nearly every current server. Recognize `ifconfig` syntax for when you land on an older box that still has it, but don't build new habits around it.

---

## 14. Golden Rules & Common Gotchas

- **`rm -rf` has no undo.** Double-check `pwd` and the target path before running anything destructive with `-rf`, especially as root.
- **Never run untrusted scripts with `sudo`** without reading them first.
- **Quote your variables** in scripts (`"$var"`) — unquoted variables break on spaces/globs.
- **Symlinks vs hardlinks**: a symlink (`ln -s`) is a pointer to a path and breaks if the target moves; a hardlink (`ln`) points to the same inode and survives the original being deleted.
- **A command that "isn't found"** is almost always a `$PATH` issue, not a missing install — check with `which` or `type`.
- **Trailing slashes matter** for some commands (notably `rsync`) — `dir/` vs `dir` changes whether the directory itself or its contents are the target.
