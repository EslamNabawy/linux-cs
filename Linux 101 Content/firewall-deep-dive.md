# Firewall Deep Dive — ufw vs iptables vs nftables

Three tools, one underlying job: deciding what network traffic gets in, out, or forwarded. Here's how they relate, and how to actually write rules beyond `ufw allow 22`.

---

## 0. How These Three Actually Relate

```
nftables   →  the modern kernel packet-filtering framework (replaces the old netfilter/iptables backend)
iptables    →  legacy tool — on current systems, often just translates its commands into nftables rules underneath
ufw          →  a friendly frontend that generates iptables (or nftables, depending on distro version) rules for you
```

They're not three unrelated options — `ufw` is built on top of `iptables`/`nftables`, and modern `iptables` itself is frequently just a compatibility shim over the real nftables engine now running in the kernel. Which one you interact with directly is a tradeoff between simplicity (`ufw`) and raw control (`iptables`/`nftables`).

| | ufw | iptables | nftables |
|---|---|---|---|
| Learning curve | Lowest | Moderate | Moderate-high (but cleaner once learned) |
| Underlying engine | iptables or nftables (distro-dependent) | netfilter (legacy syntax) | netfilter (modern syntax) |
| Best for | Quick, common rules on a single host | Fine-grained control, huge existing knowledge base online | New setups, complex rule sets, performance at scale |
| Status | Actively used, wraps the others | Legacy but still everywhere | The actual current standard going forward |

---

## 1. `ufw` — Beyond Just `allow`

### The basics, quickly
```bash
sudo ufw status verbose        # see current rules and default policies
sudo ufw default deny incoming   # deny everything inbound by default — the correct starting posture
sudo ufw default allow outgoing   # allow everything outbound by default (usually fine for a normal host)
sudo ufw enable                    # turn it on
```

### Real rule-writing

**Allow/deny a specific port and protocol:**
```bash
sudo ufw allow 22/tcp
sudo ufw deny 23/tcp             # explicitly block, distinct from just not allowing
```

**Allow only from a specific IP or subnet:**
```bash
sudo ufw allow from 203.0.113.5 to any port 22
sudo ufw allow from 192.168.1.0/24 to any port 3306    # a whole subnet, e.g. DB access only from your LAN
```

**Restrict to a specific network interface:**
```bash
sudo ufw allow in on eth0 to any port 80
```

**Port ranges:**
```bash
sudo ufw allow 6000:6010/tcp
```

**Rate limiting — throttles repeated connection attempts from the same IP (built-in brute-force mitigation):**
```bash
sudo ufw limit ssh
sudo ufw limit 2222/tcp
```
This denies an IP if it attempts more than 6 connections within 30 seconds — genuinely useful on any internet-facing SSH port, and something `allow` alone doesn't give you.

**Deny a specific IP outright (e.g. after spotting it in fail2ban/logs):**
```bash
sudo ufw deny from 198.51.100.23
```

**Numbered rules — needed to delete precisely:**
```bash
sudo ufw status numbered
sudo ufw delete 3          # deletes rule #3 as shown in the numbered list
```

**Application profiles** — some packages register a named profile instead of you remembering ports:
```bash
sudo ufw app list
sudo ufw allow 'Nginx Full'      # equivalent to allowing both 80/tcp and 443/tcp
```

**Logging:**
```bash
sudo ufw logging on
sudo tail -f /var/log/ufw.log
```

---

## 2. `iptables` — The Legacy Standard, In Real Depth

### Core concepts

**Tables** — different purposes:
| Table | Purpose |
|---|---|
| `filter` | the default — basic allow/deny decisions (what most rules use) |
| `nat` | network address translation — port forwarding, masquerading |
| `mangle` | packet modification (rare, advanced use) |

**Chains within the `filter` table:**
| Chain | Applies to |
|---|---|
| `INPUT` | traffic destined FOR this machine |
| `OUTPUT` | traffic originating FROM this machine |
| `FORWARD` | traffic passing THROUGH this machine (routing/NAT scenarios) |

**Targets** — what to do with a matched packet:
| Target | Effect |
|---|---|
| `ACCEPT` | let it through |
| `DROP` | silently discard — sender gets no response at all |
| `REJECT` | discard, but send back an explicit rejection (e.g. connection refused) |

### Rule syntax anatomy
```bash
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
#          │      │        │           │
#          │      │        │           └─ target: what to do
#          │      │        └───────────── match: destination port 22
#          │      └────────────────────── match: protocol tcp
#          └───────────────────────────── append this rule to the INPUT chain
```

### Real rule-writing

**Set default policies (do this FIRST, before adding allow rules, or you can lock yourself out):**
```bash
sudo iptables -P INPUT DROP
sudo iptables -P FORWARD DROP
sudo iptables -P OUTPUT ACCEPT
```

**Always allow established/related connections — without this, replies to your own outbound traffic get blocked too:**
```bash
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
```

**Allow loopback (localhost) traffic — many services depend on this internally:**
```bash
sudo iptables -A INPUT -i lo -j ACCEPT
```

**Allow SSH, but only from one IP:**
```bash
sudo iptables -A INPUT -p tcp -s 203.0.113.5 --dport 22 -j ACCEPT
```

**Allow a port range:**
```bash
sudo iptables -A INPUT -p tcp --dport 6000:6010 -j ACCEPT
```

**Rate-limit connections (basic brute-force mitigation):**
```bash
sudo iptables -A INPUT -p tcp --dport 22 -m conntrack --ctstate NEW -m limit --limit 3/min --limit-burst 3 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j DROP
```
This accepts up to 3 new SSH connection attempts per minute, then silently drops anything beyond that — a manual equivalent of what `ufw limit` does automatically.

**Block a specific IP outright:**
```bash
sudo iptables -A INPUT -s 198.51.100.23 -j DROP
```

**Port forwarding (NAT table) — forward external port 8080 to an internal service on port 3000:**
```bash
sudo iptables -t nat -A PREROUTING -p tcp --dport 8080 -j REDIRECT --to-port 3000
```

**Logging before dropping — see what's being blocked:**
```bash
sudo iptables -A INPUT -p tcp --dport 22 -j LOG --log-prefix "SSH-DROP: "
sudo iptables -A INPUT -p tcp --dport 22 -j DROP
```
```bash
dmesg | grep SSH-DROP     # view the logged attempts
```

### Viewing & deleting rules
```bash
sudo iptables -L -v -n --line-numbers    # list all rules, numbered, with packet counters
sudo iptables -D INPUT 3                   # delete rule #3 from the INPUT chain
sudo iptables -F                             # flush (delete) ALL rules — use with caution, this can open everything up
```

### Making rules persistent (they're wiped on reboot otherwise)
```bash
sudo apt install iptables-persistent -y
sudo netfilter-persistent save
```

---

## 3. `nftables` — The Modern Replacement

nftables unifies what used to require separate tools (`iptables`, `ip6tables`, `arptables`, `ebtables`) into one framework with cleaner syntax and better performance for large rule sets.

### Core concepts — similar shape, different words
```
table    →  a container for chains (you name it and pick a family: ip, ip6, inet, arp, bridge)
chain     →  a hook point (input, output, forward — you define these yourself, unlike iptables' fixed chains)
rule       →  the actual match + action
```

### Basic setup
```bash
sudo apt install nftables -y
sudo systemctl enable nftables --now
```

### Writing rules — interactive vs. file-based

**Interactive (temporary, for testing):**
```bash
sudo nft add table inet filter
sudo nft add chain inet filter input { type filter hook input priority 0 \; policy drop \; }
sudo nft add rule inet filter input tcp dport 22 accept
sudo nft add rule inet filter input ct state established,related accept
sudo nft add rule inet filter input iif lo accept
```

**File-based (the real, persistent way — this is how nftables is meant to be used):**
```bash
sudo nano /etc/nftables.conf
```
```
#!/usr/sbin/nft -f

flush ruleset

table inet filter {
    chain input {
        type filter hook input priority 0; policy drop;

        ct state established,related accept
        iif lo accept

        tcp dport 22 accept
        tcp dport 80 accept
        tcp dport 443 accept

        # rate-limited SSH, same idea as the iptables example above
        tcp dport 2222 ct state new limit rate 3/minute accept

        # explicit block of a known-bad IP
        ip saddr 198.51.100.23 drop
    }

    chain forward {
        type filter hook forward priority 0; policy drop;
    }

    chain output {
        type filter hook output priority 0; policy accept;
    }
}
```
```bash
sudo nft -f /etc/nftables.conf     # load it
sudo systemctl restart nftables       # or apply via service restart
```

### Sets — nftables' real advantage for larger rule sets
Instead of writing a separate rule per IP or port, group them into a named set:
```
set allowed_ips {
    type ipv4_addr
    elements = { 203.0.113.5, 203.0.113.6, 198.51.100.10 }
}

chain input {
    type filter hook input priority 0; policy drop;
    ip saddr @allowed_ips tcp dport 22 accept
}
```
This is dramatically more efficient (and readable) than 50 near-identical iptables lines when you're allow-listing many IPs or ports.

### Viewing & managing rules
```bash
sudo nft list ruleset              # show everything currently loaded
sudo nft list table inet filter      # show just one table
sudo nft flush ruleset                # clear everything — same caution as iptables -F
sudo nft delete rule inet filter input handle <handle_number>   # delete one specific rule by its handle
```
Get handle numbers with:
```bash
sudo nft -a list ruleset     # -a shows the handle for each rule, needed for targeted deletion
```

---

## 4. Same Scenario, All Three Tools — Direct Comparison

**Goal: allow SSH only from `203.0.113.5`, rate-limited, deny everything else inbound.**

**ufw:**
```bash
sudo ufw default deny incoming
sudo ufw allow from 203.0.113.5 to any port 22
sudo ufw limit 22/tcp
sudo ufw enable
```

**iptables:**
```bash
sudo iptables -P INPUT DROP
sudo iptables -A INPUT -i lo -j ACCEPT
sudo iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
sudo iptables -A INPUT -p tcp -s 203.0.113.5 --dport 22 -m limit --limit 3/min -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 22 -j DROP
```

**nftables:**
```
chain input {
    type filter hook input priority 0; policy drop;
    iif lo accept
    ct state established,related accept
    ip saddr 203.0.113.5 tcp dport 22 limit rate 3/minute accept
}
```

Same outcome, three different vocabularies — this is the fastest way to see how the concepts map across tools.

---

## 5. Which One Should You Actually Use?

| Situation | Use |
|---|---|
| Single personal server, common rules (SSH, a web port, maybe a DB port) | **ufw** — fastest to get right, hardest to accidentally lock yourself out |
| You're following an existing guide/Stack Overflow answer, most of which are written for it | **iptables** — still the most commonly documented tool online |
| Setting up a new system today with no legacy constraints, or managing many IPs/ports via sets | **nftables** — the direction the ecosystem is actually moving |
| You need to understand what `ufw` generated under the hood | `sudo iptables -L -v -n` (or `nft list ruleset` on nftables-backed distros) shows you exactly what ufw actually wrote |

**Practical note for your setup specifically:** since you're already running `ufw` from the SSH guide, there's no need to switch tools just to get the deeper rules above — everything in section 1 (rate limiting, per-IP rules, per-interface rules) covers real-world hardening without ever touching raw iptables/nftables syntax. Reach for the lower-level tools when you hit something ufw genuinely can't express (complex NAT, sets of hundreds of IPs, multi-chain custom logic).

---

## Quick Reference

```
UFW           sudo ufw allow from <ip> to any port <port>
                sudo ufw limit <port>/tcp
                sudo ufw status numbered   →   sudo ufw delete <n>

IPTABLES       sudo iptables -A INPUT -p tcp -s <ip> --dport <port> -j ACCEPT
                sudo iptables -L -v -n --line-numbers
                sudo iptables -D INPUT <n>

NFTABLES        sudo nft add rule inet filter input tcp dport <port> accept
                 sudo nft -a list ruleset
                 sudo nft delete rule inet filter input handle <n>

ALWAYS DO FIRST   allow loopback + established/related BEFORE setting a deny-by-default policy,
                    or you can lock yourself out of your own remote session immediately.
```
