# Disk & Storage Management — Partitions, LVM, Mounting & fstab

How storage actually fits together on Linux: disk → partition → filesystem → mount point — and the file that ties it all together at boot.

---

## 1. The Storage Hierarchy

```
Physical disk (/dev/sda)
   └─ Partition (/dev/sda1)
        └─ Filesystem (ext4, xfs, etc. — formatted onto the partition)
             └─ Mount point (/, /home, /mnt/data — where it becomes accessible in the tree)
```

A raw disk is useless until it's partitioned; a partition is useless until it has a filesystem; a filesystem is inaccessible until it's mounted somewhere in the directory tree. Every storage task on Linux is really just moving down (or up) this chain.

---

## 2. Viewing Disks & Partitions

```bash
lsblk                     # tree view of all block devices and their partitions — start here, always
lsblk -f                   # same, plus filesystem type and UUID
sudo fdisk -l               # detailed partition table info, needs root
sudo parted -l               # same idea, better for GPT disks
blkid                         # list filesystem UUIDs and types for every device
df -h                          # disk usage of currently MOUNTED filesystems
du -sh /path/to/dir              # disk usage of a specific directory (sums recursively)
```

**Reading `lsblk` output:**
```
NAME   SIZE  TYPE  MOUNTPOINT
sda     500G  disk
├─sda1   512M part  /boot/efi
├─sda2    50G  part  /
└─sda3  449.5G part  /home
```
`disk` = the whole physical device; `part` = a partition on it. The indentation shows the parent-child relationship.

---

## 3. Partitioning

### MBR vs GPT — know which you're working with
| | MBR (older) | GPT (modern) |
|---|---|---|
| Max partitions | 4 primary (or 3 + extended) | 128 |
| Max disk size | 2TB | Effectively unlimited |
| Boot mode | BIOS legacy | UEFI (also supports legacy) |
| Use today | Only for compatibility with very old systems | Default choice for anything new |

### Partitioning with `fdisk` (MBR-friendly, works on GPT too)

**Step 1 — Enter fdisk on the target disk (never a mounted/in-use one):**
```bash
sudo fdisk /dev/sdb
```

**Step 2 — Inside the fdisk prompt, key commands:**
```
n     → create a new partition
p     → print the current partition table
d     → delete a partition
t     → change a partition's type
w     → write changes to disk and exit (nothing is applied until this)
q     → quit WITHOUT saving — your escape hatch if you're unsure
```

**Step 3 — Creating a partition, walked through:**
```
Command: n
Partition type: p (primary) or e (extended)
Partition number: (accept default, e.g. 1)
First sector: (accept default — start right after the previous partition)
Last sector: +50G   (or accept default to use all remaining space)
Command: w    → commits it
```

### Partitioning with `parted` (better for GPT, scriptable)
```bash
sudo parted /dev/sdb
(parted) mklabel gpt              # initialize a GPT partition table — WARNING: wipes existing partition table
(parted) mkpart primary ext4 0% 50%    # create a partition spanning the first half of the disk
(parted) print                       # verify
(parted) quit
```

**After creating any partition, the kernel needs to notice it:**
```bash
sudo partprobe /dev/sdb     # re-reads the partition table without a reboot
```

---

## 4. Creating a Filesystem

A fresh partition is just empty space until it's formatted:

```bash
sudo mkfs.ext4 /dev/sdb1       # format as ext4 — the common general-purpose default
sudo mkfs.xfs /dev/sdb1         # xfs — strong for large files, used a lot in server/DB contexts
sudo mkfs.vfat -F 32 /dev/sdb1   # FAT32 — for cross-compatibility with Windows/embedded devices
```

| Filesystem | Good for |
|---|---|
| `ext4` | General-purpose default on most Linux distros — mature, reliable |
| `xfs` | Large files, high-throughput workloads (common on RHEL-family servers) |
| `btrfs` | Snapshots, built-in RAID-like features, copy-on-write |
| `vfat`/`exfat` | Cross-OS compatibility (USB drives you'll also plug into Windows) |

**This step is destructive** — formatting erases whatever was previously on that partition. Always confirm the device name with `lsblk` immediately before running `mkfs.*`.

---

## 5. Mounting — Temporary (Manual)

```bash
sudo mkdir -p /mnt/data          # the mount point must already exist as a directory
sudo mount /dev/sdb1 /mnt/data     # attach the filesystem there
mount | grep sdb1                    # confirm it's mounted, and see the options it mounted with
sudo umount /mnt/data                 # detach it — always do this before physically removing the device
```

**If `umount` refuses ("target is busy"):**
```bash
sudo lsof /mnt/data     # find which process still has a file open there
sudo fuser -m /mnt/data   # alternative way to find the culprit process
```
Never force-unmount a device that's actively being written to — see the file-corruption guide for why.

**Important: manual mounts like this vanish on reboot.** For anything that needs to persist, it belongs in `/etc/fstab` — which is the rest of this guide.

---

## 6. LVM — Logical Volume Management

LVM adds a flexible layer *between* raw partitions and filesystems, letting you resize, combine, and snapshot storage without being locked into a partition's original fixed size.

### Core concepts
```
Physical Volume (PV)  →  a raw disk or partition, initialized for LVM use
Volume Group (VG)       →  a pool combining one or more PVs into one big space
Logical Volume (LV)      →  a resizable "virtual partition" carved out of a VG
```

Think of the VG as a shared pool of storage, and LVs as flexible allocations from that pool — you can grow an LV later by just giving it more of the pool, without the rigid "adjacent free space" constraint raw partitions have.

### Step-by-step LVM setup

**Step 1 — Turn a raw partition/disk into a Physical Volume:**
```bash
sudo pvcreate /dev/sdb1
sudo pvdisplay        # verify
```

**Step 2 — Create a Volume Group from one or more PVs:**
```bash
sudo vgcreate data_vg /dev/sdb1
sudo vgdisplay          # verify — shows total/free space in the group
```

**Step 3 — Carve out a Logical Volume from the group:**
```bash
sudo lvcreate -L 20G -n data_lv data_vg     # 20GB LV named "data_lv" inside "data_vg"
sudo lvdisplay                                  # verify
```

**Step 4 — Format and mount it like any normal partition:**
```bash
sudo mkfs.ext4 /dev/data_vg/data_lv
sudo mkdir -p /mnt/data
sudo mount /dev/data_vg/data_lv /mnt/data
```

### Resizing — the actual payoff of using LVM
```bash
sudo lvextend -L +10G /dev/data_vg/data_lv     # grow the LV by 10GB (needs free space in the VG)
sudo resize2fs /dev/data_vg/data_lv               # grow the ext4 filesystem to fill the new LV size
# for xfs, the equivalent is:
sudo xfs_growfs /mnt/data
```

**Note:** shrinking is riskier and filesystem-dependent (ext4 supports it offline; xfs does not support shrinking at all) — always back up before attempting a shrink.

### Snapshots — point-in-time copies for safe experimentation/backups
```bash
sudo lvcreate -L 5G -s -n data_snap /dev/data_vg/data_lv     # create a snapshot
# ... do risky work on the original LV, or back up the snapshot ...
sudo lvremove /dev/data_vg/data_snap                            # remove the snapshot when done
```

---

## 7. `/etc/fstab` — The Real Deep Dive

This is the file that tells the system what to mount automatically at every boot. Get it wrong and the machine can fail to boot entirely — so understanding every field matters.

### Anatomy of a line

```
UUID=1234-5678  /mnt/data  ext4  defaults  0  2
   │                │         │       │      │  │
   │                │         │       │      │  └─ fsck order (pass)
   │                │         │       │      └──── dump flag
   │                │         │       └─────────── mount options
   │                │         └─────────────────── filesystem type
   │                └───────────────────────────── mount point
   └────────────────────────────────────────────── device identifier
```

Six fields, always space/tab-separated, always in this order.

### Field 1: Device identifier — and why UUID beats `/dev/sdX`

```
/dev/sdb1                                      # device path — WORKS but is unstable
UUID=1234-5678-ABCD                             # stable identifier tied to the filesystem itself
LABEL=mydata                                     # a human-assigned label, if you set one
```

**Why this matters:** `/dev/sdb1` is assigned by *detection order* at boot — plug in a USB drive, add a new disk, or have a drive fail, and the same physical disk you meant might now be `/dev/sdc1` instead. `/etc/fstab` entries using raw device paths can silently mount the **wrong disk** at the **right mount point** after such a change. UUIDs are generated when the filesystem is created and never change, regardless of detection order.

**Find your UUIDs:**
```bash
sudo blkid
# or
lsblk -f
```

### Field 2: Mount point
The directory this filesystem attaches to — must already exist (`mkdir -p` it first if it doesn't).

### Field 3: Filesystem type
`ext4`, `xfs`, `vfat`, `ntfs`, `swap`, or `auto` (let the kernel detect it — fine for removable media, not recommended for critical system mounts).

### Field 4: Mount options — the field most people leave at `defaults` and never learn

| Option | Effect |
|---|---|
| `defaults` | Shorthand for: `rw, suid, dev, exec, auto, nouser, async` |
| `ro` / `rw` | Read-only / read-write |
| `noauto` | Don't mount automatically at boot — only mounts when you explicitly run `mount /mountpoint` |
| `nofail` | **Critical for external/removable drives** — if the device isn't present at boot, skip it instead of hanging or dropping into emergency mode |
| `user` | Allow non-root users to mount it |
| `nouser` | Only root can mount it |
| `exec` / `noexec` | Allow / block executing binaries from this filesystem |
| `suid` / `nosuid` | Honor / ignore setuid bits on this filesystem — `nosuid` is a real security hardening step for untrusted removable media |
| `async` / `sync` | Buffered (faster) vs immediate (safer, slower) writes |

**A very common real mistake:** adding a second internal or external drive to `/etc/fstab` without `nofail`. If that drive is ever disconnected, missing, or fails, the **entire boot process hangs** waiting for it — turning a "drive I use sometimes" into "reason the whole server won't come up." Always pair external/optional drives with `nofail` (and usually `noauto` too, if you don't need it mounted every single boot).

```
UUID=1234-5678  /mnt/backup-drive  ext4  defaults,nofail  0  2
```

### Field 5: Dump flag
Legacy — controls whether the ancient `dump` backup utility includes this filesystem. Almost nobody uses `dump` anymore. Convention: `1` for the root filesystem, `0` for everything else. Safe to always set `0` on modern systems.

### Field 6: fsck pass order
Controls filesystem-check order and whether it happens at all:
- `0` — never fsck this filesystem (correct for swap, removable media, network mounts)
- `1` — check first (reserved for the **root filesystem only**)
- `2` — check after root, for everything else that should be checked

### Testing fstab changes safely — never just reboot and hope

**Step 1 — Edit the file:**
```bash
sudo nano /etc/fstab     # or vim
```

**Step 2 — Test it WITHOUT rebooting:**
```bash
sudo mount -a     # attempts to mount everything in fstab that isn't already mounted
```
If there's a syntax error or a bad UUID, `mount -a` reports it immediately — on a live system, where you can still fix it. A reboot with a broken fstab, by contrast, can drop you into **emergency mode**, a minimal recovery shell, at boot.

**Step 3 — Verify what actually got mounted:**
```bash
df -h
mount | grep /mnt/data
```

### Recovering from a broken fstab that already caused a boot failure
If you do end up in emergency mode after a bad edit:
```bash
# emergency mode typically drops you to a root shell automatically
mount -o remount,rw /               # root may be mounted read-only in this mode — fix that first
nano /etc/fstab                       # fix or comment out the bad line with a leading #
reboot
```
If it won't even reach emergency mode, boot from a live USB, mount the disk manually, and edit `/etc/fstab` from there.

---

## 8. Swap in fstab

**Swap partition:**
```
UUID=abcd-1234  none  swap  sw  0  0
```

**Swap file (common on cloud/VPS instances without a dedicated swap partition):**
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```
Then in fstab:
```
/swapfile  none  swap  sw  0  0
```

---

## 9. Checking & Repairing Filesystems

```bash
sudo fsck /dev/sdb1        # NEVER run on a mounted filesystem — unmount first
sudo fsck -f /dev/sdb1      # force a check even if the filesystem looks clean
```
`fsck` on the root filesystem specifically requires booting into single-user/rescue mode, since root can't be unmounted while the system is running from it.

---

## 10. Ongoing Disk Usage Monitoring

```bash
df -h                     # free/used space per mounted filesystem
du -sh /var/log             # total size of a specific directory
du -h --max-depth=1 /home    # size of each immediate subdirectory — good for hunting what's eating space
ncdu /                        # interactive, navigable disk usage explorer (install: sudo apt install ncdu)
```

---

## Quick Reference Summary

```
VIEW        lsblk   lsblk -f   df -h   blkid
PARTITION   fdisk /dev/sdX   or   parted /dev/sdX
FORMAT      mkfs.ext4 /dev/sdX1
MOUNT (temp) mount /dev/sdX1 /mnt/point
MOUNT (perm) edit /etc/fstab, then: mount -a to test
LVM CHAIN   pvcreate → vgcreate → lvcreate → mkfs → mount
FSTAB SAFETY ALWAYS use UUID, ALWAYS use nofail on optional drives, ALWAYS test with mount -a before reboot
```
