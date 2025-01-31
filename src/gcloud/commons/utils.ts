import { google, Auth } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';

let authClient: Auth.OAuth2Client | null = null;

export async function getAuthClient() {
    if (authClient) {
        return authClient;
    }

    try {
        const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
            || join(__dirname, '..', 'credentials.json');
        const credentials = JSON.parse(readFileSync(credentialsPath, 'utf-8'));

        const auth = new google.auth.GoogleAuth({
            credentials,
            scopes: ['https://www.googleapis.com/auth/cloud-platform']
        });

        authClient = await auth.getClient() as Auth.OAuth2Client;
        return authClient;
    } catch (error: any) {
        const message = error?.message || 'Unknown error';
        throw new Error(`Failed to initialize Google Cloud authentication: ${message}`);
    }
}

export async function getPubSubClient() {
    const auth = await getAuthClient();
    return google.pubsub({ version: 'v1', auth });
}

export async function getCloudFunctionsClient() {
    const auth = await getAuthClient();
    return google.cloudfunctions({ version: 'v2beta', auth });
}
