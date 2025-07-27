"use client";

import {
  BookOpenIcon,
  ClockIcon,
  TargetIcon,
  CheckSquareIcon,
  FileTextIcon,
  CalendarIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Suggestion } from "@/lib/db/schema";
import type { HomeworkData } from "@/lib/types";

interface HomeworkViewerProps {
  content: string;
  homeworkData?: HomeworkData;
  suggestions: Suggestion[];
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: "streaming" | "idle";
  onSaveContent: (content: string) => void;
}

export function HomeworkViewer({
  content,
  homeworkData,
  suggestions,
  isCurrentVersion,
  currentVersionIndex,
  status,
  onSaveContent,
}: HomeworkViewerProps) {
  // Try to parse homework data from content if not provided
  let parsedHomeworkData = homeworkData;

  if (!parsedHomeworkData && content) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.title && parsed.tasks) {
        parsedHomeworkData = parsed;
      }
    } catch (error) {
      // If parsing fails, content is not JSON
    }
  }

  if (!parsedHomeworkData) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
        </div>
      </div>
    );
  }

  const getTaskTypeIcon = (type: string) => {
    switch (type) {
      case "reading":
        return <BookOpenIcon size={16} />;
      case "writing":
        return <FileTextIcon size={16} />;
      case "problem-solving":
        return <TargetIcon size={16} />;
      case "research":
        return <BookOpenIcon size={16} />;
      case "project":
        return <CheckSquareIcon size={16} />;
      case "quiz":
        return <CheckSquareIcon size={16} />;
      default:
        return <FileTextIcon size={16} />;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case "reading":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "writing":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "problem-solving":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "research":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "project":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "quiz":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-12 py-8">
      {/* Header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-bold mb-4">
            {parsedHomeworkData.title}
          </CardTitle>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {parsedHomeworkData.description}
          </p>
          <div className="flex flex-wrap items-center gap-4 text-base text-muted-foreground">
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
              <ClockIcon size={18} />
              <span className="font-medium">
                Total Time: {parsedHomeworkData.totalEstimatedTime} minutes
              </span>
            </div>
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
              <span className="font-medium">
                Subject: {parsedHomeworkData.subject}
              </span>
            </div>
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
              <span className="font-medium">
                Grade: {parsedHomeworkData.grade}
              </span>
            </div>
            {parsedHomeworkData.dueDate && (
              <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
                <CalendarIcon size={18} />
                <span className="font-medium">
                  Due: {parsedHomeworkData.dueDate}
                </span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {parsedHomeworkData.learningObjectives.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-3 text-primary">
                <TargetIcon size={20} />
                Learning Objectives
              </h4>
              <ul className="space-y-3 ml-6">
                {parsedHomeworkData.learningObjectives.map(
                  (objective, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground leading-relaxed flex items-start gap-3"
                    >
                      <span className="text-primary mt-1 text-lg">•</span>
                      <span>{objective}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}

          {parsedHomeworkData.submissionRequirements.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-3 text-primary">
                <CheckSquareIcon size={20} />
                Submission Requirements
              </h4>
              <ul className="space-y-3 ml-6">
                {parsedHomeworkData.submissionRequirements.map(
                  (requirement, index) => (
                    <li
                      key={index}
                      className="text-muted-foreground leading-relaxed flex items-start gap-3"
                    >
                      <span className="text-primary mt-1 text-lg">•</span>
                      <span>{requirement}</span>
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-center mb-8">
          Assignment Tasks
        </h3>
        <div className="space-y-8">
          {parsedHomeworkData.tasks.map((task) => (
            <Card key={task.id} className="shadow-sm">
              <CardHeader className="pb-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl font-bold mb-3">
                      Task {task.order}: {task.title}
                    </CardTitle>
                    <p className="text-muted-foreground leading-relaxed text-base mb-4">
                      {task.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`px-3 py-1 text-sm flex items-center gap-2 ${getTaskTypeColor(task.type)}`}
                    >
                      {getTaskTypeIcon(task.type)}
                      {task.type.replace("-", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg w-fit">
                  <ClockIcon size={16} />
                  <span className="font-medium">
                    {task.estimatedTime} minutes
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {task.instructions.length > 0 && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-base flex items-center gap-3 text-primary">
                      <FileTextIcon size={18} />
                      Instructions
                    </h5>
                    <ol className="space-y-3 ml-6">
                      {task.instructions.map((instruction, index) => (
                        <li
                          key={index}
                          className="text-muted-foreground leading-relaxed flex items-start gap-3"
                        >
                          <span className="text-primary mt-1 text-sm font-bold">
                            {index + 1}.
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}

                {task.resources.length > 0 && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-base flex items-center gap-3 text-primary">
                      <BookOpenIcon size={18} />
                      Resources
                    </h5>
                    <div className="space-y-4 ml-6">
                      {task.resources.map((resource) => (
                        <div
                          key={resource.id}
                          className="p-4 bg-muted/30 rounded-lg border space-y-2"
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="outline"
                              className="text-xs px-3 py-1"
                            >
                              {resource.type}
                            </Badge>
                            <span className="font-medium text-base">
                              {resource.title}
                            </span>
                          </div>
                          {resource.description && (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {resource.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {task.rubric && (
                  <div className="space-y-4">
                    <h5 className="font-medium text-base flex items-center gap-3 text-primary">
                      <CheckSquareIcon size={18} />
                      Assessment Rubric (Total: {task.rubric.totalPoints}{" "}
                      points)
                    </h5>
                    <div className="space-y-4 ml-6">
                      {task.rubric.criteria.map((criterion) => (
                        <div
                          key={criterion.id}
                          className="p-4 bg-muted/30 rounded-lg border space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <h6 className="font-medium text-base">
                              {criterion.title}
                            </h6>
                            <Badge variant="outline" className="text-sm">
                              {criterion.points} points
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">
                            {criterion.description}
                          </p>
                          <div className="space-y-2">
                            {criterion.levels.map((level, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="text-muted-foreground">
                                  {level.level}: {level.description}
                                </span>
                                <span className="font-medium">
                                  {level.points} pts
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <Card className="shadow-sm">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold">Suggestions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {suggestions.map((suggestion) => (
              <div key={suggestion.id} className="p-4 bg-muted rounded-lg">
                <p className="text-sm leading-relaxed">
                  {suggestion.suggestedText}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
