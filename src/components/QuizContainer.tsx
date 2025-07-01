
import { useState } from "react";
import { QuizData, UserAnswer } from "@/types/quiz";
import { QuestionCard } from "./QuestionCard";
import { ResultsCard } from "./ResultsCard";
import { RacingCarProgress } from "./RacingCarProgress";
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

  const handleAnswerSubmit = (selectedOption: number, subAnswers?: { subQuestionId: number; selectedOption: number; isCorrect: boolean; score: number; }[]) => {
    const currentQuestion = quizData.questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[selectedOption].is_correct;
    
    // Calculate score based on question settings or option score
    let score = 0;
    if (currentQuestion.options[selectedOption].score !== undefined) {
      // Use option-specific score
      score = currentQuestion.options[selectedOption].score;
    } else if (currentQuestion.correct_score !== undefined || currentQuestion.incorrect_score !== undefined) {
      // Use question-level scoring
      score = isCorrect ? (currentQuestion.correct_score || 1) : (currentQuestion.incorrect_score || 0);
    } else {
      // Default scoring
      score = isCorrect ? 1 : 0;
    }

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect,
      score,
      subAnswers
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

  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  const totalScore = userAnswers.reduce((sum, answer) => {
    let answerScore = sum + answer.score;
    // Add sub-question scores if they exist
    if (answer.subAnswers) {
      answerScore += answer.subAnswers.reduce((subSum, subAnswer) => subSum + subAnswer.score, 0);
    }
    return answerScore;
  }, 0);
  const totalQuestions = quizData.questions.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

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
        score={correctAnswers}
        totalQuestions={totalQuestions}
        quizData={quizData}
        userAnswers={userAnswers}
        onRestart={restartQuiz}
        totalScore={totalScore}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-6">
        <RacingCarProgress 
          progress={progress}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />
        {/* Show current score */}
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600">
            Current Score: <span className="font-semibold text-blue-600">{totalScore}</span> points
          </span>
        </div>
      </div>

      <QuestionCard
        question={quizData.questions[currentQuestionIndex]}
        onAnswerSubmit={handleAnswerSubmit}
      />
    </div>
  );
};
