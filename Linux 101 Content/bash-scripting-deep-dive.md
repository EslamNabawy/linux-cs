# Bash Scripting Deep Dive

Functions, arrays, loops, and — the part most tutorials skip — how to write scripts that fail loudly instead of silently corrupting something three steps later.

---

## 1. Script Anatomy

```bash
#!/usr/bin/env bash
# ^ shebang — tells the OS which interpreter runs this file.
# #!/usr/bin/env bash is more portable than #!/bin/bash (finds bash wherever it's installed)

echo "Hello, SOLO"
```

```bash
chmod +x script.sh     # make it executable
./script.sh              # run it
bash script.sh            # or run it explicitly through bash without chmod
```

---

## 2. Variables

```bash
name="SOLO"              # NO spaces around = — "name = SOLO" is a syntax error, not an assignment
echo "$name"              # always quote variables when reading them
readonly PI=3.14           # constant — reassigning it later throws an error
unset name                 # delete a variable

local x=5                  # only valid INSIDE a function — scopes the variable to that function
```

**Quoting rules that actually matter:**
```bash
var="hello world"
echo $var       # WRONG in most cases — unquoted, this splits on whitespace: prints as 2 args
echo "$var"      # RIGHT — preserves it as one string, including internal spaces
echo '$var'       # single quotes = literal, no expansion at all — prints the text $var
```

---

## 3. Arrays

### Indexed arrays
```bash
fruits=("apple" "banana" "cherry")

echo "${fruits[0]}"          # apple — array indices start at 0
echo "${fruits[@]}"           # apple banana cherry — all elements
echo "${#fruits[@]}"           # 3 — length of the array

fruits+=("mango")              # append an element
fruits[1]="blueberry"           # overwrite index 1

for f in "${fruits[@]}"; do     # correct way to iterate — quoted, with @
    echo "$f"
done

unset 'fruits[0]'                # remove one element (index 0), leaves a gap
```

### Associative arrays (key-value, bash 4+)
```bash
declare -A ages
ages["solo"]=25
ages["ali"]=30

echo "${ages[solo]}"           # 25
echo "${!ages[@]}"               # solo ali — all keys
echo "${ages[@]}"                # 25 30 — all values

for key in "${!ages[@]}"; do     # iterate keys, look up values
    echo "$key is ${ages[$key]}"
done
```

### Common array pitfalls
```bash
echo "${fruits[@]}"    # correct — each element stays separate, even with spaces inside
echo "${fruits[*]}"     # joins ALL elements into ONE string — rarely what you want
echo $fruits             # WRONG — without an index, this only gives element 0
```

---

## 4. Loops

### `for` loop — three styles
```bash
# 1. Iterate a list
for fruit in apple banana cherry; do
    echo "$fruit"
done

# 2. C-style
for ((i=0; i<5; i++)); do
    echo "Number: $i"
done

# 3. Range
for i in {1..5}; do
    echo "$i"
done

# Iterate command output (careful — see "reading files" below for a safer pattern)
for file in *.txt; do
    echo "Found: $file"
done
```

### `while` loop
```bash
count=0
while [ "$count" -lt 5 ]; do
    echo "Count: $count"
    ((count++))
done
```

**The correct way to read a file line-by-line** (avoids classic pitfalls with spaces/globbing):
```bash
while IFS= read -r line; do
    echo "Line: $line"
done < file.txt
```

### `until` loop (opposite of while — runs until the condition becomes true)
```bash
count=0
until [ "$count" -ge 5 ]; do
    echo "$count"
    ((count++))
done
```

### `break` and `continue`
```bash
for i in {1..10}; do
    [ "$i" -eq 5 ] && break        # exit the loop entirely
    [ $((i % 2)) -eq 0 ] && continue    # skip to next iteration
    echo "$i"
done
```

---

## 5. Conditionals

```bash
if [ "$1" == "yes" ]; then
    echo "Confirmed"
elif [ "$1" == "no" ]; then
    echo "Denied"
else
    echo "Unclear"
fi
```

**`[ ]` vs `[[ ]]`:** always prefer `[[ ]]` in bash — it's safer (no word-splitting/glob surprises on unquoted variables) and supports `&&`, `||`, and pattern matching directly inside it.
```bash
[[ "$name" == "SOLO" ]]         # string equality
[[ "$name" == S* ]]               # pattern match — only works inside [[ ]]
[[ -f "$file" && -r "$file" ]]     # file exists AND is readable
```

**Common test operators:**

| Test | Meaning |
|---|---|
| `-eq -ne -lt -le -gt -ge` | numeric comparisons |
| `== !=` | string equality/inequality |
| `-z "$s"` | string is empty |
| `-n "$s"` | string is non-empty |
| `-f file` | file exists and is a regular file |
| `-d dir` | directory exists |
| `-r -w -x file` | readable / writable / executable |
| `-e path` | path exists (any type) |

### `case` statement — cleaner than a long if/elif chain
```bash
case "$1" in
    start)
        echo "Starting..."
        ;;
    stop)
        echo "Stopping..."
        ;;
    restart|reload)
        echo "Restarting..."
        ;;
    *)
        echo "Usage: $0 {start|stop|restart}"
        exit 1
        ;;
esac
```

---

## 6. Functions

```bash
greet() {
    local name="$1"        # $1 = first argument passed to the function — always 'local' it
    echo "Hello, $name"
}

greet "SOLO"                # call it like a command

# All positional parameters inside a function:
show_args() {
    echo "First: $1"
    echo "All: $@"           # each argument as a separate word
    echo "Count: $#"          # number of arguments passed
}
show_args a b c
```

**Return values — the part that trips people up:** bash functions don't "return" data the way most languages do. `return` only sets an **exit code** (0–255). To get actual data out, either `echo` it and capture with `$()`, or write into a variable.

```bash
add() {
    local result=$(( $1 + $2 ))
    echo "$result"          # "return" data by printing it
}
sum=$(add 3 4)               # capture it via command substitution
echo "$sum"                    # 7

is_even() {
    (( $1 % 2 == 0 ))          # return TRUE/FALSE as an exit code, not printed text
}
if is_even 4; then
    echo "even"
fi
```

---

## 7. Error Handling — The Part Most Scripts Skip

By default, bash **keeps going after a failed command** — this is the single biggest source of scripts that silently do the wrong thing.

### The essential header for almost every script you write
```bash
set -euo pipefail
```

| Flag | Effect |
|---|---|
| `set -e` | Exit immediately if any command fails (non-zero exit code) |
| `set -u` | Exit if you reference an unset variable (catches typos like `$FIL` instead of `$FILE`) |
| `set -o pipefail` | A pipeline (`a \| b \| c`) fails if **any** command in it fails, not just the last one |

**Why `pipefail` matters specifically:** without it, `bad_command | grep something` only checks `grep`'s exit code — if `bad_command` itself failed, the pipeline still reports success as long as `grep` didn't error. This hides real failures constantly.

```bash
false | echo "done"          # WITHOUT pipefail: exit code 0 — looks successful!
set -o pipefail
false | echo "done"          # WITH pipefail: exit code reflects false's failure
```

### `set -e` gotchas — it doesn't catch everything
```bash
set -e
if some_command; then     # commands inside an if CONDITION don't trigger set -e — this is intentional
    echo "ok"
fi

some_command || true        # explicitly suppresses set -e for that one line
some_command && echo "ok"    # also won't trigger set -e on failure of some_command
```

### Debug/trace mode
```bash
set -x     # print every command before running it — invaluable when a script does something unexpected
set +x     # turn it back off
```

Run a whole script in trace mode without editing it:
```bash
bash -x script.sh
```

### `trap` — running cleanup code no matter how the script exits

`trap` catches signals or the script's own exit and runs a function — essential for cleaning up temp files, releasing locks, or logging what happened, even when the script crashes or gets killed.

```bash
cleanup() {
    echo "Cleaning up..."
    rm -f "$TMPFILE"
}
trap cleanup EXIT          # runs on ANY exit — success, error, or Ctrl+C

trap 'echo "Interrupted!"; exit 1' INT     # specifically catch Ctrl+C (SIGINT)
trap 'echo "Error on line $LINENO"' ERR      # runs whenever a command fails (with set -e active)
```

**Practical temp-file pattern:**
```bash
TMPFILE=$(mktemp)
trap 'rm -f "$TMPFILE"' EXIT     # guarantees cleanup even if the script dies halfway through
echo "some data" > "$TMPFILE"
```

### Checking exit codes explicitly
```bash
some_command
if [ $? -ne 0 ]; then          # $? = exit code of the LAST command run
    echo "some_command failed" >&2
    exit 1
fi

# Cleaner, more idiomatic version of the same thing:
if ! some_command; then
    echo "some_command failed" >&2
    exit 1
fi
```

---

## 8. Writing Scripts That Don't Silently Fail

A checklist, not just theory:

1. **Start every script with `set -euo pipefail`** unless you have a specific reason not to.
2. **Validate arguments before using them:**
   ```bash
   if [ $# -lt 1 ]; then
       echo "Usage: $0 <filename>" >&2
       exit 1
   fi
   FILE="$1"
   if [ ! -f "$FILE" ]; then
       echo "Error: $FILE does not exist" >&2
       exit 1
   fi
   ```
3. **Send errors to stderr (`>&2`), not stdout** — keeps error messages separate from real output, so anything piping your script's output doesn't accidentally consume an error message as data.
4. **Use meaningful, distinct exit codes** — `0` for success, and different non-zero codes for different failure types, so callers (or you, six months later) can tell *what* failed without re-reading the script.
5. **Use `trap ... EXIT`** for any script that creates temp files, acquires locks, or opens connections — cleanup should be automatic, not something you remember to add at the bottom (which never runs if the script dies early anyway).
6. **Quote every variable expansion** (`"$var"`, `"${array[@]}"`) — the single most common source of scripts that "work on my machine" and break on filenames with spaces.
7. **Never trust `$1`/`$2` blindly** — a script called with the wrong number of arguments should fail with a clear usage message, not proceed with an empty/unset variable and do something wrong silently.
8. **Log with timestamps** for anything long-running or cron-scheduled — when it fails at 3 AM, you want to know *when*, not just *that*:
   ```bash
   log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
   log "Starting backup..."
   ```
9. **Run `shellcheck` on every script before trusting it.** It's a static analyzer that catches quoting bugs, unreachable code, and dozens of other classic bash mistakes before you ever run the script:
   ```bash
   sudo apt install shellcheck -y
   shellcheck script.sh
   ```

---

## 9. String Manipulation

```bash
str="Hello, World"

echo "${#str}"              # 12 — length
echo "${str:7}"               # World — substring from index 7
echo "${str:7:3}"              # Wor — substring, 3 chars starting at index 7
echo "${str/World/Bash}"        # Hello, Bash — replace first match
echo "${str//o/0}"               # Hell0, W0rld — replace ALL matches
echo "${str^^}"                   # HELLO, WORLD — uppercase
echo "${str,,}"                    # hello, world — lowercase
```

---

## 10. Input & Output

```bash
read -p "Enter your name: " name     # prompt + capture input
echo "Hi, $name"

result=$(ls -la)                       # command substitution — capture command output into a variable

cat <<EOF                               # here-doc — multi-line text block
This is line 1
This is line 2, with a variable: $name
EOF
```

---

## 11. A Hardened Script Template

Putting it all together — this is a reasonable default skeleton for any real script:

```bash
#!/usr/bin/env bash
set -euo pipefail

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
error() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERROR: $*" >&2; }

cleanup() {
    log "Cleaning up..."
    [ -n "${TMPFILE:-}" ] && rm -f "$TMPFILE"
}
trap cleanup EXIT
trap 'error "Failed on line $LINENO"' ERR

usage() {
    echo "Usage: $0 <input_file>" >&2
    exit 1
}

# --- Validate input ---
[ $# -lt 1 ] && usage
INPUT_FILE="$1"
[ ! -f "$INPUT_FILE" ] && { error "$INPUT_FILE not found"; exit 1; }

# --- Main logic ---
TMPFILE=$(mktemp)
log "Processing $INPUT_FILE..."
grep "pattern" "$INPUT_FILE" > "$TMPFILE"
log "Found $(wc -l < "$TMPFILE") matches"

log "Done."
```

This template: fails fast on any error, catches unset variables, catches pipeline failures, logs with timestamps, cleans up its temp file no matter how it exits, and validates its input before touching it — the combination that turns "script that mostly works" into "script you can actually trust in a cron job."
