import OpenAI from 'openai';
import { config } from 'dotenv';
import type { 
  OpenAIConnectionConfig, 
  ConnectionStatus, 
  OpenAIClient
} from '../types/index.js';

// Load environment variables
config();

export class OpenAIConnection {
  private readonly apiKey: string | undefined;
  private readonly organization: string | undefined;
  private readonly baseURL: string | undefined;
  private readonly timeout: number;
  private readonly maxRetries: number;
  
  private client: OpenAIClient | null = null;
  private isConnected = false;
  private connectionAttempts = 0;

  constructor(config: OpenAIConnectionConfig = {}) {
    this.apiKey = config.apiKey ?? process.env['OPENAI_API_KEY'];
    this.organization = config.organization ?? process.env['OPENAI_ORG_ID'];
    this.baseURL = config.baseURL ?? process.env['OPENAI_BASE_URL'];
    this.timeout = config.timeout ?? 30000;
    this.maxRetries = config.maxRetries ?? 3;
  }

  /**
   * Initialize the OpenAI client connection
   */
  public async connect(): Promise<boolean> {
    // Validate API key when connecting
    if (!this.apiKey) {
      throw new Error('OpenAI API key is required. Set OPENAI_API_KEY environment variable or pass it in config.');
    }
    
    try {
      const openAIConfig = {
        apiKey: this.apiKey,
        timeout: this.timeout,
        maxRetries: this.maxRetries,
      } as const;

      if (this.organization) {
        (openAIConfig as any).organization = this.organization;
      }

      if (this.baseURL) {
        (openAIConfig as any).baseURL = this.baseURL;
      }

      this.client = new OpenAI(openAIConfig) as unknown as OpenAIClient;
      
      // Test the connection
      await this.testConnection();
      
      this.isConnected = true;
      this.connectionAttempts = 0;
      
      return true;
    } catch (error) {
      this.connectionAttempts++;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Failed to connect to OpenAI (attempt ${this.connectionAttempts}):`, errorMessage);
      
      if (this.connectionAttempts < this.maxRetries) {
        console.log(`Retrying connection in ${this.connectionAttempts * 1000}ms...`);
        await this.delay(this.connectionAttempts * 1000);
        return this.connect();
      }
      
      throw new Error(`Failed to connect to OpenAI after ${this.maxRetries} attempts: ${errorMessage}`);
    }
  }

  /**
   * Test the connection by making a simple API call
   */
  public async testConnection(): Promise<boolean> {
    if (!this.client) {
      throw new Error('Client not initialized');
    }
    
    try {
      // Make a minimal API call to test the connection
      const response = await this.client.models.list();
      return response.data.length > 0;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Connection test failed: ${errorMessage}`);
    }
  }

  /**
   * Get the OpenAI client instance
   */
  public getClient(): OpenAIClient {
    if (!this.isConnected || !this.client) {
      throw new Error('OpenAI connection not established. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Check if the connection is active
   */
  public isConnectionActive(): boolean {
    return this.isConnected && this.client !== null;
  }

  /**
   * Disconnect and cleanup
   */
  public disconnect(): void {
    this.isConnected = false;
    this.client = null;
    this.connectionAttempts = 0;
  }

  /**
   * Reconnect to OpenAI
   */
  public async reconnect(): Promise<boolean> {
    this.disconnect();
    return await this.connect();
  }

  /**
   * Utility method for delays
   */
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get connection status information
   */
  public getStatus(): ConnectionStatus {
    return {
      isConnected: this.isConnected,
      connectionAttempts: this.connectionAttempts,
      hasClient: this.client !== null,
      apiKeyConfigured: Boolean(this.apiKey),
      organizationConfigured: Boolean(this.organization),
      baseURLConfigured: Boolean(this.baseURL)
    };
  }

  // Getters for configuration values
  public getApiKey(): string | undefined {
    return this.apiKey;
  }

  public getOrganization(): string | undefined {
    return this.organization;
  }

  public getBaseURL(): string | undefined {
    return this.baseURL;
  }

  public getTimeout(): number {
    return this.timeout;
  }

  public getMaxRetries(): number {
    return this.maxRetries;
  }
}

// Factory function for creating connections
export function createOpenAIConnection(config: OpenAIConnectionConfig = {}): OpenAIConnection {
  return new OpenAIConnection(config);
}

// Lazy default connection instance - only created when accessed
let _defaultConnection: OpenAIConnection | null = null;

export function getDefaultConnection(): OpenAIConnection {
  if (!_defaultConnection) {
    _defaultConnection = new OpenAIConnection();
  }
  return _defaultConnection;
}

export default OpenAIConnection;
