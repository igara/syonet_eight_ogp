const config = require('../../jest.config.js');

module.exports = {
  ...config,
  moduleNameMapper: {
    ...config.moduleNameMapper,
  },
};
