import os
import re

folders = [
    "public/uploads/optimized",
    "public/uploads/thumbnails"
]

def cleanup():
    print("Starting Maritime Media Cleanup...")
    count = 0
    # Pattern to match filenames with timestamps like name-123456789.webp or .json
    pattern = re.compile(r"(.+)-(\d{10})\.webp(\.json)?$")
    
    for folder in folders:
        if not os.path.exists(folder): continue
        print(f"Checking {folder}...")
        
        files = os.listdir(folder)
        for f in files:
            match = pattern.match(f)
            if match:
                # We found a timestamped file
                file_path = os.path.join(folder, f)
                try:
                    os.remove(file_path)
                    count += 1
                except Exception as e:
                    print(f"Failed to delete {f}: {e}")
                    
    print(f"Cleanup Complete. Removed {count} redundant maritime assets.")

if __name__ == "__main__":
    cleanup()
