import csv from "csv-parser";
import removeBOM from "remove-bom-stream";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { SendMessageBatchCommand, SQSClient } from "@aws-sdk/client-sqs";
import { finished } from "stream/promises";
import { PublishCommand, SNSClient } from "@aws-sdk/client-sns";

const clientParams = { region: "eu-west-1" };

const S3_Client = new S3Client(clientParams);
const SQS_Client = new SQSClient(clientParams);
const SNS_Client = new SNSClient(clientParams);

export async function importFileParser(event) {
  try {
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " "),
    );
    const data = [];

    const object = await S3_Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    await finished(
      object.Body.pipe(removeBOM("utf-8"))
        .pipe(csv({ separator: ";", strict: true, quote: "'", raw: false }))
        .on("data", (row) => {
          data.push(row);
        })
        .on("error", (error) => {
          throw error;
        })
        .on("end", () => console.log("CSV processing completed")),
    );

    await S3_Client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${objectKey}`,
        Key: objectKey.replace("uploaded", "parsed"),
      }),
    );

    await S3_Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    await SQS_Client.send(
      new SendMessageBatchCommand({
        Entries: data.map((row, index) => ({
          Id: index.toString(),
          MessageBody: JSON.stringify(row),
        })),
        QueueUrl: process.env.SQS_URL,
      }),
    );

    await SNS_Client.send(
      new PublishCommand({
        TopicArn: process.env.SNS_ARN,
        Subject: "Products has been uploaded",
        Message: JSON.stringify(data, null, 2),
      }),
    );
  } catch (error) {
    console.log("Error: ", error);
  } finally {
    S3_Client.destroy();
    SQS_Client.destroy();
  }
}
