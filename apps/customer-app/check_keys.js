const fs = require('fs');

const homePath = 'C:/xampp/htdocs/FISH_MARKET/apps/customer-app/app/(customer)/home.tsx';
const i18nPath = 'C:/xampp/htdocs/FISH_MARKET/apps/customer-app/src/lib/i18n.ts';

const homeContent = fs.readFileSync(homePath, 'utf8');
const i18nContent = fs.readFileSync(i18nPath, 'utf8');

const regex = /t\(['"]([^'"]+)['"]\)/g;
const keys = [];
let match;
while ((match = regex.exec(homeContent)) !== null) {
  keys.push(match[1]);
}

const missing = new Set();
for (const key of keys) {
  if (!i18nContent.includes(`${key}:`)) {
    missing.add(key);
  }
}

console.log("Missing keys in i18n.ts:");
for (const key of missing) {
  console.log(key);
}
