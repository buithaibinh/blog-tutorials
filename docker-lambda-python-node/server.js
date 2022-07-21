const { exec } = require('child_process');

/**
 * test python
 * @returns
 */
const exc = async () => {
  return new Promise((resolve, reject) => {
    const spawn_options = {
      cwd: '/usr/src/node',
      shell: 'bash',
    };

    exec(`python3 task.py`, spawn_options, (err) => {
      if (err) {
        //some err occurred
        console.error(err);
        reject(err);
      } else {
        console.log('python file created');
        resolve('python file created');
      }
    });
  });
};

exports.lambdaHandler = async (event, context) => {
  try {
    const res = await exc();
    const response = {
      statusCode: 200,
      body: JSON.stringify({
        message: res,
      }),
    };
    return response;
  } catch (err) {
    throw err;
  }
};
