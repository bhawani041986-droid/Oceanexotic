import os
import re
import sys

class NextBuildGuard:
    def __init__(self, target_dir):
        self.target_dir = target_dir
        self.errors_found = 0
        self.error_files = []

    def scan_and_heal(self, file_path):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # 1. Detect Tag Imbalance
        # Filter out common false positives like < 10 or generic types in TS
        # We look for <TagName or <TagName>
        tags = re.findall(r'<([a-zA-Z][a-zA-Z0-9]*)', content)
        closing_tags = re.findall(r'</([a-zA-Z][a-zA-Z0-9]*)', content)
        self_closing = content.count('/>')
        
        if len(tags) != (len(closing_tags) + self_closing):
            self.errors_found += 1
            self.error_files.append(file_path)

    def run_guard(self):
        print("Maritime Build Guard v1.5 - Diagnostic Audit Initiated...")
        for root, dirs, files in os.walk(self.target_dir):
            if any(d in root for d in ['node_modules', '.next', 'venv', 'lib']):
                continue
                
            for file in files:
                if file.endswith(('.tsx', '.jsx')):
                    path = os.path.join(root, file)
                    self.scan_and_heal(path)
                    
        print(f"\nAudit Complete. Errors Found: {self.errors_found}.")
        if self.error_files:
            print("\nFlagged Files for Manual Inspection:")
            for f in self.error_files[:20]: # Show first 20
                print(f" - {f}")
            if len(self.error_files) > 20:
                print(f" ... and {len(self.error_files) - 20} more.")

if __name__ == "__main__":
    guard = NextBuildGuard('./src')
    guard.run_guard()
