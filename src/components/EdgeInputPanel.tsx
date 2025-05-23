
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface EdgeInputPanelProps {
  onCreateEdge: (source: string, target: string) => void;
  onDeleteEdge: (source: string, target: string) => void;
}

export const EdgeInputPanel: React.FC<EdgeInputPanelProps> = ({
  onCreateEdge,
  onDeleteEdge,
}) => {
  const [edgeInput, setEdgeInput] = useState('');

  const parseEdgeInput = (input: string): { source: string; target: string } | null => {
    const parts = input.trim().split(/\s+/);
    if (parts.length !== 2) return null;
    return { source: parts[0], target: parts[1] };
  };

  const handleCreateEdge = () => {
    const parsed = parseEdgeInput(edgeInput);
    if (!parsed) {
      toast.error('Invalid format! Use: A B (source target)');
      return;
    }
    
    if (parsed.source === parsed.target) {
      toast.error('Self-loops are not allowed!');
      return;
    }
    
    onCreateEdge(parsed.source, parsed.target);
    setEdgeInput('');
  };

  const handleDeleteEdge = () => {
    const parsed = parseEdgeInput(edgeInput);
    if (!parsed) {
      toast.error('Invalid format! Use: A B (source target)');
      return;
    }
    
    onDeleteEdge(parsed.source, parsed.target);
    setEdgeInput('');
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-lg border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold text-gray-800">
          ⚡ Manual Edge Input
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            placeholder="e.g., A B"
            value={edgeInput}
            onChange={(e) => setEdgeInput(e.target.value)}
            className="font-mono"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateEdge()}
          />
          <p className="text-xs text-gray-500 mt-1">
            Format: source target (e.g., A B)
          </p>
        </div>
        
        <div className="space-y-2">
          <Button
            onClick={handleCreateEdge}
            className="w-full bg-green-500 hover:bg-green-600"
            disabled={!edgeInput.trim()}
          >
            ➕ Create Edge
          </Button>
          <Button
            onClick={handleDeleteEdge}
            variant="destructive"
            className="w-full"
            disabled={!edgeInput.trim()}
          >
            ➖ Delete Edge
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
