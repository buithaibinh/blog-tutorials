// function handle custom resource events

import {
  OnEventRequest,
  OnEventResponse
} from 'aws-cdk-lib/custom-resources/lib/provider-framework/types';

const sendMailWelcome = async (email: string) => {
  // send email to user
  console.log(`Send email to ${email} with welcome message`);
};

export async function onEvent(event: OnEventRequest) {
  // implement your custom resource logic here
  const {
    RequestType,
    PhysicalResourceId,
    ResourceProperties,
    OldResourceProperties
  } = event;

  // create a user
  const { UserPoolId, Username, Password } = ResourceProperties;

  if (RequestType === 'Create') {
    // send welcome email
    // await sendMailWelcome(email);
    console.log(`Create user ${Username} in user pool ${UserPoolId}`);
  }

  return {
    PhysicalResourceId:
      PhysicalResourceId || `AwsCustomResource-CreateUser-${Username}`,
    Data: {
      // return any data you want to be available in the stack outputs
    }
  } as OnEventResponse;
}
