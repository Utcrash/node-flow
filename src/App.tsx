import { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  useReactFlow,
  useUpdateNodeInternals,
} from '@xyflow/react';
import type { Node, Edge, Connection, NodeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faLayerGroup, faTimes } from '@fortawesome/free-solid-svg-icons';
import CodeblockNode from './components/nodes/CodeblockNode';
import PlaceholderNode from './components/nodes/PlaceholderNode';
import DynamicNode from './components/nodes/DynamicNode';
import NodePropertiesPanel from './components/NodePropertiesPanel';
import DynamicPropertiesPanel from './components/DynamicPropertiesPanel';
import NodePalette from './components/NodePalette';
import { loadTemplates, type NodeTemplate } from './utils/templateLoader';

import './App.css';

// Base node types
const baseNodeTypes: NodeTypes = {
  codeblock: CodeblockNode,
  placeholder: PlaceholderNode,
};

// Calculate center position for initial placeholder node
const getCenterPosition = () => {
  if (typeof window !== 'undefined') {
    return {
      x: (window.innerWidth - 250 - 300) / 2 - 50, // Account for sidebars
      y: window.innerHeight / 2 - 30,
    };
  }
  return { x: 400, y: 300 };
};

const initialNodes: Node[] = [
  {
    id: 'placeholder-0',
    type: 'placeholder',
    position: getCenterPosition(),
    data: {
      label: 'Add Node',
      properties: {},
    },
  },
];
const initialEdges: Edge[] = [];

function FlowContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [pendingNodeConnection, setPendingNodeConnection] = useState<{
    sourceNodeId: string;
    sourceHandle?: string;
  } | null>(null);
  const [highlightPalette, setHighlightPalette] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [paletteFilter, setPaletteFilter] = useState<'all' | 'trigger' | 'process'>('all');
  const [propertiesTab, setPropertiesTab] = useState<'properties' | 'options'>('properties');
  const [templates, setTemplates] = useState<Record<string, NodeTemplate>>({});
  const [nodeTypes, setNodeTypes] = useState<NodeTypes>(baseNodeTypes);
  const { fitView } = useReactFlow();
  const updateNodeInternals = useUpdateNodeInternals();

  const onConnect = useCallback(
    (params: Connection) => {
      // Get source node to determine label
      const sourceNode = nodes.find(n => n.id === params.source);
      if (!sourceNode) {
        setEdges((eds) => addEdge(params, eds));
        return;
      }

      // Get handle label
      let edgeLabel = '';
      const sourceHandle = params.sourceHandle || 'output';
      const sourceNodeTemplate = (sourceNode.data as any)?.template;
      const hasErrorHandle = (sourceNode.data as any)?.options?.errorHandling === 'continue';
      
      // Check if this is the error handle
      if (sourceHandle === 'error') {
        edgeLabel = 'Error';
      } else {
        // Determine if node has multiple outputs
        let hasMultipleOutputs = false;
        if (sourceNode.type === 'if' || sourceNode.type === 'branch' || sourceNode.type === 'loop') {
          hasMultipleOutputs = true;
        } else if (sourceNodeTemplate?.visualization?.handles?.output?.length > 1) {
          hasMultipleOutputs = true;
        } else if (hasErrorHandle) {
          // If error handle is present, there are multiple outputs
          hasMultipleOutputs = true;
        }

        if (hasMultipleOutputs || sourceHandle !== 'output') {
          // Get label from template or use handle name
          if (sourceNodeTemplate?.visualization?.handles?.output) {
            const handleDef = sourceNodeTemplate.visualization.handles.output.find(
              (h: any) => h.id === sourceHandle
            );
            edgeLabel = handleDef?.label || sourceHandle;
          } else {
            // For built-in nodes
            if (sourceNode.type === 'if') {
              edgeLabel = sourceHandle === 'true' ? 'True' : 'False';
            } else if (sourceNode.type === 'loop') {
              edgeLabel = sourceHandle === 'output' ? 'Output' : 'Loop';
            } else {
              edgeLabel = sourceHandle;
            }
          }
        }
      }

      const newEdge = {
        ...params,
        label: edgeLabel,
        labelStyle: { fill: '#888', fontWeight: 500, fontSize: 6 },
        labelBgStyle: { fill: '#1e1e1e', fillOpacity: 0.7 },
        labelBgPadding: [1, 2] as [number, number],
        labelBgBorderRadius: 1,
      };

      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, nodes]
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, _node: Node) => {
    // Node click doesn't open modal anymore - only double click does
  }, []);

  const onNodeDoubleClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setPropertiesTab('properties'); // Reset to properties tab when opening
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Load templates on mount
  useEffect(() => {
    loadTemplates().then((loadedTemplates) => {
      setTemplates(loadedTemplates);
      
      // Register dynamic nodes
      const dynamicNodeTypes: NodeTypes = { ...baseNodeTypes };
      Object.keys(loadedTemplates).forEach((templateName) => {
        dynamicNodeTypes[templateName] = DynamicNode;
      });
      setNodeTypes(dynamicNodeTypes);
    });
  }, []);

  // Add placeholder node back when all nodes are deleted
  useEffect(() => {
    if (nodes.length === 0) {
      const placeholderNode: Node = {
        id: 'placeholder-0',
        type: 'placeholder',
        position: getCenterPosition(),
        data: {
          label: 'Add Node',
          properties: {},
        },
      };
      setNodes([placeholderNode]);
      setSelectedNode(null);
    }
  }, [nodes.length, setNodes]);

  const handleShowPalette = useCallback((filter: 'all' | 'trigger' | 'process' = 'all') => {
    setShowPalette(true);
    setPaletteFilter(filter);
    setHighlightPalette(true);
    // Remove highlight after a short delay
    setTimeout(() => setHighlightPalette(false), 2000);
  }, []);

  const handleAddNodeFromNode = useCallback(
    (sourceNodeId: string, _position: { x: number; y: number }, sourceHandle?: string) => {
      setPendingNodeConnection({
        sourceNodeId,
        sourceHandle,
      });
      handleShowPalette('process'); // Only process nodes from arm
    },
    [handleShowPalette]
  );

  const handleNodeSelectFromPalette = useCallback(
    (nodeType: string, label: string) => {
      // Check if this is a template node
      const template = templates[nodeType];
      
      if (pendingNodeConnection) {
        // Adding node from existing node's plus button
        const sourceNode = nodes.find((n) => n.id === pendingNodeConnection.sourceNodeId);
        if (!sourceNode) {
          setPendingNodeConnection(null);
          return;
        }

        // Determine which source handle to use
        let sourceHandle = pendingNodeConnection.sourceHandle;
        if (!sourceHandle) {
          // Fallback logic for nodes without explicit handle
          if (sourceNode.type === 'if') {
            sourceHandle = 'true';
          } else if (sourceNode.type === 'branch') {
            sourceHandle = 'output-0';
          } else if (sourceNode.type === 'loop') {
            sourceHandle = 'output';
          } else {
            sourceHandle = 'output';
          }
        }

        // Calculate intelligent position based on existing connections
        const horizontalSpacing = 250;
        const verticalSpacing = 150;
        
        // Count how many outputs this node has and get handle order
        const sourceNodeTemplate = (sourceNode.data as any)?.template;
        const hasErrorHandle = (sourceNode.data as any)?.options?.errorHandling === 'continue';
        let outputHandles: string[] = ['output'];
        
        if (sourceNode.type === 'if') {
          outputHandles = ['true', 'false'];
        } else if (sourceNode.type === 'branch') {
          const branchCount = (sourceNode.data as any).properties?.branches || 2;
          outputHandles = Array.from({ length: branchCount }, (_, i) => `output-${i}`);
        } else if (sourceNode.type === 'loop') {
          outputHandles = ['output', 'loop-output'];
        } else if (sourceNodeTemplate?.visualization?.handles?.output) {
          outputHandles = sourceNodeTemplate.visualization.handles.output.map((h: any) => h.id);
        }
        
        // Add error handle if present
        if (hasErrorHandle) {
          outputHandles.push('error');
        }

        const outputCount = outputHandles.length;

        // Count existing nodes connected to this handle
        const existingNodesFromHandle = edges.filter(
          e => e.source === sourceNode.id && e.sourceHandle === sourceHandle
        ).length;

        // Calculate position
        let yPosition = sourceNode.position.y || 0;
        
        if (outputCount > 1) {
          // Branch layout: 
          // 1. Get the index of the current handle
          const handleIndex = outputHandles.indexOf(sourceHandle);
          
          // 2. Calculate base offset to center all branches around source node
          const totalSpread = (outputCount - 1) * verticalSpacing;
          const baseOffset = handleIndex * verticalSpacing - (totalSpread / 2);
          
          // 3. Add additional offset for multiple nodes on same handle
          const additionalOffset = existingNodesFromHandle * (verticalSpacing / 2);
          
          yPosition += baseOffset + additionalOffset;
        }
        // For single output, keep same Y position (straight line)

        const newNode: Node = {
          id: `node-${nodeIdCounter}`,
          type: nodeType,
          position: {
            x: (sourceNode.position.x || 0) + horizontalSpacing,
            y: yPosition,
          },
          data: {
            label: template ? template.metadata.label : label,
            properties: template ? {} : {},
            template: template,
            onAddNode: handleAddNodeFromNode,
          },
        };

        // Add the new node
        setNodes((nds) => [...nds, newNode]);
        
        // Get edge label from handle
        let edgeLabel = '';
        if (sourceHandle === 'error') {
          edgeLabel = 'Error';
        } else if (outputCount > 1 || sourceHandle !== 'output') {
          // Get label from template or use handle name
          if (sourceNodeTemplate?.visualization?.handles?.output) {
            const handleDef = sourceNodeTemplate.visualization.handles.output.find(
              (h: any) => h.id === sourceHandle
            );
            edgeLabel = handleDef?.label || sourceHandle;
          } else {
            // For built-in nodes
            if (sourceNode.type === 'if') {
              edgeLabel = sourceHandle === 'true' ? 'True' : 'False';
            } else if (sourceNode.type === 'loop') {
              edgeLabel = sourceHandle === 'output' ? 'Output' : 'Loop';
            } else {
              edgeLabel = sourceHandle;
            }
          }
        }
        
        // Create an edge connecting the source node to the new node
        const newEdge: Edge = {
          id: `edge-${pendingNodeConnection.sourceNodeId}-${newNode.id}`,
          source: pendingNodeConnection.sourceNodeId,
          target: newNode.id,
          sourceHandle: sourceHandle,
          targetHandle: 'input',
          label: edgeLabel,
          labelStyle: { fill: '#888', fontWeight: 500, fontSize: 6 },
          labelBgStyle: { fill: '#1e1e1e', fillOpacity: 0.7 },
          labelBgPadding: [1, 2] as [number, number],
          labelBgBorderRadius: 1,
        };
        setEdges((eds) => [...eds, newEdge]);
        
        setNodeIdCounter((prev) => prev + 1);
        setPendingNodeConnection(null);
        setShowPalette(false);
        setPaletteFilter('all');
        
        // Fit view after adding node
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
      } else {
        // Adding node to replace placeholder or add new node
        const placeholderNode = nodes.find((n) => n.type === 'placeholder');
        
        if (placeholderNode) {
          // Replace placeholder node
          const updatedNode: Node = {
            ...placeholderNode,
            type: nodeType,
            data: {
              label: template ? template.metadata.label : label,
              properties: template ? {} : {},
              template: template,
              onAddNode: handleAddNodeFromNode,
            },
          };
          setNodes((nds) =>
            nds.map((node) =>
              node.id === placeholderNode.id ? updatedNode : node
            )
          );
        } else {
          // Add new node after the last node in the workflow
          // Find the rightmost node or the node with no outgoing edges
          let lastNode: Node | null = null;
          
          // Filter out placeholder nodes
          const realNodes = nodes.filter(n => n.type !== 'placeholder');
          
          if (realNodes.length === 0) {
            // No nodes yet, place at default position
            lastNode = null;
          } else {
            // Find nodes with no outgoing edges (terminal nodes)
            const terminalNodes = realNodes.filter(node => 
              !edges.some(edge => edge.source === node.id)
            );
            
            if (terminalNodes.length > 0) {
              // Use the rightmost terminal node
              lastNode = terminalNodes.reduce((rightmost, node) => {
                return (node.position.x > rightmost.position.x) ? node : rightmost;
              });
            } else {
              // If all nodes have outgoing edges, just use the rightmost node
              lastNode = realNodes.reduce((rightmost, node) => {
                return (node.position.x > rightmost.position.x) ? node : rightmost;
              });
            }
          }
          
          let newPosition;
          if (lastNode) {
            // Position the new node to the right of the last node
            newPosition = {
              x: lastNode.position.x + 250,
              y: lastNode.position.y,
            };
          } else {
            // Default position if no nodes exist
            newPosition = {
              x: 100,
              y: 300,
            };
          }
          
          const newNode: Node = {
            id: `node-${nodeIdCounter}`,
            type: nodeType,
            position: newPosition,
            data: {
              label: template ? template.metadata.label : label,
              properties: template ? {} : {},
              template: template,
              onAddNode: handleAddNodeFromNode,
              options: {
                errorHandling: 'stop',
              },
            },
          };
          setNodes((nds) => [...nds, newNode]);
        }
        setNodeIdCounter((prev) => prev + 1);
        setShowPalette(false);
        setPaletteFilter('all');
        
        // Fit view after adding node
        setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
      }
    },
    [pendingNodeConnection, nodes, nodeIdCounter, setNodes, setEdges, handleAddNodeFromNode, templates, edges, fitView]
  );

  const addNode = useCallback(
    (type: string, label: string) => {
      handleNodeSelectFromPalette(type, label);
    },
    [handleNodeSelectFromPalette]
  );

  const updateNodeProperties = useCallback(
    (nodeId: string, properties: Record<string, any>) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, properties, onAddNode: handleAddNodeFromNode } }
            : node
        )
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          data: { ...selectedNode.data, properties, onAddNode: handleAddNodeFromNode },
        });
      }
    },
    [setNodes, selectedNode, handleAddNodeFromNode]
  );

  const updateNodeOptions = useCallback(
    (nodeId: string, options: Record<string, any>) => {
      const previousOptions = nodes.find(n => n.id === nodeId)?.data?.options as any;
      const wasErrorHandleEnabled = previousOptions?.errorHandling === 'continue';
      const isErrorHandleEnabled = options?.errorHandling === 'continue';
      
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === nodeId) {
            // Create a completely new node object to force React Flow to re-render
            return {
              ...node,
              data: {
                ...node.data,
                options,
              },
            };
          }
          return node;
        })
      );
      
      // Handle edge updates based on error handling change
      setEdges((eds) => {
        // If error handle was disabled, remove all edges connected to the error handle
        if (wasErrorHandleEnabled && !isErrorHandleEnabled) {
          return eds
            .filter((edge) => !(edge.source === nodeId && edge.sourceHandle === 'error'))
            .map((edge) => {
              // Force recalculation for remaining edges from this node
              if (edge.source === nodeId || edge.target === nodeId) {
                return { ...edge };
              }
              return edge;
            });
        } else {
          // Just force recalculation for edges connected to this node
          return eds.map((edge) => {
            if (edge.source === nodeId || edge.target === nodeId) {
              return { ...edge };
            }
            return edge;
          });
        }
      });
      
      if (selectedNode?.id === nodeId) {
        setSelectedNode((prev) => prev ? {
          ...prev,
          data: { ...prev.data, options },
        } : null);
      }
      
      // Force React Flow to recalculate handle positions after state updates
      // Use a slightly longer timeout to ensure DOM has fully updated
      setTimeout(() => {
        updateNodeInternals(nodeId);
      }, 100);
    },
    [setNodes, setEdges, selectedNode, updateNodeInternals, nodes]
  );

  const updateNodeLabel = useCallback(
    (nodeId: string, newLabel: string) => {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === nodeId
            ? { ...node, data: { ...node.data, label: newLabel } }
            : node
        )
      );
      if (selectedNode?.id === nodeId) {
        setSelectedNode({
          ...selectedNode,
          data: { ...selectedNode.data, label: newLabel },
        });
      }
    },
    [setNodes, selectedNode]
  );

  const deleteNode = useCallback(
    (nodeId: string) => {
      // Remove the node
      setNodes((nds) => nds.filter((node) => node.id !== nodeId));
      
      // Remove any edges connected to this node
      setEdges((eds) => 
        eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
      );
      
      // Close properties panel if this node was selected
      if (selectedNode?.id === nodeId) {
        setSelectedNode(null);
      }
    },
    [setNodes, setEdges, selectedNode]
  );

  // Calculate which handles have outgoing edges (for nodes with multiple outputs)
  const handlesWithOutgoingEdges = new Map<string, Set<string>>();
  edges.forEach((edge) => {
    if (edge.sourceHandle) {
      if (!handlesWithOutgoingEdges.has(edge.source)) {
        handlesWithOutgoingEdges.set(edge.source, new Set());
      }
      handlesWithOutgoingEdges.get(edge.source)?.add(edge.sourceHandle);
    }
  });

  // Calculate which nodes have any outgoing edges (for single output nodes)
  const nodesWithOutgoingEdges = new Set(
    edges.map((edge) => edge.source)
  );

  // Update all nodes to include onAddNode callback and connection info
  const nodesWithAddCallback = nodes.map((node) => {
    const connectedHandles = handlesWithOutgoingEdges.get(node.id);
    const hasOutgoingEdges = nodesWithOutgoingEdges.has(node.id);
    
    return {
      ...node,
      data: {
        ...node.data,
        // Preserve existing data
        label: node.data.label,
        properties: node.data.properties,
        options: node.data.options,
        template: (node.data as any)?.template,
        // Add callbacks
        onAddNode: node.type === 'placeholder' ? undefined : handleAddNodeFromNode,
        onShowPalette: node.type === 'placeholder' ? () => handleShowPalette('trigger') : undefined,
        onUpdateLabel: updateNodeLabel,
        onDeleteNode: node.type === 'placeholder' ? undefined : deleteNode,
        // Add connection info
        hasOutgoingEdges: (node.type === 'if' || node.type === 'branch' || node.type === 'loop' || (node.data as any)?.template) ? undefined : hasOutgoingEdges,
        connectedHandles: (node.type === 'if' || node.type === 'branch' || node.type === 'loop' || (node.data as any)?.template) ? connectedHandles : undefined,
      },
    };
  });

  const closePropertiesModal = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleFormatNodes = useCallback(() => {
    // Auto-layout algorithm: arrange nodes in a tree structure with proper branching
    const layoutNodes = [...nodes];
    const processedNodes = new Set<string>();
    
    // Find root nodes (nodes with no incoming edges)
    const rootNodes = layoutNodes.filter(node => 
      !edges.some(edge => edge.target === node.id) && node.type !== 'placeholder'
    );

    const horizontalSpacing = 250;
    const verticalSpacing = 120;
    const branchSpacing = 150;

    // Calculate subtree height to determine spacing
    const getSubtreeHeight = (nodeId: string, visited = new Set<string>()): number => {
      if (visited.has(nodeId)) return 0;
      visited.add(nodeId);

      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      if (outgoingEdges.length === 0) return 1;

      const childHeights = outgoingEdges.map(edge => 
        getSubtreeHeight(edge.target, new Set(visited))
      );
      return childHeights.reduce((sum, h) => sum + h, 0);
    };

    const layoutNode = (nodeId: string, x: number, yStart: number, yEnd: number) => {
      if (processedNodes.has(nodeId)) return;
      processedNodes.add(nodeId);

      const node = layoutNodes.find(n => n.id === nodeId);
      if (!node) return;

      // Center the node in its allocated vertical space
      const y = (yStart + yEnd) / 2;
      node.position = { x, y };

      // Get outgoing edges from this node
      const outgoingEdges = edges.filter(edge => edge.source === nodeId);
      
      if (outgoingEdges.length > 0) {
        // Calculate space needed for each child based on their subtree size
        const childHeights = outgoingEdges.map(edge => 
          getSubtreeHeight(edge.target, new Set([nodeId]))
        );
        const totalHeight = childHeights.reduce((sum, h) => sum + h, 0);
        const availableHeight = yEnd - yStart;
        const spacing = Math.max(verticalSpacing, availableHeight / totalHeight);

        let currentYStart = yStart;
        outgoingEdges.forEach((edge, idx) => {
          const childHeight = childHeights[idx];
          const childSpace = childHeight * spacing;
          const childYStart = currentYStart;
          const childYEnd = currentYStart + childSpace;
          
          layoutNode(edge.target, x + horizontalSpacing, childYStart, childYEnd);
          currentYStart = childYEnd;
        });
      }
    };

    // Layout each root node and its descendants
    let currentRootY = 100;
    rootNodes.forEach(rootNode => {
      const rootHeight = getSubtreeHeight(rootNode.id);
      const rootSpace = rootHeight * verticalSpacing;
      layoutNode(rootNode.id, 100, currentRootY, currentRootY + rootSpace);
      currentRootY += rootSpace + branchSpacing;
    });

    setNodes(layoutNodes);
    
    // Fit view after layout
    setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
  }, [nodes, edges, setNodes, fitView]);

  return (
    <div className="app-container">
      {/* Top Left Controls */}
      <div className="top-left-controls">
        <button 
          className="floating-add-button"
          onClick={() => handleShowPalette('all')}
          title="Add Node"
        >
          <FontAwesomeIcon icon={faPlus} />
        </button>
        <button
          className="format-button-float"
          onClick={handleFormatNodes}
          title="Format / Auto-layout nodes"
        >
          <FontAwesomeIcon icon={faLayerGroup} />
        </button>
      </div>

      <div className="flow-container">
        <ReactFlow
          nodes={nodesWithAddCallback}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          onNodeDoubleClick={onNodeDoubleClick}
          onPaneClick={onPaneClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
      
      {showPalette && (
        <NodePalette 
          onAddNode={addNode} 
          highlighted={highlightPalette}
          filterMode={paletteFilter}
        />
      )}

      {selectedNode && (
        <div className="properties-modal-overlay" onClick={closePropertiesModal}>
          <div className="properties-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closePropertiesModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            
            <div className="modal-content">
              {/* Input Panel */}
              <div className="modal-panel input-panel">
                <h3>Input</h3>
                <div className="panel-body">
                  <p className="panel-placeholder">Input from previous nodes</p>
                  {/* Dynamic textareas based on previous nodes will go here */}
                </div>
              </div>

              {/* Properties Panel */}
              <div className="modal-panel properties-center">
                <h3>
                  Node Properties
                  <span style={{ 
                    marginLeft: '12px', 
                    fontSize: '13px', 
                    color: '#888',
                    fontWeight: 'normal'
                  }}>
                    {(selectedNode.data as any)?.template 
                      ? (selectedNode.data as any).template.metadata.label 
                      : selectedNode.type}
                  </span>
                </h3>
                
                <div className="panel-body">
                  <div className="properties-tabs-body">
                    <button
                      className={`properties-tab ${propertiesTab === 'properties' ? 'active' : ''}`}
                      onClick={() => setPropertiesTab('properties')}
                    >
                      Properties
                    </button>
                    <button
                      className={`properties-tab ${propertiesTab === 'options' ? 'active' : ''}`}
                      onClick={() => setPropertiesTab('options')}
                    >
                      Options
                    </button>
                  </div>

                  <div className="properties-tab-content">
                    {propertiesTab === 'properties' ? (
                      (selectedNode.data as any)?.template ? (
                        <DynamicPropertiesPanel
                          node={selectedNode}
                          onUpdateProperties={updateNodeProperties}
                        />
                      ) : (
                        <NodePropertiesPanel
                          node={selectedNode}
                          onUpdateProperties={updateNodeProperties}
                        />
                      )
                    ) : (
                      <div className="node-options-panel">
                        <div className="option-group">
                          <label className="option-label">On Error:</label>
                          <div className="option-radio-group">
                            <label className="radio-option">
                              <input
                                type="radio"
                                name="errorHandling"
                                value="stop"
                                checked={(selectedNode.data as any)?.options?.errorHandling === 'stop' || !(selectedNode.data as any)?.options?.errorHandling}
                                onChange={() => {
                                  const currentOptions = (selectedNode.data as any)?.options || {};
                                  updateNodeOptions(selectedNode.id, {
                                    ...currentOptions,
                                    errorHandling: 'stop'
                                  });
                                }}
                              />
                              <span>Stop</span>
                            </label>
                            <label className="radio-option">
                              <input
                                type="radio"
                                name="errorHandling"
                                value="continue"
                                checked={(selectedNode.data as any)?.options?.errorHandling === 'continue'}
                                onChange={() => {
                                  const currentOptions = (selectedNode.data as any)?.options || {};
                                  updateNodeOptions(selectedNode.id, {
                                    ...currentOptions,
                                    errorHandling: 'continue'
                                  });
                                }}
                              />
                              <span>Continue</span>
                            </label>
                            <label className="radio-option">
                              <input
                                type="radio"
                                name="errorHandling"
                                value="globalError"
                                checked={(selectedNode.data as any)?.options?.errorHandling === 'globalError'}
                                onChange={() => {
                                  const currentOptions = (selectedNode.data as any)?.options || {};
                                  updateNodeOptions(selectedNode.id, {
                                    ...currentOptions,
                                    errorHandling: 'globalError'
                                  });
                                }}
                              />
                              <span>Trigger global error node</span>
                            </label>
                          </div>
                          <p className="option-description">
                            {(selectedNode.data as any)?.options?.errorHandling === 'continue' 
                              ? 'A red "Error" handle will appear on the node to connect to error handling logic.'
                              : (selectedNode.data as any)?.options?.errorHandling === 'globalError'
                              ? 'Errors will trigger a global error handler node in the workflow.'
                              : 'The workflow will stop execution when this node encounters an error.'
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              <div className="modal-panel output-panel">
                <h3>Output</h3>
                <div className="panel-body">
                  <p className="panel-placeholder">Output will be generated from API</p>
                  {/* Output textareas will go here */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ReactFlowProvider>
      <FlowContent />
    </ReactFlowProvider>
  );
}

export default App;
