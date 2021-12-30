import express from 'express';
import www from './routes/www';

const main = () => {
  const app = express();

  app.get('/', (_, res) => {
    res.send('started');
  });

  app.use('/www', www);

  app.use((err, res) => {
    console.error(err);
    res.status(500).send('Internal Serverless Error');
  });

  return app;
};

export default main;
