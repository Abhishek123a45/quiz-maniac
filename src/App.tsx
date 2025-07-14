
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet, useNavigate, useParams } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import {QuizContainer} from "./components/QuizContainer";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QuizCreator } from "@/components/QuizCreator";
import { ConceptBuilder } from "@/components/ConceptBuilder";
import { SavedQuizzes } from "@/components/SavedQuizzes";
import { ConceptQuizContainer } from "@/components/ConceptQuizContainer";
import { useEffect, useState } from "react";
import { fetchQuizData } from "./lib/api";


// Route guard for authenticated routes
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; // Optionally add a nice splash or loader

  if (!user) {
    window.location.href = "/auth";
    return null;
  }
  return <>{children}</>;
}

const queryClient = new QueryClient();

function QuizCreatorRouteWrapper() {
  const navigate = useNavigate();
  return (
    <QuizCreator
      onQuizCreate={() => {}}
      onCancel={() => navigate("/")}
      onBack={() => navigate("/")}
    />
  );
}

function ConceptBuilderRouteWrapper() {
  const navigate = useNavigate();
  return (
    <ConceptBuilder
      onConceptCreate={() => {}}
      onCancel={() => navigate("/")}
    />
  );
}

function SavedQuizzesRouteWrapper() {
  const navigate = useNavigate();
  return (
    <SavedQuizzes
      onQuizSelect={quiz => {
        if (
          quiz.questions &&
          quiz.questions[0] &&
          typeof quiz.questions[0] === 'object' &&
          quiz.questions[0] !== null &&
          'concept_data' in (quiz.questions[0] as any)
        ) {
          navigate(`/concept-quiz/${quiz.quizId}`);
        } else if (quiz.quizId) {
          navigate(`/quiz/${quiz.quizId}`);
        } else {
          alert('Quiz ID not found.');
        }
      }}
      onBack={() => navigate("/")}
    />
  );
}

// Type guard to safely extract concept_data from questions
function getConceptData(questions: any[]): any | null {
  if (
    Array.isArray(questions) &&
    questions.length > 0 &&
    typeof questions[0] === "object" &&
    questions[0] !== null &&
    "concept_data" in questions[0]
  ) {
    return (questions[0] as any).concept_data;
  }
  return null;
}

function ConceptQuizContainerRouteWrapper() {
  const { quizId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [conceptQuiz, setConceptQuiz] = useState<any>(null);

  useEffect(() => {
    if (!quizId) return;
    // Fetch the quiz by ID (reuse fetchQuizData from QuizContainer or similar)
    fetchQuizData(quizId)
      .then(data => {
        // Extract conceptData, title, description
        const conceptData = getConceptData(data.questions);
        if (!conceptData) {
          setError("Concept data not found.");
        } else {
          setConceptQuiz({
            conceptData,
            title: data.quiz_title,
            description: data.description,
            quizId: data.quizId,
          });
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load concept quiz.");
        setLoading(false);
      });
  }, [quizId]);

  if (loading) return <div>Loading...</div>;
  if (error || !conceptQuiz) return <div>{error || "Concept quiz not found."}</div>;

  return (
    <ConceptQuizContainer
      conceptData={conceptQuiz.conceptData}
      title={conceptQuiz.title}
      description={conceptQuiz.description}
      quizId={conceptQuiz.quizId}
      onBackToHome={() => window.location.href = "/"}
    />
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      <Route path="/create" element={<ProtectedRoute><QuizCreatorRouteWrapper /></ProtectedRoute>} />
      <Route path="/concept-builder" element={<ProtectedRoute><ConceptBuilderRouteWrapper /></ProtectedRoute>} />
      <Route path="/saved" element={<ProtectedRoute><SavedQuizzesRouteWrapper /></ProtectedRoute>} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/quiz/:quizId" element={<QuizContainer/>} />
      <Route path="/concept-quiz/:quizId" element={<ProtectedRoute><ConceptQuizContainerRouteWrapper /></ProtectedRoute>} />
      {/* Add more routes as needed */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
