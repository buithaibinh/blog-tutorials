import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const restApi = new apigateway.RestApi(this, 'RestApiNonProxy', {
      restApiName: 'RestApiNonProxy',
      deployOptions: {
        stageName: 'dev'
      }
    });

    const fn = new NodejsFunction(this, 'SampleFn', {
      entry: path.join(__dirname, 'lambda', 'index.mjs'),
      handler: 'handler'
    });

    const integration = new apigateway.LambdaIntegration(fn, {
      proxy: false, // default is true, set to false to use the LambdaIntegration
      // Ok, now we need to set the request template to use the LambdaIntegration
      requestTemplates: {
        'application/json': `
          {
            "name": "$input.params('name')",
            "errorCode": "$input.params('errorCode')",
            "sourceIp": "$context.identity.sourceIp"
          }
        `
      },

      // https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-mapping-template-reference.html#util-template-reference
      integrationResponses: [
        {
          statusCode: '200',
          responseTemplates: {
            'application/json': `
            #set($inputRoot = $input.path('$'))
            #set($data = $inputRoot.data)
            {
              "message": "$input.path('$.errorMessage')",
              "sourceIp": "$context.identity.sourceIp"
            }
            `
          }
        }
      ],
      passthroughBehavior: apigateway.PassthroughBehavior.WHEN_NO_MATCH
    });

    const resource = restApi.root.addResource('hello');
    resource.addMethod('GET', integration, {
      methodResponses: [
        {
          statusCode: '200'
        }
      ]
    });
  }
}
