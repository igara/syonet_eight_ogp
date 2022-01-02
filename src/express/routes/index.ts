import express from 'express';

const router = express.Router();

export const index = (req: express.Request, res: express.Response) => {
  const host = req.get('host');

  let apiDocURL;
  if (process.env.NODE_ENV === 'production') {
    apiDocURL = `${req.protocol}://${host}${req.originalUrl}api-docs/`;
  } else {
    apiDocURL = `${req.protocol}://${host}${req.originalUrl}${process.env.NODE_ENV}/api-docs/`;
  }

  res.status(200);
  res.send(`started.<br><a href="${apiDocURL}">Swagger UI</a>`);
};

router.get('/', index);

export default router;
