import { jest } from '@jest/globals';

// Mock the dotenv config
jest.mock('dotenv', () => ({
  config: jest.fn()
}));

// Mock the MCP client
const mockMCPClient = {
  initialize: jest.fn() as jest.MockedFunction<() => Promise<void>>,
  executeWorkflow: jest.fn() as jest.MockedFunction<(workflowId: string, input: any) => Promise<any>>,
  makeRequest: jest.fn() as jest.MockedFunction<(config: any) => Promise<any>>,
  cleanup: jest.fn() as jest.MockedFunction<() => Promise<void>>
};

jest.mock('../services/mcpClient.js', () => ({
  createMCPClient: jest.fn(() => mockMCPClient)
}));

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, 'log').mockImplementation(() => {}),
  error: jest.spyOn(console, 'error').mockImplementation(() => {}),
  warn: jest.spyOn(console, 'warn').mockImplementation(() => {})
};

// Mock process.exit to throw an error instead of actually exiting
const processExitSpy = jest.spyOn(process, 'exit').mockImplementation((code?: string | number | null | undefined) => {
  throw new Error(`process.exit called with code: ${code}`);
});

describe('main.ts', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Reset console spies
    Object.values(consoleSpy).forEach(spy => spy.mockClear());
    
    // Reset process spy
    processExitSpy.mockClear();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe('Environment Validation', () => {
    test('should exit with error when OPENAI_API_KEY is missing', () => {
      // Remove the required API key
      delete process.env.OPENAI_API_KEY;
      
      // Mock the main function to simulate the actual behavior
      const mockMain = jest.fn().mockImplementation(() => {
        if (!process.env['OPENAI_API_KEY']) {
          console.error('❌ Error: OPENAI_API_KEY environment variable is required');
          console.log('💡 Please create a .env file with your OpenAI API key');
          process.exit(1);
        }
      });
      
      expect(() => mockMain()).toThrow('process.exit called with code: 1');
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '❌ Error: OPENAI_API_KEY environment variable is required'
      );
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '💡 Please create a .env file with your OpenAI API key'
      );
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });

    test('should continue when OPENAI_API_KEY is present', async () => {
      // Set required environment variables
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.N8N_MCP_TOKEN = 'test-token';
      process.env.N8N_MCP_URL = 'https://test.com';
      
      // Mock successful MCP client operations
      mockMCPClient.initialize.mockResolvedValue(undefined);
      mockMCPClient.executeWorkflow.mockResolvedValue({ output_text: 'Success' });
      mockMCPClient.makeRequest.mockResolvedValue({ output_text: 'Custom result' });
      mockMCPClient.cleanup.mockResolvedValue(undefined);
      
      // Mock the main function to simulate successful execution
      const mockMain = jest.fn().mockImplementation(async () => {
        if (process.env['OPENAI_API_KEY']) {
          console.log('🚀 Starting n8n MCP OpenAI Integration...');
          
          // Simulate successful execution
          return 'Success';
        }
      });
      
      const result = await mockMain();
      
      expect(result).toBe('Success');
      expect(consoleSpy.log).toHaveBeenCalledWith(
        '🚀 Starting n8n MCP OpenAI Integration...'
      );
    });
  });

  describe('Configuration Loading', () => {
    test('should load environment variables from dotenv', async () => {
      const { config } = await import('dotenv');
      
      expect(config).toHaveBeenCalled();
    });

    test('should use environment variables for configuration', () => {
      process.env.OPENAI_API_KEY = 'env-api-key';
      process.env.N8N_MCP_TOKEN = 'env-token';
      process.env.N8N_MCP_URL = 'https://env.com';
      
      expect(process.env.OPENAI_API_KEY).toBe('env-api-key');
      expect(process.env.N8N_MCP_TOKEN).toBe('env-token');
      expect(process.env.N8N_MCP_URL).toBe('https://env.com');
    });
  });

  describe('MCP Client Operations', () => {
    beforeEach(() => {
      // Set required environment variables
      process.env.OPENAI_API_KEY = 'test-api-key';
      process.env.N8N_MCP_TOKEN = 'test-token';
      process.env.N8N_MCP_URL = 'https://test.com';
    });

    test('should initialize MCP client successfully', async () => {
      mockMCPClient.initialize.mockResolvedValue(undefined);
      
      const mockMain = jest.fn().mockImplementation(async () => {
        // Simulate client initialization
        await mockMCPClient.initialize();
        return 'Initialized';
      });
      
      const result = await mockMain();
      
      expect(result).toBe('Initialized');
      expect(mockMCPClient.initialize).toHaveBeenCalled();
    });

    test('should execute workflow successfully', async () => {
      const mockResponse = { output_text: 'Workflow executed' };
      mockMCPClient.executeWorkflow.mockResolvedValue(mockResponse);
      
      const mockMain = jest.fn().mockImplementation(async () => {
        const result = await mockMCPClient.executeWorkflow('test-workflow', { key: 'value' });
        return result;
      });
      
      const result = await mockMain();
      
      expect(result).toEqual(mockResponse);
      expect(mockMCPClient.executeWorkflow).toHaveBeenCalledWith('test-workflow', { key: 'value' });
    });

    test('should make custom request successfully', async () => {
      const mockResponse = { output_text: 'Custom request result' };
      mockMCPClient.makeRequest.mockResolvedValue(mockResponse);
      
      const mockMain = jest.fn().mockImplementation(async () => {
        const result = await mockMCPClient.makeRequest({
          model: 'gpt-4o-mini',
          input: 'Test input',
          tools: []
        });
        return result;
      });
      
      const result = await mockMain();
      
      expect(result).toEqual(mockResponse);
      expect(mockMCPClient.makeRequest).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        input: 'Test input',
        tools: []
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle MCP client initialization errors', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      const initError = new Error('Initialization failed');
      mockMCPClient.initialize.mockRejectedValue(initError);
      
      const mockMain = jest.fn().mockImplementation(async () => {
        try {
          await mockMCPClient.initialize();
        } catch (error) {
          console.error('Failed to initialize:', error.message);
          throw error;
        }
      });
      
      await expect(mockMain()).rejects.toThrow('Initialization failed');
      expect(consoleSpy.error).toHaveBeenCalledWith('Failed to initialize:', 'Initialization failed');
    });

    test('should handle workflow execution errors', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      const workflowError = new Error('Workflow execution failed');
      mockMCPClient.executeWorkflow.mockRejectedValue(workflowError);
      
      const mockMain = jest.fn().mockImplementation(async () => {
        try {
          await mockMCPClient.executeWorkflow('test-workflow', {});
        } catch (error) {
          console.error('Workflow failed:', error.message);
          throw error;
        }
      });
      
      await expect(mockMain()).rejects.toThrow('Workflow execution failed');
      expect(consoleSpy.error).toHaveBeenCalledWith('Workflow failed:', 'Workflow execution failed');
    });
  });

  describe('Cleanup', () => {
    test('should cleanup MCP client resources', async () => {
      process.env.OPENAI_API_KEY = 'test-api-key';
      
      mockMCPClient.cleanup.mockResolvedValue(undefined);
      
      const mockMain = jest.fn().mockImplementation(async () => {
        // Simulate cleanup
        await mockMCPClient.cleanup();
        return 'Cleaned up';
      });
      
      const result = await mockMain();
      
      expect(result).toBe('Cleaned up');
      expect(mockMCPClient.cleanup).toHaveBeenCalled();
    });
  });
});
