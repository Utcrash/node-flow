// Template loader utility
export interface NodeTemplate {
  version: string;
  metadata: {
    name: string;
    label: string;
    icon: string;
    category: string;
    description: string;
    author: string;
    createdAt: string;
    updatedAt: string;
  };
  visualization: {
    borderColor: string;
    headerBackground: string;
    handles: {
      input?: {
        position: 'left' | 'right' | 'top' | 'bottom';
        id: string;
      };
      output: Array<{
        position: 'left' | 'right' | 'top' | 'bottom';
        id: string;
        label?: string;
      }>;
    };
  };
  parameters: Array<{
    id: string;
    name: string;
    label: string;
    type: string;
    inputType: string;
    required: boolean;
    defaultValue: any;
    description?: string;
    options?: Array<{ label: string; value: string }>;
    validation?: any;
  }>;
  executionCode: string;
  propertiesComponentCode: string;
}

// Load templates from template.js and nodeList.json
export async function loadTemplates(): Promise<Record<string, NodeTemplate>> {
  const templates: Record<string, NodeTemplate> = {};
  
  try {
    // Load from template.js
    // @ts-ignore - template.js is a dynamic module
    const templateModule = await import('../../template.js') as any;
    
    if (templateModule.node && Array.isArray(templateModule.node)) {
      templateModule.node.forEach((item: any) => {
        if (item.template) {
          templates[item.template.metadata.name] = item.template;
        }
      });
    }
  } catch (error) {
    console.error('Error loading templates from template.js:', error);
  }
  
  try {
    // Load from nodeList.json
    const response = await fetch('/nodeList.json');
    const nodeList = await response.json();
    
    if (Array.isArray(nodeList)) {
      nodeList.forEach((item: any) => {
        if (item.template) {
          templates[item.template.metadata.name] = item.template;
        }
      });
    }
  } catch (error) {
    console.error('Error loading templates from nodeList.json:', error);
  }
  
  return templates;
}

// Get all parameter values from a node for API calls
export function getNodeParameterValues(node: any): Record<string, any> {
  const values: Record<string, any> = {};
  
  if (node.data?.template?.parameters) {
    node.data.template.parameters.forEach((param: any) => {
      const paramValue = node.data?.properties?.[param.name];
      values[param.name] = paramValue !== undefined ? paramValue : param.defaultValue;
    });
  }
  
  return values;
}

// Prepare execution payload for backend API
export function prepareExecutionPayload(
  node: any,
  context?: Record<string, any>
): {
  nodeId: string;
  nodeType: string;
  templateName: string;
  inputParams: Record<string, any>;
  executionCode: string;
  context?: Record<string, any>;
} {
  const inputParams = getNodeParameterValues(node);
  const template = node.data?.template;
  
  return {
    nodeId: node.id,
    nodeType: node.type || 'custom',
    templateName: template?.metadata?.name || '',
    inputParams,
    executionCode: template?.executionCode || '',
    context: context || {},
  };
}

