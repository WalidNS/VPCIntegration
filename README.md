# n8n MCP OpenAI Integration

A robust OpenAI connection implementation for n8n Model Context Protocol (MCP) integration with best practices and design patterns.

## 🚀 Features

- **Secure Configuration**: Environment variable-based configuration
- **Connection Management**: Automatic retry, reconnection, and connection validation
- **Error Handling**: Comprehensive error handling with retry logic
- **Class-based Architecture**: Clean, maintainable code structure
- **Connection Pooling**: Efficient connection management
- **Status Monitoring**: Real-time connection status tracking

## 📋 Prerequisites

- Node.js 18+ (for ES modules support)
- OpenAI API key
- n8n instance

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in your project root:
```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_ORG_ID=your_organization_id_here
OPENAI_BASE_URL=https://api.openai.com/v1

# n8n MCP Configuration
N8N_MCP_TOKEN=your_n8n_mcp_token_here
N8N_MCP_SERVER_URL=http://localhost:3000

# Connection Settings
OPENAI_TIMEOUT=30000
OPENAI_MAX_RETRIES=3
```

## 🏗️ Architecture & Design Patterns

### 1. **Class-based Design**
- Encapsulates connection logic and state
- Provides clean interface for external usage
- Easy to extend and maintain

### 2. **Factory Pattern**
- `createOpenAIConnection()` function for creating instances
- Configurable connection parameters
- Default connection instance for simple use cases

### 3. **Connection State Management**
- Tracks connection status
- Manages retry attempts
- Provides connection health monitoring

### 4. **Error Handling & Retry Logic**
- Exponential backoff for retries
- Comprehensive error messages
- Graceful degradation

### 5. **Configuration Management**
- Environment variable support
- Fallback configuration values
- Secure credential handling

## 📖 Usage Examples

### Basic Usage

```javascript
import { defaultConnection } from './src/openAiConnection.js';

async function basicExample() {
  try {
    await defaultConnection.connect();
    const client = defaultConnection.getClient();
    
    // Use OpenAI client
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Hello!" }]
    });
    
    console.log(response.choices[0].message.content);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    defaultConnection.disconnect();
  }
}
```

### Custom Configuration

```javascript
import { createOpenAIConnection } from './src/openAiConnection.js';

const customConnection = createOpenAIConnection({
  timeout: 60000,
  maxRetries: 5,
  organization: 'org-123'
});

await customConnection.connect();
```

### Connection Monitoring

```javascript
const status = connection.getStatus();
console.log('Connection active:', status.isConnected);
console.log('Retry attempts:', status.connectionAttempts);
```

## 🔧 API Reference

### OpenAIConnection Class

#### Constructor
```javascript
new OpenAIConnection(config)
```

**Config Options:**
- `apiKey`: OpenAI API key
- `organization`: OpenAI organization ID
- `baseURL`: Custom API base URL
- `timeout`: Request timeout in milliseconds
- `maxRetries`: Maximum retry attempts

#### Methods

- `connect()`: Establish connection
- `disconnect()`: Close connection
- `reconnect()`: Reconnect after disconnection
- `getClient()`: Get OpenAI client instance
- `isConnectionActive()`: Check connection status
- `getStatus()`: Get detailed connection information
- `testConnection()`: Test connection health

## 🚨 Security Best Practices

1. **Never hardcode API keys** - Use environment variables
2. **Use .env files** - Add `.env` to `.gitignore`
3. **Validate inputs** - Check configuration before use
4. **Handle errors gracefully** - Don't expose sensitive information
5. **Use HTTPS** - Always use secure connections in production

## 🧪 Testing

Run the example file to test your connection:

```bash
npm run dev
# or
node src/connectionExample.js
```

## 📁 Project Structure

```
src/
├── openAiConnection.js      # Main connection class
├── connectionExample.js     # Usage examples
└── ...                     # Other MCP components

.env                        # Environment variables (create this)
package.json                # Dependencies and scripts
README.md                   # This file
```

## 🔄 Integration with n8n MCP

This connection class is designed to work seamlessly with n8n MCP:

1. **Connection Management**: Handles OpenAI API connections
2. **Error Handling**: Provides robust error handling for MCP operations
3. **Status Monitoring**: Allows n8n to monitor connection health
4. **Configuration**: Supports n8n's configuration management

## 🚀 Next Steps

1. **Install dependencies**: `npm install`
2. **Configure environment**: Create `.env` file
3. **Test connection**: Run examples
4. **Integrate with n8n**: Use in your MCP implementation
5. **Add your MCP logic**: Extend for your specific use case

## 🤝 Contributing

Feel free to submit issues and enhancement requests!

## 📄 License

ISC License - see package.json for details
