import os
import subprocess
import json
import time
from datetime import datetime

WATCH_DIR = os.path.join(os.getcwd(), "public", "uploads", "original")
ENGINE_SCRIPT = "media_engine.py"
PYTHON_BIN = os.path.join("venv", "Scripts", "python.exe")

def optimize_all():
    print("Performing scan of original assets...")
    if not os.path.exists(WATCH_DIR):
        print("Original directory does not exist.")
        return
        
    log_file = "public/uploads/processing_log.json"
    logs = []
    if os.path.exists(log_file):
        try:
            with open(log_file, 'r') as f:
                logs = json.load(f)
        except Exception:
            logs = []

    # Map existing logs by original_name to easily update registry entries
    log_map = {log.get('original_name'): log for log in logs if 'original_name' in log}

    processed_count = 0
    skipped_count = 0
    failed_count = 0

    for f in os.listdir(WATCH_DIR):
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.avif')):
            file_path = os.path.join(WATCH_DIR, f)
            filename = os.path.basename(file_path)
            seo_name = os.path.splitext(filename)[0]
            
            try:
                cmd = [PYTHON_BIN, ENGINE_SCRIPT, file_path, seo_name]
                result = subprocess.run(cmd, capture_output=True, text=True)
                
                if result.returncode == 0:
                    output_str = result.stdout.strip()
                    if not output_str:
                        continue
                    lines = output_str.split('\n')
                    try:
                        data = json.loads(lines[-1])
                        if data.get('status') == 'success':
                            print(f"Optimized: {filename}")
                            # Update map and registry
                            log_map[data.get('original_name')] = data
                            processed_count += 1
                        elif data.get('status') == 'skipped':
                            # Even if skipped, ensure it's in registry
                            if data.get('original_name') not in log_map:
                                log_map[data.get('original_name')] = data
                            skipped_count += 1
                    except json.JSONDecodeError as je:
                        print(f"Failed to parse JSON for {filename}: {je}. Output: {lines[-1]}")
                        failed_count += 1
                else:
                    print(f"Failed to optimize {filename}: {result.stderr}")
                    failed_count += 1
            except Exception as e:
                print(f"Error processing {filename}: {e}")
                failed_count += 1

    # Reconstruct the log list (newest first based on timestamp)
    updated_logs = list(log_map.values())
    updated_logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    updated_logs = updated_logs[:1000]

    try:
        os.makedirs(os.path.dirname(log_file), exist_ok=True)
        with open(log_file, 'w') as f:
            json.dump(updated_logs, f, indent=2)
        print(f"Registry Synchronized. Optimized: {processed_count}, Skipped: {skipped_count}, Failed: {failed_count}")
    except Exception as e:
        print(f"Logging Failed: {e}")

if __name__ == "__main__":
    optimize_all()
