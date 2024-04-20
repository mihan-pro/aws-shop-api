const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
};

export async function basicAuthorizer(event) {
  if (!event.authorizationToken) {
    return {
      statusCode: 401,
      headers,
      body: JSON.stringify({
        message: "Unauthorized request",
      }),
    };
  }

  const token = event.authorizationToken.replace("Basic", "").trim();

  try {
    const [username, password] = Buffer.from(token, "base64")
      .toString("utf-8")
      .split(":");

    if (username in process.env && process.env[username] === password) {
      return {
        principalId: "user",
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Allow",
              Resource: event.methodArn,
            },
          ],
        },
      };
    } else {
      return {
        principalId: "user",
        policyDocument: {
          Version: "2012-10-17",
          Statement: [
            {
              Action: "execute-api:Invoke",
              Effect: "Deny",
              Resource: event.methodArn,
            },
          ],
        },
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        message: "Internal server error: " + error.message,
      }),
    };
  }
}
