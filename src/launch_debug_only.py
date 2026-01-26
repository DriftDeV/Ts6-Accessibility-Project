from ts_master import launch_teamspeak as original_launch_teamspeak, get_os_info
import subprocess
import sys

def launch_teamspeak_custom(os_info):
    """
    Custom launch logic to handle macOS specific issues where the window
    doesn't appear when calling the binary directly.
    """
    if os_info == "darwin":
        print("[DEBUG] Detected macOS. Using 'open' command to ensure GUI visibility.")
        try:
            # Using 'open' command with --args to pass parameters to the application
            cmd = [
                "open", 
                "-a", "/Applications/TeamSpeak.app", 
                "--args", 
                "--remote-debugging-port=9222", 
                "--force-renderer-accessibility"
            ]
            # Use Popen to run it without blocking
            subprocess.Popen(cmd)
            print("[*] TeamSpeak process started via 'open'.")
            return True
        except Exception as e:
            print(f"[!] Failed to launch TeamSpeak on macOS: {e}")
            return False
    else:
        # Fallback to the original function for other OSs
        return original_launch_teamspeak(os_info)

if __name__ == "__main__":
    os_info = get_os_info()
    print(f"[DEBUG] Avvio TeamSpeak in modalità debug (Porta 9222)...")
    
    # Use the custom launch function
    if launch_teamspeak_custom(os_info):
        print("[INFO] TeamSpeak avviato. Ora puoi collegare VS Code.")
        print("[INFO] Vai su 'Esegui e Debug' in VS Code e seleziona 'Attach to TeamSpeak (CEF)'.")
    else:
        print("[ERROR] Impossibile avviare TeamSpeak.")