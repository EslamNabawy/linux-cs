# Important Files Worth Generating on a Linux / Dev System

A priority-ranked list of config files that are worth deliberately creating rather than leaving at system defaults — organized by what they control.

**Priority key:** 🔴 essential · 🟡 strongly recommended · ⚪ situational

---

## 1. Shell Configuration

| File | Priority | Purpose |
|---|---|---|
| `~/.bashrc` | 🔴 | Aliases, functions, `$PATH` additions, prompt customization — loaded for every interactive non-login shell |
| `~/.bash_profile` or `~/.profile` | 🟡 | Loaded once at login — usually just sources `.bashrc` and sets login-only environment vars |
| `~/.bash_aliases` | ⚪ | Optional split-out file for aliases, sourced from `.bashrc` to keep it clean |
| `~/.zshrc` | ⚪ | Same role as `.bashrc`, if you're on zsh instead |

```bash
# ~/.bashrc essentials
export PATH="$HOME/.local/bin:$PATH"
alias ll='ls -la'
alias gs='git status'
export EDITOR=vim
```

---

## 2. Editor Configuration

| File | Priority | Purpose |
|---|---|---|
| `~/.vimrc` | 🔴 | Vim defaults — line numbers, indentation, search behavior (full config in your vim-nano guide) |
| `~/.nanorc` | 🟡 | Nano defaults — syntax highlighting, tab behavior |

---

## 3. Git Configuration

| File | Priority | Purpose |
|---|---|---|
| `~/.gitconfig` | 🔴 | Global identity, default editor, aliases — set once per machine |
| `.gitignore` (per project) | 🔴 | Prevents build artifacts, secrets, and local config from ever being committed |
| `.gitattributes` (per project) | 🟡 | Normalizes line endings across contributors, marks files as binary, controls diff behavior |
| `~/.gitignore_global` | ⚪ | OS/editor cruft (`.DS_Store`, `.vscode/`) ignored across *all* your repos, not just one |

```bash
# ~/.gitconfig
[user]
    name = SOLO
    email = your@email.com
[core]
    editor = vim
[init]
    defaultBranch = main
```

```gitignore
# .gitignore — Flutter project baseline
.dart_tool/
.packages
build/
.env
*.log
```

---

## 4. SSH Configuration

| File | Priority | Purpose |
|---|---|---|
| `~/.ssh/config` | 🔴 | Per-host shortcuts (`ssh myserver` instead of a long flag string), key selection, connection reuse |
| `~/.ssh/authorized_keys` | 🔴 | On a server — which public keys are allowed to log in as that user |
| `~/.ssh/id_ed25519` (+ `.pub`) | 🔴 | Your actual keypair — generate with `ssh-keygen -t ed25519`, never share the private half |

```
# ~/.ssh/config
Host myserver
    HostName 192.168.1.100
    User solo
    IdentityFile ~/.ssh/id_ed25519
    Port 22
```

---

## 5. Environment & Secrets

| File | Priority | Purpose |
|---|---|---|
| `.env` (per project) | 🔴 | API keys, DB URLs, local secrets — **must** be in `.gitignore**`, never committed |
| `.env.example` | 🟡 | Committed template showing which variables are needed, with placeholder values |
| `~/.netrc` | ⚪ | Auto-login credentials for tools like `curl`/`ftp` — keep permissions at `600` |

---

## 6. System-Level Config (root-owned — edit with care, see your failure-scenarios guide)

| File | Priority | Purpose |
|---|---|---|
| `/etc/hosts` | 🟡 | Manual hostname → IP mappings, useful for local dev domains |
| `/etc/fstab` | 🟡 | Defines what gets mounted at boot — get this wrong and the system can fail to boot |
| `/etc/hostname` | ⚪ | The machine's hostname |
| `/etc/environment` | ⚪ | System-wide environment variables (not shell-specific, applies to all users) |
| `/etc/ssh/sshd_config` | 🟡 | Server-side SSH daemon config — disable password auth here once keys work |
| `/etc/sudoers` | 🔴 (edit only via `visudo`) | Who can run what as root — a syntax error here can lock you out of `sudo` entirely |

---

## 7. Service / Automation Files

| File | Priority | Purpose |
|---|---|---|
| `/etc/systemd/system/myapp.service` | 🟡 | Defines a custom background service — start on boot, auto-restart on crash |
| Crontab (`crontab -e`) | 🟡 | Scheduled recurring jobs — not a manually-created file path, edited through the command |
| `~/.config/systemd/user/*.service` | ⚪ | User-level (no root needed) systemd services |

```ini
# /etc/systemd/system/myapp.service
[Unit]
Description=My App
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/myapp/main.py
Restart=on-failure
User=solo

[Install]
WantedBy=multi-user.target
```

---

## 8. Project-Level Dev Files

| File | Priority | Purpose |
|---|---|---|
| `README.md` | 🔴 | What the project is, how to run it — the first thing anyone (including future you) reads |
| `.gitignore` | 🔴 | (see above) |
| `LICENSE` | 🟡 | Legal terms for reuse — matters the moment a repo goes public |
| `CHANGELOG.md` | ⚪ | Human-readable version history, especially valuable once you're shipping releases |
| `.editorconfig` | 🟡 | Enforces consistent indentation/line-endings across every editor/IDE a contributor might use |
| `Dockerfile` | 🟡 | Reproducible build/run environment for the project |
| `docker-compose.yml` | 🟡 | Multi-service local dev stack (app + DB + cache in one command) |
| `.dockerignore` | 🟡 | Keeps build context small — mirrors `.gitignore`'s role but for Docker builds |
| `pubspec.yaml` | 🔴 (Flutter) | Dependencies, assets, and metadata for any Flutter project |
| `analysis_options.yaml` | 🟡 (Flutter/Dart) | Lint rules — catches style/bug issues before they ship |

---

## 9. AIOps / Automation-Specific

Relevant given your current track:

| File | Priority | Purpose |
|---|---|---|
| `prometheus.yml` | 🟡 | Defines what Prometheus scrapes and how often — the backbone of most monitoring setups |
| Grafana provisioning YAML (`dashboards.yml`, `datasources.yml`) | ⚪ | Version-controls your dashboards instead of clicking them into existence by hand |
| Ansible inventory (`inventory.ini`) + playbooks (`*.yml`) | ⚪ | Declarative server config — the "generate once, apply everywhere" pattern AIOps leans on heavily |
| n8n workflow export (`workflow.json`) | ⚪ | Lets you version-control and re-import your automation flows instead of them living only in the n8n UI |

---

## Quick Priority Summary

**Set these up on day one of any new machine:** `.bashrc`, `.vimrc`, `.gitconfig`, `~/.ssh/config` + keypair, `/etc/sudoers` awareness (don't need to edit it, just know it exists).

**Set these up on day one of any new project:** `README.md`, `.gitignore`, `.env` + `.env.example`.

**Set these up the moment you deploy something that should survive a reboot or crash:** a systemd unit file, and if it needs monitoring, `prometheus.yml`.
