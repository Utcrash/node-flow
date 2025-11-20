import { useEffect, useState } from 'react';
import { loadTemplates } from '../utils/templateLoader';
import './NodePalette.css';

interface NodePaletteProps {
  onAddNode: (type: string, label: string) => void;
  highlighted?: boolean;
  filterMode?: 'all' | 'trigger' | 'process';
}

interface NodeType {
  type: string;
  label: string;
  icon: string;
  category: string;
}

function NodePalette({ onAddNode, highlighted = false, filterMode = 'all' }: NodePaletteProps) {
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load nodes from nodeList.json
    const loadNodes = async () => {
      try {
        // Load base nodes from nodeList.json
        const response = await fetch('/nodeList.json');
        const rawNodes = await response.json();
        
        // Normalize nodes to handle both formats
        const normalizedNodes: NodeType[] = rawNodes.map((node: any) => {
          // Check if it's a template-based node
          if (node.template && node.template.metadata) {
            return {
              type: node.template.metadata.name || node.name,
              label: node.template.metadata.label || node.label,
              icon: node.template.metadata.icon || '📦',
              category: node.template.metadata.category || 'Custom',
            };
          }
          // Otherwise use the simple format
          return {
            type: node.type,
            label: node.label,
            icon: node.icon,
            category: node.category,
          };
        });
        
        // Load template nodes from template.js
        const templates = await loadTemplates();
        const templateNodes = Object.values(templates).map((template) => ({
          type: template.metadata.name,
          label: template.metadata.label,
          icon: template.metadata.icon,
          category: template.metadata.category || 'Custom',
        }));
        
        // Combine both, removing duplicates by type
        const allNodes = [...normalizedNodes, ...templateNodes];
        const uniqueNodes = allNodes.filter(
          (node, index, self) => 
            index === self.findIndex((n) => n.type === node.type)
        );
        
        setNodeTypes(uniqueNodes);
      } catch (error) {
        console.error('Error loading node list:', error);
        // Fallback to empty array if loading fails
        setNodeTypes([]);
      }
    };
    
    loadNodes();
  }, []);

  // Filter nodes based on search query and filter mode
  const filteredNodes = nodeTypes.filter((node) => {
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesCategory = true;
    if (filterMode === 'trigger') {
      matchesCategory = node.category.toUpperCase() === 'TRIGGER';
    } else if (filterMode === 'process') {
      matchesCategory = node.category.toUpperCase() !== 'TRIGGER';
    }
    // If filterMode === 'all', show all nodes
    
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(
    new Set(filteredNodes.map((node) => node.category))
  );

  return (
    <div className={`node-palette ${highlighted ? 'highlighted' : ''}`}>
      <div className="node-palette-header">
        <h3>Nodes</h3>
        <input
          type="text"
          className="node-palette-search"
          placeholder="Search nodes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="node-palette-body">
        {filteredNodes.length === 0 ? (
          <div className="no-results">No nodes found</div>
        ) : (
          categories.map((category) => (
            <div key={category} className="node-category">
              <div className="node-category-title">{category}</div>
              {filteredNodes
                .filter((node) => node.category === category)
                .map((node) => (
                  <button
                    key={node.type}
                    className="node-palette-item"
                    onClick={() => onAddNode(node.type, node.label)}
                    title={node.label}
                  >
                    <span className="node-palette-icon">{node.icon}</span>
                    <span className="node-palette-label">{node.label}</span>
                  </button>
                ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default NodePalette;

