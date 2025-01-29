import { z } from "zod";
import { makeRequest } from "../common/utils.js";

// Esquema para validar os parâmetros de entrada
export const GetHotspotsSchema = z.object({
    projectKey: z.string().describe("The project key in SonarQube"),
    pageSize: z.number().optional().default(100), // Máximo de resultados por página
    pageIndex: z.number().optional().default(1), // Página inicial
    status: z.string().optional(), // Status dos hotspots (TO_REVIEW, REVIEWED)
    severity: z.string().optional(), // Severidade associada
    securityCategory: z.string().optional(), // Categoria de segurança
    owaspTop10: z.string().optional(), // OWASP Top 10 (2017 ou 2021)
});

// Função para obter os hotspots do SonarQube
export async function getHotspots(params: z.infer<typeof GetHotspotsSchema>) {
    const queryParams = new URLSearchParams({
        project: params.projectKey,
        ps: params.pageSize.toString(),
        p: params.pageIndex.toString(),
        ...(params.status ? { status: params.status } : {}),
        ...(params.severity ? { severity: params.severity } : {}),
        ...(params.securityCategory ? { securityCategory: params.securityCategory } : {}),
        ...(params.owaspTop10 ? { owaspTop10: params.owaspTop10 } : {}),
    }).toString();

    const response = await makeRequest(`/api/hotspots/search?${queryParams}`);

    return {
        totalHotspots: response.paging.total,
        hotspots: response.hotspots.map((hotspot: any) => ({
            key: hotspot.key,
            component: hotspot.component,
            project: hotspot.project,
            securityCategory: hotspot.securityCategory,
            vulnerabilityProbability: hotspot.vulnerabilityProbability,
            status: hotspot.status,
            line: hotspot.line,
            message: hotspot.message,
            author: hotspot.author,
            creationDate: hotspot.creationDate,
            updateDate: hotspot.updateDate,
        })),
    };
}
