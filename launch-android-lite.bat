@echo off
setlocal
set "SDK=%LOCALAPPDATA%\Android\Sdk"
start "Pixel 8 API 36 Lite" /low "%SDK%\emulator\emulator.exe" -avd Pixel_8_API_36 -no-snapshot -no-audio -no-boot-anim -gpu host -memory 1536 -cores 2 -skin 720x1600
