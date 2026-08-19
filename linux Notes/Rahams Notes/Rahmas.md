# Linux Administration & Fundamentals Notes

Extracted and formatted from the provided handwritten notes.

---

## 1. System Architecture & Concepts
* **Monolithic vs Microservices**: If one service fails in a monolithic architecture, all services are down. In microservices, if one service goes down, the rest of the services remain up.
* **Load Balancer**: Works on balancing traffic across the services.
* **RabbitMQ**: Acts as a queue for services.
* **Virtual Memory (Swap)**: Avoids system crashes. Example: Activate Swap when uploading on AWS.
* **Linux vs Unix**:
  * Unix came first; Linux contains around 400 distributions.
  * **Open Source (Linux)**: Customized (including UI), no license, open for everybody (public), and free. (Note: Some are licensed but with nuances).
  * **Closed Source (Unix)**: Private for the developers and couldn't be customized. Unix is an example of a closed-source system.
* **Enterprise Revenue**: Money comes from certifications and subscription fees for enterprise editions.
* **Distributions Comparison**:
  * Differences between Fedora vs RedHat: Number of versions and releases from each version.
  * Ubuntu vs RedHat: You can use Ubuntu on VMware; the difference is mainly in the packages, but the command lines are the same.
  * CentOS: Noted for having "no security" (EOL).
* **GPL (General Public License)**: Associated with Richard Stallman.

---

## 2. Virtual Machine & Network Setup
* **Creating a VM**: `File` -> `New VM` -> `Installing Redhat on VMware` (Recommended: 2 processors, 2 cores).
* **Network Types**: Bridged, NAT, Host-only (chosen according to the IP range).
  * Choose **NAT** when setting up VMware.
* **Redhat Developer Account**: You can use developer account credentials to log in to a Redhat server with a GUI on VMware.
* **Getting IP & SSH**:
  * `ifconfig`: Returns the IP address (Skip this step for Ubuntu).
  * `ssh root@ipaddress`: Connects to the server.

---

## 3. Shell Prompt & Basic CLI Syntax
* **Default Shell in Redhat**: Bash
* **CLI (Command Line Interface)** syntax: `Command [Option] [Argument]`
  * Dash `[option]` has "no spaces" (e.g., `-V`).
  * You must have a space after the `[command]`.
  * There could be no `[argument]` in CLI (used for modification/determining action).
* **Combining Options**: Options can be combined.
  * Example: `-l -d` (Correct), `-ld` (Correct), `-l d` (Incorrect).
* **Terminal Shortcuts**:
  * `Win + ↑`: Maximize terminal.
  * `Ctrl + U`: Delete all the part of the command *before* the cursor.
  * `Ctrl + K`: Delete all the part of the command *after* the cursor.
  * `cd [tab][tab]`: Displays all files with the same initial.
  * `cd [tab]`: Auto-completes file name initial.
* **History Commands**:
  * `!500`: Runs command number 500 in history.
  * `!!`: Runs the last command in history.
* **Switching Users**:
  * `su - username`: Switches user (prompts for password).

---

## 4. File System Hierarchy
* `/`: Root file system (like Local Disk C). Contains everything underneath it (تحته).
* `root`: System user (Admin). `/root` contains the Super user profile.
* `home`: Contains any regular user profile.
* `bin`: Regular user data related ("shortcut" / "symbolic link").
* `sbin`: Super user data related ("shortcut" / "soft link").
* `boot`: Booting OS files.
* `etc`: All config files.
* `dev`: All hardware components.
* `run`: Any files related to services ("not shortcut", "different").
* `var`: Any variable in the system. Contains a `tmp` that clears every 30 days.
* `tmp`: Temporary files (clears every 10 days). Both `tmp` and `/var/tmp` are caches.
* `usr`: The original system directory (الأصلي).

---

## 5. File & Directory Management
### Navigation (`cd`, `pwd`)
* **Shell prompt**: `[root@server ~]` -> `~` refers to the home directory.
  * For regular users: `/home/regularuser`
  * For root: `/root`
* `cd ~` or `cd`: Return to the home directory (whether regular or superuser).
* `cd -`: One step backwards (previous directory).
* `cd ..`: Move up one level (relative path).
* **Absolute path**: The entire path.
* **Relative path**: Not the entire path.

### Listing (`ls`, `tree`)
* `ls`: List files in the directory.
* `ls -a`: List all files, whether hidden or non-hidden. (Hidden files start with a dot).
* `ls -l`: Long list.
* `ls -r`: Reversed list.
* `ls -h`: Converts bits to bytes (human-readable).
* `ls -lthr`: Long list, human-readable, sorted by time, reversed.
* `ls -lR`: Recursive list (lists all the content of the directory, whether files or directories).
* `tree`: Shows directory structure visually.

### File Creation, Copying & Moving
* `mkdir dir1`: Make directory.
* `mkdir -p`: Make parent directories (e.g., `mkdir -p "Rahma Tarek"` vs `mkdir "Roaa Tarek"` vs `mkdir Ayah Tarek`).
* `touch file1`: Create an empty file.
* `cp`: Copying files. Copies are not connected to each other (unlike links).
  * `cp -r NTI /root`: For copying a directory (بناخد الـ NTI كوبي ونحطه جوا الـ root / copy الـ NTI الاصلية جوا الـ root اللي هو الـ home directory).
* `mv`: "Cut" or "Rename" depending on whether you provide a path to paste or just a new name.

### Deleting (`rm`)
* `rm file2`: Asks to verify.
* `rm -f file2`: Deletes without inquiry (force).
* `rm -r dir1`: Removes directory recursively (asks to verify).
* `rm -fr dir1`: Removes directory recursively without inquiry.

### Viewing File Content
* `cat /etc/<file>`: List the content of the file.
* `less /etc/<file>`: Instead of `cat`, more organized, allows scrolling & using `Space` to move to the next page.
* `head /etc/<file>`: First 10 lines.
* `head -n 5 /etc/<file>`: First 5 lines.
* `head /etc/file1 /etc/file2`: First 10 lines from both files.
* `tail /etc/<file>`: Last lines.
* `tail -n 5 /etc/<file>`: Last 5 lines.

---

## 6. Links (Hard Links vs. Soft Links)
* **Soft Link**:
  * Different inode.
  * It's just a pointer to the original file.
  * The soft link size is not related to the original file size, as it's only a pointer.
  * Creation: `ln -s /etc soft-link`
* **Hard Link**:
  * Same inode.
  * Both files are real-time aligned (connected to each other).
  * The file size is the same as the hard link size.
  * Creation: `ln <source> <link>`
* `ls -i`: Displays inodes.

---

## 7. Search & Pattern Matching (`grep` & Wildcards)
### Wildcards (Rules of naming files)
* `ls [fa]*`: Matches any file starting with `f` or `a`.
* `ls [a-c]*`: Any file starting with one of these letters (`a`, `b`, `c`).
* `ls [!fa]*` or `ls [^a-f]*` or `ls [!a-f]*`: Any file that does *not* start with one of these letters.
* `ls [~a-c]*`: Any file starting with one of these letters.

### Text Searching (`grep`)
* `grep omar /etc/passwd`: Searches for "omar".
* `grep -i omar /etc/passwd`: "Not case-sensitive".
* `grep -l Karim /etc/passwd`: If there is "Karim", returns the file path only; if not found, returns nothing.
* `grep -A 2 Ali /etc/passwd`: Returns the line itself & 2 lines *After*.
* `grep -B 2 Ali /etc/passwd`: Returns the line itself & 2 lines *Before*.
* `grep -e omar -e Ali /etc/passwd`: Searching for 2 words at the same time.
* `grep ^cat /etc/passwd`: Returns any word that *starts* with "cat".
* `grep c.t /etc/passwd`: One letter in between 'c' and 't'.
* `grep ^c..t$ /etc/passwd`: Starts with 'c' & ends with 't' with exactly 2 letters in between.
