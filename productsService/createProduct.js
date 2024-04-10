import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import joi from "joi";

const client = new DynamoDBClient({
  region: "eu-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);

const schema = joi.object({
  id: joi.string().required().strict(),
  title: joi.string().required().strict(),
  description: joi.string().required().strict(),
  price: joi.number().required().positive().strict(),
  count: joi.number().required().positive().strict(),
});

export async function createProduct(event) {
  try {
    console.log("Invocation of createProduct ", event.body);
    let id, title, description, price, count;
    try {
      const body = JSON.parse(event.body);
      id = body.id;
      title = body.title;
      description = body.description;
      price = body.price;
      count = body.count;
      const { error, value } = schema.validate(body);
      if (error) {
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
          body: JSON.stringify({
            message: error.details.map((error) => error.message).join(", "),
          }),
        };
      }
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          message: "Invalid request",
        }),
      };
    }

    await docClient.send(
      new PutCommand({
        TableName: "products",
        Item: {
          id,
          title,
          description,
          price,
        },
      }),
    );
    await docClient.send(
      new PutCommand({
        TableName: "stocks",
        Item: {
          id,
          count,
        },
      }),
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
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
