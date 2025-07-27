import { streamObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { z } from "zod";

interface CurriculumUnit {
  id: string;
  title: string;
  description: string;
  order: number;
  topics: CurriculumTopic[];
}

interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  order: number;
  learningObjectives: string[];
  estimatedHours: number;
  resources: CurriculumResource[];
}

interface CurriculumResource {
  id: string;
  title: string;
  type: string;
  url?: string;
  description: string;
}

interface CurriculumData {
  title: string;
  description: string;
  totalEstimatedHours: number;
  prerequisites: string[];
  assessmentMethods: string[];
  units: CurriculumUnit[];
}

// Define the curriculum schema
const CurriculumSchema = z.object({
  title: z.string(),
  description: z.string(),
  totalEstimatedHours: z.number(),
  prerequisites: z.array(z.string()),
  assessmentMethods: z.array(z.string()),
  units: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      order: z.number(),
      topics: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          description: z.string(),
          order: z.number(),
          learningObjectives: z.array(z.string()),
          estimatedHours: z.number(),
          resources: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              type: z.string(),
              url: z.string().optional(),
              description: z.string(),
            })
          ),
        })
      ),
    })
  ),
});

export const curriculumDocumentHandler = createDocumentHandler<"curriculum">({
  kind: "curriculum",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { partialObjectStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: `You are an expert curriculum designer. Create comprehensive, well-structured curriculum plans that include:

1. Clear learning objectives for each topic
2. Realistic time estimates
3. Diverse assessment methods
4. Relevant learning resources
5. Logical progression of concepts

Format the response as a structured curriculum with units, topics, learning objectives, and time estimates.`,
      prompt: `Create a comprehensive curriculum for: ${title}

Please provide a detailed curriculum structure with:
- 3-5 main units
- 3-6 topics per unit
- Specific learning objectives for each topic
- Realistic time estimates
- Diverse assessment methods
- Relevant learning resources

Focus on creating a practical, engaging curriculum that follows educational best practices.`,
      schema: CurriculumSchema,
    });

    for await (const partialObject of partialObjectStream) {
      if (
        partialObject.title &&
        partialObject.description &&
        partialObject.units
      ) {
        const curriculumJson = JSON.stringify(partialObject, null, 2);
        draftContent = curriculumJson;

        dataStream.write({
          type: "data-curriculumStructure",
          data: partialObject as CurriculumData,
          transient: false,
        });
      }
    }

    return draftContent;
  },
  onUpdateDocument: async ({ document, description, dataStream }) => {
    let draftContent = "";

    const { partialObjectStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: `You are an expert curriculum designer. Update the existing curriculum structure based on the user's request.

Current curriculum content:
${document.content}

${updateDocumentPrompt(document.content, "curriculum")}`,
      prompt: description,
      schema: CurriculumSchema,
    });

    for await (const partialObject of partialObjectStream) {
      if (
        partialObject.title &&
        partialObject.description &&
        partialObject.units
      ) {
        const curriculumJson = JSON.stringify(partialObject, null, 2);
        draftContent = curriculumJson;

        dataStream.write({
          type: "data-curriculumStructure",
          data: partialObject as CurriculumData,
          transient: false,
        });
      }
    }

    return draftContent;
  },
});
