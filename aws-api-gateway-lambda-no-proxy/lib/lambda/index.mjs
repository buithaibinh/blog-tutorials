export const handler = async (event, context, callback) => {
  // Error caught here:
  var myErrorObj = {
    errorType: 'InternalServerError',
    httpStatus: 500,
    requestId: context.awsRequestId,
    trace: {
      function: 'abc()',
      line: 123,
      file: 'abc.js'
    }
  };

  return JSON.stringify(myErrorObj);
};
