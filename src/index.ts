// Core exports
export { OpenAIConnection, createOpenAIConnection, getDefaultConnection } from './core/openAiConnection.js';

// Service exports
export { MCPClient, createMCPClient } from './services/mcpClient.js';

// Main application
export { main } from './main.js';

// Type exports
export type {
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
} from './types/index.js';


