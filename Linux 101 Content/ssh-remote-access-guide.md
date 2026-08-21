# SSH Remote Access From Outside Your Network — Complete Guide

How to reach a Linux machine over SSH from anywhere on the internet, not just your local network — plus the hardening steps that matter once that machine is actually exposed.

---

## 0. Two Ways to Do This

| Approach | How it works | Best for |
|---|---|---|
| **Port forwarding** | Open a port on your router, forward it to the machine's local IP | Full control, no third party, but exposes your home IP directly to the internet |
| **Tunneling service** (Tailscale, Cloudflare Tunnel, reverse SSH via VPS) | No port forwarding at all — an outbound connection from your machine creates the path in | Far safer, easier, works behind CGNAT/no router access — **recommended for most personal setups** |

This guide covers the direct port-forwarding method in full (since that's what you asked for), then the safer alternative at the end — genuinely worth reading before you commit to opening a port.

---

## 1. Install & Enable the SSH Server

On the machine you want to connect *into* (the "server"):

```bash
sudo apt update
sudo apt install openssh-server -y
sudo systemctl enable ssh --now     # start now, and on every boot
sudo systemctl status ssh            # confirm it's active (running)
```

---

## 2. Find Your IPs

You need two different IPs — don't confuse them.

**Local (internal) IP** — how devices on your own network see this machine:
```bash
ip a                 # look under your active interface (eth0/wlan0), the inet line
hostname -I           # quicker, just prints the IP(s)
```

**Public IP** — how the internet sees your entire network (this is what you'll actually connect to from outside):
```bash
curl ifconfig.me
# or open https://whatismyip.com in a browser
```

**Give the server machine a fixed local IP.** If it's on DHCP, its local IP can change after a reboot, breaking your port forward. Either:
- Set a **static IP** on the machine itself, or
- Set a **DHCP reservation** in your router (binds a specific local IP to this machine's MAC address permanently) — this is the cleaner option since the machine's config stays untouched.

---

## 3. Forward the Port on Your Router

1. Log into your router's admin panel — usually `192.168.1.1` or `192.168.0.1` in a browser (check the router's label, or run `ip route | grep default` to find your gateway IP).
2. Find **Port Forwarding** (sometimes under "NAT," "Virtual Server," or "Firewall").
3. Create a rule:
   - **External port**: e.g. `2222` (see the security note below on why not `22`)
   - **Internal port**: `22`
   - **Internal IP**: the server's local IP from Step 2
   - **Protocol**: TCP
4. Save and apply — most routers apply this instantly, some need a reboot.

---

## 4. Open the Port on the Server's Own Firewall

Port forwarding at the router is useless if the machine's local firewall still blocks the connection.

```bash
sudo ufw allow 22/tcp        # or your custom port, e.g. sudo ufw allow 2222/tcp
sudo ufw enable
sudo ufw status
```

---

## 5. Connect From Outside

From another network entirely (mobile data is a good real test — your own network won't prove it works from outside):

```bash
ssh -p 2222 solo@<your_public_ip>
```

If you forwarded external `2222` → internal `22`, you must specify `-p 2222` on the client side — the external and internal ports don't have to match, and here they intentionally don't.

---

## 6. Connecting as Root vs. as a Regular User — Two Ways In

Once your port forward and firewall are set up, *who* you log in as matters a lot for security. Here's both approaches, step by step.

### 6.1 Method 1 — Connect as a Regular User, Then Elevate (Recommended)

This is the standard, safe pattern: SSH in as an unprivileged user, then become root only for the specific commands that need it.

**Step 1 — SSH in as your normal user:**
```bash
ssh -p 2222 solo@<public_ip_or_ddns_hostname>
```

**Step 2 — Confirm who you are once connected:**
```bash
whoami    # prints your regular username, e.g. "solo"
```

**Step 3 — Run an individual admin command with `sudo`:**
```bash
sudo apt update
```
You're prompted for **your own** password (the account you SSH'd in as), not root's.

**Step 4 — If you need several root commands in a row, get a full root shell:**
```bash
sudo -i
whoami    # now prints "root"
```

**Step 5 — Exit root, then exit the SSH session entirely when done:**
```bash
exit      # drops out of the root shell, back to your normal user
exit      # closes the SSH connection
```

### 6.2 Method 2 — Connect Directly as Root

Technically possible, but disabled by default on most distros, and actively discouraged for anything internet-facing — every login attempt against a machine's SSH port is now guessing the *known* username "root" instead of also having to guess a username. Shown here for completeness and for local/lab use.

**Step 1 — Give root a password** (it has none set by default on Ubuntu/Debian):
```bash
sudo passwd root
```

**Step 2 — Temporarily allow root login over SSH** — edit `/etc/ssh/sshd_config` on the server:
```
PermitRootLogin yes
```

**Step 3 — Restart the SSH service to apply it:**
```bash
sudo systemctl restart ssh
```

**Step 4 — Connect directly as root from the client:**
```bash
ssh -p 2222 root@<public_ip_or_ddns_hostname>
```

**Step 5 — Revert it once you're done** (this is the important part — don't leave this open):
```
# back to /etc/ssh/sshd_config
PermitRootLogin no
```
```bash
sudo systemctl restart ssh
```

### 6.3 Which One Should You Actually Use?

| Situation | Use |
|---|---|
| Any machine reachable from the internet (your port-forwarded setup) | **Method 1** — `PermitRootLogin no`, connect as a regular user, `sudo` when needed |
| Local-only lab machine, never exposed outside your LAN | Either is fine, Method 1 is still better practice |
| You just need to run one root-level command remotely | `ssh -p 2222 solo@host "sudo <command>"` — skips a full interactive login entirely |

**Bottom line:** treat direct root login the same way you'd treat leaving your front door key under the mat — it works, but it's the first thing anyone probing your server will try. Method 1 with `sudo` gives you the exact same power with a username an attacker actually has to guess first, plus a clean audit trail of every elevated command in `/var/log/auth.log`.

---

## 7. Your Public IP Keeps Changing — Fix It With Dynamic DNS

Most home internet connections have a **dynamic** public IP — it changes periodically, breaking anything hardcoded to today's address. Dynamic DNS (DDNS) gives you a stable hostname that always points at your current IP.

**Free options:** DuckDNS, No-IP, Cloudflare (if you own a domain).

**DuckDNS example:**
1. Create a free subdomain at duckdns.org, e.g. `solo-home.duckdns.org`.
2. Install their update script (cron job or systemd timer) on the server — it pings DuckDNS every few minutes with your current IP.
3. From then on, connect with the hostname instead of a raw IP:
```bash
ssh -p 2222 solo@solo-home.duckdns.org
```

---

## 8. Security Hardening — Don't Skip This

The moment you forward SSH to the internet, automated bots **will** find and hammer it within hours — this isn't hypothetical, it's guaranteed. These steps aren't optional polish, they're the difference between "exposed but safe" and "compromised."

### Switch to key-based authentication, then disable passwords entirely
```bash
# on your CLIENT machine (not the server):
ssh-keygen -t ed25519
ssh-copy-id -p 2222 solo@<server_ip>     # copies your public key to the server
```
Then on the **server**, edit `/etc/ssh/sshd_config`:
```
PasswordAuthentication no
PubkeyAuthentication yes
```
```bash
sudo systemctl restart ssh
```
This alone eliminates the entire brute-force-password attack surface — a key can't be guessed the way a password can.

### Disable root login
```
# /etc/ssh/sshd_config
PermitRootLogin no
```

### Change the default port
Set `Port 2222` (or any non-standard number) in `/etc/ssh/sshd_config`. This doesn't add real cryptographic security, but it silences the vast majority of dumb automated scanners that only ever check port 22 — your logs get dramatically quieter and easier to actually monitor.

### Restrict which users can SSH in at all
```
# /etc/ssh/sshd_config
AllowUsers solo
```

### Install fail2ban
Automatically bans IPs that fail login too many times:
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban --now
```

### Rate-limit connections at the firewall too
```bash
sudo ufw limit 2222/tcp     # throttles repeated connection attempts from the same IP
```

### Keep the system patched
```bash
sudo apt update && sudo apt upgrade -y     # do this regularly — SSH/OpenSSH CVEs do happen
```

**After all of the above**, re-check `sudo systemctl restart ssh` and re-test your connection *before* closing your current session — if `sshd_config` has a typo, you don't want to be locked out with no way back in.

---

## 9. The Safer Alternative: Skip Port Forwarding Entirely

Worth strong consideration, especially for a personal/home setup:

### Tailscale (recommended)
Creates a private mesh VPN between your devices — no router config, no open ports, works even behind CGNAT (which port forwarding can't solve at all).
```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up
```
Every device you install it on gets a stable private IP (`100.x.x.x`) that only *your* devices can reach — then just `ssh solo@<tailscale-ip>` from anywhere, with zero exposure to the public internet.

### Cloudflare Tunnel
Similar idea — an outbound-only tunnel from your server to Cloudflare, no inbound port ever opened.

### Reverse SSH tunnel via a cheap VPS
If you already have a VPS, the server can dial out to it and hold a tunnel open, letting you reach it through the VPS without ever forwarding a port at home:
```bash
ssh -R 2222:localhost:22 you@your-vps-ip
```

**Why this matters:** port forwarding exposes your home router directly to internet-wide scanning. A mesh VPN like Tailscale gets you the exact same remote-access outcome with essentially none of that exposure — for a personal setup it's very hard to justify skipping it.

---

## 10. Troubleshooting

| Symptom | Likely cause |
|---|---|
| `Connection timed out` | Port forward isn't actually applied, or your ISP uses CGNAT (your "public" IP isn't really public — common on mobile/some ISPs) |
| `Connection refused` | SSH service isn't running, or local firewall (`ufw`) is blocking the port |
| Works on local network, fails from outside | Router port-forward rule is wrong, or pointing at the wrong internal IP |
| Prompted for password even after key setup | `PasswordAuthentication` wasn't actually set to `no`, or the public key wasn't copied to the right user's `~/.ssh/authorized_keys` |
| Locked out after editing `sshd_config` | Keep your current session open while testing a *second* connection in a new terminal — never close your only working session until the new config is confirmed working |

Check live logs while debugging:
```bash
sudo journalctl -u ssh -f
```

---

## 11. Quick Setup Checklist

- [ ] `openssh-server` installed and running
- [ ] Static local IP or DHCP reservation on the server
- [ ] Router port forward: external port → server's local IP:22
- [ ] `ufw allow <port>/tcp` on the server itself
- [ ] Tested from an actual outside network (mobile data)
- [ ] Dynamic DNS set up if your public IP isn't static
- [ ] SSH key auth working, then `PasswordAuthentication no`
- [ ] `PermitRootLogin no`
- [ ] Non-default port set
- [ ] `fail2ban` installed and running
- [ ] Considered Tailscale instead of all of the above
