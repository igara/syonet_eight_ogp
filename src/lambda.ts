import { APIGatewayEvent, Context, Handler } from "aws-lambda";
import * as awsServerlessExpress from "aws-serverless-express";
import express from "./express";

export const handler: Handler = (
  event: APIGatewayEvent,
  context: Context
) => {
  const app = express();
  const server = awsServerlessExpress.createServer(app);
  awsServerlessExpress.proxy(server, event, context);
};
