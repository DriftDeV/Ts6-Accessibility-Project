import platform
import subprocess
import os
import sys
import time
import json
import urllib.request
from urllib.error import URLError

# Check for required packages
try:
    import websocket
except ImportError:
    print("[!] Error: 'websocket-client' not installed.")
    print("    Please install dependencies using: pip install websocket-client")
    sys.exit(1)

# Configuration
DEBUG_PORT = 9222
INJECT_SCRIPT_PATHS = [
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "js", "accessibility_rules_optimized.js"),
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "js", "improved_accessibility_optimized.js")
]

def get_os_info():
    system = platform.system().lower()
    return system

def launch_teamspeak(os_type):
    """
    Launches TeamSpeak with the remote debugging flag enabled.
    """
    print(f"[*] Detected OS: {os_type}")
    
    cmd = []
    
    if os_type == "linux":
        # Check for Flatpak
        try:
            # Check if flatpak is installed and the TS package exists
            try:
                flatpak_list = subprocess.check_output(["flatpak", "list"], text=True)
            except FileNotFoundError:
                flatpak_list = ""

            if "com.teamspeak.TeamSpeak" in flatpak_list:
                print("[*] Launching TeamSpeak (Flatpak)...")
                # Flatpak requires passing arguments via --command or directly if supported.
                cmd = [
                    "flatpak", "run", 
                    "com.teamspeak.TeamSpeak", 
                    f"--remote-debugging-port={DEBUG_PORT}",
                    "--force-renderer-accessibility"
                ]
            else:
                print("[!] TeamSpeak Flatpak not found. Assuming standard binary 'teamspeak' in PATH...")
                cmd = ["teamspeak", f"--remote-debugging-port={DEBUG_PORT}", "--force-renderer-accessibility"]
        except Exception as e:
             print(f"[!] Error checking flatpak: {e}")
             cmd = ["teamspeak", f"--remote-debugging-port={DEBUG_PORT}", "--force-renderer-accessibility"]

    elif os_type == "windows":
        # Common installation paths for TeamSpeak
        possible_paths = [
            os.path.expandvars(r"%LOCALAPPDATA%\Programs\TeamSpeak\TeamSpeak.exe"),
            os.path.expandvars(r"%PROGRAMFILES%\TeamSpeak\TeamSpeak.exe"),
            os.path.expandvars(r"%PROGRAMFILES(X86)%\TeamSpeak\TeamSpeak.exe")
        ]
        
        ts_path = None
        for p in possible_paths:
            if os.path.exists(p):
                ts_path = p
                break
        
        if not ts_path:
            print("[!] Could not find TeamSpeak.exe automatically.")
            print("    Please ensure it is installed or modify this script with the correct path.")
            return False
            
        print(f"[*] Launching TeamSpeak from: {ts_path}")
        cmd = [ts_path, f"--remote-debugging-port={DEBUG_PORT}", "--force-renderer-accessibility"]

    elif os_type == "darwin": # macOS
        print("[*] Launching TeamSpeak (macOS)...")
        # Possible paths for TeamSpeak on macOS
        possible_paths = [
            "/Applications/TeamSpeak.app/Contents/MacOS/TeamSpeak",
            os.path.expanduser("~/Applications/TeamSpeak.app/Contents/MacOS/TeamSpeak"),
            "/Applications/TeamSpeak 3 Client.app/Contents/MacOS/ts3client_mac", # Legacy/Fallback
        ]
        
        ts_path = None
        for p in possible_paths:
            if os.path.exists(p):
                ts_path = p
                break
        
        if not ts_path:
             print("[!] Could not find TeamSpeak.app automatically.")
             print("    Checked in /Applications and ~/Applications.")
             return False

        cmd = [
            ts_path,
            f"--remote-debugging-port={DEBUG_PORT}",
            "--force-renderer-accessibility"
        ]
        
    else:
        print(f"[!] Unsupported OS: {os_type}")
        return False

    try:
        # Launch non-blocking, suppressing output to detach from console
        subprocess.Popen(
            cmd, 
            stdout=subprocess.DEVNULL, 
            stderr=subprocess.DEVNULL, 
            start_new_session=True
        )
        print("[*] TeamSpeak process started.")
        return True
    except Exception as e:
        print(f"[!] Failed to launch TeamSpeak: {e}")
        return False

def get_websocket_debugger_url():
    """
    Queries the local debug port to get the WebSocket URL for the first page.
    """
    url = f"http://localhost:{DEBUG_PORT}/json"
    print(f"[*] Connecting to {url}...")
    
    for i in range(15): # Increased to 15 seconds
        try:
            with urllib.request.urlopen(url) as response:
                data = json.load(response)
                
                candidates = []
                print(f"[*] Available Targets ({len(data)}):")
                for target in data:
                    t_type = target.get('type')
                    t_title = target.get('title', 'Unknown')
                    t_url = target.get('url', 'Unknown')
                    t_ws = target.get('webSocketDebuggerUrl')
                    
                    print(f"    - Type: {t_type} | Title: {t_title} | URL: {t_url}")
                    
                    if t_type == 'page' and t_ws:
                        candidates.append(target)

                # Heuristic: Prefer "TeamSpeak Client UI"
                best_target = None
                for c in candidates:
                    if "TeamSpeak Client UI" in c.get('title', ''):
                        best_target = c
                        break
                
                if not best_target and candidates:
                    best_target = candidates[0] # Fallback to first page

                if best_target:
                    print(f"[*] Selected Target: {best_target.get('title')} ({best_target.get('url')})")
                    return best_target['webSocketDebuggerUrl']
                    
        except (URLError, ConnectionRefusedError):
            time.sleep(1)
            print(f"    Waiting for debugger... ({i+1}/15)")
    
    return None

def inject_logic(ws_url, script_content):
    """
    Connects to the WebSocket and injects the script.
    """
    try:
        ws = websocket.create_connection(ws_url)
        print("[*] Connected to WebSocket.")
        
        # 1. Enable Runtime
        ws.send(json.dumps({"id": 1, "method": "Runtime.enable"}))
        resp = ws.recv()
        # print(f"[DEBUG] Runtime.enable: {resp}")
        
        # 2. Evaluate script (Inject)
        print("[*] Injecting script via Runtime.evaluate...")
        msg = {
            "id": 2,
            "method": "Runtime.evaluate",
            "params": {
                "expression": script_content,
                "userGesture": True,
                "awaitPromise": False
            }
        }
        ws.send(json.dumps(msg))
        result = ws.recv()
        # print(f"[DEBUG] Evaluate result: {result}")
        
        # 3. Enable Page events to auto-inject on reload/navigation
        ws.send(json.dumps({"id": 3, "method": "Page.enable"}))
        ws.recv()

        # 4. Enable Console events
        ws.send(json.dumps({"id": 4, "method": "Console.enable"}))
        ws.recv()
        
        print("[*] Setting script to evaluate on new document...")
        add_script_msg = {
            "id": 5,
            "method": "Page.addScriptToEvaluateOnNewDocument",
            "params": {
                "source": script_content
            }
        }
        ws.send(json.dumps(add_script_msg))
        result = ws.recv()
        
        print("[+] Script injected successfully!")
        print("[+] Monitoring Logs (Press Ctrl+C to stop)...")
        
        # Keep connection alive to monitor log events or keep injection active
        while True:
            try:
                result = ws.recv()
                data = json.loads(result)
                if data.get("method") == "Console.messageAdded":
                    msg = data["params"]["message"]
                    lvl = msg.get('level', 'info')
                    txt = msg.get('text', '')
                    if lvl == 'error':
                        print(f"\033[91m[Console Error] {txt}\033[0m") # Red
                    else:
                        print(f"[Console] {txt}")
                elif data.get("method") == "Runtime.consoleAPICalled":
                    params = data["params"]
                    type_ = params.get('type', 'log')
                    args = [str(arg.get("value", arg.get("description", "?"))) for arg in params.get("args", [])]
                    txt = ' '.join(args)
                    if type_ == 'error':
                        print(f"\033[91m[Console API Error] {txt}\033[0m")
                    else:
                        print(f"[Console API] {txt}")
            except websocket.WebSocketTimeoutException:
                pass 

    except websocket.WebSocketConnectionClosedException:
        print("\n[*] Connection to TeamSpeak lost (Application closed or reloaded).")
    except KeyboardInterrupt:
        print("\n[*] Disconnecting...")
    except Exception as e:
        print(f"\n[!] Unexpected error: {e}")
    finally:
        if 'ws' in locals() and ws:
            ws.close()

def main():
    # 1. Launch TeamSpeak
    os_info = get_os_info()
    if not launch_teamspeak(os_info):
        print("[!] Launch failed. If TeamSpeak is already running, close it and try again,")
        print("    or make sure it was started with --remote-debugging-port=9222")
    
    # 2. Wait for initialization
    time.sleep(3)
    
    # 3. Read the Accessibility Scripts
    print("[*] Reading injection scripts...")
    script_content = ""
    for path_ in INJECT_SCRIPT_PATHS:
        if not os.path.exists(path_):
            print(f"[!] Error: {path_} not found.")
            return
        with open(path_, "r", encoding='utf-8') as f:
            script_content += f.read() + "\n"

    # 4. Connect and Inject
    ws_url = get_websocket_debugger_url()
    if ws_url:
        inject_logic(ws_url, script_content)
    else:
        print("[!] Could not connect to TeamSpeak Debugger.")
        print("    Ensure the port 9222 is open and TeamSpeak is running.")

if __name__ == "__main__":
    main()