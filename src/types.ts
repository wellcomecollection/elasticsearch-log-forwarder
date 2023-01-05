// The only documentation I can find for this data type is here
// https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/ValidateLogEventFlow.html
export type CloudwatchKinesisMessage = {
  owner: string;
  logGroup: string;
  logStream: string;
  subscriptionFilters: string[];
  messageType: "DATA_MESSAGE" | "CONTROL_MESSAGE";
  logEvents: CloudwatchLogEvent[];
};

export type CloudwatchLogEvent = {
  id: string;
  timestamp: number;
  message: string;
};

export type LogDocument = {
  _id: string;
  "@timestamp": number;
  log: string;
  service: string;
};
