
import { useState } from "react";
import { QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuestionCardProps {
  question: QuizQuestion;
  onAnswerSubmit: (selectedOption: number) => void;
}

export const QuestionCard = ({ question, onAnswerSubmit }: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSubmit = () => {
    if (selectedOption !== null) {
      setShowExplanation(true);
      setTimeout(() => {
        onAnswerSubmit(selectedOption);
        setSelectedOption(null);
        setShowExplanation(false);
      }, 3000);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 leading-relaxed">
          {question.question_text}
        </CardTitle>
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
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all ${
                showExplanation
                  ? option.is_correct
                    ? 'bg-green-50 border-green-500'
                    : selectedOption === index
                    ? 'bg-red-50 border-red-500'
                    : 'bg-gray-50 border-gray-200'
                  : selectedOption === index
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <RadioGroupItem 
                value={index.toString()} 
                id={`option-${index}`}
                disabled={showExplanation}
              />
              <Label 
                htmlFor={`option-${index}`} 
                className="flex-1 cursor-pointer text-gray-700"
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

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
            <p className="text-blue-800">{question.explanation}</p>
          </div>
        )}

        <div className="mt-6">
          <Button
            onClick={handleSubmit}
            disabled={selectedOption === null || showExplanation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
          >
            {showExplanation ? 'Moving to next question...' : 'Submit Answer'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
