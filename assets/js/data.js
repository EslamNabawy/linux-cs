
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
          id: "arch",
          title: "System Architecture & Concepts",
          icon: "cpu",
          blocks: [
            { t:"text", html:"<p>Before touching the command line, it helps to understand how Linux fits into modern infrastructure and how it relates to the systems around it.</p>" },
            { t:"text", html:"<h6>Monolithic vs Microservices</h6><p><strong>Monolithic:</strong> the whole application is built as a single, tightly coupled unit. If one part fails, the entire service can go down.</p><p><strong>Microservices:</strong> the application is split into small, independent services that talk over a network. If one service fails, only that piece is affected and the rest keep running.</p>" },
            { t:"table", head:["Approach","If one part fails","Example"], rows:[
              ["Monolithic","The entire application goes down","A single Java WAR file running everything"],
              ["Microservices","Only that service goes down","Separate auth, billing, and catalog services"]
            ]},
            { t:"callout", kind:"info", html:"<strong>Why it matters:</strong> Microservices scale independently and recover faster, which is why they dominate cloud-native Linux deployments." },
            { t:"text", html:"<h6>Load Balancer</h6><p>A load balancer spreads incoming network traffic across multiple servers so no single server is overwhelmed. It improves performance and availability.</p>" },
            { t:"text", html:"<h6>RabbitMQ</h6><p>RabbitMQ is a message broker: it lets applications exchange messages asynchronously (a producer sends, a consumer processes later) instead of calling each other directly. This decouples services.</p>" },
            { t:"text", html:"<h6>Virtual Memory &amp; Swap</h6><p>Virtual memory lets a system use disk space as an extension of RAM. <strong>Swap</strong> is a dedicated disk partition or file used when physical RAM is full, so the system does not immediately crash. It is slower than RAM.</p>" },
            { t:"callout", kind:"info", html:"<strong>Swap:</strong> when RAM is exhausted, inactive memory pages move to swap space. This prevents out-of-memory crashes but cannot replace real RAM." },
            { t:"text", html:"<h6>Linux vs Unix</h6><p>Linux is a Unix-like operating system created by Linus Torvalds in 1991. Unlike classic Unix, Linux is free and open source. Unix originated in the 1970s at Bell Labs.</p>" },
            { t:"table", head:["Distribution","Family","Notes"], rows:[
              ["RHEL","Fedora family","Enterprise, paid support; used in this course"],
              ["CentOS","RHEL rebuild","Free, community rebuild of RHEL"],
              ["Ubuntu","Debian family","Popular for servers and desktops"],
              ["Debian","Debian","Very stable, community driven"],
              ["Fedora","Fedora","Cutting-edge, upstream for RHEL"]
            ]},
            { t:"text", html:"<h6>GPL &amp; Richard Stallman</h6><p>Richard Stallman launched the free software movement and the GPL (General Public License). The GPL is a copyleft license: anyone can use, modify, and share the software, but derivative works must also stay free and open source.</p>" }
          ]
        },
        {
          id: "vmnet",
          title: "VM & Network Setup",
          icon: "network",
          blocks: [
            { t:"text", html:"<p>To practice Linux safely you usually run it inside a <strong>Virtual Machine (VM)</strong> using software such as VMware Workstation, VirtualBox, or KVM.</p>" },
            { t:"steps", items:[
              "Open your hypervisor and choose File → New Virtual Machine.",
              "Select Typical (recommended) configuration.",
              "Choose the installer (ISO image of RHEL / Ubuntu).",
              "Select the guest operating system type (Linux).",
              "Name the VM and choose where to store its disk files.",
              "Set the disk size and finish the wizard.",
              "Start the VM and complete the first-boot setup."
            ]},
            { t:"text", html:"<h6>Network Types</h6><p>The VM can be connected to the network in different ways, which changes whether it can reach your machine, the internet, or other VMs.</p>" },
            { t:"table", head:["Type","Behaviour","When to use"], rows:[
              ["Bridged","VM gets its own IP on your physical network","VM must act like a real machine on the LAN"],
              ["NAT","VM shares the host's IP to reach the internet","Default; VM is hidden behind the host"],
              ["Host-only","VM only talks to the host and other host-only VMs","Isolated lab network, no internet"]
            ]},
            { t:"text", html:"<h6>Red&nbsp;Hat Developer Account</h6><p>Register a free Red&nbsp;Hat Developer account to download RHEL and obtain a subscription for personal use and learning.</p>" },
            { t:"text", html:"<h6>Finding the IP &amp; Connecting</h6><p>Check the assigned IP with <code>ip a</code> (or <code>ip addr show</code>), then connect remotely with SSH:</p>" },
            { t:"code", code:"ip a\nssh username@192.168.1.50" }
          ]
        },
        {
          id: "cli",
          title: "Shell Prompt & CLI Syntax",
          icon: "eye",
          blocks: [
            { t:"text", html:"<p>The default shell on most Linux systems is <strong>bash</strong>. After login you see a <strong>prompt</strong> where you type commands. A prompt often looks like <code>user@host:~$</code>.</p>" },
            { t:"text", html:"<h6>Command Syntax</h6><p>Commands follow the pattern <code>command [options] [arguments]</code>. Items are separated by spaces. <strong>Options</strong> modify behaviour (usually starting with <code>-</code> or <code>--</code>); <strong>arguments</strong> are the targets such as file or directory names. Separate multiple commands with <code>;</code>.</p>" },
            { t:"code", code:"ls -l /etc\nls -la --human-readable /var" },
            { t:"text", html:"<p>Short options can be combined: <code>-l -a</code> becomes <code>-la</code>. Long options use two dashes, e.g. <code>--help</code>.</p>" },
            { t:"table", head:["Shortcut","Action"], rows:[
              ["Ctrl+U","Clear from cursor to the start of the line"],
              ["Ctrl+K","Clear from cursor to the end of the line"],
              ["Tab","Auto-complete command or path"],
              ["Up / Down arrows","Browse command history"],
              ["Ctrl+R","Search the command history"],
              ["Ctrl+L","Clear the screen (like clear)"],
              ["Ctrl+C","Cancel the current running command"]
            ]},
            { t:"callout", kind:"info", html:"<strong>Switching to root:</strong> use <code>su -</code> to start a login shell as the superuser. Be careful — as root you can damage the system." }
          ]
        },
        {
          id: "fhs",
          title: "File System Hierarchy",
          icon: "folder",
          blocks: [
            { t:"text", html:"<p>Everything in Linux is a file, and they are organised under a single root directory <code>/</code>. Understanding the standard layout helps you find configuration, logs, and binaries.</p>" },
            { t:"table", head:["Path","Purpose"], rows:[
              ["/","The root of the filesystem (top of the tree)"],
              ["/bin","Essential user command binaries (ls, cp, mv)"],
              ["/sbin","System binaries, mostly for administration"],
              ["/boot","Boot loader files and the kernel"],
              ["/etc","System-wide configuration files"],
              ["/dev","Device files (disks, terminals)"],
              ["/home","Personal directories for normal users"],
              ["/root","Home directory of the root (admin) user"],
              ["/run","Runtime data since last boot"],
              ["/tmp","Temporary files (cleared on reboot)"],
              ["/usr","User programs, libraries, documentation"],
              ["/var","Variable data such as logs and caches"]
            ]},
            { t:"callout", kind:"info", html:"<strong>/root vs /home:</strong> <code>/root</code> is the administrator's home; regular users live under <code>/home/username</code>." }
          ]
        },
        {
          id: "fmgmt",
          title: "File & Directory Management",
          icon: "file",
          blocks: [
            { t:"text", html:"<p>Move around and manage files with a small set of core commands.</p>" },
            { t:"table", head:["Command","Meaning"], rows:[
              ["pwd","Print the current working directory"],
              ["cd","Change directory (cd ~ home, cd / root, cd .. up, cd - previous)"],
              ["ls","List directory contents"],
              ["tree","Show the directory tree visually"],
              ["mkdir","Create a directory (mkdir -p makes parents)"],
              ["touch","Create an empty file or update its timestamp"],
              ["cp","Copy files or directories (cp -r recursive)"],
              ["mv","Move or rename files/directories"],
              ["rm","Remove files (rm -r recursive, rm -f force)"]
            ]},
            { t:"code", code:"cd /var/log\nls -lh\nmkdir -p ~/project/data\ntouch ~/project/readme.txt" },
            { t:"callout", kind:"warn", html:"<strong>Danger:</strong> <code>rm -rf /</code> or <code>rm -rf *</code> deletes irreversibly and can wipe the system. Always double-check the path before pressing Enter." },
            { t:"text", html:"<h6>Viewing File Content</h6><p>Use <code>cat</code> (whole file), <code>less</code> (scrollable), <code>head</code> (first lines), and <code>tail</code> (last lines, useful for logs with <code>-f</code>).</p>" }
          ]
        },
        {
          id: "links",
          title: "Links",
          icon: "folder",
          blocks: [
            { t:"text", html:"<p>Linux supports two ways to reference the same data: <strong>soft (symbolic)</strong> links and <strong>hard</strong> links. They behave very differently when the original file is deleted.</p>" },
            { t:"diagram", kind:"links" },
            { t:"table", head:["Feature","Soft Link (ln -s)","Hard Link (ln)"], rows:[
              ["Points to","A file path (name)","The inode (physical disk data)"],
              ["If original deleted","Link breaks (dangling)","Link still works"],
              ["Can link directories?","Yes","No"],
              ["Cross file system?","Yes","No"],
              ["Command","ln -s target link","ln target link"]
            ]},
            { t:"callout", kind:"info", html:"<strong>When to use:</strong> use a soft link to point across file systems or to a directory; use a hard link when you need the data to survive deletion of the original name." }
          ]
        },
        {
          id: "search",
          title: "Search & Pattern Matching",
          icon: "search",
          blocks: [
            { t:"text", html:"<p>Wildcards (glob patterns) let one command act on many files at once.</p>" },
            { t:"table", head:["Pattern","Matches"], rows:[
              ["*","Zero or more characters (all files)"],
              ["?","Exactly one character"],
              ["[abc]","Any one of the listed characters"],
              ["[a-z]","Any character in the range"]
            ]},
            { t:"code", code:"ls *.txt\nrm log?.log\ncp file[1-3].dat /backup/" },
            { t:"text", html:"<p><strong>grep</strong> searches inside files for lines matching a pattern.</p>" },
            { t:"table", head:["Option","Meaning"], rows:[
              ["-i","Ignore case"],
              ["-n","Show line numbers"],
              ["-r","Search recursively through directories"],
              ["-v","Invert: show non-matching lines"],
              ["-l","Show only file names that match"]
            ]},
            { t:"code", code:"grep -i root /etc/passwd\ngrep -rn 'TODO' ./src" },
            { t:"callout", kind:"info", html:"<strong>Pipelines:</strong> combine commands with <code>|</code>, e.g. <code>dmesg | grep -i error</code> to filter the kernel log." }
          ]
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
          id: "nav",
          title: "Directory Navigation & Paths",
          icon: "folder",
          blocks: [
            { t:"text", html:"<p><strong>pwd</strong> (print working directory) shows where you are. Paths are either <strong>absolute</strong> (starting from <code>/</code>) or <strong>relative</strong> (starting from the current directory).</p>" },
            { t:"table", head:["Command","Meaning"], rows:[
              ["cd","Change to your home directory"],
              ["cd ~","Same as home (the ~ means your home)"],
              ["cd /","Go to the filesystem root"],
              ["cd ..","Move up one level"],
              ["cd -","Return to the previous directory"],
              ["cd .","Stay in the current directory"]
            ]},
            { t:"arabic", text:"cd - : ترجعك لآخر مكان كنت فيه (takes you back to the last place you were)" },
            { t:"text", html:"<p><code>~</code> is a shortcut for <code>/home/username</code>. For example, <code>cd ~/Documents</code> goes to <code>/home/username/Documents</code>.</p>" },
            { t:"code", code:"pwd\ncd /var/www\ncd ~/Downloads\ncd -" }
          ]
        },
        {
          id: "listing",
          title: "Listing & File Inspection",
          icon: "eye",
          blocks: [
            { t:"text", html:"<p><strong>ls</strong> lists directory contents. <strong>dir</strong> is nearly identical to <code>ls</code>; <strong>tree</strong> draws the hierarchy.</p>" },
            { t:"table", head:["Option","Meaning"], rows:[
              ["-l","Long listing (permissions, size, owner, date)"],
              ["-a","Show all, including hidden files (starting with .)"],
              ["-h","Human-readable sizes (K, M, G)"],
              ["-t","Sort by modification time"],
              ["-r","Reverse the sort order"],
              ["-R","List recursively (sub-directories too)"]
            ]},
            { t:"code", code:"ls -la /etc\nls -lhtr\nls -R ~/project" },
            { t:"text", html:"<p>Combine <code>ls</code> with wildcards to filter what is shown.</p>" },
            { t:"arabic", text:"ls -a : بيوريك كل الملفات حتى اللي مخفية (shows all files, even hidden ones)" },
            { t:"callout", kind:"info", html:"<strong>Hidden files:</strong> any file or directory whose name starts with a dot (<code>.bashrc</code>) is hidden and only appears with <code>-a</code>." }
          ]
        },
        {
          id: "fmgmt",
          title: "File & Directory Management",
          icon: "file",
          blocks: [
            { t:"table", head:["Command","Meaning"], rows:[
              ["touch file","Create an empty file / update timestamp"],
              ["mkdir -p a/b","Create nested directories in one go"],
              ["cp src dest","Copy a file"],
              ["cp -r dir dest","Copy a directory recursively"],
              ["mv src dest","Move or rename"],
              ["rm file","Remove a file"],
              ["rm -r dir","Remove a directory recursively"]
            ]},
            { t:"code", code:"touch notes.txt\nmkdir -p project/data\ncp notes.txt project/data/\nmv notes.txt project/notes_v2.txt" },
            { t:"callout", kind:"warn", html:"<strong>Never run:</strong> <code>rm -rf /</code> or <code>rm -rf *</code> as root — it deletes everything under that path with no confirmation." },
            { t:"text", html:"<p>Some systems add safety: <code>rm</code> may be aliased to <code>rm -i</code> (asks before each delete), and <code>--preserve-root</code> protects <code>/</code> from being removed.</p>" },
            { t:"arabic", text:"rm -rf * : يمسح كل الملفات في المكان الحالي نهائيًا (deletes all files in the current place permanently)" }
          ]
        },
        {
          id: "inodes",
          title: "Inodes & Links",
          icon: "folder",
          blocks: [
            { t:"text", html:"<p>Every file is described by an <strong>inode</strong> — a data structure holding metadata (permissions, owner, disk location). A file's name is just a link to its inode.</p>" },
            { t:"table", head:["Feature","Soft Link","Hard Link"], rows:[
              ["What it points to","The file name / path","The inode (data)"],
              ["If original is deleted","Breaks (invalid)","Keeps working"],
              ["Can cross file systems?","Yes","No"],
              ["Can link directories?","Yes","No (files only)"]
            ]},
            { t:"code", code:"ln -s /var/log/app.log ~/app_link   # soft\nln /var/log/app.log ~/app_hard   # hard\nls -li ~/app_link ~/app_hard" },
            { t:"arabic", text:"الـ inode هو رقم يعرّف الملف نفسه على القرص (the inode is the number that identifies the file itself on disk)" },
            { t:"callout", kind:"info", html:"<strong>Restriction:</strong> you cannot create a hard link to a directory, and hard links cannot span different file systems." }
          ]
        },
        {
          id: "grep",
          title: "Text Searching (grep & regex)",
          icon: "search",
          blocks: [
            { t:"text", html:"<p><strong>grep</strong> prints lines that match a pattern. With regular expressions you can match flexible patterns.</p>" },
            { t:"table", head:["Option","Meaning"], rows:[
              ["-i","Ignore case"],
              ["-v","Invert match (show non-matching lines)"],
              ["-n","Show line numbers"],
              ["-r","Recursive through directories"],
              ["-l","Only file names that match"],
              ["-c","Count of matching lines"],
              ["-w","Match whole words only"]
            ]},
            { t:"text", html:"<h6>Common Regex Symbols</h6><p><code>.</code> any character, <code>^</code> start of line, <code>$</code> end of line, <code>[]</code> a set, <code>*</code> zero or more of the previous.</p>" },
            { t:"code", code:"grep -in 'error' /var/log/syslog\ngrep -rn 'function' ./src\ngrep -E '^#?[a-z]+:' config.yml" },
            { t:"arabic", text:"grep -i : يدور وبتجاهل حالة الأحرف (search while ignoring upper/lower case)" }
          ]
        },
        {
          id: "cut",
          title: "Text Processing (cut)",
          icon: "file",
          blocks: [
            { t:"text", html:"<p><strong>cut</strong> extracts sections from each line of a file — by character position or by field using a delimiter.</p>" },
            { t:"table", head:["Option","Meaning"], rows:[
              ["-c 1-5","Characters from position 1 to 5"],
              ["-f 2","Field number 2"],
              ["-d ':'","Use : as the field delimiter"],
              ["-f 1,3","Fields 1 and 3"]
            ]},
            { t:"code", code:"cut -d ':' -f 1 /etc/passwd\ncut -c 1-10 file.txt\ncut -d ',' -f 2,4 data.csv" },
            { t:"callout", kind:"info", html:"<strong>Tip:</strong> <code>cut</code> is often combined with <code>grep</code> and <code>|</code> to extract just the column you need from command output." }
          ]
        }
      ]
    },
    hager: {
      author: "Hager",
      day: 1,
      subtitle: "Linux Session — Revision Sheet (18 Aug 2026)",
      avatar: "H",
      sections: [
        {
          id: "basics",
          title: "Linux Basics",
          icon: "cpu",
          blocks: [
            { t:"text", html:"<p>Linux is a free, open-source, Unix-like operating system known for stability and security.</p>" },
            { t:"table", head:["Linux","Windows"], rows:[
              ["Open source & free","Mostly proprietary & paid"],
              ["Highly customizable","Limited customization"],
              ["Strong security model","Different permission model"],
              ["Excellent for servers","Common on desktops"],
              ["Runs on many architectures","Mostly x86 PCs"]
            ]},
            { t:"diagram", kind:"architecture" },
            { t:"text", html:"<p>When you type a command, it flows: <strong>CLI → Shell → Applications → Kernel → Hardware</strong>.</p>" },
            { t:"text", html:"<h6>Swap</h6><p>Swap is disk space used as extra memory when RAM is full, preventing the system from crashing. It is much slower than real RAM.</p>" },
            { t:"callout", kind:"info", html:"<strong>Why swap:</strong> it gives the kernel breathing room under memory pressure, though heavy swap use (thrashing) slows the machine down." }
          ]
        },
        {
          id: "users",
          title: "Users & Privileges",
          icon: "folder",
          blocks: [
            { t:"table", head:["Prompt","Meaning"], rows:[
              ["$","Normal user (limited privileges)"],
              ["#","Root / superuser (full control)"]
            ]},
            { t:"text", html:"<p>Use <code>su</code> to switch user and <code>sudo</code> to run a single command as root. The <code>#</code> prompt means you can damage the system, so be careful.</p>" },
            { t:"code", code:"whoami\nsu -\nsudo systemctl restart sshd" }
          ]
        },
        {
          id: "syntax",
          title: "Command Syntax",
          icon: "eye",
          blocks: [
            { t:"text", html:"<p>Every command follows: <code>command [option] [argument]</code>. Options change behaviour; arguments tell it what to act on.</p>" },
            { t:"diagram", kind:"syntax" }
          ]
        },
        {
          id: "nav",
          title: "Navigation",
          icon: "folder",
          blocks: [
            { t:"table", head:["Command","Description"], rows:[
              ["pwd","Print working directory"],
              ["cd","Change directory"],
              ["cd ~","Go to home directory"],
              ["cd /","Go to root"],
              ["cd ..","Go up one level"],
              ["cd -","Go to previous directory"]
            ]}
          ]
        },
        {
          id: "listing",
          title: "Listing Files",
          icon: "eye",
          blocks: [
            { t:"table", head:["Command","Description"], rows:[
              ["ls","List files"],
              ["ls -l","Long format"],
              ["ls -a","Include hidden files"],
              ["ls -lh","Human-readable sizes"],
              ["ls -R","Recursive"]
            ]},
            { t:"table", head:["Wildcard","Matches"], rows:[
              ["*","Any characters"],
              ["?","Single character"],
              ["[abc]","One of a, b, or c"],
              ["[a-z]","A range of characters"]
            ]}
          ]
        },
        {
          id: "content",
          title: "File Content",
          icon: "file",
          blocks: [
            { t:"table", head:["Command","Description"], rows:[
              ["cat","Show entire file"],
              ["less","Scrollable view"],
              ["head","First 10 lines"],
              ["tail","Last 10 lines"],
              ["more","Page through file"],
              ["nl","Show with line numbers"],
              ["od","Octal/low-level dump"]
            ]}
          ]
        },
        {
          id: "fmgmt",
          title: "File & Directory Management",
          icon: "file",
          blocks: [
            { t:"table", head:["Command","Description"], rows:[
              ["touch","Create empty file"],
              ["mkdir","Create directory"],
              ["cp","Copy files/dirs"],
              ["mv","Move or rename"],
              ["rm","Remove files"],
              ["file","Detect file type"],
              ["nano","Simple text editor"],
              ["vi","Powerful modal editor"]
            ]},
            { t:"callout", kind:"warn", html:"<strong>Warning:</strong> <code>rm -rf</code> removes directories and contents permanently — verify the target first." }
          ]
        },
        {
          id: "grep",
          title: "Searching with grep",
          icon: "search",
          blocks: [
            { t:"table", head:["Option","Description"], rows:[
              ["-i","Ignore case"],
              ["-n","Show line numbers"],
              ["-r","Search recursively"],
              ["-v","Invert match"],
              ["-l","Only file names"],
              ["-c","Count matches"]
            ]},
            { t:"code", code:"grep -i 'error' /var/log/syslog\ngrep -rn 'main' ./src" }
          ]
        },
        {
          id: "links",
          title: "Links (Hard & Soft)",
          icon: "folder",
          blocks: [
            { t:"text", html:"<p>A <strong>soft link</strong> points to a file's name/path; a <strong>hard link</strong> points to the same inode. Deleting the original breaks a soft link but not a hard link.</p>" },
            { t:"diagram", kind:"links" },
            { t:"table", head:["Feature","Soft Link","Hard Link"], rows:[
              ["Points to","File name/path","Inode"],
              ["If original deleted","Breaks","Still works"],
              ["Directories?","Yes","No"],
              ["Cross file system?","Yes","No"]
            ]}
          ]
        },
        {
          id: "dirs",
          title: "Important Filesystem Directories",
          icon: "folder",
          blocks: [
            { t:"table", head:["Directory","Purpose"], rows:[
              ["/bin","Essential commands"],
              ["/boot","Boot files & kernel"],
              ["/etc","Configuration"],
              ["/home","User home dirs"],
              ["/root","Admin home"],
              ["/tmp","Temporary files"],
              ["/usr","User programs"],
              ["/var","Variable data / logs"],
              ["/dev","Device files"],
              ["/proc","Kernel & process info"],
              ["/mnt","Mount point"],
              ["/opt","Optional software"]
            ]}
          ]
        },
        {
          id: "shortcuts",
          title: "Terminal Keyboard Shortcuts",
          icon: "network",
          blocks: [
            { t:"table", head:["Shortcut","Action"], rows:[
              ["Ctrl+A","Start of line"],
              ["Ctrl+E","End of line"],
              ["Ctrl+U","Clear to start"],
              ["Ctrl+K","Clear to end"],
              ["Ctrl+R","Search history"],
              ["Ctrl+L","Clear screen"],
              ["Ctrl+C","Cancel command"],
              ["Ctrl+Z","Pause (background)"]
            ]}
          ]
        },
        {
          id: "quickref",
          title: "Quick Command Reference",
          icon: "file",
          blocks: [
            { t:"text", html:"<p>A compact cheat sheet drawn from the session. Combine with the Cheat Sheet view for the full list.</p>" },
            { t:"code", code:"pwd            # where am I\ncd ~          # go home\nls -la         # list all, long\nmkdir -p a/b   # nested dirs\ntouch f.txt    # new file\ncp f.txt b/    # copy\nmv f.txt g.txt # rename\nrm -r old/     # delete\ngrep -rin 'x' . # search" }
          ]
        }
      ]
    }
  },
  lab: {
    day: 1,
    title: "Lab 1 · Practice Tasks",
    intro: "These hands-on tasks are built from the Day 1 notes of Rahma, Michael, and Hager. Complete them on a real or virtual Linux machine (WSL, VirtualBox, or a cloud VM). Tick a task when you have done it.",
    tasks: [
      { id:"l1-arch", tag:"Concepts", title:"Explore the Architecture", objective:"See the CLI → Shell → Kernel → Hardware flow with your own eyes.", steps:[
        "Open a terminal.",
        "Run echo $SHELL to confirm your shell (likely /bin/bash).",
        "Run uname -r to see the kernel version.",
        "Run lscpu to inspect the CPU/Hardware.",
        "Sketch the flow: CLI → Shell → Applications → Kernel → Hardware."
      ]},
      { id:"l1-nav", tag:"Navigation", title:"Navigate the Filesystem", objective:"Get comfortable moving around with cd and pwd.", steps:[
        "Run pwd to see your starting location.",
        "Run cd / then pwd — you are now at the root.",
        "Run cd ~ then pwd — back to your home.",
        "Run cd - to jump to the previous directory.",
        "Run cd .. a couple of times and watch pwd change."
      ]},
      { id:"l1-files", tag:"File Mgmt", title:"Manage Files & Directories", objective:"Create, copy, move, and remove files safely.", steps:[
        "Create a project tree: mkdir -p project/data.",
        "Add a file: touch project/readme.txt.",
        "Copy it: cp project/readme.txt project/data/.",
        "Rename: mv project/readme.txt project/README.md.",
        "Remove the data folder: rm -r project/data (verify first!)."
      ]},
      { id:"l1-links", tag:"Links", title:"Hard vs Soft Links Lab", objective:"Observe how each link behaves when the original is deleted.", steps:[
        "Create a file: echo 'hello' > original.txt.",
        "Make a soft link: ln -s original.txt soft.txt.",
        "Make a hard link: ln original.txt hard.txt.",
        "Compare inodes with ls -li.",
        "Delete the original: rm original.txt, then cat soft.txt (breaks) and cat hard.txt (works)."
      ]},
      { id:"l1-grep", tag:"grep", title:"Search with grep & Wildcards", objective:"Filter files and file contents.", steps:[
        "List only text files: ls *.txt.",
        "Search a file for a word: grep -in 'root' /etc/passwd.",
        "Recursively search code: grep -rn 'main' ./src.",
        "Invert a match: grep -v '^#' config.file to hide comments."
      ]},
      { id:"l1-users", tag:"Users", title:"Users & Privileges", objective:"Understand the $ vs # prompt.", steps:[
        "Run whoami to see your current user.",
        "Run id to see your user/group IDs.",
        "Note your prompt symbol ($ = normal user).",
        "Run sudo -i (or su -) and observe the prompt change to #.",
        "Type exit to return to your normal user."
      ]}
    ]
  },
  topicIndex: [
    { title:"Architecture & Concepts", desc:"How Linux is structured and how it compares to Unix/Windows and monolithic vs microservices.", links:[
      { label:"Rahma · Concepts", view:"notes-rahma" },
      { label:"Hager · Basics", view:"notes-hager" },
      { label:"RH124 Notes", view:"rh124" }
    ]},
    { title:"Users & Privileges", desc:"The $ vs # prompt, su, and sudo.", links:[
      { label:"Hager · Users", view:"notes-hager" }
    ]},
    { title:"CLI Syntax", desc:"The command [options] [arguments] pattern.", links:[
      { label:"Rahma · CLI", view:"notes-rahma" },
      { label:"Hager · Syntax", view:"notes-hager" },
      { label:"RH124 Notes", view:"rh124" }
    ]},
    { title:"Navigation", desc:"pwd, cd, ~, /, .., - and absolute vs relative paths.", links:[
      { label:"Rahma · Files", view:"notes-rahma" },
      { label:"Michael · Nav", view:"notes-michael" },
      { label:"Hager · Nav", view:"notes-hager" },
      { label:"Cheat Sheet", view:"cheatsheet" }
    ]},
    { title:"Listing Files", desc:"ls / dir / tree flags and wildcards.", links:[
      { label:"Rahma · Files", view:"notes-rahma" },
      { label:"Michael · Listing", view:"notes-michael" },
      { label:"Hager · Listing", view:"notes-hager" },
      { label:"Cheat Sheet", view:"cheatsheet" }
    ]},
    { title:"File Management", desc:"touch, mkdir, cp, mv, rm and safety.", links:[
      { label:"Rahma · Files", view:"notes-rahma" },
      { label:"Michael · Mgmt", view:"notes-michael" },
      { label:"Hager · Mgmt", view:"notes-hager" },
      { label:"Exercises", view:"exercises" }
    ]},
    { title:"Links & Inodes", desc:"Soft vs hard links and what an inode is.", links:[
      { label:"Rahma · Links", view:"notes-rahma" },
      { label:"Michael · Inodes", view:"notes-michael" },
      { label:"Hager · Links", view:"notes-hager" },
      { label:"Links Guide", view:"links" }
    ]},
    { title:"grep & Search", desc:"grep options, regex, and piped filtering.", links:[
      { label:"Rahma · Search", view:"notes-rahma" },
      { label:"Michael · grep", view:"notes-michael" },
      { label:"Hager · grep", view:"notes-hager" }
    ]},
    { title:"Wildcards", desc:"* ? [ ] glob patterns.", links:[
      { label:"Rahma · Search", view:"notes-rahma" },
      { label:"Michael · Listing", view:"notes-michael" },
      { label:"Hager · Listing", view:"notes-hager" }
    ]},
    { title:"Terminal Shortcuts", desc:"Ctrl+A/E/U/K, history, and more.", links:[
      { label:"Rahma · CLI", view:"notes-rahma" },
      { label:"Hager · Shortcuts", view:"notes-hager" },
      { label:"RH124 Notes", view:"rh124" }
    ]},
    { title:"Filesystem Hierarchy", desc:"What lives in /bin, /etc, /var, /home, …", links:[
      { label:"Rahma · Hierarchy", view:"notes-rahma" },
      { label:"Hager · Dirs", view:"notes-hager" },
      { label:"RH124 Notes", view:"rh124" }
    ]},
    { title:"Text Processing", desc:"cut and other text tools.", links:[
      { label:"Michael · cut", view:"notes-michael" }
    ]},
    { title:"Lab Tasks", desc:"Hands-on practice for Day 1.", links:[
      { label:"Lab 1 · Tasks", view:"lab" }
    ]}
  ]
};

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

