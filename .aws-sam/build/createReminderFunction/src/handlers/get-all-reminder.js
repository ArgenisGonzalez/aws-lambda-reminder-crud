// @ts-ignore
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// @ts-ignore
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://host.docker.internal:8000",
});

const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.REMINDER_TABLE;

export const getAllReminderHandler = async (event) => {
  if (event.httpMethod !== "GET") {
    throw new Error(
      `postMethod only accepts GET method, you tried: ${event.httpMethod} method.`
    );
  }

  console.info("received:", event);

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  var params = {
    TableName: tableName,
  };
  try {
    const data = await ddbDocClient.send(new ScanCommand(params));
    var reminders = data.Items;
  } catch (err) {
    console.log("Error", err.stack);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify(reminders),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
