# Networking Troubleshooting Toolkit — "Why Can't This Reach That?"

The tools for isolating exactly where a connection breaks: DNS, routing, a blocked port, or the application itself. Each tool below answers a different link in that chain.

---

## 0. The Mental Model — Where Connections Actually Break

```
1. DNS         →  can the name even resolve to an IP?
2. Reachability →  can a packet get to that IP at all?
3. Routing       →  what path is it taking, and where does it stop?
4. Port/Service   →  is the specific port open and listening?
5. Application     →  is the service responding correctly at the protocol level?
```

Every "can't connect" problem lives at exactly one of these layers — the tools below map directly onto them, in the order you should actually check them.

---

## 1. `ping` — Is It Reachable At All?

```bash
ping google.com
ping -c 4 google.com        # send exactly 4 packets, then stop (default is infinite until Ctrl+C)
ping -i 0.5 google.com        # interval between packets, in seconds
ping -s 1000 google.com        # custom packet size (bytes) — useful for testing MTU issues
ping -W 2 google.com            # timeout per packet, in seconds
```

### Reading the output
```
64 bytes from 142.250.80.14: icmp_seq=1 ttl=118 time=14.2 ms
```
| Field | Meaning |
|---|---|
| `icmp_seq` | sequence number — gaps in this sequence mean dropped packets |
| `ttl` | Time To Live remaining when it arrived — roughly indicates how many hops away the source is (starting TTL varies by OS, typically 64/128/255) |
| `time` | round-trip latency in milliseconds |

```
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
```
Any non-zero packet loss here is worth investigating further — even 1-2% loss can cause real application-level flakiness.

### What ping tells you — and what it doesn't
- **Tells you:** whether the host responds to ICMP at all, and rough latency/loss.
- **Doesn't tell you:** whether the actual service you care about (a web server, a database, SSH) is reachable — many firewalls block ICMP specifically while still allowing real traffic through, so **"ping fails" does not always mean "the service is down"**, and **"ping succeeds" does not mean the service is up**. Treat ping as a reachability hint, not a service check.

---

## 2. `traceroute` — Where Does the Path Actually Break?

### How it works, briefly
It sends packets with progressively increasing TTL values (1, 2, 3...). Each router along the path decrements TTL by 1; when a packet's TTL hits 0, that router sends back an error instead of forwarding it — which is how traceroute discovers each hop, one at a time, without ever needing cooperation from the destination itself.

```bash
sudo apt install traceroute -y     # often not installed by default
traceroute google.com
traceroute -n google.com             # skip reverse-DNS lookups per hop — much faster, IPs only
```

### Reading the output
```
 1  192.168.1.1  1.203 ms  1.150 ms  1.098 ms
 2  10.10.0.1     8.552 ms  8.402 ms  8.310 ms
 3  * * *
 4  203.0.113.1  15.221 ms  14.998 ms  15.102 ms
```
- Three times per hop = three separate probe packets, for consistency.
- `* * *` means that hop didn't respond — **this is often normal**, not necessarily a failure. Many routers are configured to not respond to traceroute probes at all while still forwarding traffic perfectly fine. Only treat this as a real problem if the trace **never recovers** past that point (every subsequent hop also times out) or never reaches the destination.
- **Where the trace actually stops (and never resumes) is your strongest clue** for where the real problem is — a firewall, a dead link, or a misconfigured route right at that hop.

### `mtr` — the better version for ongoing diagnosis
```bash
sudo apt install mtr -y
mtr google.com
```
Combines ping and traceroute into one continuously-updating view — instead of a single snapshot, you see live loss percentage and latency **per hop**, which makes intermittent problems (a flaky hop that only drops packets sometimes) far easier to spot than a one-shot `traceroute`.

---

## 3. `dig` / `nslookup` — Is DNS the Problem?

DNS issues are one of the most common causes of "can't reach X" — and the easiest to misdiagnose as a routing/firewall problem if you don't check it first.

### `dig` — the more detailed, modern tool
```bash
dig example.com                  # full detailed query
dig +short example.com             # just the resolved IP — the fast version for quick checks
dig example.com MX                   # mail server records
dig example.com NS                    # nameservers for the domain
dig example.com TXT                    # TXT records (SPF, verification records, etc)
dig -x 8.8.8.8                           # reverse lookup — IP to hostname
dig @1.1.1.1 example.com                  # query a SPECIFIC DNS server directly, bypassing your configured resolver
```

**Why querying a specific server (`@1.1.1.1`) matters for troubleshooting:** it isolates whether the problem is your local/configured DNS resolver specifically, or the domain's DNS records themselves. If `dig @1.1.1.1 example.com` resolves fine but plain `dig example.com` doesn't, your configured resolver (often in `/etc/resolv.conf`) is the actual problem, not the domain.

### Reading `dig`'s output
```
;; QUESTION SECTION:
;example.com.          IN  A

;; ANSWER SECTION:
example.com.    299  IN  A  93.184.216.34

;; Query time: 24 msec
;; SERVER: 127.0.0.53#53(127.0.0.53)
```
- **ANSWER SECTION empty** → the domain doesn't resolve at all, or you queried the wrong record type
- **SERVER line** → confirms exactly which DNS server actually answered — critical for the `@` isolation trick above
- **Query time** → high values (hundreds of ms+) can indicate a slow/distant/overloaded resolver

### `nslookup` — older, still common, simpler output
```bash
nslookup example.com
nslookup example.com 1.1.1.1     # query a specific server, same idea as dig's @ syntax
```

### Checking your actual configured resolver
```bash
cat /etc/resolv.conf
resolvectl status         # on systemd-resolved systems — shows the real active resolver, which can differ from resolv.conf
```

---

## 4. Checking a Specific Port — Is the Service Actually Listening?

DNS resolving and the host being pingable doesn't mean the specific port/service you care about is open.

```bash
nc -zv example.com 443        # -z = scan mode (no data sent), -v = verbose — tells you open/closed instantly
telnet example.com 443           # older alternative, connects and leaves you in an interactive session if it succeeds
```

**On the local machine, check what's actually listening:**
```bash
ss -tulnp
# -t tcp  -u udp  -l listening only  -n numeric ports  -p show the owning process
```
If a service isn't in this list at all, it's not the network's fault — the service itself isn't running or isn't bound to the port/interface you expect.

---

## 5. `tcpdump` — See the Actual Packets

When ping/traceroute/dig/port-checks all look fine but something's still wrong, `tcpdump` shows you the raw truth of what's actually going out and coming back.

```bash
sudo tcpdump -i eth0                    # capture on a specific interface (find names with ip a)
sudo tcpdump -i any                       # capture on all interfaces
sudo tcpdump -i eth0 host 203.0.113.5      # filter to one specific IP
sudo tcpdump -i eth0 port 443                # filter to one specific port
sudo tcpdump -i eth0 host 203.0.113.5 and port 443    # combine filters
sudo tcpdump -i eth0 -n                      # skip DNS resolution on captured IPs — faster, cleaner output
sudo tcpdump -i eth0 -w capture.pcap           # save raw capture to a file (open later in Wireshark for deep analysis)
sudo tcpdump -r capture.pcap                    # read back a saved capture
```

### A genuinely common diagnostic pattern
```bash
# On the SERVER, check if a client's connection attempt is even arriving:
sudo tcpdump -i eth0 port 22
# then attempt to SSH in from the client
```
**If you see the SYN packet arrive but no response goes back** → the OS-level firewall (ufw/iptables) is silently dropping it — the packet reaches the box, the service just never gets a chance to answer.
**If you see nothing arrive at all** → the problem is upstream — router port forwarding, an ISP-level block, or the packet never left the client's own network correctly.

This single check is often the fastest way to definitively answer "is it a firewall problem or a routing problem" — something ping/traceroute alone can't always distinguish.

### Reading basic tcpdump output
```
14:32:01.123456 IP 203.0.113.5.54321 > 10.0.0.5.22: Flags [S], seq 123456, win 64240
```
- `Flags [S]` = SYN (connection attempt)
- `Flags [S.]` = SYN-ACK (server accepting)
- `Flags [.]` = ACK
- `Flags [R]` = RST (connection actively refused/reset — different from a silent drop)
- A `[S]` with no `[S.]` reply within the capture = the target isn't responding, consistent with either a firewall drop or the service not listening

---

## 6. `curl -v` — When It's an Application-Layer Problem, Not a Network One

Once you've confirmed the port is open and packets are flowing, but something's still wrong (wrong response, redirect loop, cert issue), drop to the application layer:

```bash
curl -v https://example.com
```
Shows the full handshake: DNS resolution, TCP connect, TLS handshake details, request headers sent, response headers received — the layer above what tcpdump shows you, and often exactly where an "it connects but doesn't work right" problem actually lives (expired cert, wrong Host header, unexpected redirect).

---

## 7. The Full Diagnostic Workflow

**"I can't reach `service.example.com` on port 443"**

```
1. dig service.example.com                 → does the name even resolve? If not, stop here — it's DNS.

2. ping service.example.com                 → is the host reachable at all? (remember: failure here isn't
                                                 definitive if ICMP might be blocked — treat as a hint)

3. nc -zv service.example.com 443             → is the SPECIFIC port open? This is often more reliable
                                                 than ping for a real answer.

4. traceroute / mtr service.example.com        → if unreachable, WHERE does the path actually stop?

5. sudo tcpdump -i eth0 port 443                → (from the server side, if you control it) does the
                                                 connection attempt even arrive? Does it get a response?

6. curl -v https://service.example.com           → if the port IS open but something's still wrong,
                                                 check the application-layer exchange
```

Run these roughly in order — each one either confirms that layer is fine (move to the next) or points you straight at the actual problem, without guessing.

---

## Quick Reference

```
REACHABILITY      ping -c 4 <host>
PATH/ROUTING       traceroute -n <host>    or    mtr <host>
DNS                 dig +short <host>       dig @<server> <host>   (isolate resolver vs domain)
PORT CHECK           nc -zv <host> <port>
LOCAL LISTENERS       ss -tulnp
PACKET CAPTURE          sudo tcpdump -i <iface> host <ip> and port <port>
APPLICATION LAYER        curl -v https://<host>

FASTEST FIREWALL-VS-ROUTING TEST: tcpdump on the server while connecting from the client —
  packet arrives + no response = firewall drop.  packet never arrives = routing/upstream problem.
```