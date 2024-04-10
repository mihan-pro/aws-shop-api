import csv from "csv-parser";
import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { finished } from "stream/promises";

const client = new S3Client({ region: "eu-west-1" });

export async function importFileParser(event) {
  try {
    const bucketName = event.Records[0].s3.bucket.name;
    const objectKey = decodeURIComponent(
      event.Records[0].s3.object.key.replace(/\+/g, " "),
    );
    const data = [];

    const object = await client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );

    await finished(
      object.Body.pipe(csv({ separator: ";" }))
        .on("data", (row) => {
          data.push(row);
        })
        .on("error", (error) => {
          throw error;
        })
        .on("end", () => console.log("CSV processing completed", data)),
    );

    await client.send(
      new CopyObjectCommand({
        Bucket: bucketName,
        CopySource: `${bucketName}/${objectKey}`,
        Key: objectKey.replace("uploaded", "parsed"),
      }),
    );

    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
      }),
    );
  } catch (error) {
    console.log("Error: ", error);
  } finally {
    client.destroy();
  }
}
