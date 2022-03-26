import express from 'express';
import apiwww from './routes/api/www';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerHtml from '@ogp/src/html/swagger.html';
import swaggerJSON from '@ogp/src/json/swagger.json';
import cors from 'cors';

const main = () => {
  const app = express();

  app.use(cors());

  app.get('/', (_, res) => {
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(swaggerHtml);
  });

  app.get(['/swagger.json'], async (_, res) => {
    res.set('Content-Type', 'application/json; charset=utf-8');

    if (process.env.NODE_ENV === 'production') {
      res.send(swaggerJSON);
      return;
    }

    const options = {
      swaggerDefinition: {
        info: {
          title: 'syonet_eight_ogp',
          version: '1.0.0',
          description: 'OGP用API',
        },
        basePath: `/${process.env.NODE_ENV}`,
      },
      apis: ['./**/*.ts'],
    };
    const specs = swaggerJSDoc(options);
    res.send(specs);
  });

  app.use('/api/www', apiwww);

  app.use((err, res) => {
    console.error(err);
    res.status(500).send('Internal Serverless Error');
  });

  return app;
};

export default main;
