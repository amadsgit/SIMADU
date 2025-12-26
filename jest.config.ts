// jest.config.ts
import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  dir: './',
})

const config: Config = {
  testEnvironment: 'jsdom',
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'SIMADU Unit Test Report',
        outputPath: 'test-report.html',
        includeFailureMsg: true,
        includeSuiteFailure: true,
        theme: 'defaultTheme',
      },
    ],
  ],
}

export default createJestConfig(config)
