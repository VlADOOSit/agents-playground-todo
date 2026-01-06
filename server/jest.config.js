module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: [
        '**/*.js',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!jest.config.js',
        '!src/db/migrate.js',
        '!src/app.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: [
        '**/tests/**/*.test.js',
        '**/?(*.)+(spec|test).js'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};
