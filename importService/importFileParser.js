import csvParser from "csv-parser";
import { S3Client } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "eu-west-1" });

export async function importFileParser(event) {
  const bucketName = event.Records[0].s3.bucket.name;
  const objectKey = decodeURIComponent(
    event.Records[0].s3.object.key.replace(/\+/g, " "),
  );

  const params = {
    Bucket: bucketName,
    Key: objectKey,
  };

  try {
    const s3Stream = s3.getObject(params).createReadStream();

    s3Stream
      .pipe(csvParser())
      .on("data", (data) => console.log(data))
      .on("end", () => console.log("CSV processing completed"));
  } catch (error) {
    console.log(error);
    return;
  }
  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        message: "importFileParser handler executed successfully!",
        input: event,
      },
      null,
      2,
    ),
  };
}
