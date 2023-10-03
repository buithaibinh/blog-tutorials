import {
  AwsIntegration,
  Cors,
  MockIntegration,
  PassthroughBehavior,
  RestApi,
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

interface CreateRestApiProps {
  table: ITable;
  region: string;
}

const METHOD_OPTIONS = {
  methodResponses: [
    { statusCode: '200' },
    { statusCode: '400' },
    { statusCode: '500' },
  ],
};

function createPolicy(
  scope: Construct,
  table: ITable,
  operation: 'GetItem' | 'PutItem'
) {
  const policy = new Policy(scope, `${operation}Policy`, {
    statements: [
      new PolicyStatement({
        actions: [`dynamodb:${operation}`],
        effect: Effect.ALLOW,
        resources: [table.tableArn],
      }),
    ],
  });
  const role = new Role(scope, `${operation}Role`, {
    assumedBy: new ServicePrincipal('apigateway.amazonaws.com'),
  });
  role.attachInlinePolicy(policy);
  return role;
}

export function createRestApi(
  scope: Construct,
  { table, region }: CreateRestApiProps
): RestApi {
  const errorResponses = [
    {
      selectionPattern: '400',
      statusCode: '400',
      responseTemplates: {
        'application/json': JSON.stringify({
          error: 'Bad input!',
        }),
      },
    },
    {
      selectionPattern: '5\\d{2}',
      statusCode: '500',
      responseTemplates: {
        'application/json': JSON.stringify({
          error: 'Internal Service Error!',
        }),
      },
    },
  ];

  const integrationResponses = [
    {
      statusCode: '200',
    },
    ...errorResponses,
  ];

  const getIntegration = new AwsIntegration({
    action: 'GetItem',
    options: {
      credentialsRole: createPolicy(scope, table, 'GetItem'),
      integrationResponses,
      requestTemplates: {
        'application/json': JSON.stringify({
          Key: {
            pk: {
              S: '$method.request.path.pk',
            },
          },
          TableName: `${table.tableName}`,
        }),
      },
    },
    service: 'dynamodb',
  });

  const createIntegration = new AwsIntegration({
    action: 'PutItem',
    options: {
      credentialsRole: createPolicy(scope, table, 'PutItem'),
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': JSON.stringify({
              requestId: '$context.requestId',
            }),
          },
        },
        ...errorResponses,
      ],
      requestTemplates: {
        'application/json': JSON.stringify({
          Item: {
            pk: {
              S: '$context.requestId',
            },
            name: {
              S: "$input.path('$.name')",
            },
            region: {
              S: '$stageVariables.REGION',
            },
          },
          TableName: `${table.tableName}`,
        }),
      },
    },
    service: 'dynamodb',
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
    },
  });

  const { root } = api;

  const allResources = root.addResource('data');
  allResources.addMethod('POST', createIntegration, METHOD_OPTIONS);
  const oneResource = allResources.addResource('{pk}');
  oneResource.addMethod('GET', getIntegration, METHOD_OPTIONS);

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
