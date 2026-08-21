# tmux & screen — Sessions That Survive a Disconnect

The single fix for the most annoying problem in remote server work: close your laptop, lose wifi, or get disconnected mid-SSH-session, and whatever was running just dies with it. Both tools solve this the same way — by running your actual work in a session on the **server**, independent of your SSH connection, that you can detach from and reattach to later.

---

## 0. Why This Matters, Concretely

Without tmux/screen, running something long on a remote box means the SSH connection itself has to survive the entire duration — a laptop going to sleep, a wifi drop, or a closed terminal kills the process along with it. This has directly mattered in every SSH-based guide so far in this series: a long-running `dd` copy, a Docker Compose stack you're watching logs on, an Ansible playbook against a large fleet, or `journalctl -f` output you want to leave running while you do something else.

**The fix:** start the work inside a tmux/screen session on the server. Detach whenever (deliberately, or by accident via disconnect) — the session and everything running in it keeps going. Reattach later, from the same machine or a different one entirely, and it's exactly where you left it.

---

## 1. tmux — The Modern Standard

```bash
sudo apt install tmux -y
```

### Core concepts
```
Session   →  a full workspace, can contain multiple windows
  └─ Window   →  like a tab, can contain multiple panes
       └─ Pane    →  a split section of a window, each running its own shell
```

### The prefix key
Every tmux command starts with a **prefix** — by default `Ctrl+b`, pressed and released, *then* followed by the actual command key. This guide writes it as `Prefix + <key>`.

### Starting & basic session management
```bash
tmux                          # start a new, unnamed session
tmux new -s mysession           # start a new session with a specific name — DO THIS, unnamed sessions are annoying to find later
tmux ls                          # list all sessions currently running on this machine
tmux attach -t mysession           # reattach to a specific named session
tmux attach                          # attach to the most recent session if only one exists
tmux kill-session -t mysession         # terminate a session entirely
```

### Detaching (the whole point)
```
Prefix + d      → detach from the current session, leaving it running in the background
```
You're now back at your normal shell — the session (and everything running inside it) keeps going untouched. **Simply closing your terminal or losing your SSH connection has the same practical effect as `Prefix + d`** — tmux doesn't care *how* you left, the session survives either way.

### Windows (tabs within a session)
| Command | Effect |
|---|---|
| `Prefix + c` | create a new window |
| `Prefix + ,` | rename the current window (do this, it makes `tmux ls`/window-switching sane) |
| `Prefix + n` | next window |
| `Prefix + p` | previous window |
| `Prefix + 0`–`9` | jump directly to window number 0–9 |
| `Prefix + w` | interactive window list/picker |
| `Prefix + &` | close the current window (asks for confirmation) |

### Panes (splits within a window)
| Command | Effect |
|---|---|
| `Prefix + %` | split vertically (side by side) |
| `Prefix + "` | split horizontally (stacked) |
| `Prefix + arrow key` | move between panes |
| `Prefix + o` | cycle to the next pane |
| `Prefix + z` | zoom the current pane to fullscreen (toggle again to un-zoom) — great for temporarily focusing without losing the layout |
| `Prefix + x` | close the current pane (asks for confirmation) |
| `Prefix + Ctrl+arrow` | resize the current pane |

**Practical layout example:** split a window three ways to watch a deploy — one pane running `journalctl -u myapp -f`, another running `docker stats`, a third free for actually running commands. All three stay visible simultaneously, and the whole layout survives a detach/reattach exactly as arranged.

### Copy mode — scrolling back and copying text
```
Prefix + [        → enter copy mode (lets you scroll up with arrow keys / Page Up)
q                    → exit copy mode
```
Inside copy mode: move the cursor, press `Space` to start a selection, move again, then `Enter` to copy it into tmux's own buffer.
```
Prefix + ]        → paste tmux's copied buffer
```

### Configuration — `~/.tmux.conf`
```bash
# ~/.tmux.conf

# Change prefix from Ctrl+b to Ctrl+a (more ergonomic for many people, matches old screen muscle memory)
set -g prefix C-a
unbind C-b
bind C-a send-prefix

# Start window/pane numbering at 1, not 0 — matches keyboard number row order
set -g base-index 1
setw -g pane-base-index 1

# Mouse support — click to switch panes, drag to resize, scroll to scroll back
set -g mouse on

# Increase scrollback buffer size (default is quite small)
set -g history-limit 10000

# Faster escape time — noticeable input lag fix for vim users inside tmux
set -sg escape-time 0

# Status bar — show session name, host, and time
set -g status-left "#[bold]#S "
set -g status-right "%Y-%m-%d %H:%M"
```
Reload a config change without restarting tmux:
```
Prefix + :source-file ~/.tmux.conf
```

---

## 2. screen — The Older Alternative, Still Worth Knowing

`screen` predates tmux and is simpler/more limited (no built-in status bar, weaker scripting), but it's genuinely still present by default on more minimal/older systems where tmux might not be installed — worth knowing the basics even if tmux is your daily driver.

```bash
sudo apt install screen -y
```

### Basic session management
```bash
screen                        # start a new, unnamed session
screen -S mysession             # start a new NAMED session
screen -ls                        # list running sessions
screen -r mysession                 # reattach to a named session
screen -r                             # reattach if only one session exists
screen -d -r mysession                  # force-detach it from anywhere else it's attached, then reattach here (useful if you forgot you left it attached on another terminal)
```

### Detaching
```
Ctrl+a  d      → detach (screen's prefix is Ctrl+a, not Ctrl+b — note the difference from tmux's default)
```

### Windows
| Command | Effect |
|---|---|
| `Ctrl+a  c` | create a new window |
| `Ctrl+a  n` | next window |
| `Ctrl+a  p` | previous window |
| `Ctrl+a  "` | interactive window list |
| `Ctrl+a  A` | rename the current window |

### Basic splits (screen's split support is more limited than tmux's)
```
Ctrl+a  S      → split horizontally
Ctrl+a  |       → split vertically (newer screen versions)
Ctrl+a  Tab       → switch between splits
```

---

## 3. tmux vs screen — Direct Comparison

| | tmux | screen |
|---|---|---|
| Default prefix | `Ctrl+b` | `Ctrl+a` |
| Pane splitting | Full support, flexible, resizable | Present but more limited/clunkier |
| Scripting/automation | Strong (`tmux send-keys`, scriptable session setup) | Weaker |
| Status bar | Built-in, customizable | Not built-in |
| Mouse support | Yes (`set -g mouse on`) | Limited |
| Active development | Yes | Largely maintenance-only at this point |
| Availability | Needs installing on most distros | Sometimes present by default already, especially on older/minimal systems |

**Practical takeaway:** learn tmux as your daily driver — it's more capable and what most current documentation/dotfiles assume. Recognize screen's basics for the occasional older box where it's the only one already installed and you don't want to bother installing tmux for a two-minute task.

---

## 4. Practical Workflow — Tying This Into Your Existing Guides

**Running a long Ansible playbook against your fleet without babysitting the SSH connection:**
```bash
tmux new -s ansible-run
ansible-playbook -i inventory.ini site.yml
# Prefix + d to detach, close your laptop, walk away
# later, from anywhere:
tmux attach -t ansible-run
```

**Watching a Docker Compose monitoring stack while working on something else:**
```bash
tmux new -s monitoring
Prefix + %                          # split the window
# left pane:
docker compose logs -f
# Prefix + Right arrow to move to the right pane, then:
docker stats
```

**A `dd` disk copy or large `rsync` that would otherwise die on disconnect:**
```bash
tmux new -s backup
sudo rsync -avh /home/ /mnt/backup-drive/
# Prefix + d — this now survives your SSH connection dropping entirely
```

---

## Quick Reference

```
START NAMED SESSION      tmux new -s <name>
LIST SESSIONS               tmux ls
REATTACH                      tmux attach -t <name>
DETACH                          Prefix + d          (tmux default prefix: Ctrl+b)

WINDOWS                          Prefix + c (new)   Prefix + n/p (next/prev)   Prefix + , (rename)
PANES                              Prefix + % (vert split)   Prefix + " (horiz split)   Prefix + arrow (move)
ZOOM A PANE                          Prefix + z
COPY MODE                              Prefix + [   then Space to select, Enter to copy   Prefix + ] to paste

SCREEN EQUIVALENT                        screen -S <name>   /   screen -r <name>   /   Ctrl+a d to detach

RULE OF THUMB: if it's going to run longer than you're willing to babysit an SSH
connection for, start it inside a named tmux session first — always.
```
