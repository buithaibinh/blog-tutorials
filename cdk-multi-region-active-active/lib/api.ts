import * as cdk from 'aws-cdk-lib';

import {
  Cors,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
  LogGroupLogDestination,
  AccessLogFormat,
  MethodLoggingLevel,
} from 'aws-cdk-lib/aws-apigateway';
import {
  Effect,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';

import { Construct } from 'constructs';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import * as logs from 'aws-cdk-lib/aws-logs';

interface CreateRestApiProps {
  region: string;
}

const METHOD_OPTIONS = {
  methodResponses: [
    { statusCode: '200' },
    { statusCode: '400' },
    { statusCode: '500' },
  ],
};

export function createRestApi(
  scope: Construct,
  { region }: CreateRestApiProps
): RestApi {
  const mockIntegration = new MockIntegration({
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      'application/json': JSON.stringify({ statusCode: 200 }),
    },
    integrationResponses: [
      {
        statusCode: '200',
        responseTemplates: {
          'application/json': JSON.stringify({
            requestId: '$context.requestId',
            region: '$stageVariables.REGION',
          }),
        },
      },
    ],
  });

  // log all requests to CloudWatch
  const apiGatewayLogGroup = new logs.LogGroup(scope, 'ApiGatewayLogGroup', {
    retention: logs.RetentionDays.ONE_MONTH,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  const api = new RestApi(scope, 'Api', {
    restApiName: 'GlobalApplicationApi',
    defaultCorsPreflightOptions: {
      allowOrigins: Cors.ALL_ORIGINS,
    },
    deployOptions: {
      variables: {
        REGION: region,
      },
      accessLogDestination: new LogGroupLogDestination(apiGatewayLogGroup),
      accessLogFormat: AccessLogFormat.jsonWithStandardFields(),
      loggingLevel: MethodLoggingLevel.INFO,
      dataTraceEnabled: true,
      metricsEnabled: true,
      tracingEnabled: true,
    },
    // TODO, Automatically configure an AWS CloudWatch role for API Gateway
    cloudWatchRole: false,
  });

  const { root } = api;

  // mock endpoint for testing
  const mock = root.addResource('mock');
  mock.addMethod('GET', mockIntegration, METHOD_OPTIONS);

  return api;
}

export function addHealthCheckEndpoint(api: RestApi) {
  const healthCheckIntegration = new MockIntegration({
    integrationResponses: [{ statusCode: '200' }],
    passthroughBehavior: PassthroughBehavior.NEVER,
    requestTemplates: {
      'application/json': JSON.stringify({ statusCode: 200 }),
    },
  });

  const health = api.root.addResource('health');
  health.addMethod('GET', healthCheckIntegration, METHOD_OPTIONS);
}
