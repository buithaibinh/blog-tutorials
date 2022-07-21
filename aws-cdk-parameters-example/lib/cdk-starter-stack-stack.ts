import {
  Stack,
  StackProps,
  CfnParameter,
  RemovalPolicy,
  CfnOutput,
  Fn
} from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // parameter of type String
    const applicationPrefix = new CfnParameter(this, 'prefix', {
      default: 'sample',
      description: 'parameter of type String',
      type: 'String',
      allowedPattern: '^[a-z0-9]*$', // allowed pattern for the parameter
      minLength: 3, // minimum length of the parameter
      maxLength: 20, // maximum length of the parameter
    }).valueAsString; // get the value of the parameter as string

    console.log('application Prefix 👉', applicationPrefix);

    // parameter of type Number
    const applicationPort = new CfnParameter(this, 'port', {
      description: 'parameter of type Number',
      type: 'Number',
      minValue: 1, // minimum value of the parameter
      maxValue: 65535, // maximum value of the parameter
      allowedValues: ['8080', '8081'], // allowed values of the parameter
    }).valueAsNumber; // get the value of the parameter as number

    console.log('application Port 👉', applicationPort);

    // parameter of type CommaDelimitedList
    const applicationDomains = new CfnParameter(this, 'domains', {
      description: 'parameter of type CommaDelimitedList',
      type: 'CommaDelimitedList',
    }).valueAsList; // get the value of the parameter as list of strings

    console.log('application Domains 👉', applicationDomains);

    // Exporting Token values as Outputs
    new CfnOutput(this, 'applicationPrefix', {
      value: applicationPrefix,
    });

    new CfnOutput(this, 'applicationPort', {
      value: applicationPort.toString(),
    });

    new CfnOutput(this, 'applicationDomains', {
      value: Fn.join(',', applicationDomains), // join the list of strings with comma
    });
  }
}
