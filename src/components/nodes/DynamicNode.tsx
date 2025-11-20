import React from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import './nodeStyles.css';
import type { NodeTemplate } from '../../utils/templateLoader';

interface DynamicNodeData {
  label: string;
  properties: Record<string, any>;
  template?: NodeTemplate;
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  connectedHandles?: Set<string>;
  hasOutgoingEdges?: boolean;
}

function DynamicNode(props: NodeProps) {
  const { data, selected, id } = props;
  const nodeData = data as unknown as DynamicNodeData;
  const template = nodeData.template;
  
  if (!template) {
    return (
      <div className={`node ${selected ? 'selected' : ''}`}>
        <div className="node-header">
          <span className="node-icon">❌</span>
          <span className="node-title">Invalid Node</span>
        </div>
      </div>
    );
  }

  const visualization = template.visualization;
  const handles = visualization.handles;

  return (
    <div 
      className={`node ${selected ? 'selected' : ''}`}
      style={{
        borderColor: visualization.borderColor,
      }}
    >
      {/* Input handle */}
      {handles.input && (
        <Handle
          type="target"
          position={Position[handles.input.position.charAt(0).toUpperCase() + handles.input.position.slice(1) as 'Left' | 'Right' | 'Top' | 'Bottom']}
          id={handles.input.id}
        />
      )}

      {/* Node header */}
      <div 
        className="node-header"
        style={{
          background: visualization.headerBackground,
        }}
      >
        <span className="node-icon">{template.metadata.icon}</span>
        <span className="node-title">{nodeData.label || template.metadata.label}</span>
      </div>

      {/* Node body */}
      <div className="node-body">
        {template.parameters && template.parameters.length > 0 && (
          <div className="node-info">
            {template.parameters.length} parameter{template.parameters.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Output handles */}
      {handles.output.map((outputHandle: any, index: number) => {
        const isConnected = nodeData.connectedHandles?.has(outputHandle.id);
        const handlePosition = Position[outputHandle.position.charAt(0).toUpperCase() + outputHandle.position.slice(1) as 'Left' | 'Right' | 'Top' | 'Bottom'];
        
        // Calculate top position for multiple handles
        const totalHandles = handles.output.length;
        const topPercent = totalHandles === 1 
        ? '50%' 
        : `${50 - ((totalHandles - 1) * 12.5) + (index * 25)}%`;
        return (
          <React.Fragment key={outputHandle.id}>
            <Handle
              type="source"
              position={handlePosition}
              id={outputHandle.id}
              style={{ top: topPercent }}
            >
              {outputHandle.label && (
                <span className="handle-label">{String(outputHandle.label)}</span>
              )}
            </Handle>
            {nodeData.onAddNode && !isConnected && (
              <>
                <div 
                  className="node-add-arm" 
                  style={{ top: topPercent }}
                />
                <button
                  className="node-add-button"
                  style={{ top: topPercent }}
                  onClick={(e) => {
                    e.stopPropagation();
                    const rect = e.currentTarget.getBoundingClientRect();
                    nodeData.onAddNode?.(id as string, { x: rect.right, y: rect.top }, outputHandle.id);
                  }}
                  title={`Add new node (${outputHandle.label || outputHandle.id})`}
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

export default DynamicNode;

