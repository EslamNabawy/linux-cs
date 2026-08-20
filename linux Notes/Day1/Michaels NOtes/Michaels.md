# Comprehensive Linux Commands & File System Notes

Extracted and formatted from handwritten Linux administration notes. Includes command explanations, Arabic annotations, syntax, flags, and practical examples.

---

## 1. Directory Navigation & Paths

### Working Directory & Path Types
* `pwd` (**Print Working Directory**): Displays the current absolute directory path.
* **Absolute Path**: Path defined from the root directory `/` (e.g., `/usr/share/doc/`).
* **Relative Path**: Path defined relative to the current directory (e.g., `..`, `doc/`).

### Navigation Commands (`cd`)
* `cd`: Change directory.
* `cd /`: Move to the **Root Directory** `/`.
* `cd ~` or `cd $HOME` or `cd /home/<username>`: Move to the current user's **Home Directory** (contains the 4 basic user directories: Desktop, Documents, Downloads, etc.).
* `cd /root`: Move to the **Root User's Home Directory**.
* `cd -`: Switch back to the **previous working directory** (*يرجعك لآخر مكان كنت فيه*).
* `cd ..`: Move up one level in the directory tree (parent directory).
* `cd /dev/`: Navigate to system devices directory.
* `cd /run`: Navigate to runtime variable data directory.
* `cd /usr/share/doc/`: Navigate to documentation folder.
* `cd /var/log`: Navigate to system log directory.

> **Key Question (*إيه الفرق بين `~` و `/home/`؟*):**  
> `~` represents the home directory of the currently logged-in user (e.g., `/home/omar` for user `omar`, or `/root` for the `root` user). `/home/` is the base directory housing all individual user home folders.

---

## 2. Directory Listing & File Inspection (`ls`, `dir`, `tree`)

### Basic & Advanced `ls` Flags
* `ls`: Lists files and directories in the current folder.
* `ls /`: Lists contents of the root directory.
* `ls -l`: Detailed long-listing format. Displays file types, permissions (9 bits), link count, owner, group, file size, last modified time, and name.
  * **File Type Identifiers in `ls -l`:**
    * `d`: Directory (*أي directory باللون الأزرق - directories in blue*)
    * `-`: Regular file
    * `l`: Symbolic link
* `ls -la` / `ls -a`: Lists **all files**, including hidden files (starting with `.`).
* `ls -lh`: Displays file sizes in **Human-Readable** formats (KB, MB, GB).
* `ls -lt`: Sorts output by **modification time** (newest first).
* `ls -ltr`: Sorts output by **modification time in reverse** (oldest first).
* `ls -lR` or `ls -LR`: **Recursive** directory listing (lists subdirectories and their contents).
* `ls -li`: Displays file listing along with **Inode numbers**.

### `dir` vs `ls`
* `dir`: Similar to `ls`, lists directory contents.
* `dir --color`: Colorizes directory listings to distinguish files and folders.
* Both commands are **case-sensitive**.

### Wildcards & Pattern Matching in `ls`
* `ls file*`: Matches any file starting with `file`.
* `ls [fa]*`: Matches files starting with either `f` or `a`.
* `ls [a-c]*`: Matches files starting with letters `a`, `b`, or `c`.
* `ls [!fa]*`: Matches files **NOT** starting with `f` or `a` (*إستثناء - exclusion*).
* `ls [!a-c]*`: Matches files **NOT** starting with `a`, `b`, or `c`.
* `ls file[[:alpha:]]`: Matches `file` followed by any alphabetic character.
* `ls *[[:space:]]*`: Matches filenames containing space characters.

---

## 3. File & Directory Management (`touch`, `mkdir`, `cp`, `mv`, `rm`)

### Creating Files & Directories
* `touch File1`: Creates an empty file named `File1` (or updates timestamps if it exists).
* `touch File1 File2`: Creates multiple empty files at once.
* `touch /root/Desktop/File1`: Creates a file at a specific path.
* `mkdir dir1`: Creates a directory named `dir1`.
* `mkdir -p dir1/dir2/dir3`: **Parent flag (`-p`)** creates nested directory structures recursively (*بيعمل المجلدات وأجزائها*).
* `tree dir1`: Visualizes directory hierarchy in a tree structure.
* `mkdir system/admin`: Creates nested system/admin directories.

### Copying Files & Directories (`cp`)
* `cp /etc/passwd /home/omar`: Copies `/etc/passwd` to `/home/omar`.
* `cp /etc/shadow .`: Copies `/etc/shadow` to the current working directory (`.`).
* `cp -r /etc/ /home/`: **Recursive copy (`-r`)** copies directory `/etc/` along with all its subdirectories and contents.
* `cp -r /etc/* /home/`: Copies all contents inside `/etc/` into `/home/`.
* `cp File1 File2 File3 /home/omar`: Copies multiple files into a destination directory.
* `cp /etc/passwd ~`: Copies file to user's home directory.

### Moving & Renaming (`mv`)
* `mv passwd new_passwd`: **Renames** file `passwd` to `new_passwd` (when destination path remains unchanged).
* `mv new_passwd /root/Documents`: **Moves** file to `/root/Documents`.
* `mv File1 File2 File3 /root/`: Moves multiple files to `/root/`.
* `mv dir1 dir2 dir3 dir4`: Moves multiple directories or contents.

### Deleting Files & Directories (`rm`, `rmdir`)
* `rm File1`: Removes/deletes `File1`.
* `rmdir dir1`: Removes empty directory `dir1`.
* **Aliases & Root Protection:**
  * `alias rm='rm -i'`: Interactive mode prompts for confirmation before deletion (*يسأل قبل ما يمسح*).
  * `root` user defaults to interactive `rm -i` for safety.
* `rm -f File1`: **Force delete (`-f`)** bypasses prompts (*يمسح بدون ما يسأل*).
* `rm -r dir1`: **Recursive delete (`-r`)** removes directory and its contents.
* `rm -rf dir1`: Forcefully and recursively removes directory `dir1`.
* `rm -rf *`: **Deletes everything** in current directory (*يمسح كل حاجة*).
* ⚠️ `rm -rf /`: **Deletes the entire system** (*يمسح السيستم كله - CRITICAL DANGER*).

---

## 4. Inodes & Links (Hard Links vs. Soft/Symbolic Links)

### Understanding Inodes
* **Inode**: Index node storing metadata about a file (file size, permissions, owner, timestamps, block pointers). Metadatas are stored in the Inode Table.

### Creating & Managing Links
* `ln passwd hard-link-passwd`: Creates a **Hard Link** named `hard-link-passwd`.
* `ln -s passwd soft-link1`: Creates a **Soft/Symbolic Link** (`-s`) named `soft-link1`.
* `ls -li`: Displays Inode numbers along with file details.

### Key Rules & Behavior Differences
1. **Inodes:**
   * **Hard Link**: Points directly to the same Inode as the source file. Increments link count.
   * **Soft Link**: Has its own Inode; points to the target filename/path.
2. **Deleting Source File (`rm -f passwd`):**
   * **Hard Link**: Data remains accessible because the link points to the underlying Inode/data blocks (*لو مسحت الملف الأصلي، الـ hard link يفضل شغال*).
   * **Soft Link**: Becomes broken/invalid (*الـ soft link يقف - broken link error when reading via `cat`*).
3. **Restrictions on Hard Links (*قيود الـ Hard Links*):**
   * ❌ Cannot create hard links for **directories** (*ميدعمش نعمل hard link لـ directory*).
   * ❌ Cannot create hard links across **different filesystems/partitions** (*ولا بين different filesystem*).
   * ✅ Soft links (`ln -s`) work across different filesystems and support directories.

---

## 5. Text Searching (`grep`) & Regular Expressions

`grep` searches text for patterns and prints matching lines.

### Basic Searching & Flags
* `grep omar /etc/passwd`: Searches for string `omar` in `/etc/passwd`.
* `grep bash /etc/passwd`: Searches for `bash`.
* `grep -i bash /etc/passwd`: **Case-insensitive search (`-i`)** (*Case insensitive - يتجاهل حالة الأحرف*).
* `grep -v nologin /etc/passwd`: **Invert match (`-v`)** prints lines that **do NOT contain** `nologin` (*سيرش على أي line مفيهاش nologin*).
* `grep -w shut /etc/passwd`: **Word match (`-w`)** matches whole word `shut` only (*بيدور على كلمة كاملة*).
* `grep -A 2 root /etc/passwd`: Displays match plus **2 lines AFTER** (`-A`).
* `grep -B 2 root /etc/passwd`: Displays match plus **2 lines BEFORE** (`-B`).
* `grep -r omar /etc`: **Recursive search (`-r`)** searches all files inside directory `/etc`.
* `grep -rl omar /etc`: Lists **only filenames (`-l`)** containing the match.
* `grep -e omar -e root /etc/passwd`: Searches for **multiple patterns (`-e`)** simultaneously (`omar` OR `root`).

### Regular Expressions with `grep`
Used with dictionary files (e.g., `/usr/share/dict/words`):
* `grep '^cat' /usr/share/dict/words`: Matches lines starting with `cat`.
* `grep 'cat$' /usr/share/dict/words`: Matches lines ending with `cat`.
* `grep '^cat$' /usr/share/dict/words`: Matches exact line `cat`.
* `grep 'c.t' /usr/share/dict/words`: Matches `c`, followed by **any single character**, followed by `t`.
* `grep '^c.t$' /usr/share/dict/words`: Exact 3-letter words starting with `c` and ending with `t`.
* `grep '^c[aou]t$' /usr/share/dict/words`: Exact 3-letter words starting with `c`, middle character `a`, `o`, or `u`, and ending with `t` (e.g., `cat`, `cot`, `cut`).

---

## 6. Text Processing (`cut`)

The `cut` command extracts sections from each line of a file.

### Slicing Characters (`-c`)
* `cut -c 1-5 /etc/passwd`: Extracts characters from position 1 to 5 of each line.
* `cut -c 5- /etc/passwd`: Extracts characters from position 5 to the end of each line.

### Delimiters & Fields (`-d`, `-f`)
* `cut -d : -f 1 /etc/passwd`: Sets delimiter (`-d`) to `:` and extracts **field 1** (usernames).
* `cut -d : -f 1,7 /etc/passwd`: Extracts **fields 1 and 7** (username and login shell).
