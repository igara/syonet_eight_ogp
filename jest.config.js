const config = require('../../jest.config.js');

module.exports = {
  ...config,
  moduleNameMapper: {
    ...config.moduleNameMapper,
    '\\.(html)$': '<rootDir>/../../__mocks__/image_mock.js',
    '^@ogp/(.+)': '<rootDir>/$1',
  },
};
