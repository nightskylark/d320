module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: ['/node_modules/(?!(react-markdown)/)']
};
