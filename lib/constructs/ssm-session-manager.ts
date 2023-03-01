import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface SsmSessionManagerProps {
  vpc: cdk.aws_ec2.IVpc;
}

export class SsmSessionManager extends Construct {
  readonly iamRole: cdk.aws_iam.IRole;

  constructor(scope: Construct, id: string, props: SsmSessionManagerProps) {
    super(scope, id);

    // IAM Role
    this.iamRole = new cdk.aws_iam.Role(this, "Iam Role", {
      assumedBy: new cdk.aws_iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AmazonSSMManagedInstanceCore"
        ),
      ],
    });

    // VPC Endpoint
    // SSM VPC
    new cdk.aws_ec2.InterfaceVpcEndpoint(this, "Ssm Vpc Endpoint", {
      vpc: props.vpc,
      service: cdk.aws_ec2.InterfaceVpcEndpointAwsService.SSM,
      subnets: props.vpc.selectSubnets({
        subnetGroupName: "Isolated",
      }),
    });

    // SSM MESSAGES
    new cdk.aws_ec2.InterfaceVpcEndpoint(this, "Ssm Messages Vpc Endpoint", {
      vpc: props.vpc,
      service: cdk.aws_ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: props.vpc.selectSubnets({
        subnetGroupName: "Isolated",
      }),
    });

    // EC2 MESSAGES
    new cdk.aws_ec2.InterfaceVpcEndpoint(this, "Ec2 Messages Vpc Endpoint", {
      vpc: props.vpc,
      service: cdk.aws_ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      subnets: props.vpc.selectSubnets({
        subnetGroupName: "Isolated",
      }),
    });
  }
}
