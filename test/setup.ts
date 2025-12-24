/**
 * Jest Test Setup
 * Global configuration for pVerify node tests
 */

// Extend Jest timeout for API tests
jest.setTimeout(30000);

// Mock console methods to reduce noise during tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
export const testCredentials = {
  clientId: process.env.PVERIFY_CLIENT_ID || 'test-client-id',
  clientSecret: process.env.PVERIFY_CLIENT_SECRET || 'test-client-secret',
  environment: 'sandbox' as const,
};

// Common test data
export const testProvider = {
  npi: '1234567890',
  firstName: 'John',
  lastName: 'Smith',
};

export const testSubscriber = {
  memberId: 'TEST123456',
  firstName: 'Jane',
  lastName: 'Doe',
  dob: '1985-03-15',
  gender: 'F' as const,
};

export const testDates = {
  dosStartDate: new Date().toISOString().split('T')[0],
  dosEndDate: new Date().toISOString().split('T')[0],
};
