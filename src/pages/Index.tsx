
import { useState } from "react";
import { QuizContainer } from "@/components/QuizContainer";
import { QuizCreator } from "@/components/QuizCreator";
import { SavedQuizzes } from "@/components/SavedQuizzes";
import { QuizData } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const sampleQuizData: QuizData = {
  "quiz_title": "Understanding a Quadratic Equation with Complex Coefficients",
  "description": "This quiz is based on the first question (i) from Question 1 in the provided sources, focusing on a quadratic equation with complex coefficients.",
  "concepts_used_in_quiz": [
    {
      "id": 1,
      "concept": "Quadratic Equations"
    },
    {
      "id": 2,
      "concept": "Complex Numbers"
    },
    {
      "id": 3,
      "concept": "Algebraic Methods"
    },
    {
      "id": 4,
      "concept": "Factoring Techniques"
    }
  ],
  "questions": [
    {
      "id": 1,
      "question_text": "Based on the title of the exercise section and the listing of mathematical chapters in the sources, what type of equation is x² + 10ix - 21 = 0?",
      "concept_id": 1,
      "options": [
        {"text": "A) Linear Equation", "is_correct": false},
        {"text": "B) Quadratic Equation", "is_correct": true},
        {"text": "C) Cubic Equation", "is_correct": false},
        {"text": "D) Polynomial Equation", "is_correct": false}
      ],
      "explanation": "The exercise is titled 'Class 11 RD Sharma Solutions- Chapter 14 Quadratic Equations - Exercise 14.2', clearly identifying the type of equation as quadratic. The chapter listing also includes 'Complex Numbers and Quadratic Equations'.",
      "citations": ""
    },
    {
      "id": 2,
      "question_text": "The equation contains the term '10ix'. Based on the chapters listed in the sources and the use of 'i' in the provided solutions where it's noted that i² = -1, what key mathematical concept, related to 'i', is involved in this equation?",
      "concept_id": 2,
      "options": [
        {"text": "A) Real Numbers", "is_correct": false},
        {"text": "B) Complex Numbers", "is_correct": true},
        {"text": "C) Trigonometric Functions", "is_correct": false},
        {"text": "D) Linear Inequalities", "is_correct": false}
      ],
      "explanation": "The sources list a chapter titled 'Complex Numbers and Quadratic Equations' and define complex numbers as including both a real and an imaginary part, with 'i' being the imaginary unit where i² = -1. The solutions frequently use 'i' and the i² = -1 property, indicating this concept is central.",
      "citations": ""
    },
    {
      "id": 3,
      "question_text": "The solution provided for x² + 10ix - 21 = 0 shows steps that lead to the form (x + 7i)(x + 3i) = 0. What common algebraic method was used here to solve the quadratic equation?",
      "concept_id": 3,
      "options": [
        {"text": "A) Using the quadratic formula", "is_correct": false},
        {"text": "B) Completing the square", "is_correct": false},
        {"text": "C) Factoring by grouping or splitting the middle term", "is_correct": true},
        {"text": "D) Graphing the equation", "is_correct": false}
      ],
      "explanation": "The intermediate steps in the solution show the middle term (10ix) being split into '7ix + 3ix', followed by grouping terms (x² + 7ix) + (3ix - 21) to factor out common factors (x and 3i), resulting in the factored form (x + 7i)(x + 3i) = 0. This is the method of factoring by grouping after splitting the middle term.",
      "citations": ""
    },
    {
      "id": 4,
      "question_text": "In the solution for x² + 10ix - 21 = 0, the step x² + 10ix - 21 = 0 becomes x² + 7ix + 3ix - 21 = 0. Why is the term '10ix' split into '7ix + 3ix'?",
      "concept_id": 4,
      "options": [
        {"text": "A) To test possible roots of the equation.", "is_correct": false},
        {"text": "B) Because 7 and 3 are related to the roots.", "is_correct": false},
        {"text": "C) To make the coefficients simpler.", "is_correct": false},
        {"text": "D) To enable factoring the expression by grouping terms.", "is_correct": true}
      ],
      "explanation": "Splitting the middle term (10ix) into 7ix + 3ix, as shown in the steps, is done to create groups of terms (x² + 7ix and 3ix - 21) that share common factors (x and 3i, respectively). This specific split allows the expression to be factored by grouping into the form (x + 7i)(x + 3i).",
      "citations": ""
    },
    {
      "id": 5,
      "question_text": "Based *only* on the final result presented in the sources for the equation x² + 10ix - 21 = 0, what are the roots (solutions)?",
      "concept_id": 2,
      "options": [
        {"text": "A) 7i, 3i", "is_correct": false},
        {"text": "B) -7i, 3i", "is_correct": false},
        {"text": "C) 7i, -3i", "is_correct": false},
        {"text": "D) -7i, -3i", "is_correct": true}
      ],
      "explanation": "The solution explicitly states 'x = -7i, -3i' and 'Hence, the roots are -7i, -3i'.",
      "citations": ""
    },
    {
      "id": 6,
      "question_text": "The source solution derives the factored form as (x + 7i)(x + 3i) = 0. If you take one of the roots found, say x = -7i, and substitute it into the factor (x + 7i), what is the result?",
      "concept_id": 4,
      "options": [
        {"text": "A) -21", "is_correct": false},
        {"text": "B) 0", "is_correct": true},
        {"text": "C) 4i", "is_correct": false},
        {"text": "D) 10i", "is_correct": false}
      ],
      "explanation": "Substituting x = -7i (one of the roots from the solution) into the factor (x + 7i) (derived in the solution) gives (-7i + 7i) = 0.",
      "citations": ""
    }
  ]
};

export default function Index() {
  const { user, signOut, isLoading } = useAuth();
  const navigate = useNavigate();

  const [currentView, setCurrentView] = useState<'home' | 'sample' | 'create' | 'saved'>('home');
  const [customQuizData, setCustomQuizData] = useState<QuizData | null>(null);

  const handleCreateCustomQuiz = (quizData: QuizData) => {
    setCustomQuizData(quizData);
    setCurrentView('sample');
  };

  const handleSelectSavedQuiz = (quizData: QuizData) => {
    setCustomQuizData(quizData);
    setCurrentView('sample');
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setCustomQuizData(null);
  };

  if (currentView === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="container mx-auto">
          <QuizCreator 
            onQuizCreate={handleCreateCustomQuiz}
            onCancel={handleBackToHome}
          />
        </div>
      </div>
    );
  }

  if (currentView === 'saved') {
    return (
      <SavedQuizzes 
        onQuizSelect={handleSelectSavedQuiz}
        onBack={handleBackToHome}
      />
    );
  }

  if (currentView === 'sample') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="container mx-auto">
          <div className="mb-4">
            <Button
              onClick={handleBackToHome}
              variant="outline"
              className="mb-4"
            >
              ← Back to Home
            </Button>
          </div>
          <QuizContainer quizData={customQuizData || sampleQuizData} />
        </div>
      </div>
    );
  }

  return (
    <main>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="container mx-auto">
          <Card className="w-full max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center text-4xl font-bold text-red-400 mb-4">
                <span>Quizified</span>
                <img className="h-20" src="/logo.png"/>
              </CardTitle>
              <p className="text-lg text-gray-600">
                Create and take interactive quizzes with detailed explanations
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Try Sample Quiz
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Experience our quiz with a sample about quadratic equations with complex coefficients
                  </p>
                  <Button
                    onClick={() => setCurrentView('sample')}
                    className="bg-blue-600 hover:bg-blue-700 text-white w-full"
                  >
                    Start Sample Quiz
                  </Button>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Create Custom Quiz
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Input your own quiz data in JSON format and create a personalized quiz
                  </p>
                  <Button
                    onClick={() => setCurrentView('create')}
                    className="bg-green-600 hover:bg-green-700 text-white w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Quiz
                  </Button>
                </Card>

                <Card className="p-6 hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    Saved Quizzes
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Access your previously saved quizzes and play them anytime
                  </p>
                  <Button
                    onClick={() => setCurrentView('saved')}
                    className="bg-purple-600 hover:bg-purple-700 text-white w-full"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    View Saved Quizzes
                  </Button>
                </Card>
              </div>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Features:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Interactive multiple-choice questions</li>
                  <li>• Instant feedback with explanations</li>
                  <li>• Progress tracking and final results</li>
                  <li>• Custom quiz creation from JSON data</li>
                  <li>• Save and manage your quiz collection</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="flex items-center gap-2 absolute top-4 right-4">
        {!isLoading &&
          (user ? (
            <Button variant="outline" onClick={signOut}>
              Log out
            </Button>
          ) : (
            <Button variant="outline" onClick={() => navigate("/auth")}>
              Log in / Sign up
            </Button>
          ))}
      </div>
    </main>
  );
}
