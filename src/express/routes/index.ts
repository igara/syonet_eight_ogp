import express from 'express';

const router = express.Router();

export const index = (_: express.Request, res: express.Response) => {
  res.status(200);
  res.send('started.');
};

router.get('/', index);

export default router;
