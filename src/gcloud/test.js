import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function test() {
    const transport = new StdioClientTransport({
        command: "node",
        args: ["dist/index.js"]
    });
    const client = new Client(
        {
            name: "test-client",
            version: "0.1.0",
        },
        {
            capabilities: {
                tools: {}
            }
        }
    );

    await client.connect(transport);

    try {
        const result = await client.tools.call("list_cloud_functions", {
            projectId: "arcane-text-377602",
            region: "us-central1"
        });
        console.log("Cloud Functions:", JSON.stringify(result, null, 2));
    } catch (error) {
        console.error("Error:", error);
    } finally {
        await client.close();
    }
}

test().catch(console.error);
