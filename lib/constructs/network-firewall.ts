import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NetworkFirewallRuleGroup5Tuple } from "./network-firewall-rule-group-5-tuple";
import { NetworkFirewallRuleGroupDomainList } from "./network-firewall-rule-group-domain-list";
import { NetworkFirewallRuleGroupSuricata } from "./network-firewall-rule-group-suricata";
import { NetworkFirewallPolicy } from "./network-firewall-policy";
import { NetworkFirewallLogs } from "./network-firewall-logs";
import { NetworkFirewallRouting } from "./network-firewall-routing";

export interface NetworkFirewallProps {
  vpc: cdk.aws_ec2.IVpc;
}

export class NetworkFirewall extends Construct {
  constructor(scope: Construct, id: string, props: NetworkFirewallProps) {
    super(scope, id);

    // Network Firewall rule group
    // 5-Tuple
    const networkFirewallRuleGroup5Tuple = new NetworkFirewallRuleGroup5Tuple(
      this,
      "Network Firewall Rule Group 5-Tuple"
    );

    // Domain list
    const networkFirewallRuleGroupDomainList =
      new NetworkFirewallRuleGroupDomainList(
        this,
        "Network Firewall Rule Group Domain List"
      );

    // Suricata compatible IPS rules
    const networkFirewallRuleGroupSuricata =
      new NetworkFirewallRuleGroupSuricata(
        this,
        "Network Firewall Rule Group Suricata"
      );

    // Network Firewall policy
    const networkFirewallPolicy = new NetworkFirewallPolicy(
      this,
      "Network Firewall Policy",
      {
        statefulRuleGroupReferences: [
          {
            Priority: 1,
            ResourceArn:
              networkFirewallRuleGroup5Tuple.ruleGroup.attrRuleGroupArn,
          },
        ],
      }
    );

    // Network Firewall
    const networkFirewall = new cdk.aws_networkfirewall.CfnFirewall(
      this,
      "Default",
      {
        firewallName: "network-firewall",
        firewallPolicyArn:
          networkFirewallPolicy.firewallPolicy.attrFirewallPolicyArn,
        vpcId: props.vpc.vpcId,
        subnetMappings: props.vpc
          .selectSubnets({
            subnetGroupName: "Firewall",
          })
          .subnetIds.map((subnetId) => {
            return {
              subnetId: subnetId,
            };
          }),
        deleteProtection: false,
        subnetChangeProtection: false,
      }
    );

    // Network Firewall logs
    new NetworkFirewallLogs(this, "Network Firewall Logs", {
      networkFirewall,
    });

    // Network Firewall Routing
    new NetworkFirewallRouting(this, "Network Firewall Routing", {
      networkFirewall,
      vpc: props.vpc,
    });
  }
}
