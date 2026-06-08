const fs = require('fs');
let sql = fs.readFileSync('supabase_schema_converted.sql', 'utf8');

// Fix trailing commas before closing parenthesis
sql = sql.replace(/,\s*\n\);/g, '\n);');

// Change to CREATE TABLE IF NOT EXISTS
sql = sql.replace(/CREATE TABLE "/g, 'CREATE TABLE IF NOT EXISTS "');

// Add NOTIFY to reload schema at the end
sql += "\n\nNOTIFY pgrst, 'reload schema';\n";

fs.writeFileSync('supabase_schema_final.sql', sql);
console.log('Fixed schema written to supabase_schema_final.sql');
