// @ts-ignore
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// @ts-ignore
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://host.docker.internal:8000",
});
const ddbDocClient = DynamoDBDocumentClient.from(client);

const tableName = process.env.REMINDER_TABLE;

export const createReminderHandler = async (event) => {
  if (event.httpMethod !== "POST") {
    throw new Error(
      `postMethod only accepts POST method, you tried: ${event.httpMethod} method.`
    );
  }

  console.info("received:", event);

  const body = JSON.parse(event.body);
  const { description, eventTime, duration } = body;

  const id = uuidv4();

  if (!description || !eventTime) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required fields" }),
    };
  }
  const timestamp = new Date(eventTime).getTime();

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  var params = {
    TableName: tableName,
    Item: { id: id, description, eventTime: timestamp, duration },
  };

  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log("Success - item added or updated", data);
  } catch (err) {
    console.log("Error", err.stack);
  }

  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: "Reminder saved successfully",
      data: { id, description, eventTime, duration },
    }),
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );
  return response;
};
