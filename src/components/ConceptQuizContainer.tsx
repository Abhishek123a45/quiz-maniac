import { useState } from "react";
import { ConceptData, ConceptAnswer } from "@/types/concept";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { PartyPopper, ThumbsDown, ChevronLeft, ChevronRight, Home } from "lucide-react";

interface ConceptQuizContainerProps {
  conceptData: ConceptData;
  title: string;
  description: string;
  onBackToHome?: () => void;
}

export const ConceptQuizContainer = ({ conceptData, title, description, onBackToHome }: ConceptQuizContainerProps) => {
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

  // Navigation helpers
  const canNavigateBack = () => {
    if (currentStage === 'explanation' && currentConceptIndex > 0) return true;
    if (currentStage === 'questions' && currentQuestionIndex > 0) return true;
    if (currentStage === 'questions' && currentQuestionIndex === 0) return true; // Can go back to explanation
    if (currentStage === 'sub-explanations' && currentSubExplanationIndex > 0) return true;
    if (currentStage === 'sub-explanations' && currentSubExplanationIndex === 0) return true; // Can go back to questions
    if (currentStage === 'sub-questions' && currentQuestionIndex > 0) return true;
    if (currentStage === 'sub-questions' && currentQuestionIndex === 0) return true; // Can go back to sub-explanation
    return false;
  };

  const canNavigateForward = () => {
    if (currentStage === 'explanation') return true;
    if (currentStage === 'questions' && currentQuestionIndex < (currentConcept.questions?.length || 0) - 1) return true;
    if (currentStage === 'questions' && currentQuestionIndex === (currentConcept.questions?.length || 0) - 1) return true;
    if (currentStage === 'sub-explanations' && currentSubExplanationIndex < (currentConcept.sub_explanations?.length || 0) - 1) return true;
    if (currentStage === 'sub-explanations' && currentSubExplanationIndex === (currentConcept.sub_explanations?.length || 0) - 1) return true;
    if (currentStage === 'sub-questions' && currentQuestionIndex < (currentConcept.sub_explanations?.[currentSubExplanationIndex]?.questions?.length || 0) - 1) return true;
    if (currentStage === 'sub-questions' && currentQuestionIndex === (currentConcept.sub_explanations?.[currentSubExplanationIndex]?.questions?.length || 0) - 1) return true;
    return currentConceptIndex < totalConcepts - 1;
  };

  const navigateBack = () => {
    if (currentStage === 'explanation' && currentConceptIndex > 0) {
      setCurrentConceptIndex(currentConceptIndex - 1);
      // Go to the end of previous concept
      const prevConcept = conceptData.concepts[currentConceptIndex - 1];
      if (prevConcept.sub_explanations && prevConcept.sub_explanations.length > 0) {
        setCurrentStage('sub-explanations');
        setCurrentSubExplanationIndex(prevConcept.sub_explanations.length - 1);
      } else if (prevConcept.questions && prevConcept.questions.length > 0) {
        setCurrentStage('questions');
        setCurrentQuestionIndex(prevConcept.questions.length - 1);
      }
    } else if (currentStage === 'questions') {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else {
        setCurrentStage('explanation');
      }
    } else if (currentStage === 'sub-explanations') {
      if (currentSubExplanationIndex > 0) {
        setCurrentSubExplanationIndex(currentSubExplanationIndex - 1);
      } else if (currentConcept.questions && currentConcept.questions.length > 0) {
        setCurrentStage('questions');
        setCurrentQuestionIndex(currentConcept.questions.length - 1);
      } else {
        setCurrentStage('explanation');
      }
    } else if (currentStage === 'sub-questions') {
      if (currentQuestionIndex > 0) {
        setCurrentQuestionIndex(currentQuestionIndex - 1);
      } else {
        setCurrentStage('sub-explanations');
        setShowSubExplanation(true);
      }
    }
    setSelectedOption(null);
    setShowQuestionResult(false);
  };

  const navigateForward = () => {
    if (currentStage === 'explanation') {
      if (currentConcept.questions && currentConcept.questions.length > 0) {
        setCurrentStage('questions');
        setCurrentQuestionIndex(0);
      } else if (currentConcept.sub_explanations && currentConcept.sub_explanations.length > 0) {
        setCurrentStage('sub-explanations');
        setCurrentSubExplanationIndex(0);
        setShowSubExplanation(true);
      } else {
        moveToNextConcept();
      }
    } else if (currentStage === 'questions') {
      if (currentQuestionIndex < (currentConcept.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentConcept.sub_explanations && currentConcept.sub_explanations.length > 0) {
        setCurrentStage('sub-explanations');
        setCurrentSubExplanationIndex(0);
        setCurrentQuestionIndex(0);
        setShowSubExplanation(true);
      } else {
        moveToNextConcept();
      }
    } else if (currentStage === 'sub-explanations') {
      const currentSubExp = currentConcept.sub_explanations![currentSubExplanationIndex];
      if (currentSubExp.questions && currentSubExp.questions.length > 0) {
        setCurrentStage('sub-questions');
        setCurrentQuestionIndex(0);
        setShowSubExplanation(false);
      } else if (currentSubExplanationIndex < currentConcept.sub_explanations!.length - 1) {
        setCurrentSubExplanationIndex(currentSubExplanationIndex + 1);
        setShowSubExplanation(true);
      } else {
        moveToNextConcept();
      }
    } else if (currentStage === 'sub-questions') {
      const currentSubExp = currentConcept.sub_explanations![currentSubExplanationIndex];
      if (currentQuestionIndex < (currentSubExp.questions?.length || 0) - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else if (currentSubExplanationIndex < currentConcept.sub_explanations!.length - 1) {
        setCurrentSubExplanationIndex(currentSubExplanationIndex + 1);
        setCurrentQuestionIndex(0);
        setCurrentStage('sub-explanations');
        setShowSubExplanation(true);
      } else {
        moveToNextConcept();
      }
    }
    setSelectedOption(null);
    setShowQuestionResult(false);
  };

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
    if (currentConcept.questions && currentConcept.questions.length > 0) {
      setCurrentStage('questions');
      setCurrentQuestionIndex(0);
      setShowQuestionResult(false);
      setSelectedOption(null);
    } else {
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

  // Navigation Controls Component
  const NavigationControls = () => (
    <div className="flex justify-between items-center mb-4">
      <Button
        onClick={navigateBack}
        disabled={!canNavigateBack()}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <ChevronLeft className="w-4 h-4" />
        Back
      </Button>
      
      <div className="flex gap-2">
        {onBackToHome && (
          <Button
            onClick={onBackToHome}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        )}
      </div>
      
      <Button
        onClick={navigateForward}
        disabled={!canNavigateForward()}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        Next
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );

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
          <div className="flex gap-3 justify-center">
            <Button onClick={restartQuiz} className="bg-purple-600 hover:bg-purple-700 text-white">
              Restart Quiz
            </Button>
            {onBackToHome && (
              <Button onClick={onBackToHome} variant="outline">
                Back to Home
              </Button>
            )}
          </div>
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
          <NavigationControls />
          <div className="p-6 bg-background border-l-4 border-purple-500 rounded-r-lg">
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
          <NavigationControls />
          <div className="p-6 bg-background border-l-4 border-blue-500 rounded-r-lg">
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

  // Question display logic
  const hasQuestions = currentStage === 'questions' 
    ? (currentConcept.questions && currentConcept.questions.length > 0)
    : (currentConcept.sub_explanations![currentSubExplanationIndex].questions && 
       currentConcept.sub_explanations![currentSubExplanationIndex].questions!.length > 0);

  if (!hasQuestions) {
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
          <CardTitle className="text-xl text-foreground leading-relaxed">
            {currentQuestion.question_text}
          </CardTitle>
          <p className="text-sm text-gray-600">
            {currentStage === 'questions' ? 'Main Concept' : currentConcept.sub_explanations![currentSubExplanationIndex].title} • 
            Question {currentQuestionIndex + 1}
          </p>
        </CardHeader>
        <CardContent>
          <NavigationControls />
          
          <RadioGroup
            value={selectedOption?.toString()}
            onValueChange={(value) => setSelectedOption(parseInt(value))}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className={`flex items-center  space-x-3 p-3 rounded-lg border-2 transition-all cursor-pointer ${
                  showQuestionResult
                    ? option.is_correct
                      ? 'bg-background border-green-500'
                      : selectedOption === index
                      ? 'bg-background border-red-500'
                      : 'bg-background border-gray-200'
                    : selectedOption === index
                    ? 'bg-background border-purple-500'
                    : 'bg-background border-gray-200 hover:bg-popover'
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
                  className="flex-1 text-foreground cursor-pointer"
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

          {/* Question Explanation */}
          {showQuestionResult && currentQuestion.explanation && (
            <div className="mt-4 p-4 bg-background border-l-4 border-blue-400 rounded-r-lg">
              <h5 className="font-medium text-blue-900 mb-2">Explanation:</h5>
              <p className="text-blue-800 text-sm leading-relaxed">{currentQuestion.explanation}</p>
            </div>
          )}

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
