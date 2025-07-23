import { streamObject } from 'ai';
import { myProvider } from '@/lib/ai/providers';
import { createDocumentHandler } from '@/lib/artifacts/server';
import { z } from 'zod';

// Define the mindmap node type first
type MindmapNode = {
  id: string;
  text: string;
  children?: MindmapNode[] |  null;
};

// Define the mindmap schema with proper type annotations
const MindmapNodeSchema: z.ZodSchema<MindmapNode> = z.lazy(() =>
  z.object({
    id: z.string(),
    text: z.string(),
    children: z.array(MindmapNodeSchema).optional().default([]),
  })
);

const MindmapSchema = z.object({
  mindmap: MindmapNodeSchema.describe('The root node of the mindmap structure'),
});

export const mindmapDocumentHandler = createDocumentHandler<'mindmap'>({
  kind: 'mindmap',
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = '';

    const { partialObjectStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: `Create a mindmap structure in JSON format. The structure should be:
{
  "mindmap": {
    "id": "root",
    "text": "Main Topic",
    "children": [
      {
        "id": "child1",
        "text": "Sub Topic 1",
        "children": []
      }
    ]
  }
}

Make it comprehensive and well-structured for the given topic. Ensure each node has a unique ID and meaningful text.`,
      prompt: `Create a mindmap for: ${title}`,
      schema: MindmapSchema,
    });

    for await (const partialObject of partialObjectStream) {
      if (partialObject.mindmap) {
        const mindmapJson = JSON.stringify(partialObject.mindmap, null, 2);
        draftContent = mindmapJson;

        dataStream.write({
          type: 'data-mindmapDelta',
          data: mindmapJson,
          transient: true,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = '';

    const { partialObjectStream } = streamObject({
      model: myProvider.languageModel('artifact-model'),
      system: `Update the existing mindmap structure. The current structure is:
${document.content}

Update it based on the user's request while maintaining valid JSON format. Ensure each node has a unique ID and meaningful text.`,
      prompt: description,
      schema: MindmapSchema,
    });

    for await (const partialObject of partialObjectStream) {
      if (partialObject.mindmap) {
        const mindmapJson = JSON.stringify(partialObject.mindmap, null, 2);
        draftContent = mindmapJson;

        dataStream.write({
          type: 'data-mindmapDelta',
          data: mindmapJson,
          transient: true,
        });
      }
    }

    return draftContent;
  },
}); 