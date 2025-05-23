
import React, { useState } from 'react';
import { GraphCanvas } from '../components/GraphCanvas';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Index = () => {
  const [graphType, setGraphType] = useState<'directed' | 'undirected' | null>(null);

  const handleGraphTypeSelect = (type: 'directed' | 'undirected') => {
    setGraphType(type);
  };

  const handleReset = () => {
    setGraphType(null);
  };

  if (!graphType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md mx-auto shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              🚀 Graph Cycle Detector
            </CardTitle>
            <p className="text-gray-600 mt-2">
              Choose your graph type to begin detecting cycles using DFS traversal
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={() => handleGraphTypeSelect('directed')}
              className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              📊 Directed Graph
              <span className="block text-sm opacity-90">Edges have direction (arrows)</span>
            </Button>
            <Button
              onClick={() => handleGraphTypeSelect('undirected')}
              className="w-full h-16 text-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🔗 Undirected Graph
              <span className="block text-sm opacity-90">Edges are bidirectional</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <GraphCanvas graphType={graphType} onReset={handleReset} />;
};

export default Index;
