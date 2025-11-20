import React, { useState, useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import './nodeStyles.css';
import type { NodeTemplate } from '../../utils/templateLoader';
import { getIconFromClassName } from '../../utils/iconMapper';

interface DynamicNodeData {
  label: string;
  properties: Record<string, any>;
  options?: Record<string, any>;
  template?: NodeTemplate;
  onAddNode?: (nodeId: string, position: { x: number; y: number }, handleId?: string) => void;
  onUpdateLabel?: (nodeId: string, newLabel: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  connectedHandles?: Set<string>;
  hasOutgoingEdges?: boolean;
}

function DynamicNode(props: NodeProps) {
  const { data, selected, id } = props;
  const nodeData = data as unknown as DynamicNodeData;
  const [isEditing, setIsEditing] = useState(false);
  const [editedLabel, setEditedLabel] = useState(nodeData.label || '');
  const updateNodeInternals = useUpdateNodeInternals();

  // Update editedLabel when nodeData.label changes
  useEffect(() => {
    setEditedLabel(nodeData.label || '');
  }, [nodeData.label]);
  
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

  const visualization = template.visualization || { handles: { input: null, output: [] }, borderColor: '#ccc' };
  const handles = visualization.handles || { input: null, output: [] };

  // Always include error handle in the array, but it will be hidden if not enabled
  const hasErrorHandle = nodeData.options?.errorHandling === 'continue';
  const outputHandles: any[] = [
    ...(handles.output || []),
    {
      id: 'error',
      label: 'Error',
      position: 'right',
      isError: true,
      isEnabled: hasErrorHandle
    }
  ];

  // Update node internals when error handling option changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateNodeInternals(id as string);
    }, 10);
    return () => clearTimeout(timer);
  }, [hasErrorHandle, id, updateNodeInternals]);

  return (
    <div 
      className={`node ${selected ? 'selected' : ''}`}
      style={{
        borderColor: visualization.borderColor,
      }}
      data-has-error={hasErrorHandle ? 'true' : 'false'}
    >
      {/* Input handle */}
      {handles.input && handles.input.position && (
        <Handle
          type="target"
          position={Position[handles.input.position.charAt(0).toUpperCase() + handles.input.position.slice(1) as 'Left' | 'Right' | 'Top' | 'Bottom']}
          id={handles.input.id}
          isConnectable={true}
        />
      )}

      {/* Action icons on hover */}
      <div className="node-action-icons">
        <button
          className="node-delete-icon"
          onClick={(e) => {
            e.stopPropagation();
            if (window.confirm('Delete this node?')) {
              nodeData.onDeleteNode?.(id as string);
            }
          }}
          title="Delete node"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button
          className="node-edit-icon"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
            setEditedLabel(nodeData.label || template.metadata.label);
          }}
          title="Edit label"
        >
          <FontAwesomeIcon icon={faPen} />
        </button>
      </div>

      {/* Node content: Icon and label */}
      <div className="node-content-section">
        <span className="node-icon ni">{getIconFromClassName(template.metadata.icon)}</span>
        {isEditing ? (
          <input
            className="node-title-input"
            type="text"
            value={editedLabel}
            onChange={(e) => setEditedLabel(e.target.value)}
            onBlur={() => {
              if (editedLabel.trim() && editedLabel !== nodeData.label) {
                nodeData.onUpdateLabel?.(id as string, editedLabel.trim());
              }
              setIsEditing(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (editedLabel.trim() && editedLabel !== nodeData.label) {
                  nodeData.onUpdateLabel?.(id as string, editedLabel.trim());
                }
                setIsEditing(false);
              } else if (e.key === 'Escape') {
                setEditedLabel(nodeData.label || template.metadata.label);
                setIsEditing(false);
              }
            }}
            autoFocus
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className="node-title">
            {nodeData.label || template.metadata.label}
          </span>
        )}
      </div>

      {/* Output handles (always render all handles including error, but hide/disable when not enabled) */}
      {outputHandles.map((outputHandle: any) => {
        const isEnabled = outputHandle.isError ? outputHandle.isEnabled : true;
        const isConnected = nodeData.connectedHandles?.has(outputHandle.id);
        const positionStr = outputHandle.position || 'right';
        const handlePosition = Position[positionStr.charAt(0).toUpperCase() + positionStr.slice(1) as 'Left' | 'Right' | 'Top' | 'Bottom'];
        
        // Calculate top position - when error is disabled, calculate as if there's only 1 handle
        const visibleHandles = outputHandles.filter((h: any) => !h.isError || h.isEnabled);
        const visibleIndex = visibleHandles.findIndex((h: any) => h.id === outputHandle.id);
        const totalVisibleHandles = visibleHandles.length;
        const topPercent = totalVisibleHandles === 1 
        ? '50%' 
        : `${20 + (visibleIndex * (60 / (totalVisibleHandles - 1)))}%`;
        
        return (
          <React.Fragment key={outputHandle.id}>
            <Handle
              type="source"
              position={handlePosition}
              id={outputHandle.id}
              isConnectable={isEnabled}
              className={outputHandle.isError && isEnabled ? 'error-handle' : undefined}
              style={{ 
                top: topPercent,
                ...(outputHandle.isError && isEnabled ? {
                  background: '#fff',
                  border: '2px solid #ff5252',
                } : {}),
                ...(!isEnabled ? {
                  opacity: 0,
                  pointerEvents: 'none',
                  display: 'none'
                } : {})
              }}
            >
              {outputHandle.label && isEnabled && (
                <span className="handle-label">{String(outputHandle.label)}</span>
              )}
            </Handle>
            {nodeData.onAddNode && !isConnected && isEnabled && (
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

