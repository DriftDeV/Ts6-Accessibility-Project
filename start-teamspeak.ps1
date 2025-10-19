# Modifica il percorso dell'eseguibile se necessario
$tsExe = "C:\Program Files\TeamSpeak\TeamSpeak.exe"
# Avvia TeamSpeak con remote debugging (localhost)
Start-Process -FilePath $tsExe -ArgumentList "--remote-debugging-port=9222 --remote-debugging-address=127.0.0.1"
# Attendi qualche secondo per assicurare l'avvio
Start-Sleep -Seconds 3
# Avvia l'injector Node
node .\injector.js