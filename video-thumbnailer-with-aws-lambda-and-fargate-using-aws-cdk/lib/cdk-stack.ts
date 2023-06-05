import * as cdk from 'aws-cdk-lib';

import { aws_ecr_assets as assets } from 'aws-cdk-lib';

import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';

import * as path from 'path';

export class VideoThumbnailerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // A simple cluster to run our tasks in. We will import default VPC and use default cluster.
    // You can also create your own VPC and/or cluster.
    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc: ec2.Vpc.fromLookup(this, 'VPC', { isDefault: true })
    });

    // A bucket to store videos and thumbnails.
    const bucket = new s3.Bucket(this, 'Bucket', {
      // following settings for demo purposes only. DON'T USE IN PRODUCTION!
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    // a task role that allows the task to access the bucket
    const taskRole = new iam.Role(this, 'TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      description: 'Allows the task to access the bucket'
    });
    bucket.grantReadWrite(taskRole);

    // A task definition that will run FFMPEG on Fargate
    const taskDefinition = new ecs.FargateTaskDefinition(this, 'TaskDef', {
      memoryLimitMiB: 512,
      cpu: 256,
      taskRole: taskRole,
      family: 'video-thumbnailer'
    });

    // Add FFMPEG container to the task definition
    const ffmpegContainer = taskDefinition.addContainer('ffmpeg', {
      image: ecs.ContainerImage.fromAsset(
        path.join(__dirname, './worker-docker-ffmpeg-thumb'),
        {
          file: 'Dockerfile',
          // because jrottenberg/ffmpeg doesn't support ARM64, we need to use X86_64
          platform: assets.Platform.LINUX_AMD64 // <--- this is the important part
        }
      ),
      logging: new ecs.AwsLogDriver({
        streamPrefix: 'ffmpeg',
        logRetention: logs.RetentionDays.ONE_WEEK
      })
    });

    // === lambda ===
    // A lambda function that will be triggered by S3 object creation event
    const onNewVideoFn = new NodejsFunction(this, 'OnNewVideoLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, './lambda/index.ts'),
      handler: 'onNewVideoHandler',
      architecture: lambda.Architecture.ARM_64,
      description: 'A lambda function that triggers on new video upload',
      environment: {
        FARGATE_TASK_DEFINITION: taskDefinition.taskDefinitionArn,
        FARGATE_CONTAINER_NAME: ffmpegContainer.containerName,
        FARGATE_CLUSTER: cluster.clusterName,
        FARGATE_SUBNET_IDS: cluster.vpc.publicSubnets
          .map((s) => s.subnetId)
          .join(',')
      }
    });
    // set permissions to allow lambda to run the task
    taskDefinition.grantRun(onNewVideoFn);

    // trigger lambda on new video upload
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(onNewVideoFn),
      { suffix: '.mp4' }
    );

    // a lambda function triggers on new thumbnail created and uploaded to the bucket
    const onNewThumbnailFn = new NodejsFunction(this, 'OnNewThumbnailLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, './lambda/index.ts'),
      handler: 'onNewThumbnailHandler',
      architecture: lambda.Architecture.ARM_64,
      description: 'A lambda function that triggers on new thumbnail upload',
    });

    // allow lambda to read from the bucket
    bucket.grantRead(onNewThumbnailFn);

    // trigger lambda on new thumbnail upload
    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.LambdaDestination(onNewThumbnailFn),
      {
        suffix: '.jpg'
      }
    );

    // === outputs ===
    new cdk.CfnOutput(this, 'BucketName', {
      value: bucket.bucketName
    });
  }
}
