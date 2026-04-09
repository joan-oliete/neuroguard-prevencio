
param(
    [string]$SourcePath = "public/assets/NeuroGuard_Icona_Final.png",
    [string]$ResPath = "android/app/src/main/res"
)

Add-Type -AssemblyName System.Drawing

$srcImage = [System.Drawing.Image]::FromFile($SourcePath)

$configs = @(
    @{ Name = "mipmap-mdpi"; Size = 48 },
    @{ Name = "mipmap-hdpi"; Size = 72 },
    @{ Name = "mipmap-xhdpi"; Size = 96 },
    @{ Name = "mipmap-xxhdpi"; Size = 144 },
    @{ Name = "mipmap-xxxhdpi"; Size = 192 }
)

foreach ($config in $configs) {
    $folder = Join-Path $ResPath $config.Name
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Force -Path $folder | Out-Null
    }

    $size = $config.Size
    $newImage = new-object System.Drawing.Bitmap $size, $size
    $graph = [System.Drawing.Graphics]::FromImage($newImage)
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graph.DrawImage($srcImage, 0, 0, $size, $size)
    
    # Save as ic_launcher.png (Square)
    $destSquare = Join-Path $folder "ic_launcher.png"
    $newImage.Save($destSquare, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Save as ic_launcher_round.png (Round - strictly speaking this should be masked, but for a simple resize fallback this often suffices or we reuse the square one if it's already "app icon shaped")
    $destRound = Join-Path $folder "ic_launcher_round.png"
    $newImage.Save($destRound, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Clean up current bitmap
    $newImage.Dispose()
    $graph.Dispose()
    
    Write-Host "Generated icons for $($config.Name) ($size x $size)"
}

$srcImage.Dispose()
