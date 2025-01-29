import { google, Auth } from 'googleapis';
import { CloudFunctionSchema } from "../commons/types.js";

export async function listCloudFunctions(projectId: string, region: string) {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const authClient = await auth.getClient() as Auth.OAuth2Client;
    const client = google.cloudfunctions({ version: 'v2beta', auth: authClient });

    const response = await client.projects.locations.functions.list({
        parent: `projects/${projectId}/locations/${region}`,
    });

    if (!response.data.functions) {
        return [];
    }

    return response.data.functions.map(func => CloudFunctionSchema.parse(func));
}