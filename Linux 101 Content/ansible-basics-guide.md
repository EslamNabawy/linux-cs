# Ansible Basics — Write Once, Apply to Every Server

The core AIOps pattern: describe the state you want, run it against one server or a thousand, and Ansible figures out what actually needs to change.

---

## 0. What Makes Ansible Different

- **Agentless** — no software to install on target servers, just SSH access and Python. Compare this to tools that need a persistent agent daemon running everywhere.
- **Push-based** — you run Ansible from a control machine, it connects out to targets and applies changes. (Contrast with pull-based tools where each server checks in for its own config.)
- **Declarative** — you describe the *desired end state* ("nginx should be installed and running"), not a sequence of imperative steps ("run apt install, then run systemctl start").
- **Idempotent** — running the same playbook 100 times produces the same result as running it once. If nginx is already installed and running, Ansible recognizes that and does nothing on the second run — this is the property that makes it safe to re-run constantly, which is the entire point.

---

## 1. Installation

```bash
sudo apt install ansible -y      # on the CONTROL machine only — targets need nothing installed
ansible --version
```

**Prerequisite on every target server:** SSH access (ideally key-based, per your SSH guide) and Python 3 present — which is true by default on virtually every mainstream distro already.

---

## 2. Inventory — Defining What "Every Server" Means

The inventory file lists the servers Ansible manages, optionally grouped.

### Basic static inventory (INI-style)
```ini
# inventory.ini

[webservers]
web1 ansible_host=203.0.113.10
web2 ansible_host=203.0.113.11

[databases]
db1 ansible_host=203.0.113.20

[all:vars]
ansible_user=solo
ansible_ssh_private_key_file=~/.ssh/id_ed25519
```

### YAML inventory (more common in real-world setups now)
```yaml
# inventory.yml
all:
  children:
    webservers:
      hosts:
        web1:
          ansible_host: 203.0.113.10
        web2:
          ansible_host: 203.0.113.11
    databases:
      hosts:
        db1:
          ansible_host: 203.0.113.20
  vars:
    ansible_user: solo
    ansible_ssh_private_key_file: ~/.ssh/id_ed25519
```

### Testing connectivity to your inventory
```bash
ansible all -i inventory.ini -m ping
```
This isn't ICMP ping — it's Ansible's own module that confirms it can actually SSH in and run Python on every host. This is the very first thing to run against any new inventory, before attempting anything real.

---

## 3. Ad-Hoc Commands — One-Off Tasks Without a Playbook

For quick, single actions across your whole fleet, without writing a file:

```bash
ansible webservers -i inventory.ini -m ping
ansible webservers -i inventory.ini -a "uptime"                          # -a runs a raw shell command
ansible webservers -i inventory.ini -m apt -a "name=nginx state=present" --become   # install nginx everywhere in the group
ansible all -i inventory.ini -m command -a "df -h"                          # disk usage across the whole fleet, one command
```
`--become` = escalate privileges (the Ansible equivalent of `sudo`) for that task.

**Ad-hoc commands are for quick checks/fixes — anything you'd want to repeat, version-control, or reason about later belongs in a playbook instead.**

---

## 4. Playbooks — The Real Unit of Work

A playbook is a YAML file describing a set of tasks to apply to a set of hosts.

### Anatomy of a basic playbook
```yaml
# webserver-setup.yml
---
- name: Configure web servers
  hosts: webservers
  become: true

  tasks:
    - name: Install nginx
      apt:
        name: nginx
        state: present
        update_cache: true

    - name: Ensure nginx is running and enabled
      service:
        name: nginx
        state: started
        enabled: true

    - name: Copy custom index page
      copy:
        src: files/index.html
        dest: /var/www/html/index.html
        owner: www-data
        group: www-data
        mode: '0644'
```

```bash
ansible-playbook -i inventory.ini webserver-setup.yml
```

### Reading the structure
- `hosts:` — which inventory group (or host, or `all`) this play targets
- `become:` — whether tasks need elevated privileges
- `tasks:` — the ordered list of actions, each using a **module** (`apt`, `service`, `copy`, etc.) with parameters

### The idempotency payoff, made concrete
Run the playbook above a second time immediately: Ansible checks nginx's actual installed state, actual running state, and the actual content/checksum of `index.html` — and reports **"ok"** (no change) for anything already matching the desired state, only reporting **"changed"** for things that genuinely needed to change. This is what makes it safe to run constantly (e.g. via a systemd timer, tying back to your timers guide) rather than something you have to remember to run carefully by hand.

---

## 5. Variables

### Inline in a playbook
```yaml
- name: Configure app
  hosts: webservers
  vars:
    app_port: 8080
    app_env: production
  tasks:
    - name: Print the port
      debug:
        msg: "App runs on port {{ app_port }}"
```

### `group_vars` and `host_vars` — the scalable pattern for real projects
```
inventory.ini
group_vars/
  webservers.yml       # applies to every host in the "webservers" group
  all.yml                # applies to EVERY host, regardless of group
host_vars/
  web1.yml                 # applies ONLY to the specific host "web1"
```
```yaml
# group_vars/webservers.yml
app_port: 8080
nginx_worker_processes: 4
```
Ansible loads these automatically based on filename matching group/host names — no explicit include needed. This is the real-world way variables are organized once an inventory grows beyond a handful of hosts.

### Variable precedence (simplified, most to least specific wins)
```
host_vars  >  group_vars  >  playbook vars  >  role defaults
```

---

## 6. Templates — Dynamic Config Files with Jinja2

Instead of copying a static file, generate one per-host from a template using variables.

```jinja2
# templates/nginx.conf.j2
server {
    listen {{ app_port }};
    server_name {{ inventory_hostname }};

    location / {
        proxy_pass http://127.0.0.1:{{ backend_port }};
    }
}
```

```yaml
- name: Deploy nginx config from template
  template:
    src: templates/nginx.conf.j2
    dest: /etc/nginx/sites-available/myapp.conf
  notify: Reload nginx
```

`{{ inventory_hostname }}` is a built-in variable — automatically the current host's name in the inventory, no need to define it yourself. Every host gets a config generated with **its own** values, from one shared template.

---

## 7. Handlers — Restart Only When Something Actually Changed

A handler is a task that only runs if explicitly **notified** by another task that reported a real change — avoiding unnecessary restarts on every single run.

```yaml
tasks:
  - name: Deploy nginx config
    template:
      src: templates/nginx.conf.j2
      dest: /etc/nginx/sites-available/myapp.conf
    notify: Reload nginx

handlers:
  - name: Reload nginx
    service:
      name: nginx
      state: reloaded
```
**Why this matters:** without this pattern, you'd either reload nginx on every playbook run (wasteful, briefly disruptive) or forget to reload it at all when the config actually changes (config drift). The handler only fires when the `template` task above reports `changed`, and even if 5 different tasks notify the same handler, it only runs **once** at the end of the play — not once per notification.

---

## 8. Conditionals & Loops

### Conditionals
```yaml
- name: Install a package only on Debian-based systems
  apt:
    name: nginx
    state: present
  when: ansible_facts['os_family'] == "Debian"
```

### Loops
```yaml
- name: Create multiple directories
  file:
    path: "{{ item }}"
    state: directory
  loop:
    - /opt/myapp/logs
    - /opt/myapp/data
    - /opt/myapp/config
```

### Combining both
```yaml
- name: Install packages, only if not already listed as present
  apt:
    name: "{{ item }}"
    state: present
  loop:
    - nginx
    - fail2ban
    - unattended-upgrades
  when: ansible_facts['os_family'] == "Debian"
```

---

## 9. Roles — Reusable, Shareable Structure

Once a playbook grows past a handful of tasks, split it into a **role** — a standardized directory structure Ansible understands automatically.

```
roles/
  webserver/
    tasks/main.yml         # the actual task list
    handlers/main.yml       # handlers
    templates/                # Jinja2 templates
    files/                     # static files to copy
    defaults/main.yml            # default variable values (lowest precedence, easily overridden)
    vars/main.yml                  # role-specific variables (higher precedence)
```

```yaml
# site.yml — using the role
- name: Configure all web servers
  hosts: webservers
  become: true
  roles:
    - webserver
    - firewall
    - monitoring
```

This is what "write once, apply to every server" really means at scale — a `webserver` role written once can be applied across every project/inventory that needs a web server, versioned and shared like any other code.

---

## 10. Ansible Vault — Handling Secrets Properly

Never put real passwords/API keys/keys in plain playbook variables that get committed to git. Vault encrypts a file (or specific values) so secrets can live safely in version control.

```bash
ansible-vault create secrets.yml          # create a new encrypted file, prompts for a password
ansible-vault edit secrets.yml               # edit it later — decrypts, opens editor, re-encrypts on save
ansible-vault view secrets.yml                # view without editing
ansible-vault encrypt existing_vars.yml         # encrypt a file that already exists
```

```bash
ansible-playbook -i inventory.ini site.yml --ask-vault-pass    # prompts for the vault password at run time
ansible-playbook -i inventory.ini site.yml --vault-password-file ~/.vault_pass    # or read it from a file (keep THAT file out of git too)
```

---

## 11. Practical Example — A Real Hardening Playbook

Ties together several earlier guides (firewall, fail2ban, unattended-upgrades) into one applyable playbook:

```yaml
---
- name: Baseline server hardening
  hosts: all
  become: true

  tasks:
    - name: Install core security packages
      apt:
        name:
          - ufw
          - fail2ban
          - unattended-upgrades
        state: present
        update_cache: true

    - name: Set ufw default deny incoming
      ufw:
        direction: incoming
        policy: deny

    - name: Allow SSH through ufw
      ufw:
        rule: limit
        port: '2222'
        proto: tcp

    - name: Enable ufw
      ufw:
        state: enabled

    - name: Deploy fail2ban jail.local from template
      template:
        src: templates/jail.local.j2
        dest: /etc/fail2ban/jail.local
      notify: Restart fail2ban

    - name: Ensure fail2ban is enabled and running
      service:
        name: fail2ban
        state: started
        enabled: true

    - name: Enable unattended-upgrades
      copy:
        content: |
          APT::Periodic::Update-Package-Lists "1";
          APT::Periodic::Unattended-Upgrade "1";
        dest: /etc/apt/apt.conf.d/20auto-upgrades

  handlers:
    - name: Restart fail2ban
      service:
        name: fail2ban
        state: restarted
```

Run this against your entire fleet with one command, and every server ends up in the exact same hardened state — re-run it any time to confirm nothing's drifted.

---

## 12. Common Modules Reference

| Module | Purpose |
|---|---|
| `apt` / `yum` / `dnf` | package management |
| `service` / `systemd` | manage services |
| `copy` | copy a static file to the target |
| `template` | render a Jinja2 template to the target |
| `file` | manage file/directory state, permissions |
| `user` / `group` | manage system users/groups |
| `lineinfile` | ensure a specific line exists (or doesn't) in a file — great for surgical config edits |
| `command` / `shell` | run an arbitrary command (prefer a proper module when one exists — it's what gives you idempotency) |
| `debug` | print a variable/message, useful for troubleshooting a playbook |
| `git` | clone/update a git repository |
| `docker_container` | manage Docker containers (needs the community.docker collection) |

**Important idiom:** prefer a dedicated module (`apt`, `service`, `copy`) over `command`/`shell` whenever one exists — dedicated modules understand desired state and are properly idempotent; `command`/`shell` just blindly runs a command every single time, re-doing work that didn't need doing and potentially erroring on a second run.

---

## 13. Running, Checking & Debugging

```bash
ansible-playbook -i inventory.ini site.yml --check          # DRY RUN — shows what WOULD change, changes nothing
ansible-playbook -i inventory.ini site.yml --diff             # show the actual before/after diff for changed files
ansible-playbook -i inventory.ini site.yml -v                   # verbose (stack -vv, -vvv for more detail)
ansible-playbook -i inventory.ini site.yml --limit web1            # run against just one host from the inventory
ansible-playbook -i inventory.ini site.yml --tags "firewall"         # run only tasks tagged "firewall"
```

**`--check` is worth using as a habit** before applying anything new or edited to a production fleet — it's the equivalent of `ufw`'s dry-run pattern from earlier guides, catching surprises before they actually happen.

---

## Quick Reference

```
TEST CONNECTIVITY    ansible all -i inventory.ini -m ping
AD-HOC COMMAND         ansible <group> -i inventory.ini -a "<command>"
RUN A PLAYBOOK           ansible-playbook -i inventory.ini <playbook>.yml
DRY RUN                    ansible-playbook -i inventory.ini <playbook>.yml --check --diff
LIMIT TO ONE HOST            ansible-playbook -i inventory.ini <playbook>.yml --limit <host>
VAULT A SECRETS FILE           ansible-vault create secrets.yml

STRUCTURE
  inventory.ini / inventory.yml    → who
  group_vars/ , host_vars/          → what values apply where
  playbook.yml                       → what to do
  roles/<name>/tasks/main.yml         → reusable, shareable "what to do"
  templates/*.j2                        → dynamic config, rendered per-host

CORE PRINCIPLE: idempotent, declarative, agentless — describe the end state,
run it as often as you want, only real changes ever get applied.
```
