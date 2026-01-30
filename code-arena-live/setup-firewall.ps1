# Setup Windows Firewall Rules for CodeVerse Development Servers
# Run this script as Administrator

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "CodeVerse Firewall Configuration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$currentPrincipal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
$isAdmin = $currentPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click on PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 1
}

Write-Host "✓ Running as Administrator" -ForegroundColor Green
Write-Host ""

# Define firewall rules
$rules = @(
    @{
        Name = "CodeVerse Frontend (Vite)"
        Port = 5174
        Protocol = "TCP"
        Description = "Allow incoming connections to Vite dev server (Frontend)"
    },
    @{
        Name = "CodeVerse Backend (Node.js)"
        Port = 5000
        Protocol = "TCP"
        Description = "Allow incoming connections to Node.js backend server"
    },
    @{
        Name = "CodeVerse User Service (Spring Boot)"
        Port = 8090
        Protocol = "TCP"
        Description = "Allow incoming connections to Spring Boot microservice"
    }
)

# Remove existing rules if they exist
Write-Host "Removing existing firewall rules (if any)..." -ForegroundColor Yellow
foreach ($rule in $rules) {
    $existingRule = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if ($existingRule) {
        Remove-NetFirewallRule -DisplayName $rule.Name
        Write-Host "  - Removed old rule: $($rule.Name)" -ForegroundColor Gray
    }
}
Write-Host ""

# Add new firewall rules
Write-Host "Adding new firewall rules..." -ForegroundColor Yellow
foreach ($rule in $rules) {
    try {
        New-NetFirewallRule `
            -DisplayName $rule.Name `
            -Direction Inbound `
            -Protocol $rule.Protocol `
            -LocalPort $rule.Port `
            -Action Allow `
            -Profile Any `
            -Description $rule.Description `
            -Enabled True | Out-Null
        
        Write-Host "  ✓ Added: $($rule.Name) (Port $($rule.Port)/$($rule.Protocol))" -ForegroundColor Green
    }
    catch {
        Write-Host "  ✗ Failed to add: $($rule.Name)" -ForegroundColor Red
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Firewall Configuration Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "The following ports are now accessible:" -ForegroundColor White
Write-Host "  • Port 5174 - Frontend (Vite)" -ForegroundColor Cyan
Write-Host "  • Port 5000 - Backend (Node.js)" -ForegroundColor Cyan
Write-Host "  • Port 8090 - User Service (Spring Boot)" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now access your application from other devices on the network:" -ForegroundColor White
Write-Host "  Frontend: http://10.16.173.164:5174" -ForegroundColor Yellow
Write-Host "  Backend:  http://10.16.173.164:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
