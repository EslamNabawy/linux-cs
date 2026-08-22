const DATA = {
  "categories": [
    {
      "id": "navigation",
      "title": "File & Directory Navigation",
      "icon": "folder",
      "commands": [
        {
          "command": "pwd",
          "description": "Print working directory",
          "example": "pwd",
          "notes": "Useful in scripts to get absolute paths — combine with $(pwd).  Tip: in scripts prefer $(pwd) — `echo \"Running in $(pwd)\"` — and `pwd -P` resolves symlinks vs `pwd -L`."
        },
        {
          "command": "ls",
          "description": "List directory contents",
          "example": "ls -la",
          "notes": "-a shows dotfiles (.bashrc etc.); -h with -l gives human-readable sizes.  Try `ls -lhtr` (human, time, reverse) and `ls -li` to see inodes. For spaces: `ls -b` escapes them."
        },
        {
          "command": "cd",
          "description": "Change directory",
          "example": "cd /var/log",
          "notes": "cd - jumps back to previous directory; cd alone goes home.  `cd -` is a stack of 1 — use `pushd`/`popd` or `cd $OLDPWD` for more. `cd` with no arg is `cd $HOME`."
        },
        {
          "command": "tree",
          "description": "List contents in a tree-like format",
          "example": "tree -L 2",
          "notes": "Not installed by default — sudo apt install tree.  If missing: `sudo apt install tree` or fallback `find . -maxdepth 2 -type d | sort` (faster, no color)."
        }
      ]
    },
    {
      "id": "manipulation",
      "title": "File Manipulation",
      "icon": "file",
      "commands": [
        {
          "command": "touch",
          "description": "Create an empty file / update timestamp",
          "example": "touch newfile.txt",
          "notes": "If the file exists, it only updates the modified timestamp — no data is lost.  For spaces: `touch \"my file.txt\"` — and `touch -- -dashfile` creates a file starting with dash. `touch -t 202501010101 file` sets timestamp."
        },
        {
          "command": "mkdir",
          "description": "Make a directory",
          "example": "mkdir -p dir/subdir",
          "notes": "Without -p, it fails if parent directories don't already exist.  Quote parents with spaces: `mkdir -p \"My Projects/src\"` — without -p fails if parent missing."
        },
        {
          "command": "cp",
          "description": "Copy files/directories",
          "example": "cp -r source_dir/ dest_dir/",
          "notes": "-r is required for directories; use -i to get a prompt before overwriting.  Use `cp -a` to preserve perms/symlinks (archive). For safety: `cp -i` prompts, `cp -n` no-clobber. Never `cp -r /etc/* /` without verify."
        },
        {
          "command": "mv",
          "description": "Move or rename files",
          "example": "mv oldname.txt newname.txt",
          "notes": "No -i prompt by default — silently overwrites an existing destination file.  Add `-i` to prompt before overwrite. Across filesystems `mv` copies+deletes — use `rsync --remove-source-files` for large moves."
        },
        {
          "command": "rm",
          "description": "Remove files/directories",
          "example": "rm -rf folder/",
          "notes": "There is no Recycle Bin. rm -rf is permanent and irreversible — double-check the path.  Danger: `rm -rf /tmp/*` OK, but `rm -rf / tmp/*` (space) = disaster. Use `rm -- -file` for dash files. Check with `ls` first, or `trash-put`."
        }
      ]
    },
    {
      "id": "viewing",
      "title": "Viewing & Editing Text",
      "icon": "eye",
      "commands": [
        {
          "command": "cat",
          "description": "Concatenate and print file content",
          "example": "cat file.txt",
          "notes": "Not ideal for huge files — it dumps everything at once; use less instead.  For numbers: `cat -n file` or better `nl -ba`. For large: `less` or `bat` (syntax). `cat file1 file2 > combined` is its true concatenate use."
        },
        {
          "command": "less",
          "description": "View file content page by page",
          "example": "less largefile.log",
          "notes": "/searchterm searches forward, n repeats the search — much better than more.  Inside less: `g` top, `G` bottom, `/error` + `n` next, `N` prev, `F` follow (like tail -F). Quieter than `more`."
        },
        {
          "command": "head/tail",
          "description": "View first/last lines of a file",
          "example": "tail -f app.log",
          "notes": "-f is the go-to for watching live logs; Ctrl+C to stop following.  `tail -n +5 file` from line 5 onward. `head -c 100` first bytes. For live: `tail -F` follows across rotations (better than -f)."
        },
        {
          "command": "grep",
          "description": "Search text within files",
          "example": "grep -i \"error\" /var/log/syslog",
          "notes": "-r for recursive search, -n for line numbers, -v to invert (exclude matches).  Speed: `grep -F \"literal\"` (fixed) 10× faster than regex. Limit scope: `grep -R --include=\"*.conf\"`. Use `grep -n` for line numbers."
        },
        {
          "command": "nano/vim",
          "description": "Terminal text editors",
          "example": "nano config.yaml",
          "notes": "nano is beginner-friendly; vim has a steeper curve — :q! quits without saving.  nano: `Ctrl+O` write, `Ctrl+X` exit. vim: `vim -R` read-only, `:%s/old/new/gc` with confirm. For quick edit, `nano` is safest."
        }
      ]
    },
    {
      "id": "system",
      "title": "System & Process Management",
      "icon": "cpu",
      "commands": [
        {
          "command": "top/htop",
          "description": "Interactive process viewer",
          "example": "htop",
          "notes": "htop is friendlier and color-coded but usually needs installing separately.  Press `1` in top/htop to see per-CPU. `htop` → `F6` sort, `k` kill, `u` filter user. For batch: `ps aux --sort=-%cpu | head`."
        },
        {
          "command": "ps",
          "description": "Snapshot of current processes",
          "example": "ps aux | grep python",
          "notes": "aux shows all processes for all users, not just yours — combine with grep to filter.  `ps -ef --forest` or `ps auxf` shows tree. Combine: `ps aux --sort=-%mem | head -n 10` for memory hogs."
        },
        {
          "command": "kill",
          "description": "Terminate a process by PID",
          "example": "kill -9 1234",
          "notes": "-9 force-kills without letting the process clean up — try plain kill (SIGTERM) first.  Try `kill -TERM 1234` (15) first, then `kill -KILL` (9) only if needed — -9 skips cleanup. Find PID via `pgrep -a python`."
        },
        {
          "command": "systemctl",
          "description": "Manage system services",
          "example": "sudo systemctl restart nginx",
          "notes": "Use systemctl status service_name to check if something actually started correctly.  Check first: `systemctl status nginx` — `enabled` vs `active`. `systemctl is-enabled` vs `is-active`. Logs via `journalctl -u nginx -f`."
        },
        {
          "command": "df",
          "description": "Disk space usage",
          "example": "df -h",
          "notes": "Checks whole filesystems/partitions — good first check when you get 'no space left on device'.  Inodes matter too: `df -i` — “No space left” can be inode exhaustion, not bytes. Bind mounts skew `df` — use `findmnt`."
        },
        {
          "command": "du",
          "description": "Directory space usage",
          "example": "du -sh /var/log",
          "notes": "Without -s it recursively lists every subfolder's size — can be slow on large trees.  `du -sh --max-depth=1 /var` limits depth (fast). `du -sh * | sort -rh` finds biggest. For interactive: `ncdu`."
        }
      ]
    },
    {
      "id": "networking",
      "title": "Networking & Permissions",
      "icon": "network",
      "commands": [
        {
          "command": "chmod",
          "description": "Change file permissions",
          "example": "chmod +x script.sh",
          "notes": "Never use chmod 777 casually — it grants everyone full read/write/execute access.  Numeric vs symbolic: `chmod 644 file` (= rw-r--r--) vs `chmod u+x,go-w`. Check `umask 022` — default perms. Never 777 on web roots — use 755/644."
        },
        {
          "command": "chown",
          "description": "Change file owner",
          "example": "sudo chown user:group file.txt",
          "notes": "Usually requires sudo; changing ownership on system files can break services.  Recursive danger: `chown -R user:group /` breaks system. Always verify with `ls -ld` first. For groups: `chgrp` is clearer."
        },
        {
          "command": "ip",
          "description": "Show/manipulate IP addresses",
          "example": "ip a",
          "notes": "Replaces the older, deprecated ifconfig on most modern distros.  Modern: `ip -br a` brief, `ip route` default gw, `ss -tulpn` replaces `netstat`. `ifconfig` is deprecated — use `ip`."
        },
        {
          "command": "curl",
          "description": "Transfer data from URLs",
          "example": "curl -O https://example.com/file.zip",
          "notes": "-O saves with the remote filename; add -L to follow redirects.  Add `-L` to follow redirects (`curl -L -O https://.../file.zip`). For headers: `-I`. Never `curl http://x | bash` without `-sSf` + verify."
        },
        {
          "command": "ssh",
          "description": "Secure shell remote login",
          "example": "ssh username@192.168.1.10",
          "notes": "Add -p PORT for a non-default port; key-based auth (ssh-keygen) is safer than passwords.  Generate ed25519: `ssh-keygen -t ed25519 -C \"host\"` — safer than RSA. Disable root: `PermitRootLogin no` in sshd_config."
        }
      ]
    },
    {
      "id": "archiving",
      "title": "Archiving & Compression",
      "icon": "folder",
      "commands": [
        {
          "command": "tar",
          "description": "Archive files into a tarball",
          "example": "tar -czvf archive.tar.gz folder/",
          "notes": "-c create, -z gzip, -v verbose, -f file. Use -x to extract: tar -xzvf archive.tar.gz.  Preserve perms: `tar -p -czf`. Danger absolute: `tar -czf backup.tar.gz -P /etc` stores leading / — restores can overwrite. Omit -P to make relative."
        },
        {
          "command": "gzip/gunzip",
          "description": "Compress or decompress files",
          "example": "gzip file.log",
          "notes": "gzip replaces the file with file.log.gz; use -k to keep the original, gunzip to reverse.  Keep original: `gzip -k file.log` (keep) vs default replaces. Test: `gzip -t file.gz` verifies integrity."
        },
        {
          "command": "zip/unzip",
          "description": "Package files into a .zip archive",
          "example": "zip -r app.zip app/",
          "notes": "Cross-platform archives; -r is required to include subdirectories.  For permission preserve on Linux, prefer `tar.gz`. `zip -r9` best compress, `-e` encrypt (weak)."
        },
        {
          "command": "rsync",
          "description": "Efficiently sync files/directories",
          "example": "rsync -avz src/ user@host:/dest",
          "notes": "-a preserves permissions, -v verbose, -z compresses. Great for backups and deploys.  Dry-run first: `rsync -avzn src/ dst/` (-n). Show progress: `--progress` or `--info=progress2`. For large: `--partial` resume."
        }
      ]
    },
    {
      "id": "git",
      "title": "Version Control (Git)",
      "icon": "file",
      "commands": [
        {
          "command": "git clone",
          "description": "Copy a remote repository locally",
          "example": "git clone https://github.com/user/repo.git",
          "notes": "Add a folder name at the end to clone into a specific directory.  Shallow: `git clone --depth 1` for huge repos. Use `--branch main` to clone single branch."
        },
        {
          "command": "git status",
          "description": "Show working tree state",
          "example": "git status -s",
          "notes": "-s gives a short, concise output of changed files.  Short: `git status -sb` (branch + short). For ignore check: `git check-ignore -v file`."
        },
        {
          "command": "git commit",
          "description": "Record staged changes",
          "example": "git commit -m \"fix: typo\"",
          "notes": "Use git add first to stage; -a commits already-tracked modified files.  Amend last: `git commit --amend`. For co-authors: add `Co-authored-by:`. Use `commit.template` for consistency."
        },
        {
          "command": "git push/pull",
          "description": "Upload or download commits",
          "example": "git push origin main",
          "notes": "pull = fetch + merge. Use --set-upstream (-u) the first time you push a branch.  Safer pull: `git pull --rebase` avoids merge commits. First push: `git push -u origin feature` sets upstream."
        },
        {
          "command": "git branch",
          "description": "List or create branches",
          "example": "git checkout -b feature",
          "notes": "checkout -b creates and switches; git merge feature integrates changes.  Delete merged: `git branch -d feature`. For remote: `git push origin --delete feature`."
        }
      ]
    },
    {
      "id": "docker",
      "title": "Containers (Docker)",
      "icon": "cpu",
      "commands": [
        {
          "command": "docker run",
          "description": "Run a container from an image",
          "example": "docker run -d -p 8080:80 nginx",
          "notes": "-d detached, -p host:container port mapping. Image is pulled if missing.  Never `--privileged` unless needed — breaks isolation. Clean after: `docker run --rm` auto-remove."
        },
        {
          "command": "docker ps",
          "description": "List running containers",
          "example": "docker ps -a",
          "notes": "-a shows all containers including stopped ones.  Format: `docker ps --format \"table {{.Names}}\t{{.Status}}\"` for scripts. Watch: `watch -n1 docker ps`."
        },
        {
          "command": "docker build",
          "description": "Build an image from a Dockerfile",
          "example": "docker build -t myapp .",
          "notes": "-t tags the image; the . is the build context (current dir).  Layer cache: order Dockerfile from least to most changing. Use `.dockerignore` to skip. Try `docker build --no-cache` to force."
        },
        {
          "command": "docker compose",
          "description": "Manage multi-container apps",
          "example": "docker compose up -d",
          "notes": "Reads docker-compose.yml; -d starts in the background.  Check config: `docker compose config`. For logs: `docker compose logs -f --tail 50`."
        }
      ]
    }
  ],
  "commandsBank": [
    {
      "command": "ls",
      "category": "File System",
      "briefDescription": "Lists directory contents.",
      "keywords": [
        "list",
        "directory",
        "folder",
        "contents",
        "view"
      ]
    },
    {
      "command": "cd",
      "category": "File System",
      "briefDescription": "Changes the current working directory.",
      "keywords": [
        "change",
        "navigate",
        "enter",
        "path",
        "folder"
      ]
    },
    {
      "command": "pwd",
      "category": "File System",
      "briefDescription": "Prints the current working directory path.",
      "keywords": [
        "print",
        "working",
        "directory",
        "path",
        "location",
        "where"
      ]
    },
    {
      "command": "mkdir",
      "category": "File System",
      "briefDescription": "Creates a new directory.",
      "keywords": [
        "make",
        "create",
        "new",
        "folder",
        "directory"
      ]
    },
    {
      "command": "rmdir",
      "category": "File System",
      "briefDescription": "Removes an empty directory.",
      "keywords": [
        "remove",
        "delete",
        "empty",
        "folder",
        "directory"
      ]
    },
    {
      "command": "rm",
      "category": "File System",
      "briefDescription": "Removes files or directories.",
      "keywords": [
        "remove",
        "delete",
        "erase",
        "destroy"
      ]
    },
    {
      "command": "cp",
      "category": "File System",
      "briefDescription": "Copies files or directories.",
      "keywords": [
        "copy",
        "duplicate",
        "paste",
        "clone"
      ]
    },
    {
      "command": "mv",
      "category": "File System",
      "briefDescription": "Moves or renames files and directories.",
      "keywords": [
        "move",
        "rename",
        "transfer",
        "relocate"
      ]
    },
    {
      "command": "touch",
      "category": "File System",
      "briefDescription": "Creates an empty file or updates timestamps.",
      "keywords": [
        "create",
        "new",
        "file",
        "timestamp",
        "empty"
      ]
    },
    {
      "command": "find",
      "category": "File System",
      "briefDescription": "Searches for files in a directory hierarchy.",
      "keywords": [
        "locate",
        "search",
        "files",
        "directories",
        "name",
        "pattern"
      ]
    },
    {
      "command": "tar",
      "category": "File System",
      "briefDescription": "Archives files into a tarball.",
      "keywords": [
        "archive",
        "compress",
        "extract",
        "zip",
        "gzip",
        "tarball"
      ]
    },
    {
      "command": "cat",
      "category": "Text Processing",
      "briefDescription": "Reads and outputs file contents.",
      "keywords": [
        "concatenate",
        "read",
        "view",
        "print",
        "file"
      ]
    },
    {
      "command": "less",
      "category": "Text Processing",
      "briefDescription": "Views file contents one page at a time.",
      "keywords": [
        "read",
        "scroll",
        "view",
        "pager",
        "text"
      ]
    },
    {
      "command": "more",
      "category": "Text Processing",
      "briefDescription": "Views file contents page by page (forward only).",
      "keywords": [
        "read",
        "scroll",
        "view",
        "pager",
        "text"
      ]
    },
    {
      "command": "head",
      "category": "Text Processing",
      "briefDescription": "Outputs the first lines of a file.",
      "keywords": [
        "top",
        "beginning",
        "first",
        "start",
        "read"
      ]
    },
    {
      "command": "tail",
      "category": "Text Processing",
      "briefDescription": "Outputs the last lines of a file.",
      "keywords": [
        "bottom",
        "end",
        "last",
        "log",
        "follow"
      ]
    },
    {
      "command": "grep",
      "category": "Text Processing",
      "briefDescription": "Searches for patterns within text.",
      "keywords": [
        "search",
        "find",
        "filter",
        "pattern",
        "regex",
        "text"
      ]
    },
    {
      "command": "awk",
      "category": "Text Processing",
      "briefDescription": "Pattern scanning and processing language.",
      "keywords": [
        "pattern",
        "process",
        "column",
        "text",
        "parse"
      ]
    },
    {
      "command": "sed",
      "category": "Text Processing",
      "briefDescription": "Stream editor for filtering and transforming text.",
      "keywords": [
        "stream",
        "edit",
        "replace",
        "substitute",
        "text"
      ]
    },
    {
      "command": "nano",
      "category": "Text Processing",
      "briefDescription": "A simple terminal text editor.",
      "keywords": [
        "edit",
        "editor",
        "vim",
        "text",
        "modify"
      ]
    },
    {
      "command": "vim",
      "category": "Text Processing",
      "briefDescription": "Advanced terminal text editor.",
      "keywords": [
        "edit",
        "editor",
        "vi",
        "text",
        "modify"
      ]
    },
    {
      "command": "sort",
      "category": "Text Processing",
      "briefDescription": "Sorts lines of text files.",
      "keywords": [
        "order",
        "arrange",
        "alphabetical",
        "numeric",
        "text"
      ]
    },
    {
      "command": "uniq",
      "category": "Text Processing",
      "briefDescription": "Reports or omits repeated lines.",
      "keywords": [
        "unique",
        "duplicate",
        "distinct",
        "filter",
        "text"
      ]
    },
    {
      "command": "wc",
      "category": "Text Processing",
      "briefDescription": "Counts words, lines, and bytes.",
      "keywords": [
        "word",
        "count",
        "line",
        "byte",
        "size"
      ]
    },
    {
      "command": "chmod",
      "category": "Permissions",
      "briefDescription": "Changes file access permissions.",
      "keywords": [
        "change",
        "mode",
        "permissions",
        "execute",
        "read",
        "write"
      ]
    },
    {
      "command": "chown",
      "category": "Permissions",
      "briefDescription": "Changes file owner and group.",
      "keywords": [
        "change",
        "owner",
        "user",
        "group",
        "permissions"
      ]
    },
    {
      "command": "sudo",
      "category": "Permissions",
      "briefDescription": "Executes a command as the superuser.",
      "keywords": [
        "superuser",
        "root",
        "admin",
        "privileges",
        "elevated"
      ]
    },
    {
      "command": "su",
      "category": "Permissions",
      "briefDescription": "Switches the current user.",
      "keywords": [
        "switch",
        "user",
        "substitute",
        "root"
      ]
    },
    {
      "command": "ps",
      "category": "Process Management",
      "briefDescription": "Reports a snapshot of current processes.",
      "keywords": [
        "process",
        "status",
        "running",
        "tasks",
        "pid"
      ]
    },
    {
      "command": "kill",
      "category": "Process Management",
      "briefDescription": "Terminates a process by PID.",
      "keywords": [
        "terminate",
        "stop",
        "end",
        "close",
        "force",
        "process"
      ]
    },
    {
      "command": "killall",
      "category": "Process Management",
      "briefDescription": "Terminates processes by name.",
      "keywords": [
        "terminate",
        "stop",
        "kill",
        "name",
        "process"
      ]
    },
    {
      "command": "top",
      "category": "Process Management",
      "briefDescription": "Displays real-time system processes and resources.",
      "keywords": [
        "monitor",
        "task",
        "manager",
        "cpu",
        "memory",
        "processes"
      ]
    },
    {
      "command": "htop",
      "category": "Process Management",
      "briefDescription": "Interactive process viewer.",
      "keywords": [
        "monitor",
        "task",
        "manager",
        "cpu",
        "memory",
        "interactive"
      ]
    },
    {
      "command": "systemctl",
      "category": "Process Management",
      "briefDescription": "Manages system services and daemons.",
      "keywords": [
        "service",
        "daemon",
        "start",
        "stop",
        "restart",
        "systemd"
      ]
    },
    {
      "command": "df",
      "category": "System Info",
      "briefDescription": "Reports file system disk space usage.",
      "keywords": [
        "disk",
        "free",
        "space",
        "storage",
        "filesystem"
      ]
    },
    {
      "command": "du",
      "category": "System Info",
      "briefDescription": "Estimates file and directory space usage.",
      "keywords": [
        "disk",
        "usage",
        "size",
        "space",
        "directory"
      ]
    },
    {
      "command": "free",
      "category": "System Info",
      "briefDescription": "Displays amount of free and used memory.",
      "keywords": [
        "memory",
        "ram",
        "swap",
        "usage"
      ]
    },
    {
      "command": "uname",
      "category": "System Info",
      "briefDescription": "Prints system information.",
      "keywords": [
        "system",
        "kernel",
        "os",
        "version",
        "architecture"
      ]
    },
    {
      "command": "uptime",
      "category": "System Info",
      "briefDescription": "Shows how long the system has been running.",
      "keywords": [
        "time",
        "running",
        "load",
        "average"
      ]
    },
    {
      "command": "whoami",
      "category": "System Info",
      "briefDescription": "Prints the current user name.",
      "keywords": [
        "identity",
        "user",
        "id",
        "who"
      ]
    },
    {
      "command": "history",
      "category": "System Info",
      "briefDescription": "Shows the command line history.",
      "keywords": [
        "past",
        "commands",
        "log",
        "terminal",
        "previous"
      ]
    },
    {
      "command": "ping",
      "category": "Networking",
      "briefDescription": "Tests network connectivity to a host.",
      "keywords": [
        "network",
        "internet",
        "test",
        "latency",
        "connection",
        "ip"
      ]
    },
    {
      "command": "ip",
      "category": "Networking",
      "briefDescription": "Shows or manipulates routing and network devices.",
      "keywords": [
        "address",
        "interface",
        "mac",
        "config",
        "network"
      ]
    },
    {
      "command": "ifconfig",
      "category": "Networking",
      "briefDescription": "Configures network interfaces (legacy).",
      "keywords": [
        "address",
        "interface",
        "mac",
        "config",
        "network"
      ]
    },
    {
      "command": "curl",
      "category": "Networking",
      "briefDescription": "Transfers data to or from a server.",
      "keywords": [
        "url",
        "web",
        "api",
        "http",
        "request",
        "download"
      ]
    },
    {
      "command": "wget",
      "category": "Networking",
      "briefDescription": "Downloads files from the web non-interactively.",
      "keywords": [
        "download",
        "web",
        "url",
        "internet",
        "fetch"
      ]
    },
    {
      "command": "ssh",
      "category": "Networking",
      "briefDescription": "Logs into a remote machine securely.",
      "keywords": [
        "secure",
        "shell",
        "remote",
        "login",
        "server",
        "connect"
      ]
    },
    {
      "command": "scp",
      "category": "Networking",
      "briefDescription": "Securely copies files between hosts.",
      "keywords": [
        "secure",
        "copy",
        "transfer",
        "remote",
        "ssh"
      ]
    },
    {
      "command": "netstat",
      "category": "Networking",
      "briefDescription": "Displays network connections and ports.",
      "keywords": [
        "network",
        "ports",
        "connections",
        "listening",
        "socket"
      ]
    },
    {
      "command": "ss",
      "category": "Networking",
      "briefDescription": "Displays socket statistics (modern netstat).",
      "keywords": [
        "network",
        "ports",
        "connections",
        "socket",
        "statistics"
      ]
    },
    {
      "command": "apt",
      "category": "Package Management",
      "briefDescription": "Installs, updates, and removes Debian packages.",
      "keywords": [
        "install",
        "update",
        "upgrade",
        "remove",
        "software",
        "ubuntu",
        "debian"
      ]
    },
    {
      "command": "yum",
      "category": "Package Management",
      "briefDescription": "Installs and manages RPM packages.",
      "keywords": [
        "install",
        "update",
        "remove",
        "software",
        "centos",
        "rhel"
      ]
    },
    {
      "command": "dnf",
      "category": "Package Management",
      "briefDescription": "Modern version of yum for Fedora/RHEL.",
      "keywords": [
        "install",
        "update",
        "remove",
        "software",
        "fedora"
      ]
    },
    {
      "command": "pacman",
      "category": "Package Management",
      "briefDescription": "Package manager for Arch Linux.",
      "keywords": [
        "install",
        "update",
        "remove",
        "software",
        "arch"
      ]
    },
    {
      "command": "clear",
      "category": "System Info",
      "briefDescription": "Clears the terminal screen.",
      "keywords": [
        "clean",
        "clear",
        "reset",
        "console",
        "screen"
      ]
    },
    {
      "command": "tar",
      "category": "Archiving",
      "briefDescription": "Archives files into a tarball, optionally compressed.",
      "keywords": [
        "archive",
        "compress",
        "extract",
        "backup",
        "gzip"
      ]
    },
    {
      "command": "gzip",
      "category": "Archiving",
      "briefDescription": "Compresses a file using the gzip algorithm.",
      "keywords": [
        "compress",
        "zip",
        "shrink",
        "gunzip",
        "decompress"
      ]
    },
    {
      "command": "zip",
      "category": "Archiving",
      "briefDescription": "Packages files into a cross-platform .zip archive.",
      "keywords": [
        "archive",
        "compress",
        "unzip",
        "package",
        "windows"
      ]
    },
    {
      "command": "rsync",
      "category": "Archiving",
      "briefDescription": "Efficiently copies and syncs files locally or remote.",
      "keywords": [
        "sync",
        "backup",
        "copy",
        "transfer",
        "mirror"
      ]
    },
    {
      "command": "git",
      "category": "Version Control",
      "briefDescription": "Distributed version control system for tracking changes.",
      "keywords": [
        "version",
        "control",
        "commit",
        "branch",
        "repository",
        "github"
      ]
    },
    {
      "command": "git clone",
      "category": "Version Control",
      "briefDescription": "Downloads a remote repository to your machine.",
      "keywords": [
        "download",
        "repository",
        "copy",
        "github",
        "remote"
      ]
    },
    {
      "command": "git commit",
      "category": "Version Control",
      "briefDescription": "Saves a snapshot of your staged changes.",
      "keywords": [
        "save",
        "snapshot",
        "message",
        "stage",
        "repository"
      ]
    },
    {
      "command": "git push",
      "category": "Version Control",
      "briefDescription": "Uploads local commits to a remote repository.",
      "keywords": [
        "upload",
        "remote",
        "publish",
        "github",
        "sync"
      ]
    },
    {
      "command": "git pull",
      "category": "Version Control",
      "briefDescription": "Downloads and merges remote changes locally.",
      "keywords": [
        "download",
        "merge",
        "update",
        "fetch",
        "sync"
      ]
    },
    {
      "command": "docker",
      "category": "Containers",
      "briefDescription": "Platform for building and running containers.",
      "keywords": [
        "container",
        "image",
        "engine",
        "virtualization",
        "devops"
      ]
    },
    {
      "command": "docker run",
      "category": "Containers",
      "briefDescription": "Runs a new container from an image.",
      "keywords": [
        "container",
        "start",
        "image",
        "nginx",
        "port"
      ]
    },
    {
      "command": "docker ps",
      "category": "Containers",
      "briefDescription": "Lists running (or all) containers.",
      "keywords": [
        "container",
        "list",
        "status",
        "running",
        "ports"
      ]
    },
    {
      "command": "docker compose",
      "category": "Containers",
      "briefDescription": "Manages multi-container applications via compose file.",
      "keywords": [
        "compose",
        "multi",
        "service",
        "yaml",
        "stack"
      ]
    },
    {
      "command": "echo",
      "category": "Text Processing",
      "briefDescription": "Prints text or variables to standard output.",
      "keywords": [
        "print",
        "output",
        "variable",
        "string",
        "display"
      ]
    },
    {
      "command": "alias",
      "category": "System Info",
      "briefDescription": "Creates a shortcut command for a longer one.",
      "keywords": [
        "shortcut",
        "custom",
        "command",
        "shell",
        "config"
      ]
    },
    {
      "command": "crontab",
      "category": "Process Management",
      "briefDescription": "Schedules commands to run on a timer.",
      "keywords": [
        "schedule",
        "timer",
        "automation",
        "job",
        "periodic"
      ]
    },
    {
      "command": "journalctl",
      "category": "System Info",
      "briefDescription": "Queries the systemd journal (logs).",
      "keywords": [
        "logs",
        "systemd",
        "journal",
        "service",
        "debug"
      ]
    },
    {
      "command": "watch",
      "category": "Process Management",
      "briefDescription": "Runs a command repeatedly, showing live output.",
      "keywords": [
        "repeat",
        "interval",
        "monitor",
        "live",
        "refresh"
      ]
    },
    {
      "command": "ln",
      "category": "File System",
      "briefDescription": "Creates hard or symbolic (soft) links.",
      "keywords": [
        "link",
        "symlink",
        "shortcut",
        "inode",
        "reference"
      ]
    },
    {
      "command": "passwd",
      "category": "Permissions",
      "briefDescription": "Changes a user's password.",
      "keywords": [
        "password",
        "change",
        "user",
        "credential",
        "auth"
      ]
    },
    {
      "command": "useradd",
      "category": "Permissions",
      "briefDescription": "Creates a new user account.",
      "keywords": [
        "user",
        "create",
        "account",
        "add",
        "admin"
      ]
    },
    {
      "command": "usermod",
      "category": "Permissions",
      "briefDescription": "Modifies an existing user account.",
      "keywords": [
        "user",
        "modify",
        "group",
        "account",
        "admin"
      ]
    },
    {
      "command": "groupadd",
      "category": "Permissions",
      "briefDescription": "Creates a new user group.",
      "keywords": [
        "group",
        "create",
        "permission",
        "add",
        "admin"
      ]
    },
    {
      "command": "lsblk",
      "category": "Disk Management",
      "briefDescription": "Lists block devices and partitions in a tree view.",
      "keywords": [
        "disk",
        "block",
        "partition",
        "list"
      ],
      "flags": [
        {
          "flag": "-f",
          "desc": "Show filesystem types"
        },
        {
          "flag": "-o",
          "desc": "Custom columns"
        }
      ],
      "examples": [
        {
          "code": "lsblk",
          "desc": "Tree of disks/partitions"
        },
        {
          "code": "lsblk -f",
          "desc": "With FS and UUID"
        },
        {
          "code": "lsblk -o NAME,SIZE,FSTYPE,MOUNTPOINT",
          "desc": "Custom output"
        }
      ],
      "pitfall": "lsblk without -f hides FS type — beginners think disk is empty",
      "related": [
        "blkid",
        "fdisk",
        "mount"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "blkid",
      "category": "Disk Management",
      "briefDescription": "Shows block device UUID, TYPE and attributes.",
      "keywords": [
        "uuid",
        "filesystem",
        "blkid"
      ],
      "flags": [
        {
          "flag": "-o",
          "desc": "Output format list/device"
        }
      ],
      "examples": [
        {
          "code": "blkid",
          "desc": "All devices"
        },
        {
          "code": "blkid /dev/sda1",
          "desc": "Single partition"
        }
      ],
      "pitfall": "Needs sudo for some devices",
      "related": [
        "lsblk",
        "ls -l /dev/disk/by-uuid"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "fdisk",
      "category": "Disk Management",
      "briefDescription": "Partitions a disk (MBR/GPT).",
      "keywords": [
        "partition",
        "fdisk",
        "disk"
      ],
      "flags": [
        {
          "flag": "-l",
          "desc": "List partitions"
        },
        {
          "flag": "-u",
          "desc": "Units"
        }
      ],
      "examples": [
        {
          "code": "sudo fdisk -l",
          "desc": "List all"
        },
        {
          "code": "sudo fdisk /dev/sda",
          "desc": "Interactive"
        }
      ],
      "pitfall": "Writes immediately — double-check device",
      "related": [
        "parted",
        "lsblk"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "parted",
      "category": "Disk Management",
      "briefDescription": "Advanced partition editor (supports GPT).",
      "keywords": [
        "partition",
        "parted",
        "gpt"
      ],
      "flags": [
        {
          "flag": "-l",
          "desc": "List"
        }
      ],
      "examples": [
        {
          "code": "sudo parted -l",
          "desc": "List"
        }
      ],
      "pitfall": "parted mklabel wipes table",
      "related": [
        "fdisk"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "mkfs.ext4",
      "category": "Disk Management",
      "briefDescription": "Creates an ext4 filesystem.",
      "keywords": [
        "format",
        "mkfs",
        "ext4"
      ],
      "flags": [
        {
          "flag": "-L",
          "desc": "Label"
        },
        {
          "flag": "-F",
          "desc": "Force"
        }
      ],
      "examples": [
        {
          "code": "sudo mkfs.ext4 -L data /dev/sdb1",
          "desc": "Format with label"
        }
      ],
      "pitfall": "Formats — destroys data",
      "related": [
        "mkfs",
        "fdisk",
        "mount"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "mount",
      "category": "Disk Management",
      "briefDescription": "Mounts a filesystem.",
      "keywords": [
        "mount",
        "filesystem"
      ],
      "flags": [
        {
          "flag": "-t",
          "desc": "Type"
        },
        {
          "flag": "-o",
          "desc": "Options"
        }
      ],
      "examples": [
        {
          "code": "mount | column -t",
          "desc": "Show mounts"
        },
        {
          "code": "sudo mount /dev/sdb1 /mnt",
          "desc": "Mount"
        }
      ],
      "pitfall": "Mount point must exist",
      "related": [
        "umount",
        "findmnt"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "umount",
      "category": "Disk Management",
      "briefDescription": "Unmounts a filesystem.",
      "keywords": [
        "unmount",
        "umount"
      ],
      "flags": [
        {
          "flag": "-l",
          "desc": "Lazy"
        },
        {
          "flag": "-f",
          "desc": "Force"
        }
      ],
      "examples": [
        {
          "code": "sudo umount /mnt",
          "desc": "Unmount"
        },
        {
          "code": "sudo umount -l /mnt",
          "desc": "Lazy"
        }
      ],
      "pitfall": "Device busy? Use lsof",
      "related": [
        "mount",
        "lsof"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "findmnt",
      "category": "Disk Management",
      "briefDescription": "Finds and lists mounted filesystems.",
      "keywords": [
        "findmnt",
        "mount"
      ],
      "flags": [
        {
          "flag": "-T",
          "desc": "Target file"
        }
      ],
      "examples": [
        {
          "code": "findmnt",
          "desc": "Tree"
        },
        {
          "code": "findmnt -T /home",
          "desc": "For path"
        }
      ],
      "related": [
        "mount",
        "df"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "stat",
      "category": "File System",
      "briefDescription": "Shows detailed file status (inode, times).",
      "keywords": [
        "stat",
        "inode",
        "metadata"
      ],
      "flags": [
        {
          "flag": "-c",
          "desc": "Format"
        },
        {
          "flag": "-f",
          "desc": "Filesystem"
        }
      ],
      "examples": [
        {
          "code": "stat file.txt",
          "desc": "File info"
        },
        {
          "code": "stat -c '%a %n' file",
          "desc": "Perms"
        }
      ],
      "pitfall": "stat vs ls -l: stat shows all three times",
      "related": [
        "ls",
        "ls -i"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "file",
      "category": "File System",
      "briefDescription": "Determines file type by content.",
      "keywords": [
        "file",
        "type",
        "magic"
      ],
      "flags": [
        {
          "flag": "-b",
          "desc": "Brief"
        },
        {
          "flag": "-i",
          "desc": "MIME"
        }
      ],
      "examples": [
        {
          "code": "file /bin/ls",
          "desc": "ELF binary"
        },
        {
          "code": "file -i image.png",
          "desc": "MIME"
        }
      ],
      "related": [
        "stat",
        "ls"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "ncdu",
      "category": "Disk Management",
      "briefDescription": "Interactive disk usage analyzer (ncurses).",
      "keywords": [
        "ncdu",
        "disk",
        "usage"
      ],
      "flags": [],
      "examples": [
        {
          "code": "ncdu /",
          "desc": "Scan root"
        },
        {
          "code": "ncdu -x /home",
          "desc": "Stay on FS"
        }
      ],
      "pitfall": "Needs install: sudo apt install ncdu",
      "related": [
        "du",
        "df"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "free",
      "category": "System Info",
      "briefDescription": "Already in bank but enriched — displays RAM/swap.",
      "keywords": [
        "free",
        "memory",
        "ram"
      ],
      "flags": [
        {
          "flag": "-h",
          "desc": "Human"
        },
        {
          "flag": "-m",
          "desc": "MB"
        }
      ],
      "examples": [
        {
          "code": "free -h",
          "desc": "Human readable"
        }
      ],
      "pitfall": "free vs available — use available column",
      "related": [
        "vmstat",
        "top"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "vmstat",
      "category": "System Monitoring",
      "briefDescription": "Reports virtual memory, processes, CPU.",
      "keywords": [
        "vmstat",
        "memory",
        "cpu"
      ],
      "flags": [
        {
          "flag": "-s",
          "desc": "Stats"
        }
      ],
      "examples": [
        {
          "code": "vmstat 1 5",
          "desc": "5 samples 1s"
        }
      ],
      "related": [
        "free",
        "iostat"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "iostat",
      "category": "System Monitoring",
      "briefDescription": "CPU and I/O statistics.",
      "keywords": [
        "iostat",
        "io",
        "cpu"
      ],
      "flags": [],
      "examples": [
        {
          "code": "iostat -x 1",
          "desc": "Extended"
        }
      ],
      "related": [
        "vmstat",
        "sar"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "mpstat",
      "category": "System Monitoring",
      "briefDescription": "Per-CPU statistics.",
      "keywords": [
        "mpstat",
        "cpu"
      ],
      "flags": [
        {
          "flag": "-P",
          "desc": "CPU"
        }
      ],
      "examples": [
        {
          "code": "mpstat -P ALL 1",
          "desc": "All CPUs"
        }
      ],
      "related": [
        "iostat"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "dmesg",
      "category": "System Info",
      "briefDescription": "Kernel ring buffer messages.",
      "keywords": [
        "dmesg",
        "kernel",
        "log"
      ],
      "flags": [
        {
          "flag": "-H",
          "desc": "Human"
        },
        {
          "flag": "-T",
          "desc": "Time"
        }
      ],
      "examples": [
        {
          "code": "dmesg | tail",
          "desc": "Recent"
        },
        {
          "code": "dmesg --level=err",
          "desc": "Errors"
        }
      ],
      "pitfall": "Needs sudo on some distros",
      "related": [
        "journalctl"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "hostnamectl",
      "category": "System Info",
      "briefDescription": "Controls system hostname.",
      "keywords": [
        "hostname",
        "hostnamectl"
      ],
      "flags": [],
      "examples": [
        {
          "code": "hostnamectl",
          "desc": "Status"
        },
        {
          "code": "sudo hostnamectl set-hostname web01",
          "desc": "Set"
        }
      ],
      "related": [
        "hostname",
        "uname"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "timedatectl",
      "category": "System Info",
      "briefDescription": "Controls time, date, timezone, NTP.",
      "keywords": [
        "time",
        "date",
        "timedatectl"
      ],
      "flags": [],
      "examples": [
        {
          "code": "timedatectl",
          "desc": "Status"
        },
        {
          "code": "sudo timedatectl set-timezone UTC",
          "desc": "Set TZ"
        }
      ],
      "related": [
        "date"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "lsmod",
      "category": "System Info",
      "briefDescription": "Lists loaded kernel modules.",
      "keywords": [
        "lsmod",
        "module",
        "kernel"
      ],
      "flags": [],
      "examples": [
        {
          "code": "lsmod | grep kvm",
          "desc": "Search KVM"
        }
      ],
      "related": [
        "modprobe",
        "dmesg"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "modprobe",
      "category": "System Info",
      "briefDescription": "Adds/removes kernel modules.",
      "keywords": [
        "modprobe",
        "module"
      ],
      "flags": [
        {
          "flag": "-r",
          "desc": "Remove"
        }
      ],
      "examples": [
        {
          "code": "sudo modprobe -r kvm_intel",
          "desc": "Remove"
        }
      ],
      "related": [
        "lsmod"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "lspci",
      "category": "System Info",
      "briefDescription": "Lists PCI devices.",
      "keywords": [
        "lspci",
        "pci",
        "hardware"
      ],
      "flags": [
        {
          "flag": "-k",
          "desc": "Kernel driver"
        }
      ],
      "examples": [
        {
          "code": "lspci -k",
          "desc": "With drivers"
        }
      ],
      "related": [
        "lsusb",
        "lshw"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "lsusb",
      "category": "System Info",
      "briefDescription": "Lists USB devices.",
      "keywords": [
        "lsusb",
        "usb"
      ],
      "flags": [],
      "examples": [
        {
          "code": "lsusb",
          "desc": "USB list"
        }
      ],
      "related": [
        "lspci"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "id",
      "category": "User Management",
      "briefDescription": "Prints user and group IDs.",
      "keywords": [
        "id",
        "user",
        "group"
      ],
      "flags": [
        {
          "flag": "-u",
          "desc": "UID"
        },
        {
          "flag": "-g",
          "desc": "GID"
        }
      ],
      "examples": [
        {
          "code": "id",
          "desc": "Current"
        },
        {
          "code": "id www-data",
          "desc": "Specific user"
        }
      ],
      "related": [
        "whoami",
        "groups"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "groups",
      "category": "User Management",
      "briefDescription": "Shows groups for a user.",
      "keywords": [
        "groups",
        "group"
      ],
      "flags": [],
      "examples": [
        {
          "code": "groups",
          "desc": "My groups"
        },
        {
          "code": "groups alice",
          "desc": "Alice"
        }
      ],
      "related": [
        "id",
        "usermod"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "who",
      "category": "User Management",
      "briefDescription": "Shows logged-in users.",
      "keywords": [
        "who",
        "login"
      ],
      "flags": [
        {
          "flag": "-a",
          "desc": "All"
        }
      ],
      "examples": [
        {
          "code": "who",
          "desc": "Logged in"
        }
      ],
      "related": [
        "w",
        "last"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "w",
      "category": "User Management",
      "briefDescription": "Shows logged-in users and activity.",
      "keywords": [
        "w",
        "who"
      ],
      "flags": [],
      "examples": [
        {
          "code": "w",
          "desc": "Users + load"
        }
      ],
      "related": [
        "who",
        "uptime"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "last",
      "category": "User Management",
      "briefDescription": "Shows last logins from wtmp.",
      "keywords": [
        "last",
        "login",
        "wtmp"
      ],
      "flags": [],
      "examples": [
        {
          "code": "last | head",
          "desc": "Recent"
        }
      ],
      "related": [
        "who",
        "lastlog"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "lastlog",
      "category": "User Management",
      "briefDescription": "Reports most recent login per user.",
      "keywords": [
        "lastlog"
      ],
      "flags": [],
      "examples": [
        {
          "code": "lastlog",
          "desc": "All users"
        }
      ],
      "related": [
        "last"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "userdel",
      "category": "User Management",
      "briefDescription": "Deletes a user account.",
      "keywords": [
        "userdel",
        "delete",
        "user"
      ],
      "flags": [
        {
          "flag": "-r",
          "desc": "Remove home"
        }
      ],
      "examples": [
        {
          "code": "sudo userdel -r olduser",
          "desc": "Delete + home"
        }
      ],
      "pitfall": "Without -r leaves home",
      "related": [
        "useradd",
        "usermod"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "groupdel",
      "category": "User Management",
      "briefDescription": "Deletes a group.",
      "keywords": [
        "groupdel",
        "group"
      ],
      "flags": [],
      "examples": [
        {
          "code": "sudo groupdel devs",
          "desc": "Delete"
        }
      ],
      "related": [
        "groupadd"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "chage",
      "category": "User Management",
      "briefDescription": "Changes password expiry info.",
      "keywords": [
        "chage",
        "password",
        "expiry"
      ],
      "flags": [
        {
          "flag": "-l",
          "desc": "List"
        },
        {
          "flag": "-E",
          "desc": "Expire date"
        }
      ],
      "examples": [
        {
          "code": "chage -l alice",
          "desc": "List"
        }
      ],
      "related": [
        "passwd",
        "usermod"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "chsh",
      "category": "User Management",
      "briefDescription": "Changes login shell.",
      "keywords": [
        "chsh",
        "shell"
      ],
      "flags": [
        {
          "flag": "-s",
          "desc": "Shell"
        }
      ],
      "examples": [
        {
          "code": "chsh -s /bin/zsh",
          "desc": "To zsh"
        }
      ],
      "related": [
        "usermod",
        "echo $SHELL"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "umask",
      "category": "Permissions",
      "briefDescription": "Sets default creation permissions mask.",
      "keywords": [
        "umask",
        "permission",
        "mask"
      ],
      "flags": [],
      "examples": [
        {
          "code": "umask",
          "desc": "Show"
        },
        {
          "code": "umask 022",
          "desc": "Set"
        }
      ],
      "pitfall": "022 → 755/644 ; 027 → 750/640",
      "related": [
        "chmod"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "getfacl",
      "category": "Permissions",
      "briefDescription": "Gets file ACLs.",
      "keywords": [
        "getfacl",
        "acl"
      ],
      "flags": [],
      "examples": [
        {
          "code": "getfacl file.txt",
          "desc": "Show ACL"
        }
      ],
      "related": [
        "setfacl",
        "chmod"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "setfacl",
      "category": "Permissions",
      "briefDescription": "Sets file ACLs.",
      "keywords": [
        "setfacl",
        "acl"
      ],
      "flags": [
        {
          "flag": "-m",
          "desc": "Modify"
        },
        {
          "flag": "-x",
          "desc": "Remove"
        }
      ],
      "examples": [
        {
          "code": "setfacl -m u:alice:rwx file",
          "desc": "Grant alice"
        }
      ],
      "related": [
        "getfacl"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "chgrp",
      "category": "Permissions",
      "briefDescription": "Changes group ownership.",
      "keywords": [
        "chgrp",
        "group",
        "permission"
      ],
      "flags": [
        {
          "flag": "-R",
          "desc": "Recursive"
        }
      ],
      "examples": [
        {
          "code": "chgrp devs file.txt",
          "desc": "Change group"
        }
      ],
      "related": [
        "chown",
        "chmod"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "pgrep",
      "category": "Process Management",
      "briefDescription": "Finds PIDs by name.",
      "keywords": [
        "pgrep",
        "process",
        "pid"
      ],
      "flags": [
        {
          "flag": "-a",
          "desc": "Full"
        },
        {
          "flag": "-u",
          "desc": "User"
        }
      ],
      "examples": [
        {
          "code": "pgrep -a python",
          "desc": "Find python"
        }
      ],
      "related": [
        "ps",
        "pkill"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "pkill",
      "category": "Process Management",
      "briefDescription": "Signals processes by name.",
      "keywords": [
        "pkill",
        "kill",
        "process"
      ],
      "flags": [
        {
          "flag": "-f",
          "desc": "Full"
        }
      ],
      "examples": [
        {
          "code": "pkill -f 'python app.py'",
          "desc": "Kill by full"
        }
      ],
      "pitfall": "pkill without -f matches only name",
      "related": [
        "pgrep",
        "kill"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "pidof",
      "category": "Process Management",
      "briefDescription": "Finds PID of program.",
      "keywords": [
        "pidof",
        "pid"
      ],
      "flags": [],
      "examples": [
        {
          "code": "pidof nginx",
          "desc": "PID"
        }
      ],
      "related": [
        "pgrep"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "pstree",
      "category": "Process Management",
      "briefDescription": "Shows processes as a tree.",
      "keywords": [
        "pstree",
        "process",
        "tree"
      ],
      "flags": [
        {
          "flag": "-p",
          "desc": "PIDs"
        }
      ],
      "examples": [
        {
          "code": "pstree -p",
          "desc": "With PIDs"
        }
      ],
      "related": [
        "ps",
        "top"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "jobs",
      "category": "Process Management",
      "briefDescription": "Lists active jobs.",
      "keywords": [
        "jobs",
        "job",
        "background"
      ],
      "flags": [
        {
          "flag": "-l",
          "desc": "PID"
        }
      ],
      "examples": [
        {
          "code": "jobs -l",
          "desc": "List"
        }
      ],
      "related": [
        "bg",
        "fg"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "bg",
      "category": "Process Management",
      "briefDescription": "Resumes job in background.",
      "keywords": [
        "bg",
        "background",
        "job"
      ],
      "flags": [],
      "examples": [
        {
          "code": "bg %1",
          "desc": "Background job 1"
        }
      ],
      "related": [
        "fg",
        "jobs"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "fg",
      "category": "Process Management",
      "briefDescription": "Brings job to foreground.",
      "keywords": [
        "fg",
        "foreground"
      ],
      "flags": [],
      "examples": [
        {
          "code": "fg %1",
          "desc": "Foreground"
        }
      ],
      "related": [
        "bg",
        "jobs"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "nohup",
      "category": "Process Management",
      "briefDescription": "Runs command immune to hangup.",
      "keywords": [
        "nohup",
        "hangup",
        "background"
      ],
      "flags": [],
      "examples": [
        {
          "code": "nohup ./long.sh &",
          "desc": "Persist after logout"
        }
      ],
      "pitfall": "Output goes to nohup.out",
      "related": [
        "tmux",
        "screen"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "tmux",
      "category": "Process Management",
      "briefDescription": "Terminal multiplexer.",
      "keywords": [
        "tmux",
        "multiplexer",
        "session"
      ],
      "flags": [],
      "examples": [
        {
          "code": "tmux",
          "desc": "New session"
        },
        {
          "code": "tmux ls",
          "desc": "List"
        }
      ],
      "related": [
        "screen",
        "nohup"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "screen",
      "category": "Process Management",
      "briefDescription": "Terminal multiplexer (legacy).",
      "keywords": [
        "screen",
        "multiplexer"
      ],
      "flags": [],
      "examples": [
        {
          "code": "screen -S work",
          "desc": "Named session"
        }
      ],
      "related": [
        "tmux"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "nice",
      "category": "Process Management",
      "briefDescription": "Runs command with priority.",
      "keywords": [
        "nice",
        "priority",
        "niceness"
      ],
      "flags": [
        {
          "flag": "-n",
          "desc": "Value -20..19"
        }
      ],
      "examples": [
        {
          "code": "nice -n 10 ./heavy.sh",
          "desc": "Low priority"
        }
      ],
      "related": [
        "renice",
        "top"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "renice",
      "category": "Process Management",
      "briefDescription": "Alters priority of running process.",
      "keywords": [
        "renice",
        "priority"
      ],
      "flags": [],
      "examples": [
        {
          "code": "renice -n 10 -p 1234",
          "desc": "Change PID"
        }
      ],
      "related": [
        "nice",
        "ps"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "traceroute",
      "category": "Networking",
      "briefDescription": "Traces route to host.",
      "keywords": [
        "traceroute",
        "route",
        "hop"
      ],
      "flags": [],
      "examples": [
        {
          "code": "traceroute 8.8.8.8",
          "desc": "Trace"
        }
      ],
      "related": [
        "mtr",
        "ping"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "mtr",
      "category": "Networking",
      "briefDescription": "Combines ping + traceroute live.",
      "keywords": [
        "mtr",
        "ping",
        "trace"
      ],
      "flags": [],
      "examples": [
        {
          "code": "mtr 8.8.8.8",
          "desc": "Live"
        }
      ],
      "related": [
        "traceroute",
        "ping"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "dig",
      "category": "Networking",
      "briefDescription": "DNS lookup utility.",
      "keywords": [
        "dig",
        "dns",
        "lookup"
      ],
      "flags": [
        {
          "flag": "+short",
          "desc": "Short"
        }
      ],
      "examples": [
        {
          "code": "dig example.com",
          "desc": "A record"
        },
        {
          "code": "dig +short google.com",
          "desc": "Short"
        }
      ],
      "related": [
        "host",
        "nslookup"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "nslookup",
      "category": "Networking",
      "briefDescription": "Interactive DNS query (legacy).",
      "keywords": [
        "nslookup",
        "dns"
      ],
      "flags": [],
      "examples": [
        {
          "code": "nslookup example.com",
          "desc": "Query"
        }
      ],
      "related": [
        "dig",
        "host"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "host",
      "category": "Networking",
      "briefDescription": "Simple DNS lookup.",
      "keywords": [
        "host",
        "dns",
        "lookup"
      ],
      "flags": [],
      "examples": [
        {
          "code": "host example.com",
          "desc": "Lookup"
        }
      ],
      "related": [
        "dig",
        "nslookup"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "nc",
      "category": "Networking",
      "briefDescription": "Netcat — reads/writes TCP/UDP.",
      "keywords": [
        "nc",
        "netcat",
        "tcp",
        "udp"
      ],
      "flags": [
        {
          "flag": "-l",
          "desc": "Listen"
        },
        {
          "flag": "-v",
          "desc": "Verbose"
        }
      ],
      "examples": [
        {
          "code": "nc -zv example.com 80",
          "desc": "Port check"
        }
      ],
      "pitfall": "Different nc variants (openbsd vs traditional)",
      "related": [
        "nmap",
        "ss"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "nmap",
      "category": "Networking",
      "briefDescription": "Network scanner.",
      "keywords": [
        "nmap",
        "scan",
        "port"
      ],
      "flags": [
        {
          "flag": "-p",
          "desc": "Ports"
        },
        {
          "flag": "-sV",
          "desc": "Version"
        }
      ],
      "examples": [
        {
          "code": "nmap -F 192.168.1.0/24",
          "desc": "Fast scan"
        }
      ],
      "pitfall": "Scanning without permission is illegal",
      "related": [
        "nc",
        "ss"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "ufw",
      "category": "Networking",
      "briefDescription": "Uncomplicated Firewall.",
      "keywords": [
        "ufw",
        "firewall",
        "ubuntu"
      ],
      "flags": [],
      "examples": [
        {
          "code": "sudo ufw status",
          "desc": "Status"
        },
        {
          "code": "sudo ufw allow 22",
          "desc": "Allow SSH"
        }
      ],
      "related": [
        "iptables",
        "firewall-cmd"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "iptables",
      "category": "Networking",
      "briefDescription": "Netfilter firewall rules.",
      "keywords": [
        "iptables",
        "firewall",
        "netfilter"
      ],
      "flags": [
        {
          "flag": "-L",
          "desc": "List"
        },
        {
          "flag": "-A",
          "desc": "Append"
        }
      ],
      "examples": [
        {
          "code": "sudo iptables -L -n",
          "desc": "List"
        }
      ],
      "pitfall": "Rules lost on reboot unless saved",
      "related": [
        "ufw",
        "firewall-cmd"
      ],
      "difficulty": "advanced"
    },
    {
      "command": "firewall-cmd",
      "category": "Networking",
      "briefDescription": "Firewalld control.",
      "keywords": [
        "firewall-cmd",
        "firewalld",
        "firewall"
      ],
      "flags": [
        {
          "flag": "--list-all",
          "desc": "List"
        }
      ],
      "examples": [
        {
          "code": "sudo firewall-cmd --list-all",
          "desc": "All zones"
        }
      ],
      "related": [
        "iptables",
        "ufw"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "ssh-keygen",
      "category": "Networking",
      "briefDescription": "Generates SSH key pair.",
      "keywords": [
        "ssh-keygen",
        "ssh",
        "key"
      ],
      "flags": [
        {
          "flag": "-t",
          "desc": "Type"
        },
        {
          "flag": "-b",
          "desc": "Bits"
        }
      ],
      "examples": [
        {
          "code": "ssh-keygen -t ed25519",
          "desc": "Ed25519"
        }
      ],
      "pitfall": "Don't overwrite existing id_ed25519",
      "related": [
        "ssh",
        "ssh-copy-id"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "ssh-copy-id",
      "category": "Networking",
      "briefDescription": "Installs SSH key on remote.",
      "keywords": [
        "ssh-copy-id",
        "ssh",
        "key"
      ],
      "flags": [
        {
          "flag": "-i",
          "desc": "Identity"
        }
      ],
      "examples": [
        {
          "code": "ssh-copy-id user@host",
          "desc": "Install"
        }
      ],
      "related": [
        "ssh",
        "ssh-keygen"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "sftp",
      "category": "Networking",
      "briefDescription": "Interactive SFTP session.",
      "keywords": [
        "sftp",
        "ftp",
        "secure"
      ],
      "flags": [],
      "examples": [
        {
          "code": "sftp user@host",
          "desc": "Connect"
        }
      ],
      "related": [
        "scp",
        "ssh"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "bzip2",
      "category": "Archiving",
      "briefDescription": "Compresses with bzip2.",
      "keywords": [
        "bzip2",
        "compress",
        "bzip"
      ],
      "flags": [
        {
          "flag": "-k",
          "desc": "Keep"
        }
      ],
      "examples": [
        {
          "code": "bzip2 -k file",
          "desc": "Keep original"
        }
      ],
      "related": [
        "gzip",
        "xz"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "xz",
      "category": "Archiving",
      "briefDescription": "Compresses with LZMA (high ratio).",
      "keywords": [
        "xz",
        "compress",
        "lzma"
      ],
      "flags": [
        {
          "flag": "-k",
          "desc": "Keep"
        }
      ],
      "examples": [
        {
          "code": "xz -k file",
          "desc": "Compress"
        }
      ],
      "related": [
        "gzip",
        "bzip2"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "7z",
      "category": "Archiving",
      "briefDescription": "7-Zip archiver (high compression).",
      "keywords": [
        "7z",
        "7zip",
        "compress"
      ],
      "flags": [],
      "examples": [
        {
          "code": "7z a archive.7z folder/",
          "desc": "Create"
        },
        {
          "code": "7z x archive.7z",
          "desc": "Extract"
        }
      ],
      "pitfall": "Needs p7zip-full",
      "related": [
        "zip",
        "tar"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "dd",
      "category": "Disk Management",
      "briefDescription": "Copies and converts raw data.",
      "keywords": [
        "dd",
        "copy",
        "raw",
        "disk"
      ],
      "flags": [
        {
          "flag": "if=",
          "desc": "Input"
        },
        {
          "flag": "of=",
          "desc": "Output"
        },
        {
          "flag": "bs=",
          "desc": "Block size"
        }
      ],
      "examples": [
        {
          "code": "dd if=/dev/zero of=file bs=1M count=100",
          "desc": "100M file"
        },
        {
          "code": "dd if=/dev/sda of=disk.img bs=4M",
          "desc": "Clone disk"
        }
      ],
      "pitfall": "dd nickname 'disk destroyer' — triple-check of=",
      "related": [
        "cp",
        "cat"
      ],
      "difficulty": "advanced"
    },
    {
      "command": "tee",
      "category": "Text Processing",
      "briefDescription": "Splits output to file + stdout.",
      "keywords": [
        "tee",
        "pipe",
        "split"
      ],
      "flags": [
        {
          "flag": "-a",
          "desc": "Append"
        }
      ],
      "examples": [
        {
          "code": "echo hi | tee file.txt",
          "desc": "Write + print"
        },
        {
          "code": "make | tee build.log",
          "desc": "Log build"
        }
      ],
      "related": [
        "xargs",
        "tr"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "xargs",
      "category": "Text Processing",
      "briefDescription": "Builds and executes commands from stdin.",
      "keywords": [
        "xargs",
        "execute",
        "stdin"
      ],
      "flags": [
        {
          "flag": "-I",
          "desc": "Replace"
        },
        {
          "flag": "-n",
          "desc": "Args per"
        }
      ],
      "examples": [
        {
          "code": "find . -name '*.log' | xargs rm",
          "desc": "Delete found"
        },
        {
          "code": "echo a b | xargs -n1 echo",
          "desc": "One per line"
        }
      ],
      "pitfall": "Filenames with spaces break xargs — use -0 + find -print0",
      "related": [
        "find",
        "tee"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "tr",
      "category": "Text Processing",
      "briefDescription": "Translates/deletes characters.",
      "keywords": [
        "tr",
        "translate",
        "delete"
      ],
      "flags": [
        {
          "flag": "-d",
          "desc": "Delete"
        }
      ],
      "examples": [
        {
          "code": "echo HELLO | tr 'A-Z' 'a-z'",
          "desc": "Lowercase"
        },
        {
          "code": "tr -d '\r' < dos.txt",
          "desc": "Strip CR"
        }
      ],
      "related": [
        "sed",
        "awk"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "column",
      "category": "Text Processing",
      "briefDescription": "Formats input into columns.",
      "keywords": [
        "column",
        "table",
        "format"
      ],
      "flags": [
        {
          "flag": "-t",
          "desc": "Table"
        }
      ],
      "examples": [
        {
          "code": "mount | column -t",
          "desc": "Align"
        }
      ],
      "related": [
        "printf",
        "cat"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "diff",
      "category": "Text Processing",
      "briefDescription": "Compares files line by line.",
      "keywords": [
        "diff",
        "compare",
        "patch"
      ],
      "flags": [
        {
          "flag": "-u",
          "desc": "Unified"
        }
      ],
      "examples": [
        {
          "code": "diff -u a.txt b.txt",
          "desc": "Unified diff"
        }
      ],
      "related": [
        "cmp",
        "patch"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "cmp",
      "category": "Text Processing",
      "briefDescription": "Compares files byte by byte.",
      "keywords": [
        "cmp",
        "compare"
      ],
      "flags": [
        {
          "flag": "-l",
          "desc": "Verbose"
        }
      ],
      "examples": [
        {
          "code": "cmp file1 file2",
          "desc": "Compare"
        }
      ],
      "related": [
        "diff"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "patch",
      "category": "Text Processing",
      "briefDescription": "Applies diff patch to file.",
      "keywords": [
        "patch",
        "diff",
        "apply"
      ],
      "flags": [
        {
          "flag": "-p1",
          "desc": "Strip"
        }
      ],
      "examples": [
        {
          "code": "patch < fix.patch",
          "desc": "Apply"
        }
      ],
      "related": [
        "diff"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "od",
      "category": "Text Processing",
      "briefDescription": "Octal dump of file.",
      "keywords": [
        "od",
        "dump",
        "octal"
      ],
      "flags": [
        {
          "flag": "-c",
          "desc": "Chars"
        }
      ],
      "examples": [
        {
          "code": "od -c file",
          "desc": "Chars"
        }
      ],
      "related": [
        "hexdump",
        "xxd"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "hexdump",
      "category": "Text Processing",
      "briefDescription": "Hex dump of file.",
      "keywords": [
        "hexdump",
        "hex",
        "dump"
      ],
      "flags": [
        {
          "flag": "-C",
          "desc": "Canonical"
        }
      ],
      "examples": [
        {
          "code": "hexdump -C file",
          "desc": "Hex+ASCII"
        }
      ],
      "related": [
        "od",
        "xxd"
      ],
      "difficulty": "intermediate"
    },
    {
      "command": "strings",
      "category": "Text Processing",
      "briefDescription": "Prints printable strings in file.",
      "keywords": [
        "strings",
        "binary",
        "text"
      ],
      "flags": [],
      "examples": [
        {
          "code": "strings /bin/ls | grep GLIBC",
          "desc": "Find strings"
        }
      ],
      "related": [
        "hexdump",
        "file"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "env",
      "category": "Shell & Scripting",
      "briefDescription": "Runs program with modified environment.",
      "keywords": [
        "env",
        "environment",
        "variable"
      ],
      "flags": [
        {
          "flag": "-i",
          "desc": "Clean"
        }
      ],
      "examples": [
        {
          "code": "env | sort",
          "desc": "List env"
        },
        {
          "code": "env -i bash",
          "desc": "Clean shell"
        }
      ],
      "related": [
        "export",
        "printenv"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "export",
      "category": "Shell & Scripting",
      "briefDescription": "Exports variable to child processes.",
      "keywords": [
        "export",
        "variable",
        "environment"
      ],
      "flags": [],
      "examples": [
        {
          "code": "export EDITOR=nano",
          "desc": "Set editor"
        }
      ],
      "pitfall": "export without value just marks existing",
      "related": [
        "env",
        "source"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "source",
      "category": "Shell & Scripting",
      "briefDescription": "Executes file in current shell.",
      "keywords": [
        "source",
        "dot",
        ". ",
        "bash"
      ],
      "flags": [],
      "examples": [
        {
          "code": "source ~/.bashrc",
          "desc": "Reload"
        },
        {
          "code": ". ./vars.sh",
          "desc": "Dot"
        }
      ],
      "related": [
        "bash",
        "export"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "type",
      "category": "Shell & Scripting",
      "briefDescription": "Describes how command would be interpreted.",
      "keywords": [
        "type",
        "command",
        "builtin"
      ],
      "flags": [
        {
          "flag": "-a",
          "desc": "All"
        }
      ],
      "examples": [
        {
          "code": "type ls",
          "desc": "ls is aliased"
        },
        {
          "code": "type -a python",
          "desc": "All python"
        }
      ],
      "related": [
        "which",
        "whereis"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "which",
      "category": "Shell & Scripting",
      "briefDescription": "Locates a command in PATH.",
      "keywords": [
        "which",
        "path",
        "locate"
      ],
      "flags": [
        {
          "flag": "-a",
          "desc": "All"
        }
      ],
      "examples": [
        {
          "code": "which python",
          "desc": "Path"
        },
        {
          "code": "which -a python",
          "desc": "All matches"
        }
      ],
      "pitfall": "which doesn't see shell functions — use type",
      "related": [
        "whereis",
        "type"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "whereis",
      "category": "Shell & Scripting",
      "briefDescription": "Locates binary/source/man for command.",
      "keywords": [
        "whereis",
        "binary",
        "man"
      ],
      "flags": [],
      "examples": [
        {
          "code": "whereis python",
          "desc": "All paths"
        }
      ],
      "related": [
        "which",
        "type"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "whatis",
      "category": "Shell & Scripting",
      "briefDescription": "Displays one-line manual description.",
      "keywords": [
        "whatis",
        "man",
        "description"
      ],
      "flags": [],
      "examples": [
        {
          "code": "whatis ls",
          "desc": "One line"
        }
      ],
      "related": [
        "man",
        "apropos"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "man",
      "category": "Shell & Scripting",
      "briefDescription": "Displays manual page.",
      "keywords": [
        "man",
        "manual",
        "help"
      ],
      "flags": [
        {
          "flag": "-k",
          "desc": "Apropos"
        }
      ],
      "examples": [
        {
          "code": "man ls",
          "desc": "Manual"
        },
        {
          "code": "man -k copy",
          "desc": "Search"
        }
      ],
      "related": [
        "whatis",
        "info"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "help",
      "category": "Shell & Scripting",
      "briefDescription": "Shows help for shell builtin.",
      "keywords": [
        "help",
        "builtin",
        "bash"
      ],
      "flags": [],
      "examples": [
        {
          "code": "help cd",
          "desc": "Help for cd"
        }
      ],
      "related": [
        "man",
        "type"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "date",
      "category": "System Info",
      "briefDescription": "Shows or sets date/time.",
      "keywords": [
        "date",
        "time",
        "clock"
      ],
      "flags": [
        {
          "flag": "+%Y-%m-%d",
          "desc": "Format"
        }
      ],
      "examples": [
        {
          "code": "date",
          "desc": "Now"
        },
        {
          "code": "date '+%F %T'",
          "desc": "Format"
        },
        {
          "code": "date -d '2 days ago'",
          "desc": "Relative"
        }
      ],
      "related": [
        "timedatectl",
        "cal"
      ],
      "difficulty": "beginner"
    },
    {
      "command": "cal",
      "category": "System Info",
      "briefDescription": "Shows calendar.",
      "keywords": [
        "cal",
        "calendar",
        "date"
      ],
      "flags": [],
      "examples": [
        {
          "code": "cal",
          "desc": "This month"
        },
        {
          "code": "cal 2026",
          "desc": "Year"
        }
      ],
      "related": [
        "date"
      ],
      "difficulty": "beginner"
    }
  ],
  "exercises": [
    {
      "id": 1,
      "title": "Difference between less and more",
      "text": "The <strong>more</strong> command is a legacy pager that allows you to view text files one screen at a time. However, it only allows forward navigation (scrolling down). The <strong>less</strong> command was created as a modern replacement (playfully named 'less is more') that allows both forward and backward navigation, searching, and doesn't need to read the entire file before starting.",
      "deepDive": [
        "<strong>Memory Efficiency:</strong> <code>less</code> does not have to read the entire input file before starting, making it significantly faster and more memory-efficient for massive log files.",
        "<strong>Navigation Shortcuts:</strong> Use <code>Space</code> or <code>Page Down</code> to move forward, <code>b</code> or <code>Page Up</code> to move backward. <code>g</code> jumps to the beginning, <code>G</code> jumps to the end.",
        "<strong>Searching:</strong> Press <code>/</code> followed by your search term, then <code>n</code> to go to the next match and <code>N</code> to go back to the previous match."
      ]
    },
    {
      "id": 2,
      "title": "Difference between cat and more",
      "text": "The <strong>cat</strong> (concatenate) command reads files sequentially and writes them to standard output. If a file is large, it will scroll past your screen instantly. <strong>more</strong> solves this by pausing the output at the bottom of your terminal screen, allowing you to press <code>Space</code> to continue reading.",
      "code": [
        "cat filename",
        "more filename"
      ],
      "deepDive": [
        "<strong>True Purpose of cat:</strong> <code>cat</code> is actually designed to join (concatenate) multiple files together into a single output stream, e.g., <code>cat file1.txt file2.txt > combined.txt</code>.",
        "<strong>Piping Output:</strong> You can pipe the output of any command into a pager: <code>dmesg | less</code> allows you to read kernel messages comfortably.",
        "<strong>Alternatives:</strong> If you only want to view a file, using <code>less</code> is almost always preferred over <code>cat</code> or <code>more</code>."
      ]
    },
    {
      "id": 3,
      "title": "Difference between rm and rmdir (using man)",
      "text": "The differences can be checked using the man pages. <strong>rm</strong> is used to remove files. It can also remove directories and their contents when used with the <strong>-r</strong> (recursive) option. <strong>rmdir</strong> is specifically used to remove empty directories and will fail if the directory contains any files.",
      "code": [
        "man rm",
        "man rmdir",
        "rm filename",
        "rm -r directory",
        "rmdir directory"
      ],
      "deepDive": [
        "<strong>Safety First:</strong> You can use <code>rm -ri</code> to prompt for confirmation before deleting every single file inside a directory, which is highly recommended when running as root.",
        "<strong>Under the Hood:</strong> <code>rm</code> doesn't actually securely erase data from the disk; it simply removes the link (filename) pointing to the inode (data block). The space is then marked as available by the filesystem.",
        "<strong>Force Deletion:</strong> The <code>-f</code> (force) flag ignores nonexistent files and never prompts. <code>rm -rf</code> is powerful and dangerous—always verify the path before hitting Enter."
      ]
    },
    {
      "id": 4,
      "title": "Create and manipulate directory hierarchy",
      "text": "Creating a structured directory tree requires understanding absolute paths, relative paths, and the <strong>-p</strong> (parents) flag. The <strong>-p</strong> flag tells <code>mkdir</code> to create all missing parent directories in a path.",
      "steps": [
        {
          "subtitle": "Initial Hierarchy Setup",
          "text": "Create the directories and file as specified.",
          "code": [
            "cd ~",
            "mkdir -p dir1/dir11 dir1/dir12 docs",
            "touch dir1/dir12/file1",
            "touch docs/mycv"
          ]
        },
        {
          "subtitle": "a. Remove dir11 in one step",
          "text": "Using <strong>rm dir1/dir11</strong> produces an error because rm does not remove directories without an appropriate option. The problem can be solved using the recursive option:",
          "code": [
            "rm -r dir1/dir11"
          ]
        },
        {
          "subtitle": "b. Remove dir12 using rmdir -p",
          "text": "Since dir12 contains file1, the file must first be removed. Then run <strong>rmdir -p</strong>. The -p option removes the specified directory and then attempts to remove its parent directory if the parent is empty. Since dir1 is also empty after removing dir12, both dir12 and dir1 are removed.",
          "code": [
            "rm dir1/dir12/file1",
            "rmdir -p dir1/dir12"
          ]
        },
        {
          "subtitle": "c. Absolute and relative paths for mycv",
          "text": "Assuming the output of pwd is /home/user:",
          "code": [
            "# Absolute path: /home/user/docs/mycv",
            "# Relative path: docs/mycv"
          ]
        }
      ],
      "deepDive": [
        "<strong>Absolute vs Relative:</strong> An absolute path starts from the root directory <code>/</code> (e.g., <code>/home/user/docs</code>). A relative path starts from your current working directory (e.g., <code>docs/mycv</code>).",
        "<strong>The '.' and '..' directories:</strong> Every directory contains a hidden <code>.</code> (current directory) and <code>..</code> (parent directory). You can use <code>cd ..</code> to go up one level.",
        "<strong>Why use rmdir -p?</strong> It is safer than <code>rm -r</code> because it strictly checks that directories are empty before removing them, preventing accidental data loss."
      ]
    },
    {
      "id": 5,
      "title": "Copy /etc/passwd to home directory",
      "text": "The <strong>cp</strong> command copies files. The first argument is the source, the second is the destination. Here, we copy the system file <code>/etc/passwd</code> to the home directory (<code>~</code>) and rename it to <code>mypasswd</code> in the same action.",
      "code": [
        "cp /etc/passwd ~/mypasswd"
      ],
      "deepDive": [
        "<strong>Understanding /etc/passwd:</strong> This file stores essential user account information (username, UID, GID, home directory, shell). It is world-readable, so you don't need <code>sudo</code> to copy it.",
        "<strong>Copying Directories:</strong> If you are copying a directory, you must use the recursive flag: <code>cp -r source_dir/ dest_dir/</code>.",
        "<strong>Preserving Attributes:</strong> Use <code>cp -p</code> to preserve the original file's mode, ownership, and timestamps."
      ]
    },
    {
      "id": 6,
      "title": "Rename mypasswd to oldpasswd",
      "text": "In Linux, there is no dedicated 'rename' command for a single file. The <strong>mv</strong> (move) command handles renaming. When the source and destination are on the same filesystem, <code>mv</code> simply updates the inode pointer with the new filename—it does not physically move data on the disk.",
      "code": [
        "mv ~/mypasswd ~/oldpasswd"
      ],
      "deepDive": [
        "<strong>Silent Overwriting:</strong> <code>mv</code> will silently overwrite a file if the destination name already exists. Use <code>mv -i</code> to get an interactive prompt before overwriting.",
        "<strong>Moving across filesystems:</strong> If you move a file to a different partition or drive, <code>mv</code> will actually copy the data to the new drive and delete the original, which takes longer.",
        "<strong>Bulk Renaming:</strong> For renaming multiple files at once (e.g., changing all .txt to .md), look into the <code>rename</code> command or a bash <code>for</code> loop."
      ]
    },
    {
      "id": 7,
      "title": "Four ways to go to your home directory",
      "text": "There are multiple ways to navigate to your home directory depending on whether you use shell expansions, environment variables, or absolute paths.",
      "code": [
        "cd ~",
        "cd",
        "cd $HOME",
        "cd /home/user"
      ],
      "deepDive": [
        "<strong>cd ~:</strong> The tilde (<code>~</code>) is a shell expansion that the terminal translates into your home directory path before executing the command.",
        "<strong>cd:</strong> By default, if you type <code>cd</code> without any arguments, the shell assumes you mean your home directory.",
        "<strong>cd $HOME:</strong> <code>$HOME</code> is an environment variable that stores your home directory path. This is the most script-safe method.",
        "<strong>cd /home/user:</strong> A literal absolute path. Useful in scripts where environment variables might not be set, but requires hardcoding the username."
      ]
    },
    {
      "id": 8,
      "title": "List commands in /usr/bin starting with 'w'",
      "text": "Bash shell expansions (globs) allow you to match filenames using wildcards. The asterisk (<strong>*</strong>) matches any string of characters (including zero characters).",
      "code": [
        "ls /usr/bin/w*"
      ],
      "deepDive": [
        "<strong>How Globbing Works:</strong> The shell itself expands <code>/usr/bin/w*</code> into a list of matching files before passing them to <code>ls</code>. If no files match, <code>ls</code> might throw an error.",
        "<strong>The '?' wildcard:</strong> The question mark matches exactly one character. e.g., <code>ls /usr/bin/w?</code> matches <code>wc</code> but not <code>wget</code>.",
        "<strong>Character classes:</strong> <code>[w-z]*</code> matches files starting with w, x, y, or z. <code>[!w]*</code> matches files NOT starting with w."
      ]
    },
    {
      "id": 9,
      "title": "Display the first four lines of /etc/passwd",
      "text": "The <strong>head</strong> command outputs the first part of a file. By default, it shows the first 10 lines, but you can specify exactly how many with the <strong>-n</strong> flag.",
      "code": [
        "head -n 4 /etc/passwd"
      ],
      "deepDive": [
        "<strong>Byte limit:</strong> Use <code>head -c 100 filename</code> to output the first 100 bytes instead of lines.",
        "<strong>Multiple files:</strong> <code>head</code> can take multiple files: <code>head file1.txt file2.txt</code> will show the head of both with headers labeling them.",
        "<strong>Negative lines:</strong> <code>head -n -5 file.txt</code> outputs the whole file *except* the last 5 lines."
      ]
    },
    {
      "id": 10,
      "title": "Display the last seven lines of /etc/passwd",
      "text": "The <strong>tail</strong> command outputs the last part of a file. It is most commonly used with the <strong>-f</strong> flag to follow live logs in real-time.",
      "code": [
        "tail -n 7 /etc/passwd"
      ],
      "deepDive": [
        "<strong>Live Monitoring:</strong> <code>tail -f /var/log/syslog</code> keeps the file open and displays new lines as they are written by the system.",
        "<strong>How -f works:</strong> Under the hood, <code>tail -f</code> uses the <code>inotify</code> (inode notify) Linux subsystem to receive instant updates when the file changes on disk.",
        "<strong>Starting from a pattern:</strong> <code>tail -n +5 file.txt</code> outputs the file starting from the 5th line to the end."
      ]
    }
  ],
  "links": {
    "soft": {
      "definition": "A soft link is essentially a shortcut. It points to the path of another file.",
      "properties": [
        "If the original file is deleted, the soft link breaks (dangling link).",
        "Can link across different file systems and partitions.",
        "Can link directories."
      ],
      "syntax": "ln -s /path/to/original /path/to/symlink",
      "example": "ln -s /var/www/html/myapp/config.yaml ~/config_link"
    },
    "hard": {
      "definition": "A hard link is a mirror copy of a file's inode (the data structure that stores file metadata and location on the disk).",
      "properties": [
        "If the original file is deleted, the hard link still works because the inode data is still intact.",
        "Cannot cross file systems/partitions.",
        "Cannot link directories (only files).",
        "Changing the content of the original or the hard link updates both."
      ],
      "syntax": "ln /path/to/original /path/to/hardlink",
      "example": "ln /var/log/app.log ~/app_log_backup"
    },
    "comparison": [
      {
        "feature": "Points to",
        "soft": "File path (name)",
        "hard": "Inode (physical disk data)"
      },
      {
        "feature": "If original deleted",
        "soft": "Link breaks (invalid)",
        "hard": "Link remains valid"
      },
      {
        "feature": "Can link directories?",
        "soft": "Yes",
        "hard": "No"
      },
      {
        "feature": "Cross file system?",
        "soft": "Yes",
        "hard": "No"
      },
      {
        "feature": "Command",
        "soft": "ln -s target link_name",
        "hard": "ln target link_name"
      }
    ]
  },
  "helpfulLinks": [
    {
      "title": "RH124 Full Course Walkthrough (YouTube)",
      "desc": "A comprehensive video walkthrough following the Red Hat RH124 curriculum used in this NTI course.",
      "url": "https://www.youtube.com/watch?v=gojeTqXdBH0&t=1s"
    },
    {
      "title": "Red Hat Academy",
      "desc": "Official Red Hat training and certification portal for the RH124/RH134 curriculum.",
      "url": "https://www.redhat.com/en/services/training/red-hat-academy"
    }
  ],
  "course": {
    "modules": [
      {
        "number": 1,
        "title": "The Basics",
        "concepts": [
          "What is Linux?",
          "Open Source",
          "Distributions (Ubuntu, CentOS, Debian)"
        ],
        "skills": [
          "Navigating the terminal (cd, ls, pwd)"
        ],
        "project": "Install Linux (via WSL or VirtualBox) and navigate the file system without a GUI."
      },
      {
        "number": 2,
        "title": "File Management & Text Editing",
        "concepts": [
          "The Linux File Hierarchy Standard (/etc, /var, /home, /tmp)"
        ],
        "skills": [
          "Creating/moving files (touch, mkdir, cp, mv, rm)",
          "Using nano and vim",
          "Reading files (cat, less, tail)"
        ],
        "project": "Create a directory structure for a fake project and write a README file using vim."
      },
      {
        "number": 3,
        "title": "Searching & Filtering",
        "concepts": [
          "Regular Expressions (Regex)",
          "Piping (|)",
          "Redirection (>, >>)"
        ],
        "skills": [
          "grep",
          "find",
          "awk",
          "sed"
        ],
        "project": "Search the /var/log/syslog for 'error' and save those specific lines to a new file called errors.log."
      },
      {
        "number": 4,
        "title": "User & Permission Management",
        "concepts": [
          "Users, Groups",
          "Root vs. Standard User",
          "File Permissions (Read/Write/Execute)"
        ],
        "skills": [
          "sudo, su",
          "useradd, usermod",
          "chmod (numeric and symbolic)",
          "chown"
        ],
        "project": "Create a new user, add them to a group, and give that group read-only access to a specific directory."
      },
      {
        "number": 5,
        "title": "Software Installation & Processes",
        "concepts": [
          "Package Managers",
          "Daemons/Services",
          "PID"
        ],
        "skills": [
          "apt/yum/dnf",
          "systemctl (start, stop, enable, status)",
          "ps, top, kill"
        ],
        "project": "Install the Nginx web server, start the service, and ensure it restarts automatically on boot."
      },
      {
        "number": 6,
        "title": "Networking & SSH",
        "concepts": [
          "IP Addressing",
          "Ports",
          "SSH Keys"
        ],
        "skills": [
          "ip, ping, curl",
          "netstat / ss",
          "ssh-keygen, ssh-copy-id"
        ],
        "project": "Generate an SSH key pair and set up passwordless SSH login between two Linux machines."
      },
      {
        "number": 7,
        "title": "Shell Scripting Basics",
        "concepts": [
          "Automation",
          "Variables",
          "Conditionals",
          "Loops"
        ],
        "skills": [
          "Writing .sh files",
          "if statements",
          "for loops",
          "cron for scheduling"
        ],
        "project": "Write a bash script that checks if Nginx is running. If not, start it and log the event. Schedule via cron every 5 minutes."
      }
    ],
    "days": [
      {
        "id": "day1",
        "title": "Get Started with RHEL & Files",
        "topics": [
          "Learning Objectives",
          "Understanding Linux and Its Origins",
          "Linux Components",
          "Virtual Machines & Network Setup",
          "Minimum Requirements for RHEL 9",
          "Access the Command Line"
        ],
        "content": []
      },
      {
        "id": "day2",
        "title": "Get Help, Text Files & Users",
        "topics": [
          "Learning Objectives",
          "Get Help in Red Hat Enterprise Linux",
          "Create, View, and Edit Text Files",
          "Word Count & Pipelines Deep Dive",
          "Manage Local Users and Groups",
          "Key Takeaways"
        ],
        "content": []
      },
      {
        "id": "day3",
        "title": "Coming Soon — Stay Tuned",
        "topics": [
          "Permissions & Processes",
          "SSH, Logs & Networking",
          "Archiving & Packages"
        ],
        "content": []
      }
    ]
  },
  "topicIndex": [
    {
      "title": "Linux Origins & Distributions",
      "desc": "History, distros, why Linux",
      "links": [
        {
          "label": "Day 1 · Origins",
          "view": "day1-content"
        },
        {
          "label": "Rahma · Concepts",
          "view": "notes-rahma"
        }
      ]
    },
    {
      "title": "Kernel, Shell & Swap",
      "desc": "Kernel vs shell, swap, VM",
      "links": [
        {
          "label": "Day 1 · Components",
          "view": "day1-content"
        },
        {
          "label": "Rahma · VM Network",
          "view": "notes-rahma"
        }
      ]
    },
    {
      "title": "Filesystem Hierarchy",
      "desc": "FHS, /etc /var /home",
      "links": [
        {
          "label": "Day 1 · FHS",
          "view": "day1-content"
        },
        {
          "label": "Michael · Navigation",
          "view": "notes-michael"
        }
      ]
    },
    {
      "title": "File Operations",
      "desc": "cd, ls, mkdir, cp, mv, rm",
      "links": [
        {
          "label": "Day 1 · File Mgmt",
          "view": "day1-content"
        },
        {
          "label": "Hager · File Mgmt",
          "view": "notes-hager"
        }
      ]
    },
    {
      "title": "Inodes & Links",
      "desc": "Inodes, hard vs soft links",
      "links": [
        {
          "label": "Day 1 · Links",
          "view": "day1-content"
        },
        {
          "label": "Michael · Inodes",
          "view": "notes-michael"
        }
      ]
    },
    {
      "title": "Pattern Matching & grep",
      "desc": "Glob, regex, grep, cut",
      "links": [
        {
          "label": "Day 1 · Pattern",
          "view": "day1-content"
        },
        {
          "label": "Sagda · Redirection",
          "view": "notes-sagda"
        }
      ]
    },
    {
      "title": "Man Pages & Help",
      "desc": "man sections, whatis, mandb",
      "links": [
        {
          "label": "Day 2 · Get Help",
          "view": "day2-content"
        },
        {
          "label": "Sagda · Man Pages",
          "view": "notes-sagda"
        }
      ]
    },
    {
      "title": "Redirection & Pipelines",
      "desc": "FD 0/1/2, >, >>, |, wc",
      "links": [
        {
          "label": "Day 2 · Redirection",
          "view": "day2-content"
        },
        {
          "label": "Mohammed · Pipelines",
          "view": "notes-tarek"
        }
      ]
    },
    {
      "title": "Vim / Vi",
      "desc": "Modes, save/quit, search/replace",
      "links": [
        {
          "label": "Day 2 · Vim",
          "view": "day2-content"
        },
        {
          "label": "Sagda · Vim",
          "view": "notes-sagda"
        }
      ]
    },
    {
      "title": "Users, Groups & Passwords",
      "desc": "UID, /etc/passwd, chage, su/visudo",
      "links": [
        {
          "label": "Day 2 · Users",
          "view": "day2-content"
        },
        {
          "label": "Sagda · Users",
          "view": "notes-sagda"
        }
      ]
    }
  ],
  "content": {
    "tracks": [
      {
        "id": "foundations",
        "label": "Start Here — Foundations"
      },
      {
        "id": "system-ops",
        "label": "System Operations"
      },
      {
        "id": "network-security",
        "label": "Networking & Security"
      },
      {
        "id": "ops-automation",
        "label": "Servers & Automation"
      }
    ],
    "sections": [
      {
        "id": "linux-rules",
        "title": "Linux System & Command Rules — Reference Guide",
        "icon": "book",
        "category": "reference",
        "track": "foundations",
        "level": "beginner",
        "order": 1,
        "preview": "The mental model behind Linux — everything is a file, one tree, plain-text config. Read this first.",
        "words": 2385,
        "parts": 15
      },
      {
        "id": "important-files",
        "title": "Important Files Worth Generating on a Linux / Dev System",
        "icon": "file",
        "category": "system",
        "track": "foundations",
        "level": "beginner",
        "order": 2,
        "preview": "/etc, /var, /proc — the key files every admin reads and maintains, and what breaks when they vanish.",
        "words": 754,
        "parts": 11
      },
      {
        "id": "vim-nano",
        "title": "Vim / Vi & Nano — The Complete Guide",
        "icon": "file",
        "category": "editing",
        "track": "foundations",
        "level": "beginner",
        "order": 3,
        "preview": "Survive and then thrive in vim and nano — the editors you will find on every server you ever SSH into.",
        "words": 2151,
        "parts": 27
      },
      {
        "id": "bash-scripting",
        "title": "Bash Scripting Deep Dive",
        "icon": "terminal",
        "category": "development",
        "track": "foundations",
        "level": "intermediate",
        "order": 4,
        "preview": "Functions, arrays, loops, and error handling for writing robust bash scripts that fail loudly.",
        "words": 1856,
        "parts": 12
      },
      {
        "id": "disk-storage",
        "title": "Disk & Storage Management — Partitions, LVM, Mounting & fstab",
        "icon": "database",
        "category": "storage",
        "track": "system-ops",
        "level": "intermediate",
        "order": 5,
        "preview": "Partitions, mounts, LVM and df/du — understand disk layout and never run out of space by surprise.",
        "words": 1970,
        "parts": 12
      },
      {
        "id": "linux-boot",
        "title": "The Linux Boot Process — BIOS/UEFI → GRUB → systemd",
        "icon": "zap",
        "category": "system",
        "track": "system-ops",
        "level": "intermediate",
        "order": 6,
        "preview": "From BIOS/UEFI to login prompt — every stage of boot, and how to diagnose a machine that won’t come up.",
        "words": 1915,
        "parts": 9
      },
      {
        "id": "systemd-deep-dive",
        "title": "systemd Deep Dive — Unit Files & Timers (The Modern Cron Replacement)",
        "icon": "cpu",
        "category": "system",
        "track": "system-ops",
        "level": "intermediate",
        "order": 7,
        "preview": "Units, targets, journalctl and timers — run services properly on any modern distro.",
        "words": 1758,
        "parts": 12
      },
      {
        "id": "process-monitoring",
        "title": "Process & Performance Monitoring — Diagnosing Slow or Crashing Services",
        "icon": "activity",
        "category": "monitoring",
        "track": "system-ops",
        "level": "intermediate",
        "order": 8,
        "preview": "ps, top, htop and load averages — find the process eating your CPU and read performance signals with confidence.",
        "words": 1844,
        "parts": 10
      },
      {
        "id": "failure-scenarios",
        "title": "Linux Failure Scenarios — What Actually Causes Errors & File Corruption",
        "icon": "alert",
        "category": "troubleshooting",
        "track": "system-ops",
        "level": "advanced",
        "order": 9,
        "preview": "Disk full at 3am? Server unresponsive? Walk through common failure scenarios and their rescue playbooks.",
        "words": 1746,
        "parts": 12
      },
      {
        "id": "log-management",
        "title": "Log Management — syslog vs journald, logrotate & Where Logs Actually Live",
        "icon": "eye",
        "category": "logging",
        "track": "system-ops",
        "level": "intermediate",
        "order": 10,
        "preview": "journald, rsyslog and log rotation — find the signal in /var/log before the noise buries it.",
        "words": 1320,
        "parts": 6
      },
      {
        "id": "network-troubleshooting",
        "title": "Networking Troubleshooting Toolkit — \"Why Can't This Reach That?\"",
        "icon": "network",
        "category": "networking",
        "track": "network-security",
        "level": "intermediate",
        "order": 11,
        "preview": "ping to tcpdump — a layered toolkit for diagnosing “the network is down”, from cable to DNS.",
        "words": 1622,
        "parts": 10
      },
      {
        "id": "ssh-guide",
        "title": "SSH Remote Access From Outside Your Network — Complete Guide",
        "icon": "network",
        "category": "networking",
        "track": "network-security",
        "level": "intermediate",
        "order": 12,
        "preview": "Keys, agents, tunnels and ssh_config — remote access done securely without password fatigue.",
        "words": 1705,
        "parts": 13
      },
      {
        "id": "firewall",
        "title": "Firewall Deep Dive — ufw vs iptables vs nftables",
        "icon": "check",
        "category": "security",
        "track": "network-security",
        "level": "advanced",
        "order": 13,
        "preview": "firewalld and nftables in depth — zones, rules and the exact commands that open (or close) a port safely.",
        "words": 1755,
        "parts": 8
      },
      {
        "id": "server-hardening",
        "title": "General Server Hardening — Beyond SSH",
        "icon": "check",
        "category": "security",
        "track": "network-security",
        "level": "advanced",
        "order": 14,
        "preview": "A practical hardening checklist — users, sudo, SSH, updates and auditing for internet-facing servers.",
        "words": 1436,
        "parts": 7
      },
      {
        "id": "docker-containers",
        "title": "Docker & Containers — Full Guide",
        "icon": "layers",
        "category": "containers",
        "track": "ops-automation",
        "level": "intermediate",
        "order": 15,
        "preview": "Images, containers, volumes and networking — run services in Docker without cargo-culting Dockerfiles.",
        "words": 2146,
        "parts": 12
      },
      {
        "id": "ansible-basics",
        "title": "Ansible Basics — Write Once, Apply to Every Server",
        "icon": "clipboard",
        "category": "automation",
        "track": "ops-automation",
        "level": "intermediate",
        "order": 16,
        "preview": "Playbooks, inventories and idempotency — automate ten servers as easily as one.",
        "words": 1763,
        "parts": 16
      },
      {
        "id": "monitoring-stack",
        "title": "Monitoring Stack Setup — Prometheus + Grafana From Zero",
        "icon": "eye",
        "category": "monitoring",
        "track": "ops-automation",
        "level": "advanced",
        "order": 17,
        "preview": "Prometheus + Grafana + alerting rules — see server health before your users do.",
        "words": 1416,
        "parts": 11
      },
      {
        "id": "tmux-screen",
        "title": "tmux & screen — Sessions That Survive a Disconnect",
        "icon": "terminal",
        "category": "terminal",
        "track": "ops-automation",
        "level": "beginner",
        "order": 18,
        "preview": "Sessions that survive disconnects — tmux basics that pay off the first time your SSH drops mid-task.",
        "words": 1324,
        "parts": 7
      },
      {
        "id": "data-engineers",
        "title": "📖 التفريغ الشامل والمفصل: Linux for Data Engineers",
        "icon": "cpu",
        "category": "data",
        "track": "ops-automation",
        "level": "intermediate",
        "order": 19,
        "preview": "The Linux concepts data pipelines actually touch — filesystems, processes, cron and resource limits.",
        "words": 777,
        "parts": 6
      }
    ]
  }
};

const ICONS = {
  folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  cpu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>',
  network: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0020 0h-3"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
  moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>',
  clipboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>',
  database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>',
  terminal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/></svg>',
  zap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
  hash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
  map: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>'
};
