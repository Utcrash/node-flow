import { Handle, Position } from '@xyflow/react';
import './nodeStyles.css';

interface PlaceholderNodeData {
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  onShowPalette?: () => void;
}

interface PlaceholderNodeProps {
  data: PlaceholderNodeData;
  selected?: boolean;
  id: string;
}

function PlaceholderNode({ data, selected, id }: PlaceholderNodeProps) {
  return (
    <div 
      className={`node placeholder-node ${selected ? 'selected' : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        if (data.onShowPalette) {
          data.onShowPalette();
        } else if (data.onAddNode) {
          const rect = e.currentTarget.getBoundingClientRect();
          data.onAddNode(id, { x: rect.right, y: rect.top });
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="node-header">
        <span className="node-icon">+</span>
        <span className="node-title">Add Node</span>
      </div>
      <div className="node-body">
        <div className="node-info">Click to add a node</div>
      </div>
    </div>
  );
}

export default PlaceholderNode;

