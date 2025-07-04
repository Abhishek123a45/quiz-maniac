
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizCreator } from "@/components/QuizCreator";
import { SavedQuizzes } from "@/components/SavedQuizzes";
import { ConceptBuilder } from "@/components/ConceptBuilder";
import { BottomNavbar } from "@/components/BottomNavbar";

const Index = () => {
  const [activeTab, setActiveTab] = useState("quiz");

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
            <QuizCreator />
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <SavedQuizzes />
          </TabsContent>

          <TabsContent value="concept" className="space-y-6">
            <ConceptBuilder />
          </TabsContent>
        </Tabs>
      </div>
      <BottomNavbar />
    </div>
  );
};

export default Index;
