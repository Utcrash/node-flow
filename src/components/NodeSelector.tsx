import { useEffect, useRef } from 'react';
import './NodeSelector.css';

interface NodeType {
  type: string;
  label: string;
  icon: string;
}

interface NodeSelectorProps {
  position: { x: number; y: number };
  onSelect: (nodeType: string, label: string) => void;
  onClose: () => void;
}

const nodeTypes: NodeType[] = [
  { type: 'trigger', label: 'Trigger', icon: '⚡' },
  { type: 'filter', label: 'Filter', icon: '🔍' },
  { type: 'branch', label: 'Branch', icon: '🌿' },
  { type: 'loop', label: 'Loop', icon: '🔄' },
  { type: 'if', label: 'If', icon: '❓' },
  { type: 'codeblock', label: 'Code Block', icon: '💻' },
  { type: 'httpRequest', label: 'HTTP Request', icon: '🌐' },
];

function NodeSelector({ position, onSelect, onClose }: NodeSelectorProps) {
  const selectorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  return (
    <div
      ref={selectorRef}
      className="node-selector"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="node-selector-header">
        <span>Select Node Type</span>
      </div>
      <div className="node-selector-body">
        {nodeTypes.map((nodeType) => (
          <button
            key={nodeType.type}
            className="node-selector-item"
            onClick={() => {
              onSelect(nodeType.type, nodeType.label);
              onClose();
            }}
          >
            <span className="node-selector-icon">{nodeType.icon}</span>
            <span className="node-selector-label">{nodeType.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default NodeSelector;

