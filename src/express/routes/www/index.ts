import express from 'express';
import chromium from 'chrome-aws-lambda';

const router = express.Router();

router.get('/', async (_, res) => {
  const browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: true,
    ignoreHTTPSErrors: true,
  });

  let page = await browser.newPage();

  await page.goto('https://dev.classmethod.jp/');

  const result = await page.title();
  await browser.close();
  // res.setHeader('Content-Type', Jimp.MIME_PNG);
  res.send(result);
});

export default router;
