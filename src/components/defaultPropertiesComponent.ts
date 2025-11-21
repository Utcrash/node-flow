// Default properties component code for dynamic nodes
// This is used when propertiesComponentCode is set to 'default' in the template

export const defaultPropertiesComponentCode = `
import React, { useState, useEffect } from 'react';

function NodePropertiesPanel({ node, properties, onUpdateProperties }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOverField, setDragOverField] = useState(null);

  // Listen for drag events on window to know when dragging starts/ends
  useEffect(() => {
    const handleDragStart = () => setIsDragging(true);
    const handleDragEnd = () => {
      setIsDragging(false);
      setDragOverField(null);
    };
    
    window.addEventListener('dragstart', handleDragStart);
    window.addEventListener('dragend', handleDragEnd);
    window.addEventListener('drop', handleDragEnd);
    
    return () => {
      window.removeEventListener('dragstart', handleDragStart);
      window.removeEventListener('dragend', handleDragEnd);
      window.removeEventListener('drop', handleDragEnd);
    };
  }, []);

  // Initialize state from properties for all parameters
  const [paramValues, setParamValues] = useState(() => {
    const initial = {};
    node.parameters?.forEach((param) => {
      const propValue = properties[param.name];
      
      // Check if value is an expression object
      if (propValue && typeof propValue === 'object' && propValue.expression) {
        initial[param.name] = propValue.expression;
      } else if (param.inputType === 'textarea' && param.type === 'object') {
        initial[param.name] = typeof propValue === 'string' 
          ? propValue 
          : JSON.stringify(propValue || {}, null, 2);
      } else if (param.inputType === 'select' && param.multiSelect) {
        // For multiselect, ensure we have an array
        initial[param.name] = Array.isArray(propValue) 
          ? propValue 
          : (propValue ? [propValue] : []);
      } else {
        initial[param.name] = propValue ?? param.defaultValue ?? '';
      }
    });
    return initial;
  });

  // Update paramValues when properties change externally
  useEffect(() => {
    const updated = {};
    node.parameters?.forEach((param) => {
      const propValue = properties[param.name];
      
      // Check if value is an expression object
      if (propValue && typeof propValue === 'object' && propValue.expression) {
        updated[param.name] = propValue.expression;
      } else if (param.inputType === 'textarea' && param.type === 'object') {
        updated[param.name] = typeof propValue === 'string' 
          ? propValue 
          : JSON.stringify(propValue || {}, null, 2);
      } else if (param.inputType === 'select' && param.multiSelect) {
        // For multiselect, ensure we have an array
        updated[param.name] = Array.isArray(propValue) 
          ? propValue 
          : (propValue ? [propValue] : []);
      } else {
        updated[param.name] = propValue ?? param.defaultValue ?? '';
      }
    });
    setParamValues(updated);
  }, [properties, node.parameters]);

  const handleUpdate = (paramName, value) => {
    const param = node.parameters?.find((p) => p.name === paramName);
    let processedValue = value;
    
    // Check if value is an expression
    if (isExpression(value)) {
      // Save as expression object
      processedValue = { expression: value };
    } else if (param?.inputType === 'textarea' && param.type === 'object') {
      // For object type textareas, try to parse JSON
      try {
        processedValue = JSON.parse(value);
      } catch (e) {
        // Keep as string if invalid JSON
        processedValue = value;
      }
    } else if (param?.type === 'number' && value !== '' && !isNaN(Number(value))) {
      // Convert to number if it's a number type and valid
      processedValue = Number(value);
    } else if (param?.type === 'boolean' || param?.inputType === 'checkbox') {
      // Convert to boolean for checkbox/boolean types
      processedValue = value === true || value === 'true';
    }
    // Otherwise keep as string
    
    const newProperties = { ...properties, [paramName]: processedValue };
    onUpdateProperties(newProperties);
  };

  // Helper to check if a value is an expression
  const isExpression = (value) => {
    if (typeof value !== 'string') return false;
    // Check if it contains expression functions or references node IDs
    return value.includes('$json(') || 
           value.includes('$jsonata(') || 
           /\w+_\d+\.\w+/.test(value); // Matches pattern like: http_server_1.response
  };

  // Handle drop event
  const handleDrop = (e, paramName) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverField(null);
    
    const droppedText = e.dataTransfer.getData('text/plain');
    if (droppedText) {
      const currentValue = paramValues[paramName] || '';
      let newValue = droppedText;
      
      if (currentValue) {
        // If both current and dropped are expressions, merge them with space
        if (isExpression(currentValue) && isExpression(droppedText)) {
          newValue = currentValue + ' ' + droppedText;
        } else {
          // Mixed content - append with space
          newValue = currentValue + ' ' + droppedText;
        }
      }
      
      setParamValues({ ...paramValues, [paramName]: newValue });
      handleUpdate(paramName, newValue);
    }
  };

  // Handle drag over
  const handleDragOver = (e, paramName) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverField(paramName);
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setDragOverField(null);
  };

  const renderParameterInput = (param) => {
    const value = paramValues[param.name] ?? '';

    switch (param.inputType) {
      case 'textarea':
        return (
          <div style={{ position: 'relative' }}>
            <textarea
              value={value}
              onChange={(e) => {
                setParamValues({ ...paramValues, [param.name]: e.target.value });
              }}
              onBlur={(e) => handleUpdate(param.name, e.target.value)}
              onDrop={(e) => handleDrop(e, param.name)}
              onDragOver={(e) => handleDragOver(e, param.name)}
              onDragLeave={handleDragLeave}
              rows={param.type === 'object' ? 8 : 4}
              placeholder={param.description || ''}
              className={\`droppable-field \${dragOverField === param.name ? 'drag-over' : ''}\`}
              style={{
                width: '100%',
                padding: '8px',
                border: dragOverField === param.name ? '2px solid #4a9eff' : '1px solid #444',
                borderRadius: '4px',
                fontFamily: param.type === 'object' ? 'monospace' : 'inherit',
                fontSize: param.type === 'object' ? '12px' : '14px',
                background: dragOverField === param.name ? 'rgba(74, 158, 255, 0.1)' : '#2a2a2a',
                color: '#e0e0e0',
                resize: 'vertical',
                outline: 'none',
              }}
            />
            {isExpression(value) && (
              <span className="expression-indicator">Expression</span>
            )}
          </div>
        );
      
      case 'select':
        if (param.multiSelect) {
          // Multi-select: render as a list of checkboxes
          const selectedValues = Array.isArray(value) ? value : [];
          return (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '8px',
              border: '1px solid #444',
              borderRadius: '4px',
              background: '#2a2a2a',
              maxHeight: '200px',
              overflowY: 'auto',
            }}>
              {param.options?.map((option) => (
                <label
                  key={option.value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: '#e0e0e0',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'background 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={selectedValues.includes(option.value)}
                    onChange={(e) => {
                      const newValues = e.target.checked
                        ? [...selectedValues, option.value]
                        : selectedValues.filter(v => v !== option.value);
                      setParamValues({ ...paramValues, [param.name]: newValues });
                      handleUpdate(param.name, newValues);
                    }}
                    style={{
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      accentColor: '#4a9eff',
                    }}
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          );
        } else {
          // Single select: render as dropdown
          return (
            <select
              value={value}
              onChange={(e) => {
                setParamValues({ ...paramValues, [param.name]: e.target.value });
                handleUpdate(param.name, e.target.value);
              }}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #444',
                borderRadius: '4px',
                background: '#2a2a2a',
                color: '#e0e0e0',
              }}
            >
              <option value="">Select...</option>
              {param.options?.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          );
        }
      
      case 'checkbox':
        // If value is an expression, show as text input
        if (isExpression(value)) {
          return (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setParamValues({ ...paramValues, [param.name]: e.target.value });
                  handleUpdate(param.name, e.target.value);
                }}
                onDrop={(e) => handleDrop(e, param.name)}
                onDragOver={(e) => handleDragOver(e, param.name)}
                onDragLeave={handleDragLeave}
                placeholder="Expression for boolean value"
              className={\`droppable-field \${dragOverField === param.name ? 'drag-over' : ''}\`}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: dragOverField === param.name ? '2px solid #4a9eff' : '1px solid #444',
                  borderRadius: '4px',
                  background: dragOverField === param.name ? 'rgba(74, 158, 255, 0.1)' : '#2a2a2a',
                  color: '#e0e0e0',
                  outline: 'none',
                }}
              />
              <span className="expression-indicator">Expression</span>
            </div>
          );
        }
        
        // Regular checkbox with drop zone wrapper
        return (
          <div 
            style={{ 
              position: 'relative',
              display: 'inline-block',
              padding: '8px',
              border: dragOverField === param.name ? '2px solid #4a9eff' : '2px solid transparent',
              borderRadius: '4px',
              background: dragOverField === param.name ? 'rgba(74, 158, 255, 0.1)' : 'transparent',
            }}
            onDrop={(e) => handleDrop(e, param.name)}
            onDragOver={(e) => handleDragOver(e, param.name)}
            onDragLeave={handleDragLeave}
              className={\`droppable-field \${dragOverField === param.name ? 'drag-over' : ''}\`}
          >
            <input
              type="checkbox"
              checked={value === true || value === 'true'}
              onChange={(e) => {
                const newValue = e.target.checked;
                setParamValues({ ...paramValues, [param.name]: newValue });
                handleUpdate(param.name, newValue);
              }}
              style={{
                width: '18px',
                height: '18px',
                cursor: 'pointer',
                accentColor: '#4a9eff',
              }}
            />
          </div>
        );
      
      case 'number':
        // If value is an expression, show as text input
        if (isExpression(value)) {
          return (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setParamValues({ ...paramValues, [param.name]: e.target.value });
                  handleUpdate(param.name, e.target.value);
                }}
                onDrop={(e) => handleDrop(e, param.name)}
                onDragOver={(e) => handleDragOver(e, param.name)}
                onDragLeave={handleDragLeave}
                placeholder="Expression for number value"
              className={\`droppable-field \${dragOverField === param.name ? 'drag-over' : ''}\`}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: dragOverField === param.name ? '2px solid #4a9eff' : '1px solid #444',
                  borderRadius: '4px',
                  background: dragOverField === param.name ? 'rgba(74, 158, 255, 0.1)' : '#2a2a2a',
                  color: '#e0e0e0',
                  outline: 'none',
                }}
              />
              <span className="expression-indicator">Expression</span>
            </div>
          );
        }
        
        // Regular number input with drop support
        return (
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={value}
              onChange={(e) => {
                const numValue = param.type === 'number' ? Number(e.target.value) : e.target.value;
                setParamValues({ ...paramValues, [param.name]: numValue });
                handleUpdate(param.name, numValue);
              }}
              onDrop={(e) => handleDrop(e, param.name)}
              onDragOver={(e) => handleDragOver(e, param.name)}
              onDragLeave={handleDragLeave}
              placeholder={param.description || ''}
              className={\`droppable-field \${dragOverField === param.name ? 'drag-over' : ''}\`}
              style={{
                width: '100%',
                padding: '8px',
                border: dragOverField === param.name ? '2px solid #4a9eff' : '1px solid #444',
                borderRadius: '4px',
                background: dragOverField === param.name ? 'rgba(74, 158, 255, 0.1)' : '#2a2a2a',
                color: '#e0e0e0',
                outline: 'none',
              }}
            />
            {isExpression(value) && (
              <span className="expression-indicator">Expression</span>
            )}
          </div>
        );
      
      case 'date':
        // If value is an expression, show as text input
        if (isExpression(value)) {
          return (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                value={value}
                onChange={(e) => {
                  setParamValues({ ...paramValues, [param.name]: e.target.value });
                  handleUpdate(param.name, e.target.value);
                }}
                onDrop={(e) => handleDrop(e, param.name)}
                onDragOver={(e) => handleDragOver(e, param.name)}
                onDragLeave={handleDragLeave}
                placeholder="Expression for date value"
              className={\`droppable-field \${dragOverField === param.name ? 'drag-over' : ''}\`}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: dragOverField === param.name ? '2px solid #4a9eff' : '1px solid #444',
                  borderRadius: '4px',
                  background: dragOverField === param.name ? 'rgba(74, 158, 255, 0.1)' : '#2a2a2a',
                  color: '#e0e0e0',
                  outline: 'none',
                }}
              />
              <span className="expression-indicator">Expression</span>
            </div>
          );
        }
        
        // Regular date input with drop support
        return (
          <div style={{ position: 'relative' }}>
            <input
              type="date"
              value={value}
              onChange={(e) => {
                setParamValues({ ...paramValues, [param.name]: e.target.value });
                handleUpdate(param.name, e.target.value);
              }}
              onDrop={(e) => handleDrop(e, param.name)}
              onDragOver={(e) => handleDragOver(e, param.name)}
              onDragLeave={handleDragLeave}
              className={\`droppable-field \${dragOverField === param.name ? 'drag-over' : ''}\`}
              style={{
                width: '100%',
                padding: '8px',
                border: dragOverField === param.name ? '2px solid #4a9eff' : '1px solid #444',
                borderRadius: '4px',
                background: dragOverField === param.name ? 'rgba(74, 158, 255, 0.1)' : '#2a2a2a',
                color: '#e0e0e0',
                outline: 'none',
              }}
            />
            {isExpression(value) && (
              <span className="expression-indicator">Expression</span>
            )}
          </div>
        );
      
      default: // text
        return (
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={value}
              onChange={(e) => {
                setParamValues({ ...paramValues, [param.name]: e.target.value });
                handleUpdate(param.name, e.target.value);
              }}
              onDrop={(e) => handleDrop(e, param.name)}
              onDragOver={(e) => handleDragOver(e, param.name)}
              onDragLeave={handleDragLeave}
              placeholder={param.description || ''}
              className={\`droppable-field \${dragOverField === param.name ? 'drag-over' : ''}\`}
              style={{
                width: '100%',
                padding: '8px',
                border: dragOverField === param.name ? '2px solid #4a9eff' : '1px solid #444',
                borderRadius: '4px',
                background: dragOverField === param.name ? 'rgba(74, 158, 255, 0.1)' : '#2a2a2a',
                color: '#e0e0e0',
                outline: 'none',
              }}
            />
            {isExpression(value) && (
              <span className="expression-indicator">Expression</span>
            )}
          </div>
        );
    }
  };

  return (
    <div style={{ padding: '16px' }}>      
      {node.parameters && node.parameters.length > 0 ? (
        node.parameters.map((param) => (
          <div key={param.id} style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500, color: '#b0b0b0' }}>
              {param.label} {param.required && '*'}
            </label>
            {renderParameterInput(param)}
            {param.description && (
              <div style={{ fontSize: '0.875rem', color: '#888', marginTop: '4px' }}>
                {param.description}
              </div>
            )}
          </div>
        ))
      ) : (
        <p style={{ color: '#888' }}>No parameters defined for this node.</p>
      )}
    </div>
  );
}
`;

