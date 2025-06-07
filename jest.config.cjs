module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest'
  },
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^@milkdown/react$': '<rootDir>/src/__mocks__/milkdown-react.js',
    '^@milkdown/.*$': '<rootDir>/src/__mocks__/milkdown-other.js'
  }
};
