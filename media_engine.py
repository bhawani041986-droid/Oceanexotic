import cv2
import numpy as np
from PIL import Image
import os
import sys
import json
import time
from datetime import datetime
import re

class OceanFreshMediaEngine:
    def __init__(self):
        self.target_ratio = (4, 5)  # Portrait
        self.master_size = (1200, 1500)
        self.thumbnail_sizes = {
            'large': (400, 500),
            'mobile': (240, 300),
            'cart': (100, 125)
        }
        self.quality = 80
        self.webp_method = 4 # Faster than 6, still high quality
        self.upload_root = "public/uploads"
        
    def slugify(self, text):
        """Converts text to SEO-friendly slug."""
        text = text.lower()
        text = re.sub(r'[^a-z0-9]+', '-', text)
        return text.strip('-')

    def detect_subject_center(self, image_path):
        """Uses OpenCV to find the center of the subject (fish/product)."""
        try:
            img = cv2.imread(image_path)
            if img is None: return None
            
            # Convert to grayscale
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Use Saliency Detection (Static Saliency Spectral Residual)
            saliency = cv2.saliency.StaticSaliencySpectralResidual_create()
            (success, saliencyMap) = saliency.computeSaliency(gray)
            saliencyMap = (saliencyMap * 255).astype("uint8")
            
            # Threshold to find most salient region
            thresh = cv2.threshold(saliencyMap, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
            
            # Find moments to get center of mass
            M = cv2.moments(thresh)
            if M["m00"] != 0:
                cX = int(M["m10"] / M["m00"])
                cY = int(M["m01"] / M["m00"])
                return (cX, cY)
        except Exception as e:
            print(f"Saliency Detection Failed: {e}")
            
        return None # Fallback to center

    def process_image(self, input_path, seo_name="seafood-product", category="general"):
        """Main pipeline execution."""
        start_time = time.time()
        
        if not os.path.exists(input_path):
            return {"status": "error", "message": "File not found"}

        try:
            # 1. Load Image
            img = Image.open(input_path)
            orig_w, orig_h = img.size
            
            # 2. Smart Crop to 4:5
            center = self.detect_subject_center(input_path)
            if not center:
                center = (orig_w // 2, orig_h // 2)
                
            # Calculate target dimensions
            target_w = orig_w
            target_h = int(orig_w * (self.target_ratio[1] / self.target_ratio[0]))
            
            if target_h > orig_h:
                target_h = orig_h
                target_w = int(orig_h * (self.target_ratio[0] / self.target_ratio[1]))
                
            # Define crop box centered on subject
            left = max(0, min(center[0] - target_w // 2, orig_w - target_w))
            top = max(0, min(center[1] - target_h // 2, orig_h - target_h))
            right = left + target_w
            bottom = top + target_h
            
            img_cropped = img.crop((left, top, right, bottom))
            
            # 3. Master Resize
            img_master = img_cropped.resize(self.master_size, Image.Resampling.LANCZOS)
            
            # 4. Generate SEO Filename
            clean_name = self.slugify(seo_name)
            final_filename = f"{clean_name}.webp"
            optimized_path = os.path.join(self.upload_root, "optimized", final_filename)

            # Idempotency Check: Skip if already exists and is newer than source
            if os.path.exists(optimized_path):
                source_mtime = os.path.getmtime(input_path)
                opt_mtime = os.path.getmtime(optimized_path)
                if opt_mtime > source_mtime:
                    return {"status": "skipped", "message": "Asset already optimized", "optimized_url": f"/uploads/optimized/{final_filename}"}
            
            # 5. Save Master Optimized
            img_master.save(optimized_path, "WEBP", quality=self.quality, method=self.webp_method)
            
            # 6. Generate Thumbnails
            thumbnails = {}
            for t_name, t_size in self.thumbnail_sizes.items():
                t_path = os.path.join(self.upload_root, "thumbnails", f"{t_name}-{final_filename}")
                img_thumb = img_master.resize(t_size, Image.Resampling.LANCZOS)
                img_thumb.save(t_path, "WEBP", quality=80)
                thumbnails[t_name] = f"/uploads/thumbnails/{t_name}-{final_filename}"
                
            # 7. Metadata Summary
            processing_time = time.time() - start_time
            stats = {
                "status": "success",
                "original_name": os.path.basename(input_path),
                "optimized_url": f"/uploads/optimized/{final_filename}",
                "thumbnails": thumbnails,
                "dimensions": self.master_size,
                "file_size_kb": os.path.getsize(optimized_path) // 1024,
                "processing_time_sec": round(processing_time, 3),
                "timestamp": datetime.now().isoformat()
            }
            
            # Save stats to a JSON file for the Admin dashboard to read
            stats_path = optimized_path + ".json"
            with open(stats_path, 'w') as f:
                json.dump(stats, f)
                
            return stats

        except Exception as e:
            print(f"Pipeline Critical Error: {e}")
            return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python media_engine.py <input_path> [seo_name] [category]")
        sys.exit(1)
        
    engine = OceanFreshMediaEngine()
    input_file = sys.argv[1]
    name = sys.argv[2] if len(sys.argv) > 2 else "oceanfresh-asset"
    cat = sys.argv[3] if len(sys.argv) > 3 else "general"
    
    result = engine.process_image(input_file, name, cat)
    print(json.dumps(result))
