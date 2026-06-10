const fs = require('fs');

const file = 'src/constants/products.ts';
let content = fs.readFileSync(file, 'utf8');

// Match each product block and update the image field
const productIds = [
  'surmai-seer-fish', 'bangda-mackerel', 'paplet-pomfret', 'yellowfin-tuna',
  'red-snapper', 'fresh-prawns', 'tiger-prawns', 'mud-crab',
  'sea-lobster', 'fresh-sardine', 'bhetki-barramundi', 'rohu-carp',
  'fresh-squid', 'fresh-octopus', 'catla-carp'
];

for (const pid of productIds) {
  // We look for the block containing id: "pid" and the subsequent image: "..."
  const regex = new RegExp(`(id:\\s*"${pid}"[\\s\\S]*?image:\\s*)"[^"]+"`, 'g');
  content = content.replace(regex, `$1"/images/products/${pid}.webp"`);
}

fs.writeFileSync(file, content);
console.log('Successfully updated MASTER_PRODUCT_REGISTRY images.');
