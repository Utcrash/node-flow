import { Handle, Position } from '@xyflow/react';
import './nodeStyles.css';

interface HttpRequestNodeData {
  label: string;
  properties: {
    method?: string;
    url?: string;
  };
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  hasOutgoingEdges?: boolean;
}

interface HttpRequestNodeProps {
  data: HttpRequestNodeData;
  selected?: boolean;
  id: string;
}

function HttpRequestNode({ data, selected, id }: HttpRequestNodeProps) {
  return (
    <div className={`node http-request-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input" />
      <div className="node-header">
        <span className="node-icon">🌐</span>
        <span className="node-title">{data.label || 'HTTP Request'}</span>
      </div>
      <div className="node-body">
        {data.properties?.method && (
          <div className="node-info">
            {data.properties.method} {data.properties.url || ''}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="output" />
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

export default HttpRequestNode;

