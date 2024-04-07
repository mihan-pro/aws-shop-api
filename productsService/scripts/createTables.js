import { CreateTableCommand, DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "eu-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);

const createProductTableCommand = new CreateTableCommand({
  TableName: "products1",
  AttributeDefinitions: [
    {
      AttributeName: "id",
      AttributeType: "S",
    },
  ],
  KeySchema: [
    {
      AttributeName: "id",
      KeyType: "HASH",
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
});
const createStockTableCommand = new CreateTableCommand({
  TableName: "stocks",
  AttributeDefinitions: [
    {
      AttributeName: "id",
      AttributeType: "S",
    },
  ],
  KeySchema: [
    {
      AttributeName: "id",
      KeyType: "HASH",
    },
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 1,
    WriteCapacityUnits: 1,
  },
});

async function createTables() {
  try {
    await docClient.send(createProductTableCommand);
    await docClient.send(createStockTableCommand);
  } catch (error) {
    console.error("Error:", error);
  }
}

createTables();
