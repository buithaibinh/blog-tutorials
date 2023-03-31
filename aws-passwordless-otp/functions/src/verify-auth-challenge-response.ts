import { VerifyAuthChallengeResponseTriggerHandler } from 'aws-lambda';

const handler: VerifyAuthChallengeResponseTriggerHandler = async (event) => {
  const expectedAnswer =
    event.request.privateChallengeParameters!.secretLoginCode;
  if (event.request.challengeAnswer === expectedAnswer) {
    event.response.answerCorrect = true;
  } else {
    event.response.answerCorrect = false;
  }
  return event;
};

export default handler;
