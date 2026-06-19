const fs = require('fs');
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

const files = walk('apps/customer-app');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  // Replace `className="-[32px] ..."` -> `className="rounded-[32px] ..."`
  content = content.replace(/className="-\[/g, 'className="rounded-[');
  // Replace `className="... -[32px] ..."` -> `className="... rounded-[32px] ..."`
  content = content.replace(/ -\[/g, ' rounded-[');
  
  // Replace `className="-full ..."` -> `className="rounded-full ..."`
  content = content.replace(/className="-full/g, 'className="rounded-full');
  // Replace `className="... -full ..."` -> `className="... rounded-full ..."`
  content = content.replace(/ -full/g, ' rounded-full');

  // Replace `className="-2xl ..."` -> `className="rounded-2xl ..."`
  content = content.replace(/className="-2xl/g, 'className="rounded-2xl');
  content = content.replace(/ -2xl/g, ' rounded-2xl');

  // Replace `className="-3xl ..."` -> `className="rounded-3xl ..."`
  content = content.replace(/className="-3xl/g, 'className="rounded-3xl');
  content = content.replace(/ -3xl/g, ' rounded-3xl');

  if (content !== original) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
