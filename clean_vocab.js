const fs = require('fs');
const path = require('path');

const replacements = {
  'Sovereign Transmission Signals': 'Chat Messages',
  'Fleet Comm-Link Terminal': 'Support Team',
  'Active Comm Streams': 'Active Chats',
  'No signals registered in grid': 'No active chats found',
  'Maritime Citizen': 'Customer',
  'Citizen Profile': 'My Profile',
  'Securing direct harbor clearance as Guest...': 'Logging in as Guest...',
  'Direct clearance granted! Welcome, Guest Cadet.': 'Welcome, Guest!',
  'Guest Cadet': 'Guest',
  'Sovereign Registry Node': 'System',
  'Sovereign Agent': 'Delivery Agent',
  'Sovereign': 'System'
};

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (['node_modules', '.next', 'assets', '.expo'].includes(file)) continue;
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [key, val] of Object.entries(replacements)) {
        if (content.includes(key)) {
          content = content.split(key).join(val);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Cleaned vocabulary in ' + fullPath);
      }
    }
  }
}

walkDir('./apps');
walkDir('./src');
console.log('Vocabulary simplification complete.');
