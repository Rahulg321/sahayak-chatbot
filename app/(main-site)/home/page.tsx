import { auth } from "@/app/(auth)/auth";
import AddGradeDialog from "@/components/dialogs/AddGradeDialog";
import { getAllGradesByUser } from "@/lib/db/queries";
import { redirect } from "next/navigation";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const HomePage = async () => {
  const userSession = await auth();

  if (!userSession) {
    redirect("/login");
  }

  const allGrades = await getAllGradesByUser(userSession.user.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
              Sahayak
            </h1>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-6 leading-tight">
            Your AI Teaching Assistant
          </h2>

          {/* Description */}
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Transform your classroom with intelligent lesson planning, automated
            grading, and personalized student support. Let AI handle the routine
            so you can focus on what matters most.
          </p>

          {/* Feature Highlights */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Smart Lesson Planning
                </h3>
                <p className="text-muted-foreground text-sm">
                  AI-powered curriculum design tailored to your students' needs
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Automated Grading
                </h3>
                <p className="text-muted-foreground text-sm">
                  Save hours with intelligent assessment and feedback systems
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-6 h-6 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-foreground mb-2">
                  Personalized Support
                </h3>
                <p className="text-muted-foreground text-sm">
                  Individual learning paths and adaptive content for every
                  student
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Button
              size="lg"
              className="px-8 py-3 rounded-lg font-semibold shadow-lg"
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3 rounded-lg font-semibold"
            >
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">10K+</div>
              <div className="text-muted-foreground text-sm">Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">50K+</div>
              <div className="text-muted-foreground text-sm">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">95%</div>
              <div className="text-muted-foreground text-sm">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Existing Content */}
      <div className="block-space big-container">
        <div>
          <AddGradeDialog />
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default HomePage;
