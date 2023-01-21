import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  return {
    body: JSON.stringify({ message: 'Hello from Lambda!' }),
    statusCode: 200,
    isBase64Encoded: false,
    headers: {
      'Content-Type': 'application/json',

      // 👇 allow CORS for all origins
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':
        'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,PUT,POST,DELETE'
    }
  };
}
