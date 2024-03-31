"use strict";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "eu-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);

export async function getProductsList(event) {
  try {
    console.log("Invocation of getProductsList");
    const products = await docClient.send(
      new ScanCommand({
        TableName: "products",
      }),
    );
    const stocks = await docClient.send(
      new ScanCommand({
        TableName: "stocks",
      }),
    );
    const data = products.Items.map((product) => {
      const stock = stocks.Items.find((stock) => stock.id === product.id);
      return {
        ...product,
        stock: stock ? stock.count : 0,
      };
    });
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(data),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Internal server error",
      }),
    };
  }
}
