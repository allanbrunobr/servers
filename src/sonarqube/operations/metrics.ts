import { z } from 'zod';
import { makeRequest } from '../common/utils.js';
import { SonarMetricsSchema, SonarResponseSchema } from '../common/types.js';

export const GetMetricsSchema = z.object({
    projectKey: z.string().describe("The project key in SonarQube"),
    metrics: z.array(z.string()).optional().default([
        // Reliability Metrics
        'reliability_rating',        // Rating A-E
        'bugs',                      // Number of bugs
        'code_smells',              // Number of code smells
        'sqale_rating',             // Maintainability rating
        'sqale_index',              // Technical debt
        'vulnerabilities',          // Number of vulnerabilities
        'security_rating',          // Security rating

        // Basic Metrics (mantendo as originais)
        'coverage',
        'security_hotspots',
        'duplicated_lines_density'
    ])
});

export const ValidateMetricsSchema = z.object({
    projectKey: z.string(),
    minCoverage: z.number().min(0).max(100),
    maxDuplications: z.number().min(0).max(100),
    maxSecurityHotspots: z.number().min(0)
});

export async function getMetrics(params: z.infer<typeof GetMetricsSchema>) {
    const response = await makeRequest(
        `/api/measures/component?component=${params.projectKey}&metricKeys=${params.metrics.join(',')}`
    );

    const data = SonarResponseSchema.parse(response);

    const metrics = data.component.measures.reduce((acc, measure) => ({
        ...acc,
        [measure.metric]: Number(measure.value)
    }), {});

    return SonarMetricsSchema.parse(metrics);
}

export async function validateMetrics(params: z.infer<typeof ValidateMetricsSchema>) {
    const metrics = await getMetrics({
        projectKey: params.projectKey,
        metrics: ['coverage', 'security_hotspots', 'duplicated_lines_density']
    });

    const validations = {
        coverage: metrics.coverage >= params.minCoverage,
        duplications: metrics.duplicated_lines_density <= params.maxDuplications,
        securityHotspots: metrics.security_hotspots <= params.maxSecurityHotspots
    };

    return {
        metrics,
        validations,
        passed: Object.values(validations).every(v => v === true)
    };
} 