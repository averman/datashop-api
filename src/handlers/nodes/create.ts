import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from 'middy';
import { jsonBodyParser, httpErrorHandler, cors } from 'middy/middlewares';
import { CreateNodeInput, createNode } from '../../models/Node';
import { success, error, badRequest } from '../../utils/api';
import { put, NODES_TABLE } from '../../utils/dynamodb';
import Ajv from 'ajv';

// Initialize JSON Schema validator
const ajv = new Ajv();
const validateNodeInput = ajv.compile({
  type: 'object',
  required: ['projectId', 'nodeType'],
  properties: {
    projectId: { type: 'string' },
    nodeType: { type: 'string', enum: ['data', 'control'] },
    name: { type: 'string' },
    data: {
      type: 'object',
      properties: {
        payload: {},
        contentType: { type: 'string' },
        dataReference: { type: 'string' }
      },
      required: ['contentType']
    },
    control: {
      type: 'object',
      properties: {
        logicType: { type: 'string', enum: ['selector', 'concatenator', 'diff', 'label', 'custom'] },
        config: { type: 'object' }
      },
      required: ['logicType', 'config']
    },
    metadata: { type: 'object' }
  },
  // Conditional validation - if nodeType is 'data', require data; if 'control', require control
  allOf: [
    {
      if: { properties: { nodeType: { const: 'data' } } },
      then: { required: ['data'] }
    },
    {
      if: { properties: { nodeType: { const: 'control' } } },
      then: { required: ['control'] }
    }
  ]
});

/**
 * Create a new node
 */
export const createNodeHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const input = event.body as unknown as CreateNodeInput;
    
    // Validate input
    if (!validateNodeInput(input)) {
      return badRequest('Invalid node data: ' + ajv.errorsText(validateNodeInput.errors));
    }
    
    // Create the node with all required fields
    const node = createNode(input);
    
    // Save the node to DynamoDB
    await put({
      TableName: NODES_TABLE,
      Item: node
    });
    
    return success({ nodeId: node.nodeId, ...node });
  } catch (err) {
    return error(err);
  }
};

// Use middy middleware to handle common HTTP tasks
export const handler = middy(createNodeHandler)
  .use(jsonBodyParser())
  .use(httpErrorHandler())
  .use(cors({
    origin: '*',
    credentials: true,
  }));
