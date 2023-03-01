import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface NetworkFirewallRuleGroup5TupleProps {}

export class NetworkFirewallRuleGroup5Tuple extends Construct {
  readonly ruleGroup: cdk.aws_networkfirewall.CfnRuleGroup;

  constructor(
    scope: Construct,
    id: string,
    props?: NetworkFirewallRuleGroup5TupleProps
  ) {
    super(scope, id);

    // Network Firewall rule group
    this.ruleGroup = new cdk.aws_networkfirewall.CfnRuleGroup(this, "Default", {
      capacity: 100,
      ruleGroupName: "network-firewall-rule-group-5-tuple",
      type: "STATEFUL",
      ruleGroup: {
        rulesSource: {
          statefulRules: [
            {
              action: "PASS",
              header: {
                destination: "0.0.0.0/0",
                destinationPort: "ANY",
                direction: "FORWARD",
                protocol: "IP",
                source: "$HOME_NET",
                sourcePort: "ANY",
              },
              ruleOptions: [
                {
                  keyword: `msg:"HOME_NET pass"`,
                },
                {
                  keyword: "sid:1000001",
                },
                {
                  keyword: "rev:1",
                },
              ],
            },
          ],
        },
        statefulRuleOptions: {
          ruleOrder: "STRICT_ORDER",
        },
      },
    });
  }
}
