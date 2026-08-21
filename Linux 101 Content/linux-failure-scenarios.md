# Linux Failure Scenarios — What Actually Causes Errors & File Corruption

A catalog of the *specific* wrong moves that break files, systems, or data on Linux — why each one happens, and how to avoid or recover from it.

---

## 1. Shell Redirection Traps

### Reading and writing the same file in one command
```bash
sort file.txt > file.txt      # WRONG — truncates file.txt to empty BEFORE sort ever reads it
```
**Why it corrupts:** the shell opens `file.txt` for writing (truncating it to 0 bytes) *before* the command on the left even runs. By the time `sort` tries to read it, there's nothing left to read.

**Fix:**
```bash
sort file.txt -o file.txt     # many tools support in-place output flags
# or
sort file.txt > tmp && mv tmp file.txt
```

### `>` vs `>>` confusion
```bash
echo "new log line" > app.log     # WRONG if you meant to append — wipes the entire log file first
```
`>` always truncates first. `>>` appends. This single character mistake is one of the most common ways people accidentally delete logs or config history.

### Piping into `sudo` incorrectly
```bash
sudo echo "text" > /etc/somefile     # FAILS silently or with permission denied
```
**Why:** `sudo` only elevates the `echo` — the `>` redirection is still performed by your *unprivileged* shell, which can't write to a root-owned file.

**Fix:**
```bash
echo "text" | sudo tee /etc/somefile
echo "text" | sudo tee -a /etc/somefile   # append version
```

---

## 2. Killing a Process Mid-Write

If you `kill -9` (SIGKILL) a process — or the process crashes, or the power dies — while it's in the middle of writing a file, the write can be left **partially applied**. SIGKILL cannot be caught or handled, so the process gets zero chance to close the file cleanly or finish its write.

**High-risk moments:**
- Editors saving a file (`Ctrl+O` in nano, `:w` in vim) — interrupted mid-save
- Database writes, especially without journaling/WAL enabled
- `dd`, `cp`, `rsync` of large files interrupted partway
- Package manager mid-install (`apt`/`dpkg` writing package metadata)

**Result:** truncated files, half-written binaries that won't execute, or — for structured files like `/etc/passwd`-style configs — a corrupted line that breaks every tool that parses it afterward.

**Mitigation:**
- Prefer `SIGTERM` (`kill -15`, or plain `kill`) — gives the process a chance to finish and exit cleanly. Only escalate to `-9` if it's truly hung.
- For critical files, write to a temp file and `mv` it into place atomically (a `mv` on the same filesystem is atomic — readers never see a partial file).

---

## 3. Editor Swap Files & Crash Recovery

### Vim `.swp` conflict
Opening a file that's already open in another Vim session (or one that crashed) triggers:
```
E325: ATTENTION
Found a swap file by the name ".file.txt.swp"
```
**If you ignore this and choose "Edit anyway" while the original session is still active:** you now have two Vim instances able to save over each other — whichever saves *last* wins, silently discarding the other session's edits.

**Correct response to that prompt:**
- `(O)pen Read-Only` if you just want to look
- `(Q)uit` if another session is genuinely still editing it
- `(D)elete` the swap file only if you're sure no other session is active (e.g. after a crash) — then reopen normally
- `(R)ecover` to recover unsaved changes from a crash, via `vim -r file.txt`

### Nano's lack of swap-file locking
Nano (by default) does **not** warn you if the same file is open in two nano sessions — both can save independently, and the second save simply overwrites the first, with no merge and no warning. If you're editing the same file from two terminals, this is a silent data-loss trap Vim would have caught and Nano won't.

---

## 4. Destructive Command Mistakes

### `rm -rf` with a wrong or expanded path
```bash
rm -rf $DIR/*     # if $DIR is unset/empty, this becomes: rm -rf /*
```
**Why it's catastrophic:** an unset variable expands to nothing, silently turning `$DIR/*` into `/*` — deleting from root. This is one of the most infamous Linux disaster patterns.

**Mitigation:**
```bash
set -u                       # in scripts: error out on unset variables instead of silently expanding empty
rm -rf "${DIR:?DIR not set}/"*   # fails loudly instead of running against /
```

### Wildcard expansion including files you didn't intend
```bash
rm -- -rf     # a file literally named "-rf" needs -- to avoid being parsed as flags
chmod 644 *   # if a filename starts with a dash, it can be misread as an option
```

### `dd` with the wrong `of=` target
```bash
dd if=image.iso of=/dev/sda    # WRONG target — wipes an entire disk, not a partition
```
**Why it's dangerous:** `dd` has no "are you sure" prompt and no undo. Getting `/dev/sda` (whole disk) vs `/dev/sdb1` (a specific partition) wrong destroys everything on that device, silently and immediately.

**Mitigation:** always run `lsblk` immediately before a `dd` command to confirm the exact device name, and double/triple check `of=` before hitting Enter.

---

## 5. Permission & Ownership Mistakes

### Recursive chmod on the wrong directory
```bash
chmod -R 777 /     # catastrophic — breaks permission-dependent security across the entire OS
```
This breaks SSH (which refuses to work if key/config permissions are too open), sudo (which requires specific binary permissions), and most system services that check permission bits before trusting a file.

### Recursive chown breaking service accounts
```bash
chown -R $USER:$USER /var/www    # if a webserver process expects www-data ownership, it can no longer read its own files
```

**General rule:** never run `-R` permission/ownership changes against a directory you haven't fully scoped in your head first — target the narrowest path that actually needs the change.

---

## 6. Filesystem-Level Corruption

### Unsafe shutdown / power loss during a write
If the system loses power (or is force-powered-off) while the filesystem has pending writes in its cache, files can end up with:
- Zero-length or truncated content
- Metadata pointing to data that was never actually written
- In severe cases, filesystem structure damage requiring `fsck` to repair

**Mitigation:** always `sudo shutdown -h now` or `sync && sudo shutdown -h now` rather than cutting power directly. `sync` flushes pending writes from memory to disk before shutdown.

### Unmounting a drive while it's still in use
```bash
umount /mnt/usb     # fails or corrupts data if a process still has open file handles on it
```
If a file is still being written when the device is yanked or force-unmounted, the write is left incomplete. Use `lsof /mnt/usb` first to check nothing's still using it, or `umount -l` (lazy unmount) only as a last resort — it detaches the mount point immediately but lets in-flight I/O finish in the background, which is safer than yanking hardware outright.

### Disk full during a write
Writing to a filesystem that fills up mid-write leaves a truncated file with no error surfaced to some tools (depends on how the writing program checks return codes). Always check `df -h` before large writes/copies, especially into `/`, `/var`, or `/tmp`, which fill up fastest from logs and package caches.

---

## 7. Text Encoding & Line-Ending Corruption

### Windows line endings breaking a script
```bash
./script.sh
# bash: ./script.sh: /bin/bash^M: bad interpreter: No such file or directory
```
**Why:** the file has Windows-style `\r\n` line endings instead of Unix `\n`. The shebang line (`#!/bin/bash`) ends up with an invisible `\r` (`^M`) appended, and the kernel can't find an interpreter called `bash\r`.

**Fix:**
```bash
dos2unix script.sh
# or
sed -i 's/\r$//' script.sh
```

### Mixing character encodings
Editing a UTF-8 file with a tool/locale expecting Latin-1 (or vice versa) can silently mangle non-ASCII characters (accents, non-Latin scripts) into garbled bytes — often visible as `�` or seemingly random characters. Check with `file filename` (reports detected encoding) and set your editor/locale (`echo $LANG`) to match the file's actual encoding.

### Editing a binary file as if it were text
Opening a binary (executable, image, compiled object) in Vim/Nano and saving it can corrupt it — text editors may "normalize" line endings or encoding on save, which mangles binary data that was never meant to be interpreted as text. If you must inspect binary content, use `xxd file` or `hexdump -C file`, not a text editor's save function.

---

## 8. Symlink & Hardlink Pitfalls

### Deleting through a symlink with a trailing slash
```bash
rm -rf symlink_to_dir/    # the trailing slash makes some tools follow the link and delete the TARGET's contents, not just the link
```
Behavior here varies by tool and trailing-slash handling — the safe habit is to `rm` the link itself (no trailing slash) unless you specifically intend to touch the target's contents.

### Broken symlinks after moving the target
Moving or renaming the file/directory a symlink points to leaves the symlink dangling — it still exists, but any read through it fails. `ls -la` shows dangling links in a distinct color in most terminals; `find -xtype l` finds all broken symlinks under a path.

---

## 9. Package Manager Corruption

### Interrupting `apt`/`dnf` mid-install
Killing the terminal, losing power, or force-closing during a package install can leave the package database in a `dpkg was interrupted` state — subsequent `apt` commands refuse to run until it's repaired:
```bash
sudo dpkg --configure -a     # resume/repair an interrupted dpkg state
sudo apt --fix-broken install
```

### Running two package managers at once
Running `apt install` in two terminals simultaneously causes a lock contention error (`Could not get lock /var/lib/dpkg/lock`) — and if the lock itself is stale from a crashed process, forcibly deleting the lock file without confirming no process actually holds it can let two installs interleave and corrupt the package database.

---

## 10. Concurrent Access Race Conditions

Two processes (or two terminal sessions, or a script and a human) writing to the same file at the same time — without any locking — will have the **last write win**, discarding whatever the other one wrote. This isn't Linux-specific but is extremely common in:
- Editing the same config file from two SSH sessions
- A cron job and a manual edit touching the same file simultaneously
- A script appending to a log file while log rotation is renaming/truncating it

**Mitigation:** for anything script-driven, use `flock` to take an exclusive lock before writing:
```bash
flock /tmp/mylock.lock -c "echo 'safe write' >> shared_file.txt"
```

---

## 11. Quick Prevention Checklist

- Never redirect (`>`) output back into a file you're still reading as input in the same command.
- Use `SIGTERM` before `SIGKILL` when stopping a process that might be mid-write.
- Write critical files to a temp path, then atomically `mv` them into place.
- Check `lsof` before force-unmounting or removing a device.
- Always confirm `dd`'s `of=` target with `lsblk` immediately before running it.
- Quote variables and use `set -u` in scripts to catch unset-variable disasters before they run.
- Scope `-R` permission/ownership changes to the narrowest directory that needs it — never run them against `/` or a guess.
- Run `dos2unix` on any script that came from a Windows machine or editor before executing it.
- Use `flock` for any script that might run concurrently with itself or another writer.
