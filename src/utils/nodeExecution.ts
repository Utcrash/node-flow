import type { Node } from '@xyflow/react';
import { getNodeParameterValues, prepareExecutionPayload } from './templateLoader';

/**
 * Get all parameter values from a node for API calls
 * This extracts all user-defined parameter values from a node
 */
export function getAllNodeParameterValues(node: Node): Record<string, any> {
  return getNodeParameterValues(node);
}

/**
 * Prepare execution payload for backend API
 * This formats all node data including parameters and execution code
 */
export function prepareNodeExecutionPayload(
  node: Node,
  context?: Record<string, any>
) {
  return prepareExecutionPayload(node, context);
}

/**
 * Execute a node (for testing purposes)
 * In production, this would call the backend API
 */
export async function executeNode(
  node: Node,
  context?: Record<string, any>
): Promise<any> {
  const payload = prepareNodeExecutionPayload(node, context);
  
  // In production, this would be an API call:
  // return fetch('/api/execute-node', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(payload),
  // }).then(res => res.json());
  
  // For now, return the payload structure
  return payload;
}

