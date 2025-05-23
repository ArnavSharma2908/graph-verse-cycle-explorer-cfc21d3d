
import type { Node, Edge } from '../components/GraphCanvas';

export class CycleDetector {
  private nodes: Node[];
  private edges: Edge[];
  private graphType: 'directed' | 'undirected';
  private visited: Set<string>;
  private recStack: Set<string>; // For directed graphs
  private parent: Map<string, string>; // For undirected graphs

  constructor(nodes: Node[], edges: Edge[], graphType: 'directed' | 'undirected') {
    this.nodes = nodes;
    this.edges = edges;
    this.graphType = graphType;
    this.visited = new Set();
    this.recStack = new Set();
    this.parent = new Map();
  }

  // Build adjacency list from edges
  private buildAdjacencyList(): Map<string, string[]> {
    const adjList = new Map<string, string[]>();
    
    // Initialize with all nodes
    this.nodes.forEach(node => {
      adjList.set(node.name, []);
    });
    
    // Add edges
    this.edges.forEach(edge => {
      const neighbors = adjList.get(edge.source) || [];
      neighbors.push(edge.target);
      adjList.set(edge.source, neighbors);
      
      // For undirected graphs, add reverse edge
      if (this.graphType === 'undirected') {
        const reverseNeighbors = adjList.get(edge.target) || [];
        reverseNeighbors.push(edge.source);
        adjList.set(edge.target, reverseNeighbors);
      }
    });
    
    return adjList;
  }

  // DFS for directed graphs (detects back edges in recursion stack)
  private dfsDirected(node: string, adjList: Map<string, string[]>, path: string[]): string[] {
    this.visited.add(node);
    this.recStack.add(node);
    path.push(node);

    const neighbors = adjList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!this.visited.has(neighbor)) {
        const cycle = this.dfsDirected(neighbor, adjList, [...path]);
        if (cycle.length > 0) return cycle;
      } else if (this.recStack.has(neighbor)) {
        // Found a back edge - cycle detected
        const cycleStart = path.indexOf(neighbor);
        return path.slice(cycleStart);
      }
    }

    this.recStack.delete(node);
    return [];
  }

  // DFS for undirected graphs (detects back edges to non-parent nodes)
  private dfsUndirected(node: string, parent: string | null, adjList: Map<string, string[]>, path: string[]): string[] {
    this.visited.add(node);
    path.push(node);

    const neighbors = adjList.get(node) || [];
    for (const neighbor of neighbors) {
      if (!this.visited.has(neighbor)) {
        const cycle = this.dfsUndirected(neighbor, node, adjList, [...path]);
        if (cycle.length > 0) return cycle;
      } else if (neighbor !== parent) {
        // Found a back edge to a non-parent node - cycle detected
        const cycleStart = path.indexOf(neighbor);
        return path.slice(cycleStart);
      }
    }

    return [];
  }

  // Main cycle detection method
  findCycle(): string[] {
    if (this.nodes.length === 0) return [];

    const adjList = this.buildAdjacencyList();
    this.visited.clear();
    this.recStack.clear();

    // Try DFS from each unvisited node
    for (const node of this.nodes) {
      if (!this.visited.has(node.name)) {
        let cycle: string[] = [];
        
        if (this.graphType === 'directed') {
          cycle = this.dfsDirected(node.name, adjList, []);
        } else {
          cycle = this.dfsUndirected(node.name, null, adjList, []);
        }
        
        if (cycle.length > 0) {
          return cycle;
        }
      }
    }

    return [];
  }
}
