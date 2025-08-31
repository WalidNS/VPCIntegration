import { jest } from '@jest/globals';

// Import all types to verify they are properly defined
import type {
  OpenAIConnectionConfig,
  ConnectionStatus,
  OpenAIError,
  OpenAIResponse,
  OpenAIModel,
  OpenAIChatMessage,
  OpenAIChatCompletion,
  OpenAIClient,
  MCPToolConfig,
  MCPRequestConfig,
  MCPResponse
} from '../types/index.js';

describe('Types', () => {
  describe('OpenAIConnectionConfig', () => {
    test('should have correct structure', () => {
      // Test that the interface can be used to create objects
      const config: OpenAIConnectionConfig = {
        apiKey: 'test-key',
        organization: 'test-org',
        baseURL: 'https://test.com',
        timeout: 30000,
        maxRetries: 3
      };

      expect(config.apiKey).toBe('test-key');
      expect(config.organization).toBe('test-org');
      expect(config.baseURL).toBe('https://test.com');
      expect(config.timeout).toBe(30000);
      expect(config.maxRetries).toBe(3);
    });

    test('should allow partial configuration', () => {
      const partialConfig: OpenAIConnectionConfig = {
        apiKey: 'test-key'
      };

      expect(partialConfig.apiKey).toBe('test-key');
      expect(partialConfig.organization).toBeUndefined();
      expect(partialConfig.baseURL).toBeUndefined();
      expect(partialConfig.timeout).toBeUndefined();
      expect(partialConfig.maxRetries).toBeUndefined();
    });

    test('should allow empty configuration', () => {
      const emptyConfig: OpenAIConnectionConfig = {};

      expect(emptyConfig.apiKey).toBeUndefined();
      expect(emptyConfig.organization).toBeUndefined();
      expect(emptyConfig.baseURL).toBeUndefined();
      expect(emptyConfig.timeout).toBeUndefined();
      expect(emptyConfig.maxRetries).toBeUndefined();
    });
  });

  describe('ConnectionStatus', () => {
    test('should have correct structure', () => {
      const status: ConnectionStatus = {
        isConnected: true,
        connectionAttempts: 5,
        hasClient: true,
        apiKeyConfigured: true,
        organizationConfigured: false,
        baseURLConfigured: true
      };

      expect(status.isConnected).toBe(true);
      expect(status.connectionAttempts).toBe(5);
      expect(status.hasClient).toBe(true);
      expect(status.apiKeyConfigured).toBe(true);
      expect(status.organizationConfigured).toBe(false);
      expect(status.baseURLConfigured).toBe(true);
    });

    test('should allow all boolean combinations', () => {
      const allTrue: ConnectionStatus = {
        isConnected: true,
        connectionAttempts: 0,
        hasClient: true,
        apiKeyConfigured: true,
        organizationConfigured: true,
        baseURLConfigured: true
      };

      const allFalse: ConnectionStatus = {
        isConnected: false,
        connectionAttempts: 0,
        hasClient: false,
        apiKeyConfigured: false,
        organizationConfigured: false,
        baseURLConfigured: false
      };

      expect(allTrue.isConnected).toBe(true);
      expect(allFalse.isConnected).toBe(false);
    });
  });

  describe('OpenAIError', () => {
    test('should extend Error interface', () => {
      const error: OpenAIError = new Error('Test error');
      error.code = 'TEST_ERROR';
      error.status = 400;

      expect(error.message).toBe('Test error');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.status).toBe(400);
    });

    test('should allow optional properties', () => {
      const error: OpenAIError = new Error('Test error');

      expect(error.message).toBe('Test error');
      expect(error.code).toBeUndefined();
      expect(error.status).toBeUndefined();
    });
  });

  describe('OpenAIResponse', () => {
    test('should have generic type support', () => {
      const stringResponse: OpenAIResponse<string> = {
        data: 'test string'
      };

      const numberResponse: OpenAIResponse<number> = {
        data: 42
      };

      const objectResponse: OpenAIResponse<{ key: string }> = {
        data: { key: 'value' }
      };

      expect(stringResponse.data).toBe('test string');
      expect(numberResponse.data).toBe(42);
      expect(objectResponse.data.key).toBe('value');
    });

    test('should default to unknown type', () => {
      const defaultResponse: OpenAIResponse = {
        data: 'any data'
      };

      expect(defaultResponse.data).toBe('any data');
    });
  });

  describe('OpenAIModel', () => {
    test('should have correct structure', () => {
      const model: OpenAIModel = {
        id: 'gpt-4o-mini',
        object: 'model',
        created: 1234567890,
        owned_by: 'openai'
      };

      expect(model.id).toBe('gpt-4o-mini');
      expect(model.object).toBe('model');
      expect(model.created).toBe(1234567890);
      expect(model.owned_by).toBe('openai');
    });
  });

  describe('OpenAIChatMessage', () => {
    test('should have correct role types', () => {
      const systemMessage: OpenAIChatMessage = {
        role: 'system',
        content: 'You are a helpful assistant'
      };

      const userMessage: OpenAIChatMessage = {
        role: 'user',
        content: 'Hello, how are you?'
      };

      const assistantMessage: OpenAIChatMessage = {
        role: 'assistant',
        content: 'I am doing well, thank you!'
      };

      expect(systemMessage.role).toBe('system');
      expect(userMessage.role).toBe('user');
      expect(assistantMessage.role).toBe('assistant');
    });

    test('should have content property', () => {
      const message: OpenAIChatMessage = {
        role: 'user',
        content: 'Test content'
      };

      expect(message.content).toBe('Test content');
    });
  });

  describe('OpenAIChatCompletion', () => {
    test('should have correct structure', () => {
      const completion: OpenAIChatCompletion = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1234567890,
        model: 'gpt-4o-mini',
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: 'Hello! How can I help you today?'
            },
            finish_reason: 'stop'
          }
        ],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 15,
          total_tokens: 25
        }
      };

      expect(completion.id).toBe('chatcmpl-123');
      expect(completion.object).toBe('chat.completion');
      expect(completion.created).toBe(1234567890);
      expect(completion.model).toBe('gpt-4o-mini');
      expect(completion.choices).toHaveLength(1);
      expect(completion.choices[0].index).toBe(0);
      expect(completion.choices[0].message.role).toBe('assistant');
      expect(completion.choices[0].finish_reason).toBe('stop');
      expect(completion.usage.prompt_tokens).toBe(10);
      expect(completion.usage.completion_tokens).toBe(15);
      expect(completion.usage.total_tokens).toBe(25);
    });
  });

  describe('OpenAIClient', () => {
    test('should have models.list method', () => {
      const client: OpenAIClient = {
        models: {
          list: jest.fn().mockResolvedValue({
            data: [
              { id: 'gpt-4o-mini', object: 'model', created: 1234567890, owned_by: 'openai' }
            ]
          })
        },
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              id: 'chatcmpl-123',
              object: 'chat.completion',
              created: 1234567890,
              model: 'gpt-4o-mini',
              choices: [],
              usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
            })
          }
        }
      };

      expect(typeof client.models.list).toBe('function');
      expect(typeof client.chat.completions.create).toBe('function');
    });

    test('should have chat.completions.create method with correct parameters', () => {
      const client: OpenAIClient = {
        models: {
          list: jest.fn()
        },
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              id: 'chatcmpl-123',
              object: 'chat.completion',
              created: 1234567890,
              model: 'gpt-4o-mini',
              choices: [],
              usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
            })
          }
        }
      };

      const createParams = {
        model: 'gpt-4o-mini',
        messages: [
          { role: 'user' as const, content: 'Hello' }
        ],
        max_tokens: 100,
        temperature: 0.7,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      };

      expect(() => client.chat.completions.create(createParams)).not.toThrow();
    });
  });

  describe('MCPToolConfig', () => {
    test('should have correct structure', () => {
      const toolConfig: MCPToolConfig = {
        type: 'mcp_server',
        server_url: 'https://mcp.example.com',
        auth: {
          type: 'bearer',
          token: 'test-token'
        }
      };

      expect(toolConfig.type).toBe('mcp_server');
      expect(toolConfig.server_url).toBe('https://mcp.example.com');
      expect(toolConfig.auth.type).toBe('bearer');
      expect(toolConfig.auth.token).toBe('test-token');
    });

    test('should enforce type literal', () => {
      // This should compile without errors
      const toolConfig: MCPToolConfig = {
        type: 'mcp_server', // Only 'mcp_server' is allowed
        server_url: 'https://test.com',
        auth: {
          type: 'bearer', // Only 'bearer' is allowed
          token: 'token'
        }
      };

      expect(toolConfig.type).toBe('mcp_server');
      expect(toolConfig.auth.type).toBe('bearer');
    });
  });

  describe('MCPRequestConfig', () => {
    test('should have correct structure', () => {
      const requestConfig: MCPRequestConfig = {
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
        ],
        instructions: 'Optional instructions'
      };

      expect(requestConfig.model).toBe('gpt-4o-mini');
      expect(requestConfig.input).toBe('Test input message');
      expect(requestConfig.tools).toHaveLength(1);
      expect(requestConfig.tools[0].type).toBe('mcp_server');
      expect(requestConfig.instructions).toBe('Optional instructions');
    });

    test('should allow optional instructions', () => {
      const requestConfig: MCPRequestConfig = {
        model: 'gpt-4o-mini',
        input: 'Test input',
        tools: []
      };

      expect(requestConfig.instructions).toBeUndefined();
    });
  });

  describe('MCPResponse', () => {
    test('should have correct structure', () => {
      const response: MCPResponse = {
        output_text: 'This is the response text from the MCP server'
      };

      expect(response.output_text).toBe('This is the response text from the MCP server');
    });

    test('should allow different output text content', () => {
      const response1: MCPResponse = {
        output_text: 'Short response'
      };

      const response2: MCPResponse = {
        output_text: 'This is a much longer response with multiple sentences and more detailed information about the workflow execution results.'
      };

      expect(response1.output_text).toBe('Short response');
      expect(response2.output_text).toContain('workflow execution results');
    });
  });

  describe('Type compatibility', () => {
    test('should allow OpenAIConnectionConfig to be used in MCPClient constructor', () => {
      // This test ensures type compatibility between modules
      const config: OpenAIConnectionConfig = {
        apiKey: 'test-key',
        timeout: 30000
      };

      // Simulate MCPClient constructor parameter
      const openAIConfig: OpenAIConnectionConfig = config;
      expect(openAIConfig.apiKey).toBe('test-key');
      expect(openAIConfig.timeout).toBe(30000);
    });

    test('should allow MCPRequestConfig to be used in makeRequest method', () => {
      const requestConfig: MCPRequestConfig = {
        model: 'gpt-4o-mini',
        input: 'Test input',
        tools: []
      };

      // Simulate makeRequest method parameter
      const config: MCPRequestConfig = requestConfig;
      expect(config.model).toBe('gpt-4o-mini');
      expect(config.input).toBe('Test input');
    });

    test('should allow MCPResponse to be returned from API calls', () => {
      const response: MCPResponse = {
        output_text: 'Test response'
      };

      // Simulate API response
      const apiResponse: MCPResponse = response;
      expect(apiResponse.output_text).toBe('Test response');
    });
  });
});
