import { supabase } from "@/integrations/supabase/client";
import { QuizData } from "@/types/quiz";

// Fetch a quiz by its ID from Supabase
export async function fetchQuizData(quizId: string): Promise<QuizData & { quizId: string }> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", quizId)
    .single();

  if (error || !data) {
    throw new Error("Quiz not found");
  }

  // Type assertion to include concepts_used_in_quiz as optional
  const typedData = data as typeof data & { concepts_used_in_quiz?: any };

  // Parse questions if stored as JSON string
  const questions =
    typeof typedData.questions === "string"
      ? JSON.parse(typedData.questions)
      : typedData.questions;

  return {
    quiz_title: typedData.quiz_title,
    description: typedData.description,
    questions,
    concepts_used_in_quiz: typedData.concepts_used_in_quiz ?? undefined,
    quizId: typedData.id,
  };
} 