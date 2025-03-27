import * as AWS from 'aws-sdk';

// Initialize the DynamoDB client
const dynamoDbClient = new AWS.DynamoDB.DocumentClient({
  region: process.env.REGION,
  // Add any additional configurations as needed
});

// Table names from environment variables
const NODES_TABLE = process.env.NODES_TABLE || '';
const EDGES_TABLE = process.env.EDGES_TABLE || '';

export interface DynamoDBPutParams {
  TableName: string;
  Item: Record<string, any>;
  ConditionExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, any>;
}

export interface DynamoDBQueryParams {
  TableName: string;
  IndexName?: string;
  KeyConditionExpression: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues: Record<string, any>;
  FilterExpression?: string;
  Limit?: number;
  ScanIndexForward?: boolean;
}

export interface DynamoDBGetParams {
  TableName: string;
  Key: Record<string, any>;
}

export interface DynamoDBUpdateParams {
  TableName: string;
  Key: Record<string, any>;
  UpdateExpression: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues: Record<string, any>;
  ReturnValues?: string;
}

export interface DynamoDBDeleteParams {
  TableName: string;
  Key: Record<string, any>;
  ConditionExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, any>;
}

/**
 * Put an item in a DynamoDB table
 */
export const put = async (params: DynamoDBPutParams): Promise<AWS.DynamoDB.DocumentClient.PutItemOutput> => {
  return dynamoDbClient.put(params).promise();
};

/**
 * Query items from a DynamoDB table or index
 */
export const query = async (params: DynamoDBQueryParams): Promise<AWS.DynamoDB.DocumentClient.QueryOutput> => {
  return dynamoDbClient.query(params).promise();
};

/**
 * Get a specific item from a DynamoDB table
 */
export const get = async (params: DynamoDBGetParams): Promise<AWS.DynamoDB.DocumentClient.GetItemOutput> => {
  return dynamoDbClient.get(params).promise();
};

/**
 * Update an item in a DynamoDB table
 */
export const update = async (params: DynamoDBUpdateParams): Promise<AWS.DynamoDB.DocumentClient.UpdateItemOutput> => {
  return dynamoDbClient.update(params).promise();
};

/**
 * Delete an item from a DynamoDB table
 */
export const remove = async (params: DynamoDBDeleteParams): Promise<AWS.DynamoDB.DocumentClient.DeleteItemOutput> => {
  return dynamoDbClient.delete(params).promise();
};

export { NODES_TABLE, EDGES_TABLE };
