import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { Vpc } from "./constructs/vpc";
import { SsmSessionManager } from "./constructs/ssm-session-manager";
import { Ec2Instance } from "./constructs/ec2-instance";
import { NetworkFirewall } from "./constructs/network-firewall";

export class NetworkFirewallStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // VPC
    const vpc = new Vpc(this, "Vpc");

    // SSM
    const ssmSessionManager = new SsmSessionManager(
      this,
      "Ssm Session Manager",
      {
        vpc: vpc.vpc,
      }
    );

    // EC2 Instance
    new Ec2Instance(this, "Ec2 Instance A", {
      vpc: vpc.vpc,
      iamRole: ssmSessionManager.iamRole,
    });

    // Network Firewall
    new NetworkFirewall(this, "Network Firewall", {
      vpc: vpc.vpc,
    });
  }
}
