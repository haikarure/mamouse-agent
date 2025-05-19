@echo off
echo Membersihkan entri startup lama untuk Mamouse Agent...

:: Hapus shortcut dari folder Startup
if exist "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\MamouseHotkey.lnk" (
    del /f /q "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\MamouseHotkey.lnk"
    echo Shortcut MamouseHotkey.lnk dihapus dari folder Startup.
)

:: Hapus entri registry
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "MamouseHotkey" /f >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Entri registry untuk MamouseHotkey dihapus.
) else (
    echo Tidak ada entri registry untuk MamouseHotkey.
)

echo.
echo Pembersihan selesai. Silakan restart komputer Anda.
pause
