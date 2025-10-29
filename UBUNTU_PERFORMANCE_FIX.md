# Ubuntu Performance Fix - Single Core Issue

## Problem Summary

Your i9-13900K is only running with **1 CPU core** instead of 24 cores. This causes:
- Extremely slow performance (load average 7.58 on 1 core)
- Cannot reboot (hangs)
- All apps are competing for a single core

## Root Cause

**The GRUB boot file `/etc/grub.d/06_custom_safe` contains `acpi=off` parameter.**

This disables ACPI (Advanced Configuration and Power Interface), which:
- Prevents Linux from detecting multiple CPU cores
- Causes reboot hangs (ACPI handles shutdown/reboot)
- Disables proper power management

## The File

The problematic line is:
```
linux /boot/vmlinuz-6.8.0-85-generic root=UUID=d1992f47-682f-4a8c-9a50-97755a07c718 ro nomodeset acpi=off
                                                                                                        ^^^^^^^^^^
```

## Solution

Run this command in a terminal:

```bash
sudo bash /home/ben/Downloads/pets-fresh/fix-ubuntu-performance.sh
```

Or manually:

```bash
# Backup and remove the problematic file
sudo rm /etc/grub.d/06_custom_safe

# Update GRUB
sudo update-grub

# Reboot
sudo reboot
```

## After Reboot

After rebooting, check if all cores are detected:

```bash
nproc                    # Should show 24, not 1
htop                      # Should show 24 cores
lscpu                     # Should show 24 cores, 32 threads
```

## Expected Results

✅ All 24 CPU cores detected  
✅ System runs 10-20x faster  
✅ Reboot works properly  
✅ Load average drops significantly  
✅ Apps don't compete for single core  

## Why This Happened

The `06_custom_safe` file was likely created for troubleshooting graphics issues (notice `nomodeset` parameter). Someone added `acpi=off` thinking it would help, but it caused this severe performance issue.

## Alternative: If You Need Safe Mode

If you specifically need a "safe mode" entry:
1. Don't include `acpi=off` - it breaks everything
2. Use `nomodeset` only for graphics issues
3. Or just use the GRUB menu "Advanced options" → "Recovery mode"

## Current Status

Your system is currently running with:
- **1 CPU core** (should be 24)
- **ACPI disabled** (causes reboot hangs)
- **Very slow performance**
- **Cannot reboot properly**

**YOU NEED TO REBOOT** for the fix to take effect!

