# Monitoring Stack Setup — Prometheus + Grafana From Zero

The stack that's been sitting as a loose entry in your important-files list, actually built out: metrics collection, storage, querying, visualization, and alerting.

---

## 0. Architecture — How the Pieces Fit

```
Target servers
  └─ node_exporter        →  exposes hardware/OS metrics (CPU, mem, disk, network) on port 9100

Prometheus
  └─ scrapes node_exporter(s) on a schedule, stores the time-series data, evaluates alert rules

Grafana
  └─ queries Prometheus, renders dashboards

Alertmanager (optional but standard)
  └─ receives firing alerts FROM Prometheus, handles routing/dedup/notification (Slack, email, etc.)
```

**Key distinction to keep straight:** Prometheus itself can evaluate alert *rules* and know something's wrong — but Alertmanager is the separate component that actually decides how/where to *notify* someone about it (grouping, silencing, routing to different channels). Small setups often skip Alertmanager initially and just watch Grafana dashboards; it's worth adding once you actually want to be notified rather than having to go look.

---

## 1. Two Installation Paths

| Path | Best for |
|---|---|
| **Docker Compose** | Fastest to get running, easiest to tear down/rebuild, good for a dev box or quick lab setup |
| **Native systemd services** | More "production," direct host-level metrics access without container networking layers, matches how most real ops teams actually run it long-term |

Both are shown below — start with Compose to learn the pieces, move to native if/when you want it running as core infrastructure.

---

## 2. Path A: Docker Compose Setup

### Step 1 — Directory structure
```bash
mkdir -p ~/monitoring/{prometheus,grafana}
cd ~/monitoring
```

### Step 2 — Prometheus config
```yaml
# ~/monitoring/prometheus/prometheus.yml
global:
  scrape_interval: 15s        # how often Prometheus pulls metrics from each target

scrape_configs:
  - job_name: 'prometheus'       # Prometheus monitoring itself
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node'                # the host machine, via node_exporter
    static_configs:
      - targets: ['node-exporter:9100']
```

### Step 3 — Compose file
```yaml
# ~/monitoring/docker-compose.yml
version: "3.9"

services:
  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    network_mode: host       # needs host networking to see REAL host metrics, not the container's own

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prom_data:/prometheus
    ports:
      - "127.0.0.1:9090:9090"    # localhost-only — see the security section before exposing this further

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    ports:
      - "127.0.0.1:3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus

volumes:
  prom_data:
  grafana_data:
```

### Step 4 — Launch it
```bash
docker compose up -d
docker compose ps                    # confirm all three are running
docker compose logs -f prometheus      # confirm it started without config errors
```

---

## 3. Path B: Native systemd Install (No Containers)

### Step 1 — Create a dedicated user (services shouldn't run as root)
```bash
sudo useradd --no-create-home --shell /bin/false prometheus
```

### Step 2 — Download and install Prometheus
```bash
cd /tmp
curl -LO https://github.com/prometheus/prometheus/releases/latest/download/prometheus-3.0.0.linux-amd64.tar.gz
tar xzf prometheus-3.0.0.linux-amd64.tar.gz
sudo mkdir -p /etc/prometheus /var/lib/prometheus
sudo cp prometheus-3.0.0.linux-amd64/prometheus /usr/local/bin/
sudo cp prometheus-3.0.0.linux-amd64/promtool /usr/local/bin/
sudo cp -r prometheus-3.0.0.linux-amd64/consoles /etc/prometheus/
sudo cp -r prometheus-3.0.0.linux-amd64/console_libraries /etc/prometheus/
sudo chown -R prometheus:prometheus /etc/prometheus /var/lib/prometheus
```
(Check the actual latest version at github.com/prometheus/prometheus/releases before running this — version numbers age fast.)

### Step 3 — Same `prometheus.yml` as above, placed at `/etc/prometheus/prometheus.yml`

### Step 4 — systemd unit (direct application of your systemd deep-dive guide)
```ini
# /etc/systemd/system/prometheus.service
[Unit]
Description=Prometheus
Wants=network-online.target
After=network-online.target

[Service]
Type=simple
User=prometheus
Group=prometheus
ExecStart=/usr/local/bin/prometheus \
  --config.file=/etc/prometheus/prometheus.yml \
  --storage.tsdb.path=/var/lib/prometheus \
  --web.listen-address=127.0.0.1:9090
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now prometheus
sudo systemctl status prometheus
journalctl -u prometheus -f
```

### Step 5 — node_exporter, same pattern
```bash
cd /tmp
curl -LO https://github.com/prometheus/node_exporter/releases/latest/download/node_exporter-1.8.0.linux-amd64.tar.gz
tar xzf node_exporter-1.8.0.linux-amd64.tar.gz
sudo cp node_exporter-1.8.0.linux-amd64/node_exporter /usr/local/bin/
sudo useradd --no-create-home --shell /bin/false node_exporter
```
```ini
# /etc/systemd/system/node_exporter.service
[Unit]
Description=Node Exporter
After=network.target

[Service]
Type=simple
User=node_exporter
ExecStart=/usr/local/bin/node_exporter
Restart=on-failure

[Install]
WantedBy=multi-user.target
```
```bash
sudo systemctl daemon-reload
sudo systemctl enable --now node_exporter
```

### Step 6 — Grafana (native)
```bash
sudo apt install -y software-properties-common
sudo add-apt-repository "deb https://packages.grafana.com/oss/deb stable main"
curl https://packages.grafana.com/gpg.key | sudo apt-key add -
sudo apt update
sudo apt install grafana -y
sudo systemctl enable --now grafana-server
```

---

## 4. Verifying Prometheus Is Actually Collecting Data

```bash
curl http://localhost:9090/api/v1/query?query=up
```
Or open `http://localhost:9090` in a browser (via SSH tunnel if it's bound to localhost only — see the security section) and go to **Status → Targets**: every scrape target should show `State: UP`. If a target shows `DOWN`, that's your first debugging stop — usually a firewall blocking port 9100, or node_exporter not actually running (`systemctl status node_exporter`).

---

## 5. Connecting Grafana to Prometheus

**Step 1 — Access Grafana** (default login `admin`/`admin`, forces a password change on first login):
```
http://localhost:3000
```

**Step 2 — Add Prometheus as a data source:**
Configuration → Data Sources → Add data source → Prometheus → set URL to `http://localhost:9090` (or `http://prometheus:9090` if Grafana is running as a Docker container on the same Compose network, using the service name instead of localhost) → Save & Test.

**Step 3 — Import a ready-made dashboard instead of building from scratch:**
Dashboards → Import → enter dashboard ID **1860** ("Node Exporter Full," the standard, most widely used community dashboard for exactly this stack) → select your Prometheus data source → Import.

This alone gets you CPU, memory, disk, and network graphs for every monitored host, without writing a single query by hand — a genuinely good starting point before customizing anything.

---

## 6. Basic PromQL — Enough to Be Dangerous

```promql
up                                          # 1 = target is being scraped successfully, 0 = it's down

node_cpu_seconds_total                        # raw counter — rarely useful directly, needs rate()

rate(node_cpu_seconds_total{mode="idle"}[5m])    # CPU idle rate over a 5-min window — the building block for CPU usage %

100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100)   # CPU USAGE %, the query you actually want

node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100    # memory available as a percentage

node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"} * 100    # disk free % on root

rate(node_disk_io_time_seconds_total[5m])       # disk I/O time — the Prometheus equivalent of the iostat %util you already know
```

**The one PromQL concept worth actually internalizing:** most raw metrics are **counters** — they only ever go up (total CPU seconds spent, total bytes received). You almost never graph a counter directly; you wrap it in `rate()` to get "how fast is this increasing," which is what turns a meaningless ever-climbing number into an actual usage rate you can read.

---

## 7. Alerting — Prometheus Rules + Alertmanager

### Step 1 — Define alert rules
```yaml
# /etc/prometheus/alert_rules.yml
groups:
  - name: node_alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU on {{ $labels.instance }}"
          description: "CPU usage above 85% for 5+ minutes"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes{mountpoint="/"} / node_filesystem_size_bytes{mountpoint="/"}) * 100 < 10
        for: 10m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space on {{ $labels.instance }}"
          description: "Root filesystem below 10% free — ties directly to the disk-full failure scenario from your storage guide"

      - alert: HostDown
        expr: up == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "{{ $labels.instance }} is down"
          description: "Prometheus has not been able to scrape this target for 2+ minutes"
```

**Reference this in `prometheus.yml`:**
```yaml
rule_files:
  - "alert_rules.yml"
```
```bash
promtool check rules /etc/prometheus/alert_rules.yml     # validate syntax BEFORE reloading — catches typos early
sudo systemctl reload prometheus
```

**The `for:` field matters as much as the threshold itself:** without it, a single momentary CPU spike fires an alert instantly — `for: 5m` requires the condition to stay true continuously for 5 minutes before it actually fires, filtering out normal noise and only alerting on sustained real problems.

### Step 2 — Alertmanager, for actual notifications
```yaml
# /etc/alertmanager/alertmanager.yml
route:
  receiver: 'default'
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h

receivers:
  - name: 'default'
    # webhook, email, or Slack config goes here — e.g. for Slack:
    slack_configs:
      - api_url: 'https://hooks.slack.com/services/YOUR/WEBHOOK/URL'
        channel: '#alerts'
        send_resolved: true
```
Add to `prometheus.yml`:
```yaml
alerting:
  alertmanagers:
    - static_configs:
        - targets: ['localhost:9093']
```

---

## 8. Securing the Stack

Directly applying your hardening guide's principles to this specific setup:

- **Bind Prometheus/Grafana to `127.0.0.1`**, exactly as done throughout this guide — neither needs to be directly internet-facing.
- **Reach them remotely via SSH tunnel or Tailscale** (from your SSH/remote-access guides), not by opening ports 9090/3000 to the world:
  ```bash
  ssh -L 3000:localhost:3000 -L 9090:localhost:9090 solo@yourserver
  ```
  Then open `http://localhost:3000` on your **local** machine — traffic tunnels securely over the existing SSH connection.
- **Change Grafana's default admin password immediately** on first login — an exposed default-credential Grafana instance is a genuinely common real-world compromise vector.
- **If you do need Grafana reachable more broadly**, put it behind a reverse proxy (nginx) with real TLS and its own auth, rather than exposing Grafana's own port directly.

---

## Quick Reference

```
STACK             node_exporter (metrics source) → Prometheus (scrape+store+alert) → Grafana (visualize)
                    optionally: Alertmanager (routes firing alerts to Slack/email/etc)

DOCKER PATH          docker compose up -d   (see prometheus.yml + docker-compose.yml above)
NATIVE PATH            systemctl enable --now prometheus node_exporter grafana-server

VERIFY SCRAPING          http://localhost:9090 → Status → Targets → all should show UP
CONNECT GRAFANA            Data Sources → Prometheus → http://localhost:9090
FAST DASHBOARD               Import dashboard ID 1860 ("Node Exporter Full")

KEY PROMQL                  rate(node_cpu_seconds_total{mode="idle"}[5m])   → CPU idle rate, the building block for usage %
                              node_filesystem_avail_bytes{mountpoint="/"}     → disk free bytes

ALERT RULE TEST                promtool check rules /etc/prometheus/alert_rules.yml
ACCESS SECURELY                  ssh -L 3000:localhost:3000 -L 9090:localhost:9090 <host>   (never expose directly)
```
