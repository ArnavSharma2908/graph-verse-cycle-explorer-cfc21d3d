
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GraphControls } from './GraphControls';
import { EdgeInputPanel } from './EdgeInputPanel';
import { AdjacencyMatrix } from './AdjacencyMatrix';
import { CycleDetector } from '../utils/cycleDetector';
import { GraphUtils } from '../utils/graphUtils';
import { toast } from 'sonner';

export interface Node {
  id: string;
  name: string;
  x: number;
  y: number;
  degree: number;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
}

interface GraphCanvasProps {
  graphType: 'directed' | 'undirected';
  onReset: () => void;
}

export const GraphCanvas: React.FC<GraphCanvasProps> = ({ graphType, onReset }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [cycleHighlight, setCycleHighlight] = useState<string[]>([]);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<SVGSVGElement>(null);

  // Generate unique node name
  const generateNodeName = useCallback(() => {
    return GraphUtils.generateUniqueName(nodes.map(n => n.name));
  }, [nodes]);

  // Calculate node degree
  const calculateDegree = useCallback((nodeId: string) => {
    return edges.filter(edge => edge.source === nodeId || edge.target === nodeId).length;
  }, [edges]);

  // Update node degrees
  useEffect(() => {
    setNodes(prevNodes => 
      prevNodes.map(node => ({
        ...node,
        degree: calculateDegree(node.id)
      }))
    );
  }, [edges, calculateDegree]);

  // Handle canvas double click to create node
  const handleCanvasDoubleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (e.target === canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const newNode: Node = {
        id: Date.now().toString(),
        name: generateNodeName(),
        x,
        y,
        degree: 0
      };
      
      setNodes(prev => [...prev, newNode]);
      toast.success(`Node "${newNode.name}" created!`);
    }
  };

  // Handle node drag
  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setDraggedNode(nodeId);
    setDragOffset({
      x: e.clientX - rect.left - node.x,
      y: e.clientY - rect.top - node.y
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!draggedNode || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;
    
    setNodes(prev => prev.map(node => 
      node.id === draggedNode ? { ...node, x, y } : node
    ));
  }, [draggedNode, dragOffset]);

  const handleMouseUp = useCallback(() => {
    setDraggedNode(null);
  }, []);

  useEffect(() => {
    if (draggedNode) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedNode, handleMouseMove, handleMouseUp]);

  // Handle node click
  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId);
    setSelectedEdge(null);
  };

  // Handle edge click
  const handleEdgeClick = (edgeId: string) => {
    setSelectedEdge(edgeId);
    setSelectedNode(null);
  };

  // Rename node
  const renameNode = (nodeId: string, newName: string) => {
    if (!GraphUtils.isValidName(newName)) {
      toast.error('Invalid name! Use A-Z, a-z, Hindi characters (क-ज्ञ), or numbers < 1000');
      return false;
    }
    
    if (nodes.some(n => n.id !== nodeId && n.name === newName)) {
      toast.error('Name already exists! Choose a unique name.');
      return false;
    }
    
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, name: newName } : node
    ));
    toast.success(`Node renamed to "${newName}"`);
    return true;
  };

  // Delete node
  const deleteNode = (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    setNodes(prev => prev.filter(n => n.id !== nodeId));
    setEdges(prev => prev.filter(e => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    toast.success(`Node "${node?.name}" deleted!`);
  };

  // Create edge
  const createEdge = (sourceName: string, targetName: string) => {
    const sourceNode = nodes.find(n => n.name === sourceName);
    const targetNode = nodes.find(n => n.name === targetName);
    
    if (!sourceNode || !targetNode) {
      // Create missing nodes
      const newNodes: Node[] = [];
      if (!sourceNode) {
        newNodes.push({
          id: Date.now().toString(),
          name: sourceName,
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
          degree: 0
        });
      }
      if (!targetNode) {
        newNodes.push({
          id: (Date.now() + 1).toString(),
          name: targetName,
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100,
          degree: 0
        });
      }
      setNodes(prev => [...prev, ...newNodes]);
    }
    
    // Check if edge already exists
    const edgeExists = edges.some(e => 
      (e.source === sourceName && e.target === targetName) ||
      (graphType === 'undirected' && e.source === targetName && e.target === sourceName)
    );
    
    if (edgeExists) {
      toast.error('Edge already exists!');
      return;
    }
    
    const newEdge: Edge = {
      id: Date.now().toString(),
      source: sourceName,
      target: targetName
    };
    
    setEdges(prev => [...prev, newEdge]);
    toast.success(`Edge created: ${sourceName} → ${targetName}`);
  };

  // Delete edge
  const deleteEdge = (edgeId: string) => {
    setEdges(prev => prev.filter(e => e.id !== edgeId));
    setSelectedEdge(null);
    toast.success('Edge deleted!');
  };

  // Reverse edge (directed graphs only)
  const reverseEdge = (edgeId: string) => {
    if (graphType !== 'directed') return;
    
    setEdges(prev => prev.map(edge => 
      edge.id === edgeId 
        ? { ...edge, source: edge.target, target: edge.source }
        : edge
    ));
    toast.success('Edge direction flipped!');
  };

  // Detect cycles
  const detectCycles = () => {
    const detector = new CycleDetector(nodes, edges, graphType);
    const cycle = detector.findCycle();
    
    if (cycle.length > 0) {
      setCycleHighlight(cycle);
      toast.success(`Cycle detected: ${cycle.join(' → ')} → ${cycle[0]}`);
    } else {
      setCycleHighlight([]);
      toast.info('No cycles detected.');
    }
  };

  // Clear graph
  const clearGraph = () => {
    setNodes([]);
    setEdges([]);
    setCycleHighlight([]);
    setSelectedNode(null);
    setSelectedEdge(null);
    toast.success('Graph cleared!');
  };

  // Get node color based on degree
  const getNodeColor = (degree: number) => {
    const colors = [
      '#f3f4f6', // 0 degree - gray
      '#dbeafe', // 1 degree - light blue
      '#bfdbfe', // 2 degrees - blue
      '#93c5fd', // 3 degrees - medium blue
      '#60a5fa', // 4 degrees - darker blue
      '#3b82f6', // 5+ degrees - strong blue
    ];
    return colors[Math.min(degree, colors.length - 1)];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto grid grid-cols-12 gap-6 h-[calc(100vh-2rem)]">
        {/* Left Sidebar */}
        <div className="col-span-3 space-y-6">
          <EdgeInputPanel 
            onCreateEdge={createEdge}
            onDeleteEdge={(source, target) => {
              const edge = edges.find(e => 
                (e.source === source && e.target === target) ||
                (graphType === 'undirected' && e.source === target && e.target === source)
              );
              if (edge) {
                deleteEdge(edge.id);
              } else {
                toast.error('Edge not found!');
              }
            }}
          />
          <AdjacencyMatrix 
            nodes={nodes}
            edges={edges}
            graphType={graphType}
          />
        </div>

        {/* Main Canvas */}
        <div className="col-span-9 flex flex-col">
          <GraphControls
            graphType={graphType}
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onRenameNode={renameNode}
            onDeleteNode={deleteNode}
            onDeleteEdge={() => selectedEdge && deleteEdge(selectedEdge)}
            onReverseEdge={() => selectedEdge && reverseEdge(selectedEdge)}
            onDetectCycles={detectCycles}
            onClearGraph={clearGraph}
            onReset={onReset}
          />
          
          <div className="flex-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            <svg
              ref={canvasRef}
              className="w-full h-full cursor-crosshair"
              onDoubleClick={handleCanvasDoubleClick}
            >
              {/* Grid pattern */}
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Edges */}
              {edges.map((edge, index) => {
                const sourceNode = nodes.find(n => n.name === edge.source);
                const targetNode = nodes.find(n => n.name === edge.target);
                if (!sourceNode || !targetNode) return null;
                
                const isHighlighted = cycleHighlight.includes(edge.source) && cycleHighlight.includes(edge.target);
                const isSelected = selectedEdge === edge.id;
                
                return (
                  <g key={edge.id}>
                    <line
                      x1={sourceNode.x}
                      y1={sourceNode.y}
                      x2={targetNode.x}
                      y2={targetNode.y}
                      stroke={isHighlighted ? '#ef4444' : `hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                      strokeWidth={isSelected ? 4 : isHighlighted ? 3 : 2}
                      className="cursor-pointer hover:stroke-width-3 transition-all"
                      onClick={() => handleEdgeClick(edge.id)}
                    />
                    {graphType === 'directed' && (
                      <polygon
                        points={`${targetNode.x - 5},${targetNode.y - 5} ${targetNode.x + 5},${targetNode.y} ${targetNode.x - 5},${targetNode.y + 5}`}
                        fill={isHighlighted ? '#ef4444' : `hsl(${(index * 137.5) % 360}, 70%, 50%)`}
                        className="cursor-pointer"
                        onClick={() => handleEdgeClick(edge.id)}
                      />
                    )}
                  </g>
                );
              })}
              
              {/* Nodes */}
              {nodes.map((node) => {
                const isHighlighted = cycleHighlight.includes(node.name);
                const isSelected = selectedNode === node.id;
                
                return (
                  <g key={node.id}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isSelected ? 25 : 20}
                      fill={isHighlighted ? '#fecaca' : getNodeColor(node.degree)}
                      stroke={isSelected ? '#3b82f6' : isHighlighted ? '#ef4444' : '#6b7280'}
                      strokeWidth={isSelected ? 3 : 2}
                      className="cursor-pointer hover:r-22 transition-all animate-pulse"
                      style={{ animationDuration: '3s' }}
                      onClick={() => handleNodeClick(node.id)}
                      onMouseDown={(e) => handleMouseDown(e, node.id)}
                    />
                    <text
                      x={node.x}
                      y={node.y + 5}
                      textAnchor="middle"
                      className="text-sm font-bold fill-gray-800 pointer-events-none select-none"
                    >
                      {node.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};
