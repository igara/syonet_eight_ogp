import { APIGatewayEvent, Context, Handler } from 'aws-lambda';
import * as awsServerlessExpress from 'aws-serverless-express';
import express from './express';
import 'chrome-aws-lambda/bin/aws.tar.br';
import 'chrome-aws-lambda/bin/chromium.br';
import 'chrome-aws-lambda/bin/swiftshader.tar.br';

export const handler: Handler = (event: APIGatewayEvent, context: Context) => {
  const app = express();
  const server = awsServerlessExpress.createServer(app);
  awsServerlessExpress.proxy(server, event, context);
};
