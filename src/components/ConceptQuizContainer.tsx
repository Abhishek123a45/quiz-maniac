
import { useState } from "react";
import { ConceptData, ConceptAnswer } from "@/types/concept";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PartyPopper, ThumbsDown } from "lucide-react";

interface ConceptQuizContainerProps {
  conceptData: ConceptData;
  title: string;
  description: string;
}

export const ConceptQuizContainer = ({ conceptData, title, description }: ConceptQuizContainerProps) => {
  const [currentConceptIndex, setCurrentConceptIndex] = useState(0);
  const [currentStage, setCurrentStage] = useState<'explanation' | 'questions' | 'sub-explanations' | 'sub-questions' | 'results'>('explanation');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentSubExplanationIndex, setCurrentSubExplanationIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<ConceptAnswer[]>([]);
  const [showQuestionResult, setShowQuestionResult] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const [showSubExplanation, setShowSubExplanation] = useState(true);

  const currentConcept = conceptData.concepts[currentConceptIndex];
  const totalConcepts = conceptData.concepts.length;
  const totalQuestions = conceptData.concepts.reduce((total, concept) => 
    total + (concept.questions?.length || 0) + 
    (concept.sub_explanations?.reduce((subTotal, subExp) => subTotal + (subExp.questions?.length || 0), 0) || 0), 0
  );

  const playSound = (isCorrect: boolean) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      if (isCorrect) {
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.8, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.6);
      } else {
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(250, audioContext.currentTime + 0.15);
        oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.9, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.log('Audio context not available:', error);
    }
  };

  const handleStartQuestions = () => {
    // Check if current concept has questions
    if (currentConcept.questions && currentConcept.questions.length > 0) {
      setCurrentStage('questions');
      setCurrentQuestionIndex(0);
      setShowQuestionResult(false);
      setSelectedOption(null);
    } else {
      // Skip to sub-explanations or next concept if no questions
      if (currentConcept.sub_explanations && currentConcept.sub_explanations.length > 0) {
        setCurrentStage('sub-explanations');
        setCurrentSubExplanationIndex(0);
        setCurrentQuestionIndex(0);
        setShowQuestionResult(false);
        setSelectedOption(null);
        setShowSubExplanation(true);
      } else {
        moveToNextConcept();
      }
    }
  };

  const handleSubmitAnswer = () => {
    if (selectedOption === null) return;

    const isCorrect = currentStage === 'questions' 
      ? currentConcept.questions![currentQuestionIndex].options[selectedOption].is_correct
      : currentConcept.sub_explanations![currentSubExplanationIndex].questions![currentQuestionIndex].options[selectedOption].is_correct;

    const score = isCorrect ? 100 : -50;

    const answer: ConceptAnswer = {
      conceptIndex: currentConceptIndex,
      questionIndex: currentQuestionIndex,
      selectedOption,
      isCorrect,
      score,
      isSubExplanation: currentStage === 'sub-questions',
      subExplanationIndex: currentStage === 'sub-questions' ? currentSubExplanationIndex : undefined
    };

    setUserAnswers([...userAnswers, answer]);
    setIsCorrectAnswer(isCorrect);
    setShowQuestionResult(true);
    setShowAnimation(true);
    
    playSound(isCorrect);
    
    setTimeout(() => {
      setShowAnimation(false);
    }, 2000);
  };

  const handleNextQuestion = () => {
    if (currentStage === 'questions') {
      if (currentQuestionIndex < (currentConcept.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setShowQuestionResult(false);
      } else {
        // Move to sub-explanations or next concept
        if (currentConcept.sub_explanations && currentConcept.sub_explanations.length > 0) {
          setCurrentStage('sub-explanations');
          setCurrentSubExplanationIndex(0);
          setCurrentQuestionIndex(0);
          setSelectedOption(null);
          setShowQuestionResult(false);
          setShowSubExplanation(true);
        } else {
          moveToNextConcept();
        }
      }
    } else if (currentStage === 'sub-questions') {
      const currentSubExp = currentConcept.sub_explanations![currentSubExplanationIndex];
      if (currentSubExp.questions && currentQuestionIndex < currentSubExp.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setShowQuestionResult(false);
      } else if (currentSubExplanationIndex < currentConcept.sub_explanations!.length - 1) {
        setCurrentSubExplanationIndex(currentSubExplanationIndex + 1);
        setCurrentQuestionIndex(0);
        setSelectedOption(null);
        setShowQuestionResult(false);
        setShowSubExplanation(true);
        setCurrentStage('sub-explanations');
      } else {
        moveToNextConcept();
      }
    }
  };

  const moveToNextConcept = () => {
    if (currentConceptIndex < totalConcepts - 1) {
      setCurrentConceptIndex(currentConceptIndex + 1);
      setCurrentStage('explanation');
      setCurrentQuestionIndex(0);
      setCurrentSubExplanationIndex(0);
      setSelectedOption(null);
      setShowQuestionResult(false);
      setShowSubExplanation(true);
    } else {
      setCurrentStage('results');
    }
  };

  const handleContinueToSubQuestions = () => {
    const currentSubExp = currentConcept.sub_explanations![currentSubExplanationIndex];
    if (currentSubExp.questions && currentSubExp.questions.length > 0) {
      setCurrentStage('sub-questions');
      setCurrentQuestionIndex(0);
      setShowQuestionResult(false);
      setSelectedOption(null);
      setShowSubExplanation(false);
    } else {
      // No questions, move to next sub-explanation or concept
      if (currentSubExplanationIndex < currentConcept.sub_explanations!.length - 1) {
        setCurrentSubExplanationIndex(currentSubExplanationIndex + 1);
        setShowSubExplanation(true);
      } else {
        moveToNextConcept();
      }
    }
  };

  const restartQuiz = () => {
    setCurrentConceptIndex(0);
    setCurrentStage('explanation');
    setCurrentQuestionIndex(0);
    setCurrentSubExplanationIndex(0);
    setSelectedOption(null);
    setUserAnswers([]);
    setShowQuestionResult(false);
    setShowSubExplanation(true);
  };

  const correctAnswers = userAnswers.filter(answer => answer.isCorrect).length;
  const totalScore = userAnswers.reduce((sum, answer) => sum + answer.score, 0);
  const progressPercentage = (userAnswers.length / totalQuestions) * 100;

  if (currentStage === 'results') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-purple-900">
            Quiz Complete!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">Score</h3>
              <p className="text-2xl font-bold text-purple-600">{correctAnswers}/{userAnswers.length}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">Total Points</h3>
              <p className="text-2xl font-bold text-purple-600">{totalScore}</p>
            </Card>
            <Card className="p-4">
              <h3 className="text-lg font-semibold text-gray-800">Accuracy</h3>
              <p className="text-2xl font-bold text-purple-600">
                {userAnswers.length > 0 ? Math.round((correctAnswers / userAnswers.length) * 100) : 0}%
              </p>
            </Card>
          </div>
          <Button onClick={restartQuiz} className="bg-purple-600 hover:bg-purple-700 text-white">
            Restart Quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentStage === 'explanation') {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-purple-900">
            {currentConcept.name}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Concept {currentConceptIndex + 1} of {totalConcepts}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-purple-50 border-l-4 border-purple-500 rounded-r-lg">
            <h4 className="font-medium text-purple-900 mb-3">Concept Explanation:</h4>
            <p className="text-purple-800 leading-relaxed">{currentConcept.explanation}</p>
          </div>
          <div className="text-center">
            <Button 
              onClick={handleStartQuestions}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
            >
              {(currentConcept.questions && currentConcept.questions.length > 0) 
                ? "Start Questions on This Concept" 
                : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (currentStage === 'sub-explanations' && showSubExplanation) {
    const currentSubExp = currentConcept.sub_explanations![currentSubExplanationIndex];
    
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-xl font-bold text-purple-900">
            {currentSubExp.title}
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Sub-topic {currentSubExplanationIndex + 1} of {currentConcept.sub_explanations!.length} in {currentConcept.name}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
            <h4 className="font-medium text-blue-900 mb-3">Sub-topic Explanation:</h4>
            <p className="text-blue-800 leading-relaxed">{currentSubExp.explanation}</p>
          </div>
          <div className="text-center">
            <Button 
              onClick={handleContinueToSubQuestions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
            >
              {(currentSubExp.questions && currentSubExp.questions.length > 0) 
                ? "Continue to Questions" 
                : "Continue"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Question display logic - only show if questions exist
  const hasQuestions = currentStage === 'questions' 
    ? (currentConcept.questions && currentConcept.questions.length > 0)
    : (currentConcept.sub_explanations![currentSubExplanationIndex].questions && 
       currentConcept.sub_explanations![currentSubExplanationIndex].questions!.length > 0);

  if (!hasQuestions) {
    // Skip to next part if no questions
    setTimeout(() => handleNextQuestion(), 0);
    return null;
  }

  const currentQuestion = currentStage === 'questions' 
    ? currentConcept.questions![currentQuestionIndex]
    : currentConcept.sub_explanations![currentSubExplanationIndex].questions![currentQuestionIndex];

  return (
    <div className="w-full max-w-4xl mx-auto">
      {showAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/20 backdrop-blur-sm">
          <div className={`animate-bounce text-6xl ${isCorrectAnswer ? 'animate-pulse' : ''}`}>
            {isCorrectAnswer ? (
              <PartyPopper className="w-24 h-24 text-green-500 animate-spin" />
            ) : (
              <ThumbsDown className="w-24 h-24 text-red-500 animate-pulse" />
            )}
          </div>
        </div>
      )}

      <div className="mb-6">
        <Progress value={progressPercentage} className="w-full" />
        <div className="text-center mt-2">
          <span className="text-sm text-gray-600">
            Progress: {userAnswers.length}/{totalQuestions} questions • 
            Score: <span className="font-semibold text-purple-600">{totalScore}</span> points
          </span>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl text-gray-800 leading-relaxed">
            {currentQuestion.question_text}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {currentStage === 'questions' ? 'Main Concept' : currentConcept.sub_explanations![currentSubExplanationIndex].title} • 
            Question {currentQuestionIndex + 1}
          </p>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedOption?.toString()}
            onValueChange={(value) => setSelectedOption(parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  showQuestionResult
                    ? option.is_correct
                      ? 'bg-green-50 border-green-500'
                      : selectedOption === index
                      ? 'bg-red-50 border-red-500'
                      : 'bg-gray-50 border-gray-200'
                    : selectedOption === index
                    ? 'bg-purple-50 border-purple-500'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => !showQuestionResult && setSelectedOption(index)}
              >
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`option-${index}`}
                  disabled={showQuestionResult}
                />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="flex-1 cursor-pointer text-gray-700"
                >
                  {option.text}
                </Label>
                {showQuestionResult && option.is_correct && (
                  <span className="text-green-600 font-medium">✓ Correct</span>
                )}
                {showQuestionResult && selectedOption === index && !option.is_correct && (
                  <span className="text-red-600 font-medium">✗ Incorrect</span>
                )}
              </div>
            ))}
          </RadioGroup>

          <div className="mt-6">
            {!showQuestionResult ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
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
    </div>
  );
};
