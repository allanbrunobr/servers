import { z } from 'zod';

export const SonarMetricsSchema = z.object({
    coverage: z.number(),
    security_hotspots: z.number(),
    duplicated_lines_density: z.number()
});

export const SonarComponentSchema = z.object({
    measures: z.array(z.object({
        metric: z.string(),
        value: z.string()
    }))
});

export const SonarResponseSchema = z.object({
    component: SonarComponentSchema
});

export interface Issue {
    key: string;
    severity: string;
    component: string;
    line: number;
    message: string;
    author: string;
    tags: string[];
    creationDate: string;
    type: string;
}