import { createOpenAIConnection, getDefaultConnection } from '../core/openAiConnection.js';

describe('OpenAIConnection', () => {
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

  describe('Constructor', () => {
    test('should create connection with default config', () => {
      const defaultConn = createOpenAIConnection();
      expect(defaultConn.getTimeout()).toBe(30000);
      expect(defaultConn.getMaxRetries()).toBe(3);
      expect(defaultConn.isConnectionActive()).toBe(false);
    });

    test('should create connection with custom config', () => {
      const customConn = createOpenAIConnection({
        timeout: 60000,
        maxRetries: 5,
        organization: 'org-123'
      });
      
      expect(customConn.getTimeout()).toBe(60000);
      expect(customConn.getMaxRetries()).toBe(5);
      expect(customConn.getOrganization()).toBe('org-123');
    });

    test('should read from environment variables', () => {
      // Mock environment variables
      process.env.OPENAI_API_KEY = 'test-key';
      process.env.OPENAI_ORG_ID = 'test-org';
      process.env.OPENAI_BASE_URL = 'https://test.api.com';
      
      const envConn = createOpenAIConnection();
      
      expect(envConn.getApiKey()).toBe('test-key');
      expect(envConn.getOrganization()).toBe('test-org');
      expect(envConn.getBaseURL()).toBe('https://test.api.com');
      
      // Clean up
      delete process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_ORG_ID;
      delete process.env.OPENAI_BASE_URL;
    });
  });

  describe('Connection Status', () => {
    test('should return correct initial status', () => {
      const status = connection.getStatus();
      
      expect(status).toEqual({
        isConnected: false,
        connectionAttempts: 0,
        hasClient: false,
        apiKeyConfigured: false,
        organizationConfigured: false,
        baseURLConfigured: false
      });
    });

    test('should check if connection is active', () => {
      expect(connection.isConnectionActive()).toBe(false);
      
      // Simulate connected state
      (connection as any).isConnected = true;
      (connection as any).client = {};
      
      expect(connection.isConnectionActive()).toBe(true);
    });
  });

  describe('Disconnection', () => {
    test('should handle disconnect when not connected', () => {
      expect(() => connection.disconnect()).not.toThrow();
      expect(connection.isConnectionActive()).toBe(false);
    });

    test('should reset connection state on disconnect', () => {
      // Simulate connected state
      (connection as any).isConnected = true;
      (connection as any).client = {};
      (connection as any).connectionAttempts = 5;
      
      connection.disconnect();
      
      expect(connection.isConnectionActive()).toBe(false);
      expect(connection.getStatus().isConnected).toBe(false);
      expect(connection.getStatus().hasClient).toBe(false);
      expect(connection.getStatus().connectionAttempts).toBe(0);
    });
  });

  describe('Utility Methods', () => {
    test('should delay for specified time', async () => {
      const start = Date.now();
      // Access private method through any type
      await (connection as any).delay(100);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(95);
    });

    test('should handle delay with zero time', async () => {
      const start = Date.now();
      await (connection as any).delay(0);
      const end = Date.now();
      
      expect(end - start).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Factory Function', () => {
    test('should create unique instances', () => {
      const conn1 = createOpenAIConnection({ timeout: 1000 });
      const conn2 = createOpenAIConnection({ timeout: 2000 });
      
      expect(conn1).not.toBe(conn2);
      expect(conn1.getTimeout()).toBe(1000);
      expect(conn2.getTimeout()).toBe(2000);
    });

    test('should handle empty config', () => {
      const conn = createOpenAIConnection();
      expect(conn.getTimeout()).toBe(30000);
      expect(conn.getMaxRetries()).toBe(3);
    });

    test('should handle partial config', () => {
      const conn = createOpenAIConnection({ timeout: 50000 });
      expect(conn.getTimeout()).toBe(50000);
      expect(conn.getMaxRetries()).toBe(3); // Should use default
    });
  });

  describe('Default Connection', () => {
    test('should create default connection lazily', () => {
      const conn1 = getDefaultConnection();
      const conn2 = getDefaultConnection();
      
      expect(conn1).toBe(conn2); // Same instance
      expect(conn1).toBeInstanceOf(connection.constructor);
    });

    test('should maintain singleton pattern', () => {
      const conn1 = getDefaultConnection();
      const conn2 = getDefaultConnection();
      
      // Modify one instance through any type
      (conn1 as any).timeout = 99999;
      
      // Both should reference the same instance
      expect((conn2 as any).timeout).toBe(99999);
    });
  });

  describe('Configuration Validation', () => {
    test('should handle invalid timeout gracefully', () => {
      const conn = createOpenAIConnection({ timeout: 'invalid' as any });
      expect(conn.getTimeout()).toBe('invalid' as any); // Currently accepts any value
    });

    test('should handle invalid maxRetries gracefully', () => {
      const conn = createOpenAIConnection({ maxRetries: 'invalid' as any });
      expect(conn.getMaxRetries()).toBe('invalid' as any); // Currently accepts any value
    });

    test('should handle null values', () => {
      const conn = createOpenAIConnection({ 
        timeout: null as any, 
        maxRetries: null as any,
        organization: null as any,
        baseURL: null as any
      });
      
      expect(conn.getTimeout()).toBe(30000); // null ?? 30000 = 30000
      expect(conn.getMaxRetries()).toBe(3); // null ?? 3 = 3
      expect(conn.getOrganization()).toBeUndefined(); // null ?? undefined = undefined
      expect(conn.getBaseURL()).toBeUndefined(); // null ?? undefined = undefined
    });

    test('should handle undefined values', () => {
      const conn = createOpenAIConnection({ 
        timeout: undefined, 
        maxRetries: undefined
      });
      
      expect(conn.getTimeout()).toBe(30000);
      expect(conn.getMaxRetries()).toBe(3);
    });
  });

  describe('State Management', () => {
    test('should track connection attempts correctly', () => {
      expect(connection.getStatus().connectionAttempts).toBe(0);
      
      // Simulate connection attempts
      (connection as any).connectionAttempts = 5;
      expect((connection as any).connectionAttempts).toBe(5);
    });

    test('should reset state on disconnect', () => {
      // Simulate connected state
      (connection as any).isConnected = true;
      (connection as any).client = { test: 'client' };
      (connection as any).connectionAttempts = 10;
      
      connection.disconnect();
      
      expect(connection.isConnectionActive()).toBe(false);
      expect(connection.getStatus().hasClient).toBe(false);
      expect(connection.getStatus().connectionAttempts).toBe(0);
    });
  });

  describe('Method Availability', () => {
    test('should have all required methods', () => {
      const requiredMethods = [
        'connect', 'disconnect', 'reconnect', 'getClient', 
        'isConnectionActive', 'getStatus', 'testConnection'
      ];
      
      requiredMethods.forEach(method => {
        expect(typeof (connection as any)[method]).toBe('function');
      });
    });

    test('should have all required properties', () => {
      const requiredProperties = [
        'getApiKey', 'getOrganization', 'getBaseURL', 'getTimeout', 
        'getMaxRetries', 'isConnectionActive'
      ];
      
      requiredProperties.forEach(prop => {
        expect(connection).toHaveProperty(prop);
      });
    });
  });
});
