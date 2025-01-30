import { z } from "zod";
import { makeRequest } from "../common/utils.js";

export const GetDuplicationsSchema = z.object({
    projectKey: z.string().describe("The project key in SonarQube"),
});

type FileInfo = {
    key: string;
    path: string;
};

type ComponentsResponse = {
    components: Array<{
        key: string;
        path: string;
    }>;
};

export const DuplicationSchema = z.object({
    duplications: z.array(
        z.object({
            blocks: z.array(
                z.object({
                    from: z.number(),
                    size: z.number(),
                    _ref: z.string(),
                })
            ),
        })
    ),
    files: z.record(
        z.string(),
        z.object({
            key: z.string(),
            name: z.string(),
            projectName: z.string(),
        })
    ),
});

export async function listFiles(projectKey: string): Promise<FileInfo[]> {
    const response = await makeRequest<ComponentsResponse>(`/api/components/tree?component=${projectKey}&qualifiers=FIL`);

    return response.components.map(file => ({
        key: file.key,
        path: file.path,
    }));
}

export async function getFileDuplications(fileKey: string) {
    const response = await makeRequest(`/api/duplications/show?key=${fileKey}`);
    return DuplicationSchema.parse(response);
}

export async function getProjectDuplications(params: z.infer<typeof GetDuplicationsSchema>) {
    const fileKeys = await listFiles(params.projectKey);
    const duplications = [];

    for (const file of fileKeys) {
        const fileDuplication = await getFileDuplications(file.key);

        if (fileDuplication.duplications.length > 0) {
            duplications.push({
                file: file.path,
                duplications: fileDuplication.duplications.map(d => ({
                    blocks: d.blocks.map(b => ({
                        from: b.from,
                        size: b.size,
                        reference: fileDuplication.files[b._ref]?.name || "Unknown",
                        referenceProject: fileDuplication.files[b._ref]?.projectName || "Unknown",
                    })),
                })),
            });
        }
    }

    return duplications;
}