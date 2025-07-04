
import { useState } from "react";
import { SavedQuizzes } from "@/components/SavedQuizzes";
import { BottomNavbar } from "@/components/BottomNavbar";
import { QuizContainer } from "@/components/QuizContainer";
import { QuizData } from "@/types/quiz";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const SavedQuizzesPage = () => {
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const navigate = useNavigate();

  const handleQuizSelect = (quizData: QuizData) => {
    setCurrentQuiz(quizData);
  };

  const handleBack = () => {
    if (currentQuiz) {
      setCurrentQuiz(null);
    } else {
      navigate("/");
    }
  };

  if (currentQuiz) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <div className="container mx-auto px-4 py-4">
          <Button
            onClick={() => setCurrentQuiz(null)}
            variant="outline"
            size="sm"
            className="mb-4 flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Saved Quizzes
          </Button>
        </div>
        <QuizContainer quizData={currentQuiz} />
        <BottomNavbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <SavedQuizzes onQuizSelect={handleQuizSelect} onBack={handleBack} />
      </div>
      <BottomNavbar />
    </div>
  );
};

export default SavedQuizzesPage;
