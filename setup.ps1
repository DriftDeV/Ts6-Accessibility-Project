# PowerShell Setup Script for Ts6-Accessibility-Project
param(
    [switch]$Force           # Forza la reinstallazione delle dipendenze
)

$VenvName = "ts_venv"
$PythonCommand = "python"

# 1. Verifica Python
if (-not (Get-Command $PythonCommand -ErrorAction SilentlyContinue)) {
    Write-Host "Error: Python is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# 2. Crea virtual environment se manca
if (-not (Test-Path $VenvName)) {
    Write-Host "Creating virtual environment '$VenvName'..." -ForegroundColor Cyan
    & $PythonCommand -m venv $VenvName
    $Force = $true # Se lo creo ora, devo per forza installare le dipendenze
}

$Pip = Join-Path $VenvName "Scripts\pip.exe"
$PythonVenv = Join-Path $VenvName "Scripts\python.exe"

# 3. Installa dipendenze solo se richiesto o se è la prima volta
if ($Force) {
    Write-Host "Installing/Updating dependencies..." -ForegroundColor Cyan
    & $Pip install --upgrade pip
    & $Pip install -e .
} else {
    Write-Host "Virtual environment ready. Use '.\run.ps1' to start quickly or '.\setup.ps1 -Force' to update dependencies." -ForegroundColor Green
}

# 4. Chiedi se avviare subito
$choice = Read-Host "Do you want to run the injector now? (Y/N)"
if ($choice -eq "Y" -or $choice -eq "y") {
    & $PythonVenv src\ts_master.py
}