// Jest setup file for global test configuration
// This file runs before each test suite

// Mock the database pool to prevent actual database connections during unit tests
jest.mock('../db/pool', () => ({
    query: jest.fn()
}));

// Suppress console.error during tests to keep output clean
// The error handling logic is still tested, we just don't want console noise
global.console.error = jest.fn();

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
