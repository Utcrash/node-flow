const fs = require('fs');

// Read both files
const marketplaceData = JSON.parse(fs.readFileSync('./maerketplace.json', 'utf8'));
const nodeListData = JSON.parse(fs.readFileSync('./public/nodeList.json', 'utf8'));

// Extract marketplace nodes
const marketplaceNodes = marketplaceData.nodeList;

// Create a set of existing node types in nodeList.json
const existingNodeTypes = new Set();
nodeListData.forEach(node => {
  if (node.template?.metadata?.type) {
    existingNodeTypes.add(node.template.metadata.type);
  }
  if (node.type) {
    existingNodeTypes.add(node.type);
  }
});

console.log(`Existing node types in nodeList.json: ${existingNodeTypes.size}`);
console.log(`Total nodes in marketplace.json: ${marketplaceNodes.length}`);

// Helper function to convert input schema to parameters
function convertSchemaToParameters(inputSchema, label) {
  if (!inputSchema || !Array.isArray(inputSchema)) return [];
  
  return inputSchema.map((field, index) => {
    const param = {
      id: field.key,
      name: field.key,
      label: field.key.charAt(0).toUpperCase() + field.key.slice(1).replace(/([A-Z])/g, ' $1'),
      type: field.type.toLowerCase(),
      inputType: 'text',
      required: false,
      defaultValue: '',
      description: `${field.key} parameter for ${label}`
    };

    // Determine input type based on field type
    if (field.type === 'Boolean') {
      param.inputType = 'checkbox';
      param.defaultValue = false;
    } else if (field.type === 'Number') {
      param.inputType = 'number';
      param.defaultValue = 0;
    } else if (field.type === 'Array' || field.type === 'Object' || field.type === 'KeyValPair') {
      param.inputType = 'textarea';
      param.defaultValue = field.type === 'Array' ? '[]' : '{}';
    } else if (field.key.toLowerCase().includes('url') || field.key.toLowerCase().includes('endpoint')) {
      param.inputType = 'url';
    }

    if (field.subType) {
      param.subType = field.subType.toLowerCase();
    }

    return param;
  });
}

// Helper function to generate icon based on group/type
function generateIcon(group, type, label) {
  const iconMap = {
    'HTTP': '🌐',
    'Database': '💾',
    'Misc': '⚙️',
    'Transform': '🔄',
    'Logic': '🧠',
    'File': '📁',
    'Email': '📧',
    'Integration': '🔗',
    'Queue': '📬',
    'Storage': '💿',
    'AI': '🤖',
    'Security': '🔐'
  };
  
  return iconMap[group] || '⚡';
}

// Convert marketplace node to template format
function convertMarketplaceNodeToTemplate(marketplaceNode) {
  const icon = generateIcon(marketplaceNode.group, marketplaceNode.type, marketplaceNode.label);
  
  // Determine output handles based on error schema
  const outputHandles = [
    {
      position: "right",
      id: "output",
      label: "Success"
    }
  ];
  
  if (marketplaceNode.errorSchema && marketplaceNode.errorSchema.length > 0) {
    outputHandles.push({
      position: "right",
      id: "error",
      label: "Error"
    });
  }

  // Determine if node should have input handle (triggers don't have inputs)
  const hasInput = marketplaceNode.category !== 'TRIGGER';

  const template = {
    version: `${marketplaceNode.version || 1}.0.0`,
    metadata: {
      name: marketplaceNode.type.toLowerCase(),
      label: marketplaceNode.label,
      icon: icon,
      category: marketplaceNode.category || "PROCESS",
      type: marketplaceNode.type,
      group: marketplaceNode.group,
      connectorType: marketplaceNode.connectorType || "NONE",
      description: `${marketplaceNode.label} node from ${marketplaceNode.group} group`,
      author: "Converted from DNIO Nodes",
      createdAt: marketplaceNode._createdAt || new Date().toISOString(),
      updatedAt: marketplaceNode._lastUpdated || new Date().toISOString()
    },
    visualization: {
      borderColor: marketplaceNode.category === 'TRIGGER' ? "#4CAF50" : "#555",
      headerBackground: marketplaceNode.category === 'TRIGGER' ? "#E8F5E8" : "#f5f5f5",
      handles: {
        output: outputHandles
      }
    },
    parameters: convertSchemaToParameters(marketplaceNode.inputSchema, marketplaceNode.label),
    executionCode: marketplaceNode.code || "async function executeNode(inputParams, context) {\n  return { success: true, output: {} };\n}",
    propertiesComponentCode: "default"
  };

  // Add input handle only if not a trigger
  if (hasInput) {
    template.visualization.handles.input = {
      position: "left",
      id: "input"
    };
  }

  return {
    name: marketplaceNode.type.toLowerCase(),
    label: marketplaceNode.label,
    description: `${marketplaceNode.label} node from ${marketplaceNode.group} group`,
    template: template
  };
}

// Add missing fields to existing nodes in nodeList
function addMissingFieldsToExistingNodes(nodeList, marketplaceNodes) {
  // Create a map of marketplace nodes by type
  const marketplaceMap = {};
  marketplaceNodes.forEach(node => {
    marketplaceMap[node.type] = node;
  });

  return nodeList.map(node => {
    // Skip nodes without templates or already having these fields
    if (!node.template) return node;

    const type = node.template.metadata?.type || node.type;
    const marketplaceNode = marketplaceMap[type];

    if (marketplaceNode && node.template.metadata) {
      // Add missing fields to metadata
      node.template.metadata.type = marketplaceNode.type;
      node.template.metadata.group = marketplaceNode.group;
      node.template.metadata.connectorType = marketplaceNode.connectorType || "NONE";
    }

    return node;
  });
}

// Find new nodes to add
const newNodes = [];
marketplaceNodes.forEach(marketplaceNode => {
  if (!existingNodeTypes.has(marketplaceNode.type)) {
    const converted = convertMarketplaceNodeToTemplate(marketplaceNode);
    newNodes.push(converted);
  }
});

console.log(`\nNew nodes to add: ${newNodes.length}`);
console.log('Sample new nodes:');
newNodes.slice(0, 5).forEach(node => {
  console.log(`  - ${node.label} (${node.template.metadata.type})`);
});

// Update existing nodes with missing fields
const updatedNodeList = addMissingFieldsToExistingNodes(nodeListData, marketplaceNodes);

// Combine updated nodes with new nodes
const finalNodeList = [...updatedNodeList, ...newNodes];

console.log(`\nFinal node count: ${finalNodeList.length}`);

// Write the updated nodeList.json
fs.writeFileSync(
  './public/nodeList.json',
  JSON.stringify(finalNodeList, null, 2),
  'utf8'
);

console.log('\n✅ Successfully updated public/nodeList.json');
console.log(`   - Updated ${updatedNodeList.length} existing nodes with missing fields`);
console.log(`   - Added ${newNodes.length} new nodes from marketplace`);
console.log(`   - Total nodes: ${finalNodeList.length}`);

