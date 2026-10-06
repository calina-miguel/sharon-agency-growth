@echo off
setlocal
set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
"%ADB%" emu kill
taskkill /IM qemu-system-x86_64.exe /F /T
taskkill /IM emulator.exe /F /T
