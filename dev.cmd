@ECHO OFF
SETLOCAL
CD /D "%~dp0"

REM If PowerShell blocks npm.ps1 (unsigned), run via npm.cmd:
npm.cmd run dev
