import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export async function main(
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> {
  const requestContext: any = event.requestContext || {};
  const {
    authorizer: { iam },
  } = requestContext;

  return {
    body: JSON.stringify(iam),
    statusCode: 200,
    isBase64Encoded: false,
    headers: {
      'Content-Type': 'application/json',
    },
  };
}
