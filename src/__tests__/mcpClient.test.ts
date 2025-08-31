import { jest } from '@jest/globals';

// Mock the OpenAI connection module
const mockConnection = {
  connect: jest.fn() as jest.MockedFunction<() => Promise<void>>,
  disconnect: jest.fn() as jest.MockedFunction<() => Promise<void>>,
  isConnectionActive: jest.fn() as jest.MockedFunction<() => boolean>,
  getClient: jest.fn() as jest.MockedFunction<() => any>,
  getStatus: jest.fn() as jest.MockedFunction<() => any>
};

const mockCreateOpenAIConnection = jest.fn(() => mockConnection) as jest.MockedFunction<(config?: any) => any>;

jest.mock('../core/openAiConnection.js', () => ({
  createOpenAIConnection: mockCreateOpenAIConnection
}));

// Import after mocking
import { MCPClient, createMCPClient } from '../services/mcpClient.js';
import type { OpenAIConnectionConfig, MCPRequestConfig, MCPResponse } from '../types/index.js';

describe('MCPClient', () => {
  let mcpClient: MCPClient;
  let mockOpenAIClient: any;

  const defaultOpenAIConfig: OpenAIConnectionConfig = {
    apiKey: 'test-api-key',
    timeout: 30000,
    maxRetries: 3
  };

  const defaultN8nConfig = {
    token: 'test-token',
    url: 'https://test-n8n.com'
  };

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock OpenAI client
    mockOpenAIClient = {
      responses: {
        create: jest.fn()
      }
    };

    // Reset mock connection methods
    mockConnection.connect.mockResolvedValue(undefined);
    mockConnection.disconnect.mockResolvedValue(undefined);
    mockConnection.isConnectionActive.mockReturnValue(false);
    mockConnection.getClient.mockReturnValue(mockOpenAIClient);
    mockConnection.getStatus.mockReturnValue({
      isConnected: false,
      connectionAttempts: 0,
      hasClient: false,
      apiKeyConfigured: true,
      organizationConfigured: false,
      baseURLConfigured: false
    });

    // Reset the factory function mock
    mockCreateOpenAIConnection.mockReturnValue(mockConnection);

    // Create MCP client instance
    mcpClient = new MCPClient(defaultOpenAIConfig, defaultN8nConfig);
  });

  describe('Constructor', () => {
    test('should create MCPClient with provided configuration', () => {
      expect(mcpClient).toBeInstanceOf(MCPClient);
      expect(mockCreateOpenAIConnection).toHaveBeenCalledWith(defaultOpenAIConfig);
    });

    test('should store n8n MCP configuration', () => {
      // Access private properties for testing
      expect((mcpClient as any).n8nMcpToken).toBe('test-token');
      expect((mcpClient as any).n8nMcpUrl).toBe('https://test-n8n.com');
    });
  });

  describe('initialize', () => {
    test('should initialize successfully when connection succeeds', async () => {
      mockConnection.connect.mockResolvedValue(undefined);
      mockConnection.isConnectionActive.mockReturnValue(true);
      
      await mcpClient.initialize();
      
      expect(mockConnection.connect).toHaveBeenCalled();
    });

    test('should throw error when connection fails', async () => {
      const connectionError = new Error('Connection failed');
      mockConnection.connect.mockRejectedValue(connectionError);

      await expect(mcpClient.initialize()).rejects.toThrow(
        'Failed to initialize MCP Client: Connection failed'
      );
    });

    test('should handle unknown errors gracefully', async () => {
      mockConnection.connect.mockRejectedValue('Unknown error');

      await expect(mcpClient.initialize()).rejects.toThrow(
        'Failed to initialize MCP Client: Unknown error'
      );
    });
  });

  describe('makeRequest', () => {
    const mockRequestConfig: MCPRequestConfig = {
      model: 'gpt-4o-mini',
      input: 'Test input message',
      tools: [
        {
          type: 'mcp_server',
          server_url: 'https://mcp.example.com',
          auth: {
            type: 'bearer',
            token: 'test-token'
          }
        }
      ]
    };

    beforeEach(async () => {
      // Initialize the client first
      mockConnection.connect.mockResolvedValue(undefined);
      mockConnection.isConnectionActive.mockReturnValue(true);
      await mcpClient.initialize();
    });

    test('should make request successfully with MCP tool configuration', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Test response content'
            }
          }
        ]
      };

      mockOpenAIClient.responses.create.mockResolvedValue(mockResponse);

      const result = await mcpClient.makeRequest(mockRequestConfig);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('You are an AI assistant')
          },
          {
            role: 'user',
            content: 'Test input message'
          }
        ],
        tools: [
          {
            type: 'mcp_server',
            server_url: 'https://mcp.example.com',
            auth: {
              type: 'bearer',
              token: 'test-token'
            }
          }
        ]
      });

      expect(result).toEqual({
        output_text: 'Test response content'
      });
    });

    test('should handle OpenAI API errors gracefully', async () => {
      const apiError = new Error('OpenAI API error');
      mockOpenAIClient.responses.create.mockRejectedValue(apiError);

      await expect(mcpClient.makeRequest(mockRequestConfig)).rejects.toThrow(
        'MCP request failed: OpenAI API error'
      );
    });

    test('should handle unknown errors gracefully', async () => {
      mockOpenAIClient.responses.create.mockRejectedValue('Unknown error');

      await expect(mcpClient.makeRequest(mockRequestConfig)).rejects.toThrow(
        'MCP request failed: Unknown error'
      );
    });
  });

  describe('executeWorkflow', () => {
    beforeEach(async () => {
      // Initialize the client first
      mockConnection.connect.mockResolvedValue(undefined);
      mockConnection.isConnectionActive.mockReturnValue(true);
      await mcpClient.initialize();
    });

    test('should execute workflow with correct parameters', async () => {
      const workflowId = 'test-workflow-123';
      const input = { key: 'value' };
      const instructions = 'Custom instructions';

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Workflow executed successfully'
            }
          }
        ]
      };

      mockOpenAIClient.responses.create.mockResolvedValue(mockResponse);

      const result = await mcpClient.executeWorkflow(workflowId, input, instructions);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('Custom instructions')
          },
          {
            role: 'user',
            content: expect.stringContaining('test-workflow-123')
          }
        ],
        tools: [
          {
            type: 'mcp_server',
            server_url: 'https://test-n8n.com',
            auth: {
              type: 'bearer',
              token: 'test-token'
            }
          }
        ]
      });

      expect(result).toEqual({
        output_text: 'Workflow executed successfully'
      });
    });

    test('should use default instructions when not provided', async () => {
      const workflowId = 'test-workflow-123';
      const input = { key: 'value' };

      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Workflow executed with default instructions'
            }
          }
        ]
      };

      mockOpenAIClient.responses.create.mockResolvedValue(mockResponse);

      await mcpClient.executeWorkflow(workflowId, input);

      expect(mockOpenAIClient.responses.create).toHaveBeenCalledWith({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: expect.stringContaining('Execute the n8n workflow')
          },
          {
            role: 'user',
            content: expect.stringContaining('test-workflow-123')
          }
        ],
        tools: [
          {
            type: 'mcp_server',
            server_url: 'https://test-n8n.com',
            auth: {
              type: 'bearer',
              token: 'test-token'
            }
          }
        ]
      });
    });

    test('should handle workflow execution errors', async () => {
      const workflowId = 'test-workflow-123';
      const input = { key: 'value' };

      const workflowError = new Error('Workflow execution failed');
      mockOpenAIClient.responses.create.mockRejectedValue(workflowError);

      await expect(mcpClient.executeWorkflow(workflowId, input)).rejects.toThrow(
        'Workflow execution failed: Workflow execution failed'
      );
    });
  });

  describe('getStatus', () => {
    test('should return connection status', () => {
      const expectedStatus = {
        isConnected: false,
        connectionAttempts: 0,
        hasClient: false,
        apiKeyConfigured: true,
        organizationConfigured: false,
        baseURLConfigured: false
      };

      mockConnection.getStatus.mockReturnValue(expectedStatus);

      const status = mcpClient.getStatus();

      expect(mockConnection.getStatus).toHaveBeenCalled();
      expect(status).toEqual(expectedStatus);
    });
  });

  describe('isReady', () => {
    test('should return true when connection is active', () => {
      mockConnection.isConnectionActive.mockReturnValue(true);

      expect(mcpClient.isReady()).toBe(true);
      expect(mockConnection.isConnectionActive).toHaveBeenCalled();
    });

    test('should return false when connection is not active', () => {
      mockConnection.isConnectionActive.mockReturnValue(false);

      expect(mcpClient.isReady()).toBe(false);
      expect(mockConnection.isConnectionActive).toHaveBeenCalled();
    });
  });

  describe('cleanup', () => {
    test('should disconnect the connection', async () => {
      await mcpClient.cleanup();

      expect(mockConnection.disconnect).toHaveBeenCalled();
    });
  });
});

describe('createMCPClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateOpenAIConnection.mockReturnValue(mockConnection);
  });

  test('should create MCPClient instance with factory function', () => {
    const openAIConfig: OpenAIConnectionConfig = {
      apiKey: 'factory-api-key',
      timeout: 60000
    };

    const n8nConfig = {
      token: 'factory-token',
      url: 'https://factory.com'
    };

    const client = createMCPClient(openAIConfig, n8nConfig);

    expect(client).toBeInstanceOf(MCPClient);
    expect(mockCreateOpenAIConnection).toHaveBeenCalledWith(openAIConfig);
  });

  test('should create MCPClient with default OpenAI config when not provided', () => {
    const n8nConfig = {
      token: 'default-token',
      url: 'https://default.com'
    };

    const client = createMCPClient(undefined, n8nConfig);

    expect(client).toBeInstanceOf(MCPClient);
    expect(mockCreateOpenAIConnection).toHaveBeenCalledWith({});
  });
});
