# Script để xóa Redis cache cho customers
# Chạy script này để xóa cache cũ gây lỗi deserialization

Write-Host "Connecting to Redis..." -ForegroundColor Yellow

try {
    # Kiểm tra xem redis-cli có sẵn không
    $redisCli = Get-Command redis-cli -ErrorAction SilentlyContinue
    
    if ($redisCli) {
        Write-Host "Found redis-cli, clearing cache..." -ForegroundColor Green
        
        # Xóa tất cả keys liên quan đến customers cache
        redis-cli KEYS "retail:customers:*" | ForEach-Object {
            if ($_) {
                redis-cli DEL $_
                Write-Host "Deleted: $_" -ForegroundColor Gray
            }
        }
        
        Write-Host "`nCache cleared successfully!" -ForegroundColor Green
    } else {
        Write-Host "redis-cli not found. Please install Redis or use Redis Desktop Manager." -ForegroundColor Red
        Write-Host "`nAlternative: Restart Redis server to clear all cache:" -ForegroundColor Yellow
        Write-Host "  redis-server --service-stop" -ForegroundColor Cyan
        Write-Host "  redis-server --service-start" -ForegroundColor Cyan
    }
} catch {
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host "`nManual steps:" -ForegroundColor Yellow
    Write-Host "1. Open Redis CLI: redis-cli" -ForegroundColor Cyan
    Write-Host "2. Run: KEYS retail:customers:*" -ForegroundColor Cyan
    Write-Host "3. Delete each key: DEL <key>" -ForegroundColor Cyan
    Write-Host "   Or delete all: FLUSHDB" -ForegroundColor Cyan
}

