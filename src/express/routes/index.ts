import express from 'express';

const router = express.Router();

router.get('/', (_, res) => {
  res.status(200);
  res.send('started.');
});

export default router;
