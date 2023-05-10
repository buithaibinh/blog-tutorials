import { Stage } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class AppStage extends Stage {
  constructor(scope: Construct, id: string) {
    super(scope, id);
  }
}
