# Linux Lab 1 — Solved Exercises

> **Topic:** Linux commands, filesystem navigation, files, paths, and basic text processing  
> **Purpose:** Practical reference for the corresponding lab exercises.

---

## 1. `less` vs `more`

Both commands display text one screen at a time, but `less` provides more flexible navigation.

| Command | Main behavior |
|---|---|
| `more` | Displays text page by page, primarily moving forward |
| `less` | Displays text page by page with richer navigation, including forward/backward movement |

### Example

```bash
more /etc/passwd
less /etc/passwd
```

With `less`, you can use `Space` to move forward, `b` to move backward, and `q` to quit.

---

## 2. `cat` vs `more`

`cat` normally prints the entire file directly to standard output, while `more` pauses after each screen.

```bash
cat /etc/passwd
more /etc/passwd
```

**Key idea:** Use `cat` for short files or when you want the contents passed directly through a pipeline. Use `more` when you need page-by-page viewing.

---

## 3. `rm` vs `rmdir`

The manual pages show that the commands have different purposes:

```bash
man rm
man rmdir
```

- `rm` removes files and can remove directories when used with the appropriate recursive option.
- `rmdir` removes **empty directories**.
- `rmdir` is therefore more restrictive than `rm`.

### Examples

```bash
rm file1
rmdir dir1
rm -r dir1
```

---

## 4. Create and manipulate the hierarchy

The intended hierarchy can be created under the home directory with:

```text
~/dir1/
├── docs/
│   ├── dir11/
│   └── dir12/
└── mycv
```

### Create it

```bash
cd ~
mkdir -p dir1/docs/dir11 dir1/docs/dir12
touch dir1/mycv
```

### 4a. Remove `dir11` in one step

```bash
rm -r ~/dir1/docs/dir11
```

### What happened?

`dir11` is a directory, so ordinary `rm dir11` fails because `rm` does not remove directories without the recursive option.

```bash
rm dir1/docs/dir11
# rm: cannot remove '.../dir11': Is a directory
```

Use recursive removal:

```bash
rm -r dir1/docs/dir11
```

> **Caution:** `rm -r` recursively removes the directory and its contents. Use it carefully.

### 4b. Remove `dir12` using `rmdir -p`

```bash
rmdir -p ~/dir1/docs/dir12
```

Because `rmdir -p` removes the specified empty directory and then attempts to remove its empty parent directories, `docs` is also removed if it has become empty.

The resulting hierarchy is:

```text
~/dir1/
└── mycv
```

`dir1` remains because it contains `mycv`.

### 4c. Absolute and relative paths for `mycv`

Given:

```text
pwd
/home/user
```

The file is located at:

```text
/home/user/dir1/mycv
```

**Absolute path:**

```text
/home/user/dir1/mycv
```

**Relative path from `/home/user`:**

```text
dir1/mycv
```

---

## 5. Copy `/etc/passwd` to the home directory as `mypasswd`

```bash
cp /etc/passwd ~/mypasswd
```

Verify:

```bash
ls -l ~/mypasswd
```

---

## 6. Rename `mypasswd` to `oldpasswd`

Use `mv`:

```bash
mv ~/mypasswd ~/oldpasswd
```

Verify:

```bash
ls -l ~/oldpasswd
```

---

## 7. Four ways to go from `/usr/bin` to the home directory

Assuming the home directory is `/home/user`:

### Method 1 — `cd` with no argument

```bash
cd
```

### Method 2 — Use `~`

```bash
cd ~
```

### Method 3 — Use `$HOME`

```bash
cd "$HOME"
```

### Method 4 — Use the absolute path

```bash
cd /home/user
```

> `cd -` is also useful, but it switches to the previous working directory rather than specifically meaning "go home."

---

## 8. List commands in `/usr/bin` beginning with `w`

```bash
ls /usr/bin/w*
```

For a cleaner command-only list:

```bash
find /usr/bin -maxdepth 1 -type f -name 'w*' -printf '%f\n'
```

The first command may also include matching directories or symlinks depending on the system.

---

## 9. Display the first 4 lines of `/etc/passwd`

```bash
head -n 4 /etc/passwd
```

Equivalent short form:

```bash
head -4 /etc/passwd
```

---

## 10. Display the last 7 lines of `/etc/passwd`

```bash
tail -n 7 /etc/passwd
```

Equivalent short form:

```bash
tail -7 /etc/passwd
```

---

## Quick Command Reference

| Task | Command |
|---|---|
| View file interactively | `less file` |
| View file page by page | `more file` |
| Print file | `cat file` |
| Remove file | `rm file` |
| Remove empty directory | `rmdir dir` |
| Remove directory recursively | `rm -r dir` |
| Create directories | `mkdir -p path` |
| Create empty file | `touch file` |
| Copy | `cp source destination` |
| Rename/move | `mv old new` |
| Go home | `cd ~` |
| First lines | `head -n N file` |
| Last lines | `tail -n N file` |

---

## Key Takeaways

- `less` provides more flexible navigation than `more`.
- `cat` prints a file directly, while pagers such as `more` and `less` display it interactively.
- `rm` and `rmdir` have different directory-removal behavior.
- `rmdir -p` can remove empty parent directories.
- `~` and `$HOME` are convenient ways to refer to the user's home directory.
- `head` and `tail` are useful for extracting the beginning and end of files.
