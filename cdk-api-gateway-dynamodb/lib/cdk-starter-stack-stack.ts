import { Stack, StackProps, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";

import { errorResponses, methodOptions } from "./utils";

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    console.log("Hello from CDK!");

    // The first thing we'll do is create a table
    const postTable = new dynamodb.Table(this, "PostTable", {
      partitionKey: {
        name: "id",
        type: dynamodb.AttributeType.STRING,
      },
      removalPolicy: RemovalPolicy.DESTROY,
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // create a role for all interactions with the table.
    // this is for demo purposes only. in a real app, you'd want to use a role that has permissions for all operations
    const role = new iam.Role(this, "ApiGatewayRole", {
      assumedBy: new iam.ServicePrincipal("apigateway.amazonaws.com"),
    });
    postTable.grantReadWriteData(role);

    // Defining the APIs
    const api = new apigateway.RestApi(this, "api-gateway-dynamodb", {
      description: "Demo API Gateway with DynamoDB",
      // This will automatically set up OPTIONS responses for all your endpoints.
      defaultCorsPreflightOptions: {
        // allow all origins,
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
      },
    });

    const modelResource = api.root.addResource("posts");
    const postResource = modelResource.addResource("{id}");

    // Get post by id
    postResource.addMethod(
      "GET",
      new apigateway.AwsIntegration({
        service: "dynamodb",
        action: "GetItem",
        options: {
          credentialsRole: role,
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: {
                "application/json": `
                #set($inputRoot = $input.path('$.Item'))
                {
                  "id": "$inputRoot.id.S",
                  "title": "$inputRoot.title.S",
                  "body": "$inputRoot.body.S",
                }
                `,
              },
            },
            ...errorResponses,
          ],
          requestTemplates: {
            "application/json": `{
              "TableName": "${postTable.tableName}",
              "Key": {
                "id": {
                  "S": "$input.params('id')"
                }
              }
            }`,
          },
        },
      }),
      methodOptions
    );

    // Create post
    modelResource.addMethod(
      "POST",
      new apigateway.AwsIntegration({
        service: "dynamodb",
        action: "PutItem",
        options: {
          credentialsRole: role,
          integrationResponses: [
            {
              statusCode: "200",
              responseTemplates: {
                "application/json": `
                {
                  "status": "OK"
                }`,
              },
            },
            ...errorResponses,
          ],
          requestTemplates: {
            "application/json": `
            #set($inputRoot = $input.path('$'))
            {
              "TableName": "${postTable.tableName}",
              "Item": {
                "id": {
                  "S": "$inputRoot.id"
                },
                "title": {
                  "S": "$inputRoot.title"
                },
                "body": {
                  "S": "$inputRoot.body"
                }
              },
              "ConditionExpression": "attribute_not_exists(id)"
            }`,
          },
        },
      }),
      methodOptions
    );
  }
}
