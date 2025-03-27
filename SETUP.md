# DataShop API - Setup Guide

This guide walks you through the structure of this serverless project and how to deploy it.

## Project Structure

```
datashop-api/
├── .env                      # Environment variables for local development
├── .gitignore                # Git ignore file
├── package.json              # Node.js dependencies and scripts
├── serverless.yml            # Serverless Framework configuration
├── tsconfig.json             # TypeScript configuration
├── webpack.config.js         # Webpack configuration for bundling
└── src/                      # Source code
    ├── handlers/             # Lambda function handlers
    │   ├── nodes/            # Node-related handlers
    │   │   ├── create.ts     # Create node handler
    │   │   ├── get.ts        # Get node handler
    │   │   ├── update.ts     # Update node handler
    │   │   ├── delete.ts     # Delete node handler
    │   │   └── list.ts       # List nodes handler
    │   ├── edges/            # Edge-related handlers
    │   │   ├── create.ts     # Create edge handler
    │   │   ├── get.ts        # Get edge handler
    │   │   ├── list.ts       # List edges handler
    │   │   └── delete.ts     # Delete edge handler
    │   └── outputs/          # Output-related handlers
    │       └── get.ts        # Get output handler
    ├── models/               # Data models
    │   ├── Node.ts           # Node model
    │   └── Edge.ts           # Edge model
    └── utils/                # Utility functions
        ├── api.ts            # API response utilities
        └── dynamodb.ts       # DynamoDB utilities
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Deploy to AWS:
   ```bash
   # For development
   npm run deploy
   
   # For production
   npm run deploy:prod
   ```

3. Start locally for development:
   ```bash
   npm run dev
   ```

## Complete the Project

This repository contains the core structure of the DataShop API. To complete the implementation, you'll need to:

1. Implement the remaining handlers in `src/handlers/` (update, delete, list)
2. Add validation for all inputs
3. Enhance the output processors with more complex graph traversal
4. Add authentication and authorization
5. Implement comprehensive error handling
6. Add unit and integration tests
7. Set up CI/CD workflows

## Connecting to Serverless Cloud

To connect your repository to a serverless deployment service:

1. Make sure you have AWS credentials configured
   ```bash
   aws configure
   ```

2. Deploy using the Serverless Framework
   ```bash
   serverless deploy --stage dev --region us-east-1
   ```

3. For automatic deployments, consider setting up:
   - GitHub Actions
   - AWS CodePipeline
   - Serverless Dashboard (https://www.serverless.com/dashboard/)

## Additional Resources

- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/welcome.html)
- [DynamoDB Documentation](https://docs.aws.amazon.com/dynamodb/latest/developerguide/Introduction.html)
