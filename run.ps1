# Run Script for Ts6-Accessibility-Project (Windows)
$VenvName = "ts_venv"
$PythonVenv = Join-Path $VenvName "Scripts\python.exe"

if (-not (Test-Path $PythonVenv)) {
    Write-Host "Error: Virtual environment not found. Please run .\setup.ps1 first." -ForegroundColor Red
    exit 1
}

Write-Host "Starting TeamSpeak Accessibility Injector..." -ForegroundColor Cyan
& $PythonVenv src\ts_master.py

