import React, { useEffect, useState } from 'react';
import type { Node } from '@xyflow/react';
// @ts-ignore - @babel/standalone doesn't have types
import { transform } from '@babel/standalone';
import { defaultPropertiesComponentCode } from './defaultPropertiesComponent';
import './NodePropertiesPanel.css';

interface DynamicPropertiesPanelProps {
  node: Node | null;
  onUpdateProperties: (nodeId: string, properties: Record<string, any>) => void;
}

// Component cache to avoid re-creating components
const componentCache = new Map<string, React.ComponentType<any>>();

const createComponentFromCode = (code: string, componentName: string) => {
    try {
      // Use default template if code is 'default'
      const actualCode = code.trim() === 'default' ? defaultPropertiesComponentCode : code;
      
      // Check cache first to avoid recreating component on each render
      if (componentCache.has(actualCode)) {
        return componentCache.get(actualCode)!;
      }

      // Transform the code using Babel
      let cleanedCode = actualCode.replace(/import\s+.*?from\s+['"]react['"]\s*;?/g, '');

      const transformed = transform(cleanedCode, {
        presets: ['react'],
        filename: `${componentName}.jsx`
      }).code;
      
      // Create the module context
      const functionBody = `
      ${transformed}
      return NodePropertiesPanel;
    `;
    
    const factory = new Function('React', 'useState', 'useEffect', functionBody);
    const Component = factory(React, React.useState, React.useEffect);
    
    if (typeof Component !== 'function') {
      throw new Error('Failed to extract NodePropertiesPanel component');
    }
    
    // Cache the component to prevent recreation
    componentCache.set(actualCode, Component);
    
    return Component;
    
  } catch (error) {
    console.error('Error creating component from code:', error);
    return null;
  }
};


function DynamicPropertiesPanel({
  node,
  onUpdateProperties,
}: DynamicPropertiesPanelProps) {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!node) {
      setComponent(null);
      setError(null);
      return;
    }

    const template = (node.data as any)?.template;
    if (!template || !template.propertiesComponentCode) {
      setComponent(null);
      setError('No template or component code found for this node');
      return;
    }

    try {
      const createdComponent = createComponentFromCode(
        template.propertiesComponentCode,
        'NodePropertiesPanel'
      );
      
      if (createdComponent) {
        setComponent(() => createdComponent);
        setError(null);
      } else {
        setError('Failed to create component from code');
      }
    } catch (err: any) {
      console.error('Error loading dynamic component:', err);
      setError(err.message || 'Failed to load component');
    }
  }, [node?.id, (node?.data as any)?.template?.propertiesComponentCode]);

  if (!node) {
    return (
      <div style={{ padding: '20px' }}>
        <p className="no-selection">Select a node to edit its properties</p>
      </div>
    );
  }

  const template = (node.data as any)?.template;
  const properties = node.data?.properties || {};

  // If it's a dynamic node with template, render the dynamic component
  if (template && template.propertiesComponentCode) {
    if (error) {
      return (
        <div style={{ padding: '20px' }}>
          <p style={{ color: '#ff6b6b' }}>Error loading properties panel: {error}</p>
          <p style={{ fontSize: '0.875rem', color: '#888', marginTop: '8px' }}>
            Node: {template.metadata?.label || node.type}
          </p>
        </div>
      );
    }

    if (Component) {
      return (
        <Component
          node={{
            ...node,
            parameters: template.parameters,
            metadata: template.metadata,
          }}
          properties={properties}
          onUpdateProperties={(updatedProperties: Record<string, any>) => {
            onUpdateProperties(node.id, updatedProperties);
          }}
        />
      );
    }
  }

  // Fallback for nodes without dynamic components
  return (
    <div style={{ padding: '20px' }}>
      <p style={{ color: '#888' }}>No properties panel available for this node type</p>
    </div>
  );
}

export default DynamicPropertiesPanel;

