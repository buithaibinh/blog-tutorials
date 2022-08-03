import { getSignedUrl, getSignedCookies } from '@aws-sdk/cloudfront-signer';
import inquirer from 'inquirer';
import * as fs from 'fs';

// TODO, change this to your public key pair
const AWS_CLOUDFRONT_KEY_PAIR_ID = 'AWS_CLOUDFRONT_KEY_PAIR_ID';

// Note: keep key secret, you may want to store this in a .env file or use AWS Secrets Manager
const privateKey = fs.readFileSync('../keys/private_key.pem', 'utf8');

inquirer
  .prompt([
    {
      name: 'url',
      message: 'URL for signed cookies:',
      type: 'input',
    },
    {
      name: 'days',
      message: 'number of days valid, defaults to 1 if not specified:',
      type: 'input',
      default: 1,
    },
  ])
  .then((answers) => {
    const { url, days } = answers;
    const dateLessThan = new Date(Date.now() + 1000 * 60 * 60 * 24 * days);
    const signedCookies = getSignedUrl({
      url,
      dateLessThan: dateLessThan.toISOString(),
      keyPairId: AWS_CLOUDFRONT_KEY_PAIR_ID,
      privateKey,
    });
    console.log(signedCookies);
  });
