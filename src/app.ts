import express from 'express';
import www from './routes/www';

const app = express();

app.get('/', (_, res) => {
  res.send('started');
});

app.use('/www', www);

app.use((err, res, f) => {
  console.error(err);
  res.status(500).send('Internal Serverless Error');
});

export default app;
