# Template Integration Guide

## Overview
The flow-app now supports dynamic node loading from `template.js`. Nodes defined in templates are automatically loaded, registered, and rendered with their custom properties panels.

## How It Works

### 1. Template Structure
Templates are defined in `template.js` with the following structure:
```javascript
export const node = [
  {
    name: 'http-request',
    template: {
      version: '1.0.0',
      metadata: { ... },
      visualization: { ... },
      parameters: [ ... ],
      executionCode: '...',
      propertiesComponentCode: '...'
    }
  }
]
```

### 2. Automatic Loading
- Templates are automatically loaded on app startup via `loadTemplates()`
- Dynamic nodes are registered in the node types registry
- Template nodes appear in the node palette under their category

### 3. Node Rendering
- **Visual Node**: `DynamicNode` component renders nodes based on template visualization config
- **Properties Panel**: `DynamicPropertiesPanel` dynamically renders the React component from `propertiesComponentCode`
- Uses existing CSS classes from the app, only overrides when specified in template

### 4. Parameter Values Access

#### Getting All Parameter Values
```typescript
import { getAllNodeParameterValues } from './utils/nodeExecution';

const node = /* your node */;
const allParams = getAllNodeParameterValues(node);
// Returns: { url: '...', method: 'GET', headers: {...}, body: '...' }
```

#### Preparing Execution Payload for Backend
```typescript
import { prepareNodeExecutionPayload } from './utils/nodeExecution';

const node = /* your node */;
const payload = prepareNodeExecutionPayload(node, context);
// Returns: {
//   nodeId: '...',
//   nodeType: 'http-request',
//   templateName: 'http-request',
//   inputParams: { url: '...', method: 'GET', ... },
//   executionCode: 'async function executeNode(...) { ... }',
//   context: { ... }
// }
```

#### Executing Node (for testing)
```typescript
import { executeNode } from './utils/nodeExecution';

const node = /* your node */;
const result = await executeNode(node, context);
// In production, this would call your backend API
```

## Backend Integration

When you need to execute a node on the backend:

1. **Collect all parameter values**:
   ```typescript
   const payload = prepareNodeExecutionPayload(node, {
     previousNodeOutputs: {...},
     workflowState: {...}
   });
   ```

2. **Send to backend API**:
   ```typescript
   const response = await fetch('/api/execute-node', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify(payload)
   });
   const result = await response.json();
   ```

3. **Backend receives**:
   - `inputParams`: All user-defined parameter values
   - `executionCode`: JavaScript code to execute
   - `context`: Additional workflow context

4. **Backend executes** the code in a sandboxed environment and returns results

## Properties Panel Component

The `propertiesComponentCode` should export a React component:

```tsx
import React, { useState, useEffect } from 'react';

export default function NodePropertiesPanel({ 
  node, 
  properties, 
  onUpdateProperties 
}) {
  // Your custom UI here
  // Access node.parameters for parameter definitions
  // Use properties for current values
  // Call onUpdateProperties to save changes
  return (
    <div>
      {/* Your custom form fields */}
    </div>
  );
}
```

The component receives:
- `node`: Full node object with `parameters` and `metadata`
- `properties`: Current property values (from `node.data.properties`)
- `onUpdateProperties`: Callback to update properties

## CSS Styling

The properties panel uses existing CSS classes:
- `.properties-panel`
- `.properties-panel-header`
- `.properties-panel-body`
- `.property-group`
- `.node-type-badge`

You can use these classes in your custom component, or add inline styles if needed.

## Example Usage

1. **Add a template node** from the palette
2. **Click the node** to open properties panel
3. **Fill in parameters** using the custom UI
4. **Values are stored** in `node.data.properties`
5. **When executing**, use `prepareNodeExecutionPayload()` to get all values for the API call

## Files Created

- `src/utils/templateLoader.ts` - Template loading and parameter extraction
- `src/utils/nodeExecution.ts` - Execution payload preparation
- `src/components/nodes/DynamicNode.tsx` - Dynamic node renderer
- `src/components/DynamicPropertiesPanel.tsx` - Dynamic properties panel renderer

## Notes

- Template nodes automatically support multiple output handles (like If node's true/false)
- Plus buttons appear for each unconnected output handle
- Connected handles hide their plus buttons automatically
- All parameter values are accessible via utility functions for API calls

