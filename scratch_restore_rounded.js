const fs = require('fs');
const cp = require('child_process');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else {
            if(file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const targetDirs = [
  'apps/customer-app/app',
  'apps/customer-app/src/components'
];

let files = [];
targetDirs.forEach(d => {
  files = files.concat(walk(d));
});

files.forEach(file => {
  let oldContent;
  try {
    oldContent = cp.execSync(`git show 0da55ba:${file.replace(/\\/g, '/')}`).toString();
  } catch(e) {
    // File didn't exist in 0da55ba
    return;
  }
  
  let newContent = fs.readFileSync(file, 'utf8');
  let originalNewContent = newContent;

  // Extract all className="XYZ" from oldContent
  const classNameRegex = /className="([^"]+)"/g;
  let match;
  while ((match = classNameRegex.exec(oldContent)) !== null) {
    const oldClassString = match[1];
    
    if (oldClassString.includes('rounded')) {
      // Simulate what the destructive script did
      let stripped = oldClassString.replace(/\brounded(?:-[a-z0-9-]+)?\b/g, '');
      stripped = stripped.replace(/  +/g, ' ').trim();
      
      // The destructive script also might have replaced className=" " with className=""
      // If the stripped version exists in the new content, replace it with the old version!
      
      const oldFull = `className="${oldClassString}"`;
      const strippedFull = `className="${stripped}"`;
      
      if (newContent.includes(strippedFull) && !newContent.includes(oldFull)) {
         newContent = newContent.replace(strippedFull, oldFull);
      } else {
         // Try checking if there are multiple spaces issue
         const strippedRegex = new RegExp(`className="${stripped.replace(/[.*+?^$\/()|\[\]\\]/g, '\\$&')}"`, 'g');
         newContent = newContent.replace(strippedRegex, oldFull);
      }
    }
  }

  if (newContent !== originalNewContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    console.log(`Restored rounded classes in: ${file}`);
  }
});

console.log('Restoration complete!');
