# Process & Performance Monitoring — Diagnosing Slow or Crashing Services

The toolkit for answering two questions that come up constantly: **"why is this slow?"** and **"why did this crash?"** — each tool below answers a different slice of that, and the real skill is knowing which one to reach for first.

---

## 0. The Mental Model

| Symptom | Tool to reach for first |
|---|---|
| System feels sluggish overall | `top` / `htop` — get the big picture fast |
| Suspect memory pressure/swapping | `vmstat` |
| Suspect disk is the bottleneck | `iostat` |
| Need to see exactly what a process is doing right now | `strace` |
| Service crashed or won't start | `journalctl -u <service>` |

They're not competing tools — a real investigation usually chains 2–3 of these together.

---

## 1. `top` — The Universal Starting Point

```bash
top
```

### Reading the header (first 5 lines)
```
top - 14:32:01 up 3 days,  4:12,  2 users,  load average: 1.85, 2.10, 1.95
Tasks: 210 total,   2 running, 208 sleeping,   0 stopped,   0 zombie
%Cpu(s): 12.3 us,  3.1 sy,  0.0 ni, 83.9 id,  0.5 wa,  0.0 hi,  0.2 si,  0.0 st
MiB Mem :  15872 total,   2103 free,   9821 used,   3948 buff/cache
MiB Swap:   2048 total,   1200 free,    848 used.   4501 avail Mem
```

**Load average** (`1.85, 2.10, 1.95`) — the 1/5/15-minute average of how many processes were runnable (running or waiting for CPU). **This number is meaningless without knowing your core count.** Check cores with `nproc`. A load of `4.0` is fine on an 8-core machine (half-utilized) and a serious problem on a 2-core machine (2x oversubscribed).

**`%Cpu(s)` breakdown:**
| Field | Meaning |
|---|---|
| `us` | user-space CPU time (your applications) |
| `sy` | kernel/system CPU time |
| `id` | idle |
| `wa` | **iowait** — CPU sitting idle waiting on disk I/O. High `wa` = disk is the bottleneck, not CPU |
| `si`/`hi` | soft/hard interrupt handling |
| `st` | stolen time — a VM waiting on its hypervisor (relevant on cloud instances) |

### Reading the process table columns
| Column | Meaning |
|---|---|
| `PID` | process ID |
| `USER` | owning user |
| `PR` / `NI` | priority / niceness (lower NI = higher priority, range -20 to 19) |
| `VIRT` | total virtual memory the process has mapped (often much larger than actual usage — not a red flag by itself) |
| `RES` | resident memory — actual physical RAM in use, the number that usually matters |
| `S` | state: `R` running, `S` sleeping, `D` uninterruptible sleep (usually waiting on I/O — worth noting), `Z` zombie |
| `%CPU` / `%MEM` | current usage share |
| `TIME+` | total accumulated CPU time since the process started |

### Interactive commands (press while `top` is running)
| Key | Effect |
|---|---|
| `P` | sort by %CPU (default) |
| `M` | sort by %MEM |
| `T` | sort by running time |
| `k` | kill a process (prompts for PID, then signal) |
| `r` | renice a process (change its priority) |
| `1` | toggle per-core CPU breakdown instead of the aggregate |
| `c` | toggle showing the full command path/args |
| `q` | quit |

**`D` state is worth specifically knowing:** a process stuck in `D` (uninterruptible sleep) can't even be killed with `-9` until whatever I/O it's blocked on resolves — a strong signal of a disk or NFS problem, not an application bug.

---

## 2. `htop` — Same Data, Much Easier to Read

```bash
sudo apt install htop -y
htop
```

**What htop adds over top:**
- Color-coded, per-core CPU and memory meters at the top — no mental math needed
- **Tree view** (`F5`) — shows parent/child process relationships visually, immediately clarifies "what spawned what"
- **Search** (`F3`) and **filter** (`F4`) by process name
- Mouse support — click a process, click a column header to sort
- `F9` to kill (lets you pick the signal from a menu, not just guess `-9`)
- `F2` for setup — customize which columns/meters are shown

**Practical habit:** use `F5` (tree view) whenever you suspect a runaway process is spawning children — it's far faster to spot in the tree than by scanning a flat PID list.

---

## 3. `vmstat` — Memory, Swap & CPU in One Glance

```bash
vmstat 1 5      # sample every 1 second, 5 times total
```

```
procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 2  0  86000 210400  98200 3800000    0    0    45   120  850  1200 12  3 84  1  0
```

| Column | Meaning |
|---|---|
| `r` | processes waiting for CPU time right now — sustained high values mean CPU is genuinely the bottleneck |
| `b` | processes blocked, waiting on I/O |
| `swpd` | amount of memory swapped to disk |
| `free` | free memory |
| `buff` / `cache` | memory used for buffers/page cache — this is **not** wasted memory, the kernel reclaims it instantly when needed |
| `si` / `so` | swap in / swap out (per second) — **any sustained non-zero value here is a real problem**, it means the system is actively thrashing to disk |
| `bi` / `bo` | blocks in / out from block devices — raw disk I/O activity |
| `in` | interrupts per second |
| `cs` | context switches per second — very high values can indicate excessive process/thread switching overhead |
| `us/sy/id/wa/st` | same meaning as top's CPU breakdown |

**Diagnostic pattern to remember:** `si`/`so` staying above zero across multiple samples = the system doesn't have enough RAM for its workload and is actively swapping — this alone can explain "everything feels slow" better than any CPU metric will.

---

## 4. `iostat` — Disk I/O Specifically

```bash
sudo apt install sysstat -y     # provides iostat
iostat -x 1 5                     # extended stats, every 1 second, 5 times
```

```
Device    r/s   w/s   rkB/s   wkB/s  avgqu-sz  await  %util
sda       2.00  45.00  128.00  5400.00     0.85   12.30   38.5
```

| Column | Meaning |
|---|---|
| `r/s` / `w/s` | reads/writes per second |
| `rkB/s` / `wkB/s` | throughput |
| `avgqu-sz` | average queue length — I/O requests waiting their turn. Consistently above ~1 means the disk can't keep up with demand |
| `await` | average time (ms) an I/O request waits, including queue time — the number that best reflects what an application actually experiences |
| `%util` | percentage of time the device was busy servicing requests — **not** the same as "percentage of capacity used"; a single-queue device can hit 100% util while still having room, but sustained high util alongside rising `await` is a genuine bottleneck |

**Diagnostic pattern:** if `top`/`vmstat` shows high `wa` (iowait), `iostat -x` is the next stop — it tells you *which device* and *how badly*.

---

## 5. `strace` — Seeing Exactly What a Process Is Doing

`strace` traces every system call a process makes — the actual requests it sends to the kernel (open a file, read, write, connect a socket, etc). This is the tool for "why is this hanging" or "why is this failing" when the application's own error message isn't enough.

```bash
sudo apt install strace -y
```

### Attach to an already-running process
```bash
sudo strace -p <PID>
```
Watch what it's doing live — if it's stuck, the **last line printed** is almost always the syscall it's blocked on (commonly `read()`, `connect()`, or `futex()` for a lock).

### Trace a command from the start
```bash
strace ./myprogram
strace -f ./myprogram       # -f follows child processes too — essential for multi-process programs
```

### Filter to a specific category of syscalls
```bash
strace -e trace=network ./myprogram      # only network-related syscalls (connect, send, recv...)
strace -e trace=file ./myprogram           # only file-related syscalls (open, read, write, close...)
strace -e trace=open,openat ./myprogram      # just file-open attempts — great for "why can't it find this file"
```

### Summary mode — which syscalls are eating the most time
```bash
strace -c ./myprogram
```
```
% time     seconds  usecs/call     calls    syscall
------ ----------- ----------- --------- ----------------
 62.15    0.004821         120        40 read
 21.30    0.001652          82        20 write
```
This immediately tells you whether a slow program is spending its time on file I/O, network calls, or something else entirely — without guessing.

### The single most common real-world use
```bash
sudo strace -f -e trace=open,openat -p <PID> 2>&1 | grep ENOENT
```
Catches "file not found" errors live — invaluable for chasing down a service that's failing because it can't find a config file or dependency, when the application's own error message is too vague to say which file.

**Note:** attaching `strace` to a live process does add real overhead — it can noticeably slow the process down. Fine for debugging, not something to leave running on a production service under load.

---

## 6. `journalctl` — Actually Diagnosing a Service

Every systemd-managed service's output goes into the journal — this is where you go once `top`/`vmstat`/`iostat` have told you *something's* wrong and you need to know specifically what a service is doing.

### The essentials
```bash
journalctl -u nginx                 # all logs for the nginx service, oldest first
journalctl -u nginx -f                # live tail, like tail -f
journalctl -u nginx --since "10 min ago"
journalctl -u nginx --since "2026-08-20 09:00" --until "2026-08-20 10:00"
journalctl -u nginx -n 50              # just the last 50 lines
journalctl -u nginx -r                  # reverse order, newest first — good for "what just happened"
```

### Filtering by severity
```bash
journalctl -u nginx -p err              # only error-level and worse
journalctl -u nginx -p warning          # warning and worse
```
Priority levels, worst to least severe: `emerg`, `alert`, `crit`, `err`, `warning`, `notice`, `info`, `debug`.

### System-wide, not just one service
```bash
journalctl -b                # everything since the current boot
journalctl -b -1               # everything from the PREVIOUS boot — crucial after an unexpected reboot/crash
journalctl -k                 # kernel messages only (equivalent to dmesg, but persistent and filterable)
journalctl -x                  # adds extra explanatory context to messages that support it
```

### Diagnosing a crashed service — the actual workflow

**Step 1 — Check current status first, it often tells you the exit code directly:**
```bash
systemctl status nginx
```
```
Active: failed (Result: exit-code) since ...
Process: 1234 ExecStart=/usr/sbin/nginx (code=exited, status=1/FAILURE)
```

**Step 2 — Pull the logs right around the crash:**
```bash
journalctl -u nginx --since "5 min ago" -r
```

**Step 3 — Check if the kernel killed it (Out-Of-Memory killer is a very common silent cause):**
```bash
journalctl -k | grep -i "killed process"
# or
dmesg | grep -i oom
```
An OOM kill often shows up as the service just "disappearing" with no application-level error at all — the kernel terminated it to save the system, and the only trace is in the kernel log, not the service's own log.

**Step 4 — If it's a crash loop (keeps restarting), check the restart history:**
```bash
systemctl status nginx     # look at "Main PID" changing between checks, and restart count
journalctl -u nginx | grep -i "start\|stop\|fail"
```

**Step 5 — If logs alone aren't enough, reproduce it under strace:**
```bash
sudo strace -f -o trace.log /usr/sbin/nginx -g "daemon off;"
```
Running the service in the foreground under `strace` (instead of through systemd) captures the exact syscall it dies on — the highest-resolution view available short of attaching a debugger.

---

## 7. Putting It Together — Two Common Investigations

### "The server feels slow"
```
1. top / htop           → is it CPU-bound, memory-bound, or mostly idle-but-slow?
2. vmstat 1 5             → check `wa` (iowait) and `si`/`so` (swapping)
3. iostat -x 1 5            → if wa is high, confirm which device and how saturated
4. strace -c -p <PID>        → if one process is the culprit, see what it's actually spending time on
```

### "A service crashed or won't start"
```
1. systemctl status <service>          → immediate exit code / failure reason
2. journalctl -u <service> --since ... → logs right before the failure
3. journalctl -k | grep -i killed        → rule out OOM kill
4. strace -f <the command it runs>         → if still unclear, watch it fail live
```

---

## Quick Reference

```
BIG PICTURE    top   /   htop
MEMORY/SWAP    vmstat 1 5        → watch si/so and wa
DISK I/O       iostat -x 1 5      → watch await and %util
SYSCALL TRACE  strace -p <PID>   or   strace -f -c <command>
SERVICE LOGS   journalctl -u <service> -f
CRASH HISTORY  journalctl -u <service> --since "10 min ago" -r
OOM CHECK      journalctl -k | grep -i "killed process"
```
