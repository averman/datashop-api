import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from 'middy';
import { jsonBodyParser, httpErrorHandler, cors } from 'middy/middlewares';
import { CreateEdgeInput, createEdge } from '../../models/Edge';
import { success, error, badRequest, notFound } from '../../utils/api';
import { put, get, EDGES_TABLE, NODES_TABLE } from '../../utils/dynamodb';
import Ajv from 'ajv';

// Initialize JSON Schema validator
const ajv = new Ajv();
const validateEdgeInput = ajv.compile({
  type: 'object',
  required: ['projectId', 'sourceNodeId', 'targetNodeId', 'edgeType'],
  properties: {
    projectId: { type: 'string' },
    sourceNodeId: { type: 'string' },
    targetNodeId: { type: 'string' },
    edgeType: { type: 'string' },
    metadata: { type: 'object' }
  }
});

/**
 * Create a new edge
 */
export const createEdgeHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const input = event.body as unknown as CreateEdgeInput;
    
    // Validate input
    if (!validateEdgeInput(input)) {
      return badRequest('Invalid edge data: ' + ajv.errorsText(validateEdgeInput.errors));
    }
    
    // Verify that both source and target nodes exist
    const sourceNodePromise = get({
      TableName: NODES_TABLE,
      Key: { nodeId: input.sourceNodeId }
    });
    
    const targetNodePromise = get({
      TableName: NODES_TABLE,
      Key: { nodeId: input.targetNodeId }
    });
    
    const [sourceNodeResult, targetNodeResult] = await Promise.all([sourceNodePromise, targetNodePromise]);
    
    if (!sourceNodeResult.Item) {
      return notFound(`Source node with ID ${input.sourceNodeId} not found`);
    }
    
    if (!targetNodeResult.Item) {
      return notFound(`Target node with ID ${input.targetNodeId} not found`);
    }
    
    // Verify that both nodes belong to the same project
    if (sourceNodeResult.Item.projectId !== input.projectId || targetNodeResult.Item.projectId !== input.projectId) {
      return badRequest('Source and target nodes must belong to the specified project');
    }
    
    // Create the edge with all required fields
    const edge = createEdge(input);
    
    // Save the edge to DynamoDB
    await put({
      TableName: EDGES_TABLE,
      Item: edge
    });
    
    return success({ edgeId: edge.edgeId, ...edge });
  } catch (err) {
    return error(err);
  }
};

// Use middy middleware
export const handler = middy(createEdgeHandler)
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .use(cors({
    origin: '*',
    credentials: true,
  }));
