import express from 'express';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import '@ogp/src/images/www/ogp_630x630.png';
import '@ogp/src/html/www/title_and_first_image.html';

const router = express.Router();

type QueryParams = {
  path: string;
  width: number;
  height: number;
  imageURL?: string;
};

const checkQuery = (query: any): QueryParams => {
  if (typeof query.path !== 'string') {
    throw new Error('required path parameter');
  }
  if (!/[1-9]*/.test(query.width)) {
    throw new Error('required width parameter');
  }
  if (!/[1-9]*/.test(query.height)) {
    throw new Error('required height parameter');
  }

  return {
    ...query,
    path: query.path.replace(/   /g, '%20+%20'),
    width: Number(query.width),
    height: Number(query.height),
  };
};

const sendOGP = (res: express.Response, ogp: Buffer) => {
  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': Buffer.byteLength(ogp),
  });
  res.end(ogp);
};

const sendEmptyOGP = (res: express.Response) => {
  const ogp = fs.readFileSync('src/images/www/ogp_630x630.png');
  sendOGP(res, ogp);
};

const createPathOGPByTitleAndScreenshot = async (
  browser: puppeteer.Browser,
  query: QueryParams,
  res: express.Response,
) => {
  let ogpTargetPage = await browser.newPage();
  await ogpTargetPage.goto(`${process.env.HTTP_WWW_HOST}/${query.path}`);

  const ogpTitle = await ogpTargetPage.title();

  const firstImageBaseURI = await ogpTargetPage.evaluate(() => {
    const imgElement = document.querySelector('img');
    if (!imgElement) return '';

    const canvas = document.createElement('canvas');
    canvas.width = imgElement.width;
    canvas.height = imgElement.height;
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    ctx.drawImage(imgElement, 0, 0);

    return canvas.toDataURL('image/png');
  });

  const newOGPPage = await browser.newPage();
  newOGPPage.setViewport({
    width: query.width,
    height: query.height,
  });

  const html = fs.readFileSync('src/html/www/title_and_first_image.html').toString();
  await newOGPPage.setContent(html);

  await newOGPPage.evaluate(
    (args: { title: string; firstImageBaseURI: string }) => {
      const titleElement = document.querySelector('.title');
      if (!titleElement) return;

      titleElement.innerHTML = args.title;

      const backgroundElement = document.querySelector('img');
      if (!backgroundElement) return;

      if (args.firstImageBaseURI) {
        backgroundElement.src = args.firstImageBaseURI;
      } else {
        Object.assign(backgroundElement.style, {
          display: 'none',
        });
      }
    },
    { title: ogpTitle, firstImageBaseURI },
  );

  const b64string: string = (await newOGPPage.screenshot({
    encoding: 'base64',
  })) as string;
  const ogp: Buffer = Buffer.from(b64string, 'base64');
  sendOGP(res, ogp);
};

const createPathOGP = async (
  browser: puppeteer.Browser,
  query: QueryParams,
  res: express.Response,
) => {
  if (/^\/blogs\/qiita\/\S*/.test(query.path)) {
    await createPathOGPByTitleAndScreenshot(browser, query, res);
    return;
  }

  sendEmptyOGP(res);
};

export const index = async (req: express.Request, res: express.Response) => {
  let browser;
  try {
    const query = checkQuery(req.query);

    browser = (await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    })) as unknown as puppeteer.Browser;

    await createPathOGP(browser, query, res);
  } catch (error) {
    console.error(error);

    sendEmptyOGP(res);
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

router.get('/', index);

export default router;
