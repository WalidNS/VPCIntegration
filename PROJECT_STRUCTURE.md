# 🏗️ **Project Structure & Architecture**

This document explains the new, improved folder structure and architecture of the n8n MCP OpenAI Integration project.

## 📁 **New Folder Structure**

```
src/
├── core/                           # Core functionality
│   └── openAiConnection.ts        # OpenAI connection management
├── services/                       # Business logic services
│   └── mcpClient.ts               # MCP client implementation
├── types/                          # TypeScript type definitions
│   └── index.ts                   # All interfaces and types
├── examples/                       # Usage examples
│   └── connectionExample.ts       # Connection usage examples
├── __tests__/                      # Test files
│   ├── openAiConnection.test.ts           # Unit tests
│   └── openAiConnection.integration.test.ts # Integration tests
├── main.ts                         # Main application entry point
└── index.ts                        # Main exports
```

## 🎯 **Why This Structure?**

### **1. Separation of Concerns**
- **`core/`**: Infrastructure and low-level functionality
- **`services/`**: Business logic and high-level operations
- **`types/`**: Centralized type definitions
- **`examples/`**: Usage demonstrations
- **`__tests__/`**: Test organization

### **2. Scalability**
- Easy to add new services
- Clear boundaries between layers
- Simple to extend with new features

### **3. Maintainability**
- Logical grouping of related functionality
- Easy to find specific code
- Clear import paths

## 🔧 **Key Components**

### **Core Layer (`src/core/`)**
```typescript
// openAiConnection.ts
export class OpenAIConnection {
  // Handles OpenAI API connection
  // Manages connection lifecycle
  // Provides client instances
}
```

### **Service Layer (`src/services/`)**
```typescript
// mcpClient.ts
export class MCPClient {
  // High-level MCP operations
  // Workflow execution
  // Request management
}
```

### **Type Layer (`src/types/`)**
```typescript
// index.ts
export interface OpenAIConnectionConfig { ... }
export interface MCPToolConfig { ... }
export interface MCPRequestConfig { ... }
export interface MCPResponse { ... }
```

## 🚀 **How to Use the MCP Client**

### **Basic Usage**
```typescript
import { createMCPClient } from './src/services/mcpClient.js';

// Create MCP client
const mcpClient = createMCPClient(
  {
    // OpenAI configuration
    timeout: 60000,
    maxRetries: 3
  },
  {
    // n8n MCP configuration
    token: 'your-actual-token',
    url: 'https://your-n8n-mcp-endpoint.com'
  }
);

// Initialize and use
await mcpClient.initialize();
const result = await mcpClient.executeWorkflow('WorkflowName', { payload: 'data' });
await mcpClient.cleanup();
```

### **Advanced Usage**
```typescript
// Custom MCP request
const result = await mcpClient.makeRequest({
  model: 'gpt-4o-mini',
  input: 'Your custom prompt here',
  tools: [],
  instructions: 'Custom instructions for the model'
});

// Execute specific workflow
const workflowResult = await mcpClient.executeWorkflow(
  'LinkedIn Publisher',
  {
    image: 'V3',
    caption: 'Your caption',
    platform: 'linkedin'
  },
  'Use workflow.run to execute the workflow'
);
```

## 📋 **Available Scripts**

```bash
# Build and run
npm run build          # Compile TypeScript
npm run start          # Run the main application
npm run dev            # Build and run in development

# Testing
npm run test           # Run all tests
npm run test:unit      # Run unit tests only
npm run test:integration # Run integration tests only

# Code quality
npm run lint           # Run ESLint
npm run type-check     # TypeScript type checking
npm run format         # Format code with Prettier

# MCP specific
npm run mcp:example    # Run MCP examples
npm run mcp:dev        # Run MCP in development mode
```

## 🔄 **Migration from Old Structure**

### **Before (Flat Structure)**
```
src/
├── openAiConnection.ts
├── connectionExample.ts
├── mcpClient.ts
└── types/
    └── index.ts
```

### **After (Organized Structure)**
```
src/
├── core/
│   └── openAiConnection.ts        # Moved from root
├── services/
│   └── mcpClient.ts               # Moved from root
├── examples/
│   └── connectionExample.ts       # Moved from root
├── types/
│   └── index.ts                   # Enhanced with MCP types
├── main.ts                         # NEW: Main entry point
└── index.ts                        # Updated exports
```

## 📊 **Benefits of New Structure**

### **1. Better Organization**
- **Logical grouping**: Related files are together
- **Clear hierarchy**: Core → Services → Examples
- **Easy navigation**: Developers can quickly find what they need

### **2. Improved Maintainability**
- **Single responsibility**: Each folder has a clear purpose
- **Reduced coupling**: Services don't depend on core implementation details
- **Easier testing**: Tests can focus on specific layers

### **3. Enhanced Scalability**
- **Add new services**: Just create new files in `services/`
- **Extend core functionality**: Add to `core/` without affecting services
- **New examples**: Place in `examples/` folder

### **4. Better Developer Experience**
- **Clear import paths**: `../core/openAiConnection.js`
- **Intuitive structure**: Follows common patterns
- **Easy onboarding**: New developers understand the layout quickly

## 🎯 **File Naming Conventions**

### **Files**
- **PascalCase**: `openAiConnection.ts`, `mcpClient.ts`
- **Descriptive names**: Clear indication of purpose
- **Consistent extensions**: `.ts` for TypeScript files

### **Folders**
- **lowercase**: `core/`, `services/`, `examples/`
- **Plural for collections**: `__tests__/`, `types/`
- **Descriptive**: `core/` for infrastructure, `services/` for business logic

## 🔗 **Import Paths**

### **From Core to Types**
```typescript
import type { OpenAIConnectionConfig } from '../types/index.js';
```

### **From Services to Core**
```typescript
import { createOpenAIConnection } from '../core/openAiConnection.js';
```

### **From Examples to Core**
```typescript
import { createOpenAIConnection } from '../core/openAiConnection.js';
```

### **From Main to Services**
```typescript
import { createMCPClient } from './services/mcpClient.js';
```

## 🚀 **Next Steps**

### **Immediate Actions**
1. ✅ **Structure implemented**: New folder organization complete
2. ✅ **Files moved**: All code relocated to appropriate folders
3. ✅ **Imports updated**: All import paths corrected
4. ✅ **Build working**: TypeScript compilation successful

### **Future Enhancements**
1. **Add more services**: `workflowService.ts`, `analyticsService.ts`
2. **Extend core**: Add connection pooling, rate limiting
3. **New examples**: Different use case demonstrations
4. **Configuration management**: Centralized config handling

## 📚 **Usage Examples**

### **Running the Main Application**
```bash
# Build and run
npm run build
npm run start

# Or in one command
npm run dev
```

### **Running MCP Examples**
```bash
# Build and run MCP examples
npm run mcp:example

# Or run specific examples
npm run build
node dist/examples/connectionExample.js
```

### **Development Mode**
```bash
# Watch mode for development
npm run dev:watch

# Or build and run with file watching
npm run build:watch
npm run mcp:dev
```

## 🎉 **Summary**

The new project structure provides:

- **Better organization** with logical grouping
- **Improved maintainability** through clear separation of concerns
- **Enhanced scalability** for future development
- **Better developer experience** with intuitive folder layout
- **Clear import paths** for easy navigation

This structure follows industry best practices and makes the codebase much more professional and maintainable! 🚀
