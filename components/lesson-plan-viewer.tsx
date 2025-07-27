import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArtifactCloseButton } from "@/components/artifact-close-button";
import {
  ClockIcon,
  TargetIcon,
  BookOpenIcon,
  UsersIcon,
  CheckSquareIcon,
  FileIcon,
} from "lucide-react";
import type { LessonPlanData } from "@/lib/types";
import type { Suggestion } from "@/lib/db/schema";

interface LessonPlanViewerProps {
  content: string;
  lessonPlanData?: LessonPlanData;
  suggestions: Suggestion[];
  isCurrentVersion: boolean;
  currentVersionIndex: number;
  status: string;
  onSaveContent: (content: string) => void;
}

export function LessonPlanViewer({
  content,
  lessonPlanData,
  suggestions,
  isCurrentVersion,
  currentVersionIndex,
  status,
  onSaveContent,
}: LessonPlanViewerProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {lessonPlanData?.title || "Lesson Plan"}
          </h1>
          <p className="text-muted-foreground">
            {lessonPlanData?.description ||
              "Comprehensive lesson plan with activities and assessments"}
          </p>
        </div>
        <div className="flex gap-2">
          <ArtifactCloseButton />
        </div>
      </div>

      {lessonPlanData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpenIcon className="h-5 w-5" />
                  Lesson Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Subject
                    </label>
                    <p className="font-medium">{lessonPlanData.subject}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Grade
                    </label>
                    <p className="font-medium">{lessonPlanData.grade}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Duration
                    </label>
                    <p className="font-medium">
                      {lessonPlanData.duration} minutes
                    </p>
                  </div>
                  {lessonPlanData.date && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Date
                      </label>
                      <p className="font-medium">{lessonPlanData.date}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Learning Objectives */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TargetIcon className="h-5 w-5" />
                  Learning Objectives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lessonPlanData.learningObjectives.map((objective, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Prerequisites */}
            {lessonPlanData.prerequisites.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Prerequisites</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {lessonPlanData.prerequisites.map((prerequisite, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary font-medium">•</span>
                        <span>{prerequisite}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Materials */}
            <Card>
              <CardHeader>
                <CardTitle>Materials Needed</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {lessonPlanData.materials.map((material, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-primary font-medium">•</span>
                      <span>{material}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Activities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  Lesson Activities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {lessonPlanData.activities.map((activity) => (
                    <div key={activity.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {activity.description}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{activity.type}</Badge>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <ClockIcon className="h-4 w-4" />
                            {activity.estimatedTime} min
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h5 className="font-medium text-sm mb-2">
                            Instructions:
                          </h5>
                          <ol className="list-decimal list-inside space-y-1 text-sm">
                            {activity.instructions.map((instruction, index) => (
                              <li key={index}>{instruction}</li>
                            ))}
                          </ol>
                        </div>

                        <div>
                          <h5 className="font-medium text-sm mb-2">
                            Materials:
                          </h5>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {activity.materials.map((material, index) => (
                              <li key={index}>{material}</li>
                            ))}
                          </ul>
                        </div>

                        {activity.differentiationStrategies &&
                          activity.differentiationStrategies.length > 0 && (
                            <div>
                              <h5 className="font-medium text-sm mb-2">
                                Differentiation Strategies:
                              </h5>
                              <ul className="list-disc list-inside space-y-1 text-sm">
                                {activity.differentiationStrategies.map(
                                  (strategy, index) => (
                                    <li key={index}>{strategy}</li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Assessments */}
            {lessonPlanData.assessments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckSquareIcon className="h-5 w-5" />
                    Assessment Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {lessonPlanData.assessments.map((assessment, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <h4 className="font-semibold">{assessment.type}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {assessment.description}
                        </p>
                        <div>
                          <h5 className="font-medium text-sm mb-2">
                            Assessment Criteria:
                          </h5>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            {assessment.criteria.map((criterion, index) => (
                              <li key={index}>{criterion}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Differentiation Strategies */}
            {lessonPlanData.differentiationStrategies.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Differentiation Strategies</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {lessonPlanData.differentiationStrategies.map(
                      (strategy, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary font-medium">•</span>
                          <span>{strategy}</span>
                        </li>
                      )
                    )}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Closure */}
            {lessonPlanData.closure.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Lesson Closure</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {lessonPlanData.closure.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary font-medium">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Resources */}
            {lessonPlanData.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileIcon className="h-5 w-5" />
                    Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lessonPlanData.resources.map((resource) => (
                      <div key={resource.id} className="border rounded p-3">
                        <h4 className="font-medium text-sm">
                          {resource.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mb-2">
                          {resource.type}
                        </p>
                        <p className="text-xs">{resource.description}</p>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline"
                          >
                            View Resource
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {suggestions.map((suggestion, index) => (
                      <div key={index} className="p-3 border rounded">
                        <p className="text-sm">{suggestion.suggestedText}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Raw Content Fallback */}
      {!lessonPlanData && (
        <Card>
          <CardHeader>
            <CardTitle>Lesson Plan Content</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{content}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
