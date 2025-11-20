import { Handle, Position } from '@xyflow/react';
import './nodeStyles.css';

interface TriggerNodeData {
  label: string;
  properties: {
    triggerType?: 'scheduled' | 'manual';
    schedule?: string;
  };
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  hasOutgoingEdges?: boolean;
}

interface TriggerNodeProps {
  data: TriggerNodeData;
  selected?: boolean;
  id: string;
}

function TriggerNode({ data, selected, id }: TriggerNodeProps) {
  return (
    <div className={`node trigger-node ${selected ? 'selected' : ''}`}>
      <Handle type="source" position={Position.Right} id="output" />
      <div className="node-header">
        <span className="node-icon">⚡</span>
        <span className="node-title">{data.label || 'Trigger'}</span>
      </div>
      <div className="node-body">
        {data.properties?.triggerType && (
          <div className="node-info">
            Type: {data.properties.triggerType}
          </div>
        )}
      </div>
      {data.onAddNode && !data.hasOutgoingEdges && (
        <>
          <div className="node-add-arm" />
          <button
            className="node-add-button"
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              data.onAddNode?.(id, { x: rect.right, y: rect.top });
            }}
            title="Add new node"
          >
            +
          </button>
        </>
      )}
    </div>
  );
}

export default TriggerNode;

