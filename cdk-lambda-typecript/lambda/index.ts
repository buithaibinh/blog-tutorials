import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  // this response will be returned to the API Gateway
  // it support both rest api and http api
  return {
    body: JSON.stringify({ message: 'Hello from Lambda!' }),
    statusCode: 200,
    isBase64Encoded: false,
    headers: {
      'Content-Type': 'application/json',
    },
  };
}
