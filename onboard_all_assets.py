import os
import shutil

IMAGE_EXTENSIONS = ('.png', '.jpg', '.jpeg', '.webp')
EXCLUDE_DIRS = ('node_modules', 'venv', '.next', '.git', 'optimized', 'thumbnails', 'original')
TARGET_DIR = "public/uploads/original"

def migrate():
    if not os.path.exists(TARGET_DIR):
        os.makedirs(TARGET_DIR, exist_ok=True)
        
    count = 0
    for root, dirs, files in os.walk("."):
        # Filter out excluded directories
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if file.lower().endswith(IMAGE_EXTENSIONS):
                source_path = os.path.join(root, file)
                # Create a unique name to avoid collisions
                # e.g., src-assets-img-hero.png
                relative_root = root.replace(os.sep, '-').strip('-').strip('.')
                if not relative_root: relative_root = "root"
                
                target_filename = f"{relative_root}-{file}"
                target_path = os.path.join(TARGET_DIR, target_filename)
                
                if not os.path.exists(target_path):
                    print(f"Migrating: {source_path} -> {target_path}")
                    shutil.copy2(source_path, target_path)
                    count += 1
    
    print(f"Migration complete. {count} assets onboarding to pipeline.")

if __name__ == "__main__":
    migrate()
