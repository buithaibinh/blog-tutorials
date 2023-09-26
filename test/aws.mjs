import {
    fromCognitoIdentityPool,
    fromCognitoIdentity,
} from '@aws-sdk/credential-providers';

import crypto from 'crypto';
import {
    S3Client,
    PutObjectCommand,
    ListObjectsV2Command,
} from '@aws-sdk/client-s3';

import dotenv from 'dotenv';
dotenv.config({
    path: '.env.local',
});

const region = 'ap-southeast-1';
const refeshToken = process.env.COGNITO_REFRESH_TOKEN;

const userPoolId = 'ap-southeast-1_SMp3lZZim';
const identityPoolId = 'ap-southeast-1:f7cdfcf8-e9c7-4958-8fe9-38b70a530bf7';
const webClientId = '6tmsrov978069tv31fvlrmaal0';

// const credentials = fromCognitoIdentity({
//     region,
//     identityId: 'ap-southeast-1:357a0ecb-81bf-46ad-b66e-b6214b3be2ec',
// });

const bucketName = 'devstage-basestack-databuckete3889a50-1g1xv7rv7flx1';

const run = async () => {
    try {
        const idToken = 'eyJraWQiOiJaNml5TUx4YzZuUUF3UWpyZHdsWXZRMGtiWmRIaEtSbjZ2SDVvVVh0Tnl3PSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiJlMTcxNmZlZS0xNzk3LTQwNzEtOTBmZi00M2U5ODAwOGQyNzEiLCJjb2duaXRvOmdyb3VwcyI6WyJBZG1pbiJdLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmFwLXNvdXRoZWFzdC0xLmFtYXpvbmF3cy5jb21cL2FwLXNvdXRoZWFzdC0xX1NNcDNsWlppbSIsImNvZ25pdG86dXNlcm5hbWUiOiJlMTcxNmZlZS0xNzk3LTQwNzEtOTBmZi00M2U5ODAwOGQyNzEiLCJvcmlnaW5fanRpIjoiZmE4MmM3ZjgtNDNkNi00ZDdiLThmOTQtOTNhZTc5ZWU3ZTQ1IiwiYXVkIjoiNnRtc3Jvdjk3ODA2OXR2MzFmdmxybWFhbDAiLCJldmVudF9pZCI6ImY0ODA2MDE4LWFiMWEtNGZmMS04NDc1LTVlNjU0MmFmZTE2ZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjkyNDk0ODI1LCJleHAiOjE2OTI5NTA2OTQsImN1c3RvbTpyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTI5MjkwOTQsImp0aSI6IjljNTE4YzE1LTBkYTMtNDQwMS05MjRkLWYzODA5Zjc2NjcyYiIsImVtYWlsIjoiYnZiaW5oQHNrLWdsb2JhbC5iaXoifQ.AMjNL4x1ObPodNzbZXfTNa3MgjyTjlkTBEdSbddWG0ZTFWLVvTsGZyqf4cAOtGmZDFDpBSGDoARSsYg-66LatoSPo1woh1r1vFerg6Z_rJrxEbFRbymMD2yMBhZA2P38g9s8vluuz-6jqndZJHI_GPueSspuRs-Zf356Wi2yM4yaFonTwR_Kp5ajN8tczddxuhWZs3hGt1qJj4H_4yac3Q-EdZ3W_FXuLrltTtHaz72cx_W33vfNMoD96k1ThuW-Y0gNfE8QW7q4SKZYhZz8TmVRkYTDvYRHTI3FGos5mkeAFBqq1UuF8708skOecZWPIELk_1iZqFAR6ihefNWA2g'
        const credentials = fromCognitoIdentityPool({
            identityPoolId,
            logins: {
                [`cognito-idp.${region}.amazonaws.com/${userPoolId}`]: idToken,
            },
        });
        const user = await credentials();
        const identityId = user.identityId;
        console.log('identityId', user);

        const s3 = new S3Client({
            region,
            credentials: credentials,
        });

        const input = {
            Bucket: bucketName,
            prefix: `private/${identityId}/`,
        };

        const command = new ListObjectsV2Command(input);
        const res = await s3.send(command);
        console.log('response from webhook:', res);
    } catch (error) {
        console.log('error', error);
        // parse response
        if (error.response) {
            // get response data
            const { data } = error.response;
            console.log('data', data);
        }
    }
};

import {
    CognitoIdentityProviderClient,
    AdminInitiateAuthCommand,
    AdminGetUserCommand,
    AuthFlowType,
    RespondToAuthChallengeCommand,
    ChallengeNameType,
    InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider'; // ES Modules import

import {
    SRPClient,
    calculateSignature,
    getNowString,
} from 'amazon-user-pool-srp-client';

const cognitoClient = new CognitoIdentityProviderClient({ region });
const loginByRefeshToken = async () => {
    const params = {
        AuthFlow: 'REFRESH_TOKEN_AUTH',
        ClientId: webClientId,
        UserPoolId: userPoolId,
        AuthParameters: {
            REFRESH_TOKEN: refeshToken,
        },
    };
    const command = new AdminInitiateAuthCommand(params);
    const res = await cognitoClient.send(command);
    const idToken = res.AuthenticationResult.IdToken;
    console.log('idToken', res.AuthenticationResult);
    return idToken;
};

const loginBySrcret = async () => {
    // generate secret
    const username = 'binhbv@gmail.com'; // bvbinh@sk-global.biz
    const clientId = '1di711cfajvfpqljvdbcek66kh';
    // const clientSecret = 'nq5v4mofljffnfls2jvosi2tkf6gjhvtvng2881qjoc8ib9p3sq';
    // const secretHash = crypto
    //     .createHmac('SHA256', clientSecret)
    //     .update(username + clientId)
    //     .digest('base64');

    // generate SRP_A secret
    const srp = new SRPClient(userPoolId);
    const SRP_A = srp.calculateA();
    console.log('SRP_A', SRP_A);
    const params = {
        AuthFlow: AuthFlowType.USER_SRP_AUTH,
        ClientId: clientId,
        UserPoolId: userPoolId,
        AuthParameters: {
            USERNAME: username, //  53e27bbf-55ad-456d-ad38-ceca80457fec
            SRP_A: SRP_A,
        },
    };
    const command = new AdminInitiateAuthCommand(params);
    const res = await cognitoClient.send(command);
    console.log('res', res);

    // if challenge is PASSWORD_VERIFIER
    const ChallengeParameters = res.ChallengeParameters;

    // ...compute SRP response
    const password = '12345678';
    const hkdf = srp.getPasswordAuthenticationKey(
        ChallengeParameters.USER_ID_FOR_SRP,
        password,
        ChallengeParameters.SRP_B,
        ChallengeParameters.SALT
    );
    const dateNow = getNowString();
    const signatureString = calculateSignature(
        hkdf,
        userPoolId,
        ChallengeParameters.USER_ID_FOR_SRP,
        ChallengeParameters.SECRET_BLOCK,
        dateNow
    );

    const command2 = new RespondToAuthChallengeCommand({
        ChallengeName: ChallengeNameType.PASSWORD_VERIFIER,
        ClientId: clientId,
        ChallengeResponses: {
            PASSWORD_CLAIM_SIGNATURE: signatureString,
            PASSWORD_CLAIM_SECRET_BLOCK: ChallengeParameters.SECRET_BLOCK,
            TIMESTAMP: dateNow,
            USERNAME: ChallengeParameters.USER_ID_FOR_SRP,
        },
    });
    const res2 = await cognitoClient.send(command2);

    console.log('res2', res2);
};

const adminGetUser = async ({ userPoolId, username }) => {
    const command = new AdminGetUserCommand({
        UserPoolId: userPoolId,
        Username: username,
    });

    const res = await cognitoClient.send(command);
    console.log('res', res);
    return res;
};

const loginCustom = async () => {
    const username = 'binhbv@gmail.com'; // bvbinh@sk-global.biz

    const command = new AdminInitiateAuthCommand({
        AuthFlow: AuthFlowType.CUSTOM_AUTH,
        ClientId: '7i7l7j9ho6ph782opsk3vtbuni',
        UserPoolId: 'ap-southeast-1_c7h1jZeyU',
        AuthParameters: {
            USERNAME: username,
        },
    });

    const res = await cognitoClient.send(command);
    console.log('res', res);

    // // if challenge is CUSTOM_CHALLENGE
    // const ChallengeParameters = res.ChallengeParameters;
    // const session = "AYABeI7LshZ5d6omnc8_X8Q0Gm8AHQABAAdTZXJ2aWNlABBDb2duaXRvVXNlclBvb2xzAAEAB2F3cy1rbXMAUGFybjphd3M6a21zOmFwLXNvdXRoZWFzdC0xOjAzMTU3NzI0MDA0ODprZXkvYmEwNzA1YzktMTI0Mi00ODg1LWJhMmYtNDhiMWNjYTNiNDNmALgBAgEAeHrsOKNetOa0ommxUjMKTLhF7X_jH4YrpkFmCKzo55rBAWDPl9I0yxHXx3u2bqWWyKUAAAB-MHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAzp8Od1vBn-12BxLR8CARCAOzU1qoOETwVoIk58JKnXiGlP0imDnYbGx_bKnaK0DFnROAEW8BUo6w07UQo_wfj0Kt78RYUw1XY9sL0uAgAAAAAMAAAQAAAAAAAAAAAAAAAAAB5hJC8RAvXu7RFPCKcq7wn_____AAAAAQAAAAAAAAAAAAAAAQAAAROHL5MSyKofE61zADCIRM0t1_DGqaZ4qcXG7j-lzYFor326Cb17R8_F3UtP1K5jMRTc5mALLEkvMB50ED8TS0LamyTBsa2nU-vxkBo8gFzvqlcryausptDpFundbDF4ekGhGm7EFW0Q2bqo6ww3CeZWjWGHRf7hmS4UuxxFk58qv9UofmyIE-vT4EMG5Yi0_GRC66b-BYYwEx2_151NT4qeD5MtYJHu9zdhZu-ChTeODGXy5ZksfzQLG-QuMcTOvnQK0L2CeiKlOnLLvaC04XZ47quTyxi1e9vAIFqW_nD9SZk97O3dUuRcA3MlUV-OMp4qKUeJtGs39XUCg_GVGdlsyoco_HnsbIdWQaTizjawIS9odZ5iwM_mnjrxY78bSX5C8vQ"

    // const command2 = new RespondToAuthChallengeCommand({
    //     ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
    //     ClientId: '7i7l7j9ho6ph782opsk3vtbuni',
    //     ChallengeResponses: {
    //         USERNAME: username,
    //         ANSWER: '4022',
    //     },
    //     Session: session,
    // });
    // const res2 = await cognitoClient.send(command2);

    // console.log('res2', res2);
};

const answerCustom = async () => {
    const username = 'binhbv@gmail.com';
    const session =
        'AYABeG8dx1mBX8WzMMUEsH9R1O4AHQABAAdTZXJ2aWNlABBDb2duaXRvVXNlclBvb2xzAAEAB2F3cy1rbXMAUGFybjphd3M6a21zOmFwLXNvdXRoZWFzdC0xOjAzMTU3NzI0MDA0ODprZXkvYmEwNzA1YzktMTI0Mi00ODg1LWJhMmYtNDhiMWNjYTNiNDNmALgBAgEAeHrsOKNetOa0ommxUjMKTLhF7X_jH4YrpkFmCKzo55rBAYS8xxgIavnu1ZTARQT-mqQAAAB-MHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAymXM9kxeknXtmSPqYCARCAO8RvEt3AWw6KInF0dm1MY_FsCd8RHXNZkM0_27yd2k-5ghnIhzPLlfqaBpT2ld_PNMSdswVL66oZVOiXAgAAAAAMAAAQAAAAAAAAAAAAAAAAAFFdjsK5UW7aZhYyDxdNSqL_____AAAAAQAAAAAAAAAAAAAAAQAAAROJSc6M0poZ7TbB-IbGy7Kl9Da_HdxLPNzAlezQacf8cATMMUSBCsek13l6QAY71tmYesdcEOnbM35of2I7BTUsaMxR-qtpyda44gTB4UWtO2ghdvTKx_GM7AlOn2pmuWEcIqRz77qHe196AEIW5lyLGgDGDyUvBXRJelQ-dDbs7Sh--rxDGKOp2_vbudVXRag668vYGKDu2tzVq2d-JDggTyeE1ftsXzPodNlv0RIno_fHJSZSz2xCAku-KVurvo-3bzD3dzjWGu-ebJTBahsbVEVD9Mqg-OsINqm82SKCvkiGPbbRzGrY--nvFxc2onWvgRSw7bZCcmI_LIyeRncKbycohJqYVGAqrMS6IVPQAlWXZh93MqOjvYCArf6QENxsA74';
    const command = new RespondToAuthChallengeCommand({
        ChallengeName: ChallengeNameType.CUSTOM_CHALLENGE,
        ClientId: '7i7l7j9ho6ph782opsk3vtbuni',
        ChallengeResponses: {
            USERNAME: username,
            ANSWER: '4671',
        },
        Session: session,
    });
    const res = await cognitoClient.send(command);
    console.log('res', res);
};

run();
// loginByRefeshToken();
// loginBySrcret();
// adminGetUser({
//     userPoolId,
//     // username: '53e27bbf-55ad-456d-ad38-ceca80457fec',
//     username: 'bvbinh@sk-global.biz'
// });

// loginCustom();
// answerCustom();
