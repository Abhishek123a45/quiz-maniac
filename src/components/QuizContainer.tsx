
import { useState } from "react";
import { QuizData, UserAnswer } from "@/types/quiz";
import { QuestionCard } from "./QuestionCard";
import { ResultsCard } from "./ResultsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizContainerProps {
  quizData: QuizData;
}

export const QuizContainer = ({ quizData }: QuizContainerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  const handleAnswerSubmit = (selectedOption: number) => {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[selectedOption].is_correct;
    
    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect,
    };

    setUserAnswers([...userAnswers, newAnswer]);

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
  };

  const score = userAnswers.filter(answer => answer.isCorrect).length;
  const totalQuestions = quizData.questions.length;

  if (!quizStarted) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-900">
            {quizData.quiz_title}
          </CardTitle>
          <CardDescription className="text-lg mt-4">
            {quizData.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <p className="text-gray-600 mb-2">
              This quiz contains {totalQuestions} questions
            </p>
            <p className="text-sm text-gray-500">
              Read each question carefully and select the best answer
            </p>
          </div>
          <Button 
            onClick={() => setQuizStarted(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults) {
    return (
      <ResultsCard
        score={score}
        totalQuestions={totalQuestions}
        quizData={quizData}
        userAnswers={userAnswers}
        onRestart={restartQuiz}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span className="text-sm text-gray-500">
            Progress: {Math.round(((currentQuestionIndex) / totalQuestions) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentQuestionIndex) / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      <QuestionCard
        question={quizData.questions[currentQuestionIndex]}
        onAnswerSubmit={handleAnswerSubmit}
      />
    </div>
  );
};
