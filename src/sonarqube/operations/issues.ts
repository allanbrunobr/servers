import { z } from 'zod';
import { makeRequest } from '../common/utils.js';

// Definição do esquema para entrada de parâmetros
export const GetIssuesSchema = z.object({
    projectKey: z.string().describe("The project key in SonarQube"),
    pageSize: z.number().optional().default(100), // Máximo de resultados por página
    pageIndex: z.number().optional().default(1), // Página inicial
    severities: z.string().optional(), // Severidades (INFO, MINOR, MAJOR, CRITICAL, BLOCKER)
    types: z.string().optional(), // Tipos de issue (BUG, VULNERABILITY, CODE_SMELL)
    statuses: z.string().optional(), // Status das issues (OPEN, CONFIRMED, FIXED, etc.)
    impactSoftwareQualities: z.string().optional(), // MAINTAINABILITY, RELIABILITY, SECURITY
});


// Tipagem das issues do SonarQube
export const IssueSchema = z.object({
    key: z.string(),
    severity: z.string(),
    component: z.string(),
    line: z.number().optional(),
    message: z.string(),
    author: z.string().optional(),
    tags: z.array(z.string()).optional(),
    creationDate: z.string(),
    type: z.string(),
});

export async function getIssues(params: z.infer<typeof GetIssuesSchema>) {
    const queryParams = new URLSearchParams({
        componentKeys: params.projectKey,
        ps: params.pageSize.toString(),
        p: params.pageIndex.toString(),
        ...(params.severities ? { severities: params.severities } : {}),
        ...(params.types ? { types: params.types } : {}),
        ...(params.statuses ? { statuses: params.statuses } : {}),
        ...(params.impactSoftwareQualities ? { impactSoftwareQualities: params.impactSoftwareQualities } : {}),

    }).toString();

    const response = await makeRequest(`/api/issues/search?${queryParams}`);

    return {
        totalIssues: response.total,
        issues: response.issues.map((issue: z.infer<typeof IssueSchema>) => ({
            key: issue.key,
            severity: issue.severity,
            component: issue.component,
            line: issue.line ?? null,
            message: issue.message,
            author: issue.author ?? "Unknown",
            tags: issue.tags ?? [],
            creationDate: issue.creationDate,
            type: issue.type,
            quality: params.impactSoftwareQualities ?? "Unknown",
        })),
    };
}
