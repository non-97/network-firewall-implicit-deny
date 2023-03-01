import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { NetworkFirewallRuleGroup5Tuple } from "./network-firewall-rule-group-5-tuple";
import { NetworkFirewallPolicy } from "./network-firewall-policy";

export interface NetworkFirewallProps {
  vpc: cdk.aws_ec2.IVpc;
}

export class NetworkFirewall extends Construct {
  constructor(scope: Construct, id: string, props: NetworkFirewallProps) {
    super(scope, id);

    // Cloud Watch Logs Network Firewall alert logs
    const networkFirewallAlertLogGroup = new cdk.aws_logs.LogGroup(
      this,
      "Network Firewall Alert Log Group",
      {
        retention: cdk.aws_logs.RetentionDays.ONE_WEEK,
      }
    );

    // Network Firewall rule group
    const networkFirewallRuleGroup5Tuple = new NetworkFirewallRuleGroup5Tuple(
      this,
      "Network Firewall Rule Group 5-Tuple"
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
    new cdk.aws_networkfirewall.CfnLoggingConfiguration(
      this,
      "Network Firewall Logs",
      {
        firewallArn: networkFirewall.ref,
        loggingConfiguration: {
          logDestinationConfigs: [
            {
              logDestination: {
                logGroup: networkFirewallAlertLogGroup.logGroupName,
              },
              logDestinationType: "CloudWatchLogs",
              logType: "ALERT",
            },
          ],
        },
      }
    );

    // Routing NAT Gateway to Network Firewall
    props.vpc.publicSubnets.forEach((publicSubnet, index) => {
      const az = publicSubnet.availabilityZone;

      const destinationSubnets = props.vpc.selectSubnets({
        subnetGroupName: "Egress",
        availabilityZones: [az],
      }).subnets;

      destinationSubnets.forEach((destinationSubnet) => {
        const destinationCidrBlock = destinationSubnet.ipv4CidrBlock;

        new cdk.aws_ec2.CfnRoute(
          this,
          `Route Nat Gateway To Network Firewall ${destinationCidrBlock}`,
          {
            routeTableId: publicSubnet.routeTable.routeTableId,
            destinationCidrBlock,
            vpcEndpointId: cdk.Fn.select(
              1,
              cdk.Fn.split(
                ":",
                cdk.Fn.select(index, networkFirewall.attrEndpointIds)
              )
            ),
          }
        );
      });
    });

    // Routing Egress Subnet to Network Firewall
    props.vpc
      .selectSubnets({ subnetGroupName: "Egress" })
      .subnets.forEach((subnet, index) => {
        const defaultRoute = subnet.node.children.find(
          (child) => child.node.id == "DefaultRoute"
        ) as cdk.aws_ec2.CfnRoute;
        defaultRoute.addDeletionOverride("Properties.NatGatewayId");

        defaultRoute.addOverride(
          "Properties.VpcEndpointId",
          cdk.Fn.select(
            1,
            cdk.Fn.split(
              ":",
              cdk.Fn.select(index, networkFirewall.attrEndpointIds)
            )
          )
        );
      });
  }
}
