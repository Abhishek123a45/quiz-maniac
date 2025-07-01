
import { useState } from "react";
import { SubQuestion } from "@/types/quiz";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SubQuestionCardProps {
  subQuestion: SubQuestion;
  onAnswerSubmit: (selectedOption: number) => void;
  showExplanation: boolean;
  selectedOption: number | null;
  onOptionSelect: (option: number) => void;
}

export const SubQuestionCard = ({ 
  subQuestion, 
  onAnswerSubmit, 
  showExplanation, 
  selectedOption,
  onOptionSelect 
}: SubQuestionCardProps) => {
  const handleOptionClick = (index: number) => {
    if (!showExplanation) {
      onOptionSelect(index);
    }
  };

  return (
    <Card className="w-full mt-4 border-l-4 border-l-blue-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-700 leading-relaxed">
          {subQuestion.question_text}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedOption?.toString()}
          onValueChange={(value) => onOptionSelect(parseInt(value))}
          className="space-y-2"
        >
          {subQuestion.options.map((option, index) => (
            <div 
              key={index} 
              className={`flex items-center space-x-3 p-2 rounded-lg border transition-all cursor-pointer ${
                showExplanation
                  ? option.is_correct
                    ? 'bg-green-50 border-green-400'
                    : selectedOption === index
                    ? 'bg-red-50 border-red-400'
                    : 'bg-gray-50 border-gray-200'
                  : selectedOption === index
                  ? 'bg-blue-50 border-blue-400'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => handleOptionClick(index)}
            >
              <RadioGroupItem 
                value={index.toString()} 
                id={`sub-option-${subQuestion.id}-${index}`}
                disabled={showExplanation}
              />
              <Label 
                htmlFor={`sub-option-${subQuestion.id}-${index}`} 
                className="flex-1 cursor-pointer text-gray-600 text-sm"
              >
                {option.text}
              </Label>
              {showExplanation && option.is_correct && (
                <span className="text-green-600 font-medium text-sm">✓</span>
              )}
              {showExplanation && selectedOption === index && !option.is_correct && (
                <span className="text-red-600 font-medium text-sm">✗</span>
              )}
            </div>
          ))}
        </RadioGroup>

        {showExplanation && (
          <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
            <h5 className="font-medium text-blue-900 mb-1 text-sm">Explanation:</h5>
            <p className="text-blue-800 text-sm">{subQuestion.explanation}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
