export interface OpenAIConnectionConfig {
  apiKey?: string;
  organization?: string;
  baseURL?: string;
  timeout?: number;
  maxRetries?: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  connectionAttempts: number;
  hasClient: boolean;
  apiKeyConfigured: boolean;
  organizationConfigured: boolean;
  baseURLConfigured: boolean;
}

export interface OpenAIError extends Error {
  code?: string;
  status?: number;
}

export interface OpenAIResponse<T = unknown> {
  data: T;
}

export interface OpenAIModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export interface OpenAIChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OpenAIChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: OpenAIChatMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenAIClient {
  models: {
    list(): Promise<OpenAIResponse<OpenAIModel[]>>;
  };
  chat: {
    completions: {
      create(params: {
        model: string;
        messages: OpenAIChatMessage[];
        max_tokens?: number;
        temperature?: number;
        top_p?: number;
        frequency_penalty?: number;
        presence_penalty?: number;
      }): Promise<OpenAIChatCompletion>;
    };
  };
}

// MCP (Model Context Protocol) related types
export interface MCPToolConfig {
  type: 'mcp_server';
  server_url: string;
  auth: {
    type: 'bearer';
    token: string;
  };
}

export interface MCPRequestConfig {
  model: string;
  input: string;
  tools: MCPToolConfig[];
  instructions?: string;
}

export interface MCPResponse {
  output_text: string;
  // Add other response fields as needed
}
