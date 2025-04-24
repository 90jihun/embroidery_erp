cd "C:\Users\Administrator\Desktop\embroidery_erp"
if (!(git status -s).Length -eq 0) {
    git add -A
    git commit -m "Auto-sync: $(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')"
    git pull --rebase
    git push origin main
}
