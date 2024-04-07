import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { productsList } from "../productsMock.js";


const client = new DynamoDBClient({
    region: "eu-west-1",
});
const docClient = DynamoDBDocumentClient.from(client);

async function populateStocks() {
    try {
        for (const product of productsList) {
            const data = await docClient.send(new PutCommand({
                TableName: "stocks",
                Item: {
                    id: product.id,
                    count: Math.floor(Math.random() * 100)
                }
            }));
            console.log('result : ' + JSON.stringify(data));}
    } catch (error) {
        console.error("Error:", error);
    }
}

populateStocks();
