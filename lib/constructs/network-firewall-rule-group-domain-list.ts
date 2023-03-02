import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface NetworkFirewallRuleGroupDomainListProps {}

export class NetworkFirewallRuleGroupDomainList extends Construct {
  readonly ruleGroup: cdk.aws_networkfirewall.CfnRuleGroup;

  constructor(
    scope: Construct,
    id: string,
    props?: NetworkFirewallRuleGroupDomainListProps
  ) {
    super(scope, id);

    // Network Firewall rule group
    this.ruleGroup = new cdk.aws_networkfirewall.CfnRuleGroup(this, "Default", {
      capacity: 100,
      ruleGroupName: "network-firewall-rule-group-domain-list",
      type: "STATEFUL",
      ruleGroup: {
        rulesSource: {
          rulesSourceList: {
            generatedRulesType: "ALLOWLIST",
            targetTypes: ["TLS_SNI", "HTTP_HOST"],
            targets: ["dev.classmethod.jp"],
          },
        },
        statefulRuleOptions: {
          ruleOrder: "STRICT_ORDER",
        },
      },
    });
  }
}
