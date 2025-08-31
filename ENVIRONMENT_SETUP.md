# 🌍 **Environment Setup Guide**

This guide explains how to set up environment variables for the n8n MCP OpenAI Integration project.

## 📋 **Required Environment Variables**

### **OpenAI Configuration (Required)**
```bash
# Your OpenAI API key - REQUIRED
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

### **OpenAI Configuration (Optional)**
```bash
# Your OpenAI organization ID (optional)
OPENAI_ORG_ID=org-your-org-id-here

# Custom OpenAI API base URL (optional, defaults to official API)
OPENAI_BASE_URL=https://api.openai.com/v1

# Connection timeout in milliseconds (optional, defaults to 60000)
OPENAI_TIMEOUT=60000

# Maximum retry attempts (optional, defaults to 3)
OPENAI_MAX_RETRIES=3

# OpenAI model to use (optional, defaults to gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
```

### **n8n MCP Configuration (Optional but Recommended)**
```bash
# Your n8n MCP bearer token (optional, uses default if not set)
N8N_MCP_TOKEN=your-actual-bearer-token-here

# Your n8n MCP endpoint URL (optional, uses default if not set)
N8N_MCP_URL=https://your-n8n-instance.com/mcp
```

## 🚀 **Quick Setup**

### **1. Copy the Template**
```bash
cp env.template .env
```

### **2. Edit the .env File**
```bash
# Open .env in your preferred editor
nano .env
# or
code .env
# or
notepad .env
```

### **3. Fill in Your Values**
```bash
# Replace these with your actual values
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
N8N_MCP_TOKEN=your-actual-bearer-token-here
N8N_MCP_URL=https://your-n8n-instance.com/mcp
```

## 🔧 **Environment Variable Details**

### **OPENAI_API_KEY**
- **Required**: Yes
- **Description**: Your OpenAI API key for authentication
- **Format**: `sk-proj-...` (starts with sk-proj)
- **Where to get it**: [OpenAI Platform](https://platform.openai.com/api-keys)

### **OPENAI_ORG_ID**
- **Required**: No
- **Description**: Your OpenAI organization ID for billing
- **Format**: `org-...` (starts with org)
- **Where to get it**: [OpenAI Platform](https://platform.openai.com/account/org-settings)

### **OPENAI_BASE_URL**
- **Required**: No
- **Description**: Custom OpenAI API endpoint (for Azure, etc.)
- **Default**: `https://api.openai.com/v1`
- **Example**: `https://your-resource.openai.azure.com/openai/deployments/your-deployment`

### **OPENAI_TIMEOUT**
- **Required**: No
- **Description**: Connection timeout in milliseconds
- **Default**: `60000` (60 seconds)
- **Range**: `1000` to `300000` (1 second to 5 minutes)

### **OPENAI_MAX_RETRIES**
- **Required**: No
- **Description**: Maximum number of retry attempts on failure
- **Default**: `3`
- **Range**: `1` to `10`

### **OPENAI_MODEL**
- **Required**: No
- **Description**: OpenAI model to use for requests
- **Default**: `gpt-4o-mini`
- **Examples**: `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`

### **N8N_MCP_TOKEN**
- **Required**: No (but recommended for production)
- **Description**: Bearer token for n8n MCP authentication
- **Default**: `BearerToken` (placeholder)
- **Where to get it**: Your n8n instance MCP configuration

### **N8N_MCP_URL**
- **Required**: No (but recommended for production)
- **Description**: URL endpoint for your n8n MCP server
- **Default**: `https://mcp.your-n8n.com` (placeholder)
- **Format**: `https://your-domain.com/mcp` or `http://localhost:3000/mcp`

## 📁 **File Structure**

```
project-root/
├── .env                    # Your environment variables (create this)
├── env.template           # Template file (already exists)
├── src/
│   ├── main.ts           # Main application (uses .env)
│   ├── core/             # Core functionality
│   ├── services/         # MCP services
│   └── types/            # Type definitions
└── package.json
```

## 🎯 **Usage Examples**

### **Basic Setup (Minimal)**
```bash
# .env file with just the required variable
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
```

### **Production Setup (Complete)**
```bash
# .env file with all variables set
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
OPENAI_ORG_ID=org-your-org-id-here
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_TIMEOUT=60000
OPENAI_MAX_RETRIES=3
OPENAI_MODEL=gpt-4o-mini
N8N_MCP_TOKEN=your-actual-bearer-token-here
N8N_MCP_URL=https://your-n8n-instance.com/mcp
```

### **Development Setup (Local n8n)**
```bash
# .env file for local development
OPENAI_API_KEY=sk-proj-your-actual-api-key-here
OPENAI_TIMEOUT=30000
OPENAI_MAX_RETRIES=5
N8N_MCP_TOKEN=dev-token-123
N8N_MCP_URL=http://localhost:3000/mcp
```

## 🔒 **Security Best Practices**

### **1. Never Commit .env Files**
```bash
# .gitignore already includes .env
# This prevents accidentally committing secrets
```

### **2. Use Strong Tokens**
```bash
# Good: Long, random tokens
N8N_MCP_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Bad: Short, predictable tokens
N8N_MCP_TOKEN=123456
```

### **3. Rotate Tokens Regularly**
- Change your OpenAI API key periodically
- Update n8n MCP tokens when team members leave
- Use different tokens for different environments

### **4. Environment-Specific Files**
```bash
# Development
.env.development

# Production
.env.production

# Testing
.env.test
```

## 🚨 **Troubleshooting**

### **Common Issues**

#### **1. "OPENAI_API_KEY environment variable is required"**
```bash
# Solution: Make sure .env file exists and contains:
OPENAI_API_KEY=your-actual-key-here
```

#### **2. "Cannot find module 'dotenv'"**
```bash
# Solution: Install dotenv
npm install dotenv
```

#### **3. Environment variables not loading**
```bash
# Solution: Check file location
# .env should be in the project root (same level as package.json)
```

#### **4. Permission denied on .env**
```bash
# Solution: Check file permissions
chmod 600 .env  # On Unix/Linux
```

### **Debug Environment Variables**
```bash
# Add this to your code temporarily for debugging
console.log('Environment variables:', {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'Set' : 'Not set',
  N8N_MCP_TOKEN: process.env.N8N_MCP_TOKEN ? 'Set' : 'Not set',
  N8N_MCP_URL: process.env.N8N_MCP_URL ? 'Set' : 'Not set'
});
```

## 🎉 **Success Indicators**

When your environment is properly configured, you should see:

```bash
npm run start
# Output:
🚀 Starting n8n MCP OpenAI Integration...

📋 Configuration loaded:
   OpenAI API Key: ✅ Set
   OpenAI Organization: ✅ Set (or ⚪ Optional)
   OpenAI Base URL: ✅ Set (or ⚪ Optional)
   OpenAI Timeout: 60000ms
   OpenAI Max Retries: 3
   n8n MCP Token: ✅ Set
   n8n MCP URL: ✅ Set

📡 Initializing MCP Client...
✅ MCP Client initialized successfully
```

## 📚 **Next Steps**

1. ✅ **Environment setup complete**
2. 🚀 **Run the application**: `npm run start`
3. 🧪 **Test with examples**: `npm run mcp:example`
4. 🔧 **Customize configuration** as needed
5. 📖 **Read the main documentation** for usage examples

Your n8n MCP OpenAI Integration is now properly configured and ready to use! 🎯
