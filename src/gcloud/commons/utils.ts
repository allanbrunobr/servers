import { google, Auth } from 'googleapis';

// Função para autenticar e obter o cliente do Google Cloud
export async function getGoogleCloudClient() {
    const auth = new google.auth.GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });
    const authClient = await auth.getClient() as Auth.OAuth2Client;
    return google.pubsub({ version: 'v1beta2', auth: authClient });
}