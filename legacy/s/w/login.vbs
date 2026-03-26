Set objShell = CreateObject("WScript.Shell")
strUsername = InputBox("Enter Username:", "Login")
strPassword = InputBox("Enter Password:", "Login", "")
strSuccessURL = "https://sabbir28.github.io/"

If strUsername = "admin" And strPassword = "root" Then
    MsgBox "Login Successful", vbInformation, "Success"
    objShell.Run "start " & strSuccessURL
ElseIf strUsername = "" Or strPassword = "" Then
    MsgBox "Username and password must not be empty.", vbExclamation, "Error"
Else
    MsgBox "Login failed. Invalid username or password.", vbExclamation, "Error"
End If
