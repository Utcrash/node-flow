const fs = require('fs');

// Read nodeList.json
const nodeList = JSON.parse(fs.readFileSync('./public/nodeList.json', 'utf8'));

console.log(`Original node count: ${nodeList.length}`);

// Create a map to track nodes by their base name
const nodeMap = new Map();

nodeList.forEach((node, index) => {
  // Get the node identifier
  let nodeType = '';
  let isV1 = false;
  
  if (node.template && node.template.metadata) {
    nodeType = (node.template.metadata.type || node.template.metadata.name || node.name || '').toUpperCase();
    isV1 = nodeType.includes('V1_');
  } else if (node.type) {
    nodeType = node.type.toUpperCase();
    isV1 = nodeType.includes('V1_');
  } else if (node.name) {
    nodeType = node.name.toUpperCase();
    isV1 = nodeType.includes('V1_');
  }

  // Skip nodes without identifiable type
  if (!nodeType) {
    console.log(`Warning: Node at index ${index} has no identifiable type, keeping it`);
    nodeMap.set(`unknown_${index}`, node);
    return;
  }

  // Extract base name (remove V1_ prefix if exists)
  const baseName = nodeType.replace('V1_', '');
  
  // If we already have a node with this base name
  if (nodeMap.has(baseName)) {
    const existing = nodeMap.get(baseName);
    let existingType = '';
    
    if (existing.template && existing.template.metadata) {
      existingType = (existing.template.metadata.type || existing.template.metadata.name || existing.name || '').toUpperCase();
    } else if (existing.type) {
      existingType = existing.type.toUpperCase();
    } else if (existing.name) {
      existingType = existing.name.toUpperCase();
    }
    
    const existingIsV1 = existingType.includes('V1_');
    
    // Keep V1 version, replace if current is V1 and existing is not
    if (isV1 && !existingIsV1) {
      console.log(`Replacing ${existingType} with ${nodeType}`);
      nodeMap.set(baseName, node);
    } else if (!isV1 && existingIsV1) {
      console.log(`Keeping existing ${existingType}, skipping ${nodeType}`);
      // Keep existing, do nothing
    } else if (isV1 && existingIsV1) {
      // Both are V1, keep the first one
      console.log(`Both V1: keeping existing ${existingType}, skipping ${nodeType}`);
    } else {
      // Neither is V1, keep the first one
      console.log(`Neither V1: keeping existing ${existingType}, skipping ${nodeType}`);
    }
  } else {
    // First time seeing this base name
    nodeMap.set(baseName, node);
  }
});

// Convert map back to array
const cleanedNodes = Array.from(nodeMap.values());

console.log(`\nCleaned node count: ${cleanedNodes.length}`);
console.log(`Removed ${nodeList.length - cleanedNodes.length} duplicate nodes`);

// List some examples of what was kept
console.log('\nSample of kept nodes:');
cleanedNodes.slice(0, 10).forEach(node => {
  let label = '';
  let type = '';
  
  if (node.template && node.template.metadata) {
    label = node.template.metadata.label || node.label || '';
    type = node.template.metadata.type || node.template.metadata.name || node.name || '';
  } else {
    label = node.label || '';
    type = node.type || node.name || '';
  }
  
  console.log(`  - ${label} (${type})`);
});

// Write cleaned nodeList.json
fs.writeFileSync(
  './public/nodeList.json',
  JSON.stringify(cleanedNodes, null, 2),
  'utf8'
);

console.log('\n✅ Successfully cleaned public/nodeList.json');

