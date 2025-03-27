import { APIGatewayProxyResult } from 'aws-lambda';
import createHttpError from 'http-errors';

/**
 * Generate a standardized success response
 */
export const success = (data: any, statusCode = 200): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify(data),
  };
};

/**
 * Generate a standardized error response
 */
export const error = (err: any): APIGatewayProxyResult => {
  console.error(err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    },
    body: JSON.stringify({
      error: {
        message,
        ...(process.env.STAGE !== 'prod' && { stack: err.stack }),
      },
    }),
  };
};

/**
 * Create a not found error
 */
export const notFound = (message = 'Resource not found'): never => {
  throw new createHttpError.NotFound(message);
};

/**
 * Create a bad request error
 */
export const badRequest = (message = 'Bad request'): never => {
  throw new createHttpError.BadRequest(message);
};

/**
 * Create an unauthorized error
 */
export const unauthorized = (message = 'Unauthorized'): never => {
  throw new createHttpError.Unauthorized(message);
};

/**
 * Create a forbidden error
 */
export const forbidden = (message = 'Forbidden'): never => {
  throw new createHttpError.Forbidden(message);
};

/**
 * Create an internal server error
 */
export const internalServerError = (message = 'Internal server error'): never => {
  throw new createHttpError.InternalServerError(message);
};
