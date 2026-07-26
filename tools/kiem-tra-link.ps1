# =====================================================================
#  kiem-tra-link.ps1 - Ra soat link noi bo hong trong toan bo site
#
#  Cach dung (mo PowerShell trong C:\linhkun):
#     .\tools\kiem-tra-link.ps1
#     .\tools\kiem-tra-link.ps1 -Csv bao-cao.csv    # xuat ra file CSV
#
#  Script chi DOC, khong sua gi. Chay bao nhieu lan cung duoc.
#
#  LUU Y: file nay chi dung ky tu ASCII de PowerShell 5.1 doc dung.
# =====================================================================

param([string]$Csv)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

Write-Host ''
Write-Host "Dang quet link noi bo trong $repo ..." -ForegroundColor Cyan
Write-Host ''

# Bo qua nhung thu muc khong phai noi dung web
$skipDirs = @('\.git\', '\node_modules\', '\tools\')

$pages = Get-ChildItem -Path $repo -Recurse -Include *.html -File |
    Where-Object {
        $p = $_.FullName
        -not ($skipDirs | Where-Object { $p -like "*$_*" })
    }

Write-Host ("Tim thay {0} trang HTML." -f $pages.Count) -ForegroundColor Gray
Write-Host ''

# Bat href="..." va src="..." - bo qua link ngoai, mailto, tel, data, neo #
$pattern    = '(?:href|src|data-src)\s*=\s*"([^"]+)"'
$broken     = New-Object System.Collections.Generic.List[object]
$malformed  = New-Object System.Collections.Generic.List[object]
$checked    = 0

foreach ($page in $pages) {
    $text = Get-Content -Raw -LiteralPath $page.FullName -ErrorAction SilentlyContinue
    if (-not $text) { continue }

    $pageDir = $page.DirectoryName
    $pageRel = $page.FullName.Substring($repo.Length + 1)

    foreach ($m in [regex]::Matches($text, $pattern)) {
        $raw = $m.Groups[1].Value.Trim()

        if ($raw -eq '') { continue }
        if ($raw -match '^(https?:)?//') { continue }
        if ($raw -match '^(mailto|tel|data|javascript|blob):') { continue }
        if ($raw.StartsWith('#')) { continue }
        if ($raw -match '^\{\{') { continue }
        if ($raw -match '^\$\{') { continue }

        # Thuoc tinh HTML bi hong (vi du <a href=">Ten</a>) tao ra duong dan
        # chua ky tu ma Windows khong cho phep. Ghi nhan rieng roi bo qua.
        if ($raw -match '[<>|*"]') {
            $malformed.Add([pscustomobject]@{
                Trang = $pageRel
                Link  = $raw
            })
            continue
        }

        # Bo phan ?query va #anchor
        $path = ($raw -split '[?#]')[0]
        if ($path -eq '') { continue }

        # Duong dan bat dau bang / thi tinh tu goc repo
        if ($path.StartsWith('/')) {
            $rel  = $path.TrimStart('/').Replace('/', '\')
            if ($rel -eq '') { continue }   # link tro ve trang chu "/"
            $full = Join-Path $repo $rel
        } else {
            $rel  = $path.Replace('/', '\')
            $full = Join-Path $pageDir $rel
        }

        # Giai ma %20 va cac ky tu ma hoa URL
        try { $full = [System.Uri]::UnescapeDataString($full) } catch { }

        $checked++
        $exists = $true
        try {
            $exists = Test-Path -LiteralPath $full
        } catch {
            # Duong dan khong hop le tren Windows - coi nhu link hong
            $exists = $false
        }
        if (-not $exists) {
            $broken.Add([pscustomobject]@{
                Trang  = $pageRel
                Link   = $raw
                TroToi = $full
            })
        }
    }
}

Write-Host ("Da kiem tra {0} link noi bo." -f $checked) -ForegroundColor Gray
Write-Host ''

if ($malformed.Count -gt 0) {
    Write-Host ("=== {0} THE HTML BI HONG ===" -f $malformed.Count) -ForegroundColor Magenta
    Write-Host '(thieu dau nhay hoac thieu URL, vi du: <a href=">Ten</a>)' -ForegroundColor DarkGray
    Write-Host ''
    foreach ($item in $malformed) {
        $short = $item.Link
        if ($short.Length -gt 60) { $short = $short.Substring(0, 60) + '...' }
        Write-Host ("  {0}" -f $item.Trang) -ForegroundColor Yellow -NoNewline
        Write-Host ("   ->  {0}" -f $short) -ForegroundColor DarkGray
    }
    Write-Host ''
}

if ($broken.Count -eq 0) {
    Write-Host 'Khong co link hong nao.' -ForegroundColor Green
    exit 0
}

Write-Host ("=== {0} LINK HONG ===" -f $broken.Count) -ForegroundColor Red
Write-Host ''

# Nhom theo dich bi hong de de sua hang loat
$broken | Group-Object Link | Sort-Object Count -Descending | ForEach-Object {
    Write-Host ("  {0}" -f $_.Name) -ForegroundColor Yellow -NoNewline
    Write-Host ("   ({0} trang)" -f $_.Count) -ForegroundColor DarkGray
    $_.Group | Select-Object -First 5 | ForEach-Object {
        Write-Host ("      trong  {0}" -f $_.Trang) -ForegroundColor DarkGray
    }
    if ($_.Count -gt 5) {
        Write-Host ("      ... va {0} trang nua" -f ($_.Count - 5)) -ForegroundColor DarkGray
    }
    Write-Host ''
}

if ($Csv) {
    $broken | Export-Csv -Path $Csv -NoTypeInformation -Encoding UTF8
    Write-Host ("Da xuat bao cao ra: {0}" -f $Csv) -ForegroundColor Green
}
