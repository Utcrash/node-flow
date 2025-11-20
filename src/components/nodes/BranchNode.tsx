import { Handle, Position } from '@xyflow/react';
import React from 'react';
import './nodeStyles.css';

interface BranchNodeData {
  label: string;
  properties: {
    branches?: number;
  };
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  connectedHandles?: Set<string>;
}

interface BranchNodeProps {
  data: BranchNodeData;
  selected?: boolean;
  id: string;
}

function BranchNode({ data, selected, id }: BranchNodeProps) {
  const branches = data.properties?.branches || 2;

  return (
    <div className={`node branch-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input" />
      <div className="node-header">
        <span className="node-icon">🌿</span>
        <span className="node-title">{data.label || 'Branch'}</span>
      </div>
      <div className="node-body">
        <div className="node-info">{branches} branches</div>
      </div>
      {Array.from({ length: branches }).map((_, i) => {
        const handleId = `output-${i}`;
        // Increased spacing: use 20%-80% range instead of evenly distributed
        const topPosition = branches === 1 
          ? '50%' 
          : `${20 + (i * 60 / (branches - 1))}%`;
        const isConnected = data.connectedHandles?.has(handleId);
        
        return (
          <React.Fragment key={i}>
            <Handle
              type="source"
              position={Position.Right}
              id={handleId}
              style={{ top: topPosition }}
            />
            {data.onAddNode && !isConnected && (
              <>
                <div className="node-add-arm" style={{ top: topPosition }} />
                <button
                  className="node-add-button"
                  style={{ top: topPosition }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    data.onAddNode?.(id, { x: rect.right, y: rect.top }, handleId);
                  }}
                  title={`Add new node (Branch ${i + 1})`}
                >
                  +
                </button>
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export default BranchNode;

