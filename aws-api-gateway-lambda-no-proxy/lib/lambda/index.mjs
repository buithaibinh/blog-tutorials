export const handler = function (event, context, callback) {
  console.log('event: ' + JSON.stringify(event));
  var res = {
    statusCode: 200,
    headers: {
      'Content-Type': '*/*'
    }
  };
  if (event.greeter == null) {
    callback(new Error('Missing the required greeter parameter.'));
  } else if (event.greeter === '') {
    res.body = 'Hello, World';
    callback(null, res);
  } else {
    res.body = 'Hello, ' + event.greeter + '!';
    callback(null, res);
  }
};
