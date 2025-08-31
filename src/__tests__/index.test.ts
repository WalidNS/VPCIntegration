import { jest } from '@jest/globals';

// Mock all the modules to avoid actual imports during testing
jest.mock('../core/openAiConnection.js', () => ({
  OpenAIConnection: jest.fn(),
  createOpenAIConnection: jest.fn(),
  getDefaultConnection: jest.fn()
}));

jest.mock('../services/mcpClient.js', () => ({
  MCPClient: jest.fn(),
  createMCPClient: jest.fn()
}));

jest.mock('../main.js', () => ({
  main: jest.fn()
}));

describe('index.ts exports', () => {
  let indexExports: any;

  beforeEach(async () => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Import the index module using dynamic import
    const module = await import('../index.js');
    indexExports = module;
  });

  describe('Core exports', () => {
    test('should export OpenAIConnection from core module', () => {
      expect(indexExports.OpenAIConnection).toBeDefined();
      expect(typeof indexExports.OpenAIConnection).toBe('function');
    });

    test('should export createOpenAIConnection from core module', () => {
      expect(indexExports.createOpenAIConnection).toBeDefined();
      expect(typeof indexExports.createOpenAIConnection).toBe('function');
    });

    test('should export getDefaultConnection from core module', () => {
      expect(indexExports.getDefaultConnection).toBeDefined();
      expect(typeof indexExports.getDefaultConnection).toBe('function');
    });
  });

  describe('Service exports', () => {
    test('should export MCPClient from services module', () => {
      expect(indexExports.MCPClient).toBeDefined();
      expect(typeof indexExports.MCPClient).toBe('function');
    });

    test('should export createMCPClient from services module', () => {
      expect(indexExports.createMCPClient).toBeDefined();
      expect(typeof indexExports.createMCPClient).toBe('function');
    });
  });

  describe('Main application export', () => {
    test('should export main function from main module', () => {
      expect(indexExports.main).toBeDefined();
      expect(typeof indexExports.main).toBe('function');
    });
  });

  describe('Export structure', () => {
    test('should have all expected runtime exports', () => {
      const expectedExports = [
        // Core exports
        'OpenAIConnection',
        'createOpenAIConnection',
        'getDefaultConnection',
        
        // Service exports
        'MCPClient',
        'createMCPClient',
        
        // Main application
        'main'
      ];

      expectedExports.forEach(exportName => {
        expect(indexExports).toHaveProperty(exportName);
      });
    });

    test('should not have unexpected exports', () => {
      const actualExports = Object.keys(indexExports);
      const expectedExports = [
        'OpenAIConnection',
        'createOpenAIConnection',
        'getDefaultConnection',
        'MCPClient',
        'createMCPClient',
        'main'
      ];

      expect(actualExports.sort()).toEqual(expectedExports.sort());
    });
  });

  describe('Module resolution', () => {
    test('should resolve core module correctly', async () => {
      const module = await import('../core/openAiConnection.js');
      expect(module.OpenAIConnection).toBeDefined();
    });

    test('should resolve services module correctly', async () => {
      const module = await import('../services/mcpClient.js');
      expect(module.MCPClient).toBeDefined();
    });

    test('should resolve main module correctly', async () => {
      const module = await import('../main.js');
      expect(module.main).toBeDefined();
    });
  });
});
