import AWS from 'aws-sdk';
const { SES } = AWS;

// update the following variables with the values from your configuration
AWS.config.update({ region: 'region' });
const fromEmail = 'Info <from@example.com>';
const to = 'to@yourdomain.com';

// fixed a reference id for testing. Replace with your own topic reference id
const TOPIC_REFERENCE = '<111111@example.com>';

// Subject of the email, append the date to the subject. This make subject unique every time the email is sent
const subject = `Test email from AWS SES!!! ${new Date()}`;
const plainText = `Hello from AWS SES! ${new Date()}`;
const html = `<h1>Hello from AWS SES!</h1> <span>${new Date()}</span>`;

const ses = new SES({ apiVersion: '2010-12-01' });

const sendDrawMessage = async () => {
  // Set up from_name, from_email, to, subject, message_id, plain_text, html and configuration_set variables from database or manually
  const boundary = `----=_Part${Math.random().toString().substr(2)}`;

  const rawMessage = [
    `From: ${fromEmail}`, // Can be just the email as well without <>
    `To: ${to}`,
    `Subject: ${subject}`,
    `MIME-Version: 1.0`,
    // `Message-ID: <${ message_id }@eu-west-1.amazonses.com>`, // Will be replaced by SES
    // `Date: ${ formatDate( date ) }`, // Will be replaced by SES
    // `Return-Path: <${ message_id }@eu-west-1.amazonses.com>`, // Will be replaced by SES
    `Content-Type: multipart/alternative; boundary="${boundary}"`, // For sending both plaintext & html content
    // ... you can add more headers here as described in https://docs.aws.amazon.com/ses/latest/DeveloperGuide/header-fields.html
    `References: ${TOPIC_REFERENCE}`,
    `\n`,
    `--${boundary}`,
    `Content-Type: text/plain; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    `\n`,
    plainText,
    `--${boundary}`,
    `Content-Type: text/html; charset=UTF-8`,
    `Content-Transfer-Encoding: 7bit`,
    `\n`,
    html,
    `\n`,
    `--${boundary}--`,
  ];

  // Send the actual email
  return ses
    .sendRawEmail({
      Destinations: [to],
      RawMessage: {
        Data: rawMessage.join('\n'),
      },
      Source: fromEmail, // Must be verified within AWS SES
      // ConfigurationSetName: 'ConfigurationSetName', // optional AWS SES configuration set for open & click tracking
      Tags: [
        // ... optional email tags
      ],
    })
    .promise();
};

sendDrawMessage()
  .then(function (data) {
    console.log(data);
  })
  .catch(function (err) {
    console.error(err, err.stack);
  });
