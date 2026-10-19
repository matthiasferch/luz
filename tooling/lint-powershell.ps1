#requires -Version 7.0
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$workspaceRoot = Split-Path $PSScriptRoot -Parent
$moduleVersion = '1.24.0'
$moduleDirectory = Join-Path $workspaceRoot '.cache/powershell'
$modulePath = Join-Path $moduleDirectory "PSScriptAnalyzer/$moduleVersion/PSScriptAnalyzer.psd1"

if (-not (Test-Path -LiteralPath $modulePath)) {
  New-Item -ItemType Directory -Path $moduleDirectory -Force | Out-Null
  Save-Module -Name PSScriptAnalyzer -RequiredVersion $moduleVersion -Repository PSGallery -Path $moduleDirectory
}

Import-Module $modulePath -Force

$files = & git -C $workspaceRoot ls-files --cached --others --exclude-standard -- '*.ps1' '*.psm1' '*.psd1'

if ($LASTEXITCODE -ne 0) {
  throw 'Cannot enumerate PowerShell source files.'
}

$diagnostics = @(
  foreach ($file in $files | Sort-Object -Unique) {
    $filePath = Join-Path $workspaceRoot $file

    if (Test-Path -LiteralPath $filePath) {
      Invoke-ScriptAnalyzer -Path $filePath -EnableExit:$false
    }
  }
)

if ($diagnostics.Count -gt 0) {
  $diagnostics | Format-Table -AutoSize
  throw "PowerShell lint found $($diagnostics.Count) diagnostics."
}

Write-Output 'PowerShell lint passed.'
