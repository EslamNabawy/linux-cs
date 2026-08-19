# Linux Session — Revision Sheet
**Date:** 18 Aug 2026

---

## 1. Linux Basics

### Linux vs. Windows

- **Security** ✓
- **Stability** ✓
- **Maintenance** ✓
- Runs on different hardware
- Free & open source
- Easy to customize
- Community support
- Different user-interface experience

### Linux Architecture

```text
CLI → Shell → Application
         ↓
      Hardware
       (Kernel)
```

- **Kernel:** Works with the hardware.
- **Shell:** Interface for interacting with the system through commands.

### Swap

Uses part of the storage as additional memory when needed.

---

## 2. Users and Privileges

| Symbol | Meaning |
|---|---|
| `$` | Regular user |
| `#` | Superuser |

---

## 3. Command Syntax

```text
command  option  argument
```

Example:

```bash
ls -l /dev
```

- A space is required between the command, options, and arguments.
- Options can be combined.

For example:

```bash
ls -ld
```

is equivalent to:

```bash
ls -l -d
```

---

## 4. Navigation

| Command | Description |
|---|---|
| `pwd` | Print working directory |
| `cd` | Go to home directory |
| `cd ~` | Go to home directory |
| `cd $HOME` | Go to home directory |
| `cd /absolute/path` | Go to an absolute path |
| `cd -` | Go back to the previous directory |

---

## 5. Listing Files

| Command | Description |
|---|---|
| `ls` | List files |
| `ls -a` | List all files, including hidden files |
| `ls -l` | Long listing |
| `ls -la` | Long listing + hidden files |
| `ls -lt` | Sort by time |
| `ls -ltr` | Sort by time, reverse order |
| `ls -lth` | Long listing + time sorting + human-readable size |

> Files and directories starting with `.` are hidden.

### Wildcards

| Pattern | Meaning |
|---|---|
| `ls p*` | Starts with `p` |
| `ls *p` | Ends with `p` |
| `ls ???` | Exactly 3 characters |
| `ls [a-c]*` | Starts with `a`, `b`, or `c` |
| `ls [!a]*` | Does not start with `a` |
| `ls [!a-c]*` | Does not start with `a`–`c` |

> Inside `[]`, `!` and `^` have the same meaning.

---

## 6. File Content

| Command | Description |
|---|---|
| `cat file` | Show file content |
| `nano file` | Edit a file |
| `head -n N file` | Show the first `N` lines |
| `tail -n N file` | Show the last `N` lines |

---

## 7. File & Directory Management

| Command | Description |
|---|---|
| `touch file` | Create an empty file |
| `mkdir dir` | Create a directory |
| `cp file dest` | Copy a file |
| `cp -r dir dest` | Copy a directory recursively |
| `mv file dest` | Move a file |
| `mv file newname` | Rename a file |
| `rm -rf dir` | Force-remove a directory recursively |

### Important Options

```text
-r / -R  → recursive
-f       → force
```

---

## 8. Searching with `grep`

Basic command:

```bash
grep hager dir
```

### Useful Options

| Command | Description |
|---|---|
| `grep -i` | Case-insensitive |
| `grep -l` | Show only file names containing the pattern |
| `grep -B N` | Show `N` lines **before** the match |
| `grep -A N` | Show `N` lines **after** the match |

Example:

```bash
grep -i hager dir
grep -l hager dir
grep -B 2 hager dir
grep -A 2 hager dir
```

---

## 9. Links

Linux supports **hard links** and **soft links**.

### Hard Link

```bash
ln file1 file2
```

- Both names refer to the same data.
- They share the same inode.
- A hard link cannot link directories.
- The data remains as long as at least one hard link still exists.

Example:

```bash
ln file1 file2
```

To remove a hard link:

```bash
rm -rf hard-link
```

### Soft Link

A soft link points to a path.

### Inode

- Every file or directory has an **inode** allocated for it.
- A hard link refers to the same inode/data.

---

## 10. Important Filesystem Directories

| Directory | Purpose |
|---|---|
| `/` | Root of the entire filesystem |
| `/bin` | Essential binaries for regular users |
| `/sbin` | System binaries for the superuser |
| `/dev` | Device files |
| `/etc` | Configuration files |
| `/home` | Users' home directories |
| `/root` | Home directory of the superuser |
| `/tmp` | Temporary files |
| `/var` | Variable data, such as `/var/tmp` |
| `/run` | Runtime data related to services |
| `/local` | Local / customized software |

### Important

```text
/       → Root of the filesystem
/root   → Home directory of the superuser
/home   → Home directories of regular users
```

`/root` is **not** the same as `/home/root`.

---

## 11. Terminal Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + A` | Go to the beginning of the command |
| `Ctrl + E` | Go to the end of the command |
| `Ctrl + ← / →` | Move by word |
| `Ctrl + K` | Cut from the cursor to the end of the line |
| `Ctrl + U` | Cut from the cursor to the beginning of the line |

---

# Quick Command Reference

### Users

```bash
$    # regular user
#    # superuser
```

### Navigation

```bash
pwd
cd
cd ~
cd $HOME
cd -
cd /path
```

### Listing

```bash
ls
ls -a
ls -l
ls -la
ls -lt
ls -ltr
ls -lth
```

### Wildcards

```bash
ls p*
ls *p
ls ???
ls [a-c]*
ls [!a]*
ls [!a-c]*
```

### File Content

```bash
cat file
nano file
head -n N file
tail -n N file
```

### File & Directory Management

```bash
touch file
mkdir dir
cp file dest
cp -r dir dest
mv file dest
mv file newname
rm -rf dir
```

### Links

```bash
ln file1 file2
```

### Search

```bash
grep hager dir
grep -i hager dir
grep -l hager dir
grep -B 2 hager dir
grep -A 2 hager dir
```
