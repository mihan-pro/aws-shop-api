import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const client = new S3Client({ region: "eu-west-1" });
const headers = {
  "Access-Control-Allow-Origin": "*",
};

export async function importProductsFile(event) {
  const FileName = event.queryStringParameters?.name;
  if (!FileName) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Name is required" }),
      headers,
    };
  }
  const command = new PutObjectCommand({
    Bucket: "mp-ep-aws-course-uploaded",
    Key: `uploaded/${FileName}`,
  });
  try {
    const url = await getSignedUrl(client, command, { expiresIn: 3600 });
    return {
      statusCode: 200,
      body: url,
      headers,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error: " + error }),
      headers,
    };
  }
}
