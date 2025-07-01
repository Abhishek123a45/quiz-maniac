import { QuizData, UserAnswer } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConceptAnalytics } from "./ConceptAnalytics";

interface ResultsCardProps {
  score: number;
  totalQuestions: number;
  quizData: QuizData;
  userAnswers: UserAnswer[];
  onRestart: () => void;
  totalScore: number; // Added missing totalScore prop
}

export const ResultsCard = ({ 
  score, 
  totalQuestions, 
  quizData, 
  userAnswers, 
  onRestart,
  totalScore // Added totalScore to destructuring
}: ResultsCardProps) => {
  const percentage = Math.round((score / totalQuestions) * 100);
  
  const getScoreColor = () => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = () => {
    if (percentage >= 80) return 'Excellent work!';
    if (percentage >= 60) return 'Good job!';
    return 'Keep studying!';
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-gray-800">
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="mb-6">
            <div className={`text-6xl font-bold mb-2 ${getScoreColor()}`}>
              {percentage}%
            </div>
            <p className="text-xl text-gray-600 mb-2">
              {score} out of {totalQuestions} correct
            </p>
            {/* Display total score */}
            <p className="text-lg text-blue-600 font-medium mb-2">
              Total Score: {totalScore} points
            </p>
            <p className={`text-lg font-medium ${getScoreColor()}`}>
              {getScoreMessage()}
            </p>
          </div>
          
          <Button 
            onClick={onRestart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
          >
            Take Quiz Again
          </Button>
        </CardContent>
      </Card>

      {/* Always try to render ConceptAnalytics - it will return null if no concepts data */}
      <ConceptAnalytics quizData={quizData} userAnswers={userAnswers} />

      
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-gray-800">Review Your Answers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {quizData.questions.map((question, index) => {
              const userAnswer = userAnswers.find(a => a.questionId === question.id);
              const isCorrect = userAnswer?.isCorrect || false;
              const concept = quizData.concepts_used_in_quiz?.find(c => c.id === question.concept_id);
              
              return (
                <div 
                  key={question.id}
                  className={`p-4 rounded-lg border-2 ${
                    isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-800 flex-1">
                      Question {index + 1}: {question.question_text}
                    </h4>
                    <span className={`ml-2 font-medium ${
                      isCorrect ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                  </div>
                  
                  {concept && (
                    <div className="mb-2">
                      <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        Topic: {concept.concept}
                      </span>
                    </div>
                  )}
                  
                  {userAnswer && (
                    <div className="mb-2">
                      <p className="text-sm text-gray-600">
                        Your answer: {question.options[userAnswer.selectedOption].text}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-green-600">
                          Correct answer: {question.options.find(opt => opt.is_correct)?.text}
                        </p>
                      )}
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-700">
                    <strong>Explanation:</strong> {question.explanation}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
