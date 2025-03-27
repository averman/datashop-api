import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import middy from 'middy';
import { httpErrorHandler, cors } from 'middy/middlewares';
import { success, error, notFound } from '../../utils/api';
import { get, NODES_TABLE } from '../../utils/dynamodb';

/**
 * Get a node by ID
 */
export const getNodeHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const nodeId = event.pathParameters?.nodeId;
    
    if (!nodeId) {
      return notFound('Node ID is required');
    }
    
    // Get the node from DynamoDB
    const result = await get({
      TableName: NODES_TABLE,
      Key: { nodeId }
    });
    
    // Check if the node exists
    if (!result.Item) {
      return notFound(`Node with ID ${nodeId} not found`);
    }
    
    return success(result.Item);
  } catch (err) {
    return error(err);
  }
};

// Use middy middleware
export const handler = middy(getNodeHandler)
  .use(httpErrorHandler())
  .use(cors({
    origin: '*',
    credentials: true,
  }));
