# =====================================================================
#  don-dep.ps1 - Don dep va sap xep lai repo dangthailinh.github.io
#
#  Cach dung (mo PowerShell trong C:\linhkun):
#     .\tools\don-dep.ps1 -DryRun     # xem truoc, KHONG thay doi gi
#     .\tools\don-dep.ps1             # chay that
#
#  Moi thao tac deu qua git nen hoan tac duoc:
#     git reset --hard HEAD           # neu chua commit
#     git revert <ma-commit>          # neu da commit
#
#  LUU Y: file nay chi dung ky tu ASCII de PowerShell 5.1 doc dung.
# =====================================================================

param([switch]$DryRun)

$ErrorActionPreference = 'Stop'
$repo = Split-Path -Parent $PSScriptRoot
Set-Location $repo

Write-Host ''
Write-Host '======================================================' -ForegroundColor Cyan
Write-Host "  Don dep repo: $repo" -ForegroundColor Cyan
if ($DryRun) {
    Write-Host '  CHE DO XEM TRUOC - khong thay doi gi' -ForegroundColor Yellow
}
Write-Host '======================================================' -ForegroundColor Cyan
Write-Host ''

# ---- Kiem tra an toan --------------------------------------------------
if (-not (Test-Path (Join-Path $repo '.git'))) {
    Write-Host 'Khong tim thay .git - hay chay script tu trong thu muc repo.' -ForegroundColor Red
    exit 1
}

$dirty = git status --porcelain
if ($dirty -and -not $DryRun) {
    Write-Host 'Dang co thay doi chua commit:' -ForegroundColor Yellow
    git status --short
    Write-Host ''
    $answer = Read-Host "Van tiep tuc? (go 'y' de tiep)"
    if ($answer -ne 'y') {
        Write-Host 'Da huy.' -ForegroundColor Yellow
        exit 0
    }
}

$script:removed = 0
$script:moved   = 0
$script:skipped = 0

function Remove-Tracked([string]$target, [string]$why) {
    if (-not (Test-Path $target)) {
        Write-Host "  - bo qua (khong ton tai): $target" -ForegroundColor DarkGray
        $script:skipped++
        return
    }
    Write-Host "  x XOA  $target" -ForegroundColor Red -NoNewline
    Write-Host "   ($why)" -ForegroundColor DarkGray
    if (-not $DryRun) {
        git rm -r -q --ignore-unmatch -- $target | Out-Null
        if (Test-Path $target) {
            Remove-Item -Recurse -Force -- $target
        }
    }
    $script:removed++
}

function Move-Tracked([string]$from, [string]$to) {
    if (-not (Test-Path $from)) {
        Write-Host "  - bo qua (khong ton tai): $from" -ForegroundColor DarkGray
        $script:skipped++
        return
    }
    if (Test-Path $to) {
        Write-Host "  ! da co san, bo qua: $to" -ForegroundColor Yellow
        $script:skipped++
        return
    }
    Write-Host "  > CHUYEN $from" -ForegroundColor Green -NoNewline
    Write-Host "  ->  $to" -ForegroundColor DarkGray
    if (-not $DryRun) {
        $parent = Split-Path -Parent $to
        if ($parent -and -not (Test-Path $parent)) {
            New-Item -ItemType Directory -Path $parent -Force | Out-Null
        }
        git mv -- $from $to
    }
    $script:moved++
}


# =====================================================================
#  PHAN 1 - Bo nguon jsOrrery (khong duoc phuc vu tren web)
#
#  Trang Solar System (/dist/Solarsysc.html) chay 100% tu thu muc dist/
#  vi dist/ da tu chua san jsorrery.js, jsorrery.css va dist/assets/.
#  Nhung file duoi day chi dung de BUILD LAI jsOrrery tu ma nguon.
# =====================================================================
Write-Host '[1/3] Bo nguon jsOrrery' -ForegroundColor White

Remove-Tracked 'src'               'ma nguon jsOrrery, 79 file, khong phuc vu'
Remove-Tracked 'assets'            'trung 100 phan tram voi dist/assets/'
Remove-Tracked 'webpack.config.js' 'cau hinh build jsOrrery'
Remove-Tracked 'server.js'         'server dev express, Pages khong chay duoc'
Remove-Tracked 'package.json'      'metadata cua jsOrrery, khong phai cua web ban'
Remove-Tracked '.babelrc'          'cau hinh Babel cho jsOrrery'
Remove-Tracked '.eslintrc'         'cau hinh ESLint cho jsOrrery'


# =====================================================================
#  PHAN 2 - File le khong dung den
# =====================================================================
Write-Host ''
Write-Host '[2/3] File le' -ForegroundColor White

Remove-Tracked 'community-server.js'    'server Node cho binh luan, khong trang nao goi API'
Remove-Tracked 'cool.html'              'khong co link nao tro toi'
Remove-Tracked 'linhkun.code-workspace' 'cau hinh VS Code ca nhan'

# LUU Y: LICENSE.md duoc GIU LAI co y.
# Do la giay phep MIT cua jsOrrery, va dist/jsorrery.js van nam trong repo.
# Giay phep MIT yeu cau giu lai van ban giay phep khi phan phoi lai.


# =====================================================================
#  PHAN 3 - Gom file le o goc vao lib/
#
#  Duong dan trong blackhole.html va coler-test.html DA duoc sua san
#  de tro toi lib/. Chay phan nay xong la khop.
# =====================================================================
Write-Host ''
Write-Host '[3/3] Gom file le vao lib/' -ForegroundColor White

# blackhole.html can nhung file nay
Move-Tracked 'js-libs'                  'lib/js-libs'
Move-Tracked 'main.js'                  'lib/main.js'
Move-Tracked 'raytracer.glsl'           'lib/raytracer.glsl'
Move-Tracked 'three-js-monkey-patch.js' 'lib/three-js-monkey-patch.js'

# coler-test.html (WebGL Fluid) can nhung file nay
Move-Tracked 'dat.gui.min.js'           'lib/dat.gui.min.js'
Move-Tracked 'iconfont.ttf'             'lib/iconfont.ttf'
Move-Tracked 'script.js'                'lib/script.js'


# =====================================================================
Write-Host ''
Write-Host '======================================================' -ForegroundColor Cyan
Write-Host "  Xoa: $script:removed   Chuyen: $script:moved   Bo qua: $script:skipped" -ForegroundColor Cyan
Write-Host '======================================================' -ForegroundColor Cyan
Write-Host ''

if ($DryRun) {
    Write-Host 'Day chi la xem truoc. Chay lai khong co -DryRun de lam that.' -ForegroundColor Yellow
    exit 0
}

Write-Host 'Buoc tiep theo - kiem tra 3 trang nay con chay khong:' -ForegroundColor White
Write-Host '  1. blackhole.html       (ho den)'
Write-Host '  2. coler-test.html      (mo phong chat long)'
Write-Host '  3. dist/Solarsysc.html  (he mat troi)'
Write-Host ''
Write-Host 'Neu ca 3 chay tot thi commit:' -ForegroundColor White
Write-Host '  git pull --rebase origin main' -ForegroundColor Gray
Write-Host '  git add -A' -ForegroundColor Gray
Write-Host '  git commit -m "Don dep jsOrrery source, gom file le vao lib"' -ForegroundColor Gray
Write-Host '  git push origin main' -ForegroundColor Gray
Write-Host ''
Write-Host 'Neu co gi sai, hoan tac ngay:' -ForegroundColor Yellow
Write-Host '  git reset --hard HEAD' -ForegroundColor Gray
Write-Host ''
