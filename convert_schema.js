const fs = require('fs');

let sql = fs.readFileSync('ocean_fresh_schema.sql', 'utf8');

// Basic replacements
sql = sql.replace(/`([^`]+)`/g, '"$1"'); // replace backticks with double quotes
sql = sql.replace(/int\(\d+\) NOT NULL AUTO_INCREMENT/g, 'SERIAL');
sql = sql.replace(/bigint\(\d+\) NOT NULL AUTO_INCREMENT/g, 'BIGSERIAL');
sql = sql.replace(/int\(\d+\)/g, 'INTEGER');
sql = sql.replace(/tinyint\(1\)/g, 'BOOLEAN');
sql = sql.replace(/decimal/g, 'DECIMAL');
sql = sql.replace(/varchar/g, 'VARCHAR');
sql = sql.replace(/longtext/g, 'TEXT');
sql = sql.replace(/datetime/g, 'TIMESTAMP WITH TIME ZONE');
sql = sql.replace(/timestamp NOT NULL DEFAULT current_timestamp\(\) ON UPDATE current_timestamp\(\)/g, 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
sql = sql.replace(/timestamp NOT NULL DEFAULT current_timestamp\(\)/g, 'TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP');
sql = sql.replace(/timestamp NULL DEFAULT NULL/g, 'TIMESTAMP WITH TIME ZONE NULL');

// Remove ENGINE=InnoDB...
sql = sql.replace(/\) ENGINE=InnoDB.*?;/g, ');');

// Convert ENUMs to VARCHAR with CHECK constraints or just VARCHAR (simplest and safest for Supabase import)
// Because creating 10 different ENUM types in Postgres requires explicit CREATE TYPE commands.
// It's much easier to just use VARCHAR(255) for ENUM columns.
sql = sql.replace(/enum\([^)]+\)/g, 'VARCHAR(255)');

// Remove KEY/UNIQUE KEY lines at the end of table definitions to simplify, we keep PRIMARY KEY
// MySQL specific index definitions in CREATE TABLE usually break Postgres
let lines = sql.split('\n');
let newLines = [];
let insideTable = false;

for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // If line is a KEY or UNIQUE KEY, we can skip it, OR convert to constraint
    if (line.trim().startsWith('UNIQUE KEY')) {
        let match = line.match(/UNIQUE KEY "[^"]+" \(([^)]+)\)/);
        if (match) {
            line = `  UNIQUE (${match[1]})`;
            if (lines[i+1] && lines[i+1].trim().startsWith(')')) {
                // last constraint
            } else if (!line.trim().endsWith(',')) {
                line += ',';
            }
        } else {
             // Handle simple UNIQUE KEY ("col")
             line = line.replace(/UNIQUE KEY "[^"]+" /, 'UNIQUE ');
        }
    } else if (line.trim().startsWith('KEY') || line.trim().startsWith('CONSTRAINT') && line.includes('FOREIGN KEY')) {
        // Skip normal KEYs and FOREIGN KEYs for now to avoid order issues during insertion
        // We will do a pure data pump, FKs can be added later if needed, but for now we just want the tables.
        // Wait, if I strip FKs, the data pump won't fail on ordering issues.
        // But the user might want FKs.
        // Let's strip normal KEYs but keep PRIMARY KEY and UNIQUE.
        if (line.trim().startsWith('KEY "')) {
            // Check if it's the last line before closing paren
            if (lines[i+1] && lines[i+1].trim() === ');') {
                // Remove trailing comma from previous line
                if (newLines.length > 0) {
                    newLines[newLines.length - 1] = newLines[newLines.length - 1].replace(/,$/, '');
                }
            }
            continue;
        }
    }
    
    // Fix default values that might be broken
    line = line.replace(/DEFAULT '0\.00'/, "DEFAULT 0.00");
    line = line.replace(/DEFAULT '0'/, "DEFAULT 0");
    line = line.replace(/DEFAULT '1'/, "DEFAULT 1");
    
    // Remove comment strings
    line = line.replace(/ COMMENT '[^']*'/, "");

    // If it's a constraint line and it's the last one, ensure no trailing comma
    if (lines[i+1] && lines[i+1].trim() === ');' && line.trim().endsWith(',')) {
        line = line.replace(/,$/, '');
    }

    newLines.push(line);
}

// Write the result
let finalSql = newLines.join('\n');
fs.writeFileSync('supabase_schema_converted.sql', finalSql);
console.log('Postgres schema written to supabase_schema_converted.sql');
