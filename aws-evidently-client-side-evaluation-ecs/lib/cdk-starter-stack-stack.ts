import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as appconfig from 'aws-cdk-lib/aws-appconfig';
import * as evidently from 'aws-cdk-lib/aws-evidently';
import * as iam from 'aws-cdk-lib/aws-iam';

import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns';
import * as path from 'path';

const OLD_SEARCH_BAR = 'oldSearchBar';
const NEW_SEARCH_BAR = 'fancyNewSearchBar';
const AWS_REGION: string = process.env.CDK_DEFAULT_REGION || '';
const AWS_ACCOUNT: string = process.env.CDK_DEFAULT_ACCOUNT || '';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create AppConfig resources
    const application = new appconfig.CfnApplication(
      this,
      'AppConfigApplication',
      {
        name: 'MyApplication'
      }
    );

    const environment = new appconfig.CfnEnvironment(
      this,
      'AppConfigEnvironment',
      {
        applicationId: application.ref,
        name: 'MyEnvironment'
      }
    );

    // Create Evidently resources
    const project = new evidently.CfnProject(this, 'EvidentlyProject', {
      name: 'WebPage',
      appConfigResource: {
        applicationId: application.ref,
        environmentId: environment.ref
      }
    });

    const feature = new evidently.CfnFeature(this, 'EvidentlyFeature', {
      project: project.name,
      name: 'SearchBar',
      variations: [
        {
          booleanValue: false,
          variationName: OLD_SEARCH_BAR
        },
        {
          booleanValue: true,
          variationName: NEW_SEARCH_BAR
        }
      ]
    });
    feature.addDependency(project);

    const launch = new evidently.CfnLaunch(this, 'EvidentlyLaunch', {
      project: project.name,
      name: 'MyLaunch',
      executionStatus: {
        status: 'START'
      },
      groups: [
        {
          feature: feature.name,
          variation: OLD_SEARCH_BAR,
          groupName: OLD_SEARCH_BAR
        },
        {
          feature: feature.name,
          variation: NEW_SEARCH_BAR,
          groupName: NEW_SEARCH_BAR
        }
      ],
      scheduledSplitsConfig: [
        {
          // This must be a timestamp. Choosing a start time in the past with status START will start the launch immediately:
          // https://docs.aws.amazon.com/cloudwatchevidently/latest/APIReference/API_ScheduledSplitConfig.html#cloudwatchevidently-Type-ScheduledSplitConfig-startTime
          startTime: '2021-01-01T00:00:00Z',
          groupWeights: [
            {
              groupName: OLD_SEARCH_BAR,
              splitWeight: 90000
            },
            {
              groupName: NEW_SEARCH_BAR,
              splitWeight: 10000
            }
          ]
        }
      ]
    });
    launch.addDependency(feature);

    // Create ECS resources
    const vpc = new ec2.Vpc(this, 'Vpc', { maxAzs: 2 });
    const cluster = new ecs.Cluster(this, 'Cluster', { vpc });

    // Instantiate Fargate Service with a cluster and a local image that gets
    // uploaded to an S3 staging bucket prior to being uploaded to ECR.
    // A new repository is created in ECR and the Fargate service is created
    // with the image from ECR.
    // Create a Task Definition for the Windows container to start
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      // TODO: because my laptop is M1, I need to specify ARM64. If you are using an x86_64 machine, you can remove this line
      runtimePlatform: {
        cpuArchitecture: ecs.CpuArchitecture.X86_64,
        operatingSystemFamily: ecs.OperatingSystemFamily.LINUX
      },
      cpu: 256,
      memoryLimitMiB: 512
    });

    // Add a container to the task
    taskDefinition.addContainer('AppContainer', {
      image: ecs.ContainerImage.fromAsset(path.join(__dirname, 'local-image')),
      environment: {
        DEPLOYMENT_TIME: new Date().getTime().toString()
      },
      portMappings: [
        {
          containerPort: 80,
          hostPort: 80
        }
      ]
    });

    const service = new ecsPatterns.ApplicationLoadBalancedFargateService(
      this,
      'FargateService',
      {
        cluster,
        taskDefinition
      }
    );

    const configuration = `applications/${application.ref}/environments/${environment.ref}/configurations/${project.name}`;
    service.taskDefinition.addContainer('AppConfigAgent', {
      // appconfig agent image arm
      image: ecs.ContainerImage.fromRegistry(
        'public.ecr.aws/aws-appconfig/aws-appconfig-agent:2.x'
      ),
      portMappings: [
        {
          containerPort: 2772
        }
      ],
      environment: {
        EVIDENTLY_CONFIGURATIONS: configuration,
        PREFETCH_LIST: configuration
      }
    });

    service.taskDefinition.taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: [
          'appconfig:StartConfigurationSession',
          'appconfig:GetLatestConfiguration'
        ],
        effect: iam.Effect.ALLOW,
        resources: [
          `arn:aws:appconfig:${AWS_REGION}:${AWS_ACCOUNT}:application/${application.ref}/environment/${environment.ref}/configuration/*`
        ]
      })
    );
    service.taskDefinition.taskRole.addToPrincipalPolicy(
      new iam.PolicyStatement({
        actions: ['evidently:PutProjectEvents'],
        effect: iam.Effect.ALLOW,
        resources: [
          `arn:aws:evidently:${AWS_REGION}:${AWS_ACCOUNT}:project/${project.name}`
        ]
      })
    );
  }
}
