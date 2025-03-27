import { v4 as uuidv4 } from 'uuid';

export type NodeType = 'data' | 'control';
export type ControlLogicType = 'selector' | 'concatenator' | 'diff' | 'label' | 'custom';

/**
 * Data Entry Node structure
 */
export interface DataEntry {
  payload?: any;
  contentType: string;
  dataReference?: string; // For large data, store a reference (e.g., S3 URI)
}

/**
 * Control Node structure
 */
export interface Control {
  logicType: ControlLogicType;
  config: Record<string, any>;
}

/**
 * Common Node interface
 */
export interface Node {
  nodeId: string;
  projectId: string;
  nodeType: NodeType;
  name?: string;
  data?: DataEntry;
  control?: Control;
  metadata?: Record<string, any>;
  createdAt: number;
  updatedAt: number;
}

/**
 * Input for node creation
 */
export interface CreateNodeInput {
  projectId: string;
  nodeType: NodeType;
  name?: string;
  data?: DataEntry;
  control?: Control;
  metadata?: Record<string, any>;
}

/**
 * Create a new node with generated ID and timestamps
 */
export const createNode = (input: CreateNodeInput): Node => {
  const timestamp = Date.now();
  
  return {
    nodeId: `n-${uuidv4()}`,
    projectId: input.projectId,
    nodeType: input.nodeType,
    name: input.name,
    data: input.nodeType === 'data' ? input.data : undefined,
    control: input.nodeType === 'control' ? input.control : undefined,
    metadata: input.metadata || {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };
};

/**
 * Update a node with new timestamps
 */
export const updateNode = (node: Node, updates: Partial<Node>): Node => {
  return {
    ...node,
    ...updates,
    updatedAt: Date.now(),
  };
};
