import re
import csv
import os

input_path = r"c:\Users\ASUS\OneDrive\Desktop\Anunayy\AntiGravity\Scholix\tmp\ALL_questions_fixed_FINAL.csv"
output_path = r"c:\Users\ASUS\OneDrive\Desktop\Anunayy\AntiGravity\Scholix\tmp\ALL_questions_fixed_FINAL_corrected.csv"

def clean_csv():
    print(f"Reading {input_path}...")
    with open(input_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    print(f"Total lines read: {len(lines)}")
    
    cleaned_lines = []
    skipped_headers = 0
    fixed_quotes = 0
    
    for i, line in enumerate(lines):
        # Skip the redundant human-readable header row if present
        if "Question ID,Course Code,Unit,Topic" in line:
            skipped_headers += 1
            continue
            
        # Fix specific malformed row for che110-u4-69 where columns were shifted
        if line.startswith("che110-u4-69,solid waste"):
            line = 'che110-u4-69,CHE110,4,Solid Waste,medium,MCQ,mcq,What is the purpose of waste segregation at the household level?,"[""Separating wet (biodegradable), dry (recyclable), and hazardous items to facilitate effective recycling and processing"", ""Compressing heterogeneous household trash mass to optimize available volumetric space inside local collection bins"", ""Accelerating the thermodynamic decomposition rate of plastics by mixing them directly with kitchen compost arrays"", ""Ensuring that non-segregated household waste streams bypass secondary municipal processing centers to head straight to landfills""]",0,"Sorting waste at the home level prevents cross-contamination, keeping recyclables clean while isolating organics for composting loops.",,\n'
            
        # Fix specific duplicate ID for che110-u4-67 -> che110-u4-82 on the Global Warming question
        if line.startswith("che110-u4-67,CHE110,4,Global Warming"):
            line = line.replace("che110-u4-67,CHE110,4,Global Warming", "che110-u4-82,CHE110,4,Global Warming")
            
        # Fix missing closing quotes on the options array before parsing
        # Pattern like: `],0,` -> `]",0,` or `] ,0,` -> `]",0,`
        new_line = re.sub(r'\]\s*,\s*([0-9]+)\s*,', r'"]\1,', line)
        if new_line != line:
            fixed_quotes += 1
            # print(f"Fixed quotes on line {i+1}")
            
        cleaned_lines.append(new_line)
        
    print(f"Skipped {skipped_headers} redundant header lines.")
    print(f"Fixed {fixed_quotes} malformed options quotes.")
    
    # Now write the parsed contents to check for correctness and pad columns
    reader = csv.reader(cleaned_lines)
    header = next(reader)
    
    # Ensure header has exactly 13 fields
    if len(header) < 13:
        header = header + ['' for _ in range(13 - len(header))]
    elif len(header) > 13:
        header = header[:13]
        
    corrected_rows = [header]
    too_few_fields_count = 0
    parsed_rows_count = 0
    
    for idx, row in enumerate(reader):
        # Skip empty rows
        if not row or not row[0].strip():
            continue
        parsed_rows_count += 1
        # If the row has 11 fields, pad it to 13 (for starter_code and test_cases)
        if len(row) < 13:
            too_few_fields_count += 1
            row = row + ['' for _ in range(13 - len(row))]
        elif len(row) > 13:
            row = row[:13]
        corrected_rows.append(row)
        
    print(f"Parsed {parsed_rows_count} rows.")
    print(f"Padded {too_few_fields_count} rows that had fewer than 13 fields.")
    
    # Write to new CSV
    with open(output_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerows(corrected_rows)
        
    print(f"Successfully wrote clean CSV to {output_path}")

if __name__ == "__main__":
    try:
        clean_csv()
    except Exception as e:
        print(f"Error occurred: {e}")
