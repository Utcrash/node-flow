import { Handle, Position } from '@xyflow/react';
import './nodeStyles.css';

interface CodeblockNodeData {
  label: string;
  properties: {
    code?: string;
    language?: string;
  };
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  hasOutgoingEdges?: boolean;
}

interface CodeblockNodeProps {
  data: CodeblockNodeData;
  selected?: boolean;
  id: string;
}

function CodeblockNode({ data, selected, id }: CodeblockNodeProps) {
  return (
    <div className={`node codeblock-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input" />
      <div className="node-header">
        <span className="node-icon">💻</span>
        <span className="node-title">{data.label || 'Code Block'}</span>
      </div>
      <div className="node-body">
        {data.properties?.language && (
          <div className="node-info">{data.properties.language}</div>
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

export default CodeblockNode;

