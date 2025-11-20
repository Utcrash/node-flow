// Default properties component code for dynamic nodes
// This is used when propertiesComponentCode is set to 'default' in the template

export const defaultPropertiesComponentCode = `
import React, { useState, useEffect } from 'react';

function NodePropertiesPanel({ node, properties, onUpdateProperties }) {
  // Initialize state from properties for all parameters
  const [paramValues, setParamValues] = useState(() => {
    const initial = {};
    node.parameters?.forEach((param) => {
      if (param.inputType === 'textarea' && param.type === 'object') {
        initial[param.name] = typeof properties[param.name] === 'string' 
          ? properties[param.name] 
          : JSON.stringify(properties[param.name] || {}, null, 2);
      } else {
        initial[param.name] = properties[param.name] ?? param.defaultValue ?? '';
      }
    });
    return initial;
  });

  // Update paramValues when properties change externally
  useEffect(() => {
    const updated = {};
    node.parameters?.forEach((param) => {
      if (param.inputType === 'textarea' && param.type === 'object') {
        updated[param.name] = typeof properties[param.name] === 'string' 
          ? properties[param.name] 
          : JSON.stringify(properties[param.name] || {}, null, 2);
      } else {
        updated[param.name] = properties[param.name] ?? param.defaultValue ?? '';
      }
    });
    setParamValues(updated);
  }, [properties, node.parameters]);

  const handleUpdate = (paramName, value) => {
    const param = node.parameters?.find((p) => p.name === paramName);
    let processedValue = value;
    
    // For object type textareas, try to parse JSON
    if (param?.inputType === 'textarea' && param.type === 'object') {
      try {
        processedValue = JSON.parse(value);
      } catch (e) {
        // Keep as string if invalid JSON
        processedValue = value;
      }
    }
    
    const newProperties = { ...properties, [paramName]: processedValue };
    onUpdateProperties(newProperties);
  };

  const renderParameterInput = (param) => {
    const value = paramValues[param.name] ?? '';

    switch (param.inputType) {
      case 'textarea':
        return (
          <textarea
            value={value}
            onChange={(e) => {
              setParamValues({ ...paramValues, [param.name]: e.target.value });
            }}
            onBlur={(e) => handleUpdate(param.name, e.target.value)}
            rows={param.type === 'object' ? 8 : 4}
            placeholder={param.description || ''}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #444',
              borderRadius: '4px',
              fontFamily: param.type === 'object' ? 'monospace' : 'inherit',
              fontSize: param.type === 'object' ? '12px' : '14px',
              background: '#2a2a2a',
              color: '#e0e0e0',
              resize: 'vertical',
            }}
          />
        );
      
      case 'select':
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
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={value === true || value === 'true'}
            onChange={(e) => {
              const newValue = e.target.checked;
              setParamValues({ ...paramValues, [param.name]: newValue });
              handleUpdate(param.name, newValue);
            }}
          />
        );
      
      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => {
              const numValue = param.type === 'number' ? Number(e.target.value) : e.target.value;
              setParamValues({ ...paramValues, [param.name]: numValue });
              handleUpdate(param.name, numValue);
            }}
            placeholder={param.description || ''}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #444',
              borderRadius: '4px',
              background: '#2a2a2a',
              color: '#e0e0e0',
            }}
          />
        );
      
      case 'date':
        return (
          <input
            type="date"
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
          />
        );
      
      default: // text
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => {
              setParamValues({ ...paramValues, [param.name]: e.target.value });
              handleUpdate(param.name, e.target.value);
            }}
            placeholder={param.description || ''}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #444',
              borderRadius: '4px',
              background: '#2a2a2a',
              color: '#e0e0e0',
            }}
          />
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

