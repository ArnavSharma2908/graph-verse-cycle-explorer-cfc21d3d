
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

interface GraphControlsProps {
  graphType: 'directed' | 'undirected';
  selectedNode: string | null;
  selectedEdge: string | null;
  onRenameNode: (nodeId: string, newName: string) => boolean;
  onDeleteNode: (nodeId: string) => void;
  onDeleteEdge: () => void;
  onReverseEdge: () => void;
  onDetectCycles: () => void;
  onClearGraph: () => void;
  onReset: () => void;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  graphType,
  selectedNode,
  selectedEdge,
  onRenameNode,
  onDeleteNode,
  onDeleteEdge,
  onReverseEdge,
  onDetectCycles,
  onClearGraph,
  onReset,
}) => {
  const [renameName, setRenameName] = useState('');

  const handleRename = () => {
    if (!selectedNode || !renameName.trim()) return;
    
    if (onRenameNode(selectedNode, renameName.trim())) {
      setRenameName('');
    }
  };

  return (
    <Card className="mb-6 bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            {graphType === 'directed' ? '📊' : '🔗'} {graphType.charAt(0).toUpperCase() + graphType.slice(1)} Graph Controls
          </span>
          <Button
            onClick={onReset}
            variant="outline"
            className="hover:bg-gray-100"
          >
            🔄 Change Graph Type
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Node Controls */}
          {selectedNode && (
            <>
              <div className="flex gap-2 items-center bg-blue-50 p-2 rounded-lg">
                <Input
                  placeholder="New name..."
                  value={renameName}
                  onChange={(e) => setRenameName(e.target.value)}
                  className="w-32"
                  onKeyPress={(e) => e.key === 'Enter' && handleRename()}
                />
                <Button
                  onClick={handleRename}
                  size="sm"
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  ✏️ Rename
                </Button>
                <Button
                  onClick={() => onDeleteNode(selectedNode)}
                  size="sm"
                  variant="destructive"
                >
                  🗑️ Delete Node
                </Button>
              </div>
            </>
          )}

          {/* Edge Controls */}
          {selectedEdge && (
            <div className="flex gap-2 items-center bg-orange-50 p-2 rounded-lg">
              <Button
                onClick={onDeleteEdge}
                size="sm"
                variant="destructive"
              >
                🗑️ Delete Edge
              </Button>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onReverseEdge}
                    size="sm"
                    disabled={graphType === 'undirected'}
                    className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                  >
                    🔄 Flip Direction
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {graphType === 'undirected' 
                    ? "Edge reversal is only supported in directed graphs"
                    : "Reverse the direction of this edge"
                  }
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Main Action Buttons */}
          <div className="flex gap-3 ml-auto">
            <Button
              onClick={onDetectCycles}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg"
            >
              🔍 Detect Cycles
            </Button>
            <Button
              onClick={onClearGraph}
              variant="outline"
              className="hover:bg-red-50 hover:border-red-300"
            >
              🔁 Clear Graph
            </Button>
          </div>
        </div>

        {!selectedNode && !selectedEdge && (
          <p className="text-sm text-gray-600 mt-3">
            💡 <strong>Tip:</strong> Double-click on empty space to create nodes. Click nodes/edges to select them.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
