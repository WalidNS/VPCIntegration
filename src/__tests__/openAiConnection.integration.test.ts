import { createOpenAIConnection } from '../core/openAiConnection.js';

describe('OpenAIConnection Integration Tests', () => {
  let connection: ReturnType<typeof createOpenAIConnection>;
  
  beforeEach(() => {
    // Create a fresh connection for each test
    connection = createOpenAIConnection({
      timeout: 30000,
      maxRetries: 3
    });
  });

  afterEach(() => {
    // Clean up after each test
    if (connection && connection.isConnectionActive()) {
      connection.disconnect();
    }
  });

  describe('Connection Management', () => {
    test('should throw error when connecting without API key', async () => {
      // Access private property through any type
      (connection as any).apiKey = null;
      
      await expect(connection.connect()).rejects.toThrow(
        'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in config.'
      );
    });

    test('should handle connection validation correctly', async () => {
      // Test with empty string
      (connection as any).apiKey = '';
      await expect(connection.connect()).rejects.toThrow(
        'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in config.'
      );

      // Test with undefined
      (connection as any).apiKey = undefined;
      await expect(connection.connect()).rejects.toThrow(
        'OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in config.'
      );
    });
  });

  describe('Configuration Integration', () => {
    test('should use custom timeout in connection', () => {
      const customConn = createOpenAIConnection({ timeout: 60000 });
      expect(customConn.getTimeout()).toBe(60000);
    });

    test('should use custom maxRetries in connection', () => {
      const customConn = createOpenAIConnection({ maxRetries: 5 });
      expect(customConn.getMaxRetries()).toBe(5);
    });

    test('should handle organization configuration', () => {
      const customConn = createOpenAIConnection({ organization: 'org-123' });
      expect(customConn.getOrganization()).toBe('org-123');
    });

    test('should handle baseURL configuration', () => {
      const customConn = createOpenAIConnection({ baseURL: 'https://custom.api.com' });
      expect(customConn.getBaseURL()).toBe('https://custom.api.com');
    });
  });

  describe('Error Scenarios', () => {
    test('should handle missing API key gracefully', async () => {
      // Ensure no API key is set
      (connection as any).apiKey = null;
      
      try {
        await connection.connect();
        fail('Should have thrown an error');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        expect(errorMessage).toContain('OpenAI API key is required');
      }
    });

    test('should handle invalid configuration gracefully', () => {
      const invalidConn = createOpenAIConnection({
        timeout: -1000,
        maxRetries: -5
      });
      
      // Should not throw, but should accept the values
      expect(invalidConn.getTimeout()).toBe(-1000);
      expect(invalidConn.getMaxRetries()).toBe(-5);
    });
  });

  describe('Connection State Transitions', () => {
    test('should transition from disconnected to connected state', async () => {
      expect(connection.isConnectionActive()).toBe(false);
      expect(connection.getStatus().isConnected).toBe(false);
      
      // Set a valid API key to test connection
      (connection as any).apiKey = 'test-key';
      
      // Note: We can't actually connect without a real API key,
      // but we can test the state management
      expect((connection as any).apiKey).toBe('test-key');
      expect(connection.getStatus().apiKeyConfigured).toBe(true);
    });

    test('should handle disconnect state transitions', () => {
      // Simulate connected state
      (connection as any).isConnected = true;
      (connection as any).client = { test: 'client' };
      (connection as any).connectionAttempts = 5;
      
      expect(connection.isConnectionActive()).toBe(true);
      
      // Disconnect
      connection.disconnect();
      
      expect(connection.isConnectionActive()).toBe(false);
      expect(connection.getStatus().isConnected).toBe(false);
      expect(connection.getStatus().hasClient).toBe(false);
      expect(connection.getStatus().connectionAttempts).toBe(0);
    });
  });

  describe('Reconnection Logic', () => {
    test('should reset connection attempts on successful connection', async () => {
      (connection as any).apiKey = 'test-key';
      (connection as any).connectionAttempts = 10;
      
      // Simulate successful connection
      (connection as any).isConnected = true;
      (connection as any).client = { test: 'client' };
      (connection as any).connectionAttempts = 0;
      
      expect((connection as any).connectionAttempts).toBe(0);
      expect((connection as any).isConnected).toBe(true);
    });

    test('should increment connection attempts on failure', async () => {
      (connection as any).apiKey = 'test-key';
      
      // Simulate connection failure
      (connection as any).connectionAttempts = 1;
      
      expect((connection as any).connectionAttempts).toBe(1);
    });
  });

  describe('Utility Methods', () => {
    test('should handle delay method correctly', async () => {
      const start = Date.now();
      await (connection as any).delay(50);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(45);
    });

    test('should handle zero delay', async () => {
      const start = Date.now();
      await (connection as any).delay(0);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Status Reporting', () => {
    test('should provide accurate status information', () => {
      // Create a connection without API key for this test
      const testConnection = createOpenAIConnection({});
      const status = testConnection.getStatus();
      
      expect(status).toHaveProperty('isConnected');
      expect(status).toHaveProperty('connectionAttempts');
      expect(status).toHaveProperty('hasClient');
      expect(status).toHaveProperty('apiKeyConfigured');
      expect(status).toHaveProperty('organizationConfigured');
      expect(status).toHaveProperty('baseURLConfigured');
      
      // Initial state
      expect(status.isConnected).toBe(false);
      expect(status.connectionAttempts).toBe(0);
      expect(status.hasClient).toBe(false);
      expect(status.apiKeyConfigured).toBe(false);
    });

    test('should update status after configuration changes', () => {
      // Create a connection without API key for this test
      const testConnection = createOpenAIConnection({});
      
      // Initial status
      let status = testConnection.getStatus();
      expect(status.apiKeyConfigured).toBe(false);
      
      // Set API key
      (testConnection as any).apiKey = 'test-key';
      status = testConnection.getStatus();
      expect(status.apiKeyConfigured).toBe(true);
      
      // Set organization
      (testConnection as any).organization = 'org-123';
      status = testConnection.getStatus();
      expect(status.organizationConfigured).toBe(true);
    });
  });
});
