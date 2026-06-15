const fs = require('fs');
const path = require('path');
const results = [];
function scan(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (!['node_modules', '.expo', 'dist'].includes(f)) scan(full);
    } else if (full.endsWith('.tsx')) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, i) => {
        if (!line.includes('t(')) {
          // Check for raw text inside Text or typical string props
          if (/>\s*[a-zA-Z][a-zA-Z0-9\s,\.!?'"()-]+\s*<\//.test(line) || /label=\"[^\"]+\"/.test(line) || /placeholder=\"[^\"]+\"/.test(line) || /title=\"[^\"]+\"/.test(line)) {
            // Ignore some common simple structural things
            if (!line.includes('<Path') && !line.includes('<Svg')) {
              results.push({ file: full.replace(/\\/g, '/'), line: i + 1, text: line.trim() });
            }
          }
        }
      });
    }
  }
}
scan('C:/xampp/htdocs/FISH_MARKET/apps/customer-app/app');
scan('C:/xampp/htdocs/FISH_MARKET/apps/customer-app/src/components');
fs.writeFileSync('C:/Users/BHAWANI/.gemini/antigravity/brain/406812aa-14e0-4e94-a721-34e944f44d84/pending_translations.md', '# Pending Translations\n\n' + results.map(r => '- **' + path.basename(r.file) + ':' + r.line + '**: `' + r.text + '`').join('\n'));
console.log('Done scanning, found ' + results.length + ' matches.');
