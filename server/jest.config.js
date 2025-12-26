module.exports = {
    testEnvironment: 'node',
    collectCoverageFrom: [
        '**/*.js',
        '!**/node_modules/**',
        '!**/coverage/**',
        '!jest.config.js',
        '!db/migrate.js',
        '!app.js'
    ],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'html'],
    testMatch: [
        '**/__tests__/**/*.test.js',
        '**/?(*.)+(spec|test).js'
    ],
    setupFilesAfterEnv: ['<rootDir>/__tests__/setup.js'],
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true
};
