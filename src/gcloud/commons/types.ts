import { z } from "zod";

// Schema para um tópico do Pub/Sub
export const PubSubTopicSchema = z.object({
    name: z.string(),
});

// Schema para uma função do Cloud Functions
export const CloudFunctionSchema = z.object({
    name: z.string(),
    entryPoint: z.string(),
    runtime: z.string(),
    availableMemoryMb: z.number(),
    timeout: z.string(),
    status: z.string(),
});

// Exportação dos tipos
export type PubSubTopic = z.infer<typeof PubSubTopicSchema>;
export type CloudFunction = z.infer<typeof CloudFunctionSchema>;