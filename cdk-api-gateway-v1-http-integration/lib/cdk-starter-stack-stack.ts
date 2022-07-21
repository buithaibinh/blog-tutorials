import * as cdk from "aws-cdk-lib";

import { EndpointType } from "aws-cdk-lib/aws-apigateway";

import { Proxy } from "./proxy";

export class CdkStarterStackStack extends cdk.Stack {
  constructor(app: cdk.App, id: string, props?: cdk.StackProps) {
    super(app, id, props);

    const proxy = new Proxy(this, "Proxy", {
      apiName: "HttpProxy",
      endpointType: EndpointType.EDGE,
    });

    proxy.addProxy("blog", "https://www.codewithyou.com");
  }
}
