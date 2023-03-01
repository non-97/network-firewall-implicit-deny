import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface NetworkFirewallLogsProps {
  networkFirewall: cdk.aws_networkfirewall.CfnFirewall;
}

export class NetworkFirewallLogs extends Construct {
  constructor(scope: Construct, id: string, props: NetworkFirewallLogsProps) {
    super(scope, id);

    // Cloud Watch Logs Network Firewall alert logs
    const alertLogGroup = new cdk.aws_logs.LogGroup(this, "Alert Log Group", {
      retention: cdk.aws_logs.RetentionDays.ONE_WEEK,
    });

    // Network Firewall logs
    new cdk.aws_networkfirewall.CfnLoggingConfiguration(this, "Default", {
      firewallArn: props.networkFirewall.ref,
      loggingConfiguration: {
        logDestinationConfigs: [
          {
            logDestination: {
              logGroup: alertLogGroup.logGroupName,
            },
            logDestinationType: "CloudWatchLogs",
            logType: "ALERT",
          },
        ],
      },
    });
  }
}
