# systemd Deep Dive — Unit Files & Timers (The Modern Cron Replacement)

Writing your own systemd units properly, and why timers beat cron for anything you actually want to monitor and trust.

---

## 1. Unit Basics

### Unit types you'll actually use
| Extension | Purpose |
|---|---|
| `.service` | a long-running or one-shot process |
| `.timer` | schedules another unit to run — the cron replacement |
| `.socket` | socket-activated services (start on first connection, not boot) |
| `.mount` / `.automount` | filesystem mounts as managed units |
| `.target` | a named grouping/synchronization point (like `multi-user.target`) |
| `.path` | trigger a unit when a file/directory changes |

### Where unit files live — and why location matters
| Location | Priority | Use for |
|---|---|---|
| `/etc/systemd/system/` | Highest — overrides everything below | **Your own custom units go here** |
| `/run/systemd/system/` | Runtime-only, not persisted across reboot | Rarely used manually |
| `/lib/systemd/system/` (or `/usr/lib/systemd/system/`) | Lowest — package-installed defaults | Managed by `apt`/`dnf` — never hand-edit these directly |

**Rule:** always create your own units in `/etc/systemd/system/`. If you need to *modify* a package-provided unit instead of writing a new one, use an override (see section 6) rather than editing the package's file directly — your edit would be silently overwritten on the next package update.

---

## 2. Anatomy of a Service Unit File

```ini
# /etc/systemd/system/myapp.service

[Unit]
Description=My Application
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=myappuser
Group=myappuser
WorkingDirectory=/opt/myapp
ExecStart=/usr/bin/python3 /opt/myapp/main.py
Restart=on-failure
RestartSec=5
Environment=APP_ENV=production
EnvironmentFile=/opt/myapp/.env
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

### `[Unit]` section
| Directive | Meaning |
|---|---|
| `Description` | human-readable label, shown in `systemctl status` |
| `After=` | pure **ordering** — start this unit after the listed ones, but doesn't force them to be pulled in as dependencies by itself |
| `Before=` | the reverse of `After=` |
| `Requires=` | a **hard dependency** — if the required unit fails, this one is stopped too |
| `Wants=` | a **soft dependency** — pulls in the listed unit if possible, but doesn't fail this one if it doesn't start |
| `Conflicts=` | this unit cannot run at the same time as the listed one |

**The single most common mistake:** using only `After=network.target` for something that needs actual internet access. `network.target` just means "networking subsystem initialized," not "network is actually up and has connectivity" — for anything that makes outbound connections at startup, use `After=network-online.target` **and** `Wants=network-online.target` together, as shown above.

### `[Service]` section
| Directive | Meaning |
|---|---|
| `Type=` | how systemd should treat this process (see section 3) |
| `ExecStart=` | the command that actually runs — must be an absolute path |
| `ExecStop=` | optional custom stop command (systemd sends SIGTERM by default if omitted) |
| `ExecReload=` | optional command for `systemctl reload` (e.g. send SIGHUP instead of a full restart) |
| `Restart=` | when to auto-restart (see section 4) |
| `RestartSec=` | delay before a restart attempt |
| `User=` / `Group=` | run as this user instead of root — always set this unless you specifically need root |
| `WorkingDirectory=` | the directory the process starts in — matters for relative file paths in your app |
| `Environment=` | inline environment variables (repeat the line for multiple) |
| `EnvironmentFile=` | load environment variables from a file (your `.env` pattern from the important-files guide) |

### `[Install]` section
| Directive | Meaning |
|---|---|
| `WantedBy=multi-user.target` | which target pulls this in when enabled — `multi-user.target` is the standard choice for a normal background service |

**Note:** `[Install]` only matters for `systemctl enable` — it has zero effect on `systemctl start`. A unit with no `[Install]` section can still be started manually, it just can't be enabled to start automatically at boot.

---

## 3. Service Types — Picking the Right One

| Type | Use when |
|---|---|
| `simple` (default) | the process started by `ExecStart` stays in the foreground and IS the service — the overwhelming majority of custom scripts/apps |
| `forking` | a traditional daemon that forks into the background and the parent exits — systemd needs `PIDFile=` to track the actual running process |
| `oneshot` | a task that runs once and exits, not a long-running process — pair with `RemainAfterExit=yes` if later units should treat it as "active" even after it exits |
| `notify` | the app itself tells systemd when it's actually ready via `sd_notify()` — more precise startup ordering, requires app-level support |
| `idle` | delays execution until other jobs have finished — mostly cosmetic, avoids interleaving output on boot |

**For your own scripts (Python, Node, Dart/Flutter backend processes, etc.), `simple` is almost always correct** unless the process explicitly daemonizes itself.

---

## 4. Restart Policies & Preventing Restart Loops

```ini
Restart=on-failure
RestartSec=5
StartLimitIntervalSec=60
StartLimitBurst=3
```

| `Restart=` value | Restarts when... |
|---|---|
| `no` (default) | never auto-restarts |
| `on-success` | only if it exited cleanly (0) — unusual, rarely what you want |
| `on-failure` | exited with a non-zero code, or was killed by a signal — **the common choice** |
| `on-abnormal` | crashed, was killed, or timed out — but not a clean non-zero exit |
| `always` | restarts no matter how it exited, including clean shutdowns — use carefully |

**`StartLimitIntervalSec`/`StartLimitBurst` matters more than it looks:** without a limit, a genuinely broken service (crashes instantly every time) will restart in an infinite tight loop, burning CPU and flooding your logs. The example above says "if it fails 3 times within 60 seconds, stop trying and give up" — check `systemctl status` afterward, it'll show `Failed to start` and stop attempting further restarts until you manually intervene.

---

## 5. Managing Your Unit

```bash
sudo systemctl daemon-reload         # REQUIRED after creating or editing any unit file — systemd caches unit definitions
sudo systemctl start myapp
sudo systemctl stop myapp
sudo systemctl restart myapp
sudo systemctl reload myapp            # only works if ExecReload= is defined
sudo systemctl enable myapp              # start automatically on boot
sudo systemctl enable --now myapp          # enable AND start in one command
sudo systemctl status myapp
sudo systemctl disable myapp
```

**The mistake that costs the most debugging time:** editing a unit file and then just running `systemctl restart` — without `daemon-reload` first, systemd is still running on the *old* cached definition, and your changes silently don't apply.

---

## 6. Overriding a Package-Provided Unit (Without Editing It Directly)

```bash
sudo systemctl edit nginx
```
This opens an editor for a small override snippet (stored separately, under `/etc/systemd/system/nginx.service.d/override.conf`) — your changes layer on top of the original unit instead of replacing it, and survive package updates cleanly.

```ini
# only need to specify the directives you're actually changing
[Service]
Restart=always
RestartSec=10
```

---

## 7. systemd Timers — The Modern Cron Replacement

A timer is a separate unit that triggers another unit (almost always a same-named `.service`) on a schedule — cron's job, but integrated into systemd with real dependency awareness, native logging, and missed-run recovery.

### The pairing convention
```
myjob.service     ← what to actually run (Type=oneshot, no [Install] needed)
myjob.timer        ← when to run it
```

**The service half:**
```ini
# /etc/systemd/system/myjob.service
[Unit]
Description=My scheduled job

[Service]
Type=oneshot
ExecStart=/opt/scripts/myjob.sh
```

**The timer half:**
```ini
# /etc/systemd/system/myjob.timer
[Unit]
Description=Run myjob every 15 minutes

[Timer]
OnCalendar=*:0/15
Persistent=true

[Install]
WantedBy=timers.target
```

**Enable the TIMER, not the service** — the timer is what needs to be enabled/started; it triggers the service on schedule:
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now myjob.timer
```

### `OnCalendar=` syntax — more readable than cron once you know it
```
OnCalendar=*-*-* 04:00:00        # every day at 4:00 AM
OnCalendar=Mon *-*-* 09:00:00      # every Monday at 9:00 AM
OnCalendar=*:0/15                    # every 15 minutes
OnCalendar=hourly                     # shorthand — every hour
OnCalendar=daily                       # shorthand — every day at midnight
OnCalendar=weekly                       # shorthand — every Monday at midnight
```

**Test what a calendar expression actually resolves to, before trusting it:**
```bash
systemd-analyze calendar "Mon *-*-* 09:00:00"
```
This prints the next several actual trigger times — an easy way to sanity-check your syntax without waiting for it to fire.

### Monotonic timers — relative to boot/activation instead of a fixed clock time
```ini
[Timer]
OnBootSec=10min           # 10 minutes after boot
OnUnitActiveSec=1h          # 1 hour after this timer last activated its service — good for "run every hour, but not at a fixed clock time"
```

### `Persistent=true` — the feature cron simply doesn't have
If the machine is **off** when a scheduled run would have happened (laptop asleep, server rebooting for updates), `Persistent=true` makes systemd run the missed job as soon as the system is back up, instead of just silently skipping it until the next scheduled time. This alone is a strong reason to prefer timers over cron for anything that genuinely needs to run — backups, certificate renewal checks, monitoring scripts.

---

## 8. Timers vs Cron — Direct Comparison

| | cron | systemd timers |
|---|---|---|
| Logging | Job output isn't captured by default — you must manually redirect (`>> logfile.log 2>&1`) or it vanishes | Captured in `journalctl -u myjob.service` automatically, no extra config |
| Missed runs (machine was off) | Silently skipped, no recovery | `Persistent=true` catches up automatically |
| Dependency awareness | None — cron doesn't know if the network/a mount/another service is ready | Full systemd dependency system — `After=`, `Requires=`, etc. all apply |
| Manual testing | Have to wait for the schedule, or manually run the underlying command yourself | `systemctl start myjob.service` runs it immediately, on demand, independent of the timer |
| Resource control | None built-in | Can apply the same resource limits as any systemd service (`MemoryMax=`, `CPUQuota=`, etc.) |
| Per-user jobs | `crontab -e` per user, separate mechanism | `systemctl --user` timers, same unit file format |
| Syntax | Terse, easy to get subtly wrong (`* * * * *` ordering is easy to misremember) | More verbose but more explicit, and testable with `systemd-analyze calendar` |

**When cron still makes sense:** extremely simple personal scripts on a system where you don't care about missed-run recovery or structured logging, and you already know cron syntax cold. For anything you'd actually call "AIOps" — health checks, backups, monitoring, log rotation triggers — timers are the better default going forward.

---

## 9. Practical Example — A Health-Check Job (AIOps-Flavored)

A script that checks a service's health every 5 minutes, logs structured output to the journal, and would be trivial to wire into an alerting pipeline later.

```bash
#!/usr/bin/env bash
# /opt/scripts/health-check.sh
set -euo pipefail

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }

if curl -sf http://localhost:8080/health > /dev/null; then
    log "OK: service healthy"
else
    log "FAIL: service health check failed"
    exit 1     # non-zero exit — this is what lets systemd/monitoring tools recognize failure
fi
```

```ini
# /etc/systemd/system/health-check.service
[Unit]
Description=Health check for myapp

[Service]
Type=oneshot
ExecStart=/opt/scripts/health-check.sh
```

```ini
# /etc/systemd/system/health-check.timer
[Unit]
Description=Run health-check every 5 minutes

[Timer]
OnCalendar=*:0/5
Persistent=true

[Install]
WantedBy=timers.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now health-check.timer
```

**Now every run's outcome is queryable with standard tools:**
```bash
journalctl -u health-check.service --since today       # full history, timestamped, structured
journalctl -u health-check.service -p err                 # ONLY the failures
systemctl list-timers health-check.timer                    # confirm next scheduled run time
```
This is the exact advantage over a cron-based version of the same script — no separate log file to manage, no missing timestamps, and `journalctl -p err` gives you a pre-filtered failure history for free.

---

## 10. Debugging Units

```bash
sudo systemd-analyze verify /etc/systemd/system/myapp.service     # catches syntax errors BEFORE you try to start it
sudo systemctl status myapp                                          # current state + last few log lines
journalctl -u myapp -f                                                 # live tail
journalctl -u myapp --since "10 min ago"
systemctl list-timers --all                                              # every timer, and its next scheduled run
systemctl list-units --failed                                              # everything currently in a failed state, system-wide
```

---

## Quick Reference

```
CREATE A UNIT       /etc/systemd/system/<name>.service
AFTER ANY EDIT        sudo systemctl daemon-reload    (always, no exceptions)
ENABLE + START NOW      sudo systemctl enable --now <name>
CHECK STATUS              systemctl status <name>
LIVE LOGS                   journalctl -u <name> -f

TIMER PAIR                   <name>.service (Type=oneshot, no [Install])
                                <name>.timer  (OnCalendar=..., Persistent=true, WantedBy=timers.target)
ENABLE THE TIMER                sudo systemctl enable --now <name>.timer
TEST A SCHEDULE EXPRESSION        systemd-analyze calendar "<expression>"
SEE ALL SCHEDULED TIMERS            systemctl list-timers --all
```
