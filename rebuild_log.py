import os
import json
import glob

OPTIMIZED_DIR = "public/uploads/optimized"
LOG_FILE = "public/uploads/processing_log.json"

def rebuild():
    print(f"Scanning {OPTIMIZED_DIR} for metadata...")
    meta_files = glob.glob(os.path.join(OPTIMIZED_DIR, "*.webp.json"))
    
    all_logs = []
    for mf in meta_files:
        try:
            with open(mf, 'r') as f:
                data = json.load(f)
                all_logs.append(data)
        except Exception as e:
            print(f"Failed to read {mf}: {e}")

    # Sort by timestamp descending
    all_logs.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    
    with open(LOG_FILE, 'w') as f:
        json.dump(all_logs, f, indent=2)
        
    print(f"Rebuilt {LOG_FILE} with {len(all_logs)} entries.")

if __name__ == "__main__":
    rebuild()
