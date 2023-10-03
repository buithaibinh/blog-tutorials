import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb';
import {
  DomainName,
  RestApi,
  SecurityPolicy,
} from 'aws-cdk-lib/aws-apigateway';
import {
  ARecord,
  CfnHealthCheck,
  CfnRecordSet,
  CfnRecordSetGroup,
  HostedZone,
  RecordTarget,
} from 'aws-cdk-lib/aws-route53';
import { ApiGatewayDomain } from 'aws-cdk-lib/aws-route53-targets';

import * as acm from 'aws-cdk-lib/aws-certificatemanager';

import { addHealthCheckEndpoint, createRestApi } from './api';

interface AddApiGateWayDomainNameProps {
  region: string;
  domainName: string;
  restApi: RestApi;
  hostedZoneId: string;
}

interface CreateTableProps {
  region: REGION;
  tableName: string;
  replicationRegions: string[];
}

// Regions are limited because of the APIGW Health Check: https://docs.aws.amazon.com/Route53/latest/APIReference/API_HealthCheckConfig.html
// I'm not sure if the documentation is outdated, because it worked for eu-central-1 in some tests
type REGION =
  | 'us-east-1'
  | 'us-west-1'
  | 'us-west-2'
  | 'eu-west-1'
  | 'ap-southeast-1'
  | 'ap-southeast-2'
  | 'ap-northeast-1'
  | 'sa-east-1';

const MAIN_REGION: REGION = 'us-east-1';
// Add all the regions that you want DynamoDB to replicate to, but note that each replication makes the deployment take longer.
const SECONDARY_REGIONS: REGION[] = [];

const getTableSuffix = () => {
  if (process.env.STAGE_NAME) {
    return `-${process.env.STAGE_NAME}`;
  } else {
    return '';
  }
};

export class CdkMultiRegionActiveActiveStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: cdk.StackProps & {
      hostedZoneId: string;
      domainName: string;
    }
  ) {
    super(scope, id, props);

    if (!props.env?.region) {
      throw Error(
        'Could not resolve region. Please pass it with the AWS_REGION environment variable.'
      );
    }
    if (!props.hostedZoneId) {
      throw Error(
        'Could not resolve hostedZoneId. Please pass it with the HOSTED_ZONE_ID environment variable.'
      );
    }
    if (!props.domainName) {
      throw Error(
        'Could not resolve domainName. Please pass it with the DOMAIN_NAME environment variable.'
      );
    }

    const { hostedZoneId, domainName } = props;
    const region: REGION = props.env.region as REGION;

    const table = this.createTable({
      region,
      tableName: `GlobalApplicationTable${getTableSuffix()}`,
      replicationRegions: SECONDARY_REGIONS,
    });

    const restApi = createRestApi(this, { table, region });
    addHealthCheckEndpoint(restApi);

    this.addApiGateWayDomainName({ domainName, restApi, hostedZoneId, region });
  }

  private createTable({
    tableName,
    replicationRegions,
    region,
  }: CreateTableProps) {
    if (region === MAIN_REGION) {
      return new Table(this, 'Table', {
        tableName,
        billingMode: BillingMode.PAY_PER_REQUEST,
        partitionKey: {
          name: 'pk',
          type: AttributeType.STRING,
        },
        replicationRegions,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      });
    } else {
      return Table.fromTableName(this, 'Table', tableName);
    }
  }

  private addApiGateWayDomainName({
    domainName,
    restApi,
    hostedZoneId,
    region,
  }: AddApiGateWayDomainNameProps) {
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId,
      zoneName: domainName,
    });

    // Certificate names must be globally unique
    const certificate = new acm.Certificate(this, `${region}Certificate`, {
      domainName,
      validation: acm.CertificateValidation.fromDns(hostedZone),
    });

    const apigwDomainName = new DomainName(this, `${region}DomainName`, {
      domainName,
      certificate,
      securityPolicy: SecurityPolicy.TLS_1_2,
    });
    // We need to call addBasePathMapping, so that the custom domain gets connected with our rest api
    apigwDomainName.addBasePathMapping(restApi);

    const executeApiDomainName = cdk.Fn.join('.', [
      restApi.restApiId,
      'execute-api',
      region,
      cdk.Fn.ref('AWS::URLSuffix'),
    ]);
    const healthCheck = new CfnHealthCheck(this, `${region}HealthCheck`, {
      healthCheckConfig: {
        type: 'HTTPS',
        fullyQualifiedDomainName: executeApiDomainName,
        port: 443,
        requestInterval: 30,
        resourcePath: `/${restApi.deploymentStage.stageName}/health`,
      },
    });

    const dnsRecord = new ARecord(this, `${region}`, {
      zone: hostedZone,
      target: RecordTarget.fromAlias(new ApiGatewayDomain(apigwDomainName)),
    });
    const recordSet = dnsRecord.node.defaultChild as CfnRecordSet;
    recordSet.region = region;
    recordSet.healthCheckId = healthCheck.attrHealthCheckId;
    recordSet.setIdentifier = `${region}Api`;
    // Warning: This does not yet evaluate the health of the target, and I don't feel like understand what that means exactly.
    // CfnRecordSet has a aliasTarget where we can set evaluateTargetHealth to true, but the docs are sparse on what data dnsName requires.
  }
}
