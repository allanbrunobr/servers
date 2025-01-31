import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ErrorCode, ListToolsRequestSchema, McpError } from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { listCloudFunctions } from './operations/cloudFunctions.js';
import { listPubSubTopics } from './operations/pubsub.js';

class GoogleCloudServer {
    private server: Server;

    constructor() {
        this.server = new Server(
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

        this.setupRequestHandlers();
        this.setupErrorHandling();
    }

    private setupRequestHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: "list_cloud_functions",
                    description: "List all Cloud Functions in a specific project and region",
                    inputSchema: zodToJsonSchema(z.object({
                        projectId: z.string().min(1, "Project ID is required"),
                        region: z.string().min(1, "Region is required"),
                    })),
                },
                {
                    name: "list_pubsub_topics",
                    description: "List all Pub/Sub topics in a specific project",
                    inputSchema: zodToJsonSchema(z.object({
                        projectId: z.string().min(1, "Project ID is required"),
                    })),
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            try {
                switch (request.params.name) {
                    case "list_cloud_functions": {
                        const args = z.object({
                            projectId: z.string().min(1, "Project ID is required"),
                            region: z.string().min(1, "Region is required"),
                        }).parse(request.params.arguments);

                        const result = await listCloudFunctions(args.projectId, args.region);
                        return {
                            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                        };
                    }

                    case "list_pubsub_topics": {
                        const args = z.object({
                            projectId: z.string().min(1, "Project ID is required"),
                        }).parse(request.params.arguments);

                        const result = await listPubSubTopics(args.projectId);
                        return {
                            content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                        };
                    }

                    default:
                        throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${request.params.name}`);
                }
            } catch (error: any) {
                if (error instanceof z.ZodError) {
                    throw new McpError(
                        ErrorCode.InvalidParams,
                        `Invalid input: ${error.errors.map(e => e.message).join(", ")}`
                    );
                }
                if (error instanceof McpError) {
                    throw error;
                }
                throw new McpError(
                    ErrorCode.InternalError,
                    `Operation failed: ${error?.message || "Unknown error"}`
                );
            }
        });
    }

    private setupErrorHandling() {
        this.server.onerror = (error) => {
            console.error("[MCP Error]", error);
        };

        process.on("SIGINT", async () => {
            try {
                await this.server.close();
                console.error("Server shutdown complete");
                process.exit(0);
            } catch (error) {
                console.error("Error during shutdown:", error);
                process.exit(1);
            }
        });

        process.on("uncaughtException", (error) => {
            console.error("Uncaught exception:", error);
            process.exit(1);
        });
    }

    async run() {
        try {
            const transport = new StdioServerTransport();
            await this.server.connect(transport);
            console.error("Google Cloud MCP Server running on stdio");
        } catch (error) {
            console.error("Failed to start server:", error);
            process.exit(1);
        }
    }
}

const server = new GoogleCloudServer();
server.run().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
