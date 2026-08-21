# The Linux Boot Process — BIOS/UEFI → GRUB → systemd

Every stage a machine passes through between "power button pressed" and "login prompt," and — the actual point of this guide — how to tell *which* stage failed when a machine won't boot.

---

## 0. The Full Chain, At a Glance

```
Power on
   │
   ▼
1. BIOS/UEFI Firmware  →  hardware self-test, pick a boot device
   │
   ▼
2. Bootloader (GRUB)     →  find and load a kernel
   │
   ▼
3. Kernel + initramfs      →  kernel initializes hardware, mounts a temporary root
   │
   ▼
4. systemd (PID 1)           →  mounts the real root filesystem, starts all services in dependency order
   │
   ▼
5. Target reached (login screen / shell prompt)
```

Every boot failure lives in exactly one of these stages — the entire diagnostic skill is recognizing *which* one from what you see on screen.

---

## 1. Stage 1: BIOS / UEFI Firmware

The firmware is code baked into the motherboard, running before any OS exists. It has one job: run hardware checks, then hand control to a bootable device.

### BIOS vs UEFI
| | Legacy BIOS | UEFI (modern standard) |
|---|---|---|
| Age | Original, decades-old standard | Modern replacement, standard on hardware since ~2012+ |
| Disk requirement | MBR partition table | GPT partition table (with an EFI System Partition) |
| Boot process | Reads the first 512 bytes (MBR) of the boot disk directly | Reads an actual `.efi` executable file from the ESP |
| Secure Boot | Not supported | Supported — cryptographically verifies the bootloader before running it |
| Max disk size for boot drive | 2TB | Effectively unlimited |

### What happens in this stage
1. **POST** (Power-On Self-Test) — checks RAM, CPU, attached devices are present and functional.
2. Firmware consults its **boot order** — an ordered list of devices to try (disk, USB, network/PXE, etc).
3. For UEFI: it looks for a bootloader `.efi` file on the **EFI System Partition (ESP)** — commonly mounted at `/boot/efi` on a running Linux system — typically `/EFI/<distro>/grubx64.efi` or similar.
4. For legacy BIOS: it loads the first 512 bytes (the Master Boot Record) of the selected disk, which contains a tiny bit of bootloader code (GRUB Stage 1).

### Symptoms that mean the failure is HERE
- No display output at all, no beep codes, fans spin but nothing happens → hardware/POST failure, not a Linux problem
- `No bootable device found` / `Boot device not found` → firmware can't find anything to boot at all — wrong boot order, disk not detected, or the ESP/MBR itself is missing or corrupted
- Machine goes straight into the firmware setup screen instead of booting → boot order is misconfigured, or it's failing every device in the list and falling through to setup

### What to check
- Enter the firmware setup (usually `Del`, `F2`, `F10`, or `Esc` at power-on, varies by motherboard) and confirm:
  - The boot drive is actually detected/listed
  - Boot order has the correct drive first
  - Secure Boot isn't blocking an unsigned bootloader (a real issue if you've installed a custom kernel or third-party GRUB build)

---

## 2. Stage 2: GRUB (Bootloader)

GRUB's job: find the actual Linux kernel and initramfs, load them into memory, and hand off control.

### GRUB's own stages (relevant mainly for legacy BIOS)
```
Stage 1  → tiny code in the MBR, just enough to load Stage 1.5/2
Stage 1.5 → filesystem drivers, lets GRUB read the actual /boot partition
Stage 2   → the full GRUB environment — reads grub.cfg, shows the boot menu
```
On UEFI systems this is simplified — the `.efi` file loaded directly from the ESP largely *is* the equivalent of Stage 2.

### Key files
```bash
/boot/grub/grub.cfg          # the ACTUAL config GRUB reads at boot — auto-generated, don't hand-edit
/etc/default/grub               # the file you SHOULD edit — human-readable settings
/etc/grub.d/                     # scripts that generate grub.cfg's contents
```

**Critical rule:** never hand-edit `/boot/grub/grub.cfg` directly — it's regenerated automatically and your changes will be silently lost. Edit `/etc/default/grub`, then regenerate:
```bash
sudo update-grub                          # Debian/Ubuntu
sudo grub2-mkconfig -o /boot/grub2/grub.cfg   # RHEL/Fedora
```

### Common settings in `/etc/default/grub`
```
GRUB_DEFAULT=0                    # which menu entry boots by default (0 = first)
GRUB_TIMEOUT=5                      # seconds the menu is shown before auto-booting
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"    # kernel boot parameters
```

### Interacting with GRUB live at boot
- Hold `Shift` (BIOS) or repeatedly tap `Esc` (UEFI) during boot to force the GRUB menu to appear if it's hidden/too fast to catch.
- At the GRUB menu, press `e` to **edit** a boot entry's parameters for this boot only (doesn't persist) — useful for adding `single` or removing `quiet splash` to see what's actually happening.
- Press `c` to drop into the **GRUB command line** — a minimal shell for manually specifying a kernel to boot when the configured entries are broken.

### Symptoms that mean the failure is HERE
- `error: no such partition` / `error: file not found` at a GRUB prompt → grub.cfg is pointing at a partition/UUID that's changed or doesn't exist (very common after resizing partitions, or a UUID mismatch — same root cause as the fstab issues from your storage guide)
- Dropped into a bare `grub rescue>` prompt → GRUB's own core files can't be found — the ESP/boot partition itself may be damaged or GRUB's install is broken
- GRUB menu shows, but every entry fails the same way → likely a kernel/initramfs problem (next stage), not GRUB itself

### Manually booting from a `grub rescue>` prompt (get in, then fix it properly)
```
grub rescue> ls                       # list available drives/partitions
grub rescue> ls (hd0,gpt2)/            # inspect a partition's contents to find the right one
grub rescue> set root=(hd0,gpt2)
grub rescue> set prefix=(hd0,gpt2)/boot/grub
grub rescue> insmod normal
grub rescue> normal                    # attempts to load the full GRUB environment from here
```

---

## 3. Stage 3: Kernel & initramfs

Once GRUB hands off, the actual Linux kernel loads into memory and starts running.

### What initramfs is for
The kernel alone often can't mount the real root filesystem yet — it might need drivers for RAID, LVM, encrypted disks, or unusual storage controllers, which aren't compiled directly into the kernel. **initramfs** (initial RAM filesystem) is a small temporary root filesystem, loaded into memory alongside the kernel, that has just enough tools/drivers to find and mount the *real* root filesystem — after which the kernel switches over (`pivot_root`) and initramfs's job is done.

```bash
/boot/vmlinuz-<version>     # the kernel image itself
/boot/initrd.img-<version>    # the initramfs
```

**Regenerating initramfs** (needed after certain driver/LVM/encryption config changes):
```bash
sudo update-initramfs -u                      # Debian/Ubuntu
sudo dracut --force                              # RHEL/Fedora
```

### Symptoms that mean the failure is HERE
- **Kernel panic** — the screen fills with a wall of technical output ending in `Kernel panic - not syncing: ...` → often a missing/corrupt initramfs, an incompatible kernel module, or (on real hardware) a driver issue for the boot storage controller
- `Gave up waiting for root device` → initramfs can't find/mount the real root filesystem — frequently a UUID mismatch in the kernel command line or initramfs not having the right storage driver
- Boot hangs indefinitely with no error, just a blinking cursor after the kernel starts loading → often a graphics driver issue; try removing `quiet splash` from the GRUB kernel parameters (press `e` at the GRUB menu) to see actual boot messages instead of a blank splash screen

### What to check
```bash
# once booted (or from a live USB, chrooted into the broken system):
ls -la /boot/                      # confirm vmlinuz and initrd.img actually exist and aren't zero-byte
cat /etc/default/grub | grep CMDLINE   # check kernel parameters for anything obviously wrong
```

---

## 4. Stage 4: systemd (PID 1)

Once the real root filesystem is mounted, the kernel starts the very first userspace process — on virtually every modern distro, that's `systemd`, always PID 1. From here, systemd's job is to bring the system up to a target state by starting units (services, mounts, sockets, etc.) in dependency order.

### Targets — the systemd replacement for old-style "runlevels"
| Target | Roughly equivalent to | Purpose |
|---|---|---|
| `poweroff.target` | runlevel 0 | shutdown |
| `rescue.target` | runlevel 1 | single-user mode — minimal, root shell, most services not started |
| `multi-user.target` | runlevel 3 | full multi-user system, no GUI |
| `graphical.target` | runlevel 5 | multi-user + display manager/GUI |
| `emergency.target` | (no old equivalent) | absolute minimum — even less than rescue, drops you to a root shell with almost nothing mounted, used when something as fundamental as fstab is broken |

```bash
systemctl get-default            # what target boots by default
sudo systemctl set-default multi-user.target    # e.g. disable booting to a GUI
```

### Symptoms that mean the failure is HERE
- Machine boots, kernel loads fine, but **drops into emergency mode** with a message like `You are in emergency mode` → almost always a bad `/etc/fstab` entry (see your fstab deep-dive guide) or a critical mount failing
- Boots to a login prompt eventually, but takes a very long time → a specific unit is hanging waiting on a dependency (commonly network-related units waiting for a network that never comes up, especially on machines with unreliable NICs or missing `nofail`/`noauto` on fstab entries)
- One specific service fails repeatedly but the rest of the system is fine → that's a service-level problem, not a boot-chain problem — see your process/journalctl guide for that investigation

### Diagnosing systemd-stage boot problems
```bash
systemd-analyze                     # total boot time breakdown, by stage (firmware/loader/kernel/userspace)
systemd-analyze blame                 # every unit, sorted by how long it took to start — find the slow one fast
systemd-analyze critical-chain         # shows the actual dependency chain that determined total boot time
journalctl -b                          # full log of the current boot
journalctl -b -1                        # full log of the PREVIOUS boot — essential after an unexpected reboot/crash
```

### Recovering from emergency/rescue mode
```bash
# you're typically dropped into a root shell automatically here
mount -o remount,rw /              # root is often mounted read-only in this mode — fix that first
nano /etc/fstab                      # find and fix (or comment out with #) the offending line
systemctl daemon-reload               # if you changed a unit file instead
reboot
```

---

## 5. Full Diagnostic Flowchart

```
No display, no beeps at all
   → hardware/PSU/RAM issue, not a boot-chain problem — check physical hardware first

Firmware setup screen, or "No bootable device"
   → Stage 1 (BIOS/UEFI) — check boot order, disk detection, Secure Boot setting

"grub rescue>" prompt, or "error: no such partition"
   → Stage 2 (GRUB) — grub.cfg pointing at a wrong/missing partition, reinstall GRUB (below)

Kernel panic wall of text
   → Stage 3 (kernel/initramfs) — corrupt initramfs, bad kernel param, missing driver

Boots into "emergency mode"
   → Stage 4 (systemd) — almost always fstab; check /etc/fstab first, always

Boots but a specific service is broken/slow
   → not a boot-chain issue at all — this is a service-level investigation
     (journalctl -u <service>, systemd-analyze blame)
```

---

## 6. Reinstalling GRUB (When It's Genuinely Broken)

If GRUB itself is damaged (common after a Windows reinstall overwrites the MBR/ESP, or a failed update), you need to boot from a live USB and repair it from there.

**Step 1 — Boot a live USB (Ubuntu/Debian live environment works fine for this even on other distros' broken installs).**

**Step 2 — Identify and mount your actual root partition:**
```bash
lsblk                              # find your real root partition, e.g. /dev/sda2
sudo mount /dev/sda2 /mnt
sudo mount /dev/sda1 /mnt/boot/efi   # only if UEFI — mount the ESP too
```

**Step 3 — Bind the necessary system directories and chroot in:**
```bash
for dir in /dev /dev/pts /proc /sys /run; do sudo mount --bind $dir /mnt$dir; done
sudo chroot /mnt
```

**Step 4 — Reinstall GRUB from inside the chroot:**
```bash
grub-install /dev/sda                 # legacy BIOS — target the whole disk, not a partition
# or, for UEFI:
grub-install --target=x86_64-efi --efi-directory=/boot/efi --bootloader-id=GRUB
update-grub
```

**Step 5 — Exit and reboot:**
```bash
exit
sudo reboot
```

---

## Quick Reference

```
STAGE 1 (firmware)   No display / "no bootable device"   → check boot order, disk detection
STAGE 2 (GRUB)         "grub rescue>" prompt                → grub.cfg broken, reinstall GRUB
STAGE 3 (kernel)        Kernel panic wall of text              → bad initramfs/kernel param
STAGE 4 (systemd)        "emergency mode"                        → check /etc/fstab FIRST

DIAGNOSTIC COMMANDS
  systemd-analyze              → total boot time, by stage
  systemd-analyze blame          → slowest units, sorted
  journalctl -b -1                → previous boot's full log
  journalctl -k                    → kernel messages only
```
