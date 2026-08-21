# General Server Hardening — Beyond SSH

SSH hardening gets one door. This covers the rest of the house: automated patching, intrusion detection, activity auditing, and cutting down what's even exposed to attack in the first place.

---

## 0. The Hardening Mental Model

```
1. Reduce attack surface   →  fewer running services/open ports = fewer things that can go wrong
2. Patch automatically       →  known vulnerabilities get fixed before they're exploited, without you remembering
3. Detect intrusion attempts   →  fail2ban reacts to abuse in real time
4. Audit what actually happened →  auditd/logs give you a record if something DOES get through
```

These four layers are independent — losing one doesn't defeat the others, which is the whole point of "defense in depth."

---

## 1. Minimizing Attack Surface

The single highest-leverage hardening step, and the one most guides skip in favor of flashier tools: **run less stuff.**

### Audit what's actually running and listening
```bash
sudo ss -tulnp                  # every listening port, and the process behind it
sudo systemctl list-units --type=service --state=running     # every active service
```
For each result, ask: does this actually need to be running on this machine, and does it need to be reachable from outside (vs. `localhost`-only)?

### Disable services you don't need
```bash
sudo systemctl stop <service>
sudo systemctl disable <service>      # prevents it from starting again on next boot
```
Common offenders on a fresh install that are rarely needed on a headless server: print spoolers (`cups`), Bluetooth (`bluetooth`), and various desktop-environment leftovers if you installed from a desktop ISO instead of server-minimal.

### Bind services to localhost when they don't need external access
Many services (databases, internal APIs, admin panels) only need to be reached by other processes on the same machine, or through a reverse proxy — not directly from the internet. In the service's own config:
```
# example: PostgreSQL, MySQL, Redis, etc — bind to loopback only
listen_addresses = 'localhost'
bind 127.0.0.1
```
A service that's only listening on `127.0.0.1` simply isn't reachable from outside at all, regardless of firewall rules — this is a stronger guarantee than "I firewalled it," because there's no rule to misconfigure.

### Remove unused packages, don't just disable them
```bash
sudo apt list --installed
sudo apt purge <package>            # removes it entirely, including config files
sudo apt autoremove                 # cleans up now-orphaned dependencies
```
A disabled-but-installed service can still get re-enabled by an update, another package's dependency, or a future mistake. Removed is more permanent than disabled.

### Close ports at the firewall too (defense in depth with the previous point)
Even after minimizing what's running, apply your `ufw`/firewall rules (from the firewall guide) as a second layer — belt and suspenders, not either/or.

---

## 2. `unattended-upgrades` — Automatic Security Patching

Most real-world compromises exploit **known, already-patched** vulnerabilities on systems that simply never got updated. This closes that gap without you needing to remember `apt upgrade` regularly.

### Install and configure
```bash
sudo apt install unattended-upgrades apt-listchanges -y
sudo dpkg-reconfigure --priority=low unattended-upgrades     # interactive setup, choose "Yes"
```

### Key config file: `/etc/apt/apt.conf.d/50unattended-upgrades`
```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    // uncomment the next line too if you also want non-security updates applied automatically —
    // most hardened setups deliberately leave this OFF and patch non-security updates manually
    //"${distro_id}:${distro_codename}-updates";
};

Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";       // see note below before flipping this to true
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
```

### Whether to enable automatic reboots
Some kernel/library updates need a reboot to fully take effect — until then, the running processes are still using the old, vulnerable code even though the files on disk are patched. `Automatic-Reboot "true"` closes that gap completely, but takes the machine down on a schedule with no human confirmation — genuinely fine for most personal/dev servers, riskier for something where unexpected downtime has real consequences. Know the tradeoff rather than defaulting either way blindly.

### Confirm it's actually enabled and working
```bash
cat /etc/apt/apt.conf.d/20auto-upgrades
```
```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
```

### Check what it's actually done
```bash
cat /var/log/unattended-upgrades/unattended-upgrades.log
```

### Dry-run test (see what it WOULD do, right now, without applying anything)
```bash
sudo unattended-upgrade --dry-run --debug
```

---

## 3. Tuning `fail2ban` Properly

Basic `fail2ban` install/enable was covered in the SSH guide — this is the actual tuning most people skip.

### Understanding the two files that matter
```bash
/etc/fail2ban/jail.conf     # the DEFAULT config — DO NOT edit this directly, it gets overwritten on package updates
/etc/fail2ban/jail.local     # YOUR overrides — create this, fail2ban merges it on top of jail.conf
```

### A properly tuned `jail.local`
```bash
sudo nano /etc/fail2ban/jail.local
```
```ini
[DEFAULT]
bantime  = 1h            # how long an IP stays banned
findtime = 10m             # the window within which maxretry failures must occur
maxretry = 5                 # how many failures within findtime triggers a ban
ignoreip = 127.0.0.1/8 ::1 192.168.1.0/24    # NEVER let fail2ban ban your own trusted network by accident

[sshd]
enabled = true
port    = 2222              # match whatever port you actually run SSH on (see your SSH guide)
bantime = 1d                 # SSH specifically deserves a longer ban than the default — real attackers, not typos

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true
```

**Why `ignoreip` matters more than it looks:** without it, a genuine typo in your own SSH client (wrong key, mistyped password if you still allow that) can get *you* banned from *your own server*. Always whitelist your home/office IP or trusted subnet explicitly.

**Why per-jail `bantime` matters:** an SSH brute-force attempt is a much stronger malicious signal than, say, a single failed login on a lower-stakes service — tuning `bantime` per jail lets you ban SSH attackers harder and longer while staying more lenient elsewhere.

### Escalating bans for repeat offenders
```ini
[DEFAULT]
bantime.increment = true
bantime.factor = 2          # each subsequent ban for the same IP doubles in length
bantime.maxtime = 1w         # cap the escalation so it doesn't grow unbounded forever
```

### Checking fail2ban's actual state
```bash
sudo fail2ban-client status                 # list active jails
sudo fail2ban-client status sshd              # see currently banned IPs for a specific jail
sudo fail2ban-client set sshd unbanip <ip>      # manually unban an IP (useful if you accidentally ban yourself)
```

### Testing a jail's regex against your actual logs before trusting it
```bash
sudo fail2ban-regex /var/log/auth.log /etc/fail2ban/filter.d/sshd.conf
```
Confirms the jail's pattern actually matches your real log format — worth doing once for any custom jail you write, since a filter that doesn't match anything provides zero protection while looking configured.

---

## 4. `auditd` — Knowing What Actually Happened

Where journald/syslog tell you what services logged, `auditd` tracks lower-level system events: specific file access, command execution, permission changes — a much finer-grained record, at the cost of more noise to manage.

### Install and enable
```bash
sudo apt install auditd audispd-plugins -y
sudo systemctl enable auditd --now
```

### Writing audit rules — `/etc/audit/rules.d/audit.rules`

**Watch a critical file for any changes:**
```
-w /etc/passwd -p wa -k passwd_changes
-w /etc/shadow -p wa -k shadow_changes
-w /etc/sudoers -p wa -k sudoers_changes
```
`-p wa` = watch for writes and attribute changes. `-k <name>` = a searchable tag for this rule's matches.

**Watch for use of a specific command (e.g. track every use of `sudo`):**
```
-w /usr/bin/sudo -p x -k sudo_usage
```

**Watch a whole directory:**
```
-w /etc/ssh/ -p wa -k sshd_config_changes
```

Apply new rules:
```bash
sudo augenrules --load
# or reboot, since some environments load rules only at boot
```

### Actually querying the audit log — this is the part that makes it useful
```bash
sudo ausearch -k passwd_changes           # everything matching that tag
sudo ausearch -k sudo_usage -ts today       # sudo usage, today only
sudo ausearch -ui 1000                      # everything by a specific UID
sudo aureport -au                             # summary report of authentication events
sudo aureport -f                                # summary report of file access events
```

**Practical example — "did anyone touch `/etc/sudoers` this week, and who":**
```bash
sudo ausearch -k sudoers_changes -ts week-ago
```
This is the kind of question `auditd` answers cleanly that plain syslog genuinely can't — it ties the event to the exact process, UID, and command line responsible, not just a general log line.

**Honest tradeoff to know:** `auditd` produces a lot of log volume if you watch broad paths — start with a small, deliberate rule set (critical config files, sudo usage) rather than trying to audit everything, or the noise buries the signal you actually care about.

---

## 5. Putting It Together — A Baseline Hardening Checklist

- [ ] Audited running services (`ss -tulnp`), disabled/removed anything unnecessary
- [ ] Internal-only services (DB, cache, admin panels) bound to `127.0.0.1`, not `0.0.0.0`
- [ ] Firewall (`ufw`/iptables/nftables) default-deny inbound, explicit allows only
- [ ] `unattended-upgrades` installed and confirmed active, security updates at minimum
- [ ] `fail2ban` tuned with a real `jail.local` — proper `bantime`/`findtime`/`maxretry`, `ignoreip` set to your own trusted network
- [ ] `auditd` watching at minimum: `/etc/passwd`, `/etc/shadow`, `/etc/sudoers`, and sudo usage itself
- [ ] SSH hardening from the earlier guide applied (key-only auth, non-default port, no root login)
- [ ] A recurring calendar reminder (not just automation) to actually review `aureport`/`fail2ban-client status`/`journalctl -p err` periodically — automation reduces the work, it doesn't replace occasionally actually looking
