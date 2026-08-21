# Vim / Vi & Nano — The Complete Guide

---

# PART 1: VIM / VI

## 1. The Core Idea: Modal Editing

Vim is not like other editors — it has **modes**, and the same key does completely different things depending on which mode you're in. This is the single most important concept to internalize before anything else makes sense.

| Mode | Purpose | How to enter |
|---|---|---|
| **Normal** | Navigate, delete, copy, run commands (default mode) | `Esc` from any other mode |
| **Insert** | Type text like a normal editor | `i`, `a`, `o`, etc. from Normal |
| **Visual** | Select text (char/line/block) | `v`, `V`, `Ctrl+v` from Normal |
| **Command-line** | Run `:` commands (save, quit, search/replace) | `:` from Normal |
| **Replace** | Overtype existing text | `R` from Normal |

**Golden rule:** `Esc` always brings you back to Normal mode. When lost, hit `Esc`.

---

## 2. Starting & Exiting

```bash
vim file.txt          # open (or create) a file
vim +42 file.txt       # open at line 42
vim +/pattern file.txt # open and jump to first match of pattern
vimdiff file1 file2    # open two files side-by-side, highlighting differences
```

**Exiting (all typed in Normal mode, starting with `:`):**

| Command | Effect |
|---|---|
| `:w` | Save (write) |
| `:w newname.txt` | Save as a new file |
| `:q` | Quit (fails if unsaved changes) |
| `:q!` | Quit, discard changes |
| `:wq` or `:x` | Save and quit |
| `ZZ` | Save and quit (Normal mode shortcut, no `:`) |
| `ZQ` | Quit without saving |
| `:wqa` | Save and quit all open buffers/windows |

---

## 3. Normal Mode — Navigation

### Basic movement
| Key | Moves |
|---|---|
| `h` `j` `k` `l` | left / down / up / right |
| `0` | start of line (column 0, ignores indentation) |
| `^` | first non-blank character of line |
| `$` | end of line |
| `gg` | first line of file |
| `G` | last line of file |
| `42G` or `:42` | go to line 42 |

### Word-wise movement
| Key | Moves |
|---|---|
| `w` | start of next word |
| `W` | start of next WORD (whitespace-delimited, ignores punctuation splits) |
| `b` | back to start of previous word |
| `B` | back to start of previous WORD |
| `e` | end of current/next word |
| `E` | end of current/next WORD |

### Screen movement
| Key | Moves |
|---|---|
| `Ctrl+f` | page forward |
| `Ctrl+b` | page backward |
| `Ctrl+d` | half page down |
| `Ctrl+u` | half page up |
| `H` | top of visible screen |
| `M` | middle of visible screen |
| `L` | bottom of visible screen |
| `zz` | center screen on cursor line |

### Character search on current line
| Key | Effect |
|---|---|
| `f x` | jump to next `x` on this line |
| `F x` | jump to previous `x` on this line |
| `t x` | jump to just before next `x` |
| `T x` | jump to just after previous `x` |
| `;` | repeat last f/F/t/T |
| `,` | repeat last f/F/t/T reversed |

**Count prefix rule:** almost any movement can be prefixed with a number to repeat it — `5j` moves down 5 lines, `3w` moves 3 words forward.

---

## 4. Insert Mode — Entering It

| Key | Effect |
|---|---|
| `i` | insert before cursor |
| `a` | insert after cursor (append) |
| `I` | insert at start of line |
| `A` | insert at end of line |
| `o` | open new line below, enter insert mode |
| `O` | open new line above, enter insert mode |
| `Esc` | return to Normal mode |

---

## 5. Editing Commands (Normal Mode)

Vim editing commands follow a grammar: **`[count] operator [count] motion`**. Once you know the operators and motions, they combine freely.

### Core operators
| Operator | Meaning |
|---|---|
| `d` | delete |
| `c` | change (delete + enter insert mode) |
| `y` | yank (copy) |
| `>` / `<` | indent / un-indent |

### Combine with a motion
```
dw   → delete to next word
d$   → delete to end of line
d0   → delete to start of line
dd   → delete whole line (doubling the operator = whole line)
cw   → change to next word (delete + insert)
cc   → change whole line
yy   → yank whole line
y$   → yank to end of line
3dd  → delete 3 lines
```

### Single-key shortcuts (no motion needed)
| Key | Effect |
|---|---|
| `x` | delete character under cursor |
| `X` | delete character before cursor |
| `D` | delete to end of line (= `d$`) |
| `C` | change to end of line (= `c$`) |
| `Y` | yank whole line (= `yy`) |
| `s` | delete char, enter insert (substitute) |
| `S` | delete line, enter insert |
| `r x` | replace single char under cursor with `x` |
| `R` | enter Replace mode (overtype until Esc) |
| `J` | join current line with next |
| `~` | toggle case of character under cursor |

### Paste
| Key | Effect |
|---|---|
| `p` | paste after cursor / below line |
| `P` | paste before cursor / above line |

### Undo / redo
| Key | Effect |
|---|---|
| `u` | undo |
| `Ctrl+r` | redo |
| `.` | repeat last change — extremely powerful, use it constantly |

---

## 6. Text Objects

Text objects let operators target a *logical unit* rather than a raw motion — this is what separates fluent Vim use from beginner Vim use.

Pattern: **`operator + i/a + object`**
- `i` = "inner" (just the content)
- `a` = "around" (content + surrounding delimiter/whitespace)

| Example | Effect |
|---|---|
| `diw` | delete inner word (word only) |
| `daw` | delete a word (word + trailing space) |
| `ci"` | change inside double quotes |
| `ca(` | change including the parentheses |
| `di{` | delete inside `{ }` |
| `dip` | delete inner paragraph |
| `dap` | delete a paragraph (incl. trailing blank line) |
| `dit` | delete inside an HTML/XML tag |

---

## 7. Visual Mode

| Key | Enters |
|---|---|
| `v` | character-wise visual |
| `V` | line-wise visual |
| `Ctrl+v` | block-wise visual (select a rectangular column) |

Once in visual mode, move the cursor to extend the selection, then apply an operator:

```
v3w d     → select 3 words, delete them
V j j d   → select 3 lines, delete them
Ctrl+v, move down, I, type text, Esc  → insert text at same column on multiple lines
```

`gv` reselects the last visual selection.

---

## 8. Search & Replace

### Searching
| Command | Effect |
|---|---|
| `/pattern` | search forward |
| `?pattern` | search backward |
| `n` | repeat search, same direction |
| `N` | repeat search, opposite direction |
| `*` | search forward for word under cursor |
| `#` | search backward for word under cursor |

### Find & replace (Ex command)
```
:s/old/new/         → replace first match on current line
:s/old/new/g        → replace all matches on current line
:%s/old/new/g       → replace all matches in entire file
:%s/old/new/gc      → same, but confirm each replacement
:5,10s/old/new/g    → replace only within lines 5–10
:%s/\<foo\>/bar/g   → replace whole word "foo" only (word boundaries)
```

Vim search patterns support regex — `.` any char, `*` zero-or-more, `\d` digit, `^`/`$` line anchors, `\(...\)` grouping.

---

## 9. Registers (Clipboard System)

Vim has multiple named "clipboards" called registers.

| Register | Contents |
|---|---|
| `""` | default/unnamed register — used automatically by `y`/`d`/`p` |
| `"0` | last yank (specifically — not overwritten by delete) |
| `"1`–`"9` | rolling history of deletes |
| `"a`–`"z` | manually named registers you control |
| `"+` | system clipboard (cross-application copy/paste) |

```
"ayy    → yank current line into register a
"ap     → paste from register a
"+y     → yank into system clipboard
"+p     → paste from system clipboard
```

---

## 10. Marks

Marks let you bookmark a position and jump back to it.

```
ma      → set mark "a" at cursor position
`a      → jump to exact position of mark a
'a      → jump to start of line containing mark a
``      → jump to position before last jump (great for "go back")
```

---

## 11. Macros

Record a sequence of keystrokes and replay it — ideal for repetitive edits across many lines.

```
qa          → start recording into register a
...         → do your edits
q           → stop recording
@a          → replay the macro once
5@a         → replay it 5 more times
@@          → repeat the last macro played
```

---

## 12. Buffers, Windows & Tabs

These are three different concepts in Vim and are often confused:
- **Buffer** = a file loaded in memory
- **Window** = a viewport showing a buffer (you can have several windows showing different — or the same — buffers)
- **Tab** = a collection of windows

| Command | Effect |
|---|---|
| `:e file.txt` | open file into a new buffer |
| `:ls` or `:buffers` | list open buffers |
| `:bn` / `:bp` | next / previous buffer |
| `:b 3` | switch to buffer number 3 |
| `:split` or `:sp` | horizontal window split |
| `:vsplit` or `:vsp` | vertical window split |
| `Ctrl+w` then `h/j/k/l` | move between windows |
| `Ctrl+w` then `q` | close current window |
| `:tabnew file.txt` | open file in a new tab |
| `gt` / `gT` | next / previous tab |

---

## 13. Ex (Command-Line) Commands & Ranges

Any `:` command can be prefixed with a **range** telling it which lines to act on:

| Range | Meaning |
|---|---|
| `:5` | line 5 |
| `:5,10` | lines 5 through 10 |
| `:.,$` | current line to end of file |
| `:%` | whole file (shorthand for `1,$`) |
| `:'<,'>` | the last visual selection (auto-filled after selecting in Visual mode, then `:`) |

Common Ex commands:
```
:set number         → show line numbers
:set nonumber       → hide them
:noh                → clear search highlighting
:!ls                → run a shell command without leaving vim
:r !date             → insert output of a shell command into the buffer
```

---

## 14. Folding

```
zf a{     → create a fold over "a{" text object (e.g. a code block)
zo        → open fold under cursor
zc        → close fold under cursor
za        → toggle fold
zR        → open all folds
zM        → close all folds
```

---

## 15. Configuration — `~/.vimrc`

Vim reads `~/.vimrc` on startup. A solid practical starting config:

```vim
set number              " show line numbers
set relativenumber      " line numbers relative to cursor — makes counts easy
set expandtab           " use spaces instead of tabs
set tabstop=4            " a tab is 4 spaces wide
set shiftwidth=4         " indent width
set autoindent           " keep indentation on new lines
set incsearch            " search as you type
set hlsearch             " highlight all matches
set ignorecase           " case-insensitive search...
set smartcase             " ...unless the pattern has a capital letter
set clipboard=unnamedplus " use system clipboard by default
syntax on                 " syntax highlighting
```

---

## 16. Vim Quick Cheat Sheet

```
NAVIGATE      h j k l    0 ^ $    gg G    w b e    f{char}
INSERT        i a I A o O
EDIT          x dd dw d$   cc cw c$   yy yw   p P   u Ctrl+r   .
VISUAL        v V Ctrl+v
SEARCH        /pat  ?pat  n N  :%s/old/new/g
SAVE/QUIT     :w  :q  :wq  ZZ  :q!
```

---

# PART 2: NANO

## 1. Philosophy

Nano is a straightforward, modeless text editor — what you see is what you get, no Normal/Insert distinction. Every shortcut is shown at the bottom of the screen, which makes it the default choice when you just need to edit a file *right now* without a learning curve.

**Notation used everywhere in Nano's own docs:**
- `^` means **Ctrl** — `^X` = `Ctrl+X`
- `M-` means **Alt/Meta** — `M-U` = `Alt+U`

---

## 2. Starting Nano

```bash
nano file.txt          # open (or create) a file
nano +42 file.txt        # open at line 42
nano -l file.txt         # force line numbers on
sudo nano /etc/hosts      # edit a root-owned file
```

---

## 3. File Operations

| Shortcut | Effect |
|---|---|
| `Ctrl+O` | Write out (save) — you'll be prompted to confirm the filename |
| `Ctrl+X` | Exit (prompts to save if there are unsaved changes) |
| `Ctrl+R` | Read/insert another file's contents at the cursor |
| `Ctrl+S` | Save (in newer nano versions), without the write-prompt |

---

## 4. Navigation

| Shortcut | Effect |
|---|---|
| Arrow keys | Move cursor |
| `Ctrl+F` / `Ctrl+B` | Forward / back one character |
| `Ctrl+P` / `Ctrl+N` | Previous / next line |
| `Ctrl+A` | Go to start of line |
| `Ctrl+E` | Go to end of line |
| `Ctrl+Y` | Page up |
| `Ctrl+V` | Page down |
| `Ctrl+_` then a number | Go to a specific line (and column) |
| `M-\\` | Go to first line of file |
| `M-/` | Go to last line of file |

---

## 5. Editing

| Shortcut | Effect |
|---|---|
| `Ctrl+K` | Cut current line (or selected region) into the clipboard |
| `Ctrl+U` | Paste (uncut) whatever was last cut |
| `M-6` | Copy current line (or selection) without cutting it |
| `Ctrl+Shift+6` or start selection with `M-A` | Begin a text selection (then move cursor to extend it) |
| `Ctrl+D` | Delete character under cursor |
| `Backspace` | Delete character before cursor |
| `M-U` | Undo |
| `M-E` | Redo |
| `Ctrl+T` | Run the spell-checker (if installed) |
| `M-J` | Justify the current paragraph (wrap text neatly) |

**Selecting and cutting a block:** move to the start, `Ctrl+^` (or `M-A`) to mark the start, move the cursor to the end of the region, then `Ctrl+K` cuts the whole selection at once (instead of line by line).

---

## 6. Search & Replace

| Shortcut | Effect |
|---|---|
| `Ctrl+W` | Search forward |
| `Ctrl+W` then `Ctrl+R`, or `Ctrl+\\` | Search and replace |
| Inside a search prompt, `Alt+C` | Toggle case sensitivity |
| Inside a search prompt, `Alt+R` | Toggle regular-expression mode |
| `Alt+W` | Repeat the last search |

**Replace workflow:**
```
Ctrl+\      → opens "Search (to replace):" prompt
type pattern, Enter
type replacement, Enter
→ Nano asks Yes/No/All/Cancel for each match
```

---

## 7. Multiple Buffers (Files)

| Shortcut | Effect |
|---|---|
| `Ctrl+R` then a filename | Insert another file into the current buffer |
| `M-<` / `M->` | Switch to previous / next open buffer (if nano was started with multiple files or `-F`/multibuffer mode enabled) |
| `nano -F file1 file2` | Open multiple files as separate buffers in one session |

---

## 8. Display Options

| Shortcut | Effect |
|---|---|
| `Ctrl+C` | Show current cursor line/column position |
| `M-N` | Toggle line numbers |
| `M-P` | Toggle display of whitespace characters |
| `M-$` | Toggle "soft wrap" of long lines |
| `M-Y` | Toggle syntax highlighting on/off |

---

## 9. Configuration — `~/.nanorc`

```bash
set linenumbers          # always show line numbers
set tabsize 4              # tab width
set tabstospaces           # convert tabs to spaces
set autoindent             # keep indentation on new lines
set mouse                   # enable mouse support
include "/usr/share/nano/*.nanorc"   # enable syntax highlighting for common languages
```

---

## 10. Nano Quick Cheat Sheet

```
SAVE/EXIT   ^O (write out)   ^X (exit)
NAVIGATE    arrows   ^A (line start)   ^E (line end)   ^Y/^V (page up/down)
CUT/PASTE   ^K (cut line)   ^U (paste)   M-6 (copy)
SEARCH      ^W (search)   ^\ (replace)   M-W (repeat search)
UNDO/REDO   M-U / M-E
```

---

# PART 3: Which One Should You Use?

| Situation | Use |
|---|---|
| Quick edit of a config file over SSH | **Nano** — zero learning curve, shortcuts on-screen |
| You edit code/config for hours daily | **Vim** — the modal grammar pays for itself fast at that volume |
| Editing on a minimal/embedded system | Whichever is installed — Vi (the original, always present) is the fallback if neither Vim nor Nano exists |
| Scripted, repetitive text transformations | **Vim** — macros and Ex-command ranges do in seconds what takes minutes by hand |
| You just SSH'd into a server for one line change | **Nano** |

**One thing worth knowing:** almost every minimal Linux install ships with `vi` even when `vim` isn't installed — so knowing at least `i` (insert), `Esc`, and `:wq` (save+quit) in bare Vi is a genuine survival skill for server work, even if Nano is your daily driver.
