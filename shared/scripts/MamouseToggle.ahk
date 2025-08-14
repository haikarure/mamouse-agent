#SingleInstance Force

; Hotkey Alt+Space untuk toggle Mamouse Agent
!Space::
{
    ; Cek apakah Electron sudah berjalan
    if ProcessExist("electron.exe")
    {
        ; Tutup aplikasi jika sudah berjalan
        ProcessClose("electron.exe")
        TrayTip("Mamouse Agent ditutup", "Mamouse Agent")
    }
    else
    {
        ; Jalankan aplikasi jika belum berjalan
        ; Dapatkan direktori parent (naik dua level dari shared\scripts)
        ScriptPath := A_ScriptDir
        ParentPath := SubStr(ScriptPath, 1, InStr(ScriptPath, "\shared\scripts") - 1)

        ; Jalankan Electron langsung (karena npm tidak tersedia)
        RunWait('cmd.exe /c cd /d "' . ParentPath . '" && start /min cmd /c ".\node_modules\electron\dist\electron.exe ."', , "Hide")
        TrayTip("Mamouse Agent dijalankan", "Mamouse Agent")
    }
}

; Tampilkan notifikasi bahwa script sudah berjalan
TrayTip("Hotkey Alt+Space telah aktif", "Mamouse Agent")
