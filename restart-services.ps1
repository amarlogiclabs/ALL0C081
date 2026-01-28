$ErrorActionPreference = "SilentlyContinue"

Write-Host "🛑 Checking for running services..."

# Ports to check: 5000 (Backend), 8090 (UserService), 5173 (Vite Default), 8080 (Vite Alt)
$ports = 5000, 8090, 5173, 8080

foreach ($port in $ports) {
    $processes = Get-NetTCPConnection -LocalPort $port
    if ($processes) {
        foreach ($proc in $processes) {
            $pid = $proc.OwningProcess
            # Don't kill system idle process (0) or System (4)
            if ($pid -gt 4) {
                Write-Host "   Creating space on port $port (PID: $pid)..."
                Stop-Process -Id $pid -Force
            }
        }
    }
}

Write-Host "✅ Ports cleared."
Write-Host "🚀 Starting services using start-with-mysql.bat..."

# Adjust path to batch file if needed, assuming we are in project root
Start-Process -FilePath "cmd.exe" -ArgumentList "/c start-with-mysql.bat"
