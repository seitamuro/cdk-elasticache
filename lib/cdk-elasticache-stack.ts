import * as cdk from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as elasticache from "aws-cdk-lib/aws-elasticache";
import { Construct } from "constructs";

export class CdkElasticacheStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "VPC", {
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "Public",
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          cidrMask: 24,
          name: "Private",
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
      ],
    });

    const subnetGroup = new elasticache.CfnSubnetGroup(this, "SubnetGroup", {
      cacheSubnetGroupName: "subnet-group",
      subnetIds: vpc.privateSubnets.map((subnet) => subnet.subnetId),
      description: "Subnet group for ElastiCache",
    });

    const redis = new elasticache.CfnReplicationGroup(this, "Redis", {
      engine: "redis",
      cacheNodeType: "cache.t3.micro",
      engineVersion: "6.2",
      replicasPerNodeGroup: 1,
      numNodeGroups: 1,
      replicationGroupDescription: "Redis Replication Group",
      cacheSubnetGroupName: subnetGroup.cacheSubnetGroupName,
      multiAzEnabled: true,
    });
    redis.addDependency(subnetGroup);
  }
}
