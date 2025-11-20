import { Handle, Position } from '@xyflow/react';
import './nodeStyles.css';

interface IfNodeData {
  label: string;
  properties: {
    condition?: string;
  };
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  connectedHandles?: Set<string>;
}

interface IfNodeProps {
  data: IfNodeData;
  selected?: boolean;
  id: string;
}

function IfNode({ data, selected, id }: IfNodeProps) {
  return (
    <div className={`node if-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input" />
      <div className="node-header">
        <span className="node-icon">❓</span>
        <span className="node-title">{data.label || 'If'}</span>
      </div>
      <div className="node-body">
        {data.properties?.condition && (
          <div className="node-info">{data.properties.condition}</div>
        )}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        style={{ top: '25%' }}
      >
        <span className="handle-label">True</span>
      </Handle>
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        style={{ top: '75%' }}
      >
        <span className="handle-label">False</span>
      </Handle>
      {data.onAddNode && !data.connectedHandles?.has('true') && (
        <>
          <div className="node-add-arm" style={{ top: '25%' }} />
          <button
            className="node-add-button"
            style={{ top: '25%' }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              data.onAddNode?.(id, { x: rect.right, y: rect.top }, 'true');
            }}
            title="Add new node (True)"
          >
            +
          </button>
        </>
      )}
      {data.onAddNode && !data.connectedHandles?.has('false') && (
        <>
          <div className="node-add-arm" style={{ top: '75%' }} />
          <button
            className="node-add-button"
            style={{ top: '75%' }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              data.onAddNode?.(id, { x: rect.right, y: rect.top }, 'false');
            }}
            title="Add new node (False)"
          >
            +
          </button>
        </>
      )}
    </div>
  );
}

export default IfNode;

