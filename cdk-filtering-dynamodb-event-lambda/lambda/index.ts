import { DynamoDBStreamEvent } from 'aws-lambda';
export async function main(event: DynamoDBStreamEvent) {
  console.log(JSON.stringify(event, null, 2));
  return {
    statusCode: 200,
    body: JSON.stringify(event),
  };
}
