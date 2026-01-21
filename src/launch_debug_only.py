from ts_master import launch_teamspeak, get_os_info
import time

if __name__ == "__main__":
    os_info = get_os_info()
    print(f"[DEBUG] Avvio TeamSpeak in modalità debug (Porta 9222)...")
    if launch_teamspeak(os_info):
        print("[INFO] TeamSpeak avviato. Ora puoi collegare VS Code.")
        print("[INFO] Vai su 'Esegui e Debug' in VS Code e seleziona 'Attach to TeamSpeak (CEF)'.")
    else:
        print("[ERROR] Impossibile avviare TeamSpeak.")
