import { useState, useEffect } from 'react';
import type { Node } from '@xyflow/react';
import './NodePropertiesPanel.css';

interface NodePropertiesPanelProps {
  node: Node | null;
  onUpdateProperties: (nodeId: string, properties: Record<string, any>) => void;
}

function NodePropertiesPanel({
  node,
  onUpdateProperties,
}: NodePropertiesPanelProps) {
  const [properties, setProperties] = useState<Record<string, any>>({});

  useEffect(() => {
    if (node) {
      setProperties(node.data.properties || {});
    }
  }, [node]);

  if (!node) {
    return (
      <div style={{ padding: '20px' }}>
        <p className="no-selection">Select a node to edit its properties</p>
      </div>
    );
  }

  const handlePropertyChange = (key: string, value: any) => {
    const updatedProperties = { ...properties, [key]: value };
    setProperties(updatedProperties);
    onUpdateProperties(node.id, updatedProperties);
  };

  const renderPropertyInputs = () => {
    switch (node.type) {
      case 'trigger':
        return (
          <>
            <div className="property-group">
              <label>Trigger Type</label>
              <select
                value={properties.triggerType || 'manual'}
                onChange={(e) =>
                  handlePropertyChange('triggerType', e.target.value)
                }
              >
                <option value="manual">Manual</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>
            {properties.triggerType === 'scheduled' && (
              <div className="property-group">
                <label>Schedule (Cron)</label>
                <input
                  type="text"
                  value={properties.schedule || ''}
                  onChange={(e) =>
                    handlePropertyChange('schedule', e.target.value)
                  }
                  placeholder="0 0 * * *"
                />
              </div>
            )}
          </>
        );

      case 'filter':
        return (
          <>
            <div className="property-group">
              <label>Condition</label>
              <input
                type="text"
                value={properties.condition || ''}
                onChange={(e) =>
                  handlePropertyChange('condition', e.target.value)
                }
                placeholder="e.g., value > 10"
              />
            </div>
            <div className="property-group">
              <label>Operator</label>
              <select
                value={properties.operator || 'equals'}
                onChange={(e) =>
                  handlePropertyChange('operator', e.target.value)
                }
              >
                <option value="equals">Equals</option>
                <option value="notEquals">Not Equals</option>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
                <option value="contains">Contains</option>
              </select>
            </div>
          </>
        );

      case 'branch':
        return (
          <div className="property-group">
            <label>Number of Branches</label>
            <input
              type="number"
              min="2"
              max="10"
              value={properties.branches || 2}
              onChange={(e) =>
                handlePropertyChange('branches', parseInt(e.target.value))
              }
            />
          </div>
        );

      case 'loop':
        return (
          <>
            <div className="property-group">
              <label>Loop Type</label>
              <select
                value={properties.loopType || 'forEach'}
                onChange={(e) =>
                  handlePropertyChange('loopType', e.target.value)
                }
              >
                <option value="forEach">For Each</option>
                <option value="for">For</option>
                <option value="while">While</option>
              </select>
            </div>
            <div className="property-group">
              <label>Condition</label>
              <input
                type="text"
                value={properties.condition || ''}
                onChange={(e) =>
                  handlePropertyChange('condition', e.target.value)
                }
                placeholder="e.g., i < items.length"
              />
            </div>
          </>
        );

      case 'if':
        return (
          <div className="property-group">
            <label>Condition</label>
            <input
              type="text"
              value={properties.condition || ''}
              onChange={(e) =>
                handlePropertyChange('condition', e.target.value)
              }
              placeholder="e.g., value > 0"
            />
          </div>
        );

      case 'codeblock':
        return (
          <>
            <div className="property-group">
              <label>Language</label>
              <select
                value={properties.language || 'javascript'}
                onChange={(e) =>
                  handlePropertyChange('language', e.target.value)
                }
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="typescript">TypeScript</option>
              </select>
            </div>
            <div className="property-group">
              <label>Code</label>
              <textarea
                value={properties.code || ''}
                onChange={(e) => handlePropertyChange('code', e.target.value)}
                placeholder="Enter your code here..."
                rows={10}
              />
            </div>
          </>
        );

      case 'httpRequest':
        return (
          <>
            <div className="property-group">
              <label>Method</label>
              <select
                value={properties.method || 'GET'}
                onChange={(e) => handlePropertyChange('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
            <div className="property-group">
              <label>URL</label>
              <input
                type="text"
                value={properties.url || ''}
                onChange={(e) => handlePropertyChange('url', e.target.value)}
                placeholder="https://api.example.com/endpoint"
              />
            </div>
            <div className="property-group">
              <label>Headers (JSON)</label>
              <textarea
                value={properties.headers || '{}'}
                onChange={(e) => handlePropertyChange('headers', e.target.value)}
                placeholder='{"Content-Type": "application/json"}'
                rows={4}
              />
            </div>
            <div className="property-group">
              <label>Body (JSON)</label>
              <textarea
                value={properties.body || ''}
                onChange={(e) => handlePropertyChange('body', e.target.value)}
                placeholder='{"key": "value"}'
                rows={4}
              />
            </div>
          </>
        );

      default:
        return (
          <div className="property-group">
            <p>No specific properties for this node type</p>
          </div>
        );
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div className="property-group">
        <label>Node Label</label>
        <input
          type="text"
          value={(node.data?.label as string) || ''}
          onChange={() => {
            // This would need to be handled differently in a real app
            // For now, we'll just update the properties
          }}
          disabled
        />
      </div>
      {renderPropertyInputs()}
    </div>
  );
}

export default NodePropertiesPanel;

