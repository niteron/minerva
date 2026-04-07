import 'dotenv/config';
import { defineBackend } from '@aws-amplify/backend';
import { auth } from './auth/resource';
import { createVoiceAgent } from './agent/resource';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cr from 'aws-cdk-lib/custom-resources';

const isSandbox = !process.env.AWS_BRANCH;

const backend = defineBackend({
  auth,
});

// AgentCore stack
const agentCoreStack = backend.createStack('AgentCoreStack');

// Resolve name suffix (sandbox vs branch)
let nameSuffix: string;
if (isSandbox) {
  const backendName = agentCoreStack.node.tryGetContext('amplify-backend-name') as string;
  nameSuffix = (backendName || 'dev').replace(/[^a-zA-Z0-9_]/g, '_');
} else {
  const branchName = process.env.AWS_BRANCH || 'main';
  nameSuffix = branchName.replace(/[^a-zA-Z0-9_]/g, '_');
}

// Voice agent runtime
const { runtime } = createVoiceAgent({
  stack: agentCoreStack,
  userPool: backend.auth.resources.userPool,
  userPoolClient: backend.auth.resources.userPoolClient,
  nameSuffix,
});

// Allow the Cognito authenticated role to open the AgentCore WebSocket stream
const authenticatedRole = backend.auth.resources.authenticatedUserIamRole;
authenticatedRole.addToPrincipalPolicy(new iam.PolicyStatement({
  actions: ['bedrock-agentcore:InvokeAgentRuntimeWithWebSocketStream'],
  resources: [
    runtime.agentRuntimeArn,
    `${runtime.agentRuntimeArn}/*`,
  ],
}));

// Expose runtime metadata to the frontend
backend.addOutput({
  custom: {
    agentRuntimeArn: runtime.agentRuntimeArn,
    environment: isSandbox ? 'sandbox' : nameSuffix,
  },
});

// Sandbox: optional test user provisioning
if (isSandbox) {
  const testUserEmail = process.env.TEST_USER_EMAIL;
  const testUserPassword = process.env.TEST_USER_PASSWORD;

  if (testUserEmail && testUserPassword) {
    const userPool = backend.auth.resources.userPool;

    const testUser = new cognito.CfnUserPoolUser(agentCoreStack, 'TestUser', {
      userPoolId: userPool.userPoolId,
      username: testUserEmail,
      userAttributes: [
        { name: 'email', value: testUserEmail },
        { name: 'email_verified', value: 'true' },
      ],
      messageAction: 'SUPPRESS',
    });

    const setPassword = new cr.AwsCustomResource(agentCoreStack, 'TestUserSetPassword', {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminSetUserPassword',
        parameters: {
          UserPoolId: userPool.userPoolId,
          Username: testUserEmail,
          Password: testUserPassword,
          Permanent: true,
        },
        physicalResourceId: cr.PhysicalResourceId.of(`TestUserPassword-${testUserEmail}`),
      },
      policy: cr.AwsCustomResourcePolicy.fromSdkCalls({
        resources: [userPool.userPoolArn],
      }),
    });

    setPassword.node.addDependency(testUser);
  }
}
