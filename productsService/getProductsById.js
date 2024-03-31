import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({
  region: "eu-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);

export async function getProductsById(event) {
  try {
    const { id } = event.pathParameters;
    console.log(`Invocation of getProductsById: id=${id}`);
    const product = (
      await docClient.send(
        new GetCommand({
          TableName: "products",
          Key: {
            id,
          },
        }),
      )
    )?.Item;
    const stock = (
      await docClient.send(
        new GetCommand({
          TableName: "stocks",
          Key: {
            id,
          },
        }),
      )
    )?.Item;
    if (!product || !stock) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Product not found",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ ...product, count: stock.count }),
    };
  } catch (error) {
    console.error(error);
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
