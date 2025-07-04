
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizCreator } from "@/components/QuizCreator";
import { SavedQuizzes } from "@/components/SavedQuizzes";
import { ConceptBuilder } from "@/components/ConceptBuilder";
import { BottomNavbar } from "@/components/BottomNavbar";
import { QuizContainer } from "@/components/QuizContainer";
import { ConceptQuizContainer } from "@/components/ConceptQuizContainer";
import { QuizData } from "@/types/quiz";
import { ConceptData } from "@/types/concept";

const Index = () => {
  const [activeTab, setActiveTab] = useState("quiz");
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [currentConcept, setCurrentConcept] = useState<{
    data: ConceptData;
    title: string;
    description: string;
  } | null>(null);
  const [view, setView] = useState<"home" | "quiz" | "concept">("home");

  const handleQuizCreate = (quizData: QuizData) => {
    setCurrentQuiz(quizData);
    setView("quiz");
  };

  const handleConceptCreate = (conceptData: ConceptData, title: string, description: string) => {
    setCurrentConcept({ data: conceptData, title, description });
    setView("concept");
  };

  const handleBackToHome = () => {
    setCurrentQuiz(null);
    setCurrentConcept(null);
    setView("home");
  };

  if (view === "quiz" && currentQuiz) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <QuizContainer quiz={currentQuiz} onBack={handleBackToHome} />
        <BottomNavbar />
      </div>
    );
  }

  if (view === "concept" && currentConcept) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ConceptQuizContainer 
          conceptData={currentConcept.data}
          title={currentConcept.title}
          description={currentConcept.description}
          onBack={handleBackToHome}
        />
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Quiz Builder
          </h1>
          <p className="text-muted-foreground text-lg">
            Create, save, and take interactive quizzes
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="quiz">Quiz Creator</TabsTrigger>
            <TabsTrigger value="saved">Saved Quizzes</TabsTrigger>
            <TabsTrigger value="concept">Concept Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="quiz" className="space-y-6">
            <QuizCreator onQuizCreate={handleQuizCreate} onCancel={() => {}} />
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <SavedQuizzes onQuizSelect={handleQuizCreate} onBack={() => {}} />
          </TabsContent>

          <TabsContent value="concept" className="space-y-6">
            <ConceptBuilder onConceptCreate={handleConceptCreate} onCancel={() => {}} />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Index;
