# Node Marketplace - Requirements Document

## Overview
A web-based marketplace application where users can create, configure, and export custom workflow nodes. Each node can have custom execution logic (JavaScript) and a custom properties panel UI (React component). The marketplace exports nodes as JSON that can be imported into the flow-app workflow builder.

## Core Features

### 1. Node Creation & Management
- **Create New Node**: Users can create a new node with:
  - Node name/identifier
  - Display label
  - Icon (emoji or image URL)
  - Category/type
  - Description

- **Node Library**: 
  - View all created nodes
  - Search and filter nodes
  - Edit existing nodes
  - Delete nodes
  - Preview nodes

### 2. Input Parameters Configuration
- **Define Input Parameters**:
  - Parameter name (identifier)
  - Display label
  - Parameter type (string, number, boolean, object, array, etc.)
  - Default value
  - Required/Optional flag
  - Validation rules (min/max, regex, custom validation)
  - Description/help text
  - UI input type (text, textarea, select, checkbox, date, etc.)
  - Options for select/dropdown types

- **Parameter Editor**:
  - Visual form builder for adding/editing parameters
  - Drag-and-drop to reorder parameters
  - Preview of how parameters will appear in properties panel

### 3. Execution Logic (JavaScript Code Editor)
- **Code Editor**:
  - Monaco Editor or similar for JavaScript code editing
  - Syntax highlighting
  - Code validation/linting
  - Auto-completion
  - Error detection

- **Execution Function Structure**:
  ```javascript
  // Function signature that must be exported
  async function executeNode(inputParams, context) {
    // inputParams: Object containing all input parameter values
    // context: Additional context (previous node outputs, workflow state, etc.)
    
    // Your custom logic here
    const result = processInput(inputParams);
    
    // Return output object
    return {
      success: true,
      output: result,
      // Optional: error handling
      // error: null
    };
  }
  ```

- **Testing Environment**:
  - Test execution with sample input parameters
  - View execution results
  - Debug execution errors
  - Execution logs/console output

### 4. Properties Panel UI (React Component Editor)
- **Component Code Editor**:
  - Monaco Editor for React/TypeScript code editing
  - Syntax highlighting for JSX/TSX
  - Component validation
  - Live preview of the component

- **Component Structure**:
  ```tsx
  // Component props interface
  interface NodePropertiesProps {
    node: Node; // The node data
    properties: Record<string, any>; // Current property values
    onUpdateProperties: (properties: Record<string, any>) => void;
  }

  // Component that must be exported
  export default function NodePropertiesPanel({ 
    node, 
    properties, 
    onUpdateProperties 
  }: NodePropertiesProps) {
    // Your custom UI here
    return (
      <div>
        {/* Custom form fields, inputs, etc. */}
      </div>
    );
  }
  ```

- **Component Preview**:
  - Live preview with mock data
  - Test interaction with preview
  - Responsive design preview

### 5. Node Visualization Configuration
- **Node Appearance**:
  - Choose node color/border color
  - Select icon (emoji or image)
  - Configure handle positions (input/output handles)
  - Define multiple output handles (like If node's true/false)

- **Node Preview**:
  - Visual preview of how node will appear in workflow
  - Preview with different states (selected, connected, etc.)

### 6. Export & Import
- **Export Node**:
  - Export as JSON file
  - JSON structure includes:
    - Node metadata (name, label, icon, category)
    - Input parameters definition
    - Execution code (JavaScript string)
    - Properties panel component code (React component string)
    - Node visualization config
    - Version information

- **Import Node**:
  - Import JSON files
  - Validate imported node structure
  - Preview before importing
  - Handle version conflicts

### 7. Marketplace Features
- **Public Marketplace**:
  - Browse published nodes
  - Search and filter
  - View node details, ratings, usage stats
  - Install nodes to local library

- **Publishing**:
  - Publish nodes to marketplace
  - Set visibility (public/private)
  - Add tags/categories
  - Version management

## Technical Requirements

### Technology Stack
- **Frontend Framework**: React with TypeScript
- **Code Editors**: Monaco Editor (VS Code editor)
- **State Management**: React Context or Zustand
- **UI Components**: Material-UI or similar component library
- **Code Execution**: 
  - Sandboxed JavaScript execution (using `vm2` or similar for Node.js backend)
  - Or client-side execution with Web Workers for security
- **Storage**: 
  - LocalStorage for local nodes
  - Backend API for marketplace (optional for MVP)
- **Build Tool**: Vite or Create React App

### Data Structure

#### Node JSON Export Format
```json
{
  "id": "unique-node-id",
  "version": "1.0.0",
  "metadata": {
    "name": "custom-node",
    "label": "Custom Node",
    "icon": "🔧",
    "category": "Custom",
    "description": "A custom node description",
    "author": "User Name",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "visualization": {
    "borderColor": "#555",
    "headerBackground": "#f5f5f5",
    "handles": {
      "input": {
        "position": "left",
        "id": "input"
      },
      "output": [
        {
          "position": "right",
          "id": "output",
          "label": "Output"
        }
      ]
    }
  },
  "parameters": [
    {
      "id": "param1",
      "name": "param1",
      "label": "Parameter 1",
      "type": "string",
      "inputType": "text",
      "required": true,
      "defaultValue": "",
      "validation": {
        "minLength": 1,
        "maxLength": 100
      },
      "description": "Description of parameter 1"
    }
  ],
  "executionCode": "async function executeNode(inputParams, context) {\n  // Execution logic\n  return { success: true, output: inputParams.param1 };\n}",
  "propertiesComponentCode": "import React from 'react';\n\nexport default function NodePropertiesPanel({ node, properties, onUpdateProperties }) {\n  return (\n    <div>\n      <input \n        value={properties.param1 || ''}\n        onChange={(e) => onUpdateProperties({ param1: e.target.value })}\n      />\n    </div>\n  );\n}"
}
```

### Security Considerations
- **Code Execution Sandboxing**: 
  - Execute user-provided JavaScript in a secure sandbox
  - Limit access to Node.js APIs
  - Timeout execution to prevent infinite loops
  - Memory limits

- **Component Code Validation**:
  - Validate React component code before saving
  - Prevent dangerous code (eval, innerHTML, etc.)
  - Use React's built-in XSS protection

- **Input Validation**:
  - Validate all user inputs
  - Sanitize code before execution
  - Prevent code injection

## UI/UX Requirements

### Layout
- **Header**: 
  - Logo/branding
  - Navigation (My Nodes, Marketplace, Create Node)
  - User profile/settings

- **Main Content Area**:
  - Node list/library view
  - Node editor (split view: code editor + preview)
  - Marketplace browse view

- **Sidebar** (when editing):
  - Parameter configuration panel
  - Node appearance settings
  - Export/import actions

### Node Editor Interface
1. **Top Tabs**:
   - Basic Info
   - Parameters
   - Execution Code
   - Properties UI
   - Preview

2. **Code Editor View**:
   - Left: Code editor (Monaco)
   - Right: Live preview/test panel
   - Bottom: Console/logs output

3. **Parameter Builder**:
   - Form-based UI for adding parameters
   - Drag-and-drop list
   - Parameter preview

### User Flows

#### Creating a Node
1. Click "Create New Node"
2. Fill in basic information (name, label, icon, category)
3. Add input parameters (name, type, validation)
4. Write execution code in editor
5. Write properties panel React component
6. Configure node appearance
7. Test node execution and UI
8. Save and export

#### Testing a Node
1. Navigate to node editor
2. Switch to "Test" tab
3. Fill in test input parameters
4. Click "Run Test"
5. View execution results
6. View component preview with test data

#### Exporting a Node
1. Open node in editor
2. Click "Export" button
3. Download JSON file
4. JSON can be imported into flow-app

## Integration with Flow-App

### Import Process in Flow-App
1. User imports JSON file in flow-app
2. Flow-app validates JSON structure
3. Flow-app registers the node:
   - Adds to node types
   - Registers execution function (wraps user code)
   - Registers properties panel component (dynamically loads React component)
4. Node appears in node palette
5. User can drag and drop node into workflow

### Runtime Execution
- When workflow executes:
  1. Flow-app calls node's execution function
  2. Passes input parameters and context
  3. User's JavaScript code executes
  4. Returns output
  5. Output flows to next node

### Properties Panel Integration
- When user clicks node:
  1. Flow-app renders the custom properties panel component
  2. Passes node data and current properties
  3. User interacts with custom UI
  4. Component calls `onUpdateProperties` to save changes

## MVP Features (Phase 1)
1. ✅ Create node with basic info
2. ✅ Define input parameters
3. ✅ JavaScript code editor for execution logic
4. ✅ React component editor for properties panel
5. ✅ Test execution with sample inputs
6. ✅ Preview properties panel
7. ✅ Export node as JSON
8. ✅ Import node from JSON
9. ✅ Local storage for nodes

## Future Enhancements (Phase 2+)
1. Public marketplace with backend
2. Node versioning
3. Node templates/starter templates
4. Collaborative editing
5. Node analytics/usage tracking
6. Advanced code editor features (IntelliSense, debugging)
7. Visual workflow builder for execution logic
8. Node dependencies/packages
9. Authentication and user accounts
10. Node ratings and reviews

## Success Criteria
- Users can create a custom node in under 10 minutes
- Node execution code runs safely in sandbox
- Exported JSON can be imported into flow-app without errors
- Properties panel renders correctly in flow-app
- Code editor provides good developer experience
- UI is intuitive for non-technical users

## Notes
- This marketplace is a separate application from flow-app
- Focus on ease of use for both technical and non-technical users
- Security is critical - user code execution must be sandboxed
- Consider providing node templates/examples to help users get started
- Documentation and tutorials should be easily accessible

