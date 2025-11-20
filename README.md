# Flow App

A visual workflow builder application inspired by n8n, built with React and ReactFlow. Create, connect, and execute custom workflow nodes with an intuitive drag-and-drop interface.

## 🚀 Features

### Visual Workflow Builder
- **Interactive Canvas**: Drag-and-drop interface for creating complex workflows
- **Multiple Node Types**: Support for triggers, filters, branches, loops, conditionals, HTTP requests, and custom nodes
- **Smart Connections**: Visual connection system with labeled edges for multi-output nodes
- **Auto-Layout**: Intelligent node arrangement with automatic branching for multi-output scenarios

### Node System
- **Built-in Nodes**: Pre-configured nodes for common workflow operations
- **Dynamic Node Loading**: Load custom nodes from external JSON definitions
- **Custom Properties Panels**: Each node type can have its own React-based properties UI
- **Multi-Output Support**: Nodes can have multiple outputs (true/false, success/error, etc.)

### UI/UX
- **Dark Theme**: Modern dark interface with subtle, professional styling
- **Properties Modal**: Comprehensive node configuration with input/output panels
- **Node Palette**: Searchable sidebar with categorized node types
- **Smart Filtering**: Context-aware node palette (triggers vs. process nodes)
- **Double-click to Edit**: Intuitive interaction model

### Workflow Management
- **Add Nodes**: Multiple ways to add nodes (palette, arms, floating button)
- **Format Layout**: One-click auto-arrangement of workflow nodes
- **Connection Arms**: Visual "plus" buttons on nodes for quick connections
- **Edge Labels**: Automatic labeling of connections based on output handles

## 🎨 Node Marketplace

Create your own custom nodes using the **[Node Marketplace](https://github.com/Utcrash/node-marketplace)** application!

The marketplace allows you to:
- Define custom node metadata (name, icon, category, description)
- Configure input parameters with validation
- Write JavaScript execution logic
- Create custom React properties panels
- Export nodes as JSON for use in this workflow app

Simply export nodes from the marketplace and add them to `public/nodeList.json` to use them in your workflows.

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Utcrash/flow-app.git
cd flow-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── nodes/              # Built-in node components
│   │   ├── TriggerNode.tsx
│   │   ├── FilterNode.tsx
│   │   ├── IfNode.tsx
│   │   ├── LoopNode.tsx
│   │   ├── DynamicNode.tsx  # For marketplace nodes
│   │   └── ...
│   ├── NodePalette.tsx     # Node selection sidebar
│   ├── NodePropertiesPanel.tsx
│   ├── DynamicPropertiesPanel.tsx
│   └── defaultPropertiesComponent.ts
├── utils/
│   ├── templateLoader.ts   # Load custom nodes
│   └── nodeExecution.ts    # Node execution utilities
├── App.tsx                 # Main application
└── main.tsx               # Entry point
public/
└── nodeList.json          # Custom node definitions
```

## 🔧 Usage

### Adding Nodes to the Canvas

1. **From Palette**: Click the `+` button in the top-left or click on the placeholder node
2. **From Arms**: Click the `+` icon on the right side of any node
3. **Manual Connection**: Drag from a node's output handle to another node's input handle

### Configuring Nodes

1. **Double-click** any node to open its properties modal
2. Edit parameters in the **Properties** tab
3. View input/output information in the side panels
4. Click outside the modal or the `×` button to close

### Creating Custom Nodes

1. Visit the **[Node Marketplace](https://github.com/Utcrash/node-marketplace)**
2. Create and configure your custom node
3. Export the node as JSON
4. Add the JSON to `public/nodeList.json` in this project
5. Refresh the workflow app to see your new node in the palette

### Node Definition Format

Custom nodes in `nodeList.json` should follow this structure:

```json
{
  "id": "custom-node-v1",
  "version": "1.0.0",
  "metadata": {
    "name": "custom-node",
    "label": "Custom Node",
    "icon": "🔧",
    "category": "PROCESS",
    "description": "A custom node"
  },
  "visualization": {
    "borderColor": "#555",
    "headerBackground": "#f5f5f5",
    "handles": {
      "input": { "position": "left", "id": "input" },
      "output": [
        { "position": "right", "id": "output", "label": "Output" }
      ]
    }
  },
  "parameters": [...],
  "executionCode": "...",
  "propertiesComponentCode": "default"
}
```

## 🛠️ Technology Stack

- **React 18** with TypeScript
- **ReactFlow (@xyflow/react)** - Visual workflow canvas
- **Vite** - Build tool and dev server
- **Babel Standalone** - Runtime JSX compilation for dynamic components
- **Dagre** - Auto-layout algorithm

## 🔐 Security Notes

⚠️ **Important**: Dynamic code execution is used for custom nodes. This implementation is suitable for:
- Local development
- Trusted node sources
- Internal tools

For production deployment with untrusted nodes, consider:
- Backend execution with sandboxing
- Code validation and sanitization
- Web Workers for client-side isolation
- Timeout and memory limits

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

MIT

## 🔗 Related Projects

- **[Node Marketplace](https://github.com/Utcrash/node-marketplace)** - Create and share custom workflow nodes

---

Built with ❤️ using React and ReactFlow
