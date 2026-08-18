# scripts/list_conflicts.py
import os
import re

def find_conflicts():
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    conflict_pattern = re.compile(r'<<<<<<< HEAD\n(.*?)\n=======\n(.*?)\n>>>>>>> [a-f0-9]+', re.DOTALL)
    
    for root, dirs, files in os.walk(root_dir):
        if 'node_modules' in root or '.git' in root or 'dist-web' in root:
            continue
        for file in files:
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                matches = list(conflict_pattern.finditer(content))
                if matches:
                    relative_path = os.path.relpath(file_path, root_dir)
                    print(f"\n========================================\nFILE: {relative_path}\n========================================")
                    for i, match in enumerate(matches, 1):
                        print(f"\n--- Conflict #{i} ---")
                        print("<<< OURS (HEAD):")
                        print(match.group(1)[:500])
                        if len(match.group(1)) > 500:
                            print("... [TRUNCATED]")
                        print("===")
                        print(">>> THEIRS (REMOTE):")
                        print(match.group(2)[:500])
                        if len(match.group(2)) > 500:
                            print("... [TRUNCATED]")
                        print(">>>")
            except Exception as e:
                pass

if __name__ == '__main__':
    find_conflicts()
