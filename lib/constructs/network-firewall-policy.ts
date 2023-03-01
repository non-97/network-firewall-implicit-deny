import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface NetworkFirewallPolicyProps {
  statefulRuleGroupReferences: {
    Priority: number;
    ResourceArn: string;
  }[];
}

export class NetworkFirewallPolicy extends Construct {
  readonly firewallPolicy: cdk.aws_networkfirewall.CfnFirewallPolicy;

  constructor(
    scope: Construct,
    id: string,
    props?: NetworkFirewallPolicyProps
  ) {
    super(scope, id);

    // Network Firewall policy
    this.firewallPolicy = new cdk.aws_networkfirewall.CfnFirewallPolicy(
      this,
      "Default",
      {
        firewallPolicyName: "network-firewall-policy",
        firewallPolicy: {
          statelessDefaultActions: ["aws:forward_to_sfe"],
          statelessFragmentDefaultActions: ["aws:forward_to_sfe"],
          statefulDefaultActions: ["aws:drop_established"],
          statefulEngineOptions: {
            ruleOrder: "STRICT_ORDER",
          },
        },
      }
    );

    if (typeof props?.statefulRuleGroupReferences === undefined) {
      return;
    }

    this.firewallPolicy.addPropertyOverride(
      "FirewallPolicy.StatefulRuleGroupReferences",
      props?.statefulRuleGroupReferences
    );
  }
}
