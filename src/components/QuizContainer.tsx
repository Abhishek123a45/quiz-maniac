
import { useState, useEffect } from "react";
import { QuizData, UserAnswer } from "@/types/quiz";
import { QuestionCard } from "./QuestionCard";
import { ResultsCard } from "./ResultsCard";
import { RacingCarProgress } from "./RacingCarProgress";
import { AnimatedScore } from "./AnimatedScore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QuizContainerProps {
  quizData: QuizData;
  quizId?: string;
}

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const QuizContainer = ({ quizData, quizId }: QuizContainerProps) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [shuffledQuizData, setShuffledQuizData] = useState<QuizData>(quizData);

  // Shuffle questions and options when quiz starts
  useEffect(() => {
    if (quizStarted && !showResults) {
      const shuffledQuestions = shuffleArray(quizData.questions).map(question => ({
        ...question,
        options: shuffleArray(question.options),
        sub_questions: question.sub_questions?.map(subQ => ({
          ...subQ,
          options: shuffleArray(subQ.options)
        }))
      }));

      setShuffledQuizData({
        ...quizData,
        questions: shuffledQuestions
      });
    }
  }, [quizStarted, quizData, showResults]);

  const handleAnswerSubmit = (selectedOption: number, subAnswers?: { subQuestionId: number; selectedOption: number; isCorrect: boolean; score: number; }[]) => {
    const currentQuestion = shuffledQuizData.questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[selectedOption].is_correct;
    
    // Calculate score with fixed values: +100 for correct, -50 for incorrect
    let score = 0;
    if (currentQuestion.options[selectedOption].score !== undefined) {
      // Use option-specific score
      score = currentQuestion.options[selectedOption].score;
    } else if (currentQuestion.correct_score !== undefined || currentQuestion.incorrect_score !== undefined) {
      // Use question-level scoring
      score = isCorrect ? (currentQuestion.correct_score || 100) : (currentQuestion.incorrect_score || -50);
    } else {
      // Fixed scoring: +100 for correct, -50 for incorrect
      score = isCorrect ? 100 : -50;
    }

    const newAnswer: UserAnswer = {
      questionId: currentQuestion.id,
      selectedOption,
      isCorrect,
      score,
      subAnswers
    };

    setUserAnswers([...userAnswers, newAnswer]);

    if (currentQuestionIndex < shuffledQuizData.questions.length - 1) {
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
  const totalQuestions = shuffledQuizData.questions.length;
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
            <p className="text-sm text-blue-600 mt-2">
              Questions and answers will be shuffled randomly
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
        quizData={shuffledQuizData}
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
        {/* Show current score with animation */}
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600">
            Current Score: <AnimatedScore score={totalScore} className="text-lg" /> points
          </span>
        </div>
      </div>

      <QuestionCard
        question={shuffledQuizData.questions[currentQuestionIndex]}
        onAnswerSubmit={handleAnswerSubmit}
        quizId={quizId}
        isLastQuestion={currentQuestionIndex === shuffledQuizData.questions.length - 1}
      />
    </div>
  );
};
