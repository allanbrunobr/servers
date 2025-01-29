import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as issues from './operations/issues.js';
import * as hotspots from "./operations/hotspots.js";
import * as metrics from './operations/metrics.js';
import * as duplications from "./operations/duplications.js";
import { isSonarQubeError } from './common/errors.js';

const server = new Server(
    {
        name: "sonarqube-mcp-server",
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
                name: "get_metrics",
                description: "Get SonarQube metrics for a project",
                inputSchema: zodToJsonSchema(metrics.GetMetricsSchema),
            },
            {
                name: "validate_metrics",
                description: "Validate SonarQube metrics against thresholds",
                inputSchema: zodToJsonSchema(metrics.ValidateMetricsSchema),
            },
            {
                name: "get_issues",
                description: "Get all issues for a project",
                inputSchema: zodToJsonSchema(issues.GetIssuesSchema),
            },
            {
                name: "get_hotspots",
                description: "Get all security hotspots for a project",
                inputSchema: zodToJsonSchema(hotspots.GetHotspotsSchema),
            },
            {
                name: "get_duplicated_files",
                description: "Get all duplicated files for a project",
                inputSchema: zodToJsonSchema(duplications.GetDuplicationsSchema),
            },
        ],
    };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        switch (request.params.name) {
            case "get_metrics": {
                const args = metrics.GetMetricsSchema.parse(request.params.arguments);
                const result = await metrics.getMetrics(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }

            case "validate_metrics": {
                const args = metrics.ValidateMetricsSchema.parse(request.params.arguments);
                const result = await metrics.validateMetrics(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }
            case "get_issues": {
                const args = issues.GetIssuesSchema.parse(request.params.arguments);
                const result = await issues.getIssues(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }
            case "get_hotspots": {
                const args = hotspots.GetHotspotsSchema.parse(request.params.arguments);
                const result = await hotspots.getHotspots(args);
                return {
                    content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
                };
            }
            case "get_duplicated_files": {
                const args = duplications.GetDuplicationsSchema.parse(request.params.arguments);
                const result = await duplications.getProjectDuplications(args);
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
        if (isSonarQubeError(error)) {
            throw new Error(`SonarQube API Error: ${error.message}`);
        }
        throw error;
    }
});

async function runServer() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("SonarQube MCP Server running on stdio");
}

runServer().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
}); 