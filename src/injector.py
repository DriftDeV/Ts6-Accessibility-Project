import json
import time
import sys
from ts_master import get_websocket_debugger_url, INJECT_SCRIPT_PATHS

try:
    import websocket
except ImportError:
    print("Error: 'websocket-client' not installed.")
    sys.exit(1)

def debug_inject(ws_url, script_content):
    """
    Connects to the WebSocket, reloads the page to reset state, 
    and then injects the script using Runtime.evaluate.
    Does NOT use Page.addScriptToEvaluateOnNewDocument to avoid stacking scripts during debug.
    """
    try:
        ws = websocket.create_connection(ws_url)
        
        # 1. Enable Page domain
        ws.send(json.dumps({"id": 1, "method": "Page.enable"}))
        ws.recv()

        # 2. Reload to reset state
        print("[*] Reloading page to reset state...")
        ws.send(json.dumps({"id": 2, "method": "Page.reload", "params": {"ignoreCache": True}}))
        
        # Wait for load event (timeout 5s)
        reloaded = False
        start_time = time.time()
        while time.time() - start_time < 5:
            try:
                result = ws.recv()
                data = json.loads(result)
                if data.get("method") == "Page.loadEventFired":
                    reloaded = True
                    break
            except Exception:
                pass
        
        if reloaded:
            print("[+] Page reloaded.")
        else:
            print("[!] Warning: Reload confirmation not received, proceeding...")

        # 3. Enable Runtime and Console
        ws.send(json.dumps({"id": 3, "method": "Runtime.enable"}))
        ws.recv()
        ws.send(json.dumps({"id": 4, "method": "Console.enable"}))
        ws.recv()

        # 4. Inject Script
        print("[*] Injecting script...")
        msg = {
            "id": 5,
            "method": "Runtime.evaluate",
            "params": {
                "expression": script_content,
                "userGesture": True,
                "awaitPromise": False
            }
        }
        ws.send(json.dumps(msg))
        response = ws.recv()
        resp_json = json.loads(response)
        
        if "error" in resp_json:
            print(f"[!] Injection Error: {resp_json['error']}")
        elif "result" in resp_json and "exceptionDetails" in resp_json["result"]:
            print(f"[!] Script Exception: {resp_json['result']['exceptionDetails']}")
        else:
            print("[+] Script injected successfully!")

        print("[+] Monitoring... Press Ctrl+C to stop.")
        while True:
            result = ws.recv()
            data = json.loads(result)
            if data.get("method") == "Console.messageAdded":
                msg = data["params"]["message"]
                print(f"[Console] {msg.get('level', 'info')}: {msg.get('text', '')}")
            elif data.get("method") == "Runtime.consoleAPICalled":
                params = data["params"]
                args = [str(arg.get("value", arg.get("description", "?"))) for arg in params.get("args", [])]
                print(f"[Console API] {params.get('type', 'log')}: {' '.join(args)}")

    except KeyboardInterrupt:
        print("\n[*] Disconnecting...")
    except Exception as e:
        print(f"[!] Error: {e}")
    finally:
        if 'ws' in locals():
            ws.close()

def main():
    script_content = ""
    for path in INJECT_SCRIPT_PATHS:
        with open(path, "r", encoding='utf-8') as f:
            script_content += f.read() + "\n"

    ws_url = get_websocket_debugger_url()
    if ws_url:
        debug_inject(ws_url, script_content)
    else:
        print("[!] Could not connect to TeamSpeak Debugger.")
        print("    Ensure the port 9222 is open and TeamSpeak is running.")

if __name__ == "__main__":
    main()