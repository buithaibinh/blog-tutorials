export const errorResponses = [
  {
    selectionPattern: "400",
    statusCode: "400",
    responseTemplates: {
      "application/json": `{
        "error": "Bad input!"
      }`,
    },
  },
  {
    selectionPattern: "5\\d{2}",
    statusCode: "500",
    responseTemplates: {
      "application/json": `{
        "error": "Internal Service Error!"
      }`,
    },
  },
];

export const methodOptions = {
  methodResponses: [
    { statusCode: "200" },
    { statusCode: "400" },
    { statusCode: "500" },
  ],
};
