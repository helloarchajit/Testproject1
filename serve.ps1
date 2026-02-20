<#
 Lightweight static file server for Windows PowerShell
 Usage:
 1) Open PowerShell
 2) cd "C:\Users\USER\Desktop\delivery-app"
 3) powershell -ExecutionPolicy Bypass -File .\serve.ps1
 Then open http://localhost:3000 in your browser
#>

[Console]::Title = 'Delivery App Preview - PowerShell Server'
# Try to listen on both localhost and 127.0.0.1 to avoid hostname mismatch errors
$prefixes = @('http://localhost:3000/','http://127.0.0.1:3000/')
$base = Split-Path -Parent $MyInvocation.MyCommand.Definition

$listener = New-Object System.Net.HttpListener
foreach ($p in $prefixes) {
    try {
        $listener.Prefixes.Add($p)
    } catch {
        Write-Host "Warning: could not bind prefix $p — you may need to run the following as Administrator:`n  netsh http add urlacl url=http://+:3000/ user=Everyone`" -ForegroundColor Yellow
    }
}
try {
    $listener.Start()
    Write-Host "Serving http://localhost:3000/ and http://127.0.0.1:3000/ from $base (Press CTRL+C to stop)" -ForegroundColor Green
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        Start-Job -ScriptBlock {
            param($ctx, $base)
            try {
                $req = $ctx.Request
                $resp = $ctx.Response
                $path = $req.Url.AbsolutePath.TrimStart('/')
                if ([string]::IsNullOrEmpty($path)) { $path = 'index.html' }
                $file = [System.IO.Path]::Combine($base, $path)
                if (-not (Test-Path $file)) {
                    # try with default file when directory requested
                    if (Test-Path (Join-Path $file 'index.html')) { $file = Join-Path $file 'index.html' }
                }
                if (Test-Path $file) {
                    $ext = [IO.Path]::GetExtension($file).ToLowerInvariant()
                    switch ($ext) {
                        '.html' { $ctype='text/html' }
                        '.htm'  { $ctype='text/html' }
                        '.css'  { $ctype='text/css' }
                        '.js'   { $ctype='application/javascript' }
                        '.json' { $ctype='application/json' }
                        '.png'  { $ctype='image/png' }
                        '.jpg'  { $ctype='image/jpeg' }
                        '.jpeg' { $ctype='image/jpeg' }
                        '.svg'  { $ctype='image/svg+xml' }
                        '.woff' { $ctype='font/woff' }
                        '.woff2'{ $ctype='font/woff2' }
                        default { $ctype='application/octet-stream' }
                    }
                    $bytes = [System.IO.File]::ReadAllBytes($file)
                    $resp.ContentType = $ctype
                    $resp.ContentLength64 = $bytes.Length
                    $resp.OutputStream.Write($bytes, 0, $bytes.Length)
                } else {
                    $resp.StatusCode = 404
                    $body = [System.Text.Encoding]::UTF8.GetBytes('404 Not Found')
                    $resp.ContentType = 'text/plain'
                    $resp.ContentLength64 = $body.Length
                    $resp.OutputStream.Write($body, 0, $body.Length)
                }
                $resp.OutputStream.Close()
            } catch {
                try { $ctx.Response.StatusCode = 500; $ctx.Response.OutputStream.Close() } catch {}
            }
        } -ArgumentList $context, $base | Out-Null
    }
} catch {
    Write-Host "Server error: $_" -ForegroundColor Red
} finally {
    if ($listener -and $listener.IsListening) { $listener.Stop(); $listener.Close() }
}
