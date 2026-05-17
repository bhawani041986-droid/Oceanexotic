import os
import time
import subprocess
import json
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configuration
WATCH_DIR = os.path.join(os.getcwd(), "public", "uploads", "original")
ENGINE_SCRIPT = "media_engine.py"
PYTHON_BIN = os.path.join("venv", "Scripts", "python.exe")

class NewAssetHandler(FileSystemEventHandler):
    def __init__(self):
        super().__init__()
        self.processing = set()
        self.scan_existing()

    def scan_existing(self):
        print("Performing initial scan of original assets...")
        for f in os.listdir(WATCH_DIR):
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.avif')):
                file_path = os.path.join(WATCH_DIR, f)
                # Check if already optimized to avoid redundant work on every restart
                # But for now, we'll just queue them, process_asset will check self.processing
                self.process_asset(file_path)

    def on_created(self, event):
        if event.is_directory: return
        self.process_asset(event.src_path)

    def on_moved(self, event):
        if event.is_directory: return
        self.process_asset(event.dest_path)

    def process_asset(self, file_path):
        filename = os.path.basename(file_path)
        if filename in self.processing:
            return
        
        # Debounce/Filter check
        if not filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.avif')):
            return

        self.processing.add(filename)
        
        # Give the filesystem a moment to settle (file write lock)
        time.sleep(1)
        
        seo_name = os.path.splitext(filename)[0]
        print(f"Optimizing: {seo_name}...")
        
        try:
            cmd = [PYTHON_BIN, ENGINE_SCRIPT, file_path, seo_name]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                data = json.loads(result.stdout.strip().split('\n')[-1])
                if data.get('status') == 'success':
                    print(f"Optimization Complete for {seo_name}")
                    self.log_success(result.stdout)
                else:
                    print(f"Skipping: {seo_name} (Already up-to-date)")
            else:
                print(f"Optimization Failed: {result.stderr}")
        except Exception as e:
            print(f"Worker Error: {e}")

    def log_success(self, engine_output):
        try:
            # The engine output might contain multiple JSONs or extra text
            # We look for the last line which should be the JSON result
            lines = engine_output.strip().split('\n')
            data = json.loads(lines[-1])
            log_file = "public/uploads/processing_log.json"
            
            logs = []
            if os.path.exists(log_file):
                with open(log_file, 'r') as f:
                    logs = json.load(f)
            
            logs.insert(0, data)
            # Maintain a larger history for maritime-grade scale
            logs = logs[:1000]
            
            with open(log_file, 'w') as f:
                json.dump(logs, f, indent=2)
            print(f"Registry Synchronized: {data.get('original_name')}")
        except Exception as e:
            print(f"Logging Failed: {e}")

if __name__ == "__main__":
    if not os.path.exists(WATCH_DIR):
        os.makedirs(WATCH_DIR, exist_ok=True)
        
    event_handler = NewAssetHandler()
    observer = Observer()
    observer.schedule(event_handler, WATCH_DIR, recursive=False)
    
    print(f"OceanFresh Media Worker Active")
    print(f"Monitoring: {WATCH_DIR}")
    print(f"Press Ctrl+C to terminate...")
    
    observer.start()
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
