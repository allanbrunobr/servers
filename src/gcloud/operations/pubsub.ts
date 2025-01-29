import { getGoogleCloudClient } from "../commons/utils.js";
import { PubSubTopicSchema } from "../commons/types.js";

export async function listPubSubTopics(projectId: string) {
    const client = await getGoogleCloudClient();
    const response = await client.projects.topics.list({
        project: `projects/${projectId}`,
    });

    if (!response.data.topics) {
        return [];
    }

    return response.data.topics.map((topic: unknown) => PubSubTopicSchema.parse(topic));
}