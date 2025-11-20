const fs = require('fs');

// Read nodeList.json
const nodeList = JSON.parse(fs.readFileSync('./public/nodeList.json', 'utf8'));

console.log(`Processing ${nodeList.length} nodes...`);

let updateCount = 0;

// Convert all name and metadata.name to uppercase
nodeList.forEach((node, index) => {
  let updated = false;
  
  // Update top-level name
  if (node.name && typeof node.name === 'string') {
    const original = node.name;
    node.name = node.name.toUpperCase();
    if (original !== node.name) {
      updated = true;
    }
  }
  
  // Update template.metadata.name
  if (node.template && node.template.metadata) {
    if (node.template.metadata.name && typeof node.template.metadata.name === 'string') {
      const original = node.template.metadata.name;
      node.template.metadata.name = node.template.metadata.name.toUpperCase();
      if (original !== node.template.metadata.name) {
        updated = true;
      }
    }
  }
  
  if (updated) {
    updateCount++;
  }
});

console.log(`Updated ${updateCount} nodes with uppercase names`);

// Write updated nodeList.json
fs.writeFileSync(
  './public/nodeList.json',
  JSON.stringify(nodeList, null, 2),
  'utf8'
);

console.log('\n✅ Successfully updated public/nodeList.json with uppercase names');

