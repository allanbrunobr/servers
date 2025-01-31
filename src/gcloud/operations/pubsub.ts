import { getPubSubClient } from "../commons/utils.js";
import { PubSubTopicSchema } from "../commons/types.js";

export async function listPubSubTopics(projectId: string) {
    try {
        const client = await getPubSubClient();
        const response = await client.projects.topics.list({
            project: `projects/${projectId}`,
        });

        if (!response.data.topics) {
            return [];
        }

        return response.data.topics.map((topic: unknown) => PubSubTopicSchema.parse(topic));
    } catch (error: any) {
        const message = error?.message || 'Unknown error';
        throw new Error(`Failed to list Pub/Sub topics: ${message}`);
    }
}
