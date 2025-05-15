// @ts-ignore
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
// @ts-ignore
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
const client = new DynamoDBClient({
  region: "us-east-1",
  endpoint: "http://host.docker.internal:8000",
});

const ddbDocClient = DynamoDBDocumentClient.from(client);
const tableName = process.env.REMINDER_TABLE;

export const deleteReminderHandler = async (event) => {
  if (event.httpMethod !== "DELETE") {
    throw new Error(
      `postMethod only accepts DELETE method, you tried: ${event.httpMethod} method.`
    );
  }

  console.info("received:", event);
  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  // Get id from pathParameters from APIGateway because of `/{id}` at template.yaml
  const id = event.pathParameters.id;

  // Creates a new item, or replaces an old item with a new item
  // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB/DocumentClient.html#put-property
  const params = {
    TableName: tableName,
    Key: {
      id,
    },
  };
  try {
    const data = await ddbDocClient.send(new DeleteCommand(params));
    console.log("✅ Item deleted:", data);
  } catch (err) {
    console.log("Error", err.stack);
  }

  const response = {
    statusCode: 204,
  };

  // All log statements are written to CloudWatch
  console.info(
    `response from: ${event.path} statusCode: ${response.statusCode}`
  );
  return response;
};
