import os
import json
import time
import websocket
from urllib.parse import urlparse
from ts_master import get_websocket_debugger_url, launch_teamspeak, get_os_info

DUMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "dumps")

def sanitize_path(url):
    """
    Converts a URL (http, file, webpack) into a valid local file path
    inside the DUMP_DIR.
    """
    try:
        parsed = urlparse(url)
    except Exception:
        return os.path.join(DUMP_DIR, "invalid_urls", str(time.time()))

    scheme = parsed.scheme
    netloc = parsed.netloc
    path = parsed.path

    # Clean up the path
    if path.startswith('/'):
        path = path[1:]
    
    # Handle empty paths (e.g. root of domain)
    if not path:
        path = "index.js" # Default filename

    # Prevent directory traversal
    path = path.replace('..', '__')

    # Construct destination based on scheme
    if scheme == "webpack":
        # webpack:///src/index.ts -> dumps/webpack/src/index.ts
        # webpack://./src/index.ts -> dumps/webpack/src/index.ts
        # Sometimes netloc is empty or '.' 
        base = netloc if netloc and netloc != '.' else ""
        full_path = os.path.join(DUMP_DIR, "webpack", base, path)
        
    elif scheme == "file":
        # file:///usr/lib/ -> dumps/file/usr/lib/
        full_path = os.path.join(DUMP_DIR, "file", path)
        
    elif scheme in ["http", "https"]:
        full_path = os.path.join(DUMP_DIR, scheme, netloc, path)
        
    else:
        # Unknown scheme (e.g. "blob", "chrome-extension")
        safe_scheme = "".join(c for c in scheme if c.isalnum()) or "unknown"
        full_path = os.path.join(DUMP_DIR, safe_scheme, netloc, path)

    # Ensure we don't end with a directory separator
    if full_path.endswith(os.sep):
        full_path += "index.js"
        
    return full_path

def save_content(filepath, content):
    if not content:
        return

    try:
        # Create directories
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        # print(f"[Saved] {filepath}")
    except Exception as e:
        print(f"[!] Error saving {filepath}: {e}")

def main():
    print("--- TeamSpeak Resource Dumper ---")
    
    # 1. Check/Launch TeamSpeak
    os_info = get_os_info()
    if not launch_teamspeak(os_info):
        print("[!] Warning: Could not launch TeamSpeak. Attempting to connect anyway...")

    # Allow time for startup if we just launched it
    time.sleep(3)

    # 2. Get Debugger URL
    ws_url = get_websocket_debugger_url()
    if not ws_url:
        print("[!] Could not connect to TeamSpeak Debugger.")
        print("    Ensure TeamSpeak is running with: --remote-debugging-port=9222")
        return

    print(f"[*] Connecting to {ws_url}")
    
    try:
        ws = websocket.create_connection(ws_url, suppress_origin=True)
    except Exception as e:
        print(f"[!] Connection failed: {e}")
        return

    # 3. Enable Debugger to receive scriptParsed events
    ws.send(json.dumps({"id": 1, "method": "Debugger.enable"}))
    
    scripts = {} # map: scriptId -> url

    print("[*] Collecting script list (scanning for 5 seconds)...")
    ws.settimeout(0.1) # Short timeout for the loop
    
    start_time = time.time()
    scan_duration = 5.0
    
    # Loop to collect scripts
    while time.time() - start_time < scan_duration:
        try:
            msg = ws.recv()
            data = json.loads(msg)
            
            if data.get("method") == "Debugger.scriptParsed":
                params = data["params"]
                s_id = params["scriptId"]
                url = params.get("url", "")
                
                # Filter out empty URLs if you want, but sometimes they have content
                if url: 
                    scripts[s_id] = url
                    # print(f"    Found: {url}")
                    
        except websocket.WebSocketTimeoutException:
            continue
        except Exception as e:
            print(f"[!] Error during scan: {e}")
            break

    print(f"[*] Found {len(scripts)} scripts. Downloading content...")
    
    # 4. Download Scripts
    ws.settimeout(5.0) # Longer timeout for actual content fetching
    count = 0
    
    for s_id, url in scripts.items():
        count += 1
        local_path = sanitize_path(url)
        print(f"    [{count}/{len(scripts)}] Downloading: {url} -> {local_path}")

        req_id = int(s_id) + 10000
        request = {
            "id": req_id,
            "method": "Debugger.getScriptSource",
            "params": {"scriptId": s_id}
        }
        
        try:
            ws.send(json.dumps(request))
            
            # Wait for the specific response
            while True:
                resp = ws.recv()
                r_data = json.loads(resp)
                
                # Check if this is our response
                if r_data.get("id") == req_id:
                    if "result" in r_data and "scriptSource" in r_data["result"]:
                        source = r_data["result"]["scriptSource"]
                        save_content(local_path, source)
                    elif "error" in r_data:
                        print(f"     [!] Error from debugger: {r_data['error']['message']}")
                    else:
                        print("     [!] No source found in response.")
                    break
                
                # If we get other events (like console logs), ignore them for now
                
        except Exception as e:
            print(f"     [!] Failed to download {url}: {e}")

    ws.close()
    print(f"[*] Done. Files saved to '{DUMP_DIR}/'")

if __name__ == "__main__":
    main()
