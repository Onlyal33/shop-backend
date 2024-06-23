import {
  APIGatewayAuthorizerResult,
  APIGatewayRequestAuthorizerEventV2,
  StatementEffect,
} from 'aws-lambda';

type Context = {};

export default function basicAuthorizer(
  event: APIGatewayRequestAuthorizerEventV2,
  _ctx: any,
  cb: Function
) {
  if (!event.type || event.type !== 'REQUEST') {
    cb('Unauthorized');
  }

  try {
    const authorizationToken = event.headers.authorization;

    if (!authorizationToken) {
      cb('Unauthorized');
    }

    const encodedCredentials = authorizationToken.split(' ')[1];
    const decodedCredentials = Buffer.from(
      encodedCredentials,
      'base64'
    ).toString('utf8');
    const [username, password] = decodedCredentials.split(':');
    const expectedPassword = process.env[username];
    const effect =
      !expectedPassword || expectedPassword !== password ? 'Deny' : 'Allow';

    const policy = generatePolicy(encodedCredentials, event.routeArn, effect);

    cb(null, policy);
  } catch (error) {
    cb(`Unauthorized: ${error.message}`);
  }
}

const generatePolicy = (
  principalId: string,
  resource: string,
  effect: StatementEffect,
): APIGatewayAuthorizerResult => {
  const authResponse: APIGatewayAuthorizerResult = {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };

  return authResponse;
};
