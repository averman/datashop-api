import { v4 as uuidv4 } from 'uuid';

export type EdgeType = 'input' | 'version_of' | 'processed_by' | 'contains_label' | string;

/**
 * Edge interface representing relationships between nodes
 */
export interface Edge {
  edgeId: string;
  projectId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: EdgeType;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Input for edge creation
 */
export interface CreateEdgeInput {
  projectId: string;
  sourceNodeId: string;
  targetNodeId: string;
  edgeType: EdgeType;
  metadata?: Record<string, any>;
}

/**
 * Create a new edge with generated ID and timestamps
 */
export const createEdge = (input: CreateEdgeInput): Edge => {
  const timestamp = Date.now();
  
  return {
    edgeId: `e-${uuidv4()}`,
    projectId: input.projectId,
    sourceNodeId: input.sourceNodeId,
    targetNodeId: input.targetNodeId,
    edgeType: input.edgeType,
    metadata: input.metadata || {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

/**
 * Update an edge with new timestamps
 */
export const updateEdge = (edge: Edge, updates: Partial<Edge>): Edge => {
  return {
    ...edge,
    ...updates,
    updatedAt: Date.now(),
  };
};
