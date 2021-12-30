import express from 'express';
import index from './routes';
import www from './routes/www';

const main = () => {
  const app = express();

  app.use('/', index);
  app.use('/www', www);

  app.use((err, res) => {
    console.error(err);
    res.status(500).send('Internal Serverless Error');
  });

  return app;
};

export default main;
