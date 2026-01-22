import os
import time
import json
import websocket
import subprocess
from datetime import datetime
from ts_master import get_websocket_debugger_url, launch_teamspeak, get_os_info

DUMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dumps", "dom")

def save_dom(content, filename):
    os.makedirs(DUMP_DIR, exist_ok=True)
    path = os.path.join(DUMP_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[+] DOM saved to: {path}")
    
    # Optional: Try to format with prettier if available
    try:
        subprocess.run(["npx", "prettier", "--write", path], 
                       check=False, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        print(f"    (Formatted with Prettier)")
    except Exception:
        pass

def main():
    print("--- TeamSpeak DOM Dumper ---")
    print("This tool captures the HTML of the current screen.")
    
    # Ensure TS is running
    os_info = get_os_info()
    if not launch_teamspeak(os_info):
        print("[!] Warning: Could not launch TeamSpeak. Attempting to connect anyway...")
    
    time.sleep(2)
    
    ws_url = get_websocket_debugger_url()
    if not ws_url:
        print("[!] Could not connect to debugger. Ensure TeamSpeak is running with remote debugging.")
        return

    try:
        ws = websocket.create_connection(ws_url, suppress_origin=True)
        
        print("\n[*] Connected!")
        print("[*] Navigate to the screen you want to analyze in TeamSpeak.")
        print("[*] Press ENTER to dump the DOM. Type 'q' to quit.")
        
        req_id_counter = 1
        
        while True:
            user_input = input("\n[Press Enter to Dump / 'q' to Quit] > ")
            if user_input.lower() == 'q':
                break
            
            print("Capturing DOM...")
            # Get DOM using Runtime.evaluate to execute JS
            req_id = req_id_counter
            req_id_counter += 1
            msg = {
                "id": req_id,
                "method": "Runtime.evaluate",
                "params": {
                    "expression": "new XMLSerializer().serializeToString(document)",
                    "returnByValue": True
                }
            }
            ws.send(json.dumps(msg))
            
            # Receive response
            response = ws.recv()
            data = json.loads(response)
            
            if "result" in data and "result" in data["result"] and "value" in data["result"]["result"]:
                html_content = data["result"]["result"]["value"]
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                default_filename = f"snapshot_{timestamp}.html"
                
                filename_input = input(f"Enter filename [default: {default_filename}]: ").strip()
                filename = filename_input if filename_input else default_filename
                
                if not filename.endswith(".html"):
                    filename += ".html"
                
                save_dom(html_content, filename)
            else:
                print(f"[!] Error retrieving DOM: {data}")

    except Exception as e:
        print(f"[!] Connection Error: {e}")
    except KeyboardInterrupt:
        print("\n[*] Exiting...")
    finally:
        if 'ws' in locals() and ws.connected:
            ws.close()

if __name__ == "__main__":
    main()
