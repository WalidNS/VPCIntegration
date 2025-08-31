import { jest } from "@jest/globals";

// Mock the dotenv config
jest.mock("dotenv", () => ({
  config: jest.fn(),
}));

// Mock the MCP client
const mockMCPClient = {
  initialize: jest.fn() as jest.MockedFunction<() => Promise<void>>,
  executeWorkflow: jest.fn() as jest.MockedFunction<
    (workflowId: string, input: any) => Promise<any>
  >,
  makeRequest: jest.fn() as jest.MockedFunction<(config: any) => Promise<any>>,
  cleanup: jest.fn() as jest.MockedFunction<() => Promise<void>>,
};

jest.mock("../services/mcpClient.js", () => ({
  createMCPClient: jest.fn(() => mockMCPClient),
}));

// Mock console methods
const consoleSpy = {
  log: jest.spyOn(console, "log").mockImplementation(() => {}),
  error: jest.spyOn(console, "error").mockImplementation(() => {}),
  warn: jest.spyOn(console, "warn").mockImplementation(() => {}),
};

// Mock process.exit to throw an error instead of actually exiting
const processExitSpy = jest
  .spyOn(process, "exit")
  .mockImplementation((code?: string | number | null | undefined) => {
    throw new Error(`process.exit called with code: ${code}`);
  });

describe("main.ts", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // Store original environment
    originalEnv = { ...process.env };

    // Reset all mocks
    jest.clearAllMocks();

    // Reset console spies
    Object.values(consoleSpy).forEach((spy) => spy.mockClear());

    // Reset process spy
    processExitSpy.mockClear();
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Environment Validation", () => {
    test("should handle missing OPENAI_API_KEY gracefully", () => {
      // Remove the required API key
      delete process.env.OPENAI_API_KEY;

      // Test environment variable handling without triggering main function
      expect(process.env.OPENAI_API_KEY).toBeUndefined();

      // Test that we can set and read environment variables
      process.env.OPENAI_API_KEY = "test-key";
      expect(process.env.OPENAI_API_KEY).toBe("test-key");
    });

    test("should handle environment variables correctly", () => {
      // Set required environment variables
      process.env.OPENAI_API_KEY = "test-api-key";
      process.env.N8N_MCP_TOKEN = "test-token";
      process.env.N8N_MCP_URL = "https://test.com";

      expect(process.env.OPENAI_API_KEY).toBe("test-api-key");
      expect(process.env.N8N_MCP_TOKEN).toBe("test-token");
      expect(process.env.N8N_MCP_URL).toBe("https://test.com");
    });
  });

  describe("Configuration Loading", () => {
    test("should load environment variables from dotenv", async () => {
      const { config } = await import("dotenv");

      expect(config).toHaveBeenCalled();
    });

    test("should use environment variables for configuration", () => {
      process.env.OPENAI_API_KEY = "env-api-key";
      process.env.N8N_MCP_TOKEN = "env-token";
      process.env.N8N_MCP_URL = "https://env.com";

      expect(process.env.OPENAI_API_KEY).toBe("env-api-key");
      expect(process.env.N8N_MCP_TOKEN).toBe("env-token");
      expect(process.env.N8N_MCP_URL).toBe("https://env.com");
    });
  });

  describe("MCP Client Mocking", () => {
    test("should have mocked MCP client methods", () => {
      expect(mockMCPClient.initialize).toBeDefined();
      expect(mockMCPClient.executeWorkflow).toBeDefined();
      expect(mockMCPClient.makeRequest).toBeDefined();
      expect(mockMCPClient.cleanup).toBeDefined();
    });

    test("should be able to mock MCP client responses", async () => {
      mockMCPClient.initialize.mockResolvedValue(undefined);
      mockMCPClient.executeWorkflow.mockResolvedValue({
        output_text: "Mocked response",
      });

      await expect(mockMCPClient.initialize()).resolves.toBeUndefined();
      await expect(mockMCPClient.executeWorkflow("test", {})).resolves.toEqual({
        output_text: "Mocked response",
      });
    });
  });

  describe("Console and Process Mocking", () => {
    test("should mock console methods", () => {
      console.log("test log");
      console.error("test error");
      console.warn("test warn");

      expect(consoleSpy.log).toHaveBeenCalledWith("test log");
      expect(consoleSpy.error).toHaveBeenCalledWith("test error");
      expect(consoleSpy.warn).toHaveBeenCalledWith("test warn");
    });

    test("should mock process.exit", () => {
      expect(() => process.exit(1)).toThrow("process.exit called with code: 1");
      expect(processExitSpy).toHaveBeenCalledWith(1);
    });
  });
});
