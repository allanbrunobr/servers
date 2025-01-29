import fetch, { RequestInit } from 'node-fetch';
import { SonarQubeError, SonarQubeAuthenticationError } from './errors.js';

export async function makeRequest(path: string, options: Partial<RequestInit> = {}) {
    const token = process.env.SONAR_TOKEN; //squ_1e561d0625bd940066f08dc91357bd94662416e7
    const baseUrl = process.env.SONAR_URL || 'http://localhost:9000';

    if (!token) {
        throw new Error('SONAR_TOKEN environment variable is required');
    }

    const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(options.headers as Record<string, string>),
        },
    });

    if (!response.ok) {
        const error = await response.json();

        if (response.status === 401) {
            throw new SonarQubeAuthenticationError(error.message || 'Authentication failed', error, response.status);
        }

        throw new SonarQubeError(error.message || 'SonarQube API error', error, response.status);
    }

    return response.json();
} 