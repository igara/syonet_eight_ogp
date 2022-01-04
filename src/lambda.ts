import { APIGatewayEvent, Context, Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import express from './express';
import 'chrome-aws-lambda/bin/aws.tar.br';
import 'chrome-aws-lambda/bin/chromium.br';
import 'chrome-aws-lambda/bin/swiftshader.tar.br';

const app = express();

// @ts-ignore
let serverlessExpressInstance;

const asyncTask = () => {
  return new Promise((resolve) => {
    setTimeout(() => resolve('connected to database'), 1000);
  });
};

const setup = async (event: APIGatewayEvent, context: Context) => {
  const asyncValue = await asyncTask();
  console.log(asyncValue);
  serverlessExpressInstance = serverlessExpress({
    app,
    binarySettings: {
      isBinary: () => true,
      contentTypes: ['image/*', 'image/jpeg', 'image/png', 'image/svg+xml'],
    },
  });
  // @ts-ignore
  return serverlessExpressInstance(event, context);
};

export const handler: Handler = (event: APIGatewayEvent, context: Context) => {
  // @ts-ignore
  if (serverlessExpressInstance) return serverlessExpressInstance(event, context);

  return setup(event, context);
};
