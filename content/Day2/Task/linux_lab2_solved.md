# Linux Lab 2 — Solved Exercises

> **Topic:** Manual pages, user management, Vim, redirection, and administrative access  
> **Purpose:** Practical reference for the corresponding lab exercises.

---

## 1. Display the `passwd` command and file manual pages sequentially

The `passwd` command has a section 1 manual entry, while the `/etc/passwd` file is documented in section 5.

Display them sequentially with:

```bash
man passwd
man 5 passwd
```

Exit the first manual page with `q`, then the second opens.

You can also invoke them as separate commands in a shell sequence:

```bash
man passwd; man 5 passwd
```

---

## 2. Display the manual page for the `passwd` file

The password database format is documented in section 5:

```bash
man 5 passwd
```

The `5` explicitly selects the **file formats** section rather than the `passwd` command's section.

---

## 3. Find commands whose manual pages contain `passwd`

Use `man -k`, which searches manual-page descriptions and keywords:

```bash
man -k passwd
```

On systems where `apropos` is available, the equivalent is:

```bash
apropos passwd
```

---

## 4. Create a user account

The requested account is:

```text
Username: Islam
Password: Islam
```

Creating a user generally requires root or `sudo` privileges.

### Create the account

```bash
sudo useradd -m Islam
```

### Set the password

```bash
sudo passwd Islam
```

When prompted, enter:

```text
Islam
```

> **Security note:** A real system should not use a predictable password such as `Islam`. The value is used here only because it is explicitly specified by the lab.

### Verify

```bash
id Islam
```

---

## 5. Search manual pages mentioning `password`

Use:

```bash
man -k password
```

This searches the manual database for entries associated with the keyword.

---

## 6. Create `notes.txt` using Vim

Open the file:

```bash
vim ~/notes.txt
```

Inside Vim:

1. Press `i` to enter **Insert mode**.
2. Type your full name.
3. Press `Esc` to return to **Command mode**.
4. Type:

```vim
:wq
```

5. Press `Enter`.

This saves the file and exits Vim.

---

## 7. Display `notes.txt`

Use:

```bash
cat ~/notes.txt
```

This prints the contents directly to the terminal.

---

## 8. Append `AIOPS` without opening an editor

Use `echo` with the append operator:

```bash
echo "AIOPS" >> ~/notes.txt
```

Verify:

```bash
cat ~/notes.txt
```

### Why `>>`?

- `>` overwrites the file.
- `>>` appends to the existing content.

So using `>` here would be the classic tiny command-line disaster where your previous content quietly ceases to exist.

---

## 9. Redirect `ls -l /etc` into `etc_listing.txt`

Run:

```bash
ls -l /etc > ~/etc_listing.txt
```

Verify that the file exists:

```bash
ls -l ~/etc_listing.txt
```

Then inspect its contents:

```bash
cat ~/etc_listing.txt
```

### What happened?

The `>` operator redirects standard output from the command into a file.

Conceptually:

```text
ls -l /etc
      │
      ▼
etc_listing.txt
```

---

## 10. Safely inspect which users have sudo privileges

The lab asks you to determine which user is configured to run commands through `sudo`.

First inspect the main sudoers configuration safely with:

```bash
sudo visudo -c
```

This checks the configuration syntax without editing it.

To inspect the configuration:

```bash
sudo grep -vE '^[[:space:]]*(#|$)' /etc/sudoers
```

Also inspect included configuration files:

```bash
sudo grep -R -vE '^[[:space:]]*(#|$)' /etc/sudoers.d/
```

Common configurations grant sudo access to a group such as:

```text
%sudo ALL=(ALL:ALL) ALL
```

Check the current user's groups:

```bash
groups
```

On many Debian/Ubuntu systems, membership in the `sudo` group indicates administrative sudo access.

You can also check a specific user with:

```bash
sudo -l -U username
```

> **Important:** Do not edit `/etc/sudoers` directly with a normal text editor. `visudo` performs syntax checking and is designed for safely editing sudoers configuration.

---

## 11. Switch to root with `su -`

Run:

```bash
su -
```

Enter the root password when prompted.

Confirm the current identity:

```bash
whoami
```

Expected result:

```text
root
```

Return to your normal user:

```bash
exit
```

Verify if necessary:

```bash
whoami
```

> On systems where direct root login is disabled, `su -` may fail even when `sudo` works. In that case, the system's configured administrative method should be used instead.

---

## 12. Create `steps.txt` in Vim and save without exiting

Open the file:

```bash
vim ~/steps.txt
```

Press:

```text
i
```

Enter Insert mode and type:

```text
Welcome to AIOPS Training
This course covers Vim
```

Press:

```text
Esc
```

You are now in Command mode.

Save without exiting:

```vim
:w
```

Press `Enter`.

The file remains open in Vim.

---

## 13. Search for the Vim line and replace `raining` with `Course`

The lab wording appears to contain a typo:

```text
search for Vim return raining
```

Based on the text entered in the previous exercise:

```text
This course covers Vim
```

the intended operation appears to be searching for the line containing `Vim`, then replacing a word.

If the intended replacement is to replace `raining` with `Course`, use:

```vim
:%s/raining/Course/g
```

However, **`raining` does not exist in the text specified by exercise 12**, so this substitution would make no change.

To replace `Vim` with `Course`, which is consistent with the exercise's apparent intent:

```vim
:%s/Vim/Course/g
```

If the exact lab instruction is meant literally, first search:

```vim
/raining
```

Then press `Enter`.

> **Source ambiguity:** The supplied lab text says `"Vim return raining"` but the preceding content contains `"This course covers Vim"`. The exercise therefore contains an apparent inconsistency. The commands above preserve that distinction rather than silently pretending the typo never happened.

---

## 14. Copy the current line, paste it below, then save and exit

In Vim Command mode:

```vim
yy
```

This copies (yanks) the current line.

Then:

```vim
p
```

This pastes it below the current line.

Finally:

```vim
:wq
```

Save and exit.

### Combined command sequence

```text
Esc → yy → p → :wq → Enter
```

---

# Vim Quick Reference

| Action | Vim command |
|---|---|
| Enter Insert mode | `i` |
| Return to Command mode | `Esc` |
| Save | `:w` |
| Save and exit | `:wq` |
| Exit without saving | `:q!` |
| Search | `/pattern` |
| Copy current line | `yy` |
| Paste below | `p` |
| Delete current line | `dd` |
| Substitute text | `:%s/old/new/g` |

---

# Linux Command Reference

| Purpose | Command |
|---|---|
| Search manual database | `man -k keyword` |
| Command manual | `man command` |
| File-format manual | `man 5 passwd` |
| Create user | `sudo useradd -m username` |
| Set password | `sudo passwd username` |
| Show user identity | `whoami` |
| Show user information | `id username` |
| Append text | `echo "text" >> file` |
| Redirect output | `command > file` |
| Switch to root | `su -` |
| Return from `su` | `exit` |
| Check sudoers syntax | `sudo visudo -c` |

---

# Key Takeaways

- Manual pages are divided into sections, and `man 5 passwd` refers to the **passwd file format**, not the `passwd` command.
- `man -k` searches the manual database by keyword.
- `>>` appends data, while `>` redirects output and overwrites the destination file.
- Vim separates **Insert mode** from **Command mode**.
- `yy` copies the current line and `p` pastes it below.
- `visudo` should be used when modifying sudoers configuration because syntax errors can break administrative access.
