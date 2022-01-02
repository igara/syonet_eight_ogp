import express from 'express';
import index from './routes';
import www from './routes/www';
import swaggerUI from 'swagger-ui-express';
import swaggerJSDoc from 'swagger-jsdoc';

const main = () => {
  const app = express();

  app.use('/', index);
  app.use('/www', www);

  const options = {
    swaggerDefinition: {
      info: {
        title: 'syonet_eight_ogp',
        version: '1.0.0',
        description: 'OGP用API',
      },
      basePath: process.env.NODE_ENV === 'production' ? '/' : `/${process.env.NODE_ENV}`,
    },
    // List of files to be processes. You can also set globs './routes/*.js'
    apis: ['./**/*.ts'],
  };
  const specs = swaggerJSDoc(options);
  app.use(
    '/api-docs/',
    swaggerUI.serveWithOptions({ redirect: false }),
    swaggerUI.setup(specs),
  );

  app.use((err, res) => {
    console.error(err);
    res.status(500).send('Internal Serverless Error');
  });

  return app;
};

export default main;
