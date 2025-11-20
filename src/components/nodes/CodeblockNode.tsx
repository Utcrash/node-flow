import React, { useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import './nodeStyles.css';

interface CodeblockNodeData {
  label: string;
  properties: {
    code?: string;
    language?: string;
  };
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  hasOutgoingEdges?: boolean;
  connectedHandles?: Set<string>;
  options?: {
    errorHandling?: 'stop' | 'continue' | 'globalError';
  };
}

interface CodeblockNodeProps {
  data: CodeblockNodeData;
  selected?: boolean;
  id: string;
}

function CodeblockNode({ data, selected, id }: CodeblockNodeProps) {
  const updateNodeInternals = useUpdateNodeInternals();
  const hasErrorHandle = data.options?.errorHandling === 'continue';
  const isOutputConnected = data.hasOutgoingEdges;
  const isErrorConnected = data.connectedHandles?.has('error');

  // Calculate positions based on which handles are visible
  const outputTop = hasErrorHandle ? '30%' : '50%';
  const errorTop = '70%';

  // Update node internals when error handling option changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateNodeInternals(id);
    }, 10);
    return () => clearTimeout(timer);
  }, [hasErrorHandle, id, updateNodeInternals]);

  return (
    <div className={`node codeblock-node ${selected ? 'selected' : ''}`} data-has-error={hasErrorHandle ? 'true' : 'false'}>
      <Handle type="target" position={Position.Left} id="input" isConnectable={true} />
      <div className="node-header">
        <span className="node-icon">💻</span>
        <span className="node-title">{data.label || 'Code Block'}</span>
      </div>
      <div className="node-body">
        {data.properties?.language && (
          <div className="node-info">{data.properties.language}</div>
        )}
      </div>
      
      {/* Output handle */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="output"
        isConnectable={true}
        style={{ top: outputTop }}
      />
      {data.onAddNode && !isOutputConnected && (
        <>
          <div className="node-add-arm" style={{ top: outputTop }} />
          <button
            className="node-add-button"
            style={{ top: outputTop }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              data.onAddNode?.(id, { x: rect.right, y: rect.top }, 'output');
            }}
            title="Add new node"
          >
            +
          </button>
        </>
      )}

      {/* Error handle - always render but hide when not enabled */}
      <Handle 
        type="source" 
        position={Position.Right} 
        id="error"
        isConnectable={hasErrorHandle}
        className={hasErrorHandle ? "error-handle" : undefined}
        style={{ 
          top: errorTop,
          background: '#fff',
          border: '2px solid #ff5252',
          opacity: hasErrorHandle ? 1 : 0,
          pointerEvents: hasErrorHandle ? 'auto' : 'none',
          display: hasErrorHandle ? 'block' : 'none',
        }}
      >
        {hasErrorHandle && <span className="handle-label">Error</span>}
      </Handle>
      {data.onAddNode && !isErrorConnected && hasErrorHandle && (
        <>
          <div className="node-add-arm" style={{ top: errorTop }} />
          <button
            className="node-add-button"
            style={{ top: errorTop }}
            onClick={(e) => {
              e.stopPropagation();
              const rect = e.currentTarget.getBoundingClientRect();
              data.onAddNode?.(id, { x: rect.right, y: rect.top }, 'error');
            }}
            title="Add new node (Error)"
          >
            +
          </button>
        </>
      )}
    </div>
  );
}

export default CodeblockNode;

