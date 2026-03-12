import os
import re

def process_file(file_path, subject, unit):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        return

    # First, clean up the 'unit:unit:unit:' mess if it exists
    content = re.sub(r'unit\s*:\s*(unit\s*:\s*)+', 'unit:', content)
    
    # Remove existing IDs to start fresh and avoid duplicates/misplacements
    content = re.sub(r'(\s*)id:\s*".*?",\s*\n?', '', content)
    content = re.sub(r'(\s*)id:\s*\'.*?\',\s*\n?', '', content)

    count = 0
    def replacer(match):
        nonlocal count
        count += 1
        prefix = match.group(1) # The {
        spacing = match.group(2) # The whitespace after {
        
        q_id = f"{subject.lower()}-u{unit}-{count}"
        
        # We want to return: { [spacing] id: "...", [spacing_normalized] unit:
        # If spacing has a newline, we should probably maintain the indentation
        if '\n' in spacing:
            indent = spacing.split('\n')[-1]
            return f'{prefix}{spacing}id: "{q_id}",\n{indent}unit:'
        else:
            return f'{prefix} id: "{q_id}", unit:'

    # Match { followed by whitespace then unit:
    # Using a lookahead or capturing the { to ensure we only hit the start of the object
    pattern = re.compile(r'(\{)(\s*)unit:', re.MULTILINE)
    
    processed_content = pattern.sub(replacer, content)
    
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(processed_content)
        print(f"Processed {file_path}: added {count} IDs")
    except Exception as e:
        print(f"Error writing to {file_path}: {e}")

base_dir = r"c:\Users\ASUS\OneDrive\Desktop\Anunayy\AntiGravity\LPU-Nexus\data\quiztaker"

for root, dirs, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".ts") and file != "quizData.ts":
            subject = os.path.basename(root)
            unit_match = re.search(r'unit(\d+)', file)
            if unit_match:
                unit = unit_match.group(1)
                is_subjective = "subjective" in file
                if is_subjective:
                    process_file(os.path.join(root, file), f"{subject}-s", unit)
                else:
                    process_file(os.path.join(root, file), subject, unit)
