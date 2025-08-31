import { createOpenAIConnection } from '../core/openAiConnection.js';
import type { OpenAIConnectionConfig } from '../types/index.js';

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

export class MCPClient {
  private connection: ReturnType<typeof createOpenAIConnection>;
  private n8nMcpToken: string;
  private n8nMcpUrl: string;

  constructor(
    openAIConfig: OpenAIConnectionConfig = {},
    n8nMcpConfig: { token: string; url: string }
  ) {
    this.connection = createOpenAIConnection(openAIConfig);
    this.n8nMcpToken = n8nMcpConfig.token;
    this.n8nMcpUrl = n8nMcpConfig.url;
  }

  /**
   * Initialize the MCP client by connecting to OpenAI
   */
  public async initialize(): Promise<void> {
    try {
      await this.connection.connect();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to initialize MCP Client: ${errorMessage}`);
    }
  }

  /**
   * Make a request to OpenAI with MCP tools
   */
  public async makeRequest(config: MCPRequestConfig): Promise<MCPResponse> {
    if (!this.connection.isConnectionActive()) {
      throw new Error('MCP Client not initialized. Call initialize() first.');
    }

    try {
      const client = this.connection.getClient();
      
      // Create the MCP tool configuration
      const mcpTool: MCPToolConfig = {
        type: 'mcp_server',
        server_url: this.n8nMcpUrl,
        auth: {
          type: 'bearer',
          token: this.n8nMcpToken
        }
      };

      // Make the request using OpenAI's responses API
      const response = await (client as any).responses.create({
        model: config.model,
        input: config.input,
        tools: [mcpTool, ...config.tools],
        instructions: config.instructions
      });

      return {
        output_text: response.output_text
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`MCP request failed: ${errorMessage}`);
    }
  }

  /**
   * Execute a specific workflow using the MCP client
   */
  public async executeWorkflow(
    workflowName: string,
    payload: Record<string, unknown>,
    instructions?: string
  ): Promise<MCPResponse> {
    const input = `Execute the workflow "${workflowName}" with the following payload: ${JSON.stringify(payload)}`;
    
    return this.makeRequest({
      model: 'gpt-4o-mini', // Default model, can be overridden
      input,
      tools: [],
      instructions: instructions || 'If a task needs a workflow, call `workflow.run` with the required payload, then report result.'
    });
  }

  /**
   * Get the connection status
   */
  public getStatus() {
    return this.connection.getStatus();
  }

  /**
   * Check if the client is ready
   */
  public isReady(): boolean {
    return this.connection.isConnectionActive();
  }

  /**
   * Cleanup resources
   */
  public async cleanup(): Promise<void> {
    this.connection.disconnect();
  }
}

// Factory function for creating MCP clients
export function createMCPClient(
  openAIConfig: OpenAIConnectionConfig = {},
  n8nMcpConfig: { token: string; url: string }
): MCPClient {
  return new MCPClient(openAIConfig, n8nMcpConfig);
}

