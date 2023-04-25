import { StackProps, Duration, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import {
  RestApi,
  LogGroupLogDestination,
  AccessLogFormat,
  MethodLoggingLevel,
  ApiKey,
  Integration,
  RequestValidator,
  IntegrationType,
  PassthroughBehavior,
  JsonSchema,
  JsonSchemaType,
  Cors,
  AwsIntegration,
  Model
} from 'aws-cdk-lib/aws-apigateway';

import * as logs from 'aws-cdk-lib/aws-logs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

export interface RestApiServiceProps extends StackProps {
  linkTable: dynamodb.Table;
  ampDomain?: string;
}

// Validation models, schema
const PutBody: JsonSchema = {
  type: JsonSchemaType.OBJECT,
  required: ['id', 'url'],
  properties: {
    id: {
      type: JsonSchemaType.STRING,
      minLength: 1
    },
    url: {
      type: JsonSchemaType.STRING,
      pattern:
        '^https?://[-a-zA-Z0-9@:%._\\+~#=]{2,256}\\.[a-z]{2,6}\\b([-a-zA-Z0-9@:%_\\+.~#?&//=]*)'
    }
  }
};

export class RestApiService extends Construct {
  constructor(scope: Construct, id: string, props: RestApiServiceProps) {
    super(scope, id);

    const { linkTable } = props;
    const DDBCrudRole = new iam.Role(this, 'DDBCrudRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
    });
    linkTable.grantReadWriteData(DDBCrudRole);

    const DDBReadRole = new iam.Role(this, 'DDBReadRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com')
    });
    linkTable.grantReadData(DDBReadRole);

    // Create a new API Gateway REST API
    const logGroup = new logs.LogGroup(this, 'ApiGatewayLogGroup', {
      logGroupName: '/aws/apigateway/url-shortener-api', // 👈 name the log group
      removalPolicy: RemovalPolicy.DESTROY, // NOT recommended for production code
      retention: logs.RetentionDays.ONE_MONTH // NOT recommended for production code
    });

    // rest api
    const restApi = new RestApi(this, 'RestApi', {
      description: 'URL Shortener API',
      deployOptions: {
        stageName: 'dev',
        accessLogDestination: new LogGroupLogDestination(logGroup), // 👈 enable access logging
        // See https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-logging.html#apigateway-cloudwatch-log-formats
        accessLogFormat: AccessLogFormat.custom(
          JSON.stringify({
            'authorizer.claims.sub': '$context.authorizer.claims.sub',
            'error.message': '$context.error.message',
            extendedRequestId: '$context.extendedRequestId',
            httpMethod: '$context.httpMethod',
            'identity.sourceIp': '$context.identity.sourceIp',
            'integration.error': '$context.integration.error',
            'integration.integrationStatus':
              '$context.integration.integrationStatus',
            'integration.latency': '$context.integration.latency',
            'integration.requestId': '$context.integration.requestId',
            'integration.status': '$context.integration.status',
            path: '$context.path',
            requestId: '$context.requestId',
            responseLatency: '$context.responseLatency',
            responseLength: '$context.responseLength',
            stage: '$context.stage',
            status: '$context.status'
          })
        ),
        loggingLevel: MethodLoggingLevel.INFO // 👈 enable execution logging
      }
    });

    // app resources
    const appResources = restApi.root.addResource('app');

    // Create a new link method
    appResources.addMethod(
      'POST',
      new AwsIntegration({
        service: 'dynamodb',
        action: 'UpdateItem',
        options: {
          credentialsRole: DDBCrudRole,
          passthroughBehavior: PassthroughBehavior.WHEN_NO_TEMPLATES,
          integrationResponses: [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': "'*'"
              },
              responseTemplates: {
                'application/json': `
                {
                  "status": "OK"
                }`
              }
            }
          ],
          requestTemplates: {
            'application/json': `
            #set($inputRoot = $input.path('$'))
            {
              "TableName": "${linkTable.tableName}",
              "ConditionExpression": "attribute_not_exists(id)",
              "Key": {
                "id": {
                  "S": "$inputRoot.id"
                }
              },
              "ExpressionAttributeNames": {
                "#u": "url",
                "#o": "owner",
                "#ts": "timestamp"
              },
              "ExpressionAttributeValues": {
                ":u": {
                  "S": "$inputRoot.url"
                },
                ":o": {
                  "S": "$context.authorizer.claims.email"
                },
                ":ts": {
                  "S": "$context.requestTime"
                }
              },
              "UpdateExpression": "SET #u = :u, #o = :o, #ts = :ts",
              "ReturnValues": "ALL_NEW"
            }`
          }
        }
      }),
      {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true
            }
          }
        ]
      }
    );
  }
}
