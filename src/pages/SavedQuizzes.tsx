
import { useState } from "react";
import { SavedQuizzes } from "@/components/SavedQuizzes";
import { BottomNavbar } from "@/components/BottomNavbar";
import { QuizContainer } from "@/components/QuizContainer";
import { QuizData } from "@/types/quiz";
import { useNavigate } from "react-router-dom";

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
        <QuizContainer quiz={currentQuiz} onBack={handleBack} />
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
