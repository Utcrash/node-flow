import { Handle, Position } from '@xyflow/react';
import './nodeStyles.css';

interface FilterNodeData {
  label: string;
  properties: {
    condition?: string;
    operator?: string;
  };
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  hasOutgoingEdges?: boolean;
}

interface FilterNodeProps {
  data: FilterNodeData;
  selected?: boolean;
  id: string;
}

function FilterNode({ data, selected, id }: FilterNodeProps) {
  return (
    <div className={`node filter-node ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} id="input" />
      <div className="node-header">
        <span className="node-icon">🔍</span>
        <span className="node-title">{data.label || 'Filter'}</span>
      </div>
      <div className="node-body">
        {data.properties?.condition && (
          <div className="node-info">{data.properties.condition}</div>
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

export default FilterNode;

