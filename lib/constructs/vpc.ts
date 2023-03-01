import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface VpcProps {}

export class Vpc extends Construct {
  readonly vpc: cdk.aws_ec2.IVpc;

  constructor(scope: Construct, id: string, props?: VpcProps) {
    super(scope, id);

    this.vpc = new cdk.aws_ec2.Vpc(this, "Default", {
      ipAddresses: cdk.aws_ec2.IpAddresses.cidr("10.1.1.0/24"),
      enableDnsHostnames: true,
      enableDnsSupport: true,
      natGateways: 1,
      maxAzs: 1,
      subnetConfiguration: [
        {
          name: "Public",
          subnetType: cdk.aws_ec2.SubnetType.PUBLIC,
          cidrMask: 27,
          mapPublicIpOnLaunch: false,
        },
        {
          name: "Egress",
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 27,
        },
        {
          name: "Isolated",
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_ISOLATED,
          cidrMask: 27,
        },
        {
          name: "Firewall",
          subnetType: cdk.aws_ec2.SubnetType.PRIVATE_WITH_EGRESS,
          cidrMask: 28,
        },
      ],
    });
  }
}
