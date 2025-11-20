export const node = [
    {
      name: 'http-request',
      label: 'HTTP Request',
      description: 'Make HTTP requests to external APIs',
      template: {
        version: '1.0.0',
        metadata: {
          name: 'http-request',
          label: 'HTTP Request',
          icon: '🌐',
          category: 'API',
          description: 'Make HTTP requests to external APIs with configurable method, URL, headers, and body',
          author: 'User',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        visualization: {
          borderColor: '#2196F3',
          headerBackground: '#E3F2FD',
          handles: {
            input: {
              position: 'left',
              id: 'input',
            },
            output: [
              {
                position: 'right',
                id: 'output',
                label: 'Success',
              },
              {
                position: 'right',
                id: 'error',
                label: 'Error',
              },
            ],
          },
        },
        parameters: [
          {
            id: 'url',
            name: 'url',
            label: 'URL',
            type: 'string',
            inputType: 'text',
            required: true,
            defaultValue: '',
            description: 'The URL to make the request to',
          },
          {
            id: 'method',
            name: 'method',
            label: 'HTTP Method',
            type: 'string',
            inputType: 'select',
            required: true,
            defaultValue: 'GET',
            description: 'The HTTP method to use',
            options: [
              { label: 'GET', value: 'GET' },
              { label: 'POST', value: 'POST' },
              { label: 'PUT', value: 'PUT' },
              { label: 'PATCH', value: 'PATCH' },
              { label: 'DELETE', value: 'DELETE' },
            ],
          },
          {
            id: 'headers',
            name: 'headers',
            label: 'Headers',
            type: 'object',
            inputType: 'textarea',
            required: false,
            defaultValue: '{}',
            description: 'Request headers as JSON object',
          },
          {
            id: 'body',
            name: 'body',
            label: 'Request Body',
            type: 'string',
            inputType: 'textarea',
            required: false,
            defaultValue: '',
            description: 'Request body (for POST, PUT, PATCH)',
          },
        ],
        executionCode: `async function executeNode(inputParams, context) {
    // inputParams contains all parameter values keyed by parameter name
    // Access parameters using: inputParams.parameterName
    // Example: const url = inputParams.url;
    //          const method = inputParams.method || 'GET';
    
    // For this HTTP Request node, extract the parameters:
    const url = inputParams.url;
    const method = inputParams.method || 'GET';
    const headers = inputParams.headers || {};
    const body = inputParams.body;
    
    try {
      // Validate URL
      if (!url || typeof url !== 'string' || url.trim() === '') {
        return {
          success: false,
          output: {
            error: 'URL is required and must be a valid string',
          },
          error: 'URL is required and must be a valid string',
        };
      }
      
      // Validate and normalize method
      let httpMethod = 'GET';
      if (method && typeof method === 'string' && method.trim() !== '') {
        httpMethod = method.toUpperCase().trim();
      }
      
      // Validate method is one of the allowed HTTP methods
      const allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];
      if (!allowedMethods.includes(httpMethod)) {
        return {
          success: false,
          output: {
            error: 'Invalid HTTP method: ' + method + '. Must be one of: ' + allowedMethods.join(', '),
          },
          error: 'Invalid HTTP method: ' + method,
        };
      }
      
      // Parse headers if it's a string
      let parsedHeaders = headers;
      if (typeof headers === 'string') {
        try {
          parsedHeaders = JSON.parse(headers);
        } catch (e) {
          parsedHeaders = {};
        }
      }
      
      // Prepare fetch options
      const fetchOptions = {
        method: httpMethod,
        headers: {
          'Content-Type': 'application/json',
          ...parsedHeaders,
        },
      };
      
      // Add body for methods that support it
      if (['POST', 'PUT', 'PATCH'].includes(httpMethod) && body) {
        fetchOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
      }
      
      // Make the HTTP request
      // Note: CORS restrictions may apply when testing from browser
      const response = await fetch(url, fetchOptions);
      const responseData = await response.json().catch(() => response.text());
      
      if (!response.ok) {
        return {
          success: false,
          output: {
            status: response.status,
            statusText: response.statusText,
            error: responseData,
          },
          error: 'HTTP ' + response.status + ': ' + response.statusText,
        };
      }
      
      return {
        success: true,
        output: {
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          data: responseData,
        },
      };
    } catch (error) {
      // Provide more detailed error messages
      let errorMessage = error.message || 'Unknown error';
      
      if (error.message && error.message.includes('Failed to fetch')) {
        errorMessage = 'Failed to fetch: ' + url + '. This could be due to CORS restrictions, invalid URL, or the server not responding. Try using a CORS proxy or test with a server that allows CORS.';
      } else if (error.message && error.message.includes('NetworkError')) {
        errorMessage = 'Network error: Unable to connect to ' + url + '. Check your internet connection and verify the URL is correct.';
      }
      
      return {
        success: false,
        output: {
          error: errorMessage,
          url: url,
        },
        error: errorMessage,
      };
    }
  }`,
  propertiesComponentCode: `import React, { useState, useEffect } from 'react';
  
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
                handleUpdate(param.name, e.target.value);
              }}
              placeholder={param.description || ''}
              rows={param.type === 'object' ? 4 : 6}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontFamily: param.type === 'object' ? 'monospace' : 'inherit',
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
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            >
              {param.options && param.options.length > 0 ? (
                param.options.map((option, idx) => (
                  <option key={idx} value={option.value}>
                    {option.label}
                  </option>
                ))
              ) : (
                <option value="">No options available</option>
              )}
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
                border: '1px solid #ccc',
                borderRadius: '4px',
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
                border: '1px solid #ccc',
                borderRadius: '4px',
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
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
          );
      }
    };
  
    return (
      <div style={{ padding: '16px' }}>
        <h3 style={{ marginTop: 0 }}>{node.metadata.label}</h3>
        
        {node.parameters && node.parameters.length > 0 ? (
          node.parameters.map((param) => (
            <div key={param.id} style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 500 }}>
                {param.label} {param.required && '*'}
              </label>
              {renderParameterInput(param)}
              {param.description && (
                <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>
                  {param.description}
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={{ color: '#666' }}>No parameters defined for this node.</p>
        )}
      </div>
    );
  }
  
  NodePropertiesPanel;`,
      },
    },
  ]