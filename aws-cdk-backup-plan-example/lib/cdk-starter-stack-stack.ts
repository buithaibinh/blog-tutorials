import { Stack, StackProps, RemovalPolicy, Duration, Tags } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as backup from 'aws-cdk-lib/aws-backup';

export class CdkStarterStackStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Create dynamodb table. We will enable backup on this table by tagging it with the backup tag.
    const table = new dynamodb.Table(this, 'DynamoDBTable', {
      removalPolicy: RemovalPolicy.DESTROY,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // -----AWS Backup Plan-----
    // 1. Create a kms key for the backup vault
    const kmsKey = new kms.Key(this, 'KmsKey', {
      description: 'KMS Key for Backup Vault',
      removalPolicy: RemovalPolicy.DESTROY, // if you don't specify this, the key will be deleted when the stack is deleted
      enabled: true, // if you don't specify this, the key will be disabled
      enableKeyRotation: true,
      policy: new iam.PolicyDocument({
        statements: [
          new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: ['kms:*'],
            principals: [
              // Enable IAM Root Permissions
              new iam.AccountRootPrincipal(),
            ],
            resources: ['*'],
          }),
        ],
      }),
    });

    // 2. Create a backup vault with the kms key as the encryption key
    const backupVault = new backup.BackupVault(this, 'BackupVault', {
      encryptionKey: kmsKey,
      removalPolicy: RemovalPolicy.DESTROY,
      backupVaultName: 'BackupVaultWithDailyBackups',
    });

    // 3. Create a backup plan
    const backupPlan = new backup.BackupPlan(this, 'BackupPlan', {
      backupPlanName: 'BackupPlanWithDailyBackups',
    });

    // 4. Add a rule to the backup plan to backup the table every day at  5:00 am UTC
    backupPlan.addRule(
      new backup.BackupPlanRule({
        ruleName: 'RuleForDailyBackups',
        scheduleExpression: events.Schedule.expression('cron(0 5 ? * *)'), // Run daily at 5:00 am UTC
        backupVault: backupVault,
        deleteAfter: Duration.days(14), // Expire after 2 weeks
      })
    );

    // 5. add a backup selection to the backup plan
    backupPlan.addSelection('TagBasedBackupSelection', {
      backupSelectionName: 'TagBasedBackupSelection',
      resources: [
        // back up all resources tagged with stag=prod
        backup.BackupResource.fromTag(
          'stag',
          'prod',
          backup.TagOperation.STRING_EQUALS
        ),
        // back up all resources tagged with service=blog
        backup.BackupResource.fromTag(
          'service',
          'blog',
          backup.TagOperation.STRING_EQUALS
        ),
      ],
    });
    // ----- END AWS Backup Plan -----

    // from now on, all resources tagged with stag=prod and service=blog will be backed up to the backup vault
    Tags.of(table).add('stag', 'prod');
    Tags.of(table).add('service', 'blog');
  }
}
