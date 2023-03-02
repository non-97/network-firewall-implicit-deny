import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as fs from "fs";
import * as path from "path";

export interface NetworkFirewallRuleGroupSuricataProps {}

export class NetworkFirewallRuleGroupSuricata extends Construct {
  readonly ruleGroup: cdk.aws_networkfirewall.CfnRuleGroup;

  constructor(
    scope: Construct,
    id: string,
    props?: NetworkFirewallRuleGroupSuricataProps
  ) {
    super(scope, id);

    // Suricata compatible IPS rules
    const ipsRules = fs.readFileSync(
      path.join(__dirname, "../../src/network-firewall/ips-rules.suricata"),
      "utf8"
    );

    // Network Firewall rule group
    this.ruleGroup = new cdk.aws_networkfirewall.CfnRuleGroup(this, "Default", {
      capacity: 100,
      ruleGroupName: "network-firewall-rule-group-suricata",
      type: "STATEFUL",
      ruleGroup: {
        rulesSource: {
          rulesString: ipsRules,
        },
        statefulRuleOptions: {
          ruleOrder: "STRICT_ORDER",
        },
      },
    });
  }
}
