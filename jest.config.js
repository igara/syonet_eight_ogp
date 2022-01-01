const config = require('../../jest.config.js');

module.exports = {
  ...config,
  moduleNameMapper: {
    '^@ogp/(.+)': '<rootDir>/$1',
    ...config.moduleNameMapper,
  },
};
