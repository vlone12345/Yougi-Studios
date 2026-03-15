' AvenaBot Launcher
' This runs AvenaBot.bat in the same folder showing a proper window
Dim shell, fso, dir
Set shell = CreateObject("WScript.Shell")
Set fso   = CreateObject("Scripting.FileSystemObject")
dir       = fso.GetParentFolderName(WScript.ScriptFullName)
shell.Run "cmd /c """ & dir & "\AvenaBot.bat""", 1, False
