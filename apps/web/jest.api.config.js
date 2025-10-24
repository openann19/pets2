/**
 * Jest configuration for API tests
 */
module.exports = {
    setupFilesAfterEnv: ['<rootDir>/__tests__/api-test.setup.js'],
    testMatch: [
        '**/__tests__/api/status.test.js',
        '**/__tests__/api/delete.test.js',
        '**/__tests__/api/cancel-deletion.test.js',
        '**/__tests__/api/export-data.test.js',
        '**/__tests__/api/export-download.test.js',
        '**/__tests__/api/workflows.test.js',
        '**/__tests__/api/extended-export.test.js',
        '**/__tests__/api/error-handling.test.js',
        '**/__tests__/api/export-progress.test.js'
    ],
    testEnvironment: 'node',
    rootDir: '.',
    moduleDirectories: ['node_modules', '<rootDir>', '<rootDir>/__tests__/mocks'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }]
    }
};