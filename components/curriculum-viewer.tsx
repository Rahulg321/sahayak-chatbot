"use client";

import { BookOpenIcon, ClockIcon, TargetIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Suggestion } from "@/lib/db/schema";

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

interface CurriculumViewerProps {
  content: string;
  curriculumData?: CurriculumData;
  suggestions: Suggestion[];
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: "streaming" | "idle";
  onSaveContent: (content: string) => void;
}

export function CurriculumViewer({
  content,
  curriculumData,
  suggestions,
  isCurrentVersion,
  currentVersionIndex,
  status,
  onSaveContent,
}: CurriculumViewerProps) {
  // Try to parse curriculum data from content if not provided
  let parsedCurriculumData = curriculumData;

  if (!parsedCurriculumData && content) {
    try {
      const parsed = JSON.parse(content);
      if (parsed.title && parsed.units) {
        parsedCurriculumData = parsed;
      }
    } catch (error) {
      // If parsing fails, content is not JSON
    }
  }

  if (!parsedCurriculumData) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap leading-relaxed">{content}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      {/* Header */}
      <Card className="shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="text-3xl font-bold mb-4">
            {parsedCurriculumData.title}
          </CardTitle>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            {parsedCurriculumData.description}
          </p>
          <div className="flex items-center gap-4 text-base text-muted-foreground">
            <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
              <ClockIcon size={18} />
              <span className="font-medium">
                Total Hours: {parsedCurriculumData.totalEstimatedHours}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {parsedCurriculumData.prerequisites.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-3">Prerequisites</h4>
              <div className="flex flex-wrap gap-3">
                {parsedCurriculumData.prerequisites.map((prereq, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="px-4 py-2 text-sm"
                  >
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {parsedCurriculumData.assessmentMethods.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold text-lg mb-3">Assessment Methods</h4>
              <div className="flex flex-wrap gap-3">
                {parsedCurriculumData.assessmentMethods.map((method, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="px-4 py-2 text-sm"
                  >
                    {method}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Units */}
      <div className="space-y-8">
        <h3 className="text-2xl font-bold text-center mb-8">
          Curriculum Units
        </h3>
        <div className="space-y-8">
          {parsedCurriculumData.units.map((unit) => (
            <Card key={unit.id} className="shadow-sm">
              <CardHeader className="pb-6">
                <CardTitle className="text-xl font-bold mb-3">
                  Unit {unit.order}: {unit.title}
                </CardTitle>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {unit.description}
                </p>
              </CardHeader>
              <CardContent className="space-y-8">
                {unit.topics.map((topic) => (
                  <div
                    key={topic.id}
                    className="border-l-4 border-muted pl-8 space-y-6"
                  >
                    <div className="space-y-3">
                      <h4 className="font-semibold text-lg">
                        Topic {topic.order}: {topic.title}
                      </h4>
                      <p className="text-muted-foreground leading-relaxed">
                        {topic.description}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg w-fit">
                        <ClockIcon size={16} />
                        <span className="font-medium">
                          {topic.estimatedHours}h
                        </span>
                      </div>
                    </div>

                    {topic.learningObjectives.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="font-medium text-base flex items-center gap-3 text-primary">
                          <TargetIcon size={18} />
                          Learning Objectives
                        </h5>
                        <ul className="space-y-3 ml-6">
                          {topic.learningObjectives.map((objective, index) => (
                            <li
                              key={index}
                              className="text-muted-foreground leading-relaxed flex items-start gap-3"
                            >
                              <span className="text-primary mt-1 text-lg">
                                •
                              </span>
                              <span>{objective}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {topic.resources.length > 0 && (
                      <div className="space-y-4">
                        <h5 className="font-medium text-base flex items-center gap-3 text-primary">
                          <BookOpenIcon size={18} />
                          Resources
                        </h5>
                        <div className="space-y-4 ml-6">
                          {topic.resources.map((resource) => (
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
                  </div>
                ))}
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
