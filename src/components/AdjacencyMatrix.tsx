
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Node, Edge } from './GraphCanvas';

interface AdjacencyMatrixProps {
  nodes: Node[];
  edges: Edge[];
  graphType: 'directed' | 'undirected';
}

export const AdjacencyMatrix: React.FC<AdjacencyMatrixProps> = ({
  nodes,
  edges,
  graphType,
}) => {
  if (nodes.length === 0) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold text-gray-800">
            📊 Adjacency Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            <p className="text-sm">
              Add vertices and edges to see the adjacency matrix.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const matrix: number[][] = Array(nodes.length).fill(null).map(() => 
    Array(nodes.length).fill(0)
  );

  // Fill matrix based on edges
  edges.forEach(edge => {
    const sourceIndex = nodes.findIndex(n => n.name === edge.source);
    const targetIndex = nodes.findIndex(n => n.name === edge.target);
    
    if (sourceIndex !== -1 && targetIndex !== -1) {
      matrix[sourceIndex][targetIndex] = 1;
      if (graphType === 'undirected') {
        matrix[targetIndex][sourceIndex] = 1;
      }
    }
  });

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-800">
          📊 Adjacency Matrix
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 w-full">
          <div className="overflow-auto">
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="w-8 h-8 border border-gray-300 bg-gray-100 font-bold"></th>
                  {nodes.map(node => (
                    <th key={node.id} className="w-8 h-8 border border-gray-300 bg-gray-100 font-bold text-center">
                      {node.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {nodes.map((rowNode, i) => (
                  <tr key={rowNode.id}>
                    <th className="w-8 h-8 border border-gray-300 bg-gray-100 font-bold text-center">
                      {rowNode.name}
                    </th>
                    {matrix[i].map((value, j) => (
                      <td 
                        key={j} 
                        className={`w-8 h-8 border border-gray-300 text-center font-mono ${
                          value === 1 ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-white'
                        }`}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
