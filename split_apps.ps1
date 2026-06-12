$sourceDir = "C:\xampp\htdocs\FISH_MARKET\apps\customer-mobile"
$appsDir = "C:\xampp\htdocs\FISH_MARKET\apps"

$apps = @(
    @{ Name = "customer-app"; KeepRole = "customer"; Slug = "oceanexotic-customer" },
    @{ Name = "seller-app"; KeepRole = "seller"; Slug = "oceanexotic-seller" },
    @{ Name = "agent-app"; KeepRole = "agent"; Slug = "oceanexotic-agent" },
    @{ Name = "admin-app"; KeepRole = "admin"; Slug = "oceanexotic-admin" }
)

foreach ($app in $apps) {
    $targetDir = Join-Path $appsDir $app.Name
    Write-Host "Creating $($app.Name)..."
    
    if (Test-Path $targetDir) { Remove-Item -Recurse -Force $targetDir }
    
    # Copy directory except node_modules
    robocopy $sourceDir $targetDir /E /XD node_modules .expo dist .git
    
    # Remove unwanted roles
    $roles = @("customer", "seller", "agent", "admin")
    foreach ($role in $roles) {
        if ($role -ne $app.KeepRole) {
            $roleDir = Join-Path $targetDir "app\($role)"
            if (Test-Path $roleDir) {
                Write-Host "  Removing unwanted role dir: $roleDir"
                Remove-Item -Recurse -Force $roleDir
            }
        }
    }
    
    # Update app.json
    $appJsonPath = Join-Path $targetDir "app.json"
    $appJson = Get-Content $appJsonPath -Raw | ConvertFrom-Json
    $appJson.expo.name = "OceanExotic $($app.KeepRole.Substring(0,1).ToUpper() + $app.KeepRole.Substring(1))"
    $appJson.expo.slug = $app.Slug
    $appJson.expo.android.package = "com.oceanexotic.$($app.KeepRole)"
    
    # Remove projectId so it creates a new project on next EAS build
    if ($appJson.expo.extra.eas.projectId) {
        $appJson.expo.extra.eas.PSObject.Properties.Remove('projectId')
    }
    
    $appJson | ConvertTo-Json -Depth 10 | Set-Content $appJsonPath
    
    # Update package.json
    $pkgJsonPath = Join-Path $targetDir "package.json"
    $pkgJson = Get-Content $pkgJsonPath -Raw | ConvertFrom-Json
    $pkgJson.name = $app.Name
    $pkgJson | ConvertTo-Json -Depth 10 | Set-Content $pkgJsonPath
    
    Write-Host "  Finished setting up $($app.Name)"
}

Write-Host "All apps successfully split!"
