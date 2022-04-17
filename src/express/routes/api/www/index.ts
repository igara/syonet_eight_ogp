import express from 'express';
import chromium from 'chrome-aws-lambda';
import puppeteer from 'puppeteer-core';
import AWS from 'aws-sdk';
import ogp630x630Image from '@ogp/src/images/www/ogp_630x630.png';
import titleAndFirstImageHTML from '@ogp/src/html/www/title_and_first_image.html';

const router = express.Router();

type QueryParams = {
  path: string;
  width: number;
  height: number;
  imageURL?: string;
};

const checkQuery = (query: any): QueryParams => {
  const q = Object.keys(query).reduce((prev, k) => {
    const newQuery = {
      ...prev,
      [k.replace('amp;', '')]: query[k],
    };
    return newQuery;
  }, {} as any);

  if (!q.path || typeof q.path !== 'string') {
    throw new Error('required path parameter');
  }
  if (!q.width || !/[0-9]*/.test(q.width)) {
    throw new Error('required width parameter');
  }
  if (!q.height || !/[0-9]*/.test(q.height)) {
    throw new Error('required height parameter');
  }

  return {
    ...q,
    path: q.path.replace(/   /g, '%20+%20'),
    width: Number(q.width),
    height: Number(q.height),
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
  const regex = /^data:.+\/(.+);base64,(.*)$/;
  const matches = (ogp630x630Image as unknown as string).match(regex);
  if (!matches || !matches[2]) return;

  const data = matches[2];
  const ogp = Buffer.from(data, 'base64');
  sendOGP(res, ogp);
};

const createPathOGPByTitleAndScreenshot = async (
  browser: puppeteer.Browser,
  query: QueryParams,
  res: express.Response,
) => {
  const s3 =
    process.env.HTTP_WWW_HOST === 'http://localhost:3000'
      ? new AWS.S3({
          s3ForcePathStyle: true,
          accessKeyId: 'S3RVER',
          secretAccessKey: 'S3RVER',
          endpoint: new AWS.Endpoint('http://localhost:4569'),
        })
      : new AWS.S3();

  try {
    const s3Object = await s3
      .getObject({
        Bucket: 'syonet-eight-ogp',
        Key: `www${query.path}_${query.width}x${query.height}.png`,
      })
      .promise();

    if (s3Object.Body) {
      const data = s3Object.Body.toString('base64');
      const ogp = Buffer.from(data, 'base64');
      sendOGP(res, ogp);
      return;
    }
  } catch (error) {
    if ((error as any).code !== 'NoSuchKey') {
      console.error(error);
      throw new Error('S3からファイルアクセスできませんでした');
    }
  }

  let ogpTargetPage = await browser.newPage();
  await ogpTargetPage.goto(`${process.env.HTTP_WWW_HOST}${query.path}`);

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
  await ogpTargetPage.close();

  const newOGPPage = await browser.newPage();
  await newOGPPage.setViewport({
    width: query.width,
    height: query.height,
  });

  const html = titleAndFirstImageHTML as string;
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
  await newOGPPage.close();

  const ogp: Buffer = Buffer.from(b64string, 'base64');

  try {
    await s3
      .putObject({
        Bucket: 'syonet-eight-ogp',
        Key: `www${query.path}_${query.width}x${query.height}.png`,
        Body: ogp,
        ContentType: 'image/png',
        CacheControl: 'max-age=86400',
        Expires: new Date(new Date().getTime() + 86400 * 1000),
      })
      .promise();
  } catch (error) {
    console.error(error);
    throw new Error('S3にファイル保存に失敗しました');
  }

  sendOGP(res, ogp);
};

const createPathOGP = async (
  browser: puppeteer.Browser,
  query: QueryParams,
  res: express.Response,
) => {
  if (/^\/blogs\/(qiita|hatena|speakerdeck|zenn\/article)\/\S*/.test(query.path)) {
    await createPathOGPByTitleAndScreenshot(browser, query, res);
    return;
  }

  sendEmptyOGP(res);
};

/**
 * @swagger
 * /api/www:
 *   get:
 *     description: pathにあわせたOGP画像を生成する
 *     produces:
 *       - image/png
 *     parameters:
 *       - in: query
 *         name: path
 *         description: wwwのurlのドメインを除いたpath
 *       - in: query
 *         name: width
 *         description: OGP画像の横幅
 *       - in: query
 *         name: height
 *         description: OGP画像の縦幅
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/png:
 *             schema:
 *               type: string
 *               format: binary
 */
export const index = async (req: express.Request, res: express.Response) => {
  let browser;

  try {
    const query = checkQuery(req.query);

    await chromium.font(
      `${process.env.HTTP_WWW_HOST}fonts/Noto_Sans_JP/NotoSansJP-Bold.otf`,
    );

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
