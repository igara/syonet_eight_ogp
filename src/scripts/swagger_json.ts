import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';

const options = {
  swaggerDefinition: {
    info: {
      title: 'syonet_eight_ogp',
      version: '1.0.0',
      description: 'OGP用API',
    },
    basePath: '/',
  },
  apis: [`${__dirname}/../express/**/*.ts`],
};
const specs = swaggerJSDoc(options);
const json = JSON.stringify(specs);

console.info(json);

fs.writeFileSync(`${__dirname}/../json/swagger.json`, json);
