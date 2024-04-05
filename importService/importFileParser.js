export async function importFileParser(event) {
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
