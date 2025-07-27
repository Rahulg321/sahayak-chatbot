import { streamObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { z } from "zod";

interface HomeworkTask {
  id: string;
  title: string;
  description: string;
  order: number;
  type:
    | "reading"
    | "writing"
    | "problem-solving"
    | "research"
    | "project"
    | "quiz";
  estimatedTime: number;
  instructions: string[];
  resources: HomeworkResource[];
  rubric?: HomeworkRubric;
}

interface HomeworkResource {
  id: string;
  title: string;
  type: string;
  url?: string;
  description: string;
}

interface HomeworkRubric {
  criteria: RubricCriteria[];
  totalPoints: number;
}

interface RubricCriteria {
  id: string;
  title: string;
  description: string;
  points: number;
  levels: RubricLevel[];
}

interface RubricLevel {
  level: string;
  description: string;
  points: number;
}

interface HomeworkData {
  title: string;
  description: string;
  subject: string;
  grade: string;
  totalEstimatedTime: number;
  dueDate?: string;
  learningObjectives: string[];
  submissionRequirements: string[];
  tasks: HomeworkTask[];
}

// Define the homework schema
const HomeworkSchema = z.object({
  title: z.string(),
  description: z.string(),
  subject: z.string(),
  grade: z.string(),
  totalEstimatedTime: z.number(),
  dueDate: z.string().optional(),
  learningObjectives: z.array(z.string()),
  submissionRequirements: z.array(z.string()),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      order: z.number(),
      type: z.enum([
        "reading",
        "writing",
        "problem-solving",
        "research",
        "project",
        "quiz",
      ]),
      estimatedTime: z.number(),
      instructions: z.array(z.string()),
      resources: z.array(
        z.object({
          id: z.string(),
          title: z.string(),
          type: z.string(),
          url: z.string().optional(),
          description: z.string(),
        })
      ),
      rubric: z
        .object({
          criteria: z.array(
            z.object({
              id: z.string(),
              title: z.string(),
              description: z.string(),
              points: z.number(),
              levels: z.array(
                z.object({
                  level: z.string(),
                  description: z.string(),
                  points: z.number(),
                })
              ),
            })
          ),
          totalPoints: z.number(),
        })
        .optional(),
    })
  ),
});

export const homeworkDocumentHandler = createDocumentHandler<"homework">({
  kind: "homework",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { partialObjectStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: `You are an expert homework designer and educator. Create comprehensive, engaging homework assignments that include:

1. Clear learning objectives aligned with curriculum standards
2. Varied task types (reading, writing, problem-solving, research, projects, quizzes)
3. Realistic time estimates for each task
4. Detailed instructions and requirements
5. Relevant learning resources
6. Assessment rubrics where appropriate
7. Clear submission requirements

Format the response as a structured homework assignment with tasks, resources, and assessment criteria.`,
      prompt: `Create a comprehensive homework assignment for: ${title}

Please provide a detailed homework structure with:
- 3-6 main tasks of varying types
- Specific learning objectives
- Realistic time estimates for each task
- Clear instructions and requirements
- Relevant learning resources
- Assessment rubrics where appropriate
- Clear submission requirements

Focus on creating engaging, educational homework that promotes learning and skill development.`,
      schema: HomeworkSchema,
    });

    for await (const partialObject of partialObjectStream) {
      if (
        partialObject.title &&
        partialObject.description &&
        partialObject.tasks
      ) {
        const homeworkJson = JSON.stringify(partialObject, null, 2);
        draftContent = homeworkJson;

        dataStream.write({
          type: "data-homeworkStructure",
          data: partialObject as HomeworkData,
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
      system: `You are an expert homework designer and educator. Update the existing homework assignment based on the user's request.

Current homework content:
${document.content}

${updateDocumentPrompt(document.content, "homework")}`,
      prompt: description,
      schema: HomeworkSchema,
    });

    for await (const partialObject of partialObjectStream) {
      if (
        partialObject.title &&
        partialObject.description &&
        partialObject.tasks
      ) {
        const homeworkJson = JSON.stringify(partialObject, null, 2);
        draftContent = homeworkJson;

        dataStream.write({
          type: "data-homeworkStructure",
          data: partialObject as HomeworkData,
          transient: false,
        });
      }
    }

    return draftContent;
  },
});
