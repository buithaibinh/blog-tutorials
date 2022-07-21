import { Stack, StackProps, CfnOutput } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as path from "path";

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const fn = new lambda.Function(this, "TestContainerFunction", {
      code: lambda.Code.fromAssetImage(path.join(__dirname, "..", "lambda"), {
        exclude: ["cdk.out"],
      }),
      handler: lambda.Handler.FROM_IMAGE,
      runtime: lambda.Runtime.FROM_IMAGE,
      architecture: lambda.Architecture.ARM_64,
    });

    const fnUrl = fn.addFunctionUrl({
      authType: lambda.FunctionUrlAuthType.NONE,
      cors: {
        // Allow this to be called from websites on https://example.com.
        // Can also be ['*'] to allow all domain.
        allowedOrigins: ["https://example.com"],
      },
    });

    // outputs the url of the function
    new CfnOutput(this, "TestContainerFunctionURL", {
      value: fnUrl.url,
    });
  }
}
