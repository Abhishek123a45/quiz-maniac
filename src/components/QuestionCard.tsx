import { useState } from "react";
import { QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PartyPopper, ThumbsDown } from "lucide-react";
import { SubQuestionCard } from "./SubQuestionCard";

interface QuestionCardProps {
  question: QuizQuestion;
  onAnswerSubmit: (selectedOption: number, subAnswers?: { subQuestionId: number; selectedOption: number; isCorrect: boolean; score: number; }[]) => void;
}

export const QuestionCard = ({ question, onAnswerSubmit }: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [subAnswers, setSubAnswers] = useState<{[key: number]: number}>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  const playSound = (isCorrect: boolean) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (isCorrect) {
        // Success sound - louder ascending notes
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
        
        gainNode.gain.setValueAtTime(0.8, audioContext.currentTime); // Increased from 0.3
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6); // Longer duration
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
      } else {
        // Error sound - louder descending low notes
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime); // Higher starting frequency
        oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.3);
        
        gainNode.gain.setValueAtTime(0.9, audioContext.currentTime); // Increased from 0.4
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5); // Longer duration
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.log('Audio context not available:', error);
    }
  };

  const handleSubmit = () => {
    if (selectedOption !== null) {
      const isCorrect = question.options[selectedOption].is_correct;
      setIsCorrectAnswer(isCorrect);
      setShowExplanation(true);
      setShowAnimation(true);
      
      // Play sound
      playSound(isCorrect);
      
      // Hide animation after 2 seconds
      setTimeout(() => {
        setShowAnimation(false);
      }, 2000);
    }
  };

  const handleNextQuestion = () => {
    if (selectedOption !== null) {
      // Calculate sub-question answers if they exist
      let processedSubAnswers;
      if (question.sub_questions && question.sub_questions.length > 0) {
        processedSubAnswers = question.sub_questions.map(subQ => {
          const selectedSubOption = subAnswers[subQ.id];
          const isCorrect = selectedSubOption !== undefined ? subQ.options[selectedSubOption].is_correct : false;
          const score = selectedSubOption !== undefined ? 
            (subQ.options[selectedSubOption].score || (isCorrect ? 1 : 0)) : 0;
          
          return {
            subQuestionId: subQ.id,
            selectedOption: selectedSubOption || 0,
            isCorrect,
            score
          };
        });
      }

      onAnswerSubmit(selectedOption, processedSubAnswers);
      setSelectedOption(null);
      setSubAnswers({});
      setShowExplanation(false);
      setShowAnimation(false);
    }
  };

  const handleOptionClick = (index: number) => {
    if (showExplanation) {
      // Play sound for clicking on options after answer is submitted
      const isCorrect = question.options[index].is_correct;
      console.log(`Playing sound for option ${index}, isCorrect: ${isCorrect}`);
      playSound(isCorrect);
    } else {
      setSelectedOption(index);
    }
  };

  const handleSubAnswerSelect = (subQuestionId: number, option: number) => {
    setSubAnswers(prev => ({
      ...prev,
      [subQuestionId]: option
    }));
  };

  const allSubQuestionsAnswered = !question.sub_questions || 
    question.sub_questions.every(subQ => subAnswers[subQ.id] !== undefined);

  return (
    <Card className="w-full relative">
      {showAnimation && (
        <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 rounded-lg">
          <div className={`animate-bounce text-6xl ${isCorrectAnswer ? 'animate-pulse' : ''}`}>
            {isCorrectAnswer ? (
              <PartyPopper className="w-16 h-16 text-green-500 animate-spin" />
            ) : (
              <ThumbsDown className="w-16 h-16 text-red-500 animate-pulse" />
            )}
          </div>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-xl text-gray-800 leading-relaxed">
          {question.question_text}
          {(question.correct_score || question.incorrect_score) && (
            <div className="text-sm text-gray-500 mt-2">
              {question.correct_score && (
                <span className="text-green-600">+{question.correct_score} pts for correct</span>
              )}
              {question.correct_score && question.incorrect_score && <span className="mx-2">•</span>}
              {question.incorrect_score && (
                <span className="text-red-600">{question.incorrect_score} pts for incorrect</span>
              )}
            </div>
          )}
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
              className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
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
              onClick={() => handleOptionClick(index)}
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
                {option.score && (
                  <span className="ml-2 text-sm text-blue-600 font-medium">
                    ({option.score > 0 ? '+' : ''}{option.score} pts)
                  </span>
                )}
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

        {/* Sub-questions section */}
        {question.sub_questions && question.sub_questions.length > 0 && (
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-800 mb-3">Sub-questions:</h4>
            {question.sub_questions.map((subQuestion) => (
              <SubQuestionCard
                key={subQuestion.id}
                subQuestion={subQuestion}
                onAnswerSubmit={() => {}}
                showExplanation={showExplanation}
                selectedOption={subAnswers[subQuestion.id] ?? null}
                onOptionSelect={(option) => handleSubAnswerSelect(subQuestion.id, option)}
              />
            ))}
          </div>
        )}

        {showExplanation && (
          <div className="mt-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <h4 className="font-medium text-blue-900 mb-2">Explanation:</h4>
            <p className="text-blue-800">{question.explanation}</p>
          </div>
        )}

        <div className="mt-6">
          {!showExplanation ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null || !allSubQuestionsAnswered}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              Submit Answer
              {question.sub_questions && question.sub_questions.length > 0 && !allSubQuestionsAnswered && (
                <span className="ml-2 text-sm">(Please answer all sub-questions)</span>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              Next Question
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
