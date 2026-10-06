# e2e/fixtures/make-colourway-images.ps1 — 900x1200 JPGs, one solid colour + big label each.
Add-Type -AssemblyName System.Drawing
$out = Join-Path $PSScriptRoot 'colourways'
New-Item -ItemType Directory -Force $out | Out-Null
$sets = @(
  @{ n='P1-BLACK-1'; bg='#111111'; fg='#FFFFFF' }, @{ n='P1-BLACK-2'; bg='#333333'; fg='#FFFFFF' },
  @{ n='P1-WHITE-1'; bg='#F2F2F2'; fg='#111111' }, @{ n='P1-WHITE-2'; bg='#DADADA'; fg='#111111' },
  @{ n='P1-RED-1';   bg='#B01E2A'; fg='#FFFFFF' }, @{ n='P1-RED-2';   bg='#7A0F18'; fg='#FFFFFF' },
  @{ n='P1-SHARED';  bg='#F5F5F0'; fg='#370E4D' },
  @{ n='P2-BLUE-1';  bg='#1F3F8F'; fg='#FFFFFF' }, @{ n='P2-SHARED';  bg='#E8E8E8'; fg='#370E4D' },
  @{ n='P3-BEIGE-1'; bg='#D8C3A0'; fg='#111111' }
)
foreach ($s in $sets) {
  $bmp = New-Object System.Drawing.Bitmap 900, 1200
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.ColorTranslator]::FromHtml($s.bg))
  $font = New-Object System.Drawing.Font 'Arial', 72, ([System.Drawing.FontStyle]::Bold)
  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($s.fg))
  $g.DrawString($s.n, $font, $brush, 60, 540)
  $bmp.Save((Join-Path $out "$($s.n).jpg"), [System.Drawing.Imaging.ImageFormat]::Jpeg)
  $g.Dispose(); $bmp.Dispose()
}
