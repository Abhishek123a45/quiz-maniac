
import { useState } from "react";
import { QuizQuestion } from "@/types/quiz";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SubQuestionCard } from "./SubQuestionCard";
import { QuestionCommentsDialog } from "./QuestionCommentsDialog";

interface QuestionCardProps {
  question: QuizQuestion;
  onAnswerSubmit: (selectedOption: number, subAnswers?: { subQuestionId: number; selectedOption: number; isCorrect: boolean; score: number; }[]) => void;
  quizId?: string;
  isLastQuestion?: boolean;
}

export const QuestionCard = ({ question, onAnswerSubmit, quizId, isLastQuestion }: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [subAnswers, setSubAnswers] = useState<{ [key: number]: { selectedOption: number; isCorrect: boolean; score: number; } }>({});
  const [answeredSubQuestions, setAnsweredSubQuestions] = useState<Set<number>>(new Set());
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleOptionClick = (index: number) => {
    if (!showExplanation) {
      setSelectedOption(index);
    }
  };

  const handleSubAnswerSubmit = (subQuestionId: number, selectedOption: number) => {
    const subQuestion = question.sub_questions?.find(sq => sq.id === subQuestionId);
    if (!subQuestion) return;

    const isCorrect = subQuestion.options[selectedOption].is_correct;
    const score = isCorrect ? 50 : -25; // Sub-questions have lower scores

    setSubAnswers(prev => ({
      ...prev,
      [subQuestionId]: { selectedOption, isCorrect, score }
    }));

    setAnsweredSubQuestions(prev => new Set(prev).add(subQuestionId));
  };

  const handleSubmit = () => {
    if (selectedOption === null) return;

    setShowExplanation(true);
    setHasSubmitted(true);
    
    // Collect sub-answers if any
    const subAnswersList = question.sub_questions?.map(subQ => ({
      subQuestionId: subQ.id,
      selectedOption: subAnswers[subQ.id]?.selectedOption || 0,
      isCorrect: subAnswers[subQ.id]?.isCorrect || false,
      score: subAnswers[subQ.id]?.score || 0,
    }));

    // Don't call onAnswerSubmit immediately - wait for user to click Next
  };

  const handleNext = () => {
    if (selectedOption === null) return;
    
    // Collect sub-answers if any
    const subAnswersList = question.sub_questions?.map(subQ => ({
      subQuestionId: subQ.id,
      selectedOption: subAnswers[subQ.id]?.selectedOption || 0,
      isCorrect: subAnswers[subQ.id]?.isCorrect || false,
      score: subAnswers[subQ.id]?.score || 0,
    }));

    onAnswerSubmit(selectedOption, subAnswersList);
  };

  const handleSubOptionSelect = (subQuestionId: number, optionIndex: number) => {
    // This is handled by SubQuestionCard
  };

  const allSubQuestionsAnswered = question.sub_questions 
    ? question.sub_questions.every(sq => answeredSubQuestions.has(sq.id))
    : true;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <CardTitle className="text-xl leading-relaxed text-foreground flex-1">
            {question.question_text}
          </CardTitle>
          <QuestionCommentsDialog
            quizId={quizId}
            questionId={question.id}
            questionText={question.question_text}
          />
        </div>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => setSelectedOption(parseInt(value))}
          className="space-y-3"
        >
          {question.options.map((option, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                showExplanation
                  ? option.is_correct
                    ? 'bg-background border-green-500'
                    : selectedOption === index
                    ? 'bg-background border-red-500'
                    : 'bg-background border-gray-200'
                  : selectedOption === index
                  ? 'bg-background border-blue-500'
                  : 'bg-background border-gray-200 hover:bg-popover'
              }`}
              onClick={() => handleOptionClick(index)}
            >
              <RadioGroupItem 
                value={index.toString()} 
                id={`option-${index}`}
                disabled={showExplanation}
              />
              <Label 
                htmlFor={`option-${index}`} 
                className="flex-1 cursor-pointer text-foreground"
              >
                {option.text}
              </Label>
              {showExplanation && option.is_correct && (
                <span className="text-green-600 font-medium">✓ Correct</span>
              )}
              {showExplanation && selectedOption === index && !option.is_correct && (
                <span className="text-red-600 font-medium">✗ Incorrect</span>
              )}
            </div>
          ))}
        </RadioGroup>

        {/* Sub-questions */}
        {question.sub_questions && question.sub_questions.map((subQuestion) => (
          <SubQuestionCard
            key={subQuestion.id}
            subQuestion={subQuestion}
            onAnswerSubmit={(selectedOption) => handleSubAnswerSubmit(subQuestion.id, selectedOption)}
            showExplanation={showExplanation}
            selectedOption={subAnswers[subQuestion.id]?.selectedOption ?? null}
            onOptionSelect={(option) => handleSubOptionSelect(subQuestion.id, option)}
          />
        ))}

        {/* Main question explanation */}
        {showExplanation && (
          <div className="mt-4 p-4 bg-background border-l-4 border-blue-400 rounded-r-lg">
            <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
            <p className="text-blue-800">{question.explanation}</p>
          </div>
        )}

        {/* Submit button or Next button */}
        <div className="mt-6">
          {!hasSubmitted ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null || !allSubQuestionsAnswered}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              Submit Answer
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
