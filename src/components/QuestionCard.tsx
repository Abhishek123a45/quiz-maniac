
import { useState } from "react";
import { QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PartyPopper, ThumbsDown } from "lucide-react";

interface QuestionCardProps {
  question: QuizQuestion;
  onAnswerSubmit: (selectedOption: number) => void;
}

export const QuestionCard = ({ question, onAnswerSubmit }: QuestionCardProps) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);

  const playSound = (isCorrect: boolean) => {
    const audio = new Audio();
    if (isCorrect) {
      // Create a simple success sound using Web Audio API
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } else {
      // Create a simple error sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.2);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
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
      onAnswerSubmit(selectedOption);
      setSelectedOption(null);
      setShowExplanation(false);
      setShowAnimation(false);
    }
  };

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
          {!showExplanation ? (
            <Button
              onClick={handleSubmit}
              disabled={selectedOption === null}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
            >
              Submit Answer
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
