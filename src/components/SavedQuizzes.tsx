
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Play, Calendar } from "lucide-react";
import { useQuizzes } from "@/hooks/useQuizzes";
import { QuizData } from "@/types/quiz";

interface SavedQuizzesProps {
  onQuizSelect: (quiz: QuizData) => void;
  onBack: () => void;
}

export const SavedQuizzes = ({ onQuizSelect, onBack }: SavedQuizzesProps) => {
  const { quizzes, isLoading, deleteQuiz, isDeleting } = useQuizzes();

  const handlePlayQuiz = (quiz: any) => {
    const quizData: QuizData = {
      quiz_title: quiz.quiz_title,
      description: quiz.description,
      questions: quiz.questions,
    };
    onQuizSelect(quizData);
  };

  const handleDeleteQuiz = (quizId: string, quizTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${quizTitle}"?`)) {
      deleteQuiz(quizId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center">Loading saved quizzes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Saved Quizzes</h1>
          <p className="text-gray-600">Your collection of saved quizzes</p>
        </div>

        {!quizzes || quizzes.length === 0 ? (
          <Card className="w-full max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">No saved quizzes yet.</p>
              <p className="text-gray-400 mt-2">Create your first quiz to get started!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg text-blue-900 line-clamp-2">
                    {quiz.quiz_title}
                  </CardTitle>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(quiz.created_at).toLocaleDateString()}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {quiz.description}
                  </p>
                  <div className="text-sm text-gray-500 mb-4">
                    {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handlePlayQuiz(quiz)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </Button>
                    <Button
                      onClick={() => handleDeleteQuiz(quiz.id, quiz.quiz_title)}
                      variant="outline"
                      size="icon"
                      disabled={isDeleting}
                      className="hover:bg-red-50 hover:border-red-200"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
