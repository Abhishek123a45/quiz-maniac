import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { QuizData, UserAnswer } from "@/types/quiz";
import { QuestionCard } from "./QuestionCard";
import { ResultsCard } from "./ResultsCard";
import { RacingCarProgress } from "./RacingCarProgress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuizzes } from "@/hooks/useQuizzes";
import { supabase } from "@/integrations/supabase/client";
import { fetchQuizData } from "@/lib/api";
import { useIsMobile } from "@/hooks/use-mobile";

// Fisher-Yates shuffle algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const QuizContainer = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const [quizData, setQuizData] = useState<(QuizData & { quizId: string }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { updateMaxScore } = useQuizzes();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [shuffledQuizData, setShuffledQuizData] = useState<QuizData | null>(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!quizId) {
      setError("No quiz ID provided.");
      setLoading(false);
      return;
    }
    fetchQuizData(quizId)
      .then(data => {
        setQuizData(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load quiz.");
        setLoading(false);
      });
  }, [quizId]);

  useEffect(() => {
    if (quizStarted && !showResults && quizData) {
      const shuffledQuestions = shuffleArray(quizData.questions || []).map(question => ({
        ...question,
        options: shuffleArray(question.options),
        sub_questions: question.sub_questions?.map(subQ => ({
          ...subQ,
          options: shuffleArray(subQ.options)
        }))
      }));

      setShuffledQuizData({
        quiz_title: quizData.quiz_title,
        description: quizData.description,
        questions: shuffledQuestions,
        concepts_used_in_quiz: quizData.concepts_used_in_quiz,
      });
    }
  }, [quizStarted, quizData, showResults]);

  const handleAnswerSubmit = (selectedOption: number, subAnswers?: { subQuestionId: number; selectedOption: number; isCorrect: boolean; score: number; }[]) => {
    if (!shuffledQuizData) return;
    const currentQuestion = shuffledQuizData.questions[currentQuestionIndex];
    const isCorrect = currentQuestion.options[selectedOption].is_correct;
    
    // Calculate score with fixed values: +100 for correct, -50 for incorrect
    let score = 0;
    if (currentQuestion.options[selectedOption].score !== undefined) {
      // Use option-specific score
      score = currentQuestion.options[selectedOption].score!;
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
      // Update max score when quiz is completed
      if (quizData?.quizId) {
        updateMaxScore({ quizId: quizData.quizId, score: totalScore });
      }
      setShowResults(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setUserAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
    setShuffledQuizData(null);
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
  const totalQuestions = shuffledQuizData?.questions.length || 0;
  const progress = totalQuestions > 0 ? ((currentQuestionIndex) / totalQuestions) * 100 : 0;

  // Navigation handlers for questions
  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };
  const handleNext = () => {
    if (currentQuestionIndex < (shuffledQuizData?.questions.length || 0) - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };
  // Check if current question is answered
  const isCurrentAnswered = userAnswers.length > currentQuestionIndex;

  if (loading) return <div>Loading...</div>;
  if (error || !quizData) return <div>{error || "Quiz not found."}</div>;

  if (!quizStarted) {
    return (
      <Card className={`w-full max-w-4xl mx-auto ${isMobile ? 'px-2 py-2' : 'px-8 py-8'}`}>
        <CardHeader className="text-center">
          <CardTitle className={`text-3xl font-bold text-blue-900 ${isMobile ? 'text-2xl' : ''}`}>
            {quizData.quiz_title}
          </CardTitle>
          <CardDescription className={`text-lg mt-4 ${isMobile ? 'text-base' : ''}`}>
            {quizData.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <p className={`text-gray-600 mb-2 ${isMobile ? 'text-sm' : ''}`}>
              This quiz contains {quizData.questions.length} questions
            </p>
            <p className={`text-sm text-gray-500 ${isMobile ? 'text-xs' : ''}`}>
              Read each question carefully and select the best answer
            </p>
            <p className={`text-sm text-blue-600 mt-2 ${isMobile ? 'text-xs' : ''}`}>
              Questions and answers will be shuffled randomly
            </p>
          </div>
          <Button 
            onClick={() => setQuizStarted(true)}
            className={`bg-blue-600 hover:bg-blue-700 text-white ${isMobile ? 'px-4 py-2 text-base' : 'px-8 py-3 text-lg'}`}
          >
            Start Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (showResults && shuffledQuizData) {
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

  if (!shuffledQuizData) return <div>Loading quiz...</div>;
  const currentQuestion = shuffledQuizData.questions[currentQuestionIndex];
  return (
    <div className={`w-full max-w-4xl mx-auto ${isMobile ? 'px-2 py-2' : 'px-8 py-8'}`}>
      <div className="mb-6">
        <RacingCarProgress 
          progress={progress}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />
        {/* Show current score */}
        <div className={`text-center mt-2 ${isMobile ? 'text-sm' : ''}`}>
          <span className="text-sm text-gray-600">
            Current Score: <span className="font-semibold text-purple-600">
             {totalScore}
            </span> points
          </span>
        </div>
      </div>
      {/* Navigation Controls */}
      <div className="flex justify-between items-center mb-4">
        <Button
          onClick={handleBack}
          disabled={currentQuestionIndex === 0}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          Back
        </Button>
        <div />
        <Button
          onClick={handleNext}
          
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          {currentQuestionIndex === (shuffledQuizData.questions.length - 1) ? 'Finish' : 'Next'}
        </Button>
      </div>
      <QuestionCard
        question={currentQuestion}
        onAnswerSubmit={handleAnswerSubmit}
      />
    </div>
  );
};
