import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  BatchWriteCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "eu-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);

export async function catalogBatchProcess(event) {
  try {
    const productsPutCommands = [];
    const stocksPutCommands = [];
    event.Records.forEach((record) => {
      const body = JSON.parse(record.body);
      productsPutCommands.push({
        PutRequest: {
          Item: {
            id: body.id,
            title: body.title,
            description: body.description,
            price: body.price,
          },
        },
      });
      stocksPutCommands.push({
        PutRequest: {
          Item: {
            id: body.id,
            count: body.count,
          },
        },
      });
    });

    await docClient.send(
      new BatchWriteCommand({
        RequestItems: {
          products: productsPutCommands,
          stocks: stocksPutCommands,
        },
      }),
    );
  } catch (error) {
    console.log("Error in catalogBatchProcess", error);
  }
}
