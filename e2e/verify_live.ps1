# Live verification: admin hidden from the public site, /admin still reachable by URL.
$base = "https://duo-pixel-agency.vercel.app"
Start-Sleep -Seconds 4
$ts = [DateTime]::UtcNow.Ticks

# 1) homepage HTML: no admin references
$h = (Invoke-WebRequest -Uri "$base/?nc=$ts" -UseBasicParsing -TimeoutSec 40 -Headers @{"Cache-Control" = "no-cache"}).Content
$homeHasAdminLink = [regex]::IsMatch($h, "href=['""][^'""]*/admin")
Write-Output "HOME html: adminLink=$homeHasAdminLink adminEmail=$($h.Contains('admin@')) adminLabel=$($h.Contains('Admin — all orders'))"

# 2) site bundle: fetch every asset and search
$assets = [regex]::Matches($h, '(?:src|href)="(/assets/[^"]+)"') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique
$all = ""
foreach ($a in $assets) { $all += (Invoke-WebRequest -Uri ($base + $a) -UseBasicParsing -TimeoutSec 90).Content }
$bundleAdminRoute = $all.Contains('"/admin"') -or $all.Contains("'\/admin'") -or $all.Contains("'/admin'")
Write-Output "SITE bundle: adminRoute=$bundleAdminRoute adminEmail=$($all.Contains('admin@duopixel.agency')) adminLabel=$($all.Contains('Admin — all orders'))"
$rupee = [string][char]0x20B9
Write-Output "SITE intact: WhatsApp=$($all.Contains('8328627605')) GetQuote=$($all.Contains('Get quote')) logo=$($all.Contains('/logo.jpg')) restaurant=$($all.Contains('la-bella-tavola-cherry-ff88')) noRupee=$(((-not $h.Contains($rupee)) -and (-not $all.Contains($rupee))))"

# 3) typed /admin URL still works
$r = Invoke-WebRequest -Uri "$base/admin?nc=$ts" -UseBasicParsing -TimeoutSec 40 -Headers @{"Cache-Control" = "no-cache"}
$pj = [regex]::Match($r.Content, 'assets/portal-[\w-]+\.js').Value
$title = [regex]::Match($r.Content, '<title>[^<]*</title>').Value
Write-Output "GET /admin -> $($r.StatusCode) portalJS=$([bool]$pj) $title"

# 4) login page title + portal serving
$lr = Invoke-WebRequest -Uri "$base/login?nc=$ts" -UseBasicParsing -TimeoutSec 40
$ltitle = [regex]::Match($lr.Content, '<title>[^<]*</title>').Value
Write-Output "GET /login -> $($lr.StatusCode) $ltitle"
