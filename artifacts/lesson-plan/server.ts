import { streamObject } from "ai";
import { myProvider } from "@/lib/ai/providers";
import { createDocumentHandler } from "@/lib/artifacts/server";
import { updateDocumentPrompt } from "@/lib/ai/prompts";
import { z } from "zod";

interface LessonPlanActivity {
  id: string;
  title: string;
  description: string;
  order: number;
  type:
    | "introduction"
    | "presentation"
    | "guided-practice"
    | "independent-practice"
    | "assessment"
    | "closure";
  estimatedTime: number;
  instructions: string[];
  materials: string[];
  differentiationStrategies?: string[];
}

interface LessonPlanResource {
  id: string;
  title: string;
  type: string;
  url?: string;
  description: string;
}

interface LessonPlanAssessment {
  type: string;
  description: string;
  criteria: string[];
  rubric?: AssessmentRubric;
}

interface AssessmentRubric {
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

interface LessonPlanData {
  title: string;
  description: string;
  subject: string;
  grade: string;
  duration: number;
  date?: string;
  learningObjectives: string[];
  prerequisites: string[];
  materials: string[];
  activities: LessonPlanActivity[];
  resources: LessonPlanResource[];
  assessments: LessonPlanAssessment[];
  differentiationStrategies: string[];
  closure: string[];
}

// Define the lesson plan schema
const LessonPlanSchema = z.object({
  title: z.string(),
  description: z.string(),
  subject: z.string(),
  grade: z.string(),
  duration: z.number(),
  date: z.string().optional(),
  learningObjectives: z.array(z.string()),
  prerequisites: z.array(z.string()),
  materials: z.array(z.string()),
  activities: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      order: z.number(),
      type: z.enum([
        "introduction",
        "presentation",
        "guided-practice",
        "independent-practice",
        "assessment",
        "closure",
      ]),
      estimatedTime: z.number(),
      instructions: z.array(z.string()),
      materials: z.array(z.string()),
      differentiationStrategies: z.array(z.string()).optional(),
    })
  ),
  resources: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      type: z.string(),
      url: z.string().optional(),
      description: z.string(),
    })
  ),
  assessments: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      criteria: z.array(z.string()),
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
  differentiationStrategies: z.array(z.string()),
  closure: z.array(z.string()),
});

export const lessonPlanDocumentHandler = createDocumentHandler<"lesson-plan">({
  kind: "lesson-plan",
  onCreateDocument: async ({ title, dataStream }) => {
    let draftContent = "";

    const { partialObjectStream } = streamObject({
      model: myProvider.languageModel("artifact-model"),
      system: `You are an expert lesson planner and educator. Create comprehensive, engaging lesson plans that include:

1. Clear learning objectives aligned with curriculum standards
2. Well-structured activities with appropriate time allocations
3. Detailed instructions for each activity
4. Required materials and resources
5. Assessment methods and criteria
6. Differentiation strategies for diverse learners
7. Effective lesson closure activities

Format the response as a structured lesson plan with activities, resources, and assessment strategies.`,
      prompt: `Create a comprehensive lesson plan for: ${title}

Please provide a detailed lesson plan structure with:
- 4-8 main activities covering introduction, presentation, guided practice, independent practice, assessment, and closure
- Specific learning objectives
- Realistic time estimates for each activity
- Clear instructions and materials needed
- Relevant learning resources
- Assessment methods and criteria
- Differentiation strategies
- Effective closure activities

Focus on creating engaging, educational lesson plans that promote active learning and skill development.`,
      schema: LessonPlanSchema,
    });

    for await (const partialObject of partialObjectStream) {
      if (
        partialObject.title &&
        partialObject.description &&
        partialObject.activities
      ) {
        const lessonPlanJson = JSON.stringify(partialObject, null, 2);
        draftContent = lessonPlanJson;

        dataStream.write({
          type: "data-lessonPlanStructure",
          data: partialObject as LessonPlanData,
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
      system: `You are an expert lesson planner and educator. Update the existing lesson plan based on the user's request.

Current lesson plan content:
${document.content}

${updateDocumentPrompt(document.content, "lesson-plan")}`,
      prompt: description,
      schema: LessonPlanSchema,
    });

    for await (const partialObject of partialObjectStream) {
      if (
        partialObject.title &&
        partialObject.description &&
        partialObject.activities
      ) {
        const lessonPlanJson = JSON.stringify(partialObject, null, 2);
        draftContent = lessonPlanJson;

        dataStream.write({
          type: "data-lessonPlanStructure",
          data: partialObject as LessonPlanData,
          transient: false,
        });
      }
    }

    return draftContent;
  },
});
