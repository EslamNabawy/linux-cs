# Log Management — syslog vs journald, logrotate & Where Logs Actually Live

Two logging systems coexist on most modern Linux distros, often confusingly overlapping. This is what each one actually does, how they hand off to each other, how rotation keeps them from filling your disk, and where to actually look for any given service's output.

---

## 1. The Core Confusion: syslog vs journald

| | **syslog** (rsyslog/syslog-ng) | **journald** (systemd) |
|---|---|---|
| What it is | The traditional Unix logging daemon/protocol | systemd's own logging component |
| Storage format | Plain text files | Binary, indexed format |
| Location | `/var/log/*.log` (readable with `cat`, `tail`, `grep`) | `/var/log/journal/` (only readable through `journalctl`) |
| Structure | Just text lines, minimal built-in structure | Rich metadata per entry: PID, UID, unit name, boot ID, etc. |
| Persistence | Always persistent (it's just files) | Persistent OR volatile depending on config (see below) |
| Query power | `grep`/`awk` on plain text | Native filtering — by service, time range, priority, boot |

**Why both exist on the same system:** journald is what actually captures logs *first* on any systemd-based distro (which is nearly everything now — Ubuntu, Debian, Fedora, RHEL, Arch). rsyslog then either reads from journald and writes out the traditional `/var/log/*.log` files, or runs independently for anything not going through systemd. On most modern distros, journald is the source of truth and the classic `/var/log` files are a compatibility layer built on top of it.

**Practical implication:** for any service managed by systemd, `journalctl -u <service>` is more complete and more precise than grepping `/var/log/syslog` — you get structured filtering (by exact service, exact boot, exact priority) that plain text grepping can only approximate.

---

## 2. journald — Configuration & Persistence

### Is journald even keeping logs across reboots?
```bash
journalctl --disk-usage         # shows how much space the journal is currently using
ls /var/log/journal/               # if this directory exists and has content, logs are persistent
```
By default on many distros, journald logs are **volatile** — kept only in `/run/log/journal` (memory-backed, wiped on reboot) unless persistent storage is explicitly enabled.

### Enabling persistent journal storage
```bash
sudo mkdir -p /var/log/journal
sudo systemd-tmpfiles --create --prefix /var/log/journal
sudo systemctl restart systemd-journald
```
After this, `journalctl -b -1` (previous boot's logs) actually works — without it, a reboot wipes your only crash evidence.

### Key config: `/etc/systemd/journald.conf`
```ini
[Journal]
Storage=persistent          # persistent | volatile | auto
SystemMaxUse=500M            # cap total disk space the journal can consume
SystemMaxFileSize=50M         # size of each individual journal file before rotating
MaxRetentionSec=30day          # delete entries older than this, regardless of size
```
Apply changes with:
```bash
sudo systemctl restart systemd-journald
```

**This matters more than it looks:** without `SystemMaxUse`, an unexpectedly chatty service (a crash-looping process logging constantly) can fill `/var/log/journal` and, by extension, your root filesystem — see the disk-full failure scenarios from your earlier guide. Always cap it explicitly.

### Manually cleaning the journal
```bash
sudo journalctl --vacuum-size=200M     # shrink the journal down to 200MB
sudo journalctl --vacuum-time=7d         # delete anything older than 7 days
```

---

## 3. Where Every Service Actually Writes Its Logs

This is the part most guides skip — a real map of what's where.

### systemd-managed services (the majority on a modern distro)
```bash
journalctl -u <service_name>
```
This is the authoritative source. No separate log file exists unless the service *also* writes its own (many do, for app-specific reasons — see below).

### Classic system-wide log files (`/var/log/`)
| File | Contents |
|---|---|
| `/var/log/syslog` (Debian/Ubuntu) or `/var/log/messages` (RHEL/Fedora) | General system messages, the traditional catch-all |
| `/var/log/auth.log` (Debian/Ubuntu) or `/var/log/secure` (RHEL/Fedora) | Authentication events — logins, `sudo` usage, SSH attempts |
| `/var/log/kern.log` | Kernel messages (also viewable live via `dmesg` or `journalctl -k`) |
| `/var/log/dpkg.log` | Package install/remove/upgrade history (Debian/Ubuntu) |
| `/var/log/boot.log` | Messages from the boot process |
| `/var/log/faillog` / `/var/log/lastlog` | Failed login attempts / last login per user |

### Application-specific logs (each has its own convention — worth knowing the common ones)
| Service | Log location |
|---|---|
| nginx | `/var/log/nginx/access.log`, `/var/log/nginx/error.log` |
| Apache | `/var/log/apache2/access.log`, `/var/log/apache2/error.log` (Debian) or `/var/log/httpd/` (RHEL) |
| MySQL/MariaDB | `/var/log/mysql/error.log` |
| PostgreSQL | `/var/log/postgresql/postgresql-<version>-main.log` |
| Docker containers | `docker logs <container>` (reads the container's own log driver output, usually JSON files under `/var/lib/docker/containers/<id>/`) |
| cron jobs | `/var/log/cron.log`, or wherever the job's own script redirects output (cron itself only logs *that* it ran, not the job's stdout, unless you explicitly redirect it) |
| Fail2ban | `/var/log/fail2ban.log` |
| UFW | `/var/log/ufw.log` |

### Finding a log location you don't already know
```bash
sudo find /var/log -name "*<servicename>*"       # search by name pattern
sudo lsof | grep -i "\.log$" | grep <process_name>  # find open log files for a running process, by name
cat /etc/<servicename>/*.conf | grep -i log            # check the service's own config for a configured log path
```

**A genuinely useful habit:** when in doubt for a systemd-managed service, start with `journalctl -u <service>` regardless of whether it *also* has its own log file — it captures stdout/stderr from the very moment the process starts, before the application has even opened its own log file, which makes it the best source for startup failures specifically.

---

## 4. `logrotate` — Keeping Log Files From Growing Forever

`logrotate` handles the traditional `/var/log/*.log` files — journald manages its own size internally (via `SystemMaxUse`, above) and does **not** use logrotate.

### How it works, conceptually
On a schedule (typically daily, via a cron job or systemd timer), `logrotate` checks each configured log file against rules: if it's grown too large or too old, it gets renamed (`access.log` → `access.log.1`), optionally compressed, and a fresh empty log file is started — with old rotations eventually deleted once a configured count is exceeded.

### Where the config lives
```bash
/etc/logrotate.conf              # global defaults
/etc/logrotate.d/                # per-service config files — this is where most real rules live
```
```bash
ls /etc/logrotate.d/     # nginx, apache2, mysql-server, etc — most packages install their own rule here automatically
```

### Anatomy of a logrotate config
```
/var/log/nginx/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data adm
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

| Directive | Meaning |
|---|---|
| `daily` / `weekly` / `monthly` | how often to rotate (can also be size-based, see below) |
| `size 100M` | rotate once the file exceeds this size, instead of/in addition to time-based |
| `rotate 14` | keep 14 old rotations before deleting the oldest |
| `compress` | gzip old rotations to save space |
| `delaycompress` | delay compressing the most recent rotation by one cycle — some apps still have it open briefly after rotation, this avoids a race |
| `missingok` | don't error if the log file doesn't exist |
| `notifempty` | don't rotate an empty file — no point |
| `create 0640 www-data adm` | after rotating, create a fresh file with these permissions/owner, so the service doesn't need to be restarted to start writing again |
| `postrotate` / `endscript` | shell commands to run after rotation — commonly used to signal the service to reopen its log file handle |

**Why `postrotate` matters more than it looks:** many services keep a log file open by file *descriptor*, not by *name*. If you rotate the file (rename it) without telling the service, it keeps writing into the now-renamed old file — the new `access.log` stays empty forever, and you silently lose all future logging until the service is restarted. The `postrotate` hook (commonly `systemctl reload` or a `kill -HUP`) tells the service to close and reopen its log handle by name, picking up the fresh file.

### Testing a logrotate config without waiting for the schedule
```bash
sudo logrotate -d /etc/logrotate.d/nginx     # dry run — shows what WOULD happen, changes nothing
sudo logrotate -f /etc/logrotate.d/nginx      # force it to actually rotate right now
```

### Writing your own rule for a custom app
```
/var/log/myapp/*.log {
    weekly
    rotate 8
    compress
    missingok
    notifempty
    create 0644 myappuser myappuser
}
```
Save this as `/etc/logrotate.d/myapp` — no restart of `logrotate` itself needed, it's read fresh on every scheduled run.

---

## 5. Practical Cheat Sheet

```
VIEW A SERVICE'S LOGS     journalctl -u <service> -f
VIEW SYSTEM-WIDE LOGS      tail -f /var/log/syslog        (or /var/log/messages on RHEL-family)
CHECK JOURNAL DISK USAGE   journalctl --disk-usage
SHRINK THE JOURNAL          journalctl --vacuum-size=200M
FIND A LOG FILE              sudo find /var/log -name "*<name>*"
LIST LOGROTATE RULES         ls /etc/logrotate.d/
TEST A LOGROTATE RULE         sudo logrotate -d /etc/logrotate.d/<name>
FORCE ROTATION NOW            sudo logrotate -f /etc/logrotate.d/<name>
```

**One-line mental model to keep:** journald captures everything systemd starts, in a queryable binary format that self-manages its size; logrotate manages everything that writes plain text files to `/var/log`, on a schedule you configure per-service. Most real systems run both side by side, and knowing which one owns a given log is the fastest way to stop searching in the wrong place.