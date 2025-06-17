
import { QuizData, UserAnswer, ConceptPerformance } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, TrendingUp } from "lucide-react";

interface ConceptAnalyticsProps {
  quizData: QuizData;
  userAnswers: UserAnswer[];
}

export const ConceptAnalytics = ({ quizData, userAnswers }: ConceptAnalyticsProps) => {
  console.log("ConceptAnalytics - Full quizData:", JSON.stringify(quizData, null, 2));
  console.log("ConceptAnalytics - userAnswers:", JSON.stringify(userAnswers, null, 2));

  // Only show analytics if concepts are available
  if (!quizData.concepts_used_in_quiz || quizData.concepts_used_in_quiz.length === 0) {
    console.log("No concepts found, not showing analytics");
    return null;
  }

  const calculateConceptPerformance = (): ConceptPerformance[] => {
    const conceptMap = new Map<number, ConceptPerformance>();
    
    // Initialize concepts
    quizData.concepts_used_in_quiz!.forEach(concept => {
      conceptMap.set(concept.id, {
        concept,
        correct: 0,
        total: 0,
        questions: []
      });
    });

    console.log("Initialized concept map:", Array.from(conceptMap.entries()));

    // Calculate performance for each concept
    quizData.questions.forEach((question, index) => {
      console.log(`Processing Question ${index + 1}:`, {
        id: question.id,
        concept_id: question.concept_id,
        question_text: question.question_text.substring(0, 50) + "..."
      });
      
      if (question.concept_id && conceptMap.has(question.concept_id)) {
        const userAnswer = userAnswers.find(answer => answer.questionId === question.id);
        console.log(`Found user answer for question ${question.id}:`, userAnswer);
        
        if (userAnswer) {
          const conceptPerf = conceptMap.get(question.concept_id);
          if (conceptPerf) {
            conceptPerf.total++;
            conceptPerf.questions.push(index + 1);
            if (userAnswer.isCorrect) {
              conceptPerf.correct++;
            }
            console.log(`Updated concept ${question.concept_id}:`, conceptPerf);
          }
        }
      } else {
        console.log(`Question ${question.id} has no valid concept_id or concept not found in map`);
      }
    });

    const result = Array.from(conceptMap.values()).filter(perf => perf.total > 0);
    console.log("Final concept performances:", result);
    return result;
  };

  const conceptPerformances = calculateConceptPerformance();

  if (conceptPerformances.length === 0) {
    console.log("No concept performances calculated, not showing analytics");
    return null;
  }

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-gray-800">
          <TrendingUp className="w-5 h-5" />
          Performance by Topic
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {conceptPerformances.map((performance) => {
            const percentage = Math.round((performance.correct / performance.total) * 100);
            
            return (
              <div key={performance.concept.id} className="p-4 border rounded-lg bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800 mb-1">
                      {performance.concept.concept}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Questions: {performance.questions.join(', ')}
                    </p>
                  </div>
                  <div className={`text-right ${getPerformanceColor(percentage)}`}>
                    <div className="text-lg font-bold">{percentage}%</div>
                    <div className="text-sm">
                      {performance.correct}/{performance.total}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Progress 
                    value={percentage} 
                    className="h-2"
                  />
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{performance.correct} Correct</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span>{performance.total - performance.correct} Incorrect</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">Overall Topic Performance</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Strong Areas: </span>
              <span className="text-green-600">
                {conceptPerformances.filter(p => (p.correct / p.total) >= 0.8).length} topics
              </span>
            </div>
            <div>
              <span className="text-blue-700">Areas for Improvement: </span>
              <span className="text-red-600">
                {conceptPerformances.filter(p => (p.correct / p.total) < 0.6).length} topics
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
