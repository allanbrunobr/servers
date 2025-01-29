import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { listCloudFunctions } from './operations/cloudFunctions.js';
import { listPubSubTopics } from './operations/pubsub.js';

const server = new Server(
    {
        name: "gcloud-mcp-server",
        version: "0.1.0",
    },
    {
        capabilities: {
            tools: {},
        },
    }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: "list_cloud_functions",
                description: "List all Cloud Functions in a specific project and region",
                inputSchema: zodToJsonSchema(z.object({
                    projectId: z.string(),
                    region: z.string(),
                })),
            },
            {
                name: "list_pubsub_topics",
                description: "List all Pub/Sub topics in a specific project",
                inputSchema: zodToJsonSchema(z.object({
                    projectId: z.string(),
                })),
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "list_cloud_functions": {
                const args = z.object({
                    projectId: z.string(),
                    region: z.string(),
                }).parse(request.params.arguments);
                const result = await listCloudFunctions(args.projectId, args.region);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            case "list_pubsub_topics": {
                const args = z.object({
                    projectId: z.string(),
                }).parse(request.params.arguments);
                const result = await listPubSubTopics(args.projectId);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            default:
                throw new Error(`Unknown tool: ${request.params.name}`);
        }
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
        }
        throw error;
    }
});

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Google Cloud MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
}); 