#SingleInstance Force

; Hapus shortcut lama jika ada
if FileExist(A_Startup . "\MamouseHotkey.lnk")
    FileDelete(A_Startup . "\MamouseHotkey.lnk")

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
        try
        {
            Run "cmd.exe /c cd /d " . A_ScriptDir . " && npm start",, "Hide"
            TrayTip("Mamouse Agent dijalankan", "Mamouse Agent")
        }
        catch as err
        {
            MsgBox("Error menjalankan Mamouse Agent: " . err.Message, "Error", "Icon!")
        }
    }
}

; Tambahkan ke startup Windows
try
{
    FileCreateShortcut(A_ScriptFullPath, A_Startup . "\MamouseToggle.lnk", A_ScriptDir)
}
catch as err
{
    MsgBox("Error membuat shortcut startup: " . err.Message, "Error", "Icon!")
}

; Tampilkan notifikasi bahwa script sudah berjalan
TrayTip("Hotkey Alt+Space telah aktif", "Mamouse Agent")
