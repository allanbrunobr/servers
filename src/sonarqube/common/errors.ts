export class SonarQubeError extends Error {
    constructor(message: string, public statusCode: number, public response: any) {
        super(message);
        this.name = 'SonarQubeError';
    }
}

export class SonarQubeAuthenticationError extends SonarQubeError {
    constructor(message: string, statusCode: number, response: any) {
        super(message, statusCode, response);
        this.name = 'SonarQubeAuthenticationError';
    }
}

export function isSonarQubeError(error: any): error is SonarQubeError {
    return error instanceof SonarQubeError;
} 