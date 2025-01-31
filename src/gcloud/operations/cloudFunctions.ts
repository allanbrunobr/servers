import { CloudFunctionSchema } from "../commons/types.js";
import { getCloudFunctionsClient } from "../commons/utils.js";

export async function listCloudFunctions(projectId: string, region: string) {
    const client = await getCloudFunctionsClient();

    const response = await client.projects.locations.functions.list({
        parent: `projects/${projectId}/locations/${region}`,
    });

    if (!response.data.functions) {
        return [];
    }

    return response.data.functions.map(func => CloudFunctionSchema.parse(func));
}
