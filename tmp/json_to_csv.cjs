const fs = require('fs');
const path = require('path');

// Target paths
const jsonPath = path.join(__dirname, 'questions_transformed.json');
const csvPath = path.join(__dirname, 'questions_to_import.csv');

try {
  // Read transformed JSON
  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  if (!Array.isArray(data) || data.length === 0) {
    console.error("No data found in JSON!");
    process.exit(1);
  }

  // Get headers from first object keys
  const headers = Object.keys(data[0]);
  
  // Helper to escape CSV values
  const escapeCsv = (val) => {
    if (val === null || val === undefined) return '';
    let str = String(val);
    // Escape quotes and wrap in quotes if contains comma, quote, or newline
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      str = '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  };

  // Build CSV content
  const csvRows = [];
  csvRows.push(headers.join(','));

  for (const row of data) {
    const values = headers.map(header => escapeCsv(row[header]));
    csvRows.push(values.join(','));
  }

  fs.writeFileSync(csvPath, csvRows.join('\n'));
  console.log(`Successfully converted JSON to CSV: ${csvPath}`);
} catch (err) {
  console.error("Conversion error:", err);
  process.exit(1);
}
