const fs = require('fs');

const sql = fs.readFileSync('ocean_fresh.sql', 'utf16le');
const lines = sql.split('\n');

let isCreate = false;
let ddl = [];

for (let line of lines) {
    if (line.includes('CREATE TABLE')) {
        isCreate = true;
        ddl.push(line);
    } else if (isCreate) {
        ddl.push(line);
        if (line.trim().endsWith(';')) {
            isCreate = false;
            ddl.push('\n');
        }
    }
}

fs.writeFileSync('ocean_fresh_schema.sql', ddl.join('\n'));
console.log('Schema extracted to ocean_fresh_schema.sql');
