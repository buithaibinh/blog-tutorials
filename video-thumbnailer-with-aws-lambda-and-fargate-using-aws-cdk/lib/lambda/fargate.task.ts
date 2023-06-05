import {
  ECSClient,
  RunTaskCommand,
  RunTaskCommandInput
} from '@aws-sdk/client-ecs';

const client = new ECSClient({ region: process.env.AWS_REGION || 'us-east-1' });

export interface FargateTaskProps {
  overrides?: RunTaskCommandInput['overrides'];
}

export class FargateTask {
  private taskDefinition: string;
  private cluster?: RunTaskCommandInput['cluster'];
  private networkConfiguration?: RunTaskCommandInput['networkConfiguration'];

  constructor({
    taskDefinition,
    cluster,
    networkConfiguration
  }: {
    taskDefinition: string;
    cluster?: RunTaskCommandInput['cluster'];
    networkConfiguration?: RunTaskCommandInput['networkConfiguration'];
  }) {
    this.taskDefinition = taskDefinition;
    this.cluster = cluster;
    this.networkConfiguration = networkConfiguration;
  }

  async run(props: FargateTaskProps) {
    const command = new RunTaskCommand({
      cluster: this.cluster,
      taskDefinition: this.taskDefinition,
      networkConfiguration: this.networkConfiguration,
      launchType: 'FARGATE',
      overrides: props.overrides
    });
    try {
      const data = await client.send(command);
      console.log('Started Fargate task', data);
    } catch (err) {
      console.log('Start task failedÔ', err);
    }
  }
}
