
import { QuizData, UserAnswer, ConceptPerformance } from "@/types/quiz";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, TrendingUp, AlertCircle } from "lucide-react";

interface ConceptAnalyticsProps {
  quizData: QuizData;
  userAnswers: UserAnswer[];
}

export const ConceptAnalytics = ({ quizData, userAnswers }: ConceptAnalyticsProps) => {
  console.log("=== ConceptAnalytics Debug ===");
  console.log("Full quizData:", JSON.stringify(quizData, null, 2));
  console.log("userAnswers:", JSON.stringify(userAnswers, null, 2));
  console.log("concepts_used_in_quiz exists:", !!quizData.concepts_used_in_quiz);
  console.log("concepts_used_in_quiz length:", quizData.concepts_used_in_quiz?.length || 0);

  // Show debug info if concepts are missing
  if (!quizData.concepts_used_in_quiz || quizData.concepts_used_in_quiz.length === 0) {
    console.log("ConceptAnalytics: No concepts available - returning debug info");
    
    // Show debug information in development
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            Topic Analytics Not Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-yellow-700">
            <p>To enable topic-based analytics, provide concepts JSON when creating the quiz.</p>
            <p><strong>Debug Info:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Questions with concept_id: {quizData.questions.filter(q => q.concept_id).length}/{quizData.questions.length}</li>
              <li>Concepts provided: {quizData.concepts_used_in_quiz?.length || 0}</li>
              <li>User answers: {userAnswers.length}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  const calculateConceptPerformance = (): ConceptPerformance[] => {
    console.log("=== Calculating Concept Performance ===");
    const conceptMap = new Map<number, ConceptPerformance>();
    
    // Initialize concepts
    quizData.concepts_used_in_quiz!.forEach(concept => {
      console.log("Initializing concept:", concept);
      conceptMap.set(concept.id, {
        concept,
        correct: 0,
        total: 0,
        questions: []
      });
    });

    console.log("Initialized concept map with keys:", Array.from(conceptMap.keys()));

    // Calculate performance for each concept
    quizData.questions.forEach((question, index) => {
      console.log(`\n--- Processing Question ${index + 1} ---`);
      console.log("Question ID:", question.id);
      console.log("Concept ID:", question.concept_id);
      console.log("Question text:", question.question_text.substring(0, 50) + "...");
      
      if (!question.concept_id) {
        console.log("❌ Question has no concept_id");
        return;
      }
      
      if (!conceptMap.has(question.concept_id)) {
        console.log("❌ Concept ID not found in concept map");
        console.log("Available concept IDs:", Array.from(conceptMap.keys()));
        return;
      }
      
      const userAnswer = userAnswers.find(answer => answer.questionId === question.id);
      console.log("User answer found:", !!userAnswer, userAnswer);
      
      if (!userAnswer) {
        console.log("❌ No user answer found for this question");
        return;
      }
      
      const conceptPerf = conceptMap.get(question.concept_id)!;
      conceptPerf.total++;
      conceptPerf.questions.push(index + 1);
      
      if (userAnswer.isCorrect) {
        conceptPerf.correct++;
        console.log("✅ Answer was correct");
      } else {
        console.log("❌ Answer was incorrect");
      }
      
      console.log("Updated concept performance:", conceptPerf);
    });

    const result = Array.from(conceptMap.values()).filter(perf => perf.total > 0);
    console.log("=== Final Results ===");
    console.log("Concepts with questions:", result.length);
    result.forEach(perf => {
      console.log(`${perf.concept.concept}: ${perf.correct}/${perf.total} (${Math.round(perf.correct/perf.total*100)}%)`);
    });
    
    return result;
  };

  const conceptPerformances = calculateConceptPerformance();

  if (conceptPerformances.length === 0) {
    console.log("❌ No concept performances calculated");
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            Topic Analytics Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-red-700">
            <p>Unable to calculate topic performance. Possible issues:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Questions missing concept_id values</li>
              <li>concept_id values don't match concept definitions</li>
              <li>No user answers recorded</li>
            </ul>
            <p className="text-xs mt-2">Check the browser console for detailed debugging information.</p>
          </div>
        </CardContent>
      </Card>
    );
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
