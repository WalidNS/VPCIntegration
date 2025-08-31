#!/usr/bin/env node

import { config } from 'dotenv';
import { createMCPClient } from './services/mcpClient.js';
import type { OpenAIConnectionConfig } from './types/index.js';

// Load environment variables from .env file
config();

/**
 * Main entry point for the n8n MCP OpenAI Integration
 * This demonstrates how to use the MCP client to interact with n8n workflows
 */

async function main(): Promise<void> {
  console.log('🚀 Starting n8n MCP OpenAI Integration...\n');

  // Validate required environment variables first
  if (!process.env['OPENAI_API_KEY']) {
    console.error('❌ Error: OPENAI_API_KEY environment variable is required');
    console.log('💡 Please create a .env file with your OpenAI API key');
    process.exit(1);
  }

  // Configuration from environment variables (after validation)
  const openAIConfig: OpenAIConnectionConfig = {
    // OpenAI configuration from environment
    apiKey: process.env['OPENAI_API_KEY'], // Now guaranteed to be string
    timeout: process.env['OPENAI_TIMEOUT'] ? parseInt(process.env['OPENAI_TIMEOUT']) : 60000,
    maxRetries: process.env['OPENAI_MAX_RETRIES'] ? parseInt(process.env['OPENAI_MAX_RETRIES']) : 3
  };

  // Only add optional properties if they exist
  if (process.env['OPENAI_ORG_ID']) {
    openAIConfig.organization = process.env['OPENAI_ORG_ID'];
  }
  if (process.env['OPENAI_BASE_URL']) {
    openAIConfig.baseURL = process.env['OPENAI_BASE_URL'];
  }

  const n8nMcpConfig = {
    // n8n MCP configuration from environment
    token: process.env['N8N_MCP_TOKEN'] || 'BearerToken',
    url: process.env['N8N_MCP_URL'] || 'https://mcp.your-n8n.com'
  };

  if (!process.env['N8N_MCP_TOKEN'] || !process.env['N8N_MCP_URL']) {
    console.warn('⚠️  Warning: N8N_MCP_TOKEN or N8N_MCP_URL not set, using defaults');
  }

  console.log('📋 Configuration loaded successfully');

  // Create MCP client
  const mcpClient = createMCPClient(openAIConfig, n8nMcpConfig);

  try {
    // Initialize the client
    console.log('📡 Initializing MCP Client...');
    await mcpClient.initialize();
    
    console.log('✅ MCP Client initialized successfully');

    // Example 1: Execute a LinkedIn workflow
    console.log('\n🔗 Example 1: Executing LinkedIn workflow...');
    const linkedInResult = await mcpClient.executeWorkflow(
      'LinkedIn Post Publisher',
      {
        image: 'V3',
        caption: 'Publish the LinkedIn post with image V3 and the short caption.',
        platform: 'linkedin'
      },
      'If a task needs a workflow, call `workflow.run` with the required payload, then report result.'
    );

    console.log('📝 LinkedIn Workflow Result:', linkedInResult.output_text);

    // Example 2: Make a custom MCP request
    console.log('\n🔧 Example 2: Custom MCP request...');
    const customResult = await mcpClient.makeRequest({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      input: 'Analyze the current social media trends and suggest content for next week.',
      tools: [],
      instructions: 'Use the available MCP tools to gather data and provide actionable insights.'
    });

    console.log('📊 Custom Request Result:', customResult.output_text);

    // Example 3: Execute a different workflow
    console.log('\n📈 Example 3: Executing analytics workflow...');
    const analyticsResult = await mcpClient.executeWorkflow(
      'Social Media Analytics',
      {
        platform: 'all',
        timeframe: 'last_7_days',
        metrics: ['engagement', 'reach', 'clicks']
      },
      'Generate a comprehensive report using the workflow.run method and provide insights.'
    );

    console.log('📊 Analytics Workflow Result:', analyticsResult.output_text);

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error during MCP operations:', errorMessage);
    process.exit(1);
  } finally {
    // Always cleanup
    console.log('\n🧹 Cleaning up resources...');
    await mcpClient.cleanup();
    console.log('✅ Cleanup completed');
  }

  console.log('\n🎉 n8n MCP OpenAI Integration completed successfully!');
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('💥 Fatal error:', errorMessage);
    process.exit(1);
  });
}

export { main };
