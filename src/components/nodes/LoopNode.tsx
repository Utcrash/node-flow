import { Handle, Position } from '@xyflow/react';
import './nodeStyles.css';

interface LoopNodeData {
  label: string;
  properties: {
    loopType?: 'for' | 'while' | 'forEach';
    condition?: string;
  };
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  connectedHandles?: Set<string>;
}

interface LoopNodeProps {
  data: LoopNodeData;
  selected?: boolean;
  id: string;
}

function LoopNode({ data, selected, id }: LoopNodeProps) {
  return (
    <div className={`node loop-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input" />
      <div className="node-header">
        <span className="node-icon">🔄</span>
        <span className="node-title">{data.label || 'Loop'}</span>
      </div>
      <div className="node-body">
        {data.properties?.loopType && (
          <div className="node-info">{data.properties.loopType}</div>
        )}
      </div>
      <Handle type="source" position={Position.Right} id="output" style={{ top: '35%' }} />
      <Handle type="source" position={Position.Right} id="loop-output" style={{ top: '65%' }} />
      {data.onAddNode && !data.connectedHandles?.has('output') && (
        <>
          <div className="node-add-arm" style={{ top: '35%' }} />
          <button
            className="node-add-button"
            style={{ top: '35%' }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              data.onAddNode?.(id, { x: rect.right, y: rect.top }, 'output');
            }}
            title="Add new node (Output)"
          >
            +
          </button>
        </>
      )}
      {data.onAddNode && !data.connectedHandles?.has('loop-output') && (
        <>
          <div className="node-add-arm" style={{ top: '65%' }} />
          <button
            className="node-add-button"
            style={{ top: '65%' }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              data.onAddNode?.(id, { x: rect.right, y: rect.top }, 'loop-output');
            }}
            title="Add new node (Loop Output)"
          >
            +
          </button>
        </>
      )}
    </div>
  );
}

export default LoopNode;

