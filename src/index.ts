#!/usr/bin/env node

/**
 * AudreyUI Component Rules MCP Server
 *
 * This MCP server provides tools for:
 * - Getting component rules and documentation
 * - Grading components against rules
 * - Generating compliant components
 * - Checking component compliance
 *
 * Based on the components.build specification by Hayden Bleasel and shadcn.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  type CallToolResult,
} from '@modelcontextprotocol/sdk/types.js';

import { getToolDefinitions, executeTool } from './tools/index.js';

// Create the MCP server
const server = new Server(
  {
    name: 'audreyui-component-rules',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handle tool listing
server.setRequestHandler(ListToolsRequestSchema, async () => {
  const tools = getToolDefinitions();

  return {
    tools: tools.map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
    })),
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request): Promise<CallToolResult> => {
  const { name, arguments: args } = request.params;

  const result = await executeTool(name, args as Record<string, unknown>);

  return {
    content: result.content,
    isError: result.isError,
  };
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('AudreyUI Component Rules MCP Server running...');
  console.error('Available tools:');
  for (const tool of getToolDefinitions()) {
    console.error(`  - ${tool.name}: ${tool.description}`);
  }
}

main().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
