
// ===== DATA MODEL =====
const DATA = {
  categories: [
    {
      id: "navigation",
      title: "File & Directory Navigation",
      icon: "folder",
      commands: [
        { command: "pwd", description: "Print working directory", example: "pwd", notes: "Useful in scripts to get absolute paths — combine with $(pwd)." },
        { command: "ls", description: "List directory contents", example: "ls -la", notes: "-a shows dotfiles (.bashrc etc.); -h with -l gives human-readable sizes." },
        { command: "cd", description: "Change directory", example: "cd /var/log", notes: "cd - jumps back to previous directory; cd alone goes home." },
        { command: "tree", description: "List contents in a tree-like format", example: "tree -L 2", notes: "Not installed by default — sudo apt install tree." }
      ]
    },
    {
      id: "manipulation",
      title: "File Manipulation",
      icon: "file",
      commands: [
        { command: "touch", description: "Create an empty file / update timestamp", example: "touch newfile.txt", notes: "If the file exists, it only updates the modified timestamp — no data is lost." },
        { command: "mkdir", description: "Make a directory", example: "mkdir -p dir/subdir", notes: "Without -p, it fails if parent directories don't already exist." },
        { command: "cp", description: "Copy files/directories", example: "cp -r source_dir/ dest_dir/", notes: "-r is required for directories; use -i to get a prompt before overwriting." },
        { command: "mv", description: "Move or rename files", example: "mv oldname.txt newname.txt", notes: "No -i prompt by default — silently overwrites an existing destination file." },
        { command: "rm", description: "Remove files/directories", example: "rm -rf folder/", notes: "There is no Recycle Bin. rm -rf is permanent and irreversible — double-check the path." }
      ]
    },
    {
      id: "viewing",
      title: "Viewing & Editing Text",
      icon: "eye",
      commands: [
        { command: "cat", description: "Concatenate and print file content", example: "cat file.txt", notes: "Not ideal for huge files — it dumps everything at once; use less instead." },
        { command: "less", description: "View file content page by page", example: "less largefile.log", notes: "/searchterm searches forward, n repeats the search — much better than more." },
        { command: "head/tail", description: "View first/last lines of a file", example: "tail -f app.log", notes: "-f is the go-to for watching live logs; Ctrl+C to stop following." },
        { command: "grep", description: "Search text within files", example: 'grep -i "error" /var/log/syslog', notes: "-r for recursive search, -n for line numbers, -v to invert (exclude matches)." },
        { command: "nano/vim", description: "Terminal text editors", example: "nano config.yaml", notes: "nano is beginner-friendly; vim has a steeper curve — :q! quits without saving." }
      ]
    },
    {
      id: "system",
      title: "System & Process Management",
      icon: "cpu",
      commands: [
        { command: "top/htop", description: "Interactive process viewer", example: "htop", notes: "htop is friendlier and color-coded but usually needs installing separately." },
        { command: "ps", description: "Snapshot of current processes", example: "ps aux | grep python", notes: "aux shows all processes for all users, not just yours — combine with grep to filter." },
        { command: "kill", description: "Terminate a process by PID", example: "kill -9 1234", notes: "-9 force-kills without letting the process clean up — try plain kill (SIGTERM) first." },
        { command: "systemctl", description: "Manage system services", example: "sudo systemctl restart nginx", notes: "Use systemctl status service_name to check if something actually started correctly." },
        { command: "df", description: "Disk space usage", example: "df -h", notes: "Checks whole filesystems/partitions — good first check when you get 'no space left on device'." },
        { command: "du", description: "Directory space usage", example: "du -sh /var/log", notes: "Without -s it recursively lists every subfolder's size — can be slow on large trees." }
      ]
    },
    {
      id: "networking",
      title: "Networking & Permissions",
      icon: "network",
      commands: [
        { command: "chmod", description: "Change file permissions", example: "chmod +x script.sh", notes: "Never use chmod 777 casually — it grants everyone full read/write/execute access." },
        { command: "chown", description: "Change file owner", example: "sudo chown user:group file.txt", notes: "Usually requires sudo; changing ownership on system files can break services." },
        { command: "ip", description: "Show/manipulate IP addresses", example: "ip a", notes: "Replaces the older, deprecated ifconfig on most modern distros." },
        { command: "curl", description: "Transfer data from URLs", example: "curl -O https://example.com/file.zip", notes: "-O saves with the remote filename; add -L to follow redirects." },
        { command: "ssh", description: "Secure shell remote login", example: "ssh username@192.168.1.10", notes: "Add -p PORT for a non-default port; key-based auth (ssh-keygen) is safer than passwords." }
      ]
    },
    {
      id: "archiving",
      title: "Archiving & Compression",
      icon: "folder",
      commands: [
        { command: "tar", description: "Archive files into a tarball", example: "tar -czvf archive.tar.gz folder/", notes: "-c create, -z gzip, -v verbose, -f file. Use -x to extract: tar -xzvf archive.tar.gz." },
        { command: "gzip/gunzip", description: "Compress or decompress files", example: "gzip file.log", notes: "gzip replaces the file with file.log.gz; use -k to keep the original, gunzip to reverse." },
        { command: "zip/unzip", description: "Package files into a .zip archive", example: "zip -r app.zip app/", notes: "Cross-platform archives; -r is required to include subdirectories." },
        { command: "rsync", description: "Efficiently sync files/directories", example: "rsync -avz src/ user@host:/dest", notes: "-a preserves permissions, -v verbose, -z compresses. Great for backups and deploys." }
      ]
    },
    {
      id: "git",
      title: "Version Control (Git)",
      icon: "file",
      commands: [
        { command: "git clone", description: "Copy a remote repository locally", example: "git clone https://github.com/user/repo.git", notes: "Add a folder name at the end to clone into a specific directory." },
        { command: "git status", description: "Show working tree state", example: "git status -s", notes: "-s gives a short, concise output of changed files." },
        { command: "git commit", description: "Record staged changes", example: "git commit -m \"fix: typo\"", notes: "Use git add first to stage; -a commits already-tracked modified files." },
        { command: "git push/pull", description: "Upload or download commits", example: "git push origin main", notes: "pull = fetch + merge. Use --set-upstream (-u) the first time you push a branch." },
        { command: "git branch", description: "List or create branches", example: "git checkout -b feature", notes: "checkout -b creates and switches; git merge feature integrates changes." }
      ]
    },
    {
      id: "docker",
      title: "Containers (Docker)",
      icon: "cpu",
      commands: [
        { command: "docker run", description: "Run a container from an image", example: "docker run -d -p 8080:80 nginx", notes: "-d detached, -p host:container port mapping. Image is pulled if missing." },
        { command: "docker ps", description: "List running containers", example: "docker ps -a", notes: "-a shows all containers including stopped ones." },
        { command: "docker build", description: "Build an image from a Dockerfile", example: "docker build -t myapp .", notes: "-t tags the image; the . is the build context (current dir)." },
        { command: "docker compose", description: "Manage multi-container apps", example: "docker compose up -d", notes: "Reads docker-compose.yml; -d starts in the background." }
      ]
    }
  ],
  commandsBank: [
    { command: "ls", category: "File System", briefDescription: "Lists directory contents.", keywords: ["list", "directory", "folder", "contents", "view"] },
    { command: "cd", category: "File System", briefDescription: "Changes the current working directory.", keywords: ["change", "navigate", "enter", "path", "folder"] },
    { command: "pwd", category: "File System", briefDescription: "Prints the current working directory path.", keywords: ["print", "working", "directory", "path", "location", "where"] },
    { command: "mkdir", category: "File System", briefDescription: "Creates a new directory.", keywords: ["make", "create", "new", "folder", "directory"] },
    { command: "rmdir", category: "File System", briefDescription: "Removes an empty directory.", keywords: ["remove", "delete", "empty", "folder", "directory"] },
    { command: "rm", category: "File System", briefDescription: "Removes files or directories.", keywords: ["remove", "delete", "erase", "destroy"] },
    { command: "cp", category: "File System", briefDescription: "Copies files or directories.", keywords: ["copy", "duplicate", "paste", "clone"] },
    { command: "mv", category: "File System", briefDescription: "Moves or renames files and directories.", keywords: ["move", "rename", "transfer", "relocate"] },
    { command: "touch", category: "File System", briefDescription: "Creates an empty file or updates timestamps.", keywords: ["create", "new", "file", "timestamp", "empty"] },
    { command: "find", category: "File System", briefDescription: "Searches for files in a directory hierarchy.", keywords: ["locate", "search", "files", "directories", "name", "pattern"] },
    { command: "tar", category: "File System", briefDescription: "Archives files into a tarball.", keywords: ["archive", "compress", "extract", "zip", "gzip", "tarball"] },
    { command: "cat", category: "Text Processing", briefDescription: "Reads and outputs file contents.", keywords: ["concatenate", "read", "view", "print", "file"] },
    { command: "less", category: "Text Processing", briefDescription: "Views file contents one page at a time.", keywords: ["read", "scroll", "view", "pager", "text"] },
    { command: "more", category: "Text Processing", briefDescription: "Views file contents page by page (forward only).", keywords: ["read", "scroll", "view", "pager", "text"] },
    { command: "head", category: "Text Processing", briefDescription: "Outputs the first lines of a file.", keywords: ["top", "beginning", "first", "start", "read"] },
    { command: "tail", category: "Text Processing", briefDescription: "Outputs the last lines of a file.", keywords: ["bottom", "end", "last", "log", "follow"] },
    { command: "grep", category: "Text Processing", briefDescription: "Searches for patterns within text.", keywords: ["search", "find", "filter", "pattern", "regex", "text"] },
    { command: "awk", category: "Text Processing", briefDescription: "Pattern scanning and processing language.", keywords: ["pattern", "process", "column", "text", "parse"] },
    { command: "sed", category: "Text Processing", briefDescription: "Stream editor for filtering and transforming text.", keywords: ["stream", "edit", "replace", "substitute", "text"] },
    { command: "nano", category: "Text Processing", briefDescription: "A simple terminal text editor.", keywords: ["edit", "editor", "vim", "text", "modify"] },
    { command: "vim", category: "Text Processing", briefDescription: "Advanced terminal text editor.", keywords: ["edit", "editor", "vi", "text", "modify"] },
    { command: "sort", category: "Text Processing", briefDescription: "Sorts lines of text files.", keywords: ["order", "arrange", "alphabetical", "numeric", "text"] },
    { command: "uniq", category: "Text Processing", briefDescription: "Reports or omits repeated lines.", keywords: ["unique", "duplicate", "distinct", "filter", "text"] },
    { command: "wc", category: "Text Processing", briefDescription: "Counts words, lines, and bytes.", keywords: ["word", "count", "line", "byte", "size"] },
    { command: "chmod", category: "Permissions", briefDescription: "Changes file access permissions.", keywords: ["change", "mode", "permissions", "execute", "read", "write"] },
    { command: "chown", category: "Permissions", briefDescription: "Changes file owner and group.", keywords: ["change", "owner", "user", "group", "permissions"] },
    { command: "sudo", category: "Permissions", briefDescription: "Executes a command as the superuser.", keywords: ["superuser", "root", "admin", "privileges", "elevated"] },
    { command: "su", category: "Permissions", briefDescription: "Switches the current user.", keywords: ["switch", "user", "substitute", "root"] },
    { command: "ps", category: "Process Management", briefDescription: "Reports a snapshot of current processes.", keywords: ["process", "status", "running", "tasks", "pid"] },
    { command: "kill", category: "Process Management", briefDescription: "Terminates a process by PID.", keywords: ["terminate", "stop", "end", "close", "force", "process"] },
    { command: "killall", category: "Process Management", briefDescription: "Terminates processes by name.", keywords: ["terminate", "stop", "kill", "name", "process"] },
    { command: "top", category: "Process Management", briefDescription: "Displays real-time system processes and resources.", keywords: ["monitor", "task", "manager", "cpu", "memory", "processes"] },
    { command: "htop", category: "Process Management", briefDescription: "Interactive process viewer.", keywords: ["monitor", "task", "manager", "cpu", "memory", "interactive"] },
    { command: "systemctl", category: "Process Management", briefDescription: "Manages system services and daemons.", keywords: ["service", "daemon", "start", "stop", "restart", "systemd"] },
    { command: "df", category: "System Info", briefDescription: "Reports file system disk space usage.", keywords: ["disk", "free", "space", "storage", "filesystem"] },
    { command: "du", category: "System Info", briefDescription: "Estimates file and directory space usage.", keywords: ["disk", "usage", "size", "space", "directory"] },
    { command: "free", category: "System Info", briefDescription: "Displays amount of free and used memory.", keywords: ["memory", "ram", "swap", "usage"] },
    { command: "uname", category: "System Info", briefDescription: "Prints system information.", keywords: ["system", "kernel", "os", "version", "architecture"] },
    { command: "uptime", category: "System Info", briefDescription: "Shows how long the system has been running.", keywords: ["time", "running", "load", "average"] },
    { command: "whoami", category: "System Info", briefDescription: "Prints the current user name.", keywords: ["identity", "user", "id", "who"] },
    { command: "history", category: "System Info", briefDescription: "Shows the command line history.", keywords: ["past", "commands", "log", "terminal", "previous"] },
    { command: "ping", category: "Networking", briefDescription: "Tests network connectivity to a host.", keywords: ["network", "internet", "test", "latency", "connection", "ip"] },
    { command: "ip", category: "Networking", briefDescription: "Shows or manipulates routing and network devices.", keywords: ["address", "interface", "mac", "config", "network"] },
    { command: "ifconfig", category: "Networking", briefDescription: "Configures network interfaces (legacy).", keywords: ["address", "interface", "mac", "config", "network"] },
    { command: "curl", category: "Networking", briefDescription: "Transfers data to or from a server.", keywords: ["url", "web", "api", "http", "request", "download"] },
    { command: "wget", category: "Networking", briefDescription: "Downloads files from the web non-interactively.", keywords: ["download", "web", "url", "internet", "fetch"] },
    { command: "ssh", category: "Networking", briefDescription: "Logs into a remote machine securely.", keywords: ["secure", "shell", "remote", "login", "server", "connect"] },
    { command: "scp", category: "Networking", briefDescription: "Securely copies files between hosts.", keywords: ["secure", "copy", "transfer", "remote", "ssh"] },
    { command: "netstat", category: "Networking", briefDescription: "Displays network connections and ports.", keywords: ["network", "ports", "connections", "listening", "socket"] },
    { command: "ss", category: "Networking", briefDescription: "Displays socket statistics (modern netstat).", keywords: ["network", "ports", "connections", "socket", "statistics"] },
    { command: "apt", category: "Package Management", briefDescription: "Installs, updates, and removes Debian packages.", keywords: ["install", "update", "upgrade", "remove", "software", "ubuntu", "debian"] },
    { command: "yum", category: "Package Management", briefDescription: "Installs and manages RPM packages.", keywords: ["install", "update", "remove", "software", "centos", "rhel"] },
    { command: "dnf", category: "Package Management", briefDescription: "Modern version of yum for Fedora/RHEL.", keywords: ["install", "update", "remove", "software", "fedora"] },
    { command: "pacman", category: "Package Management", briefDescription: "Package manager for Arch Linux.", keywords: ["install", "update", "remove", "software", "arch"] },
    { command: "clear", category: "System Info", briefDescription: "Clears the terminal screen.", keywords: ["clean", "clear", "reset", "console", "screen"] },
    { command: "tar", category: "Archiving", briefDescription: "Archives files into a tarball, optionally compressed.", keywords: ["archive", "compress", "extract", "backup", "gzip"] },
    { command: "gzip", category: "Archiving", briefDescription: "Compresses a file using the gzip algorithm.", keywords: ["compress", "zip", "shrink", "gunzip", "decompress"] },
    { command: "zip", category: "Archiving", briefDescription: "Packages files into a cross-platform .zip archive.", keywords: ["archive", "compress", "unzip", "package", "windows"] },
    { command: "rsync", category: "Archiving", briefDescription: "Efficiently copies and syncs files locally or remote.", keywords: ["sync", "backup", "copy", "transfer", "mirror"] },
    { command: "git", category: "Version Control", briefDescription: "Distributed version control system for tracking changes.", keywords: ["version", "control", "commit", "branch", "repository", "github"] },
    { command: "git clone", category: "Version Control", briefDescription: "Downloads a remote repository to your machine.", keywords: ["download", "repository", "copy", "github", "remote"] },
    { command: "git commit", category: "Version Control", briefDescription: "Saves a snapshot of your staged changes.", keywords: ["save", "snapshot", "message", "stage", "repository"] },
    { command: "git push", category: "Version Control", briefDescription: "Uploads local commits to a remote repository.", keywords: ["upload", "remote", "publish", "github", "sync"] },
    { command: "git pull", category: "Version Control", briefDescription: "Downloads and merges remote changes locally.", keywords: ["download", "merge", "update", "fetch", "sync"] },
    { command: "docker", category: "Containers", briefDescription: "Platform for building and running containers.", keywords: ["container", "image", "engine", "virtualization", "devops"] },
    { command: "docker run", category: "Containers", briefDescription: "Runs a new container from an image.", keywords: ["container", "start", "image", "nginx", "port"] },
    { command: "docker ps", category: "Containers", briefDescription: "Lists running (or all) containers.", keywords: ["container", "list", "status", "running", "ports"] },
    { command: "docker compose", category: "Containers", briefDescription: "Manages multi-container applications via compose file.", keywords: ["compose", "multi", "service", "yaml", "stack"] },
    { command: "echo", category: "Text Processing", briefDescription: "Prints text or variables to standard output.", keywords: ["print", "output", "variable", "string", "display"] },
    { command: "alias", category: "System Info", briefDescription: "Creates a shortcut command for a longer one.", keywords: ["shortcut", "custom", "command", "shell", "config"] },
    { command: "crontab", category: "Process Management", briefDescription: "Schedules commands to run on a timer.", keywords: ["schedule", "timer", "automation", "job", "periodic"] },
    { command: "journalctl", category: "System Info", briefDescription: "Queries the systemd journal (logs).", keywords: ["logs", "systemd", "journal", "service", "debug"] },
    { command: "watch", category: "Process Management", briefDescription: "Runs a command repeatedly, showing live output.", keywords: ["repeat", "interval", "monitor", "live", "refresh"] },
    { command: "ln", category: "File System", briefDescription: "Creates hard or symbolic (soft) links.", keywords: ["link", "symlink", "shortcut", "inode", "reference"] },
    { command: "passwd", category: "Permissions", briefDescription: "Changes a user's password.", keywords: ["password", "change", "user", "credential", "auth"] },
    { command: "useradd", category: "Permissions", briefDescription: "Creates a new user account.", keywords: ["user", "create", "account", "add", "admin"] },
    { command: "usermod", category: "Permissions", briefDescription: "Modifies an existing user account.", keywords: ["user", "modify", "group", "account", "admin"] },
    { command: "groupadd", category: "Permissions", briefDescription: "Creates a new user group.", keywords: ["group", "create", "permission", "add", "admin"] }
  ],
  exercises: [
    {
      id: 1,
      title: "Difference between less and more",
      text: "The <strong>more</strong> command is a legacy pager that allows you to view text files one screen at a time. However, it only allows forward navigation (scrolling down). The <strong>less</strong> command was created as a modern replacement (playfully named 'less is more') that allows both forward and backward navigation, searching, and doesn't need to read the entire file before starting.",
      deepDive: [
        "<strong>Memory Efficiency:</strong> <code>less</code> does not have to read the entire input file before starting, making it significantly faster and more memory-efficient for massive log files.",
        "<strong>Navigation Shortcuts:</strong> Use <code>Space</code> or <code>Page Down</code> to move forward, <code>b</code> or <code>Page Up</code> to move backward. <code>g</code> jumps to the beginning, <code>G</code> jumps to the end.",
        "<strong>Searching:</strong> Press <code>/</code> followed by your search term, then <code>n</code> to go to the next match and <code>N</code> to go back to the previous match."
      ]
    },
    {
      id: 2,
      title: "Difference between cat and more",
      text: "The <strong>cat</strong> (concatenate) command reads files sequentially and writes them to standard output. If a file is large, it will scroll past your screen instantly. <strong>more</strong> solves this by pausing the output at the bottom of your terminal screen, allowing you to press <code>Space</code> to continue reading.",
      code: ["cat filename", "more filename"],
      deepDive: [
        "<strong>True Purpose of cat:</strong> <code>cat</code> is actually designed to join (concatenate) multiple files together into a single output stream, e.g., <code>cat file1.txt file2.txt > combined.txt</code>.",
        "<strong>Piping Output:</strong> You can pipe the output of any command into a pager: <code>dmesg | less</code> allows you to read kernel messages comfortably.",
        "<strong>Alternatives:</strong> If you only want to view a file, using <code>less</code> is almost always preferred over <code>cat</code> or <code>more</code>."
      ]
    },
    {
      id: 3,
      title: "Difference between rm and rmdir (using man)",
      text: "The differences can be checked using the man pages. <strong>rm</strong> is used to remove files. It can also remove directories and their contents when used with the <strong>-r</strong> (recursive) option. <strong>rmdir</strong> is specifically used to remove empty directories and will fail if the directory contains any files.",
      code: ["man rm", "man rmdir", "rm filename", "rm -r directory", "rmdir directory"],
      deepDive: [
        "<strong>Safety First:</strong> You can use <code>rm -ri</code> to prompt for confirmation before deleting every single file inside a directory, which is highly recommended when running as root.",
        "<strong>Under the Hood:</strong> <code>rm</code> doesn't actually securely erase data from the disk; it simply removes the link (filename) pointing to the inode (data block). The space is then marked as available by the filesystem.",
        "<strong>Force Deletion:</strong> The <code>-f</code> (force) flag ignores nonexistent files and never prompts. <code>rm -rf</code> is powerful and dangerous—always verify the path before hitting Enter."
      ]
    },
    {
      id: 4,
      title: "Create and manipulate directory hierarchy",
      text: "Creating a structured directory tree requires understanding absolute paths, relative paths, and the <strong>-p</strong> (parents) flag. The <strong>-p</strong> flag tells <code>mkdir</code> to create all missing parent directories in a path.",
      steps: [
        { subtitle: "Initial Hierarchy Setup", text: "Create the directories and file as specified.", code: ["cd ~", "mkdir -p dir1/dir11 dir1/dir12 docs", "touch dir1/dir12/file1", "touch docs/mycv"] },
        { subtitle: "a. Remove dir11 in one step", text: "Using <strong>rm dir1/dir11</strong> produces an error because rm does not remove directories without an appropriate option. The problem can be solved using the recursive option:", code: ["rm -r dir1/dir11"] },
        { subtitle: "b. Remove dir12 using rmdir -p", text: "Since dir12 contains file1, the file must first be removed. Then run <strong>rmdir -p</strong>. The -p option removes the specified directory and then attempts to remove its parent directory if the parent is empty. Since dir1 is also empty after removing dir12, both dir12 and dir1 are removed.", code: ["rm dir1/dir12/file1", "rmdir -p dir1/dir12"] },
        { subtitle: "c. Absolute and relative paths for mycv", text: "Assuming the output of pwd is /home/user:", code: ["# Absolute path: /home/user/docs/mycv", "# Relative path: docs/mycv"] }
      ],
      deepDive: [
        "<strong>Absolute vs Relative:</strong> An absolute path starts from the root directory <code>/</code> (e.g., <code>/home/user/docs</code>). A relative path starts from your current working directory (e.g., <code>docs/mycv</code>).",
        "<strong>The '.' and '..' directories:</strong> Every directory contains a hidden <code>.</code> (current directory) and <code>..</code> (parent directory). You can use <code>cd ..</code> to go up one level.",
        "<strong>Why use rmdir -p?</strong> It is safer than <code>rm -r</code> because it strictly checks that directories are empty before removing them, preventing accidental data loss."
      ]
    },
    {
      id: 5,
      title: "Copy /etc/passwd to home directory",
      text: "The <strong>cp</strong> command copies files. The first argument is the source, the second is the destination. Here, we copy the system file <code>/etc/passwd</code> to the home directory (<code>~</code>) and rename it to <code>mypasswd</code> in the same action.",
      code: ["cp /etc/passwd ~/mypasswd"],
      deepDive: [
        "<strong>Understanding /etc/passwd:</strong> This file stores essential user account information (username, UID, GID, home directory, shell). It is world-readable, so you don't need <code>sudo</code> to copy it.",
        "<strong>Copying Directories:</strong> If you are copying a directory, you must use the recursive flag: <code>cp -r source_dir/ dest_dir/</code>.",
        "<strong>Preserving Attributes:</strong> Use <code>cp -p</code> to preserve the original file's mode, ownership, and timestamps."
      ]
    },
    {
      id: 6,
      title: "Rename mypasswd to oldpasswd",
      text: "In Linux, there is no dedicated 'rename' command for a single file. The <strong>mv</strong> (move) command handles renaming. When the source and destination are on the same filesystem, <code>mv</code> simply updates the inode pointer with the new filename—it does not physically move data on the disk.",
      code: ["mv ~/mypasswd ~/oldpasswd"],
      deepDive: [
        "<strong>Silent Overwriting:</strong> <code>mv</code> will silently overwrite a file if the destination name already exists. Use <code>mv -i</code> to get an interactive prompt before overwriting.",
        "<strong>Moving across filesystems:</strong> If you move a file to a different partition or drive, <code>mv</code> will actually copy the data to the new drive and delete the original, which takes longer.",
        "<strong>Bulk Renaming:</strong> For renaming multiple files at once (e.g., changing all .txt to .md), look into the <code>rename</code> command or a bash <code>for</code> loop."
      ]
    },
    {
      id: 7,
      title: "Four ways to go to your home directory",
      text: "There are multiple ways to navigate to your home directory depending on whether you use shell expansions, environment variables, or absolute paths.",
      code: ["cd ~", "cd", "cd $HOME", "cd /home/user"],
      deepDive: [
        "<strong>cd ~:</strong> The tilde (<code>~</code>) is a shell expansion that the terminal translates into your home directory path before executing the command.",
        "<strong>cd:</strong> By default, if you type <code>cd</code> without any arguments, the shell assumes you mean your home directory.",
        "<strong>cd $HOME:</strong> <code>$HOME</code> is an environment variable that stores your home directory path. This is the most script-safe method.",
        "<strong>cd /home/user:</strong> A literal absolute path. Useful in scripts where environment variables might not be set, but requires hardcoding the username."
      ]
    },
    {
      id: 8,
      title: "List commands in /usr/bin starting with 'w'",
      text: "Bash shell expansions (globs) allow you to match filenames using wildcards. The asterisk (<strong>*</strong>) matches any string of characters (including zero characters).",
      code: ["ls /usr/bin/w*"],
      deepDive: [
        "<strong>How Globbing Works:</strong> The shell itself expands <code>/usr/bin/w*</code> into a list of matching files before passing them to <code>ls</code>. If no files match, <code>ls</code> might throw an error.",
        "<strong>The '?' wildcard:</strong> The question mark matches exactly one character. e.g., <code>ls /usr/bin/w?</code> matches <code>wc</code> but not <code>wget</code>.",
        "<strong>Character classes:</strong> <code>[w-z]*</code> matches files starting with w, x, y, or z. <code>[!w]*</code> matches files NOT starting with w."
      ]
    },
    {
      id: 9,
      title: "Display the first four lines of /etc/passwd",
      text: "The <strong>head</strong> command outputs the first part of a file. By default, it shows the first 10 lines, but you can specify exactly how many with the <strong>-n</strong> flag.",
      code: ["head -n 4 /etc/passwd"],
      deepDive: [
        "<strong>Byte limit:</strong> Use <code>head -c 100 filename</code> to output the first 100 bytes instead of lines.",
        "<strong>Multiple files:</strong> <code>head</code> can take multiple files: <code>head file1.txt file2.txt</code> will show the head of both with headers labeling them.",
        "<strong>Negative lines:</strong> <code>head -n -5 file.txt</code> outputs the whole file *except* the last 5 lines."
      ]
    },
    {
      id: 10,
      title: "Display the last seven lines of /etc/passwd",
      text: "The <strong>tail</strong> command outputs the last part of a file. It is most commonly used with the <strong>-f</strong> flag to follow live logs in real-time.",
      code: ["tail -n 7 /etc/passwd"],
      deepDive: [
        "<strong>Live Monitoring:</strong> <code>tail -f /var/log/syslog</code> keeps the file open and displays new lines as they are written by the system.",
        "<strong>How -f works:</strong> Under the hood, <code>tail -f</code> uses the <code>inotify</code> (inode notify) Linux subsystem to receive instant updates when the file changes on disk.",
        "<strong>Starting from a pattern:</strong> <code>tail -n +5 file.txt</code> outputs the file starting from the 5th line to the end."
      ]
    }
  ],
  links: {
    soft: {
      definition: "A soft link is essentially a shortcut. It points to the path of another file.",
      properties: [
        "If the original file is deleted, the soft link breaks (dangling link).",
        "Can link across different file systems and partitions.",
        "Can link directories."
      ],
      syntax: "ln -s /path/to/original /path/to/symlink",
      example: "ln -s /var/www/html/myapp/config.yaml ~/config_link"
    },
    hard: {
      definition: "A hard link is a mirror copy of a file's inode (the data structure that stores file metadata and location on the disk).",
      properties: [
        "If the original file is deleted, the hard link still works because the inode data is still intact.",
        "Cannot cross file systems/partitions.",
        "Cannot link directories (only files).",
        "Changing the content of the original or the hard link updates both."
      ],
      syntax: "ln /path/to/original /path/to/hardlink",
      example: "ln /var/log/app.log ~/app_log_backup"
    },
    comparison: [
      { feature: "Points to", soft: "File path (name)", hard: "Inode (physical disk data)" },
      { feature: "If original deleted", soft: "Link breaks (invalid)", hard: "Link remains valid" },
      { feature: "Can link directories?", soft: "Yes", hard: "No" },
      { feature: "Cross file system?", soft: "Yes", hard: "No" },
      { feature: "Command", soft: "ln -s target link_name", hard: "ln target link_name" }
    ]
  },
  helpfulLinks: [
    {
      title: "RH124 Full Course Walkthrough (YouTube)",
      desc: "A comprehensive video walkthrough following the Red Hat RH124 curriculum used in this NTI course.",
      url: "https://www.youtube.com/watch?v=gojeTqXdBH0&t=1s"
    },
    {
      title: "Red Hat Academy",
      desc: "Official Red Hat training and certification portal for the RH124/RH134 curriculum.",
      url: "https://www.redhat.com/en/services/training/red-hat-academy"
    }
  ],
  course: {
    modules: [
      { number: 1, title: "The Basics", concepts: ["What is Linux?", "Open Source", "Distributions (Ubuntu, CentOS, Debian)"], skills: ["Navigating the terminal (cd, ls, pwd)"], project: "Install Linux (via WSL or VirtualBox) and navigate the file system without a GUI." },
      { number: 2, title: "File Management & Text Editing", concepts: ["The Linux File Hierarchy Standard (/etc, /var, /home, /tmp)"], skills: ["Creating/moving files (touch, mkdir, cp, mv, rm)", "Using nano and vim", "Reading files (cat, less, tail)"], project: "Create a directory structure for a fake project and write a README file using vim." },
      { number: 3, title: "Searching & Filtering", concepts: ["Regular Expressions (Regex)", "Piping (|)", "Redirection (>, >>)"], skills: ["grep", "find", "awk", "sed"], project: "Search the /var/log/syslog for 'error' and save those specific lines to a new file called errors.log." },
      { number: 4, title: "User & Permission Management", concepts: ["Users, Groups", "Root vs. Standard User", "File Permissions (Read/Write/Execute)"], skills: ["sudo, su", "useradd, usermod", "chmod (numeric and symbolic)", "chown"], project: "Create a new user, add them to a group, and give that group read-only access to a specific directory." },
      { number: 5, title: "Software Installation & Processes", concepts: ["Package Managers", "Daemons/Services", "PID"], skills: ["apt/yum/dnf", "systemctl (start, stop, enable, status)", "ps, top, kill"], project: "Install the Nginx web server, start the service, and ensure it restarts automatically on boot." },
      { number: 6, title: "Networking & SSH", concepts: ["IP Addressing", "Ports", "SSH Keys"], skills: ["ip, ping, curl", "netstat / ss", "ssh-keygen, ssh-copy-id"], project: "Generate an SSH key pair and set up passwordless SSH login between two Linux machines." },
      { number: 7, title: "Shell Scripting Basics", concepts: ["Automation", "Variables", "Conditionals", "Loops"], skills: ["Writing .sh files", "if statements", "for loops", "cron for scheduling"], project: "Write a bash script that checks if Nginx is running. If not, start it and log the event. Schedule via cron every 5 minutes." }
    ],
    days: [
      { id: "day1", title: "Get Started with RHEL & Files", topics: ["Learning Objectives","Understanding Linux and Its Origins","Linux Components","Virtual Machines & Network Setup","Minimum Requirements for RHEL 9","Access the Command Line"], content: [] },
      { id: "day2", title: "Get Help, Text Files & Users", topics: ["Learning Objectives","Get Help in Red Hat Enterprise Linux","Create, View, and Edit Text Files","Word Count & Pipelines Deep Dive","Manage Local Users and Groups","Key Takeaways"], content: [] },
      { id: "day3", title: "Coming Soon — Stay Tuned", topics: ["Permissions & Processes","SSH, Logs & Networking","Archiving & Packages"], content: [] }
    ]
  },
  nti: {
    days: {
      day1: {
        title: "Day 1 — Get Started with Red Hat Enterprise Linux",
        subtitle: "An introduction to Linux, RHEL, the command line, and file management fundamentals.",
        sections: [
        {
          id: "learning-objectives",
          title: "Learning Objectives",
          icon: "file",
          blocks: [{t:"list", items:["Explain the purpose of open source, Linux, Linux distributions, and Red Hat Enterprise Linux.","Log in to a Linux system and run simple commands from the shell.","Describe how Linux organizes files and manage them from the command line."]}]
        },
        {
          id: "understanding-linux-and-its-origins",
          title: "Understanding Linux and Its Origins",
          icon: "cpu",
          blocks: [{t:"text", html:"<p>### A Brief History</p>"}, {t:"text", html:"<p>Linux traces its lineage back to the UNIX operating system, developed through decades of incremental innovation:</p>"}, {t:"list", items:["<strong>1969</strong> — Thompson and Ritchie create AT&T UNIX.","<strong>1972</strong> — UNIX version 2 is rewritten in C.","<strong>1977</strong> — BSD (Berkeley Software Distribution) is released.","<strong>1983</strong> — Richard Stallman launches the GNU Project.","<strong>1987</strong> — Andy Tannenbaum creates Minix.","<strong>1991</strong> — Linus Torvalds creates i386 Linux.","<strong>1992</strong> — Linux is licensed under the GPL (GNU General Public License)."]}, {t:"text", html:"<p><strong>Key Takeaway:</strong> Linux emerged from decades of UNIX development, combining Torvalds' kernel with the GNU Project's tools and the GPL's open licensing model.</p>"}, {t:"text", html:"<p>### Linux Distributions</p>"}, {t:"text", html:"<p>A <strong>Linux distribution</strong> (distro) packages the Linux kernel together with system tools, libraries, and software into a complete, installable operating system. Distributions descend from UNIX-inspired lineages and split into distinct families:</p>"}, {t:"list", items:["<strong>Debian family</strong> → Ubuntu → Linux Mint","<strong>Fedora family</strong> → RHEL → CentOS, Oracle Linux","<strong>SUSE family</strong> → SLES → OpenSUSE","Other distributions include Red Hat Linux, Fedora, and Kali Linux"]}, {t:"text", html:"<p>All distributions share the same Linux kernel at their core, but differ in package management, target use case, and support model.</p>"}, {t:"text", html:"<p>### Why Linux?</p>"}, {t:"text", html:"<p>Linux's popularity across servers, desktops, and embedded systems comes from a combination of practical advantages:</p>"}, {t:"list", items:["<strong>Open Source</strong> — source code is freely available and modifiable.","<strong>It is Free</strong> — no licensing cost for most distributions.","<strong>High Security</strong> — a strong permissions model and active security community.","<strong>High Stability</strong> — long uptimes and reliable performance.","<strong>Ease of Maintenance</strong> — centralized package management and scripting support.","<strong>Runs on Any Hardware</strong> — from embedded devices to enterprise servers.","<strong>Customization</strong> — deep configurability at every layer.","<strong>Community Support</strong> — a large global base of contributors and users.","<strong>Education and Support</strong> — extensive documentation and learning resources."]}]
        },
        {
          id: "linux-components",
          title: "Linux Components",
          icon: "cpu",
          blocks: [{t:"text", html:"<p>Linux systems are built from three core layers, each with a distinct role.</p>"}, {t:"text", html:"<p>### Kernel</p>"}, {t:"text", html:"<p>The <strong>kernel</strong> is the core of the operating system.</p>"}, {t:"list", items:["Contains components such as device drivers.","Loads into RAM when the machine boots.","Stays resident in RAM until the machine powers off."]}, {t:"text", html:"<p>### Shell</p>"}, {t:"text", html:"<p>The <strong>shell</strong> is the interface through which a user communicates with the kernel.</p>"}, {t:"list", items:["Common shells include C shell, ksh, and Bash.","<strong>Bash</strong> is the most commonly used shell on Linux.","The shell parses commands entered by the user and translates them into logical segments executed by the kernel or other utilities."]}, {t:"callout", kind:"info", html:"<strong>Key Takeaway:</strong> The kernel manages hardware and system resources, while the shell provides the interface users rely on to issue commands to that kernel."}]
        },
        {
          id: "vm-network",
          title: "Virtual Machines & Network Setup",
          icon: "network",
          blocks: [{t:"list", items:["<strong>Creating a VM</strong>: <code>File</code> -> <code>New VM</code> -> <code>Installing Redhat on VMware</code> (Recommended: 2 processors, 2 cores).","<strong>Network Types</strong>: Bridged, NAT, Host-only (chosen according to the IP range).","Choose <strong>NAT</strong> when setting up VMware.","<strong>Redhat Developer Account</strong>: You can use developer account credentials to log in to a Redhat server with a GUI on VMware."]}, {t:"text", html:"<p>### Getting IP & SSH</p>"}, {t:"code", code:"ifconfig", lang:"bash"}, {t:"text", html:"<p>Returns the IP address (Skip this step for Ubuntu).</p>"}, {t:"code", code:"ssh root@ipaddress", lang:"bash"}, {t:"text", html:"<p>Connects to the server.</p>"}]
        },
        {
          id: "minimum-requirements-for-rhel-9",
          title: "Minimum Requirements for RHEL 9",
          icon: "file",
          blocks: [{t:"text", html:"<p>Before installing RHEL 9, ensure the target system meets these minimums:</p>"}, {t:"list", items:["<strong>CPU:</strong> Dual or quad core processor","<strong>RAM:</strong> 2 GB or more","<strong>Disk space:</strong> 20 GB or more","10 GB for root (<code>/</code>)","1 GB for swap","4 GB for <code>/home</code>","512 MB for <code>/boot</code>","<strong>Network:</strong> Working network connection","<strong>Installation media</strong> required"]}]
        },
        {
          id: "access-the-command-line",
          title: "Access the Command Line",
          icon: "eye",
          blocks: [{t:"text", html:"<p>There are two primary ways to reach a Linux shell:</p>"}, {t:"list", items:["<strong>From a Graphical User Interface (GUI)</strong> — opening a terminal application within a desktop environment such as GNOME.","<strong>Remote access over Secure Shell (SSH)</strong> — connecting to the system from another machine."]}, {t:"text", html:"<p>### Running Commands</p>"}, {t:"text", html:"<p>Commands in Linux follow a consistent syntax:</p>"}, {t:"code", code:"command [options] [arguments]", lang:"bash"}, {t:"list", items:["Each item is separated by a space.","<strong>Options</strong> modify the command's behavior.","<strong>Arguments</strong> are file names or other information the command needs.","Multiple commands can be separated with a semicolon (<code>;</code>)."]}, {t:"text", html:"<p>### Example</p>"}, {t:"code", code:"usermod –L omar", lang:"bash"}, {t:"text", html:"<p>### Command Syntax: Right vs. Wrong</p>"}, {t:"text", html:"<p>Spacing matters. Options must be separated from the command and from each other correctly.</p>"}, {t:"table", head:["Right","Wrong"], rows:[["$ ls -l /dev","$ ls - l /dev"],["$ ls -a /dev","$ ls-a /dev"],["$ mail -s test root","$ mail test root -s"],["$ who -u","$ -u who"],["$ ls -l -d","$ ls -l-d"],["$ ls -ld","$ ls -l d"]]}, {t:"callout", kind:"info", html:"<strong>Important:</strong> Options must be attached directly to their dash (no space between <code>-</code> and the letter), and the order of arguments relative to options matters for correct parsing."}, {t:"text", html:"<p>### Shell Shortcuts</p>"}, {t:"text", html:"<p>Bash provides keyboard shortcuts that save time when editing commands at the prompt:</p>"}, {t:"table", head:["Shortcut","Action"], rows:[["Ctrl+A","Jump to the beginning of the command line."],["Ctrl+E","Jump to the end of the command line."],["Ctrl+U","Clear from the cursor to the beginning of the command line."],["Ctrl+K","Clear from the cursor to the end of the command line."],["Ctrl+LeftArrow","Jump to the beginning of the previous word on the command line."],["Ctrl+RightArrow","Jump to the end of the next word on the command line."],["Ctrl+R","Search the history list of commands for a pattern."]]}]
        },
        {
          id: "manage-files-from-the-command-line",
          title: "Manage Files from the Command Line",
          icon: "eye",
          blocks: [{t:"text", html:"<p>Linux organizes all data in a single hierarchical tree of files and directories, rooted at <code>/</code>.</p>"}, {t:"text", html:"<p>### The File System Hierarchy</p>"}, {t:"diagram", kind:"links"}, {t:"text", html:"<p>Every directory branches from the single root (<code>/</code>), and each serves a specific, standardized purpose.</p>"}, {t:"text", html:"<p>### Important Directories</p>"}, {t:"table", head:["Location","Purpose"], rows:[["/usr","Installed software, shared libraries, include files, and read-only program data."],["/usr/bin","User commands."],["/usr/sbin","System administration commands."],["/usr/local","Locally customized software."],["/etc","Configuration files specific to this system."],["/var","Variable data that persists between boots — databases, cache directories, log files, printer-spooled documents, and website content."],["/run","Runtime data for processes started since the last boot, including process ID and lock files. Contents are recreated on reboot; this directory consolidates /var/run and /var/lock from earlier RHEL versions."],["/home","Personal data and configuration files for regular users."],["/root","Home directory for the administrative superuser, root."],["/tmp","World-writable space for temporary files. Files untouched for 10 days are deleted automatically."],["/boot","Files needed to start the boot process."],["/dev","Special *device files* used by the system to access hardware."]]}, {t:"callout", kind:"info", html:"<strong>Note:</strong> A second temporary directory, <code>/var/tmp</code>, also exists — files there are deleted automatically only after 30 days of inactivity, giving them a longer lifespan than files in <code>/tmp</code>."}, {t:"text", html:"<p>### File Types</p>"}, {t:"text", html:"<p>Every file in Linux has a type, indicated by a leading symbol in a long directory listing (<code>ls -l</code>):</p>"}, {t:"table", head:["Symbol","Meaning"], rows:[["-","Regular file"],["d","Directory"],["l","Link"],["c","Special File"],["s","Socket"],["p","Named Pipe"],["b","Block Device"]]}, {t:"text", html:"<p>### Rules for Naming Files</p>"}, {t:"text", html:"<p><strong>Should:</strong><br>- Be descriptive.<br>- Use only alphanumeric characters: uppercase, lowercase, numbers, <code>@</code>, <code>_</code>.</p>"}, {t:"text", html:"<p><strong>Should Not:</strong><br>- Include embedded blanks (spaces).<br>- Contain shell metacharacters: <code>* ? > < / ; & ! [ ] | \\ ' \" ( ) { }</code></p>"}, {t:"text", html:"<p><strong>Additional rules:</strong><br>- Filenames are case sensitive.<br>- Filenames starting with a <code>.</code> are hidden.<br>- Maximum filename length is 255 characters.</p>"}, {t:"text", html:"<p>### Absolute Path vs. Relative Path</p>"}, {t:"text", html:"<p>Every file and directory can be referenced two ways:</p>"}, {t:"list", items:["<strong>Absolute path</strong> — the full path starting from the root <code>/</code>, unambiguous regardless of the current location (e.g., <code>/home/alice/document.txt</code> or <code>/var/log/messages</code>).","<strong>Relative path</strong> — a path expressed relative to the current working directory, which changes depending on where you currently are in the file system."]}, {t:"callout", kind:"info", html:"<strong>Key Takeaway:</strong> An absolute path always starts at <code>/</code> and works from anywhere; a relative path is shorter but only valid from your current location."}]
        },
        {
          id: "inodes-hard-links-and-soft-links",
          title: "Inodes, Hard Links, and Soft Links",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### What Is an Inode?</p>"}, {t:"text", html:"<p>Linux allocates an <strong>index node (inode)</strong> for every file and directory in the filesystem. Inodes do not store the actual file data — instead, they store the metadata that points to where the file's data blocks live on disk.</p>"}, {t:"text", html:"<p>### Metadata Stored in an Inode</p>"}, {t:"list", items:["File type","Permissions","Hard links count","Owner ID","Group ID","Soft/Hard Links","Access Control List (ACLs)","Size of file","Timestamp (access time)","Timestamp (modification time)"]}, {t:"text", html:"<p>A <strong>hard link</strong> is a direct reference to a file's inode, while a <strong>file</strong> itself is also just a name pointing to an inode. A <strong>soft link</strong> does not reference the inode directly — it points to the file name/path instead, and both hard links and soft links are maintained by the file system.</p>"}, {t:"text", html:"<p>### Soft Link vs. Hard Link</p>"}, {t:"table", head:["Soft Link","Hard Link"], rows:[["An alias to the original file, similar to the shortcut feature in Windows OS.","The exact replica of the original file it is pointing to."],["Contains only the location to the original file, not the actual data.","Contains the actual content of the file."],["Has a different inode value pointing to the original value.","Shares the same inode value pointing to the same file location."],["Can be created across filesystems.","Cannot be created outside the filesystem."],["Becomes inaccessible when the original file is removed.","Changes in the hard-linked file will reflect in the other files."],["Can link both to a file or a directory.","Can only link to a file, not a directory."]]}, {t:"callout", kind:"info", html:"<strong>Key Takeaway:</strong> A hard link is another name for the exact same file data, while a soft link is a pointer to a file's location that breaks if the original is deleted."}]
        },
        {
          id: "pattern-matching-regex",
          title: "Pattern Matching (Regex)",
          icon: "search",
          blocks: [{t:"text", html:"<p>Bash supports pattern matching (globbing) to efficiently reference multiple files at once.</p>"}, {t:"text", html:"<p>### Shell Pattern-Matching Symbols</p>"}, {t:"table", head:["Pattern","Matches"], rows:[["*","Any string of zero or more characters."],["?","Any single character."],["[abc...]","Any one character in the enclosed class (between the square brackets)."],["[!abc...]","Any one character *not* in the enclosed class."],["[^abc...]","Any one character *not* in the enclosed class."],["[[:alpha:]]","Any alphabetic character."],["[[:lower:]]","Any lowercase character."],["[[:upper:]]","Any uppercase character."],["[[:alnum:]]","Any alphabetic character or digit."],["[[:punct:]]","Any printable character not a space or alphanumeric."],["[[:digit:]]","Any single digit from 0 to 9."],["[[:space:]]","Any single white space character. This may include tabs, newlines, carriage returns, form feeds, or spaces."]]}, {t:"text", html:"<p>### Regular Expressions</p>"}, {t:"text", html:"<p>Regular expressions (regex) extend pattern matching with more powerful syntax, commonly used with tools like <code>grep</code> and <code>sed</code>:</p>"}, {t:"table", head:["Symbol","Description"], rows:[[".","Replaces any character."],["^","Matches start of string."],["$","Matches end of string."],["*","Matches zero or more times the preceding character."],["\\","Represents special characters."],["()","Groups regular expressions."],["?","Matches exactly one character."]]}, {t:"callout", kind:"info", html:"<strong>Key Takeaway:</strong> Shell pattern matching (globbing) and regular expressions are related but distinct — globbing operates on filenames at the shell level, while regex is a more expressive matching language used inside text-processing tools."}]
        },
        {
          id: "key-takeaways",
          title: "Key Takeaways",
          icon: "file",
          blocks: [{t:"list", items:["Linux is an open-source operating system descended from UNIX, licensed under the GPL, with distributions (distros) built around a shared kernel but differing in packaging and tooling.","The <strong>kernel</strong> manages hardware and resources; the <strong>shell</strong> (commonly Bash) is the interface for issuing commands.","Commands follow the syntax <code>command [options] [arguments]</code>, and correct spacing between options is essential.","Linux organizes everything into a single hierarchical filesystem rooted at <code>/</code>, with standardized directories like <code>/etc</code>, <code>/var</code>, <code>/home</code>, and <code>/tmp</code> serving specific purposes.","Every file and directory has an <strong>inode</strong> storing its metadata; hard links share an inode with the original file, while soft links merely point to its path.","Bash pattern matching and regular expressions allow efficient, flexible operations across many files at once."]}]
        },
        {
          id: "users-privs-day1",
          title: "Users & Privileges (Preview)",
          icon: "folder",
          blocks: [{t:"table", head:["Symbol","Meaning"], rows:[["$","Regular user"],["#","Superuser"]]}]
        }
        ]
      },
      day2: {
        title: "Day 2 — Get Help, Manage Text Files, and Administer Local Users",
        subtitle: "Resolving problems with local help systems, working with text files and shell redirection, and managing local users, groups, and password policies.",
        sections: [
        {
          id: "learning-objectives",
          title: "Learning Objectives",
          icon: "file",
          blocks: [{t:"list", items:["Find information in local Linux system manual pages.","Redirect command output and errors to files, and chain commands with pipes.","Create and edit text files from the command line with the vim editor.","Set shell and environment variables to modify shell behavior.","Create, manage, and delete local users and groups, and administer password policies."]}]
        },
        {
          id: "get-help-in-red-hat-enterprise-linux",
          title: "Get Help in Red Hat Enterprise Linux",
          icon: "cpu",
          blocks: [{t:"text", html:"<p>Linux systems ship with an extensive built-in reference: the manual pages (<code>man</code> pages). Knowing how to navigate them turns any unfamiliar command into a solvable problem.</p>"}, {t:"text", html:"<p>### Manual Page Sections</p>"}, {t:"text", html:"<p>The manual is divided into numbered sections, each covering a different category of documentation:</p>"}, {t:"table", head:["Section","Content Type"], rows:[["1","User commands (both executable and shell programs)"],["2","System calls (kernel routines invoked from user space)"],["3","Library functions (provided by program libraries)"],["4","Special files (such as device files)"],["5","File formats (for many configuration files and structures)"],["6","Games (historical section for amusing programs)"],["7","Conventions, standards, and miscellaneous (protocols, file systems)"],["8","System administration and privileged commands (maintenance tasks)"],["9","Linux kernel API (internal kernel calls)"]]}, {t:"text", html:"<p>### Structure of a Manual Page</p>"}, {t:"text", html:"<p>Each man page follows a consistent internal structure, making it easy to jump straight to the information you need:</p>"}, {t:"table", head:["Heading","Description"], rows:[["NAME","Subject name — usually a command or file name — with a very brief description."],["SYNOPSIS","Summary of the command syntax."],["DESCRIPTION","In-depth description to provide a basic understanding of the topic."],["OPTIONS","Explanation of the command execution options."],["EXAMPLES","Examples of how to use the command, function, or file."],["FILES","A list of files and directories related to the man page."],["SEE ALSO","Related information, normally other man page topics."],["BUGS","Known bugs in the software."],["AUTHOR","Information about who has contributed to the development of the topic."]]}, {t:"callout", kind:"info", html:"<strong>Key Takeaway:</strong> Manual pages are organized by section and follow a predictable internal layout, so once you know the structure, finding the right information becomes fast and consistent."}]
        },
        {
          id: "create-view-and-edit-text-files",
          title: "Create, View, and Edit Text Files",
          icon: "folder",
          blocks: [{t:"text", html:"<p>Working efficiently at the command line means controlling where output goes and how commands connect to each other.</p>"}, {t:"text", html:"<p>### Input-Output Redirection</p>"}, {t:"text", html:"<p>Every running program or command has three standard communication channels, each identified by a file descriptor (FD) number:</p>"}, {t:"list", items:["<strong>Standard Input (stdin)</strong> — <code>FD 0</code>, typically the keyboard.","<strong>Standard Output (stdout)</strong> — <code>FD 1</code>, typically the screen.","<strong>Standard Error (stderr)</strong> — <code>FD 2</code>, typically the screen, but separately from stdout."]}, {t:"text", html:"<p>These channels can be redirected to files instead of the terminal, letting you save output, discard errors, or feed input from a file.</p>"}, {t:"text", html:"<p>### Pipelines</p>"}, {t:"text", html:"<p>A <strong>pipeline</strong> connects the standard output (<code>stdout</code>) of one process directly to the standard input (<code>stdin</code>) of another, allowing commands to be chained together to process data in stages.</p>"}, {t:"diagram", kind:"links"}, {t:"text", html:"<p>### Redirection Operators</p>"}, {t:"table", head:["Operator","Behavior"], rows:[["2>/dev/null","Discard stderr error messages by redirecting them to /dev/null."],[">file 2>&1 or &>file","Redirect stdout and stderr to overwrite the same file."],[">>file 2>&1 or &>>file","Redirect stdout and stderr to append to the same file."]]}, {t:"text", html:"<p>### Example</p>"}, {t:"code", code:"command &> output.log", lang:"bash"}, {t:"text", html:"<p>This redirects both stdout and stderr into <code>output.log</code>, overwriting any existing content.</p>"}, {t:"text", html:"<p>### The vim Text Editor</p>"}, {t:"text", html:"<p><strong>vim</strong> is a modal command-line text editor — its behavior changes depending on which mode you're in.</p>"}, {t:"text", html:"<p>#### Modes of vi/vim</p>"}, {t:"diagram", kind:"links"}, {t:"list", items:["<strong>Command mode</strong> — the default mode for navigation and issuing editing commands.","<strong>Insert mode</strong> — entered with <code>i</code> or <code>a</code>, used for typing text directly; return to command mode with <code>Esc</code>.","<strong>Visual mode</strong> — entered with <code>v</code>, <code>V</code>, or <code>Ctrl+V</code>, used for selecting text.","<strong>Extended command mode (Ex mode)</strong> — entered with <code>:</code>, used for saving, quitting, and advanced operations."]}, {t:"text", html:"<p>#### Common Ex Mode Commands</p>"}, {t:"table", head:["Command","Action"], rows:[[":wq","Save and quit the current file."],[":x","Save the current file if there are unsaved changes, then quit."],[":w","Save the current file and remain in editor."],[":q","Quit the current file (only if there are no unsaved changes)."],[":q!","Quit the current file, ignoring any unsaved changes."],[":10","Jump to line number 10."]]}, {t:"text", html:"<p>#### Vim Cheat Sheet</p>"}, {t:"text", html:"<p>Quick reference for moving between modes and performing common editing actions:</p>"}, {t:"list", items:["<strong>To edit mode:</strong> <code>I</code>, <code>i</code>, <code>a</code>, <code>A</code> (variants of insert, positioned at line start, cursor, after cursor, or line end).","<strong>Cut, copy, paste line:</strong> <code>dd</code> (cut/delete line), <code>yy</code> (yank/copy line), <code>p</code> (paste).","<strong>Delete char/word:</strong> <code>x</code>, <code>X</code>, <code>dw</code>.","<strong>Join lines:</strong> <code>J</code>.","<strong>Search, repeat:</strong> <code>/</code> (search), <code>n</code> (repeat search).","<strong>Cursor movement:</strong> <code>h</code> (left), <code>j</code> (down), <code>k</code> (up), <code>l</code> (right), <code>1G</code> (go to first line), <code>G</code> (go to last line), <code>$</code> (end of line).","<strong>Undo, redo:</strong> <code>u</code> (undo), <code>.</code> (repeat last change).","<strong>Save & exit:</strong> <code>ZZ</code>.","<strong>Ex mode:</strong> <code>:</code> — includes search and replace (<code>:%s /old/new/g</code>), change settings (<code>:set ...</code>), and save/exit commands (<code>:w</code>, <code>:w!</code>, <code>:q</code>, <code>:q!</code>, <code>:wq</code>, <code>:x</code>).","From Edit mode, <code><Esc></code> or <code><Enter></code> returns to Command mode."]}, {t:"callout", kind:"info", html:"<strong>Key Takeaway:</strong> vim's power comes from its distinct modes — navigate and issue commands in Command mode, type freely in Insert mode, and save/quit/search through Ex mode."}, {t:"text", html:"<p>### Variables in Linux</p>"}, {t:"text", html:"<p>Linux shells support two categories of variables that control behavior and store data:</p>"}, {t:"list", items:["<strong>User-defined variables</strong> — created and set by the user for their own use in scripts or commands.","<strong>Shell variables</strong> — variables used or set by the shell itself to control its behavior and environment."]}]
        },
        {
          id: "wc",
          title: "Word Count & Pipelines Deep Dive",
          icon: "file",
          blocks: [{t:"text", html:"<p>### What it does</p>"}, {t:"text", html:"<p><code>wc</code> stands for word count, and despite the name, it actually counts three things at once: lines, words, and characters.</p>"}, {t:"code", code:"echo \"nti aiops\" | wc", lang:"bash"}, {t:"text", html:"<p>Here, <code>echo \"nti aiops\"</code> simply prints the text <code>nti aiops</code>, and that text is piped into <code>wc</code>, which analyzes it. The output has three numbers, always in this order:</p>"}, {t:"table", head:["Lines","Words","Characters"], rows:[["1","2","10"]]}, {t:"list", items:["1 line — because <code>echo</code> only produced one line of text","2 words — \"nti\" and \"aiops\" are two separate words","10 characters — counting every letter and the space between them"]}, {t:"text", html:"<p>### Getting just ONE of these numbers</p>"}, {t:"text", html:"<p>Often you don't need all three — just one specific count. You can add a flag to <code>wc</code> to isolate exactly what you want:</p>"}, {t:"code", code:"echo \"nti aiops\" | wc -w", lang:"bash"}, {t:"text", html:"<p>This returns only the word count (2), with nothing else cluttering the output.</p>"}, {t:"table", head:["Flag","Returns"], rows:[["wc -l","Line count only"],["wc -w","Word count only"],["wc -c","Character count only"]]}, {t:"text", html:"<p>### Combining wc with other commands</p>"}, {t:"code", code:"ls -R /etc | wc -l", lang:"bash"}, {t:"list", items:["<code>ls -R /etc</code> lists everything inside <code>/etc</code>, and the <code>-R</code> flag makes it recursive — meaning it doesn't just list the top-level folder, it digs into every subfolder inside it too, listing everything at every depth","Piping that into <code>wc -l</code> counts how many total lines were produced — effectively telling you how many files and folders exist inside <code>/etc</code> and all its subfolders combined"]}, {t:"text", html:"<p>This shows how small commands combine into powerful one-liners: instead of manually counting hundreds of files, one line does it instantly.</p>"}]
        },
        {
          id: "manage-local-users-and-groups",
          title: "Manage Local Users and Groups",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### What Is a User?</p>"}, {t:"text", html:"<p>A <strong>user account</strong> provides security boundaries between different people and programs that can run commands. The system distinguishes user accounts by a unique identification number, the <strong>user ID (UID)</strong>.</p>"}, {t:"text", html:"<p>There are three main types of user accounts:</p>"}, {t:"list", items:["<strong>Superuser</strong> — the administrative account with full system privileges.","<strong>System users</strong> — accounts used internally by system processes.","<strong>Regular users</strong> — accounts for people who log in interactively."]}, {t:"text", html:"<p>### UID Ranges</p>"}, {t:"text", html:"<p>UID ranges follow a standard convention on Red Hat systems:</p>"}, {t:"list", items:["<strong>UID 0</strong> — always assigned to the superuser account, <code>root</code>.","<strong>UID 1–200</strong> — a range of \"system users\" assigned statically to system processes by Red Hat.","<strong>UID 201–999</strong> — a range of \"system users\" used by system processes that do not own files on the file system; typically assigned dynamically from the available pool when the software needing them is installed.","<strong>UID 1000+</strong> — the range available for assignment to regular users."]}, {t:"text", html:"<p>### The /etc/passwd File</p>"}, {t:"text", html:"<p>User account information is stored in <code>/etc/passwd</code>, with each line following a fixed colon-separated format:</p>"}, {t:"code", code:"user01:x:1000:1000:User One:/home/user01:/bin/bash", lang:"text"}, {t:"text", html:"<p>Each field carries specific meaning:</p>"}, {t:"list", items:["<strong>Username</strong> for this user (<code>user01</code>).","<strong>Password placeholder</strong> — the encrypted password used to be stored here, but has moved to <code>/etc/shadow</code>. This field should always be <code>x</code>.","<strong>UID number</strong> for this user account (<code>1000</code>).","<strong>GID number</strong> for this user account's primary group (<code>1000</code>).","<strong>Real name</strong> for this user (<code>User One</code>).","<strong>Home directory</strong> for this user (<code>/home/user01</code>) — the initial working directory when the shell starts, containing the user's data and configuration settings.","<strong>Default shell program</strong> for this user, which runs on login (<code>/bin/bash</code>). For a regular user, this is normally the program providing the command-line prompt; a system user might use <code>/sbin/nologin</code> if interactive logins are not allowed."]}, {t:"text", html:"<p>### The /etc/group File</p>"}, {t:"text", html:"<p>Group information is stored in <code>/etc/group</code>, also using a fixed colon-separated format:</p>"}, {t:"code", code:"group01:x:10000:user01,user02,user03", lang:"text"}, {t:"list", items:["<strong>Group name</strong> for this group (<code>group01</code>).","<strong>Obsolete group password field</strong> — should always be <code>x</code>.","<strong>GID number</strong> for this group (<code>10000</code>).","<strong>Member list</strong> — users who are members of this group as a supplementary group (<code>user01</code>, <code>user02</code>, <code>user03</code>)."]}, {t:"text", html:"<p>### Primary Group and Supplementary Group</p>"}, {t:"list", items:["When a new regular user is created, a new group with the same name as that user is created.","That group becomes the <strong>primary group</strong> for the new user, and the user is the only member of this <strong>User Private Group</strong>.","Users may also belong to <strong>supplementary groups</strong>.","Membership in supplementary groups is determined by the <code>/etc/group</code> file.","Users are granted access to files based on whether <em>any</em> of their groups — primary or supplementary — have access."]}, {t:"callout", kind:"info", html:"<strong>Key Takeaway:</strong> A user's file access is the union of permissions granted to their primary group and every supplementary group they belong to."}, {t:"text", html:"<p>### Superuser Privilege: su vs. sudo</p>"}, {t:"text", html:"<p>Two commands grant superuser privilege, with different models of access:</p>"}, {t:"list", items:["<strong><code>su</code></strong> — switches the current session directly to another user account (typically root), usually requiring that account's password.","<strong><code>sudo</code></strong> — allows a permitted user to run a single command with superuser privileges, typically using their own password, without fully switching accounts."]}, {t:"text", html:"<p>### The /etc/shadow File</p>"}, {t:"text", html:"<p>Password security information is stored separately in <code>/etc/shadow</code>, using this field structure:</p>"}, {t:"code", code:"name:password:lastchange:minage:maxage:warning:inactive:expire:blank", lang:"text"}, {t:"list", items:["<strong>Login name</strong>","<strong>Encrypted password</strong>","<strong>Days since Jan 1, 1970</strong> that the password was last changed","<strong>Minimum days</strong> before the password may be changed","<strong>Maximum days</strong> after which the password must be changed","<strong>Days before expiration</strong> that the user is warned","<strong>Days after expiration</strong> that the account is disabled","<strong>Account expiration date</strong>, represented as the number of days since 1970-01-01","<strong>Blank field</strong>, reserved for future use"]}, {t:"text", html:"<p>### Configuring Password Aging with chage</p>"}, {t:"text", html:"<p>The <code>chage</code> command manages password aging policy per user, controlling the timeline between password changes, warnings, and account deactivation:</p>"}, {t:"list", items:["<strong><code>-d</code></strong> — sets the last change date.","<strong><code>-m</code></strong> — sets minimum days between changes.","<strong><code>-M</code></strong> — sets maximum days before a change is required.","<strong><code>-W</code></strong> — sets the number of warning days before expiration.","<strong><code>-I</code></strong> — sets the number of inactive days after expiration before the account is disabled."]}, {t:"text", html:"<p>### Example</p>"}, {t:"code", code:"chage -m 0 -M 90 -W 7 -I 14 user03", lang:"bash"}, {t:"text", html:"<p>This sets <code>user03</code>'s password policy so it can be changed at any time (<code>-m 0</code>), must be changed at least every 90 days (<code>-M 90</code>), warns the user 7 days before expiration (<code>-W 7</code>), and disables the account after 14 days of inactivity past expiration (<code>-I 14</code>).</p>"}, {t:"callout", kind:"info", html:"<strong>Key Takeaway:</strong> Password aging policy is enforced through <code>/etc/shadow</code> fields and configured with <code>chage</code>, giving administrators fine-grained control over how often users must update their credentials."}]
        },
        {
          id: "key-takeaways",
          title: "Key Takeaways",
          icon: "file",
          blocks: [{t:"list", items:["Manual pages are organized into numbered sections and follow a predictable structure, making the <code>man</code> command a reliable first stop for troubleshooting.","Shell redirection and pipes let commands read from and write to files or each other, using standard input, output, and error streams.","vim is a modal editor — mastering the transitions between Command, Insert, Visual, and Ex modes is the key to using it efficiently.","User and group information lives in <code>/etc/passwd</code> and <code>/etc/group</code>, while sensitive password data and aging policy live in <code>/etc/shadow</code>.","Every regular user gets a private primary group at creation, and file access is determined by the combination of primary and supplementary group memberships.","<code>su</code> switches users entirely, while <code>sudo</code> grants privileged access to individual commands — both provide paths to superuser privilege with different security trade-offs."]}]
        },
        {
          id: "switching-users-su",
          title: "Switching Users — su",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### <code>su - username</code> (with the dash)</p>"}, {t:"code", code:"su - omar", lang:"bash"}, {t:"text", html:"<p>This switches you to being the user <code>omar</code>. The dash (<code>-</code>) is crucial: it tells Linux to also load <code>omar</code>'s entire environment, exactly as if <code>omar</code> had logged in directly himself — his home directory becomes your working directory, his shell configuration and variables load, his PATH becomes active. It will also display when <code>omar</code> last logged in, similar to what you'd see on a real login screen.</p>"}, {t:"text", html:"<p>### <code>su username</code> (without the dash)</p>"}, {t:"code", code:"su omar", lang:"bash"}, {t:"text", html:"<p>This still switches you to being <code>omar</code>, but it's a lighter switch — you keep your own current environment and variables rather than fully adopting his, and you typically remain in whatever directory you were already in rather than jumping to his home folder.</p>"}, {t:"text", html:"<p>### Comparison</p>"}, {t:"table", head:["Behavior","su - username","su username"], rows:[["Environment loaded","Full environment, exactly as if that user logged in directly","Keeps your own current environment and variables"],["Working directory","Jumps to that user's home directory","Typically remains in whatever directory you were already in"],["Last login display","Shown, similar to a real login screen","Not part of this lighter switch"],["Best for","A true, full simulation of that user logging in (the safer, more predictable choice)","A quick, temporary permission switch without changing your whole environment"]]}]
        },
        {
          id: "visudo-safely-managing-sudo-permissions",
          title: "visudo — Safely Managing Sudo Permissions",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### The file behind sudo</p>"}, {t:"text", html:"<p>Every time someone runs a command with <code>sudo</code>, Linux checks a specific configuration file — <code>/etc/sudoers</code> — to decide whether that user is allowed to do that, and what exactly they're permitted to run (sometimes limited to specific commands, sometimes full access).</p>"}, {t:"text", html:"<p>### Why not just edit it with vim directly?</p>"}, {t:"text", html:"<p>You technically could open <code>/etc/sudoers</code> with <code>vim /etc/sudoers</code>, but this is considered dangerous, because a single typo in this file could silently break the entire permissions system — potentially locking every single administrator out of sudo access at once, with no easy way back in.</p>"}, {t:"code", code:"visudo", lang:"bash"}, {t:"callout", kind:"danger", html:"Editing <code>/etc/sudoers</code> directly with a regular editor is dangerous — a single typo can silently break the entire permissions system, potentially locking every administrator out of sudo access at once, with no easy way back in."}, {t:"text", html:"<p><code>visudo</code> solves this by opening the file in a protected editing session that automatically checks your syntax for errors the moment you try to save. If it detects a mistake, it stops you, shows a warning, and refuses to save the broken version — giving you the chance to fix it or discard your changes safely. This built-in safety check is the entire reason <code>visudo</code> exists as a dedicated command instead of people just using a regular text editor.</p>"}]
        },
        {
          id: "vim-scripting",
          title: "Vim Scripting & External Commands",
          icon: "file",
          blocks: [{t:"text", html:"<p>### Vim Script: Find and Replace</p>"}, {t:"code", code:":%s/login/nologin/g", lang:"bash"}, {t:"text", html:"<p><code>g</code> means Global (to replace the words).<br><em>(new name)</em></p>"}, {t:"text", html:"<p>### Execute External Command in Vim</p>"}, {t:"code", code:":.! date", lang:"bash"}, {t:"text", html:"<p><em>(خارج ولكن يعود للمكان مره ثانيه)</em></p>"}, {t:"code", code:":* Number ! Command", lang:"bash"}, {t:"text", html:"<p>Will appear in the number of line that matches that number.</p>"}, {t:"text", html:"<p>### Vim Options</p>"}, {t:"table", head:["Command","Description"], rows:[[":set number","Will index the lines"],[":set arabic","Will make in arabic way"],[":set noarabic","Turns off arabic mode"]]}, {t:"text", html:"<p>### Variables in Shell</p>"}, {t:"text", html:"<p>User-defined Variable / Shell Variable — that you created / that already exists in the system or the user created it.</p>"}, {t:"code", code:"X=15\necho $X", lang:"bash"}, {t:"text", html:"<p>### Mathematics in Shell</p>"}, {t:"code", code:"$[x+y]\necho $[x+y]", lang:"bash"}]
        }
        ]
      },
      day3: {
        title: "Day 3 — Coming Soon",
        subtitle: "Wait for it — new content is on the way!",
        sections: [
          {
            id: "coming-soon",
            title: "Coming Soon",
            icon: "file",
            blocks: [
              {t:"text", html:"<p>Day 3 is being prepared. It will cover <strong>Permissions & Processes, SSH, Logs & Networking, plus Archiving & Packages</strong>. Check back soon — the café is still brewing the slides ☕.</p>"},
              {t:"callout", kind:"info", html:"<strong>What to expect:</strong> File permissions (chmod/chown), process control (ps/kill/systemd), SSH hardening, log analysis (journalctl), and archiving (tar/rsync)."},
              {t:"text", html:"<p>In the meantime, review <strong>Day 1 & Day 2</strong> labs or explore the <strong>Topic Index</strong> and <strong>Flashcards</strong>.</p>"}
            ]
          }
        ]
      }
    },
    notes: {
      rahma: {
        author: "Rahma",
        subtitle: "Linux Administration & Fundamentals",
        avatar: "R",
        sections: [
        {
          id: "system-architecture-concepts",
          title: "System Architecture & Concepts",
          icon: "cpu",
          blocks: [{t:"list", items:["<strong>Monolithic vs Microservices</strong>: If one service fails in a monolithic architecture, all services are down. In microservices, if one service goes down, the rest of the services remain up.","<strong>Load Balancer</strong>: Works on balancing traffic across the services.","<strong>RabbitMQ</strong>: Acts as a queue for services.","<strong>Virtual Memory (Swap)</strong>: Avoids system crashes. Example: Activate Swap when uploading on AWS."]}, {t:"text", html:"<p>### Linux vs Unix</p>"}, {t:"table", head:["Aspect","Linux (Open Source)","Unix (Closed Source)"], rows:[["Origin","Came after Unix; contains around 400 distributions","Came first"],["Customization","Customized (including UI)","Couldn't be customized"],["License","No license, open for everybody (public), and free (some are licensed but with nuances)","Private for the developers"],["Example","—","Unix is an example of a closed-source system"]]}, {t:"list", items:["<strong>Enterprise Revenue</strong>: Money comes from certifications and subscription fees for enterprise editions."]}, {t:"text", html:"<p>### Distributions Comparison</p>"}, {t:"list", items:["Differences between Fedora vs RedHat: Number of versions and releases from each version.","Ubuntu vs RedHat: You can use Ubuntu on VMware; the difference is mainly in the packages, but the command lines are the same.","CentOS: Noted for having \"no security\" (EOL)."]}, {t:"list", items:["<strong>GPL (General Public License)</strong>: Associated with Richard Stallman."]}]
        },
        {
          id: "virtual-machine-network-setup",
          title: "Virtual Machine & Network Setup",
          icon: "network",
          blocks: [{t:"list", items:["<strong>Creating a VM</strong>: <code>File</code> -> <code>New VM</code> -> <code>Installing Redhat on VMware</code> (Recommended: 2 processors, 2 cores).","<strong>Network Types</strong>: Bridged, NAT, Host-only (chosen according to the IP range).","Choose <strong>NAT</strong> when setting up VMware.","<strong>Redhat Developer Account</strong>: You can use developer account credentials to log in to a Redhat server with a GUI on VMware."]}, {t:"text", html:"<p>### Getting IP & SSH</p>"}, {t:"code", code:"ifconfig", lang:"bash"}, {t:"text", html:"<p>Returns the IP address (Skip this step for Ubuntu).</p>"}, {t:"code", code:"ssh root@ipaddress", lang:"bash"}, {t:"text", html:"<p>Connects to the server.</p>"}]
        },
        {
          id: "shell-prompt-basic-cli-syntax",
          title: "Shell Prompt & Basic CLI Syntax",
          icon: "eye",
          blocks: [{t:"list", items:["<strong>Default Shell in Redhat</strong>: Bash","<strong>CLI (Command Line Interface)</strong> syntax: <code>Command [Option] [Argument]</code>","Dash <code>[option]</code> has \"no spaces\" (e.g., <code>-V</code>).","You must have a space after the <code>[command]</code>.","There could be no <code>[argument]</code> in CLI (used for modification/determining action)."]}, {t:"text", html:"<p>### Combining Options</p>"}, {t:"text", html:"<p>Options can be combined.</p>"}, {t:"list", items:["Example: <code>-l -d</code> (Correct), <code>-ld</code> (Correct), <code>-l d</code> (Incorrect)."]}, {t:"text", html:"<p>### Terminal Shortcuts</p>"}, {t:"table", head:["Shortcut","Description"], rows:[["Win + ↑","Maximize terminal"],["Ctrl + U","Delete all the part of the command before the cursor"],["Ctrl + K","Delete all the part of the command after the cursor"],["cd [tab][tab]","Displays all files with the same initial"],["cd [tab]","Auto-completes file name initial"]]}, {t:"text", html:"<p>### History Commands</p>"}, {t:"table", head:["Command","Description"], rows:[["!500","Runs command number 500 in history"],["!!","Runs the last command in history"]]}, {t:"text", html:"<p>### Switching Users</p>"}, {t:"code", code:"su - username", lang:"bash"}, {t:"text", html:"<p>Switches user (prompts for password).</p>"}]
        },
        {
          id: "file-system-hierarchy",
          title: "File System Hierarchy",
          icon: "folder",
          blocks: [{t:"table", head:["Directory","Description"], rows:[["/","Root file system (like Local Disk C). Contains everything underneath it *(تحته)*"],["root","System user (Admin). /root contains the Super user profile"],["home","Contains any regular user profile"],["bin","Regular user data related (\"shortcut\" / \"symbolic link\")"],["sbin","Super user data related (\"shortcut\" / \"soft link\")"],["boot","Booting OS files"],["etc","All config files"],["dev","All hardware components"],["run","Any files related to services (\"not shortcut\", \"different\")"],["var","Any variable in the system. Contains a tmp that clears every 30 days"],["tmp","Temporary files (clears every 10 days). Both tmp and /var/tmp are caches"],["usr","The original system directory *(الأصلي)*"]]}]
        },
        {
          id: "file-directory-management",
          title: "File & Directory Management",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Navigation (<code>cd</code>, <code>pwd</code>)</p>"}, {t:"list", items:["<strong>Shell prompt</strong>: <code>[root@server ~]</code> -> <code>~</code> refers to the home directory.","For regular users: <code>/home/regularuser</code>","For root: <code>/root</code>"]}, {t:"table", head:["Command","Description"], rows:[["cd ~ / cd","Return to the home directory (whether regular or superuser)"],["cd -","One step backwards (previous directory)"],["cd ..","Move up one level (relative path)"]]}, {t:"list", items:["<strong>Absolute path</strong>: The entire path.","<strong>Relative path</strong>: Not the entire path."]}, {t:"text", html:"<p>### Listing (<code>ls</code>, <code>tree</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["ls","List files in the directory"],["ls -a","List all files, whether hidden or non-hidden (Hidden files start with a dot)"],["ls -l","Long list"],["ls -r","Reversed list"],["ls -h","Converts bits to bytes (human-readable)"],["ls -lthr","Long list, human-readable, sorted by time, reversed"],["ls -lR","Recursive list (lists all the content of the directory, whether files or directories)"],["tree","Shows directory structure visually"]]}, {t:"text", html:"<p>### File Creation, Copying & Moving</p>"}, {t:"code", code:"mkdir dir1", lang:"bash"}, {t:"text", html:"<p>Make directory.</p>"}, {t:"code", code:"mkdir -p", lang:"bash"}, {t:"text", html:"<p>Make parent directories (e.g., <code>mkdir -p \"Rahma Tarek\"</code> vs <code>mkdir \"Roaa Tarek\"</code> vs <code>mkdir Ayah Tarek</code>).</p>"}, {t:"code", code:"touch file1", lang:"bash"}, {t:"text", html:"<p>Create an empty file.</p>"}, {t:"text", html:"<p><code>cp</code>: Copying files. Copies are not connected to each other (unlike links).</p>"}, {t:"code", code:"cp -r NTI /root", lang:"bash"}, {t:"text", html:"<p>For copying a directory.<br><em>(بناخد الـ NTI كوبي ونحطه جوا الـ root / copy الـ NTI الاصلية جوا الـ root اللي هو الـ home directory)</em></p>"}, {t:"text", html:"<p><code>mv</code>: \"Cut\" or \"Rename\" depending on whether you provide a path to paste or just a new name.</p>"}, {t:"text", html:"<p>### Deleting (<code>rm</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["rm file2","Asks to verify"],["rm -f file2","Deletes without inquiry (force)"],["rm -r dir1","Removes directory recursively (asks to verify)"],["rm -fr dir1","Removes directory recursively without inquiry"]]}, {t:"callout", kind:"warning", html:"<code>rm -fr dir1</code> removes a directory recursively without asking for confirmation. Double-check the target before running it."}, {t:"text", html:"<p>### Viewing File Content</p>"}, {t:"table", head:["Command","Description"], rows:[["cat /etc/<file>","List the content of the file"],["less /etc/<file>","Instead of cat, more organized, allows scrolling & using Space to move to the next page"],["head /etc/<file>","First 10 lines"],["head -n 5 /etc/<file>","First 5 lines"],["head /etc/file1 /etc/file2","First 10 lines from both files"],["tail /etc/<file>","Last lines"],["tail -n 5 /etc/<file>","Last 5 lines"]]}]
        },
        {
          id: "links-hard-links-vs-soft-links",
          title: "Links (Hard Links vs. Soft Links)",
          icon: "folder",
          blocks: [{t:"table", head:["Behavior","Soft Link","Hard Link"], rows:[["Inode","Different inode","Same inode"],["Relationship to source","It's just a pointer to the original file","Both files are real-time aligned (connected to each other)"],["Size","The soft link size is not related to the original file size, as it's only a pointer","The file size is the same as the hard link size"],["Creation","ln -s /etc soft-link","ln <source> <link>"]]}, {t:"code", code:"ls -i", lang:"bash"}, {t:"text", html:"<p>Displays inodes.</p>"}]
        },
        {
          id: "search-pattern-matching-grep-wildcards",
          title: "Search & Pattern Matching (`grep` & Wildcards)",
          icon: "search",
          blocks: [{t:"text", html:"<p>### Wildcards (Rules of naming files)</p>"}, {t:"table", head:["Pattern","Meaning"], rows:[["ls [fa]*","Matches any file starting with f or a"],["ls [a-c]*","Any file starting with one of these letters (a, b, c)"],["ls [!fa]* / ls [^a-f]* / ls [!a-f]*","Any file that does not start with one of these letters"],["ls [~a-c]*","Any file starting with one of these letters"]]}, {t:"text", html:"<p>### Text Searching (<code>grep</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["grep omar /etc/passwd","Searches for \"omar\""],["grep -i omar /etc/passwd","\"Not case-sensitive\""],["grep -l Karim /etc/passwd","If there is \"Karim\", returns the file path only; if not found, returns nothing"],["grep -A 2 Ali /etc/passwd","Returns the line itself & 2 lines After"],["grep -B 2 Ali /etc/passwd","Returns the line itself & 2 lines Before"],["grep -e omar -e Ali /etc/passwd","Searching for 2 words at the same time"],["grep ^cat /etc/passwd","Returns any word that starts with \"cat\""],["grep c.t /etc/passwd","One letter in between 'c' and 't'"],["grep ^c..t$ /etc/passwd","Starts with 'c' & ends with 't' with exactly 2 letters in between"]]}]
        }
        ]
      },
      michael: {
        author: "Michael",
        subtitle: "Comprehensive Linux Commands & File System",
        avatar: "M",
        sections: [
        {
          id: "directory-navigation-paths",
          title: "Directory Navigation & Paths",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Working Directory & Path Types</p>"}, {t:"list", items:["<code>pwd</code> (<strong>Print Working Directory</strong>): Displays the current absolute directory path.","<strong>Absolute Path</strong>: Path defined from the root directory <code>/</code> (e.g., <code>/usr/share/doc/</code>).","<strong>Relative Path</strong>: Path defined relative to the current directory (e.g., <code>..</code>, <code>doc/</code>)."]}, {t:"text", html:"<p>### Navigation Commands (<code>cd</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["cd","Change directory"],["cd /","Move to the Root Directory /"],["cd ~ / cd $HOME / cd /home/<username>","Move to the current user's Home Directory (contains the 4 basic user directories: Desktop, Documents, Downloads, etc.)"],["cd /root","Move to the Root User's Home Directory"],["cd -","Switch back to the previous working directory"],["cd ..","Move up one level in the directory tree (parent directory)"],["cd /dev/","Navigate to system devices directory"],["cd /run","Navigate to runtime variable data directory"],["cd /usr/share/doc/","Navigate to documentation folder"],["cd /var/log","Navigate to system log directory"]]}, {t:"text", html:"<p><code>cd -</code> switches back to the previous working directory.<br><em>(يرجعك لآخر مكان كنت فيه)</em></p>"}, {t:"callout", kind:"info", html:"<strong>Key Question (إيه الفرق بين <code>~</code> و <code>/home/</code>؟):</strong> <code>~</code> represents the home directory of the currently logged-in user (e.g., <code>/home/omar</code> for user <code>omar</code>, or <code>/root</code> for the <code>root</code> user). <code>/home/</code> is the base directory housing all individual user home folders."}]
        },
        {
          id: "directory-listing-file-inspection-ls-dir",
          title: "Directory Listing & File Inspection (`ls`, `dir`, `tree`)",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Basic & Advanced <code>ls</code> Flags</p>"}, {t:"list", items:["<code>ls</code>: Lists files and directories in the current folder.","<code>ls /</code>: Lists contents of the root directory.","<code>ls -l</code>: Detailed long-listing format. Displays file types, permissions (9 bits), link count, owner, group, file size, last modified time, and name."]}, {t:"text", html:"<p><strong>File Type Identifiers in <code>ls -l</code>:</strong></p>"}, {t:"table", head:["Identifier","Meaning"], rows:[["d","Directory *(أي directory باللون الأزرق - directories in blue)*"],["-","Regular file"],["l","Symbolic link"]]}, {t:"table", head:["Command","Description"], rows:[["ls -la / ls -a","Lists all files, including hidden files (starting with .)"],["ls -lh","Displays file sizes in Human-Readable formats (KB, MB, GB)"],["ls -lt","Sorts output by modification time (newest first)"],["ls -ltr","Sorts output by modification time in reverse (oldest first)"],["ls -lR / ls -LR","Recursive directory listing (lists subdirectories and their contents)"],["ls -li","Displays file listing along with Inode numbers"]]}, {t:"text", html:"<p>### <code>dir</code> vs <code>ls</code></p>"}, {t:"list", items:["<code>dir</code>: Similar to <code>ls</code>, lists directory contents.","<code>dir --color</code>: Colorizes directory listings to distinguish files and folders.","Both commands are <strong>case-sensitive</strong>."]}, {t:"text", html:"<p>### Wildcards & Pattern Matching in <code>ls</code></p>"}, {t:"table", head:["Pattern","Meaning"], rows:[["ls file*","Matches any file starting with file"],["ls [fa]*","Matches files starting with either f or a"],["ls [a-c]*","Matches files starting with letters a, b, or c"],["ls [!fa]*","Matches files NOT starting with f or a *(إستثناء - exclusion)*"],["ls [!a-c]*","Matches files NOT starting with a, b, or c"],["ls file[[:alpha:]]","Matches file followed by any alphabetic character"],["ls *[[:space:]]*","Matches filenames containing space characters"]]}]
        },
        {
          id: "file-directory-management-touch-mkdir-cp",
          title: "File & Directory Management (`touch`, `mkdir`, `cp`, `mv`, `rm`)",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Creating Files & Directories</p>"}, {t:"code", code:"touch File1", lang:"bash"}, {t:"text", html:"<p>Creates an empty file named <code>File1</code> (or updates timestamps if it exists).</p>"}, {t:"code", code:"touch File1 File2", lang:"bash"}, {t:"text", html:"<p>Creates multiple empty files at once.</p>"}, {t:"code", code:"touch /root/Desktop/File1", lang:"bash"}, {t:"text", html:"<p>Creates a file at a specific path.</p>"}, {t:"code", code:"mkdir dir1", lang:"bash"}, {t:"text", html:"<p>Creates a directory named <code>dir1</code>.</p>"}, {t:"code", code:"mkdir -p dir1/dir2/dir3", lang:"bash"}, {t:"text", html:"<p><strong>Parent flag (<code>-p</code>)</strong> creates nested directory structures recursively.<br><em>(بيعمل المجلدات وأجزائها)</em></p>"}, {t:"code", code:"tree dir1", lang:"bash"}, {t:"text", html:"<p>Visualizes directory hierarchy in a tree structure.</p>"}, {t:"code", code:"mkdir system/admin", lang:"bash"}, {t:"text", html:"<p>Creates nested system/admin directories.</p>"}, {t:"text", html:"<p>### Copying Files & Directories (<code>cp</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["cp /etc/passwd /home/omar","Copies /etc/passwd to /home/omar"],["cp /etc/shadow .","Copies /etc/shadow to the current working directory (.)"],["cp -r /etc/ /home/","Recursive copy (-r): copies directory /etc/ along with all its subdirectories and contents"],["cp -r /etc/* /home/","Copies all contents inside /etc/ into /home/"],["cp File1 File2 File3 /home/omar","Copies multiple files into a destination directory"],["cp /etc/passwd ~","Copies file to user's home directory"]]}, {t:"text", html:"<p>### Moving & Renaming (<code>mv</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["mv passwd new_passwd","Renames file passwd to new_passwd (when destination path remains unchanged)"],["mv new_passwd /root/Documents","Moves file to /root/Documents"],["mv File1 File2 File3 /root/","Moves multiple files to /root/"],["mv dir1 dir2 dir3 dir4","Moves multiple directories or contents"]]}, {t:"text", html:"<p>### Deleting Files & Directories (<code>rm</code>, <code>rmdir</code>)</p>"}, {t:"code", code:"rm File1", lang:"bash"}, {t:"text", html:"<p>Removes/deletes <code>File1</code>.</p>"}, {t:"code", code:"rmdir dir1", lang:"bash"}, {t:"text", html:"<p>Removes empty directory <code>dir1</code>.</p>"}, {t:"text", html:"<p><strong>Aliases & Root Protection:</strong></p>"}, {t:"callout", kind:"tip", html:"<code>alias rm='rm -i'</code>: Interactive mode prompts for confirmation before deletion.<br><em>(يسأل قبل ما يمسح)</em><br>The <code>root</code> user defaults to interactive <code>rm -i</code> for safety."}, {t:"code", code:"rm -f File1", lang:"bash"}, {t:"text", html:"<p><strong>Force delete (<code>-f</code>)</strong> bypasses prompts.<br><em>(يمسح بدون ما يسأل)</em></p>"}, {t:"code", code:"rm -r dir1", lang:"bash"}, {t:"text", html:"<p><strong>Recursive delete (<code>-r</code>)</strong> removes directory and its contents.</p>"}, {t:"code", code:"rm -rf dir1", lang:"bash"}, {t:"text", html:"<p>Forcefully and recursively removes directory <code>dir1</code>.</p>"}, {t:"callout", kind:"warning", html:"<code>rm -rf *</code> deletes everything in the current directory.<br><em>(يمسح كل حاجة)</em>"}, {t:"callout", kind:"danger", html:"<code>rm -rf /</code> deletes the entire system. Irreversible.<br><em>(يمسح السيستم كله - CRITICAL DANGER)</em>"}]
        },
        {
          id: "inodes-links-hard-links-vs-soft-symbolic",
          title: "Inodes & Links (Hard Links vs. Soft/Symbolic Links)",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Understanding Inodes</p>"}, {t:"text", html:"<p><strong>Inode</strong>: Index node storing metadata about a file (file size, permissions, owner, timestamps, block pointers). Metadatas are stored in the Inode Table.</p>"}, {t:"text", html:"<p>### Creating & Managing Links</p>"}, {t:"code", code:"ln passwd hard-link-passwd", lang:"bash"}, {t:"text", html:"<p>Creates a <strong>Hard Link</strong> named <code>hard-link-passwd</code>.</p>"}, {t:"code", code:"ln -s passwd soft-link1", lang:"bash"}, {t:"text", html:"<p>Creates a <strong>Soft/Symbolic Link</strong> (<code>-s</code>) named <code>soft-link1</code>.</p>"}, {t:"code", code:"ls -li", lang:"bash"}, {t:"text", html:"<p>Displays Inode numbers along with file details.</p>"}, {t:"text", html:"<p>### Key Rules & Behavior Differences</p>"}, {t:"table", head:["Behavior","Hard Link","Soft Link"], rows:[["Inode","Points directly to the same Inode as the source file. Increments link count.","Has its own Inode; points to the target filename/path."],["Deleting source file (rm -f passwd)","Data remains accessible because the link points to the underlying Inode/data blocks *(لو مسحت الملف الأصلي، الـ hard link يفضل شغال)*","Becomes broken/invalid *(الـ soft link يقف - broken link error when reading via cat)*"],["Works on directories?","❌ Cannot create hard links for directories *(ميدعمش نعمل hard link لـ directory)*","✅ Supports directories"],["Works across different filesystems/partitions?","❌ Cannot create hard links across different filesystems/partitions *(ولا بين different filesystem)*","✅ Works across different filesystems"]]}, {t:"diagram", kind:"links"}]
        },
        {
          id: "text-searching-grep-regular-expressions",
          title: "Text Searching (`grep`) & Regular Expressions",
          icon: "search",
          blocks: [{t:"text", html:"<p><code>grep</code> searches text for patterns and prints matching lines.</p>"}, {t:"text", html:"<p>### Basic Searching & Flags</p>"}, {t:"code", code:"grep omar /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Searches for string <code>omar</code> in <code>/etc/passwd</code>.</p>"}, {t:"code", code:"grep bash /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Searches for <code>bash</code>.</p>"}, {t:"table", head:["Command","Description"], rows:[["grep -i bash /etc/passwd","Case-insensitive search (-i) *(Case insensitive - يتجاهل حالة الأحرف)*"],["grep -v nologin /etc/passwd","Invert match (-v): prints lines that do NOT contain nologin *(سيرش على أي line مفيهاش nologin)*"],["grep -w shut /etc/passwd","Word match (-w): matches whole word shut only *(بيدور على كلمة كاملة)*"],["grep -A 2 root /etc/passwd","Displays match plus 2 lines AFTER (-A)"],["grep -B 2 root /etc/passwd","Displays match plus 2 lines BEFORE (-B)"],["grep -r omar /etc","Recursive search (-r): searches all files inside directory /etc"],["grep -rl omar /etc","Lists only filenames (-l) containing the match"],["grep -e omar -e root /etc/passwd","Searches for multiple patterns (-e) simultaneously (omar OR root)"]]}, {t:"text", html:"<p>### Regular Expressions with <code>grep</code></p>"}, {t:"text", html:"<p>Used with dictionary files (e.g., <code>/usr/share/dict/words</code>):</p>"}, {t:"table", head:["Command","Description"], rows:[["grep '^cat' /usr/share/dict/words","Matches lines starting with cat"],["grep 'cat$' /usr/share/dict/words","Matches lines ending with cat"],["grep '^cat$' /usr/share/dict/words","Matches exact line cat"],["grep 'c.t' /usr/share/dict/words","Matches c, followed by any single character, followed by t"],["grep '^c.t$' /usr/share/dict/words","Exact 3-letter words starting with c and ending with t"],["grep '^c[aou]t$' /usr/share/dict/words","Exact 3-letter words starting with c, middle character a, o, or u, and ending with t (e.g., cat, cot, cut)"]]}]
        },
        {
          id: "text-processing-cut",
          title: "Text Processing (`cut`)",
          icon: "file",
          blocks: [{t:"text", html:"<p>The <code>cut</code> command extracts sections from each line of a file.</p>"}, {t:"text", html:"<p>### Slicing Characters (<code>-c</code>)</p>"}, {t:"code", code:"cut -c 1-5 /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Extracts characters from position 1 to 5 of each line.</p>"}, {t:"code", code:"cut -c 5- /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Extracts characters from position 5 to the end of each line.</p>"}, {t:"text", html:"<p>### Delimiters & Fields (<code>-d</code>, <code>-f</code>)</p>"}, {t:"code", code:"cut -d : -f 1 /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Sets delimiter (<code>-d</code>) to <code>:</code> and extracts field 1 (usernames).</p>"}, {t:"code", code:"cut -d : -f 1,7 /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Extracts fields 1 and 7 (username and login shell).</p>"}]
        }
        ]
      },
      hager: {
        author: "Hager",
        subtitle: "Linux Session Revision Sheet",
        avatar: "H",
        sections: [
        {
          id: "linux-basics",
          title: "Linux Basics",
          icon: "cpu",
          blocks: [{t:"text", html:"<p>### Linux vs. Windows</p>"}, {t:"list", items:["Security","Stability","Maintenance","Runs on different hardware","Free & open source","Easy to customize","Community support","Different user-interface experience"]}, {t:"text", html:"<p>### Linux Architecture</p>"}, {t:"diagram", kind:"architecture"}, {t:"list", items:["<strong>Kernel:</strong> Works with the hardware.","<strong>Shell:</strong> Interface for interacting with the system through commands."]}, {t:"text", html:"<p>### Swap</p>"}, {t:"text", html:"<p>Uses part of the storage as additional memory when needed.</p>"}]
        },
        {
          id: "users-and-privileges",
          title: "Users and Privileges",
          icon: "file",
          blocks: [{t:"table", head:["Symbol","Meaning"], rows:[["$","Regular user"],["#","Superuser"]]}]
        },
        {
          id: "command-syntax",
          title: "Command Syntax",
          icon: "eye",
          blocks: [{t:"code", code:"command  option  argument", lang:"bash"}, {t:"text", html:"<p>Example:</p>"}, {t:"code", code:"ls -l /dev", lang:"bash"}, {t:"list", items:["A space is required between the command, options, and arguments.","Options can be combined."]}, {t:"text", html:"<p>For example:</p>"}, {t:"code", code:"ls -ld", lang:"bash"}, {t:"text", html:"<p>is equivalent to:</p>"}, {t:"code", code:"ls -l -d", lang:"bash"}]
        },
        {
          id: "navigation",
          title: "Navigation",
          icon: "file",
          blocks: [{t:"table", head:["Command","Description"], rows:[["pwd","Print working directory"],["cd","Go to home directory"],["cd ~","Go to home directory"],["cd $HOME","Go to home directory"],["cd /absolute/path","Go to an absolute path"],["cd -","Go back to the previous directory"]]}]
        },
        {
          id: "listing-files",
          title: "Listing Files",
          icon: "folder",
          blocks: [{t:"table", head:["Command","Description"], rows:[["ls","List files"],["ls -a","List all files, including hidden files"],["ls -l","Long listing"],["ls -la","Long listing + hidden files"],["ls -lt","Sort by time"],["ls -ltr","Sort by time, reverse order"],["ls -lth","Long listing + time sorting + human-readable size"]]}, {t:"callout", kind:"info", html:"Files and directories starting with <code>.</code> are hidden."}, {t:"text", html:"<p>### Wildcards</p>"}, {t:"table", head:["Pattern","Meaning"], rows:[["ls p*","Starts with p"],["ls *p","Ends with p"],["ls ???","Exactly 3 characters"],["ls [a-c]*","Starts with a, b, or c"],["ls [!a]*","Does not start with a"],["ls [!a-c]*","Does not start with a–c"]]}, {t:"callout", kind:"info", html:"Inside <code>[]</code>, <code>!</code> and <code>^</code> have the same meaning."}]
        },
        {
          id: "file-content",
          title: "File Content",
          icon: "folder",
          blocks: [{t:"table", head:["Command","Description"], rows:[["cat file","Show file content"],["nano file","Edit a file"],["head -n N file","Show the first N lines"],["tail -n N file","Show the last N lines"]]}]
        },
        {
          id: "file-directory-management",
          title: "File & Directory Management",
          icon: "folder",
          blocks: [{t:"table", head:["Command","Description"], rows:[["touch file","Create an empty file"],["mkdir dir","Create a directory"],["cp file dest","Copy a file"],["cp -r dir dest","Copy a directory recursively"],["mv file dest","Move a file"],["mv file newname","Rename a file"],["rm -rf dir","Force-remove a directory recursively"]]}, {t:"text", html:"<p>### Important Options</p>"}, {t:"code", code:"-r / -R  → recursive\n-f       → force", lang:"bash"}, {t:"callout", kind:"danger", html:"<code>rm -rf dir</code> force-removes a directory recursively. This is irreversible — the data is not recoverable."}]
        },
        {
          id: "searching-with-grep",
          title: "Searching with `grep`",
          icon: "search",
          blocks: [{t:"text", html:"<p>Basic command:</p>"}, {t:"code", code:"grep hager dir", lang:"bash"}, {t:"text", html:"<p>### Useful Options</p>"}, {t:"table", head:["Command","Description"], rows:[["grep -i","Case-insensitive"],["grep -l","Show only file names containing the pattern"],["grep -B N","Show N lines **before** the match"],["grep -A N","Show N lines **after** the match"]]}, {t:"text", html:"<p>Example:</p>"}, {t:"code", code:"grep -i hager dir\ngrep -l hager dir\ngrep -B 2 hager dir\ngrep -A 2 hager dir", lang:"bash"}]
        },
        {
          id: "links",
          title: "Links",
          icon: "folder",
          blocks: [{t:"text", html:"<p>Linux supports <strong>hard links</strong> and <strong>soft links</strong>.</p>"}, {t:"text", html:"<p>### Hard Link</p>"}, {t:"code", code:"ln file1 file2", lang:"bash"}, {t:"list", items:["Both names refer to the same data.","They share the same inode.","A hard link cannot link directories.","The data remains as long as at least one hard link still exists."]}, {t:"text", html:"<p>Example:</p>"}, {t:"code", code:"ln file1 file2", lang:"bash"}, {t:"text", html:"<p>To remove a hard link:</p>"}, {t:"code", code:"rm -rf hard-link", lang:"bash"}, {t:"callout", kind:"warning", html:"<code>rm -rf hard-link</code> is used to remove a hard link. Since <code>-rf</code> is destructive, confirm the target before running it."}, {t:"text", html:"<p>### Soft Link</p>"}, {t:"text", html:"<p>A soft link points to a path.</p>"}, {t:"text", html:"<p>### Inode</p>"}, {t:"list", items:["Every file or directory has an <strong>inode</strong> allocated for it.","A hard link refers to the same inode/data."]}]
        },
        {
          id: "important-filesystem-directories",
          title: "Important Filesystem Directories",
          icon: "folder",
          blocks: [{t:"table", head:["Directory","Purpose"], rows:[["/","Root of the entire filesystem"],["/bin","Essential binaries for regular users"],["/sbin","System binaries for the superuser"],["/dev","Device files"],["/etc","Configuration files"],["/home","Users' home directories"],["/root","Home directory of the superuser"],["/tmp","Temporary files"],["/var","Variable data, such as /var/tmp"],["/run","Runtime data related to services"],["/local","Local / customized software"]]}, {t:"text", html:"<p>### Important</p>"}, {t:"code", code:"/       → Root of the filesystem\n/root   → Home directory of the superuser\n/home   → Home directories of regular users", lang:"bash"}, {t:"callout", kind:"info", html:"<code>/root</code> is <strong>not</strong> the same as <code>/home/root</code>."}]
        },
        {
          id: "terminal-keyboard-shortcuts",
          title: "Terminal Keyboard Shortcuts",
          icon: "file",
          blocks: [{t:"table", head:["Shortcut","Action"], rows:[["Ctrl + A","Go to the beginning of the command"],["Ctrl + E","Go to the end of the command"],["Ctrl + ← / →","Move by word"],["Ctrl + K","Cut from the cursor to the end of the line"],["Ctrl + U","Cut from the cursor to the beginning of the line"]]}]
        }
        ]
      },
      sagda: {
        author: "Sagda",
        subtitle: "Day 2 — Man Pages, Redirection, Pipelines, Vim, Variables, and User Types",
        avatar: "S",
        sections: [
        {
          id: "man-pages-getting-help-in-linux",
          title: "Man Pages — Getting Help in Linux",
          icon: "cpu",
          blocks: [{t:"text", html:"<p>### What are man pages?</p>"}, {t:"text", html:"<p>Every command in Linux comes bundled with its own official documentation, built right into the operating system. This is called a \"man page\" (short for manual page). Unlike searching the internet, man pages are always installed locally, always match the exact version of the command on your system, and work even if you have no internet connection — which matters a lot for servers.</p>"}, {t:"code", code:"man passwd", lang:"bash"}, {t:"text", html:"<p>### Why man pages have numbered sections</p>"}, {t:"text", html:"<p>Some words in Linux mean more than one thing. For example, <code>passwd</code> refers to:</p>"}, {t:"list", items:["A command you run to change a password","A file (<code>/etc/passwd</code>) that stores account information"]}, {t:"text", html:"<p>If Linux just had one manual page per word, this would be confusing. So man pages are split into sections, each numbered:</p>"}, {t:"table", head:["Section","What it documents","Example"], rows:[["1","Executable programs / user commands","man 1 passwd"],["5","File formats and configuration file structure","man 5 passwd"],["8","System administration commands (root-level)","man 8 useradd"]]}, {t:"text", html:"<p>When you type <code>man passwd</code> without specifying a number, Linux shows you the lowest-numbered match it finds — usually the command page (section 1). If you specifically want the file-format explanation, you must ask for it directly with <code>man 5 passwd</code>.</p>"}, {t:"text", html:"<p>Where these files physically live:</p>"}, {t:"code", code:"cd /usr/share/man", lang:"bash"}, {t:"text", html:"<p>This folder contains subdirectories like <code>man1</code>, <code>man5</code>, <code>man8</code>, etc. — one folder per section — each holding the actual manual files. You'll rarely need to browse here manually, but it's good to know this isn't magic; it's just organized text files on disk.</p>"}, {t:"text", html:"<p>### Checking if a command exists</p>"}, {t:"code", code:"whereis useradd", lang:"bash"}, {t:"text", html:"<p>This tells you whether the command actually exists on this machine and where its files are stored (its binary program, its man page, and sometimes source files). This is useful troubleshooting before assuming \"maybe this command isn't installed.\"</p>"}, {t:"text", html:"<p>### Navigating inside an open man page</p>"}, {t:"text", html:"<p>Man pages open using a \"pager\" program (usually called <code>less</code>), which lets you scroll through long text comfortably. Once inside, these keys help you move around:</p>"}, {t:"table", head:["Key","What it does"], rows:[["/word","Searches forward through the page for \"word\""],["n","Jumps to the next occurrence of your last search"],["Shift + N","Jumps to the previous occurrence"],["Shift + G","Jumps straight to the end of the document"],["g","Jumps straight to the beginning"],["q","Quits and returns you to your terminal prompt"]]}, {t:"text", html:"<p>This matters because man pages can be extremely long (some run hundreds of lines), so scrolling manually line-by-line would waste a lot of time.</p>"}, {t:"text", html:"<p>### Quick summary tools</p>"}, {t:"text", html:"<p><code>whatis</code> — gives you a one-line description instead of opening the whole manual:</p>"}, {t:"code", code:"whatis passwd", lang:"bash"}, {t:"text", html:"<p>Output is something short like: \"passwd - update user's authentication tokens\" — enough to jog your memory without committing to reading a full page.</p>"}, {t:"text", html:"<p><code>man -k</code> — lets you search by topic instead of by exact command name:</p>"}, {t:"code", code:"man -k \"print files\"", lang:"bash"}, {t:"text", html:"<p>This searches through the short description line of every man page installed on the system and shows you every command whose description matches your keyword. This is incredibly useful when you know what you want to accomplish but don't remember the exact command name for it.</p>"}, {t:"callout", kind:"info", html:"Behind the scenes, <code>man -k</code> relies on a search database called <code>mandb</code>. If <code>man -k</code> returns nothing on a fresh system, an administrator may need to run <code>mandb</code> once to build that index."}, {t:"text", html:"<p><code>--help</code> — nearly every Linux command supports this flag:</p>"}, {t:"code", code:"useradd --help", lang:"bash"}, {t:"text", html:"<p>This prints a condensed list of all available options for that command directly in your terminal — much faster than opening the full man page when you just need a quick reminder of what flags exist.</p>"}, {t:"text", html:"<p>### When to use which tool</p>"}, {t:"table", head:["Situation","Tool"], rows:[["Know the command, want full details","man command"],["Know the command, just want a one-liner","whatis command"],["Know the command, just want the option flags","command --help"],["Don't know the command name at all","man -k \"keyword\""]]}]
        },
        {
          id: "redirection-controlling-where-data-goes",
          title: "Redirection — Controlling Where Data Goes",
          icon: "network",
          blocks: [{t:"text", html:"<p>### The concept</p>"}, {t:"text", html:"<p>Every command you run in Linux is silently connected to three data channels:</p>"}, {t:"list", items:["Input — where the command reads data from (by default, your keyboard)","Output — where the command sends its normal results (by default, your screen)","Error — where the command sends error/warning messages (by default, also your screen)"]}, {t:"text", html:"<p>Linux internally labels these with numbers called File Descriptors (FDs):</p>"}, {t:"table", head:["Stream name","Purpose","File Descriptor number"], rows:[["Standard Input (stdin)","Where the command reads input from","0"],["Standard Output (stdout)","Where normal results go","1"],["Standard Error (stderr)","Where error messages go","2"]]}, {t:"text", html:"<p>Redirection means telling Linux \"instead of the default location, send this stream somewhere else — usually into a file.\" This is one of the most powerful ideas in the Linux command line because it lets you automate things without ever touching a mouse or GUI.</p>"}, {t:"text", html:"<p>### Overwrite redirection: <code>></code></p>"}, {t:"code", code:"ls -l > list.txt", lang:"bash"}, {t:"text", html:"<p>This runs <code>ls -l</code> (list files with details) and instead of showing the results on your screen, sends them into a file called <code>list.txt</code>.</p>"}, {t:"callout", kind:"warning", html:"If <code>list.txt</code> already exists and has content, <code>></code> will completely erase that content first, then write the new output. There's no confirmation prompt — it just happens. This is called overwriting, and it's the #1 way beginners accidentally lose data, so always double-check the filename before using a single <code>></code>."}, {t:"text", html:"<p>### Append redirection: <code>>></code></p>"}, {t:"code", code:"date >> list.txt", lang:"bash"}, {t:"text", html:"<p>This runs <code>date</code> (which prints today's date and time) and adds that output to the end of <code>list.txt</code>, without touching or deleting whatever was already inside the file. Think of <code>></code> as \"replace the file\" and <code>>></code> as \"add onto the file.\" This is exactly what you'd use to build up a running log over time — for example, appending a timestamp to a log file every time a script runs.</p>"}, {t:"text", html:"<p>### Input redirection: <code><</code></p>"}, {t:"text", html:"<p>So far we've talked about output — but you can redirect input too. Normally, a command like <code>sort</code> waits for you to type names one by one on the keyboard. Instead, you can tell it to read directly from a file:</p>"}, {t:"code", code:"sort < names.txt", lang:"bash"}, {t:"text", html:"<p>This makes <code>sort</code> read all the lines already stored in <code>names.txt</code> and immediately sort them alphabetically, without you needing to type anything interactively. This is less common day-to-day than output redirection, but it's important conceptually: input, output, and error are three separate, independently redirectable channels.</p>"}, {t:"text", html:"<p>### Error-only redirection: <code>2></code></p>"}, {t:"text", html:"<p>Because errors have their own File Descriptor (2), you can redirect only the errors, leaving normal output untouched:</p>"}, {t:"code", code:"find / -name passwd 2> /dev/null", lang:"bash"}, {t:"text", html:"<p>Let's unpack this real-world example:</p>"}, {t:"list", items:["<code>find / -name passwd</code> searches the entire filesystem (starting from <code>/</code>, the root) for anything named <code>passwd</code>","Because this search touches nearly every folder on the system, it will try to peek into directories you don't have permission to access — and each of those attempts generates a \"Permission denied\" error","<code>2></code> grabs only those error messages (Channel 2) and sends them into <code>/dev/null</code>","<code>/dev/null</code> is a special file built into Linux that acts like a black hole — anything written into it is instantly discarded and gone forever. It's the standard way to \"throw away\" unwanted output.","Meanwhile, the actual successful search results (the file paths it did find) are not affected — they still print normally to your screen, because you only redirected Channel 2, not Channel 1"]}, {t:"text", html:"<p>This pattern (<code>2> /dev/null</code>) is extremely common in real system administration to keep your terminal clean while running system-wide searches.</p>"}, {t:"text", html:"<p>### Combining output and error redirection</p>"}, {t:"text", html:"<p>Sometimes you want both the normal results and the error messages saved — either together in one file, or split into two separate files.</p>"}, {t:"text", html:"<p>Splitting into two separate files:</p>"}, {t:"code", code:"find / -name passwd > results.txt 2> errors.txt", lang:"bash"}, {t:"text", html:"<p>Successful matches go into <code>results.txt</code>; error messages go into <code>errors.txt</code>.</p>"}, {t:"text", html:"<p><code>&></code> — the modern shorthand for combining both into ONE file:</p>"}, {t:"code", code:"command &> all_output.txt", lang:"bash"}, {t:"text", html:"<p>This single symbol tells Linux \"send both the normal output AND the errors into this same file.\" It's a shortcut that saves you from writing two separate redirections.</p>"}, {t:"text", html:"<p><code>2>&1</code> — the traditional (older, more explicit) method for combining streams:</p>"}, {t:"code", code:"command > all_output.txt 2>&1", lang:"bash"}, {t:"text", html:"<p>This reads as: \"send normal output (Channel 1) into <code>all_output.txt</code>, THEN also redirect errors (Channel 2) into wherever Channel 1 is currently pointing.\" The order matters here — <code>2>&1</code> must come after the <code>></code> redirection, and it must be placed at the end of the command, because Linux processes these redirections left to right, and Channel 2 needs to know where Channel 1 is already pointing before it can copy that destination.</p>"}, {t:"diagram", kind:"links"}]
        },
        {
          id: "pipelines-connecting-commands-together",
          title: "Pipelines — Connecting Commands Together",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### The concept</p>"}, {t:"text", html:"<p>A pipeline is similar to redirection, but instead of sending a command's output into a file, it sends that output directly into another command as that command's input — with no file ever being created in between. The symbol used is the vertical bar <code>|</code>, called a \"pipe.\"</p>"}, {t:"code", code:"ls -l | grep ^-", lang:"bash"}, {t:"text", html:"<p>Let's break this down step by step:</p>"}, {t:"list", items:["<code>ls -l</code> runs first, producing a detailed list of files and folders, where each line starts with a permission code like <code>drwxr-xr-x</code> (directories) or <code>-rw-r--r--</code> (regular files)","The <code>|</code> takes that entire output and feeds it directly into the next command, <code>grep</code>, as if you had typed it in yourself","<code>grep ^-</code> searches through those lines and keeps only the ones that start with a dash <code>-</code> — because in <code>ls -l</code> output, a leading <code>d</code> means directory, a leading <code>l</code> means symbolic link, and a leading <code>-</code> specifically means \"this is a regular file\""]}, {t:"text", html:"<p>So the whole pipeline answers a specific question: \"Show me only the actual files in this folder — skip the folders and shortcuts.\"</p>"}, {t:"text", html:"<p>You can even chain multiple pipes together (<code>cmd1 | cmd2 | cmd3</code>), passing data through several filtering steps in sequence — this is one of Linux's most powerful features, letting you build complex operations out of small, simple tools.</p>"}]
        },
        {
          id: "wc-word-count",
          title: "wc — Word Count",
          icon: "file",
          blocks: [{t:"text", html:"<p>### What it does</p>"}, {t:"text", html:"<p><code>wc</code> stands for word count, and despite the name, it actually counts three things at once: lines, words, and characters.</p>"}, {t:"code", code:"echo \"nti aiops\" | wc", lang:"bash"}, {t:"text", html:"<p>Here, <code>echo \"nti aiops\"</code> simply prints the text <code>nti aiops</code>, and that text is piped into <code>wc</code>, which analyzes it. The output has three numbers, always in this order:</p>"}, {t:"table", head:["Lines","Words","Characters"], rows:[["1","2","10"]]}, {t:"list", items:["1 line — because <code>echo</code> only produced one line of text","2 words — \"nti\" and \"aiops\" are two separate words","10 characters — counting every letter and the space between them"]}, {t:"text", html:"<p>### Getting just ONE of these numbers</p>"}, {t:"text", html:"<p>Often you don't need all three — just one specific count. You can add a flag to <code>wc</code> to isolate exactly what you want:</p>"}, {t:"code", code:"echo \"nti aiops\" | wc -w", lang:"bash"}, {t:"text", html:"<p>This returns only the word count (2), with nothing else cluttering the output.</p>"}, {t:"table", head:["Flag","Returns"], rows:[["wc -l","Line count only"],["wc -w","Word count only"],["wc -c","Character count only"]]}, {t:"text", html:"<p>### Combining wc with other commands</p>"}, {t:"code", code:"ls -R /etc | wc -l", lang:"bash"}, {t:"list", items:["<code>ls -R /etc</code> lists everything inside <code>/etc</code>, and the <code>-R</code> flag makes it recursive — meaning it doesn't just list the top-level folder, it digs into every subfolder inside it too, listing everything at every depth","Piping that into <code>wc -l</code> counts how many total lines were produced — effectively telling you how many files and folders exist inside <code>/etc</code> and all its subfolders combined"]}, {t:"text", html:"<p>This shows how small commands combine into powerful one-liners: instead of manually counting hundreds of files, one line does it instantly.</p>"}]
        },
        {
          id: "vim-vi-the-command-line-text-editor",
          title: "Vim / Vi — The Command-Line Text Editor",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### Why vim exists</p>"}, {t:"text", html:"<p>Most Linux servers don't have a graphical interface at all — no mouse, no windows, no Notepad-style app. So editing configuration files, scripts, or any text must happen entirely from the terminal. <code>vim</code> (an improved version of the older <code>vi</code>) is the most widely used tool for this.</p>"}, {t:"code", code:"vim myfile.txt", lang:"bash"}, {t:"list", items:["If <code>myfile.txt</code> doesn't exist yet, vim creates a brand-new empty file with that name and opens it, ready for you to start typing","If it already exists, vim opens it and displays its current content on screen, ready for editing"]}, {t:"text", html:"<p>### The core concept: Modes</p>"}, {t:"text", html:"<p>This is the single most important thing to understand about vim, and the thing that confuses almost every beginner: the same keyboard keys do completely different things depending on which \"mode\" vim is currently in. Vim is called a \"modal\" editor for exactly this reason.</p>"}, {t:"table", head:["Mode","What it's for","How you enter it"], rows:[["Normal mode","The default mode vim opens in. Used for moving around, deleting lines, copying text — but not for typing new text","Press Esc from any other mode"],["Insert mode","The mode where your keyboard behaves like a normal text editor — every key you press types a character","Press i while in Normal mode"],["Visual mode","Lets you highlight/select a block of text (like dragging with a mouse, but with the keyboard) — useful before copying or deleting a chunk at once","Press v while in Normal mode"],["Command mode","Used to save the file, quit, or run other special commands","Press : while in Normal mode"]]}, {t:"callout", kind:"tip", html:"The golden safety rule: if you're ever confused about what mode you're currently in, just press <code>Esc</code>. This always returns you to Normal mode no matter where you were — it's your \"reset button\" and there's no danger in pressing it too often."}, {t:"text", html:"<p>A typical beginner workflow looks like:</p>"}, {t:"list", items:["Open the file: <code>vim file.txt</code>","You start in Normal mode — press <code>i</code> to switch to Insert mode","Type your text normally","Press <code>Esc</code> to leave Insert mode and return to Normal mode","Press <code>:</code> to enter Command mode, then type a save/quit command"]}, {t:"diagram", kind:"links"}, {t:"text", html:"<p>### Saving and quitting (all typed after pressing <code>:</code>)</p>"}, {t:"table", head:["Command","What it does"], rows:[[":w","Write (save) your changes, but keep the file open for more editing"],[":wq","Write and quit — save your changes AND close vim in one step"],[":q!","Quit without saving — discard all changes you made since opening the file. Use this if you made a mistake and just want to bail out"],[":wq!","Force-save and quit, even if there's some restriction normally preventing it (e.g., a read-only warning you have permission to override)"],[":! command","Run any shell command from inside vim without fully leaving the editor. For example, :! date runs the date command, shows you its output, and then returns you right back to your file exactly where you left off"]]}]
        },
        {
          id: "bash-shell-variables",
          title: "Bash Shell Variables",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### What a variable is</p>"}, {t:"text", html:"<p>A variable is simply a name that holds a piece of data, so you (or the system) can reuse that data later without retyping it. This concept exists in virtually every programming and scripting language, and Bash (the shell/command interpreter) is no exception.</p>"}, {t:"text", html:"<p>### Bash itself</p>"}, {t:"text", html:"<p>Bash stands for \"Bourne Again SHell,\" and it is the default shell used in Red Hat Enterprise Linux — meaning it's the actual program running behind the scenes that reads every command you type, interprets it, and executes it. When you open a \"terminal,\" you're really talking directly to Bash.</p>"}, {t:"text", html:"<p>### Two categories of variables</p>"}, {t:"list", items:["Shell variables — these come built into Bash automatically and are used for configuration purposes. Examples include <code>$PATH</code> (a list of folders Bash searches through to find commands), <code>$HOME</code> (your home directory location), and <code>$USER</code> (your current username). You don't need to create these; they already exist the moment your shell starts.","User-defined variables — these are variables you create yourself to temporarily store any value you want during your session."]}, {t:"code", code:"x=5", lang:"bash"}, {t:"text", html:"<p>This creates a variable named <code>x</code> holding the value 5. Important: this variable is local to your current shell session only — if you open a new shell process from within this one (called a \"sub-shell\"), that sub-shell has no knowledge that <code>x</code> even exists.</p>"}, {t:"text", html:"<p>### export — sharing variables with sub-shells</p>"}, {t:"code", code:"export x", lang:"bash"}, {t:"text", html:"<p><code>export</code> marks a variable so that it becomes visible to any sub-shell you open afterward, with the exact same name and value. Without <code>export</code>, a variable stays trapped in your current shell only.</p>"}, {t:"text", html:"<p>Here's a way to test and truly understand this:</p>"}, {t:"code", code:"x=5 # create a plain variable\nbash # open a new sub-shell (a shell inside your shell)\necho $x # prints NOTHING — this sub-shell never inherited x\nexit # leave the sub-shell, back to the original\nexport x=5 # create AND export in one step\nbash # open a new sub-shell again\necho $x # prints 5 — this time it WAS inherited", lang:"bash"}, {t:"text", html:"<p>### set — viewing everything currently defined</p>"}, {t:"code", code:"set", lang:"bash"}, {t:"text", html:"<p>This displays a full listing of every currently defined variable in your shell session — both the built-in shell variables and any custom ones you've created. It's typically a long list, useful mainly when troubleshooting or exploring what's already set.</p>"}]
        },
        {
          id: "linux-user-types-by-uid",
          title: "Linux User Types (by UID)",
          icon: "cpu",
          blocks: [{t:"text", html:"<p>### What a UID is</p>"}, {t:"text", html:"<p>Every user account on a Linux system — human or automated — has a unique numeric identifier called a UID (User ID). Linux uses this number internally to track ownership of files, processes, and permissions; usernames are really just human-friendly labels attached to these numbers.</p>"}, {t:"text", html:"<p>### The three categories</p>"}, {t:"table", head:["Type","UID Range","What it means"], rows:[["Super user (root)","0","There is only ever one UID 0 account: root, the single all-powerful administrator with unrestricted access to the entire system"],["System user","1–200 (statically reserved by the OS itself, used for core system services) and 201–999 (dynamically assigned as software installs and creates its own service accounts)","These accounts exist to run background services/daemons — for example, the account that runs a web server or database process. They are not meant for humans to log into directly."],["Regular user","1000 and above","These are the normal, everyday human accounts — created by an administrator so real people can log in, have their own home folder, and do their own work"]]}, {t:"callout", kind:"info", html:"Understanding these ranges matters practically: if you ever list users on a system and see a UID under 1000, you immediately know \"this is a service account, not a person\" — which is important context when auditing security or troubleshooting."}]
        },
        {
          id: "switching-users-su",
          title: "Switching Users — su",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### <code>su - username</code> (with the dash)</p>"}, {t:"code", code:"su - omar", lang:"bash"}, {t:"text", html:"<p>This switches you to being the user <code>omar</code>. The dash (<code>-</code>) is crucial: it tells Linux to also load <code>omar</code>'s entire environment, exactly as if <code>omar</code> had logged in directly himself — his home directory becomes your working directory, his shell configuration and variables load, his PATH becomes active. It will also display when <code>omar</code> last logged in, similar to what you'd see on a real login screen.</p>"}, {t:"text", html:"<p>### <code>su username</code> (without the dash)</p>"}, {t:"code", code:"su omar", lang:"bash"}, {t:"text", html:"<p>This still switches you to being <code>omar</code>, but it's a lighter switch — you keep your own current environment and variables rather than fully adopting his, and you typically remain in whatever directory you were already in rather than jumping to his home folder.</p>"}, {t:"text", html:"<p>### Comparison</p>"}, {t:"table", head:["Behavior","su - username","su username"], rows:[["Environment loaded","Full environment, exactly as if that user logged in directly","Keeps your own current environment and variables"],["Working directory","Jumps to that user's home directory","Typically remains in whatever directory you were already in"],["Last login display","Shown, similar to a real login screen","Not part of this lighter switch"],["Best for","A true, full simulation of that user logging in (the safer, more predictable choice)","A quick, temporary permission switch without changing your whole environment"]]}]
        },
        {
          id: "visudo-safely-managing-sudo-permissions",
          title: "visudo — Safely Managing Sudo Permissions",
          icon: "file",
          blocks: [{t:"text", html:"<p>### The file behind sudo</p>"}, {t:"text", html:"<p>Every time someone runs a command with <code>sudo</code>, Linux checks a specific configuration file — <code>/etc/sudoers</code> — to decide whether that user is allowed to do that, and what exactly they're permitted to run (sometimes limited to specific commands, sometimes full access).</p>"}, {t:"text", html:"<p>### Why not just edit it with vim directly?</p>"}, {t:"text", html:"<p>You technically could open <code>/etc/sudoers</code> with <code>vim /etc/sudoers</code>, but this is considered dangerous, because a single typo in this file could silently break the entire permissions system — potentially locking every single administrator out of sudo access at once, with no easy way back in.</p>"}, {t:"code", code:"visudo", lang:"bash"}, {t:"callout", kind:"danger", html:"Editing <code>/etc/sudoers</code> directly with a regular editor is dangerous — a single typo can silently break the entire permissions system, potentially locking every administrator out of sudo access at once, with no easy way back in."}, {t:"text", html:"<p><code>visudo</code> solves this by opening the file in a protected editing session that automatically checks your syntax for errors the moment you try to save. If it detects a mistake, it stops you, shows a warning, and refuses to save the broken version — giving you the chance to fix it or discard your changes safely. This built-in safety check is the entire reason <code>visudo</code> exists as a dedicated command instead of people just using a regular text editor.</p>"}]
        }
        ]
      },
      tarek: {
        author: "Mohammed Tarek",
        subtitle: "Linux Fundamentals - Bash, Redirection, Vim, and Pipelines",
        avatar: "T",
        sections: [
        {
          id: "25-september-wednesday-vim-scripting-ext",
          title: "25 September (Wednesday) — Vim Scripting, External Commands, Shell Variables",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### Vim Script: Find and Replace</p>"}, {t:"code", code:":%s/login/nologin/g", lang:"bash"}, {t:"text", html:"<p><code>g</code> means Global (to replace the words).<br><em>(new name)</em></p>"}, {t:"text", html:"<p>### Execute External Command in Vim</p>"}, {t:"code", code:":.! date", lang:"bash"}, {t:"text", html:"<p><em>(خارج ولكن يعود للمكان مره ثانيه)</em></p>"}, {t:"code", code:":* Number ! Command", lang:"bash"}, {t:"text", html:"<p>Will appear in the number of line that matches that number.</p>"}, {t:"text", html:"<p>### Vim Options</p>"}, {t:"table", head:["Command","Description"], rows:[[":set number","Will index the lines"],[":set arabic","Will make in arabic way"],[":set noarabic","Turns off arabic mode"]]}, {t:"text", html:"<p>### Variables in Shell</p>"}, {t:"text", html:"<p>User-defined Variable / Shell Variable — that you created / that already exists in the system or the user created it.</p>"}, {t:"code", code:"X=15\necho $X", lang:"bash"}, {t:"text", html:"<p>### Mathematics in Shell</p>"}, {t:"code", code:"$[x+y]\necho $[x+y]", lang:"bash"}]
        },
        {
          id: "26-september-thursday-vim-search-and-edi",
          title: "26 September (Thursday) — Vim Search and Editing",
          icon: "search",
          blocks: [{t:"text", html:"<p>### Search Direction</p>"}, {t:"table", head:["Command","Description"], rows:[["?","Search from bottom"],["/","Search from above"],["ESC / exit","To get out of Mode"]]}, {t:"text", html:"<p>### Cursor Insertion & Movement</p>"}, {t:"table", head:["Command","Description"], rows:[["a","After Cursor"],["i","Before Cursor"],["o","New next line"],["Shift + A","End of line"],["Shift + I","Beginning of line"]]}, {t:"text", html:"<p>### Editing Operations</p>"}, {t:"text", html:"<p>Everything you write, the exit option applies.</p>"}, {t:"table", head:["Command","Description"], rows:[["dd","Only to remove"],["dd + p","Cut -> Copy"]]}, {t:"text", html:"<p>### Visual Modes</p>"}, {t:"table", head:["Command","Description"], rows:[["v","To get Visual Mode"],["Shift + V","Select the line"],["Ctrl + v","Select the block *(لعمود)*"]]}, {t:"text", html:"<p>### Saving & Exiting Vim</p>"}, {t:"table", head:["Command","Description"], rows:[[":w","Save and keep in file"],[":wq","Save and get out"],[":q!","Not save and quit"],[":q","He will ask you (if you have done save you will get out immediately)"]]}]
        },
        {
          id: "27-september-friday-dev-null-and-vi-vim-",
          title: "27 September (Friday) — /dev/null and Vi/Vim Modes",
          icon: "file",
          blocks: [{t:"text", html:"<p>### /dev/null in Linux</p>"}, {t:"text", html:"<p>A special virtual device file. Acts like a black hole for data. Any data will disappear.</p>"}, {t:"callout", kind:"info", html:"<code>/dev/null</code> is a special virtual device file that acts like a black hole for data — anything sent to it disappears."}, {t:"text", html:"<p>### Vi / Vim Modes</p>"}, {t:"code", code:"Vi / Vim <filename>", lang:"bash"}, {t:"text", html:"<p>To execute into the file.</p>"}, {t:"text", html:"<p>4 level modes:</p>"}, {t:"table", head:["Mode","Description"], rows:[["Default","Command Mode"],["Update","Insert Mode"],["Select","Visual Mode"],["Ex / Command Line Mode","—"]]}, {t:"text", html:"<p>After you end, to exit -> press <code>ESC</code>.</p>"}, {t:"text", html:"<p>Press <code>i</code> -> Go to Insert Mode.</p>"}, {t:"text", html:"<p>Save or Not save: <code>Shift + :</code></p>"}, {t:"text", html:"<p>### Vim Shortcuts</p>"}, {t:"table", head:["Command","Description"], rows:[["dd","Cut / Delete line"],["yy / gy","Copy"],["p","Paste"],["u","Undo"],["/","Search"]]}]
        },
        {
          id: "28-september-saturday-pipelines",
          title: "28 September (Saturday) — Pipelines",
          icon: "network",
          blocks: [{t:"code", code:"find / -name passwd 2> temp/temp-output", lang:"bash"}, {t:"text", html:"<p>### Pipelines</p>"}, {t:"text", html:"<p>Input -> Output -> Command engine in that output</p>"}, {t:"text", html:"<p>Pass process -> gives you total output (will use it).</p>"}, {t:"code", code:"Command | output -> Command -> output", lang:"bash"}, {t:"text", html:"<p>Real Example:</p>"}, {t:"code", code:"ls -l | grep ^-", lang:"bash"}, {t:"text", html:"<p>Give filter output.</p>"}, {t:"code", code:"echo \"nti aiops\" | wc", lang:"bash"}, {t:"text", html:"<p>Print / Counted 'Count' word.</p>"}, {t:"text", html:"<p>### wc Options</p>"}, {t:"table", head:["Command","Description"], rows:[["wc -l","Lines only"],["wc -w","Words only"],["wc -c","Character only"]]}, {t:"text", html:"<p>### Search Pattern</p>"}, {t:"text", html:"<p><code>\\<th</code> -> Any word having \"th\"</p>"}, {t:"text", html:"<p>delimiter</p>"}]
        },
        {
          id: "29-september-sunday-bash-find-and-standa",
          title: "29 September (Sunday) — Bash find and Standard Output/Error",
          icon: "file",
          blocks: [{t:"code", code:"find / -name <option>", lang:"bash"}, {t:"text", html:"<p><code>option</code> -> Command anything.</p>"}, {t:"text", html:"<p>Mean: search for entire system.<br><em>(أنت بتحدد عادي هنا المكان)</em></p>"}, {t:"callout", kind:"info", html:"You may have two std output and std Error. It will get only one of them unless you specify otherwise."}, {t:"text", html:"<p>Example:</p>"}, {t:"code", code:"find / -name passwd > output", lang:"bash"}, {t:"text", html:"<p>Also has Error but it only gets the output.</p>"}, {t:"text", html:"<p><code>2></code> -> If you want to get the Error.</p>"}]
        },
        {
          id: "30-september-monday-redirection-and-manu",
          title: "30 September (Monday) — Redirection and Manual Pages",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### Redirection</p>"}, {t:"text", html:"<p>Redirection -> to change info to another page.</p>"}, {t:"table", head:["Stream","File Descriptor"], rows:[["std input","FD0"],["std output","FD1"],["std Error","FD2"]]}, {t:"text", html:"<p>Any Command / Any Program / Standard STDs.</p>"}, {t:"text", html:"<p>Values not be typed.</p>"}, {t:"text", html:"<p>The next or another file doesn't know what you give Std to make it understand.</p>"}, {t:"code", code:"ls -l > /temp/temp-output", lang:"bash"}, {t:"text", html:"<p>Also makes override.</p>"}, {t:"text", html:"<p>To append: <code>>></code></p>"}, {t:"text", html:"<p><code>1></code> -> Will not center / output redirect.</p>"}, {t:"code", code:"anything > temp-erro-output", lang:"bash"}, {t:"text", html:"<p>Error here: <code>2></code></p>"}, {t:"text", html:"<p>It will understand that is error.</p>"}, {t:"callout", kind:"warning", html:"<code>></code> overrides the target file's contents. Use <code>>></code> to append instead of overwriting."}, {t:"text", html:"<p>### Manual Pages & Vim Navigation</p>"}, {t:"text", html:"<p><code>/etc</code> -> Have all Configuration file in system.</p>"}, {t:"text", html:"<p>4 Command to get to home (?)</p>"}, {t:"text", html:"<p>### Manual Page Sections</p>"}, {t:"table", head:["Section","Description"], rows:[["1","User Command (regular page)"],["5","Configuration files"],["8","System Administrator commands"]]}, {t:"code", code:"whereis Command", lang:"bash"}, {t:"text", html:"<p>Gives you where the Command is on pages.</p>"}, {t:"text", html:"<p>### Vim / Navigation Shortcuts</p>"}, {t:"table", head:["Command","Description"], rows:[["Shift + G","To get the last of file"],["g (small g)","To get the first of file"],["Shift + N","Will search for same word (previous match)"],["/ <word>","Search for word"],["Q","To quit"]]}, {t:"code", code:"man passwd\nman 5 passwd", lang:"bash"}]
        },
        {
          id: "1-october-tuesday-manual-page-lookups",
          title: "1 October (Tuesday) — Manual Page Lookups",
          icon: "eye",
          blocks: [{t:"text", html:"<p>Manual page needed to update: <code>mandb</code></p>"}, {t:"text", html:"<p>What is <code>man passwd</code> ~ Word</p>"}, {t:"code", code:"man -k passwd", lang:"bash"}, {t:"text", html:"<p><code>man -w passwd</code> = Where is to all page. First one <em>(كلمتين)</em>.</p>"}, {t:"text", html:"<p>Get the first location (if it not press Q) and it asks you if you want to see the next page -> press Enter.</p>"}, {t:"text", html:"<p>What if the change in file name? It will not get it.</p>"}, {t:"text", html:"<p>It also returns Path.</p>"}, {t:"text", html:"<p>نمشي بالترتيب</p>"}, {t:"text", html:"<p>Page 1</p>"}, {t:"code", code:"Command --help", lang:"bash"}, {t:"text", html:"<p>Return option only.</p>"}, {t:"text", html:"<p>But if you want description:</p>"}, {t:"text", html:"<p><code>man</code> -> It's like documentation.</p>"}]
        }
        ]
      }
    },
    labs: {
      day1: {
        title: "Lab 1 — Get Started with RHEL & Files",
        subtitle: "Practical exercises for Day 1 — navigation, file ops, links, and text processing.",
        tasks: [
      { id:"less-vs-more-0", tag:"`less` vs `more`", title:"`less` vs `more`", objective:"Both commands display text one screen at a time, but less provides more flexible navigation.", steps:["more /etc/passwd","less /etc/passwd"]},
      { id:"cat-vs-more-1", tag:"`cat` vs `more`", title:"`cat` vs `more`", objective:"cat normally prints the entire file directly to standard output, while more pauses after each screen.", steps:["cat /etc/passwd","more /etc/passwd"]},
      { id:"rm-vs-rmdir-2", tag:"`rm` vs `rmdir`", title:"`rm` vs `rmdir`", objective:"The manual pages show that the commands have different purposes:", steps:["man rm","man rmdir","rm removes files and can remove directories when used with the appropriate recursive option.","rmdir removes empty directories.","rmdir is therefore more restrictive than rm.","rm file1","rmdir dir1","rm -r dir1"]},
      { id:"create-and-manipulat-3", tag:"Create and manipulat", title:"Create and manipulate the hierarchy", objective:"The intended hierarchy can be created under the home directory with:", steps:["~/dir1/","├── docs/","│   ├── dir11/","│   └── dir12/","└── mycv","cd ~","mkdir -p dir1/docs/dir11 dir1/docs/dir12","touch dir1/mycv"]},
      { id:"copy-etc-passwd-to-t-4", tag:"Copy `/etc/passwd` t", title:"Copy `/etc/passwd` to the home directory as `mypasswd`", objective:"Verify:", steps:["cp /etc/passwd ~/mypasswd","ls -l ~/mypasswd"]},
      { id:"rename-mypasswd-to-o-5", tag:"Rename `mypasswd` to", title:"Rename `mypasswd` to `oldpasswd`", objective:"Use mv:", steps:["mv ~/mypasswd ~/oldpasswd","ls -l ~/oldpasswd"]},
      { id:"four-ways-to-go-from-6", tag:"Four ways to go from", title:"Four ways to go from `/usr/bin` to the home directory", objective:"Assuming the home directory is /home/user:", steps:["cd","cd ~","cd \"$HOME\"","cd /home/user"]},
      { id:"list-commands-in-usr-7", tag:"List commands in `/u", title:"List commands in `/usr/bin` beginning with `w`", objective:"For a cleaner command-only list:", steps:["ls /usr/bin/w*","find /usr/bin -maxdepth 1 -type f -name 'w*' -printf '%f\\n'"]},
      { id:"display-the-first-4--8", tag:"Display the first 4 ", title:"Display the first 4 lines of `/etc/passwd`", objective:"Equivalent short form:", steps:["head -n 4 /etc/passwd","head -4 /etc/passwd"]},
      { id:"display-the-last-7-l-9", tag:"Display the last 7 l", title:"Display the last 7 lines of `/etc/passwd`", objective:"Equivalent short form:", steps:["tail -n 7 /etc/passwd","tail -7 /etc/passwd"]}
        ]
      },
      day2: {
        title: "Lab 2 — Help, Text Files & Users",
        subtitle: "Practical exercises for Day 2 — man pages, Vim, redirection, and user management.",
        tasks: [
      { id:"display-the-passwd-c-0", tag:"Display the `passwd`", title:"Display the `passwd` command and file manual pages sequentially", objective:"The passwd command has a section 1 manual entry, while the /etc/passwd file is documented in section 5.", steps:["man passwd","man 5 passwd","man passwd; man 5 passwd"]},
      { id:"display-the-manual-p-1", tag:"Display the manual p", title:"Display the manual page for the `passwd` file", objective:"The password database format is documented in section 5:", steps:["man 5 passwd"]},
      { id:"find-commands-whose--2", tag:"Find commands whose ", title:"Find commands whose manual pages contain `passwd`", objective:"Use man -k, which searches manual-page descriptions and keywords:", steps:["man -k passwd","apropos passwd"]},
      { id:"create-a-user-accoun-3", tag:"Create a user accoun", title:"Create a user account", objective:"The requested account is:", steps:["Username: Islam","Password: Islam","sudo useradd -m Islam","sudo passwd Islam","Islam","id Islam"]},
      { id:"search-manual-pages--4", tag:"Search manual pages ", title:"Search manual pages mentioning `password`", objective:"Use:", steps:["man -k password"]},
      { id:"create-notes-txt-usi-5", tag:"Create `notes.txt` u", title:"Create `notes.txt` using Vim", objective:"Open the file:", steps:["vim ~/notes.txt","Press i to enter Insert mode.","Type your full name.","Press Esc to return to Command mode.","Type:",":wq","Press Enter."]},
      { id:"display-notes-txt-6", tag:"Display `notes.txt`", title:"Display `notes.txt`", objective:"Use:", steps:["cat ~/notes.txt"]},
      { id:"append-aiops-without-7", tag:"Append `AIOPS` witho", title:"Append `AIOPS` without opening an editor", objective:"Use echo with the append operator:", steps:["echo \"AIOPS\" >> ~/notes.txt","cat ~/notes.txt","> overwrites the file.",">> appends to the existing content."]},
      { id:"redirect-ls-l-etc-in-8", tag:"Redirect `ls -l /etc", title:"Redirect `ls -l /etc` into `etc_listing.txt`", objective:"Run:", steps:["ls -l /etc > ~/etc_listing.txt","ls -l ~/etc_listing.txt","cat ~/etc_listing.txt","ls -l /etc","│","▼","etc_listing.txt"]},
      { id:"safely-inspect-which-9", tag:"Safely inspect which", title:"Safely inspect which users have sudo privileges", objective:"The lab asks you to determine which user is configured to run commands through sudo.", steps:["sudo visudo -c","sudo grep -vE '^[[:space:]]*(#|$)' /etc/sudoers","sudo grep -R -vE '^[[:space:]]*(#|$)' /etc/sudoers.d/","%sudo ALL=(ALL:ALL) ALL","groups","sudo -l -U username"]},
      { id:"switch-to-root-with--10", tag:"Switch to root with ", title:"Switch to root with `su -`", objective:"Run:", steps:["su -","whoami","root","exit","whoami"]},
      { id:"create-steps-txt-in--11", tag:"Create `steps.txt` i", title:"Create `steps.txt` in Vim and save without exiting", objective:"Open the file:", steps:["vim ~/steps.txt","i","Welcome to AIOPS Training","This course covers Vim","Esc",":w"]},
      { id:"search-for-the-vim-l-12", tag:"Search for the Vim l", title:"Search for the Vim line and replace `raining` with `Course`", objective:"The lab wording appears to contain a typo:", steps:["search for Vim return raining","This course covers Vim",":%s/raining/Course/g",":%s/Vim/Course/g","/raining"]},
      { id:"copy-the-current-lin-13", tag:"Copy the current lin", title:"Copy the current line, paste it below, then save and exit", objective:"In Vim Command mode:", steps:["yy","p",":wq","Esc → yy → p → :wq → Enter","Manual pages are divided into sections, and man 5 passwd refers to the passwd file format, not the passwd command.","man -k searches the manual database by keyword.",">> appends data, while > redirects output and overwrites the destination file.","Vim separates Insert mode from Command mode."]}
        ]
      }
    },
    flashcards: [
    {q:"What's the key difference between monolithic and microservices architecture when one service fails?", a:"In a monolithic architecture, if one service fails, all services go down. In microservices, if one service goes down, the rest of the services remain up."},
    {q:"What role does a Load Balancer play, and what does RabbitMQ do?", a:"A Load Balancer balances traffic across services, while RabbitMQ acts as a queue for services."},
    {q:"Why would you activate Swap (Virtual Memory), and give an example?", a:"To avoid system crashes — for example, activating Swap when uploading on AWS."},
    {q:"What's the core difference between Linux and Unix in terms of source model?", a:"Linux is open source — customizable (including UI), no license, open to the public, and free (though some editions are licensed with nuances). Unix is closed source — private to its developers and not customizable."},
    {q:"Who is the GPL (General Public License) associated with?", a:"Richard Stallman."},
    {q:"What network type should you choose when setting up VMware, per these notes?", a:"NAT."},
    {q:"What does `ifconfig` do, and is it needed on Ubuntu?", a:"It returns the IP address; this step can be skipped for Ubuntu."},
    {q:"What is the correct way to combine CLI options, and which format is incorrect?", a:"`-l -d` and `-ld` are both correct ways to combine options; `-l d` is incorrect."},
    {q:"What do `Ctrl+U` and `Ctrl+K` do in the terminal?", a:"`Ctrl+U` deletes the part of the command before the cursor; `Ctrl+K` deletes the part of the command after the cursor."},
    {q:"What do `!500` and `!!` do in shell history?", a:"`!500` runs command number 500 from history; `!!` runs the last command in history."},
    {q:"What's the difference between `/bin` and `/sbin` per these notes?", a:"`/bin` is regular user data related (\"shortcut\"/\"symbolic link\"), while `/sbin` is super user data related (\"shortcut\"/\"soft link\")."},
    {q:"How often do `/tmp` and `/var/tmp` clear, and what do they have in common?", a:"`/tmp` clears every 10 days, and `/var/tmp` clears every 30 days; both are caches."},
    {q:"What does `~` refer to in the shell prompt, for a regular user vs. root?", a:"`~` refers to the home directory — `/home/regularuser` for a regular user, and `/root` for the root user."},
    {q:"What's the difference between `cd -` and `cd ..`?", a:"`cd -` moves one step backwards to the previous directory; `cd ..` moves up one level in the directory tree (relative path)."},
    {q:"What does `ls -lthr` do?", a:"Produces a long-format, human-readable listing sorted by time, in reversed order."},
    {q:"What's the difference between `rm -r dir1` and `rm -fr dir1`?", a:"`rm -r dir1` removes a directory recursively but asks to verify first; `rm -fr dir1` removes it recursively without asking for confirmation."},
    {q:"What's the difference between `cat` and `less` for viewing file content?", a:"`cat` lists the full content of the file at once, while `less` is more organized and allows scrolling, using `Space` to move to the next page."},
    {q:"What's the difference between a soft link and a hard link in terms of inode and size?", a:"A soft link has a different inode from the source and is just a pointer, so its size is unrelated to the original file's size. A hard link shares the same inode as the source, and its file size matches the source file's size."},
    {q:"What does `ls -i` show?", a:"It displays the inode numbers of files."},
    {q:"What does `grep -l Karim /etc/passwd` return if \"Karim\" is not found in the file?", a:"It returns nothing (no output), since `-l` only returns the file path when a match is found."},
    {q:"What does the pattern `grep ^c..t$ /etc/passwd` match?", a:"Lines that start with 'c' and end with 't', with exactly 2 letters in between."},
    {q:"What's the difference between an absolute path and a relative path?", a:"An absolute path is defined from the root directory `/` (e.g., `/usr/share/doc/`), while a relative path is defined relative to the current directory (e.g., `..`, `doc/`)."},
    {q:"What's the difference between `~` and `/home/`?", a:"`~` represents the home directory of the currently logged-in user (e.g., `/home/omar` or `/root`), while `/home/` is the base directory housing all individual user home folders."},
    {q:"What does `cd -` do?", a:"Switches back to the previous working directory."},
    {q:"How do you identify a directory, a regular file, and a symbolic link in `ls -l` output?", a:"`d` marks a directory, `-` marks a regular file, and `l` marks a symbolic link."},
    {q:"What does `ls -li` show that plain `ls -l` doesn't?", a:"It additionally displays the inode numbers of the files."},
    {q:"What does `mkdir -p dir1/dir2/dir3` do differently from plain `mkdir`?", a:"The `-p` (parent) flag creates the full nested directory structure recursively, creating any missing parent directories along the way."},
    {q:"What's the difference between `cp -r /etc/ /home/` and `cp -r /etc/* /home/`?", a:"`cp -r /etc/ /home/` copies the `/etc/` directory itself (with its contents) into `/home/`, while `cp -r /etc/* /home/` copies only the contents inside `/etc/` into `/home/`."},
    {q:"What is the danger of running `rm -rf /`?", a:"It forcefully and recursively deletes the entire system, and this action is irreversible."},
    {q:"What does `alias rm='rm -i'` do, and why does root use it by default?", a:"It makes `rm` prompt for confirmation before deleting each file. The root user defaults to this for safety, since root has permission to delete anything without restriction."},
    {q:"What is an inode?", a:"An index node storing metadata about a file, such as file size, permissions, owner, timestamps, and block pointers, stored in the Inode Table."},
    {q:"What's the difference between a hard link and a soft link if the source file is deleted?", a:"A hard link still works because it points to the same inode as the source file, so the data remains accessible. A soft link breaks because it only points to the target filename/path, producing an error when accessed."},
    {q:"Can hard links be created for directories or across different filesystems?", a:"No — hard links cannot link directories and cannot be created across different filesystems/partitions. Soft links support both."},
    {q:"What does `grep -v nologin /etc/passwd` do?", a:"Prints only the lines that do NOT contain \"nologin\" (inverted match)."},
    {q:"What's the difference between `grep -A 2` and `grep -B 2`?", a:"`-A 2` shows the matching line plus 2 lines after it; `-B 2` shows the matching line plus 2 lines before it."},
    {q:"What does `grep -w shut /etc/passwd` match that plain `grep shut` would not?", a:"It matches only the whole word `shut`, not `shut` as a substring inside a longer word."},
    {q:"What does `grep -e omar -e root /etc/passwd` do?", a:"Searches for multiple patterns simultaneously — lines containing `omar` OR `root`."},
    {q:"What does the regex `grep '^c[aou]t$' /usr/share/dict/words` match?", a:"Exact 3-letter words starting with `c`, followed by `a`, `o`, or `u`, and ending with `t` — e.g. `cat`, `cot`, `cut`."},
    {q:"What does `cut -d : -f 1,7 /etc/passwd` extract?", a:"Using `:` as the delimiter, it extracts fields 1 and 7 from each line — the username and the login shell."},
    {q:"What's the difference between `cut -c 1-5` and `cut -c 5-`?", a:"`cut -c 1-5` extracts characters from position 1 to 5, while `cut -c 5-` extracts characters from position 5 to the end of the line."},
    {q:"What are the three checked advantages of Linux over Windows in this sheet?", a:"Security, Stability, and Maintenance (Linux also runs on different hardware, is free & open source, easy to customize, has community support, and offers a different UI experience)."},
    {q:"What are the roles of the Kernel and the Shell in Linux architecture?", a:"The Kernel works directly with the hardware, while the Shell is the interface for interacting with the system through commands."},
    {q:"What is Swap used for?", a:"It uses part of the storage as additional memory when needed."},
    {q:"What do the `$` and `#` prompt symbols indicate?", a:"`$` indicates a regular user, and `#` indicates a superuser."},
    {q:"What is the basic command syntax in Linux, and can options be combined?", a:"`command option argument`, with spaces required between each part. Options can be combined, e.g. `ls -ld` is equivalent to `ls -l -d`."},
    {q:"What's the difference between `cd`, `cd ~`, `cd $HOME`, and `cd -`?", a:"`cd`, `cd ~`, and `cd $HOME` all go to the home directory; `cd -` goes back to the previous directory."},
    {q:"What does `ls -ltr` do compared to `ls -lt`?", a:"`ls -lt` sorts by time; `ls -ltr` sorts by time in reverse order."},
    {q:"How are hidden files identified in Linux?", a:"Files and directories starting with `.` are hidden."},
    {q:"What does the wildcard pattern `[!a-c]*` match?", a:"Files that do not start with `a`, `b`, or `c`."},
    {q:"What's the difference between `head -n N file` and `tail -n N file`?", a:"`head -n N file` shows the first N lines of a file, while `tail -n N file` shows the last N lines."},
    {q:"What do the `-r`/`-R` and `-f` options mean when used with commands like `cp` or `rm`?", a:"`-r`/`-R` means recursive (applies to directories and their contents), and `-f` means force (skips confirmation)."},
    {q:"What does `grep -B 2 hager dir` do?", a:"Shows the match for \"hager\" along with the 2 lines before each match."},
    {q:"What's the difference between `grep -i` and `grep -l`?", a:"`grep -i` makes the search case-insensitive; `grep -l` shows only the names of files containing the pattern, not the matching lines."},
    {q:"What is an inode, and how does it relate to hard links?", a:"An inode is allocated to every file or directory to store its metadata/data location. A hard link refers to the same inode as the original file — they share the same data."},
    {q:"Can a hard link point to a directory?", a:"No, a hard link cannot link directories."},
    {q:"When does the data of a hard-linked file actually get deleted?", a:"The data remains as long as at least one hard link to it still exists."},
    {q:"What does a soft link point to, as opposed to a hard link?", a:"A soft link points to a path, whereas a hard link points to the same inode/data as the original."},
    {q:"Is `/root` the same as `/home/root`?", a:"No — `/root` is the home directory of the superuser, and it is explicitly not the same as `/home/root`."},
    {q:"What is the purpose of `/etc` and `/var`?", a:"`/etc` holds configuration files; `/var` holds variable data, such as `/var/tmp`."},
    {q:"What do `Ctrl+K` and `Ctrl+U` do in the terminal?", a:"`Ctrl+K` cuts from the cursor to the end of the line; `Ctrl+U` cuts from the cursor to the beginning of the line."},
    {q:"Why do man pages have numbered sections, and what do sections 1, 5, and 8 document?", a:"Because some words (like \"passwd\") refer to more than one thing. Section 1 documents executable programs/user commands, section 5 documents file formats and configuration file structure, and section 8 documents system administration commands (root-level)."},
    {q:"What does `man passwd` show by default if you don't specify a section number?", a:"It shows the lowest-numbered match it finds, usually the command page (section 1)."},
    {q:"What's the difference between `man`, `whatis`, and `command --help`?", a:"`man command` gives full details, `whatis command` gives a one-line description, and `command --help` prints a condensed list of that command's available options."},
    {q:"What does `man -k \"keyword\"` do, and what does it rely on behind the scenes?", a:"It searches the short description line of every installed man page for the keyword and lists matching commands. It relies on the `mandb` search database, which may need to be built with `mandb` on a fresh system."},
    {q:"What does `whereis useradd` tell you?", a:"Whether the command exists on the machine and where its files are stored (binary, man page, and sometimes source files)."},
    {q:"What are the three data channels (streams) every Linux command is connected to, and their File Descriptor numbers?", a:"Standard Input (stdin, FD 0), Standard Output (stdout, FD 1), and Standard Error (stderr, FD 2)."},
    {q:"What's the difference between `>` and `>>`?", a:"`>` overwrites the target file's contents completely with no warning; `>>` appends new output to the end of the file without touching existing content."},
    {q:"What does `find / -name passwd 2> /dev/null` do?", a:"It searches the entire filesystem for \"passwd\" and discards only the error messages (like \"Permission denied\") by sending them to `/dev/null`, while successful results still print normally to the screen."},
    {q:"What's the difference between `&>` and `2>&1`?", a:"`&>` is a modern shorthand that sends both stdout and stderr into one file in a single symbol. `2>&1` is the traditional method that must come after a `>` redirection and works by pointing stderr (Channel 2) to wherever stdout (Channel 1) is already going."},
    {q:"What does the pipeline `ls -l | grep ^-` do?", a:"It lists files in long format, then filters to show only lines starting with `-`, which represents regular files (as opposed to `d` for directories or `l` for symbolic links)."},
    {q:"What three things does `wc` count, and in what order does it print them?", a:"Lines, words, and characters, always in that order."},
    {q:"What does `ls -R /etc | wc -l` tell you?", a:"The total number of files and folders inside `/etc` and all its subfolders combined, since `-R` makes the listing recursive and `wc -l` counts the resulting lines."},
    {q:"What are the four main modes in vim, and how do you enter each?", a:"Normal mode (default, entered by pressing `Esc`), Insert mode (press `i` from Normal mode), Visual mode (press `v` from Normal mode), and Command mode (press `:` from Normal mode)."},
    {q:"What's the difference between `:wq` and `:q!` in vim?", a:"`:wq` saves your changes and quits; `:q!` quits without saving, discarding all changes made since opening the file."},
    {q:"What's the difference between a shell variable and a user-defined variable in Bash?", a:"Shell variables (like `$PATH`, `$HOME`, `$USER`) are built into Bash automatically for configuration purposes. User-defined variables are ones you create yourself to temporarily store values during your session."},
    {q:"What does `export` do to a variable, and what happens without it?", a:"`export` makes a variable visible to any sub-shell opened afterward, with the same name and value. Without `export`, the variable stays trapped only in the current shell and sub-shells have no knowledge of it."},
    {q:"What are the three UID categories in Linux, and their ranges?", a:"Super user (root) is UID 0; system users are UID 1–999 (1–200 statically reserved, 201–999 dynamically assigned); regular users are UID 1000 and above."},
    {q:"What's the difference between `su - username` and `su username`?", a:"`su - username` fully loads that user's environment as if they logged in directly (home directory, shell config, PATH, last-login display). `su username` is a lighter switch that keeps your own current environment and directory."},
    {q:"Why should you use `visudo` instead of editing `/etc/sudoers` directly with vim?", a:"`visudo` opens the file in a protected session that checks syntax for errors before saving, refusing to save a broken version. Editing directly with vim risks a typo silently breaking the entire permissions system and locking out all administrators."},
    {q:"What does `find / -name <option>` do?", a:"Searches the entire system starting from root for files matching the given name."},
    {q:"What's the difference between FD1 and FD2?", a:"FD1 is standard output (std output), and FD2 is standard error (std Error)."},
    {q:"How do you redirect only the error output of a command, and how do you get both output and error separately?", a:"Use `2>` to redirect only the error stream; without specifying, a command's normal output goes to std output and only one stream is captured unless you redirect explicitly (e.g. `2>` for errors)."},
    {q:"What's the difference between `>` and `>>`?", a:"`>` overrides the destination file's contents, while `>>` appends to it instead of overwriting."},
    {q:"What is `/dev/null`?", a:"A special virtual device file that acts like a black hole for data — anything written to it disappears."},
    {q:"What are the main manual page sections mentioned?", a:"Section 1 is User Commands (regular page), Section 5 is Configuration files, and Section 8 is System Administrator commands."},
    {q:"What's the difference between `man -k passwd` and `man -w passwd`?", a:"`man -k passwd` searches man page descriptions for \"passwd\" as a keyword, while `man -w passwd` shows the location/path of the passwd man page."},
    {q:"What does `Command --help` return compared to `man Command`?", a:"`--help` returns only the options for the command, while `man` acts as full documentation/description."},
    {q:"What are the four Vim modes?", a:"Command Mode (default), Insert Mode (update), Visual Mode (select), and Ex/Command Line Mode."},
    {q:"How do you enter Insert Mode in Vim, and how do you exit any mode?", a:"Press `i` to enter Insert Mode; press `ESC` to exit back to Command Mode."},
    {q:"What's the difference between `:w`, `:wq`, `:q!`, and `:q`?", a:"`:w` saves and keeps the file open, `:wq` saves and quits, `:q!` quits without saving, and `:q` quits only if there are no unsaved changes (otherwise it prompts)."},
    {q:"What do `dd`, `yy`/`gy`, `p`, and `u` do in Vim?", a:"`dd` cuts/deletes a line, `yy` or `gy` copies a line, `p` pastes, and `u` undoes the last action."},
    {q:"What's the difference between `v`, `Shift+V`, and `Ctrl+v` in Vim's visual modes?", a:"`v` enters character-wise Visual Mode, `Shift+V` selects entire lines, and `Ctrl+v` selects a block/column *(لعمود)*."},
    {q:"What does the Vim command `:%s/login/nologin/g` do?", a:"It performs a global find-and-replace across the file, replacing every occurrence of \"login\" with \"nologin\"."},
    {q:"What does `:.! date` do in Vim?", a:"It runs the external `date` command and inserts its output, then returns to the same place in the file *(خارج ولكن يعود للمكان مره ثانيه)*."},
    {q:"What is a pipeline in Bash, and what does `ls -l | grep ^-` do?", a:"A pipeline passes the output of one command as input to another command. `ls -l | grep ^-` filters the long listing to show only regular files (lines starting with `-`)."},
    {q:"What do `wc -l`, `wc -w`, and `wc -c` count?", a:"`wc -l` counts lines only, `wc -w` counts words only, and `wc -c` counts characters only."},
    {q:"What does the search pattern `\\<th` match?", a:"Any word containing \"th\" (word-boundary search for \"th\")."},
    {q:"What does `whereis Command` do?", a:"Shows where a command's binary, source, and man page files are located."}
    ]
  },
  notes: {
    rahma: {
      author: "Rahma",
      day: 1,
      subtitle: "Linux Administration & Fundamentals",
      avatar: "R",
      sections: [
        {
          id: "system-architecture-concepts",
          title: "System Architecture & Concepts",
          icon: "cpu",
          blocks: [{t:"list", items:["<strong>Monolithic vs Microservices</strong>: If one service fails in a monolithic architecture, all services are down. In microservices, if one service goes down, the rest of the services remain up.","<strong>Load Balancer</strong>: Works on balancing traffic across the services.","<strong>RabbitMQ</strong>: Acts as a queue for services.","<strong>Virtual Memory (Swap)</strong>: Avoids system crashes. Example: Activate Swap when uploading on AWS."]}, {t:"text", html:"<p>### Linux vs Unix</p>"}, {t:"table", head:["Aspect","Linux (Open Source)","Unix (Closed Source)"], rows:[["Origin","Came after Unix; contains around 400 distributions","Came first"],["Customization","Customized (including UI)","Couldn't be customized"],["License","No license, open for everybody (public), and free (some are licensed but with nuances)","Private for the developers"],["Example","—","Unix is an example of a closed-source system"]]}, {t:"list", items:["<strong>Enterprise Revenue</strong>: Money comes from certifications and subscription fees for enterprise editions."]}, {t:"text", html:"<p>### Distributions Comparison</p>"}, {t:"list", items:["Differences between Fedora vs RedHat: Number of versions and releases from each version.","Ubuntu vs RedHat: You can use Ubuntu on VMware; the difference is mainly in the packages, but the command lines are the same.","CentOS: Noted for having \"no security\" (EOL)."]}, {t:"list", items:["<strong>GPL (General Public License)</strong>: Associated with Richard Stallman."]}]
        },
        {
          id: "virtual-machine-network-setup",
          title: "Virtual Machine & Network Setup",
          icon: "network",
          blocks: [{t:"list", items:["<strong>Creating a VM</strong>: <code>File</code> -> <code>New VM</code> -> <code>Installing Redhat on VMware</code> (Recommended: 2 processors, 2 cores).","<strong>Network Types</strong>: Bridged, NAT, Host-only (chosen according to the IP range).","Choose <strong>NAT</strong> when setting up VMware.","<strong>Redhat Developer Account</strong>: You can use developer account credentials to log in to a Redhat server with a GUI on VMware."]}, {t:"text", html:"<p>### Getting IP & SSH</p>"}, {t:"code", code:"ifconfig", lang:"bash"}, {t:"text", html:"<p>Returns the IP address (Skip this step for Ubuntu).</p>"}, {t:"code", code:"ssh root@ipaddress", lang:"bash"}, {t:"text", html:"<p>Connects to the server.</p>"}]
        },
        {
          id: "shell-prompt-basic-cli-syntax",
          title: "Shell Prompt & Basic CLI Syntax",
          icon: "eye",
          blocks: [{t:"list", items:["<strong>Default Shell in Redhat</strong>: Bash","<strong>CLI (Command Line Interface)</strong> syntax: <code>Command [Option] [Argument]</code>","Dash <code>[option]</code> has \"no spaces\" (e.g., <code>-V</code>).","You must have a space after the <code>[command]</code>.","There could be no <code>[argument]</code> in CLI (used for modification/determining action)."]}, {t:"text", html:"<p>### Combining Options</p>"}, {t:"text", html:"<p>Options can be combined.</p>"}, {t:"list", items:["Example: <code>-l -d</code> (Correct), <code>-ld</code> (Correct), <code>-l d</code> (Incorrect)."]}, {t:"text", html:"<p>### Terminal Shortcuts</p>"}, {t:"table", head:["Shortcut","Description"], rows:[["Win + ↑","Maximize terminal"],["Ctrl + U","Delete all the part of the command before the cursor"],["Ctrl + K","Delete all the part of the command after the cursor"],["cd [tab][tab]","Displays all files with the same initial"],["cd [tab]","Auto-completes file name initial"]]}, {t:"text", html:"<p>### History Commands</p>"}, {t:"table", head:["Command","Description"], rows:[["!500","Runs command number 500 in history"],["!!","Runs the last command in history"]]}, {t:"text", html:"<p>### Switching Users</p>"}, {t:"code", code:"su - username", lang:"bash"}, {t:"text", html:"<p>Switches user (prompts for password).</p>"}]
        },
        {
          id: "file-system-hierarchy",
          title: "File System Hierarchy",
          icon: "folder",
          blocks: [{t:"table", head:["Directory","Description"], rows:[["/","Root file system (like Local Disk C). Contains everything underneath it *(تحته)*"],["root","System user (Admin). /root contains the Super user profile"],["home","Contains any regular user profile"],["bin","Regular user data related (\"shortcut\" / \"symbolic link\")"],["sbin","Super user data related (\"shortcut\" / \"soft link\")"],["boot","Booting OS files"],["etc","All config files"],["dev","All hardware components"],["run","Any files related to services (\"not shortcut\", \"different\")"],["var","Any variable in the system. Contains a tmp that clears every 30 days"],["tmp","Temporary files (clears every 10 days). Both tmp and /var/tmp are caches"],["usr","The original system directory *(الأصلي)*"]]}]
        },
        {
          id: "file-directory-management",
          title: "File & Directory Management",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Navigation (<code>cd</code>, <code>pwd</code>)</p>"}, {t:"list", items:["<strong>Shell prompt</strong>: <code>[root@server ~]</code> -> <code>~</code> refers to the home directory.","For regular users: <code>/home/regularuser</code>","For root: <code>/root</code>"]}, {t:"table", head:["Command","Description"], rows:[["cd ~ / cd","Return to the home directory (whether regular or superuser)"],["cd -","One step backwards (previous directory)"],["cd ..","Move up one level (relative path)"]]}, {t:"list", items:["<strong>Absolute path</strong>: The entire path.","<strong>Relative path</strong>: Not the entire path."]}, {t:"text", html:"<p>### Listing (<code>ls</code>, <code>tree</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["ls","List files in the directory"],["ls -a","List all files, whether hidden or non-hidden (Hidden files start with a dot)"],["ls -l","Long list"],["ls -r","Reversed list"],["ls -h","Converts bits to bytes (human-readable)"],["ls -lthr","Long list, human-readable, sorted by time, reversed"],["ls -lR","Recursive list (lists all the content of the directory, whether files or directories)"],["tree","Shows directory structure visually"]]}, {t:"text", html:"<p>### File Creation, Copying & Moving</p>"}, {t:"code", code:"mkdir dir1", lang:"bash"}, {t:"text", html:"<p>Make directory.</p>"}, {t:"code", code:"mkdir -p", lang:"bash"}, {t:"text", html:"<p>Make parent directories (e.g., <code>mkdir -p \"Rahma Tarek\"</code> vs <code>mkdir \"Roaa Tarek\"</code> vs <code>mkdir Ayah Tarek</code>).</p>"}, {t:"code", code:"touch file1", lang:"bash"}, {t:"text", html:"<p>Create an empty file.</p>"}, {t:"text", html:"<p><code>cp</code>: Copying files. Copies are not connected to each other (unlike links).</p>"}, {t:"code", code:"cp -r NTI /root", lang:"bash"}, {t:"text", html:"<p>For copying a directory.<br><em>(بناخد الـ NTI كوبي ونحطه جوا الـ root / copy الـ NTI الاصلية جوا الـ root اللي هو الـ home directory)</em></p>"}, {t:"text", html:"<p><code>mv</code>: \"Cut\" or \"Rename\" depending on whether you provide a path to paste or just a new name.</p>"}, {t:"text", html:"<p>### Deleting (<code>rm</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["rm file2","Asks to verify"],["rm -f file2","Deletes without inquiry (force)"],["rm -r dir1","Removes directory recursively (asks to verify)"],["rm -fr dir1","Removes directory recursively without inquiry"]]}, {t:"callout", kind:"warning", html:"<code>rm -fr dir1</code> removes a directory recursively without asking for confirmation. Double-check the target before running it."}, {t:"text", html:"<p>### Viewing File Content</p>"}, {t:"table", head:["Command","Description"], rows:[["cat /etc/<file>","List the content of the file"],["less /etc/<file>","Instead of cat, more organized, allows scrolling & using Space to move to the next page"],["head /etc/<file>","First 10 lines"],["head -n 5 /etc/<file>","First 5 lines"],["head /etc/file1 /etc/file2","First 10 lines from both files"],["tail /etc/<file>","Last lines"],["tail -n 5 /etc/<file>","Last 5 lines"]]}]
        },
        {
          id: "links-hard-links-vs-soft-links",
          title: "Links (Hard Links vs. Soft Links)",
          icon: "folder",
          blocks: [{t:"table", head:["Behavior","Soft Link","Hard Link"], rows:[["Inode","Different inode","Same inode"],["Relationship to source","It's just a pointer to the original file","Both files are real-time aligned (connected to each other)"],["Size","The soft link size is not related to the original file size, as it's only a pointer","The file size is the same as the hard link size"],["Creation","ln -s /etc soft-link","ln <source> <link>"]]}, {t:"code", code:"ls -i", lang:"bash"}, {t:"text", html:"<p>Displays inodes.</p>"}]
        },
        {
          id: "search-pattern-matching-grep-wildcards",
          title: "Search & Pattern Matching (`grep` & Wildcards)",
          icon: "search",
          blocks: [{t:"text", html:"<p>### Wildcards (Rules of naming files)</p>"}, {t:"table", head:["Pattern","Meaning"], rows:[["ls [fa]*","Matches any file starting with f or a"],["ls [a-c]*","Any file starting with one of these letters (a, b, c)"],["ls [!fa]* / ls [^a-f]* / ls [!a-f]*","Any file that does not start with one of these letters"],["ls [~a-c]*","Any file starting with one of these letters"]]}, {t:"text", html:"<p>### Text Searching (<code>grep</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["grep omar /etc/passwd","Searches for \"omar\""],["grep -i omar /etc/passwd","\"Not case-sensitive\""],["grep -l Karim /etc/passwd","If there is \"Karim\", returns the file path only; if not found, returns nothing"],["grep -A 2 Ali /etc/passwd","Returns the line itself & 2 lines After"],["grep -B 2 Ali /etc/passwd","Returns the line itself & 2 lines Before"],["grep -e omar -e Ali /etc/passwd","Searching for 2 words at the same time"],["grep ^cat /etc/passwd","Returns any word that starts with \"cat\""],["grep c.t /etc/passwd","One letter in between 'c' and 't'"],["grep ^c..t$ /etc/passwd","Starts with 'c' & ends with 't' with exactly 2 letters in between"]]}]
        }
      ]
    },
    michael: {
      author: "Michael",
      day: 1,
      subtitle: "Comprehensive Linux Commands & File System",
      avatar: "M",
      sections: [
        {
          id: "directory-navigation-paths",
          title: "Directory Navigation & Paths",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Working Directory & Path Types</p>"}, {t:"list", items:["<code>pwd</code> (<strong>Print Working Directory</strong>): Displays the current absolute directory path.","<strong>Absolute Path</strong>: Path defined from the root directory <code>/</code> (e.g., <code>/usr/share/doc/</code>).","<strong>Relative Path</strong>: Path defined relative to the current directory (e.g., <code>..</code>, <code>doc/</code>)."]}, {t:"text", html:"<p>### Navigation Commands (<code>cd</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["cd","Change directory"],["cd /","Move to the Root Directory /"],["cd ~ / cd $HOME / cd /home/<username>","Move to the current user's Home Directory (contains the 4 basic user directories: Desktop, Documents, Downloads, etc.)"],["cd /root","Move to the Root User's Home Directory"],["cd -","Switch back to the previous working directory"],["cd ..","Move up one level in the directory tree (parent directory)"],["cd /dev/","Navigate to system devices directory"],["cd /run","Navigate to runtime variable data directory"],["cd /usr/share/doc/","Navigate to documentation folder"],["cd /var/log","Navigate to system log directory"]]}, {t:"text", html:"<p><code>cd -</code> switches back to the previous working directory.<br><em>(يرجعك لآخر مكان كنت فيه)</em></p>"}, {t:"callout", kind:"info", html:"<strong>Key Question (إيه الفرق بين <code>~</code> و <code>/home/</code>؟):</strong> <code>~</code> represents the home directory of the currently logged-in user (e.g., <code>/home/omar</code> for user <code>omar</code>, or <code>/root</code> for the <code>root</code> user). <code>/home/</code> is the base directory housing all individual user home folders."}]
        },
        {
          id: "directory-listing-file-inspection-ls-dir",
          title: "Directory Listing & File Inspection (`ls`, `dir`, `tree`)",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Basic & Advanced <code>ls</code> Flags</p>"}, {t:"list", items:["<code>ls</code>: Lists files and directories in the current folder.","<code>ls /</code>: Lists contents of the root directory.","<code>ls -l</code>: Detailed long-listing format. Displays file types, permissions (9 bits), link count, owner, group, file size, last modified time, and name."]}, {t:"text", html:"<p><strong>File Type Identifiers in <code>ls -l</code>:</strong></p>"}, {t:"table", head:["Identifier","Meaning"], rows:[["d","Directory *(أي directory باللون الأزرق - directories in blue)*"],["-","Regular file"],["l","Symbolic link"]]}, {t:"table", head:["Command","Description"], rows:[["ls -la / ls -a","Lists all files, including hidden files (starting with .)"],["ls -lh","Displays file sizes in Human-Readable formats (KB, MB, GB)"],["ls -lt","Sorts output by modification time (newest first)"],["ls -ltr","Sorts output by modification time in reverse (oldest first)"],["ls -lR / ls -LR","Recursive directory listing (lists subdirectories and their contents)"],["ls -li","Displays file listing along with Inode numbers"]]}, {t:"text", html:"<p>### <code>dir</code> vs <code>ls</code></p>"}, {t:"list", items:["<code>dir</code>: Similar to <code>ls</code>, lists directory contents.","<code>dir --color</code>: Colorizes directory listings to distinguish files and folders.","Both commands are <strong>case-sensitive</strong>."]}, {t:"text", html:"<p>### Wildcards & Pattern Matching in <code>ls</code></p>"}, {t:"table", head:["Pattern","Meaning"], rows:[["ls file*","Matches any file starting with file"],["ls [fa]*","Matches files starting with either f or a"],["ls [a-c]*","Matches files starting with letters a, b, or c"],["ls [!fa]*","Matches files NOT starting with f or a *(إستثناء - exclusion)*"],["ls [!a-c]*","Matches files NOT starting with a, b, or c"],["ls file[[:alpha:]]","Matches file followed by any alphabetic character"],["ls *[[:space:]]*","Matches filenames containing space characters"]]}]
        },
        {
          id: "file-directory-management-touch-mkdir-cp",
          title: "File & Directory Management (`touch`, `mkdir`, `cp`, `mv`, `rm`)",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Creating Files & Directories</p>"}, {t:"code", code:"touch File1", lang:"bash"}, {t:"text", html:"<p>Creates an empty file named <code>File1</code> (or updates timestamps if it exists).</p>"}, {t:"code", code:"touch File1 File2", lang:"bash"}, {t:"text", html:"<p>Creates multiple empty files at once.</p>"}, {t:"code", code:"touch /root/Desktop/File1", lang:"bash"}, {t:"text", html:"<p>Creates a file at a specific path.</p>"}, {t:"code", code:"mkdir dir1", lang:"bash"}, {t:"text", html:"<p>Creates a directory named <code>dir1</code>.</p>"}, {t:"code", code:"mkdir -p dir1/dir2/dir3", lang:"bash"}, {t:"text", html:"<p><strong>Parent flag (<code>-p</code>)</strong> creates nested directory structures recursively.<br><em>(بيعمل المجلدات وأجزائها)</em></p>"}, {t:"code", code:"tree dir1", lang:"bash"}, {t:"text", html:"<p>Visualizes directory hierarchy in a tree structure.</p>"}, {t:"code", code:"mkdir system/admin", lang:"bash"}, {t:"text", html:"<p>Creates nested system/admin directories.</p>"}, {t:"text", html:"<p>### Copying Files & Directories (<code>cp</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["cp /etc/passwd /home/omar","Copies /etc/passwd to /home/omar"],["cp /etc/shadow .","Copies /etc/shadow to the current working directory (.)"],["cp -r /etc/ /home/","Recursive copy (-r): copies directory /etc/ along with all its subdirectories and contents"],["cp -r /etc/* /home/","Copies all contents inside /etc/ into /home/"],["cp File1 File2 File3 /home/omar","Copies multiple files into a destination directory"],["cp /etc/passwd ~","Copies file to user's home directory"]]}, {t:"text", html:"<p>### Moving & Renaming (<code>mv</code>)</p>"}, {t:"table", head:["Command","Description"], rows:[["mv passwd new_passwd","Renames file passwd to new_passwd (when destination path remains unchanged)"],["mv new_passwd /root/Documents","Moves file to /root/Documents"],["mv File1 File2 File3 /root/","Moves multiple files to /root/"],["mv dir1 dir2 dir3 dir4","Moves multiple directories or contents"]]}, {t:"text", html:"<p>### Deleting Files & Directories (<code>rm</code>, <code>rmdir</code>)</p>"}, {t:"code", code:"rm File1", lang:"bash"}, {t:"text", html:"<p>Removes/deletes <code>File1</code>.</p>"}, {t:"code", code:"rmdir dir1", lang:"bash"}, {t:"text", html:"<p>Removes empty directory <code>dir1</code>.</p>"}, {t:"text", html:"<p><strong>Aliases & Root Protection:</strong></p>"}, {t:"callout", kind:"tip", html:"<code>alias rm='rm -i'</code>: Interactive mode prompts for confirmation before deletion.<br><em>(يسأل قبل ما يمسح)</em><br>The <code>root</code> user defaults to interactive <code>rm -i</code> for safety."}, {t:"code", code:"rm -f File1", lang:"bash"}, {t:"text", html:"<p><strong>Force delete (<code>-f</code>)</strong> bypasses prompts.<br><em>(يمسح بدون ما يسأل)</em></p>"}, {t:"code", code:"rm -r dir1", lang:"bash"}, {t:"text", html:"<p><strong>Recursive delete (<code>-r</code>)</strong> removes directory and its contents.</p>"}, {t:"code", code:"rm -rf dir1", lang:"bash"}, {t:"text", html:"<p>Forcefully and recursively removes directory <code>dir1</code>.</p>"}, {t:"callout", kind:"warning", html:"<code>rm -rf *</code> deletes everything in the current directory.<br><em>(يمسح كل حاجة)</em>"}, {t:"callout", kind:"danger", html:"<code>rm -rf /</code> deletes the entire system. Irreversible.<br><em>(يمسح السيستم كله - CRITICAL DANGER)</em>"}]
        },
        {
          id: "inodes-links-hard-links-vs-soft-symbolic",
          title: "Inodes & Links (Hard Links vs. Soft/Symbolic Links)",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### Understanding Inodes</p>"}, {t:"text", html:"<p><strong>Inode</strong>: Index node storing metadata about a file (file size, permissions, owner, timestamps, block pointers). Metadatas are stored in the Inode Table.</p>"}, {t:"text", html:"<p>### Creating & Managing Links</p>"}, {t:"code", code:"ln passwd hard-link-passwd", lang:"bash"}, {t:"text", html:"<p>Creates a <strong>Hard Link</strong> named <code>hard-link-passwd</code>.</p>"}, {t:"code", code:"ln -s passwd soft-link1", lang:"bash"}, {t:"text", html:"<p>Creates a <strong>Soft/Symbolic Link</strong> (<code>-s</code>) named <code>soft-link1</code>.</p>"}, {t:"code", code:"ls -li", lang:"bash"}, {t:"text", html:"<p>Displays Inode numbers along with file details.</p>"}, {t:"text", html:"<p>### Key Rules & Behavior Differences</p>"}, {t:"table", head:["Behavior","Hard Link","Soft Link"], rows:[["Inode","Points directly to the same Inode as the source file. Increments link count.","Has its own Inode; points to the target filename/path."],["Deleting source file (rm -f passwd)","Data remains accessible because the link points to the underlying Inode/data blocks *(لو مسحت الملف الأصلي، الـ hard link يفضل شغال)*","Becomes broken/invalid *(الـ soft link يقف - broken link error when reading via cat)*"],["Works on directories?","❌ Cannot create hard links for directories *(ميدعمش نعمل hard link لـ directory)*","✅ Supports directories"],["Works across different filesystems/partitions?","❌ Cannot create hard links across different filesystems/partitions *(ولا بين different filesystem)*","✅ Works across different filesystems"]]}, {t:"diagram", kind:"links"}]
        },
        {
          id: "text-searching-grep-regular-expressions",
          title: "Text Searching (`grep`) & Regular Expressions",
          icon: "search",
          blocks: [{t:"text", html:"<p><code>grep</code> searches text for patterns and prints matching lines.</p>"}, {t:"text", html:"<p>### Basic Searching & Flags</p>"}, {t:"code", code:"grep omar /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Searches for string <code>omar</code> in <code>/etc/passwd</code>.</p>"}, {t:"code", code:"grep bash /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Searches for <code>bash</code>.</p>"}, {t:"table", head:["Command","Description"], rows:[["grep -i bash /etc/passwd","Case-insensitive search (-i) *(Case insensitive - يتجاهل حالة الأحرف)*"],["grep -v nologin /etc/passwd","Invert match (-v): prints lines that do NOT contain nologin *(سيرش على أي line مفيهاش nologin)*"],["grep -w shut /etc/passwd","Word match (-w): matches whole word shut only *(بيدور على كلمة كاملة)*"],["grep -A 2 root /etc/passwd","Displays match plus 2 lines AFTER (-A)"],["grep -B 2 root /etc/passwd","Displays match plus 2 lines BEFORE (-B)"],["grep -r omar /etc","Recursive search (-r): searches all files inside directory /etc"],["grep -rl omar /etc","Lists only filenames (-l) containing the match"],["grep -e omar -e root /etc/passwd","Searches for multiple patterns (-e) simultaneously (omar OR root)"]]}, {t:"text", html:"<p>### Regular Expressions with <code>grep</code></p>"}, {t:"text", html:"<p>Used with dictionary files (e.g., <code>/usr/share/dict/words</code>):</p>"}, {t:"table", head:["Command","Description"], rows:[["grep '^cat' /usr/share/dict/words","Matches lines starting with cat"],["grep 'cat$' /usr/share/dict/words","Matches lines ending with cat"],["grep '^cat$' /usr/share/dict/words","Matches exact line cat"],["grep 'c.t' /usr/share/dict/words","Matches c, followed by any single character, followed by t"],["grep '^c.t$' /usr/share/dict/words","Exact 3-letter words starting with c and ending with t"],["grep '^c[aou]t$' /usr/share/dict/words","Exact 3-letter words starting with c, middle character a, o, or u, and ending with t (e.g., cat, cot, cut)"]]}]
        },
        {
          id: "text-processing-cut",
          title: "Text Processing (`cut`)",
          icon: "file",
          blocks: [{t:"text", html:"<p>The <code>cut</code> command extracts sections from each line of a file.</p>"}, {t:"text", html:"<p>### Slicing Characters (<code>-c</code>)</p>"}, {t:"code", code:"cut -c 1-5 /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Extracts characters from position 1 to 5 of each line.</p>"}, {t:"code", code:"cut -c 5- /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Extracts characters from position 5 to the end of each line.</p>"}, {t:"text", html:"<p>### Delimiters & Fields (<code>-d</code>, <code>-f</code>)</p>"}, {t:"code", code:"cut -d : -f 1 /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Sets delimiter (<code>-d</code>) to <code>:</code> and extracts field 1 (usernames).</p>"}, {t:"code", code:"cut -d : -f 1,7 /etc/passwd", lang:"bash"}, {t:"text", html:"<p>Extracts fields 1 and 7 (username and login shell).</p>"}]
        }
      ]
    },
    hager: {
      author: "Hager",
      day: 1,
      subtitle: "Linux Session Revision Sheet",
      avatar: "H",
      sections: [
        {
          id: "linux-basics",
          title: "Linux Basics",
          icon: "cpu",
          blocks: [{t:"text", html:"<p>### Linux vs. Windows</p>"}, {t:"list", items:["Security","Stability","Maintenance","Runs on different hardware","Free & open source","Easy to customize","Community support","Different user-interface experience"]}, {t:"text", html:"<p>### Linux Architecture</p>"}, {t:"diagram", kind:"architecture"}, {t:"list", items:["<strong>Kernel:</strong> Works with the hardware.","<strong>Shell:</strong> Interface for interacting with the system through commands."]}, {t:"text", html:"<p>### Swap</p>"}, {t:"text", html:"<p>Uses part of the storage as additional memory when needed.</p>"}]
        },
        {
          id: "users-and-privileges",
          title: "Users and Privileges",
          icon: "file",
          blocks: [{t:"table", head:["Symbol","Meaning"], rows:[["$","Regular user"],["#","Superuser"]]}]
        },
        {
          id: "command-syntax",
          title: "Command Syntax",
          icon: "eye",
          blocks: [{t:"code", code:"command  option  argument", lang:"bash"}, {t:"text", html:"<p>Example:</p>"}, {t:"code", code:"ls -l /dev", lang:"bash"}, {t:"list", items:["A space is required between the command, options, and arguments.","Options can be combined."]}, {t:"text", html:"<p>For example:</p>"}, {t:"code", code:"ls -ld", lang:"bash"}, {t:"text", html:"<p>is equivalent to:</p>"}, {t:"code", code:"ls -l -d", lang:"bash"}]
        },
        {
          id: "navigation",
          title: "Navigation",
          icon: "file",
          blocks: [{t:"table", head:["Command","Description"], rows:[["pwd","Print working directory"],["cd","Go to home directory"],["cd ~","Go to home directory"],["cd $HOME","Go to home directory"],["cd /absolute/path","Go to an absolute path"],["cd -","Go back to the previous directory"]]}]
        },
        {
          id: "listing-files",
          title: "Listing Files",
          icon: "folder",
          blocks: [{t:"table", head:["Command","Description"], rows:[["ls","List files"],["ls -a","List all files, including hidden files"],["ls -l","Long listing"],["ls -la","Long listing + hidden files"],["ls -lt","Sort by time"],["ls -ltr","Sort by time, reverse order"],["ls -lth","Long listing + time sorting + human-readable size"]]}, {t:"callout", kind:"info", html:"Files and directories starting with <code>.</code> are hidden."}, {t:"text", html:"<p>### Wildcards</p>"}, {t:"table", head:["Pattern","Meaning"], rows:[["ls p*","Starts with p"],["ls *p","Ends with p"],["ls ???","Exactly 3 characters"],["ls [a-c]*","Starts with a, b, or c"],["ls [!a]*","Does not start with a"],["ls [!a-c]*","Does not start with a–c"]]}, {t:"callout", kind:"info", html:"Inside <code>[]</code>, <code>!</code> and <code>^</code> have the same meaning."}]
        },
        {
          id: "file-content",
          title: "File Content",
          icon: "folder",
          blocks: [{t:"table", head:["Command","Description"], rows:[["cat file","Show file content"],["nano file","Edit a file"],["head -n N file","Show the first N lines"],["tail -n N file","Show the last N lines"]]}]
        },
        {
          id: "file-directory-management",
          title: "File & Directory Management",
          icon: "folder",
          blocks: [{t:"table", head:["Command","Description"], rows:[["touch file","Create an empty file"],["mkdir dir","Create a directory"],["cp file dest","Copy a file"],["cp -r dir dest","Copy a directory recursively"],["mv file dest","Move a file"],["mv file newname","Rename a file"],["rm -rf dir","Force-remove a directory recursively"]]}, {t:"text", html:"<p>### Important Options</p>"}, {t:"code", code:"-r / -R  → recursive\n-f       → force", lang:"bash"}, {t:"callout", kind:"danger", html:"<code>rm -rf dir</code> force-removes a directory recursively. This is irreversible — the data is not recoverable."}]
        },
        {
          id: "searching-with-grep",
          title: "Searching with `grep`",
          icon: "search",
          blocks: [{t:"text", html:"<p>Basic command:</p>"}, {t:"code", code:"grep hager dir", lang:"bash"}, {t:"text", html:"<p>### Useful Options</p>"}, {t:"table", head:["Command","Description"], rows:[["grep -i","Case-insensitive"],["grep -l","Show only file names containing the pattern"],["grep -B N","Show N lines **before** the match"],["grep -A N","Show N lines **after** the match"]]}, {t:"text", html:"<p>Example:</p>"}, {t:"code", code:"grep -i hager dir\ngrep -l hager dir\ngrep -B 2 hager dir\ngrep -A 2 hager dir", lang:"bash"}]
        },
        {
          id: "links",
          title: "Links",
          icon: "folder",
          blocks: [{t:"text", html:"<p>Linux supports <strong>hard links</strong> and <strong>soft links</strong>.</p>"}, {t:"text", html:"<p>### Hard Link</p>"}, {t:"code", code:"ln file1 file2", lang:"bash"}, {t:"list", items:["Both names refer to the same data.","They share the same inode.","A hard link cannot link directories.","The data remains as long as at least one hard link still exists."]}, {t:"text", html:"<p>Example:</p>"}, {t:"code", code:"ln file1 file2", lang:"bash"}, {t:"text", html:"<p>To remove a hard link:</p>"}, {t:"code", code:"rm -rf hard-link", lang:"bash"}, {t:"callout", kind:"warning", html:"<code>rm -rf hard-link</code> is used to remove a hard link. Since <code>-rf</code> is destructive, confirm the target before running it."}, {t:"text", html:"<p>### Soft Link</p>"}, {t:"text", html:"<p>A soft link points to a path.</p>"}, {t:"text", html:"<p>### Inode</p>"}, {t:"list", items:["Every file or directory has an <strong>inode</strong> allocated for it.","A hard link refers to the same inode/data."]}]
        },
        {
          id: "important-filesystem-directories",
          title: "Important Filesystem Directories",
          icon: "folder",
          blocks: [{t:"table", head:["Directory","Purpose"], rows:[["/","Root of the entire filesystem"],["/bin","Essential binaries for regular users"],["/sbin","System binaries for the superuser"],["/dev","Device files"],["/etc","Configuration files"],["/home","Users' home directories"],["/root","Home directory of the superuser"],["/tmp","Temporary files"],["/var","Variable data, such as /var/tmp"],["/run","Runtime data related to services"],["/local","Local / customized software"]]}, {t:"text", html:"<p>### Important</p>"}, {t:"code", code:"/       → Root of the filesystem\n/root   → Home directory of the superuser\n/home   → Home directories of regular users", lang:"bash"}, {t:"callout", kind:"info", html:"<code>/root</code> is <strong>not</strong> the same as <code>/home/root</code>."}]
        },
        {
          id: "terminal-keyboard-shortcuts",
          title: "Terminal Keyboard Shortcuts",
          icon: "file",
          blocks: [{t:"table", head:["Shortcut","Action"], rows:[["Ctrl + A","Go to the beginning of the command"],["Ctrl + E","Go to the end of the command"],["Ctrl + ← / →","Move by word"],["Ctrl + K","Cut from the cursor to the end of the line"],["Ctrl + U","Cut from the cursor to the beginning of the line"]]}]
        }
      ]
    },
    sagda: {
      author: "Sagda",
      day: 2,
      subtitle: "Day 2 — Man Pages, Redirection, Pipelines, Vim, Variables, and User Types",
      avatar: "S",
      sections: [
        {
          id: "man-pages-getting-help-in-linux",
          title: "Man Pages — Getting Help in Linux",
          icon: "cpu",
          blocks: [{t:"text", html:"<p>### What are man pages?</p>"}, {t:"text", html:"<p>Every command in Linux comes bundled with its own official documentation, built right into the operating system. This is called a \"man page\" (short for manual page). Unlike searching the internet, man pages are always installed locally, always match the exact version of the command on your system, and work even if you have no internet connection — which matters a lot for servers.</p>"}, {t:"code", code:"man passwd", lang:"bash"}, {t:"text", html:"<p>### Why man pages have numbered sections</p>"}, {t:"text", html:"<p>Some words in Linux mean more than one thing. For example, <code>passwd</code> refers to:</p>"}, {t:"list", items:["A command you run to change a password","A file (<code>/etc/passwd</code>) that stores account information"]}, {t:"text", html:"<p>If Linux just had one manual page per word, this would be confusing. So man pages are split into sections, each numbered:</p>"}, {t:"table", head:["Section","What it documents","Example"], rows:[["1","Executable programs / user commands","man 1 passwd"],["5","File formats and configuration file structure","man 5 passwd"],["8","System administration commands (root-level)","man 8 useradd"]]}, {t:"text", html:"<p>When you type <code>man passwd</code> without specifying a number, Linux shows you the lowest-numbered match it finds — usually the command page (section 1). If you specifically want the file-format explanation, you must ask for it directly with <code>man 5 passwd</code>.</p>"}, {t:"text", html:"<p>Where these files physically live:</p>"}, {t:"code", code:"cd /usr/share/man", lang:"bash"}, {t:"text", html:"<p>This folder contains subdirectories like <code>man1</code>, <code>man5</code>, <code>man8</code>, etc. — one folder per section — each holding the actual manual files. You'll rarely need to browse here manually, but it's good to know this isn't magic; it's just organized text files on disk.</p>"}, {t:"text", html:"<p>### Checking if a command exists</p>"}, {t:"code", code:"whereis useradd", lang:"bash"}, {t:"text", html:"<p>This tells you whether the command actually exists on this machine and where its files are stored (its binary program, its man page, and sometimes source files). This is useful troubleshooting before assuming \"maybe this command isn't installed.\"</p>"}, {t:"text", html:"<p>### Navigating inside an open man page</p>"}, {t:"text", html:"<p>Man pages open using a \"pager\" program (usually called <code>less</code>), which lets you scroll through long text comfortably. Once inside, these keys help you move around:</p>"}, {t:"table", head:["Key","What it does"], rows:[["/word","Searches forward through the page for \"word\""],["n","Jumps to the next occurrence of your last search"],["Shift + N","Jumps to the previous occurrence"],["Shift + G","Jumps straight to the end of the document"],["g","Jumps straight to the beginning"],["q","Quits and returns you to your terminal prompt"]]}, {t:"text", html:"<p>This matters because man pages can be extremely long (some run hundreds of lines), so scrolling manually line-by-line would waste a lot of time.</p>"}, {t:"text", html:"<p>### Quick summary tools</p>"}, {t:"text", html:"<p><code>whatis</code> — gives you a one-line description instead of opening the whole manual:</p>"}, {t:"code", code:"whatis passwd", lang:"bash"}, {t:"text", html:"<p>Output is something short like: \"passwd - update user's authentication tokens\" — enough to jog your memory without committing to reading a full page.</p>"}, {t:"text", html:"<p><code>man -k</code> — lets you search by topic instead of by exact command name:</p>"}, {t:"code", code:"man -k \"print files\"", lang:"bash"}, {t:"text", html:"<p>This searches through the short description line of every man page installed on the system and shows you every command whose description matches your keyword. This is incredibly useful when you know what you want to accomplish but don't remember the exact command name for it.</p>"}, {t:"callout", kind:"info", html:"Behind the scenes, <code>man -k</code> relies on a search database called <code>mandb</code>. If <code>man -k</code> returns nothing on a fresh system, an administrator may need to run <code>mandb</code> once to build that index."}, {t:"text", html:"<p><code>--help</code> — nearly every Linux command supports this flag:</p>"}, {t:"code", code:"useradd --help", lang:"bash"}, {t:"text", html:"<p>This prints a condensed list of all available options for that command directly in your terminal — much faster than opening the full man page when you just need a quick reminder of what flags exist.</p>"}, {t:"text", html:"<p>### When to use which tool</p>"}, {t:"table", head:["Situation","Tool"], rows:[["Know the command, want full details","man command"],["Know the command, just want a one-liner","whatis command"],["Know the command, just want the option flags","command --help"],["Don't know the command name at all","man -k \"keyword\""]]}]
        },
        {
          id: "redirection-controlling-where-data-goes",
          title: "Redirection — Controlling Where Data Goes",
          icon: "network",
          blocks: [{t:"text", html:"<p>### The concept</p>"}, {t:"text", html:"<p>Every command you run in Linux is silently connected to three data channels:</p>"}, {t:"list", items:["Input — where the command reads data from (by default, your keyboard)","Output — where the command sends its normal results (by default, your screen)","Error — where the command sends error/warning messages (by default, also your screen)"]}, {t:"text", html:"<p>Linux internally labels these with numbers called File Descriptors (FDs):</p>"}, {t:"table", head:["Stream name","Purpose","File Descriptor number"], rows:[["Standard Input (stdin)","Where the command reads input from","0"],["Standard Output (stdout)","Where normal results go","1"],["Standard Error (stderr)","Where error messages go","2"]]}, {t:"text", html:"<p>Redirection means telling Linux \"instead of the default location, send this stream somewhere else — usually into a file.\" This is one of the most powerful ideas in the Linux command line because it lets you automate things without ever touching a mouse or GUI.</p>"}, {t:"text", html:"<p>### Overwrite redirection: <code>></code></p>"}, {t:"code", code:"ls -l > list.txt", lang:"bash"}, {t:"text", html:"<p>This runs <code>ls -l</code> (list files with details) and instead of showing the results on your screen, sends them into a file called <code>list.txt</code>.</p>"}, {t:"callout", kind:"warning", html:"If <code>list.txt</code> already exists and has content, <code>></code> will completely erase that content first, then write the new output. There's no confirmation prompt — it just happens. This is called overwriting, and it's the #1 way beginners accidentally lose data, so always double-check the filename before using a single <code>></code>."}, {t:"text", html:"<p>### Append redirection: <code>>></code></p>"}, {t:"code", code:"date >> list.txt", lang:"bash"}, {t:"text", html:"<p>This runs <code>date</code> (which prints today's date and time) and adds that output to the end of <code>list.txt</code>, without touching or deleting whatever was already inside the file. Think of <code>></code> as \"replace the file\" and <code>>></code> as \"add onto the file.\" This is exactly what you'd use to build up a running log over time — for example, appending a timestamp to a log file every time a script runs.</p>"}, {t:"text", html:"<p>### Input redirection: <code><</code></p>"}, {t:"text", html:"<p>So far we've talked about output — but you can redirect input too. Normally, a command like <code>sort</code> waits for you to type names one by one on the keyboard. Instead, you can tell it to read directly from a file:</p>"}, {t:"code", code:"sort < names.txt", lang:"bash"}, {t:"text", html:"<p>This makes <code>sort</code> read all the lines already stored in <code>names.txt</code> and immediately sort them alphabetically, without you needing to type anything interactively. This is less common day-to-day than output redirection, but it's important conceptually: input, output, and error are three separate, independently redirectable channels.</p>"}, {t:"text", html:"<p>### Error-only redirection: <code>2></code></p>"}, {t:"text", html:"<p>Because errors have their own File Descriptor (2), you can redirect only the errors, leaving normal output untouched:</p>"}, {t:"code", code:"find / -name passwd 2> /dev/null", lang:"bash"}, {t:"text", html:"<p>Let's unpack this real-world example:</p>"}, {t:"list", items:["<code>find / -name passwd</code> searches the entire filesystem (starting from <code>/</code>, the root) for anything named <code>passwd</code>","Because this search touches nearly every folder on the system, it will try to peek into directories you don't have permission to access — and each of those attempts generates a \"Permission denied\" error","<code>2></code> grabs only those error messages (Channel 2) and sends them into <code>/dev/null</code>","<code>/dev/null</code> is a special file built into Linux that acts like a black hole — anything written into it is instantly discarded and gone forever. It's the standard way to \"throw away\" unwanted output.","Meanwhile, the actual successful search results (the file paths it did find) are not affected — they still print normally to your screen, because you only redirected Channel 2, not Channel 1"]}, {t:"text", html:"<p>This pattern (<code>2> /dev/null</code>) is extremely common in real system administration to keep your terminal clean while running system-wide searches.</p>"}, {t:"text", html:"<p>### Combining output and error redirection</p>"}, {t:"text", html:"<p>Sometimes you want both the normal results and the error messages saved — either together in one file, or split into two separate files.</p>"}, {t:"text", html:"<p>Splitting into two separate files:</p>"}, {t:"code", code:"find / -name passwd > results.txt 2> errors.txt", lang:"bash"}, {t:"text", html:"<p>Successful matches go into <code>results.txt</code>; error messages go into <code>errors.txt</code>.</p>"}, {t:"text", html:"<p><code>&></code> — the modern shorthand for combining both into ONE file:</p>"}, {t:"code", code:"command &> all_output.txt", lang:"bash"}, {t:"text", html:"<p>This single symbol tells Linux \"send both the normal output AND the errors into this same file.\" It's a shortcut that saves you from writing two separate redirections.</p>"}, {t:"text", html:"<p><code>2>&1</code> — the traditional (older, more explicit) method for combining streams:</p>"}, {t:"code", code:"command > all_output.txt 2>&1", lang:"bash"}, {t:"text", html:"<p>This reads as: \"send normal output (Channel 1) into <code>all_output.txt</code>, THEN also redirect errors (Channel 2) into wherever Channel 1 is currently pointing.\" The order matters here — <code>2>&1</code> must come after the <code>></code> redirection, and it must be placed at the end of the command, because Linux processes these redirections left to right, and Channel 2 needs to know where Channel 1 is already pointing before it can copy that destination.</p>"}, {t:"diagram", kind:"links"}]
        },
        {
          id: "pipelines-connecting-commands-together",
          title: "Pipelines — Connecting Commands Together",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### The concept</p>"}, {t:"text", html:"<p>A pipeline is similar to redirection, but instead of sending a command's output into a file, it sends that output directly into another command as that command's input — with no file ever being created in between. The symbol used is the vertical bar <code>|</code>, called a \"pipe.\"</p>"}, {t:"code", code:"ls -l | grep ^-", lang:"bash"}, {t:"text", html:"<p>Let's break this down step by step:</p>"}, {t:"list", items:["<code>ls -l</code> runs first, producing a detailed list of files and folders, where each line starts with a permission code like <code>drwxr-xr-x</code> (directories) or <code>-rw-r--r--</code> (regular files)","The <code>|</code> takes that entire output and feeds it directly into the next command, <code>grep</code>, as if you had typed it in yourself","<code>grep ^-</code> searches through those lines and keeps only the ones that start with a dash <code>-</code> — because in <code>ls -l</code> output, a leading <code>d</code> means directory, a leading <code>l</code> means symbolic link, and a leading <code>-</code> specifically means \"this is a regular file\""]}, {t:"text", html:"<p>So the whole pipeline answers a specific question: \"Show me only the actual files in this folder — skip the folders and shortcuts.\"</p>"}, {t:"text", html:"<p>You can even chain multiple pipes together (<code>cmd1 | cmd2 | cmd3</code>), passing data through several filtering steps in sequence — this is one of Linux's most powerful features, letting you build complex operations out of small, simple tools.</p>"}]
        },
        {
          id: "wc-word-count",
          title: "wc — Word Count",
          icon: "file",
          blocks: [{t:"text", html:"<p>### What it does</p>"}, {t:"text", html:"<p><code>wc</code> stands for word count, and despite the name, it actually counts three things at once: lines, words, and characters.</p>"}, {t:"code", code:"echo \"nti aiops\" | wc", lang:"bash"}, {t:"text", html:"<p>Here, <code>echo \"nti aiops\"</code> simply prints the text <code>nti aiops</code>, and that text is piped into <code>wc</code>, which analyzes it. The output has three numbers, always in this order:</p>"}, {t:"table", head:["Lines","Words","Characters"], rows:[["1","2","10"]]}, {t:"list", items:["1 line — because <code>echo</code> only produced one line of text","2 words — \"nti\" and \"aiops\" are two separate words","10 characters — counting every letter and the space between them"]}, {t:"text", html:"<p>### Getting just ONE of these numbers</p>"}, {t:"text", html:"<p>Often you don't need all three — just one specific count. You can add a flag to <code>wc</code> to isolate exactly what you want:</p>"}, {t:"code", code:"echo \"nti aiops\" | wc -w", lang:"bash"}, {t:"text", html:"<p>This returns only the word count (2), with nothing else cluttering the output.</p>"}, {t:"table", head:["Flag","Returns"], rows:[["wc -l","Line count only"],["wc -w","Word count only"],["wc -c","Character count only"]]}, {t:"text", html:"<p>### Combining wc with other commands</p>"}, {t:"code", code:"ls -R /etc | wc -l", lang:"bash"}, {t:"list", items:["<code>ls -R /etc</code> lists everything inside <code>/etc</code>, and the <code>-R</code> flag makes it recursive — meaning it doesn't just list the top-level folder, it digs into every subfolder inside it too, listing everything at every depth","Piping that into <code>wc -l</code> counts how many total lines were produced — effectively telling you how many files and folders exist inside <code>/etc</code> and all its subfolders combined"]}, {t:"text", html:"<p>This shows how small commands combine into powerful one-liners: instead of manually counting hundreds of files, one line does it instantly.</p>"}]
        },
        {
          id: "vim-vi-the-command-line-text-editor",
          title: "Vim / Vi — The Command-Line Text Editor",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### Why vim exists</p>"}, {t:"text", html:"<p>Most Linux servers don't have a graphical interface at all — no mouse, no windows, no Notepad-style app. So editing configuration files, scripts, or any text must happen entirely from the terminal. <code>vim</code> (an improved version of the older <code>vi</code>) is the most widely used tool for this.</p>"}, {t:"code", code:"vim myfile.txt", lang:"bash"}, {t:"list", items:["If <code>myfile.txt</code> doesn't exist yet, vim creates a brand-new empty file with that name and opens it, ready for you to start typing","If it already exists, vim opens it and displays its current content on screen, ready for editing"]}, {t:"text", html:"<p>### The core concept: Modes</p>"}, {t:"text", html:"<p>This is the single most important thing to understand about vim, and the thing that confuses almost every beginner: the same keyboard keys do completely different things depending on which \"mode\" vim is currently in. Vim is called a \"modal\" editor for exactly this reason.</p>"}, {t:"table", head:["Mode","What it's for","How you enter it"], rows:[["Normal mode","The default mode vim opens in. Used for moving around, deleting lines, copying text — but not for typing new text","Press Esc from any other mode"],["Insert mode","The mode where your keyboard behaves like a normal text editor — every key you press types a character","Press i while in Normal mode"],["Visual mode","Lets you highlight/select a block of text (like dragging with a mouse, but with the keyboard) — useful before copying or deleting a chunk at once","Press v while in Normal mode"],["Command mode","Used to save the file, quit, or run other special commands","Press : while in Normal mode"]]}, {t:"callout", kind:"tip", html:"The golden safety rule: if you're ever confused about what mode you're currently in, just press <code>Esc</code>. This always returns you to Normal mode no matter where you were — it's your \"reset button\" and there's no danger in pressing it too often."}, {t:"text", html:"<p>A typical beginner workflow looks like:</p>"}, {t:"list", items:["Open the file: <code>vim file.txt</code>","You start in Normal mode — press <code>i</code> to switch to Insert mode","Type your text normally","Press <code>Esc</code> to leave Insert mode and return to Normal mode","Press <code>:</code> to enter Command mode, then type a save/quit command"]}, {t:"diagram", kind:"links"}, {t:"text", html:"<p>### Saving and quitting (all typed after pressing <code>:</code>)</p>"}, {t:"table", head:["Command","What it does"], rows:[[":w","Write (save) your changes, but keep the file open for more editing"],[":wq","Write and quit — save your changes AND close vim in one step"],[":q!","Quit without saving — discard all changes you made since opening the file. Use this if you made a mistake and just want to bail out"],[":wq!","Force-save and quit, even if there's some restriction normally preventing it (e.g., a read-only warning you have permission to override)"],[":! command","Run any shell command from inside vim without fully leaving the editor. For example, :! date runs the date command, shows you its output, and then returns you right back to your file exactly where you left off"]]}]
        },
        {
          id: "bash-shell-variables",
          title: "Bash Shell Variables",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### What a variable is</p>"}, {t:"text", html:"<p>A variable is simply a name that holds a piece of data, so you (or the system) can reuse that data later without retyping it. This concept exists in virtually every programming and scripting language, and Bash (the shell/command interpreter) is no exception.</p>"}, {t:"text", html:"<p>### Bash itself</p>"}, {t:"text", html:"<p>Bash stands for \"Bourne Again SHell,\" and it is the default shell used in Red Hat Enterprise Linux — meaning it's the actual program running behind the scenes that reads every command you type, interprets it, and executes it. When you open a \"terminal,\" you're really talking directly to Bash.</p>"}, {t:"text", html:"<p>### Two categories of variables</p>"}, {t:"list", items:["Shell variables — these come built into Bash automatically and are used for configuration purposes. Examples include <code>$PATH</code> (a list of folders Bash searches through to find commands), <code>$HOME</code> (your home directory location), and <code>$USER</code> (your current username). You don't need to create these; they already exist the moment your shell starts.","User-defined variables — these are variables you create yourself to temporarily store any value you want during your session."]}, {t:"code", code:"x=5", lang:"bash"}, {t:"text", html:"<p>This creates a variable named <code>x</code> holding the value 5. Important: this variable is local to your current shell session only — if you open a new shell process from within this one (called a \"sub-shell\"), that sub-shell has no knowledge that <code>x</code> even exists.</p>"}, {t:"text", html:"<p>### export — sharing variables with sub-shells</p>"}, {t:"code", code:"export x", lang:"bash"}, {t:"text", html:"<p><code>export</code> marks a variable so that it becomes visible to any sub-shell you open afterward, with the exact same name and value. Without <code>export</code>, a variable stays trapped in your current shell only.</p>"}, {t:"text", html:"<p>Here's a way to test and truly understand this:</p>"}, {t:"code", code:"x=5 # create a plain variable\nbash # open a new sub-shell (a shell inside your shell)\necho $x # prints NOTHING — this sub-shell never inherited x\nexit # leave the sub-shell, back to the original\nexport x=5 # create AND export in one step\nbash # open a new sub-shell again\necho $x # prints 5 — this time it WAS inherited", lang:"bash"}, {t:"text", html:"<p>### set — viewing everything currently defined</p>"}, {t:"code", code:"set", lang:"bash"}, {t:"text", html:"<p>This displays a full listing of every currently defined variable in your shell session — both the built-in shell variables and any custom ones you've created. It's typically a long list, useful mainly when troubleshooting or exploring what's already set.</p>"}]
        },
        {
          id: "linux-user-types-by-uid",
          title: "Linux User Types (by UID)",
          icon: "cpu",
          blocks: [{t:"text", html:"<p>### What a UID is</p>"}, {t:"text", html:"<p>Every user account on a Linux system — human or automated — has a unique numeric identifier called a UID (User ID). Linux uses this number internally to track ownership of files, processes, and permissions; usernames are really just human-friendly labels attached to these numbers.</p>"}, {t:"text", html:"<p>### The three categories</p>"}, {t:"table", head:["Type","UID Range","What it means"], rows:[["Super user (root)","0","There is only ever one UID 0 account: root, the single all-powerful administrator with unrestricted access to the entire system"],["System user","1–200 (statically reserved by the OS itself, used for core system services) and 201–999 (dynamically assigned as software installs and creates its own service accounts)","These accounts exist to run background services/daemons — for example, the account that runs a web server or database process. They are not meant for humans to log into directly."],["Regular user","1000 and above","These are the normal, everyday human accounts — created by an administrator so real people can log in, have their own home folder, and do their own work"]]}, {t:"callout", kind:"info", html:"Understanding these ranges matters practically: if you ever list users on a system and see a UID under 1000, you immediately know \"this is a service account, not a person\" — which is important context when auditing security or troubleshooting."}]
        },
        {
          id: "switching-users-su",
          title: "Switching Users — su",
          icon: "folder",
          blocks: [{t:"text", html:"<p>### <code>su - username</code> (with the dash)</p>"}, {t:"code", code:"su - omar", lang:"bash"}, {t:"text", html:"<p>This switches you to being the user <code>omar</code>. The dash (<code>-</code>) is crucial: it tells Linux to also load <code>omar</code>'s entire environment, exactly as if <code>omar</code> had logged in directly himself — his home directory becomes your working directory, his shell configuration and variables load, his PATH becomes active. It will also display when <code>omar</code> last logged in, similar to what you'd see on a real login screen.</p>"}, {t:"text", html:"<p>### <code>su username</code> (without the dash)</p>"}, {t:"code", code:"su omar", lang:"bash"}, {t:"text", html:"<p>This still switches you to being <code>omar</code>, but it's a lighter switch — you keep your own current environment and variables rather than fully adopting his, and you typically remain in whatever directory you were already in rather than jumping to his home folder.</p>"}, {t:"text", html:"<p>### Comparison</p>"}, {t:"table", head:["Behavior","su - username","su username"], rows:[["Environment loaded","Full environment, exactly as if that user logged in directly","Keeps your own current environment and variables"],["Working directory","Jumps to that user's home directory","Typically remains in whatever directory you were already in"],["Last login display","Shown, similar to a real login screen","Not part of this lighter switch"],["Best for","A true, full simulation of that user logging in (the safer, more predictable choice)","A quick, temporary permission switch without changing your whole environment"]]}]
        },
        {
          id: "visudo-safely-managing-sudo-permissions",
          title: "visudo — Safely Managing Sudo Permissions",
          icon: "file",
          blocks: [{t:"text", html:"<p>### The file behind sudo</p>"}, {t:"text", html:"<p>Every time someone runs a command with <code>sudo</code>, Linux checks a specific configuration file — <code>/etc/sudoers</code> — to decide whether that user is allowed to do that, and what exactly they're permitted to run (sometimes limited to specific commands, sometimes full access).</p>"}, {t:"text", html:"<p>### Why not just edit it with vim directly?</p>"}, {t:"text", html:"<p>You technically could open <code>/etc/sudoers</code> with <code>vim /etc/sudoers</code>, but this is considered dangerous, because a single typo in this file could silently break the entire permissions system — potentially locking every single administrator out of sudo access at once, with no easy way back in.</p>"}, {t:"code", code:"visudo", lang:"bash"}, {t:"callout", kind:"danger", html:"Editing <code>/etc/sudoers</code> directly with a regular editor is dangerous — a single typo can silently break the entire permissions system, potentially locking every administrator out of sudo access at once, with no easy way back in."}, {t:"text", html:"<p><code>visudo</code> solves this by opening the file in a protected editing session that automatically checks your syntax for errors the moment you try to save. If it detects a mistake, it stops you, shows a warning, and refuses to save the broken version — giving you the chance to fix it or discard your changes safely. This built-in safety check is the entire reason <code>visudo</code> exists as a dedicated command instead of people just using a regular text editor.</p>"}]
        }
      ]
    },
    tarek: {
      author: "Mohammed Tarek",
      day: 2,
      subtitle: "Linux Fundamentals - Bash, Redirection, Vim, and Pipelines",
      avatar: "T",
      sections: [
        {
          id: "25-september-wednesday-vim-scripting-ext",
          title: "25 September (Wednesday) — Vim Scripting, External Commands, Shell Variables",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### Vim Script: Find and Replace</p>"}, {t:"code", code:":%s/login/nologin/g", lang:"bash"}, {t:"text", html:"<p><code>g</code> means Global (to replace the words).<br><em>(new name)</em></p>"}, {t:"text", html:"<p>### Execute External Command in Vim</p>"}, {t:"code", code:":.! date", lang:"bash"}, {t:"text", html:"<p><em>(خارج ولكن يعود للمكان مره ثانيه)</em></p>"}, {t:"code", code:":* Number ! Command", lang:"bash"}, {t:"text", html:"<p>Will appear in the number of line that matches that number.</p>"}, {t:"text", html:"<p>### Vim Options</p>"}, {t:"table", head:["Command","Description"], rows:[[":set number","Will index the lines"],[":set arabic","Will make in arabic way"],[":set noarabic","Turns off arabic mode"]]}, {t:"text", html:"<p>### Variables in Shell</p>"}, {t:"text", html:"<p>User-defined Variable / Shell Variable — that you created / that already exists in the system or the user created it.</p>"}, {t:"code", code:"X=15\necho $X", lang:"bash"}, {t:"text", html:"<p>### Mathematics in Shell</p>"}, {t:"code", code:"$[x+y]\necho $[x+y]", lang:"bash"}]
        },
        {
          id: "26-september-thursday-vim-search-and-edi",
          title: "26 September (Thursday) — Vim Search and Editing",
          icon: "search",
          blocks: [{t:"text", html:"<p>### Search Direction</p>"}, {t:"table", head:["Command","Description"], rows:[["?","Search from bottom"],["/","Search from above"],["ESC / exit","To get out of Mode"]]}, {t:"text", html:"<p>### Cursor Insertion & Movement</p>"}, {t:"table", head:["Command","Description"], rows:[["a","After Cursor"],["i","Before Cursor"],["o","New next line"],["Shift + A","End of line"],["Shift + I","Beginning of line"]]}, {t:"text", html:"<p>### Editing Operations</p>"}, {t:"text", html:"<p>Everything you write, the exit option applies.</p>"}, {t:"table", head:["Command","Description"], rows:[["dd","Only to remove"],["dd + p","Cut -> Copy"]]}, {t:"text", html:"<p>### Visual Modes</p>"}, {t:"table", head:["Command","Description"], rows:[["v","To get Visual Mode"],["Shift + V","Select the line"],["Ctrl + v","Select the block *(لعمود)*"]]}, {t:"text", html:"<p>### Saving & Exiting Vim</p>"}, {t:"table", head:["Command","Description"], rows:[[":w","Save and keep in file"],[":wq","Save and get out"],[":q!","Not save and quit"],[":q","He will ask you (if you have done save you will get out immediately)"]]}]
        },
        {
          id: "27-september-friday-dev-null-and-vi-vim-",
          title: "27 September (Friday) — /dev/null and Vi/Vim Modes",
          icon: "file",
          blocks: [{t:"text", html:"<p>### /dev/null in Linux</p>"}, {t:"text", html:"<p>A special virtual device file. Acts like a black hole for data. Any data will disappear.</p>"}, {t:"callout", kind:"info", html:"<code>/dev/null</code> is a special virtual device file that acts like a black hole for data — anything sent to it disappears."}, {t:"text", html:"<p>### Vi / Vim Modes</p>"}, {t:"code", code:"Vi / Vim <filename>", lang:"bash"}, {t:"text", html:"<p>To execute into the file.</p>"}, {t:"text", html:"<p>4 level modes:</p>"}, {t:"table", head:["Mode","Description"], rows:[["Default","Command Mode"],["Update","Insert Mode"],["Select","Visual Mode"],["Ex / Command Line Mode","—"]]}, {t:"text", html:"<p>After you end, to exit -> press <code>ESC</code>.</p>"}, {t:"text", html:"<p>Press <code>i</code> -> Go to Insert Mode.</p>"}, {t:"text", html:"<p>Save or Not save: <code>Shift + :</code></p>"}, {t:"text", html:"<p>### Vim Shortcuts</p>"}, {t:"table", head:["Command","Description"], rows:[["dd","Cut / Delete line"],["yy / gy","Copy"],["p","Paste"],["u","Undo"],["/","Search"]]}]
        },
        {
          id: "28-september-saturday-pipelines",
          title: "28 September (Saturday) — Pipelines",
          icon: "network",
          blocks: [{t:"code", code:"find / -name passwd 2> temp/temp-output", lang:"bash"}, {t:"text", html:"<p>### Pipelines</p>"}, {t:"text", html:"<p>Input -> Output -> Command engine in that output</p>"}, {t:"text", html:"<p>Pass process -> gives you total output (will use it).</p>"}, {t:"code", code:"Command | output -> Command -> output", lang:"bash"}, {t:"text", html:"<p>Real Example:</p>"}, {t:"code", code:"ls -l | grep ^-", lang:"bash"}, {t:"text", html:"<p>Give filter output.</p>"}, {t:"code", code:"echo \"nti aiops\" | wc", lang:"bash"}, {t:"text", html:"<p>Print / Counted 'Count' word.</p>"}, {t:"text", html:"<p>### wc Options</p>"}, {t:"table", head:["Command","Description"], rows:[["wc -l","Lines only"],["wc -w","Words only"],["wc -c","Character only"]]}, {t:"text", html:"<p>### Search Pattern</p>"}, {t:"text", html:"<p><code>\\<th</code> -> Any word having \"th\"</p>"}, {t:"text", html:"<p>delimiter</p>"}]
        },
        {
          id: "29-september-sunday-bash-find-and-standa",
          title: "29 September (Sunday) — Bash find and Standard Output/Error",
          icon: "file",
          blocks: [{t:"code", code:"find / -name <option>", lang:"bash"}, {t:"text", html:"<p><code>option</code> -> Command anything.</p>"}, {t:"text", html:"<p>Mean: search for entire system.<br><em>(أنت بتحدد عادي هنا المكان)</em></p>"}, {t:"callout", kind:"info", html:"You may have two std output and std Error. It will get only one of them unless you specify otherwise."}, {t:"text", html:"<p>Example:</p>"}, {t:"code", code:"find / -name passwd > output", lang:"bash"}, {t:"text", html:"<p>Also has Error but it only gets the output.</p>"}, {t:"text", html:"<p><code>2></code> -> If you want to get the Error.</p>"}]
        },
        {
          id: "30-september-monday-redirection-and-manu",
          title: "30 September (Monday) — Redirection and Manual Pages",
          icon: "eye",
          blocks: [{t:"text", html:"<p>### Redirection</p>"}, {t:"text", html:"<p>Redirection -> to change info to another page.</p>"}, {t:"table", head:["Stream","File Descriptor"], rows:[["std input","FD0"],["std output","FD1"],["std Error","FD2"]]}, {t:"text", html:"<p>Any Command / Any Program / Standard STDs.</p>"}, {t:"text", html:"<p>Values not be typed.</p>"}, {t:"text", html:"<p>The next or another file doesn't know what you give Std to make it understand.</p>"}, {t:"code", code:"ls -l > /temp/temp-output", lang:"bash"}, {t:"text", html:"<p>Also makes override.</p>"}, {t:"text", html:"<p>To append: <code>>></code></p>"}, {t:"text", html:"<p><code>1></code> -> Will not center / output redirect.</p>"}, {t:"code", code:"anything > temp-erro-output", lang:"bash"}, {t:"text", html:"<p>Error here: <code>2></code></p>"}, {t:"text", html:"<p>It will understand that is error.</p>"}, {t:"callout", kind:"warning", html:"<code>></code> overrides the target file's contents. Use <code>>></code> to append instead of overwriting."}, {t:"text", html:"<p>### Manual Pages & Vim Navigation</p>"}, {t:"text", html:"<p><code>/etc</code> -> Have all Configuration file in system.</p>"}, {t:"text", html:"<p>4 Command to get to home (?)</p>"}, {t:"text", html:"<p>### Manual Page Sections</p>"}, {t:"table", head:["Section","Description"], rows:[["1","User Command (regular page)"],["5","Configuration files"],["8","System Administrator commands"]]}, {t:"code", code:"whereis Command", lang:"bash"}, {t:"text", html:"<p>Gives you where the Command is on pages.</p>"}, {t:"text", html:"<p>### Vim / Navigation Shortcuts</p>"}, {t:"table", head:["Command","Description"], rows:[["Shift + G","To get the last of file"],["g (small g)","To get the first of file"],["Shift + N","Will search for same word (previous match)"],["/ <word>","Search for word"],["Q","To quit"]]}, {t:"code", code:"man passwd\nman 5 passwd", lang:"bash"}]
        },
        {
          id: "1-october-tuesday-manual-page-lookups",
          title: "1 October (Tuesday) — Manual Page Lookups",
          icon: "eye",
          blocks: [{t:"text", html:"<p>Manual page needed to update: <code>mandb</code></p>"}, {t:"text", html:"<p>What is <code>man passwd</code> ~ Word</p>"}, {t:"code", code:"man -k passwd", lang:"bash"}, {t:"text", html:"<p><code>man -w passwd</code> = Where is to all page. First one <em>(كلمتين)</em>.</p>"}, {t:"text", html:"<p>Get the first location (if it not press Q) and it asks you if you want to see the next page -> press Enter.</p>"}, {t:"text", html:"<p>What if the change in file name? It will not get it.</p>"}, {t:"text", html:"<p>It also returns Path.</p>"}, {t:"text", html:"<p>نمشي بالترتيب</p>"}, {t:"text", html:"<p>Page 1</p>"}, {t:"code", code:"Command --help", lang:"bash"}, {t:"text", html:"<p>Return option only.</p>"}, {t:"text", html:"<p>But if you want description:</p>"}, {t:"text", html:"<p><code>man</code> -> It's like documentation.</p>"}]
        }
      ]
    }
  },
  lab: {
    day: 1,
    title: "Lab 1 — Get Started with RHEL & Files",
    intro: "Hands-on tasks built from Day 1 canonical + provenance notes. Tick when done.",
    tasks: [
      { id:"less-vs-more-0", tag:"`less` vs `more`", title:"`less` vs `more`", objective:"Both commands display text one screen at a time, but less provides more flexible navigation.", steps:["more /etc/passwd","less /etc/passwd"]},
      { id:"cat-vs-more-1", tag:"`cat` vs `more`", title:"`cat` vs `more`", objective:"cat normally prints the entire file directly to standard output, while more pauses after each screen.", steps:["cat /etc/passwd","more /etc/passwd"]},
      { id:"rm-vs-rmdir-2", tag:"`rm` vs `rmdir`", title:"`rm` vs `rmdir`", objective:"The manual pages show that the commands have different purposes:", steps:["man rm","man rmdir","rm removes files and can remove directories when used with the appropriate recursive option.","rmdir removes empty directories.","rmdir is therefore more restrictive than rm.","rm file1","rmdir dir1","rm -r dir1"]},
      { id:"create-and-manipulat-3", tag:"Create and manipulat", title:"Create and manipulate the hierarchy", objective:"The intended hierarchy can be created under the home directory with:", steps:["~/dir1/","├── docs/","│   ├── dir11/","│   └── dir12/","└── mycv","cd ~","mkdir -p dir1/docs/dir11 dir1/docs/dir12","touch dir1/mycv"]},
      { id:"copy-etc-passwd-to-t-4", tag:"Copy `/etc/passwd` t", title:"Copy `/etc/passwd` to the home directory as `mypasswd`", objective:"Verify:", steps:["cp /etc/passwd ~/mypasswd","ls -l ~/mypasswd"]},
      { id:"rename-mypasswd-to-o-5", tag:"Rename `mypasswd` to", title:"Rename `mypasswd` to `oldpasswd`", objective:"Use mv:", steps:["mv ~/mypasswd ~/oldpasswd","ls -l ~/oldpasswd"]},
      { id:"four-ways-to-go-from-6", tag:"Four ways to go from", title:"Four ways to go from `/usr/bin` to the home directory", objective:"Assuming the home directory is /home/user:", steps:["cd","cd ~","cd \"$HOME\"","cd /home/user"]},
      { id:"list-commands-in-usr-7", tag:"List commands in `/u", title:"List commands in `/usr/bin` beginning with `w`", objective:"For a cleaner command-only list:", steps:["ls /usr/bin/w*","find /usr/bin -maxdepth 1 -type f -name 'w*' -printf '%f\\n'"]},
      { id:"display-the-first-4--8", tag:"Display the first 4 ", title:"Display the first 4 lines of `/etc/passwd`", objective:"Equivalent short form:", steps:["head -n 4 /etc/passwd","head -4 /etc/passwd"]},
      { id:"display-the-last-7-l-9", tag:"Display the last 7 l", title:"Display the last 7 lines of `/etc/passwd`", objective:"Equivalent short form:", steps:["tail -n 7 /etc/passwd","tail -7 /etc/passwd"]}
    ]
  },
  labs: {
    day1: {
      title: "Lab 1 — Get Started with RHEL & Files",
      subtitle: "Practical exercises for Day 1",
      tasks: [
      { id:"less-vs-more-0", tag:"`less` vs `more`", title:"`less` vs `more`", objective:"Both commands display text one screen at a time, but less provides more flexible navigation.", steps:["more /etc/passwd","less /etc/passwd"]},
      { id:"cat-vs-more-1", tag:"`cat` vs `more`", title:"`cat` vs `more`", objective:"cat normally prints the entire file directly to standard output, while more pauses after each screen.", steps:["cat /etc/passwd","more /etc/passwd"]},
      { id:"rm-vs-rmdir-2", tag:"`rm` vs `rmdir`", title:"`rm` vs `rmdir`", objective:"The manual pages show that the commands have different purposes:", steps:["man rm","man rmdir","rm removes files and can remove directories when used with the appropriate recursive option.","rmdir removes empty directories.","rmdir is therefore more restrictive than rm.","rm file1","rmdir dir1","rm -r dir1"]},
      { id:"create-and-manipulat-3", tag:"Create and manipulat", title:"Create and manipulate the hierarchy", objective:"The intended hierarchy can be created under the home directory with:", steps:["~/dir1/","├── docs/","│   ├── dir11/","│   └── dir12/","└── mycv","cd ~","mkdir -p dir1/docs/dir11 dir1/docs/dir12","touch dir1/mycv"]},
      { id:"copy-etc-passwd-to-t-4", tag:"Copy `/etc/passwd` t", title:"Copy `/etc/passwd` to the home directory as `mypasswd`", objective:"Verify:", steps:["cp /etc/passwd ~/mypasswd","ls -l ~/mypasswd"]},
      { id:"rename-mypasswd-to-o-5", tag:"Rename `mypasswd` to", title:"Rename `mypasswd` to `oldpasswd`", objective:"Use mv:", steps:["mv ~/mypasswd ~/oldpasswd","ls -l ~/oldpasswd"]},
      { id:"four-ways-to-go-from-6", tag:"Four ways to go from", title:"Four ways to go from `/usr/bin` to the home directory", objective:"Assuming the home directory is /home/user:", steps:["cd","cd ~","cd \"$HOME\"","cd /home/user"]},
      { id:"list-commands-in-usr-7", tag:"List commands in `/u", title:"List commands in `/usr/bin` beginning with `w`", objective:"For a cleaner command-only list:", steps:["ls /usr/bin/w*","find /usr/bin -maxdepth 1 -type f -name 'w*' -printf '%f\\n'"]},
      { id:"display-the-first-4--8", tag:"Display the first 4 ", title:"Display the first 4 lines of `/etc/passwd`", objective:"Equivalent short form:", steps:["head -n 4 /etc/passwd","head -4 /etc/passwd"]},
      { id:"display-the-last-7-l-9", tag:"Display the last 7 l", title:"Display the last 7 lines of `/etc/passwd`", objective:"Equivalent short form:", steps:["tail -n 7 /etc/passwd","tail -7 /etc/passwd"]}
      ]
    },
    day2: {
      title: "Lab 2 — Help, Text Files & Users",
      subtitle: "Practical exercises for Day 2",
      tasks: [
      { id:"display-the-passwd-c-0", tag:"Display the `passwd`", title:"Display the `passwd` command and file manual pages sequentially", objective:"The passwd command has a section 1 manual entry, while the /etc/passwd file is documented in section 5.", steps:["man passwd","man 5 passwd","man passwd; man 5 passwd"]},
      { id:"display-the-manual-p-1", tag:"Display the manual p", title:"Display the manual page for the `passwd` file", objective:"The password database format is documented in section 5:", steps:["man 5 passwd"]},
      { id:"find-commands-whose--2", tag:"Find commands whose ", title:"Find commands whose manual pages contain `passwd`", objective:"Use man -k, which searches manual-page descriptions and keywords:", steps:["man -k passwd","apropos passwd"]},
      { id:"create-a-user-accoun-3", tag:"Create a user accoun", title:"Create a user account", objective:"The requested account is:", steps:["Username: Islam","Password: Islam","sudo useradd -m Islam","sudo passwd Islam","Islam","id Islam"]},
      { id:"search-manual-pages--4", tag:"Search manual pages ", title:"Search manual pages mentioning `password`", objective:"Use:", steps:["man -k password"]},
      { id:"create-notes-txt-usi-5", tag:"Create `notes.txt` u", title:"Create `notes.txt` using Vim", objective:"Open the file:", steps:["vim ~/notes.txt","Press i to enter Insert mode.","Type your full name.","Press Esc to return to Command mode.","Type:",":wq","Press Enter."]},
      { id:"display-notes-txt-6", tag:"Display `notes.txt`", title:"Display `notes.txt`", objective:"Use:", steps:["cat ~/notes.txt"]},
      { id:"append-aiops-without-7", tag:"Append `AIOPS` witho", title:"Append `AIOPS` without opening an editor", objective:"Use echo with the append operator:", steps:["echo \"AIOPS\" >> ~/notes.txt","cat ~/notes.txt","> overwrites the file.",">> appends to the existing content."]},
      { id:"redirect-ls-l-etc-in-8", tag:"Redirect `ls -l /etc", title:"Redirect `ls -l /etc` into `etc_listing.txt`", objective:"Run:", steps:["ls -l /etc > ~/etc_listing.txt","ls -l ~/etc_listing.txt","cat ~/etc_listing.txt","ls -l /etc","│","▼","etc_listing.txt"]},
      { id:"safely-inspect-which-9", tag:"Safely inspect which", title:"Safely inspect which users have sudo privileges", objective:"The lab asks you to determine which user is configured to run commands through sudo.", steps:["sudo visudo -c","sudo grep -vE '^[[:space:]]*(#|$)' /etc/sudoers","sudo grep -R -vE '^[[:space:]]*(#|$)' /etc/sudoers.d/","%sudo ALL=(ALL:ALL) ALL","groups","sudo -l -U username"]},
      { id:"switch-to-root-with--10", tag:"Switch to root with ", title:"Switch to root with `su -`", objective:"Run:", steps:["su -","whoami","root","exit","whoami"]},
      { id:"create-steps-txt-in--11", tag:"Create `steps.txt` i", title:"Create `steps.txt` in Vim and save without exiting", objective:"Open the file:", steps:["vim ~/steps.txt","i","Welcome to AIOPS Training","This course covers Vim","Esc",":w"]},
      { id:"search-for-the-vim-l-12", tag:"Search for the Vim l", title:"Search for the Vim line and replace `raining` with `Course`", objective:"The lab wording appears to contain a typo:", steps:["search for Vim return raining","This course covers Vim",":%s/raining/Course/g",":%s/Vim/Course/g","/raining"]},
      { id:"copy-the-current-lin-13", tag:"Copy the current lin", title:"Copy the current line, paste it below, then save and exit", objective:"In Vim Command mode:", steps:["yy","p",":wq","Esc → yy → p → :wq → Enter","Manual pages are divided into sections, and man 5 passwd refers to the passwd file format, not the passwd command.","man -k searches the manual database by keyword.",">> appends data, while > redirects output and overwrites the destination file.","Vim separates Insert mode from Command mode."]}
      ]
    }
  },
  topicIndex: [
    { title:"Linux Origins & Distributions", desc:"History, distros, why Linux", links:[{"label":"Day 1 · Origins","view":"day1-content"},{"label":"Rahma · Concepts","view":"notes-rahma"}]},
    { title:"Kernel, Shell & Swap", desc:"Kernel vs shell, swap, VM", links:[{"label":"Day 1 · Components","view":"day1-content"},{"label":"Rahma · VM Network","view":"notes-rahma"}]},
    { title:"Filesystem Hierarchy", desc:"FHS, /etc /var /home", links:[{"label":"Day 1 · FHS","view":"day1-content"},{"label":"Michael · Navigation","view":"notes-michael"}]},
    { title:"File Operations", desc:"cd, ls, mkdir, cp, mv, rm", links:[{"label":"Day 1 · File Mgmt","view":"day1-content"},{"label":"Hager · File Mgmt","view":"notes-hager"}]},
    { title:"Inodes & Links", desc:"Inodes, hard vs soft links", links:[{"label":"Day 1 · Links","view":"day1-content"},{"label":"Michael · Inodes","view":"notes-michael"}]},
    { title:"Pattern Matching & grep", desc:"Glob, regex, grep, cut", links:[{"label":"Day 1 · Pattern","view":"day1-content"},{"label":"Sagda · Redirection","view":"notes-sagda"}]},
    { title:"Man Pages & Help", desc:"man sections, whatis, mandb", links:[{"label":"Day 2 · Get Help","view":"day2-content"},{"label":"Sagda · Man Pages","view":"notes-sagda"}]},
    { title:"Redirection & Pipelines", desc:"FD 0/1/2, >, >>, |, wc", links:[{"label":"Day 2 · Redirection","view":"day2-content"},{"label":"Mohammed · Pipelines","view":"notes-tarek"}]},
    { title:"Vim / Vi", desc:"Modes, save/quit, search/replace", links:[{"label":"Day 2 · Vim","view":"day2-content"},{"label":"Sagda · Vim","view":"notes-sagda"}]},
    { title:"Users, Groups & Passwords", desc:"UID, /etc/passwd, chage, su/visudo", links:[{"label":"Day 2 · Users","view":"day2-content"},{"label":"Sagda · Users","view":"notes-sagda"}]}
  ],
  flashcards: [
    {q:"What's the key difference between monolithic and microservices architecture when one service fails?", a:"In a monolithic architecture, if one service fails, all services go down. In microservices, if one service goes down, the rest of the services remain up."},
    {q:"What role does a Load Balancer play, and what does RabbitMQ do?", a:"A Load Balancer balances traffic across services, while RabbitMQ acts as a queue for services."},
    {q:"Why would you activate Swap (Virtual Memory), and give an example?", a:"To avoid system crashes — for example, activating Swap when uploading on AWS."},
    {q:"What's the core difference between Linux and Unix in terms of source model?", a:"Linux is open source — customizable (including UI), no license, open to the public, and free (though some editions are licensed with nuances). Unix is closed source — private to its developers and not customizable."},
    {q:"Who is the GPL (General Public License) associated with?", a:"Richard Stallman."},
    {q:"What network type should you choose when setting up VMware, per these notes?", a:"NAT."},
    {q:"What does `ifconfig` do, and is it needed on Ubuntu?", a:"It returns the IP address; this step can be skipped for Ubuntu."},
    {q:"What is the correct way to combine CLI options, and which format is incorrect?", a:"`-l -d` and `-ld` are both correct ways to combine options; `-l d` is incorrect."},
    {q:"What do `Ctrl+U` and `Ctrl+K` do in the terminal?", a:"`Ctrl+U` deletes the part of the command before the cursor; `Ctrl+K` deletes the part of the command after the cursor."},
    {q:"What do `!500` and `!!` do in shell history?", a:"`!500` runs command number 500 from history; `!!` runs the last command in history."},
    {q:"What's the difference between `/bin` and `/sbin` per these notes?", a:"`/bin` is regular user data related (\"shortcut\"/\"symbolic link\"), while `/sbin` is super user data related (\"shortcut\"/\"soft link\")."},
    {q:"How often do `/tmp` and `/var/tmp` clear, and what do they have in common?", a:"`/tmp` clears every 10 days, and `/var/tmp` clears every 30 days; both are caches."},
    {q:"What does `~` refer to in the shell prompt, for a regular user vs. root?", a:"`~` refers to the home directory — `/home/regularuser` for a regular user, and `/root` for the root user."},
    {q:"What's the difference between `cd -` and `cd ..`?", a:"`cd -` moves one step backwards to the previous directory; `cd ..` moves up one level in the directory tree (relative path)."},
    {q:"What does `ls -lthr` do?", a:"Produces a long-format, human-readable listing sorted by time, in reversed order."},
    {q:"What's the difference between `rm -r dir1` and `rm -fr dir1`?", a:"`rm -r dir1` removes a directory recursively but asks to verify first; `rm -fr dir1` removes it recursively without asking for confirmation."},
    {q:"What's the difference between `cat` and `less` for viewing file content?", a:"`cat` lists the full content of the file at once, while `less` is more organized and allows scrolling, using `Space` to move to the next page."},
    {q:"What's the difference between a soft link and a hard link in terms of inode and size?", a:"A soft link has a different inode from the source and is just a pointer, so its size is unrelated to the original file's size. A hard link shares the same inode as the source, and its file size matches the source file's size."},
    {q:"What does `ls -i` show?", a:"It displays the inode numbers of files."},
    {q:"What does `grep -l Karim /etc/passwd` return if \"Karim\" is not found in the file?", a:"It returns nothing (no output), since `-l` only returns the file path when a match is found."},
    {q:"What does the pattern `grep ^c..t$ /etc/passwd` match?", a:"Lines that start with 'c' and end with 't', with exactly 2 letters in between."},
    {q:"What's the difference between an absolute path and a relative path?", a:"An absolute path is defined from the root directory `/` (e.g., `/usr/share/doc/`), while a relative path is defined relative to the current directory (e.g., `..`, `doc/`)."},
    {q:"What's the difference between `~` and `/home/`?", a:"`~` represents the home directory of the currently logged-in user (e.g., `/home/omar` or `/root`), while `/home/` is the base directory housing all individual user home folders."},
    {q:"What does `cd -` do?", a:"Switches back to the previous working directory."},
    {q:"How do you identify a directory, a regular file, and a symbolic link in `ls -l` output?", a:"`d` marks a directory, `-` marks a regular file, and `l` marks a symbolic link."},
    {q:"What does `ls -li` show that plain `ls -l` doesn't?", a:"It additionally displays the inode numbers of the files."},
    {q:"What does `mkdir -p dir1/dir2/dir3` do differently from plain `mkdir`?", a:"The `-p` (parent) flag creates the full nested directory structure recursively, creating any missing parent directories along the way."},
    {q:"What's the difference between `cp -r /etc/ /home/` and `cp -r /etc/* /home/`?", a:"`cp -r /etc/ /home/` copies the `/etc/` directory itself (with its contents) into `/home/`, while `cp -r /etc/* /home/` copies only the contents inside `/etc/` into `/home/`."},
    {q:"What is the danger of running `rm -rf /`?", a:"It forcefully and recursively deletes the entire system, and this action is irreversible."},
    {q:"What does `alias rm='rm -i'` do, and why does root use it by default?", a:"It makes `rm` prompt for confirmation before deleting each file. The root user defaults to this for safety, since root has permission to delete anything without restriction."},
    {q:"What is an inode?", a:"An index node storing metadata about a file, such as file size, permissions, owner, timestamps, and block pointers, stored in the Inode Table."},
    {q:"What's the difference between a hard link and a soft link if the source file is deleted?", a:"A hard link still works because it points to the same inode as the source file, so the data remains accessible. A soft link breaks because it only points to the target filename/path, producing an error when accessed."},
    {q:"Can hard links be created for directories or across different filesystems?", a:"No — hard links cannot link directories and cannot be created across different filesystems/partitions. Soft links support both."},
    {q:"What does `grep -v nologin /etc/passwd` do?", a:"Prints only the lines that do NOT contain \"nologin\" (inverted match)."},
    {q:"What's the difference between `grep -A 2` and `grep -B 2`?", a:"`-A 2` shows the matching line plus 2 lines after it; `-B 2` shows the matching line plus 2 lines before it."},
    {q:"What does `grep -w shut /etc/passwd` match that plain `grep shut` would not?", a:"It matches only the whole word `shut`, not `shut` as a substring inside a longer word."},
    {q:"What does `grep -e omar -e root /etc/passwd` do?", a:"Searches for multiple patterns simultaneously — lines containing `omar` OR `root`."},
    {q:"What does the regex `grep '^c[aou]t$' /usr/share/dict/words` match?", a:"Exact 3-letter words starting with `c`, followed by `a`, `o`, or `u`, and ending with `t` — e.g. `cat`, `cot`, `cut`."},
    {q:"What does `cut -d : -f 1,7 /etc/passwd` extract?", a:"Using `:` as the delimiter, it extracts fields 1 and 7 from each line — the username and the login shell."},
    {q:"What's the difference between `cut -c 1-5` and `cut -c 5-`?", a:"`cut -c 1-5` extracts characters from position 1 to 5, while `cut -c 5-` extracts characters from position 5 to the end of the line."},
    {q:"What are the three checked advantages of Linux over Windows in this sheet?", a:"Security, Stability, and Maintenance (Linux also runs on different hardware, is free & open source, easy to customize, has community support, and offers a different UI experience)."},
    {q:"What are the roles of the Kernel and the Shell in Linux architecture?", a:"The Kernel works directly with the hardware, while the Shell is the interface for interacting with the system through commands."},
    {q:"What is Swap used for?", a:"It uses part of the storage as additional memory when needed."},
    {q:"What do the `$` and `#` prompt symbols indicate?", a:"`$` indicates a regular user, and `#` indicates a superuser."},
    {q:"What is the basic command syntax in Linux, and can options be combined?", a:"`command option argument`, with spaces required between each part. Options can be combined, e.g. `ls -ld` is equivalent to `ls -l -d`."},
    {q:"What's the difference between `cd`, `cd ~`, `cd $HOME`, and `cd -`?", a:"`cd`, `cd ~`, and `cd $HOME` all go to the home directory; `cd -` goes back to the previous directory."},
    {q:"What does `ls -ltr` do compared to `ls -lt`?", a:"`ls -lt` sorts by time; `ls -ltr` sorts by time in reverse order."},
    {q:"How are hidden files identified in Linux?", a:"Files and directories starting with `.` are hidden."},
    {q:"What does the wildcard pattern `[!a-c]*` match?", a:"Files that do not start with `a`, `b`, or `c`."},
    {q:"What's the difference between `head -n N file` and `tail -n N file`?", a:"`head -n N file` shows the first N lines of a file, while `tail -n N file` shows the last N lines."},
    {q:"What do the `-r`/`-R` and `-f` options mean when used with commands like `cp` or `rm`?", a:"`-r`/`-R` means recursive (applies to directories and their contents), and `-f` means force (skips confirmation)."},
    {q:"What does `grep -B 2 hager dir` do?", a:"Shows the match for \"hager\" along with the 2 lines before each match."},
    {q:"What's the difference between `grep -i` and `grep -l`?", a:"`grep -i` makes the search case-insensitive; `grep -l` shows only the names of files containing the pattern, not the matching lines."},
    {q:"What is an inode, and how does it relate to hard links?", a:"An inode is allocated to every file or directory to store its metadata/data location. A hard link refers to the same inode as the original file — they share the same data."},
    {q:"Can a hard link point to a directory?", a:"No, a hard link cannot link directories."},
    {q:"When does the data of a hard-linked file actually get deleted?", a:"The data remains as long as at least one hard link to it still exists."},
    {q:"What does a soft link point to, as opposed to a hard link?", a:"A soft link points to a path, whereas a hard link points to the same inode/data as the original."},
    {q:"Is `/root` the same as `/home/root`?", a:"No — `/root` is the home directory of the superuser, and it is explicitly not the same as `/home/root`."},
    {q:"What is the purpose of `/etc` and `/var`?", a:"`/etc` holds configuration files; `/var` holds variable data, such as `/var/tmp`."},
    {q:"What do `Ctrl+K` and `Ctrl+U` do in the terminal?", a:"`Ctrl+K` cuts from the cursor to the end of the line; `Ctrl+U` cuts from the cursor to the beginning of the line."},
    {q:"Why do man pages have numbered sections, and what do sections 1, 5, and 8 document?", a:"Because some words (like \"passwd\") refer to more than one thing. Section 1 documents executable programs/user commands, section 5 documents file formats and configuration file structure, and section 8 documents system administration commands (root-level)."},
    {q:"What does `man passwd` show by default if you don't specify a section number?", a:"It shows the lowest-numbered match it finds, usually the command page (section 1)."},
    {q:"What's the difference between `man`, `whatis`, and `command --help`?", a:"`man command` gives full details, `whatis command` gives a one-line description, and `command --help` prints a condensed list of that command's available options."},
    {q:"What does `man -k \"keyword\"` do, and what does it rely on behind the scenes?", a:"It searches the short description line of every installed man page for the keyword and lists matching commands. It relies on the `mandb` search database, which may need to be built with `mandb` on a fresh system."},
    {q:"What does `whereis useradd` tell you?", a:"Whether the command exists on the machine and where its files are stored (binary, man page, and sometimes source files)."},
    {q:"What are the three data channels (streams) every Linux command is connected to, and their File Descriptor numbers?", a:"Standard Input (stdin, FD 0), Standard Output (stdout, FD 1), and Standard Error (stderr, FD 2)."},
    {q:"What's the difference between `>` and `>>`?", a:"`>` overwrites the target file's contents completely with no warning; `>>` appends new output to the end of the file without touching existing content."},
    {q:"What does `find / -name passwd 2> /dev/null` do?", a:"It searches the entire filesystem for \"passwd\" and discards only the error messages (like \"Permission denied\") by sending them to `/dev/null`, while successful results still print normally to the screen."},
    {q:"What's the difference between `&>` and `2>&1`?", a:"`&>` is a modern shorthand that sends both stdout and stderr into one file in a single symbol. `2>&1` is the traditional method that must come after a `>` redirection and works by pointing stderr (Channel 2) to wherever stdout (Channel 1) is already going."},
    {q:"What does the pipeline `ls -l | grep ^-` do?", a:"It lists files in long format, then filters to show only lines starting with `-`, which represents regular files (as opposed to `d` for directories or `l` for symbolic links)."},
    {q:"What three things does `wc` count, and in what order does it print them?", a:"Lines, words, and characters, always in that order."},
    {q:"What does `ls -R /etc | wc -l` tell you?", a:"The total number of files and folders inside `/etc` and all its subfolders combined, since `-R` makes the listing recursive and `wc -l` counts the resulting lines."},
    {q:"What are the four main modes in vim, and how do you enter each?", a:"Normal mode (default, entered by pressing `Esc`), Insert mode (press `i` from Normal mode), Visual mode (press `v` from Normal mode), and Command mode (press `:` from Normal mode)."},
    {q:"What's the difference between `:wq` and `:q!` in vim?", a:"`:wq` saves your changes and quits; `:q!` quits without saving, discarding all changes made since opening the file."},
    {q:"What's the difference between a shell variable and a user-defined variable in Bash?", a:"Shell variables (like `$PATH`, `$HOME`, `$USER`) are built into Bash automatically for configuration purposes. User-defined variables are ones you create yourself to temporarily store values during your session."},
    {q:"What does `export` do to a variable, and what happens without it?", a:"`export` makes a variable visible to any sub-shell opened afterward, with the same name and value. Without `export`, the variable stays trapped only in the current shell and sub-shells have no knowledge of it."},
    {q:"What are the three UID categories in Linux, and their ranges?", a:"Super user (root) is UID 0; system users are UID 1–999 (1–200 statically reserved, 201–999 dynamically assigned); regular users are UID 1000 and above."},
    {q:"What's the difference between `su - username` and `su username`?", a:"`su - username` fully loads that user's environment as if they logged in directly (home directory, shell config, PATH, last-login display). `su username` is a lighter switch that keeps your own current environment and directory."},
    {q:"Why should you use `visudo` instead of editing `/etc/sudoers` directly with vim?", a:"`visudo` opens the file in a protected session that checks syntax for errors before saving, refusing to save a broken version. Editing directly with vim risks a typo silently breaking the entire permissions system and locking out all administrators."},
    {q:"What does `find / -name <option>` do?", a:"Searches the entire system starting from root for files matching the given name."},
    {q:"What's the difference between FD1 and FD2?", a:"FD1 is standard output (std output), and FD2 is standard error (std Error)."},
    {q:"How do you redirect only the error output of a command, and how do you get both output and error separately?", a:"Use `2>` to redirect only the error stream; without specifying, a command's normal output goes to std output and only one stream is captured unless you redirect explicitly (e.g. `2>` for errors)."},
    {q:"What's the difference between `>` and `>>`?", a:"`>` overrides the destination file's contents, while `>>` appends to it instead of overwriting."},
    {q:"What is `/dev/null`?", a:"A special virtual device file that acts like a black hole for data — anything written to it disappears."},
    {q:"What are the main manual page sections mentioned?", a:"Section 1 is User Commands (regular page), Section 5 is Configuration files, and Section 8 is System Administrator commands."},
    {q:"What's the difference between `man -k passwd` and `man -w passwd`?", a:"`man -k passwd` searches man page descriptions for \"passwd\" as a keyword, while `man -w passwd` shows the location/path of the passwd man page."},
    {q:"What does `Command --help` return compared to `man Command`?", a:"`--help` returns only the options for the command, while `man` acts as full documentation/description."},
    {q:"What are the four Vim modes?", a:"Command Mode (default), Insert Mode (update), Visual Mode (select), and Ex/Command Line Mode."},
    {q:"How do you enter Insert Mode in Vim, and how do you exit any mode?", a:"Press `i` to enter Insert Mode; press `ESC` to exit back to Command Mode."},
    {q:"What's the difference between `:w`, `:wq`, `:q!`, and `:q`?", a:"`:w` saves and keeps the file open, `:wq` saves and quits, `:q!` quits without saving, and `:q` quits only if there are no unsaved changes (otherwise it prompts)."},
    {q:"What do `dd`, `yy`/`gy`, `p`, and `u` do in Vim?", a:"`dd` cuts/deletes a line, `yy` or `gy` copies a line, `p` pastes, and `u` undoes the last action."},
    {q:"What's the difference between `v`, `Shift+V`, and `Ctrl+v` in Vim's visual modes?", a:"`v` enters character-wise Visual Mode, `Shift+V` selects entire lines, and `Ctrl+v` selects a block/column *(لعمود)*."},
    {q:"What does the Vim command `:%s/login/nologin/g` do?", a:"It performs a global find-and-replace across the file, replacing every occurrence of \"login\" with \"nologin\"."},
    {q:"What does `:.! date` do in Vim?", a:"It runs the external `date` command and inserts its output, then returns to the same place in the file *(خارج ولكن يعود للمكان مره ثانيه)*."},
    {q:"What is a pipeline in Bash, and what does `ls -l | grep ^-` do?", a:"A pipeline passes the output of one command as input to another command. `ls -l | grep ^-` filters the long listing to show only regular files (lines starting with `-`)."},
    {q:"What do `wc -l`, `wc -w`, and `wc -c` count?", a:"`wc -l` counts lines only, `wc -w` counts words only, and `wc -c` counts characters only."},
    {q:"What does the search pattern `\\<th` match?", a:"Any word containing \"th\" (word-boundary search for \"th\")."},
    {q:"What does `whereis Command` do?", a:"Shows where a command's binary, source, and man page files are located."}
  ]
};

// ===== ICONS =====
// ===== ICONS =====
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
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>'
};

