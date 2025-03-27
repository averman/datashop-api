import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from 'middy';
import { httpErrorHandler, cors } from 'middy/middlewares';
import { success, error, notFound, badRequest } from '../../utils/api';
import { get, query, NODES_TABLE, EDGES_TABLE } from '../../utils/dynamodb';
import { Node, Control } from '../../models/Node';
import { Edge } from '../../models/Edge';

/**
 * Get the output from a specific control node
 */
export const getOutputHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const outputNodeId = event.pathParameters?.outputNodeId;
    
    if (!outputNodeId) {
      return notFound('Output node ID is required');
    }
    
    // Get the output node
    const nodeResult = await get({
      TableName: NODES_TABLE,
      Key: { nodeId: outputNodeId }
    });
    
    // Check if the node exists and is a control node
    const node = nodeResult.Item as Node;
    if (!node) {
      return notFound(`Node with ID ${outputNodeId} not found`);
    }
    
    if (node.nodeType !== 'control') {
      return badRequest(`Node with ID ${outputNodeId} is not a control node`);
    }
    
    // Get all incoming edges to this node (inputs)
    const edgesResult = await query({
      TableName: EDGES_TABLE,
      IndexName: 'targetNodeIdIndex',
      KeyConditionExpression: 'targetNodeId = :targetNodeId AND edgeType = :edgeType',
      ExpressionAttributeValues: {
        ':targetNodeId': outputNodeId,
        ':edgeType': 'input'
      }
    });
    
    const inputEdges = edgesResult.Items as Edge[];
    
    // Process the output based on the control node's logic type
    const control = node.control as Control;
    let output;
    
    switch (control.logicType) {
      case 'selector':
        output = await processSelector(node, inputEdges);
        break;
      case 'concatenator':
        output = await processConcatenator(node, inputEdges);
        break;
      case 'diff':
        output = await processDiff(node, inputEdges);
        break;
      case 'label':
        output = await processLabel(node, inputEdges);
        break;
      case 'custom':
        output = await processCustom(node, inputEdges);
        break;
      default:
        return badRequest(`Unsupported control logic type: ${control.logicType}`);
    }
    
    // Check if a specific content type needs to be set
    if (output.contentType) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': output.contentType,
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Credentials': true,
        },
        body: typeof output.result === 'string' ? output.result : JSON.stringify(output.result),
      };
    }
    
    // Return the output
    return success(output.result);
  } catch (err) {
    return error(err);
  }
};

/**
 * Process a selector node
 */
async function processSelector(node: Node, inputEdges: Edge[]): Promise<{ result: any; contentType?: string }> {
  const control = node.control as Control;
  const { selectionMode } = control.config;
  
  // Implement selection logic based on the mode
  if (selectionMode === 'latest_by_version_edge') {
    // Find the latest version from the input nodes
    // This is a simplified implementation - you would need to add logic to determine the latest version
    
    if (inputEdges.length === 0) {
      return { result: { message: 'No input nodes available for selection' } };
    }
    
    // For this example, just return the first input node's data
    const selectedNodeId = inputEdges[0].sourceNodeId;
    const selectedNodeResult = await get({
      TableName: NODES_TABLE,
      Key: { nodeId: selectedNodeId }
    });
    
    const selectedNode = selectedNodeResult.Item as Node;
    return { 
      result: { 
        selectedNodeId,
        selectedNode
      }
    };
  }
  
  // Implement other selection modes as needed
  
  return { result: { message: `Selection mode ${selectionMode} not implemented` } };
}

/**
 * Process a concatenator node
 */
async function processConcatenator(node: Node, inputEdges: Edge[]): Promise<{ result: any; contentType?: string }> {
  // Get all input nodes' data
  const inputNodesPromises = inputEdges.map(edge => get({
    TableName: NODES_TABLE,
    Key: { nodeId: edge.sourceNodeId }
  }));
  
  const inputNodeResults = await Promise.all(inputNodesPromises);
  const inputNodes = inputNodeResults.map(result => result.Item as Node);
  
  // Implement concatenation logic based on the content type
  // This is a simplified implementation - real-world would need to handle different content types
  
  // For this example, just concatenate the payloads of data nodes
  let concatenatedResult = '';
  const control = node.control as Control;
  
  // Get the content type (default to text/plain)
  const contentType = control.config.outputContentType || 'text/plain';
  
  for (const inputNode of inputNodes) {
    if (inputNode.nodeType === 'data' && inputNode.data?.payload) {
      if (typeof inputNode.data.payload === 'string') {
        concatenatedResult += inputNode.data.payload;
      } else {
        concatenatedResult += JSON.stringify(inputNode.data.payload);
      }
    }
  }
  
  return { 
    result: concatenatedResult,
    contentType 
  };
}

/**
 * Process a diff node
 */
async function processDiff(node: Node, inputEdges: Edge[]): Promise<{ result: any; contentType?: string }> {
  // Basic implementation - just return a placeholder
  // In a real implementation, you would compare two input nodes
  
  return { 
    result: { 
      message: 'Diff processing not fully implemented',
      inputCount: inputEdges.length
    } 
  };
}

/**
 * Process a label node
 */
async function processLabel(node: Node, inputEdges: Edge[]): Promise<{ result: any; contentType?: string }> {
  // Basic implementation - just return a placeholder
  // In a real implementation, you would implement label-specific logic
  
  return { 
    result: { 
      message: 'Label processing not fully implemented',
      label: node.name || 'Unnamed Label' 
    } 
  };
}

/**
 * Process a custom node
 */
async function processCustom(node: Node, inputEdges: Edge[]): Promise<{ result: any; contentType?: string }> {
  // Basic implementation - just return a placeholder
  // In a real implementation, you would execute custom logic defined in the node
  
  return { 
    result: { 
      message: 'Custom processing not fully implemented',
      customConfig: (node.control as Control).config
    } 
  };
}

// Use middy middleware
export const handler = middy(getOutputHandler)
  .use(httpErrorHandler())
  .use(cors({
    origin: '*',
    credentials: true,
  }));
