import { useEffect, useState } from 'react';
import { loadTemplates } from '../utils/templateLoader';
import { getIconFromClassName } from '../utils/iconMapper';
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
  group?: string;
  description?: string;
}

function NodePalette({ onAddNode, highlighted = false, filterMode = 'all' }: NodePaletteProps) {
  const [nodeTypes, setNodeTypes] = useState<NodeType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Auto-expand all groups when searching
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      // Expand all groups when there's a search query
      const allGroups = new Set(nodeTypes.map(node => node.group || 'Other'));
      setExpandedGroups(allGroups);
    }
  }, [searchQuery, nodeTypes]);

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
              group: node.template.metadata.group || 'Other',
              description: node.template.metadata.description || node.description || '',
            };
          }
          // Otherwise use the simple format
          return {
            type: node.type,
            label: node.label,
            icon: node.icon,
            category: node.category,
            group: 'Other',
            description: '',
          };
        });
        
        // Load template nodes from template.js
        const templates = await loadTemplates();
        const templateNodes = Object.values(templates).map((template) => ({
          type: template.metadata.name,
          label: template.metadata.label,
          icon: template.metadata.icon,
          category: template.metadata.category || 'Custom',
          group: (template.metadata as any).group || 'Other',
          description: template.metadata.description || '',
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
      node.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (node.group && node.group.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (node.description && node.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    let matchesCategory = true;
    if (filterMode === 'trigger') {
      matchesCategory = node.category.toUpperCase() === 'TRIGGER';
    } else if (filterMode === 'process') {
      matchesCategory = node.category.toUpperCase() !== 'TRIGGER';
    }
    // If filterMode === 'all', show all nodes
    
    return matchesSearch && matchesCategory;
  });

  // Group nodes by group field
  const groupedNodes = filteredNodes.reduce((acc, node) => {
    const group = node.group || 'Other';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(node);
    return acc;
  }, {} as Record<string, NodeType[]>);

  const groups = Object.keys(groupedNodes).sort();

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

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
          groups.map((group) => {
            const isExpanded = expandedGroups.has(group);
            const groupNodes = groupedNodes[group];
            
            return (
              <div key={group} className="node-group">
                <button 
                  className="node-group-header"
                  onClick={() => toggleGroup(group)}
                >
                  <span className="node-group-arrow">{isExpanded ? '▼' : '▶'}</span>
                  <span className="node-group-title">{group}</span>
                  <span className="node-group-count">{groupNodes.length}</span>
                </button>
                
                {isExpanded && (
                  <div className="node-group-items">
                    {groupNodes.map((node) => (
                      <button
                        key={node.type}
                        className="node-palette-item"
                        onClick={() => onAddNode(node.type, node.label)}
                        title={node.description || node.label}
                      >
                        <div className="node-palette-item-header">
                          <span className="node-palette-icon ni">{getIconFromClassName(node.icon)}</span>
                          <span className="node-palette-label">{node.label}</span>
                        </div>
                        {node.description && (
                          <div className="node-palette-item-description">
                            {node.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default NodePalette;

