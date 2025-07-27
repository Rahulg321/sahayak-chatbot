import { z } from "zod";
import type { getWeather } from "./ai/tools/get-weather";
import type { getUserGrades } from "./ai/tools/get-user-grades";
import type { createDocument } from "./ai/tools/create-document";
import type { updateDocument } from "./ai/tools/update-document";
import type { requestSuggestions } from "./ai/tools/request-suggestions";
import type { getResourcesInformation } from "./ai/tools/get-resources-information";
import type { InferUITool, UIMessage } from "ai";

import type { ArtifactKind } from "@/components/artifact";
import type { Suggestion } from "./db/schema";
import { getUserSubjects } from "./ai/tools/get-user-subjects";
import { getNotesFromSubjectId } from "./ai/tools/getNotesFromSubjectId";
import { getSubjectIdFromName } from "./ai/tools/getSubjectIdFromName";
import { getAllSubjectResources } from "./ai/tools/get-all-subject-resources";

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

export interface CurriculumData {
  title: string;
  description: string;
  totalEstimatedHours: number;
  prerequisites: string[];
  assessmentMethods: string[];
  units: CurriculumUnit[];
}

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

export interface HomeworkData {
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

export interface LessonPlanData {
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

export type DataPart = { type: "append-message"; message: string };

export const messageMetadataSchema = z.object({
  createdAt: z.string(),
});

export type MessageMetadata = z.infer<typeof messageMetadataSchema>;

type weatherTool = InferUITool<typeof getWeather>;
type getUserGradesTool = InferUITool<typeof getUserGrades>;
type getUserSubjectsTool = InferUITool<typeof getUserSubjects>;
type createDocumentTool = InferUITool<ReturnType<typeof createDocument>>;
type updateDocumentTool = InferUITool<ReturnType<typeof updateDocument>>;
type requestSuggestionsTool = InferUITool<
  ReturnType<typeof requestSuggestions>
>;
type getResourcesInformationTool = InferUITool<typeof getResourcesInformation>;
type getNotesFromSubjectIdTool = InferUITool<typeof getNotesFromSubjectId>;
type getSubjectIdFromNameTool = InferUITool<typeof getSubjectIdFromName>;
type getAllSubjectResourcesTool = InferUITool<typeof getAllSubjectResources>;
export type ChatTools = {
  getWeather: weatherTool;
  getUserGrades: getUserGradesTool;
  getUserSubjects: getUserSubjectsTool;
  createDocument: createDocumentTool;
  updateDocument: updateDocumentTool;
  requestSuggestions: requestSuggestionsTool;
  getResourcesInformation: getResourcesInformationTool;
  getNotesFromSubjectId: getNotesFromSubjectIdTool;
  getSubjectIdFromName: getSubjectIdFromNameTool;
  getAllSubjectResources: getAllSubjectResourcesTool;
};

export type CustomUIDataTypes = {
  textDelta: string;
  imageDelta: string;
  sheetDelta: string;
  codeDelta: string;
  mindmapDelta: string;
  curriculumDelta: string;
  curriculumStructure: CurriculumData;
  homeworkStructure: HomeworkData;
  lessonPlanStructure: LessonPlanData;
  suggestion: Suggestion;
  appendMessage: string;
  id: string;
  title: string;
  kind: ArtifactKind;
  clear: null;
  finish: null;
};

export type ChatMessage = UIMessage<
  MessageMetadata,
  CustomUIDataTypes,
  ChatTools
>;

export interface Attachment {
  name: string;
  url: string;
  contentType: string;
}
