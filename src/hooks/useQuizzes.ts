import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuizData } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface SavedQuiz {
  id: string;
  quiz_title: string;
  description: string;
  questions: QuizData['questions'];
  created_at: string;
  updated_at: string;
  folder_id: string | null;
  user_id: string | null;
}

export const useQuizzes = (folderId?: string | null) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch quizzes (optionally filtered by folder)
  const { data: quizzes, isLoading, error } = useQuery({
    queryKey: ['quizzes', folderId, user?.id],
    queryFn: async (): Promise<SavedQuiz[]> => {
      let query = supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by folder if specified
      if (folderId !== undefined) {
        query = query.eq('folder_id', folderId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching quizzes:', error);
        throw error;
      }
      
      // Parse questions from JSON if needed
      return (
        data?.map((quiz) => ({
          ...quiz,
          questions:
            typeof quiz.questions === "string"
              ? JSON.parse(quiz.questions)
              : quiz.questions,
        })) as SavedQuiz[]
      ) || [];
    },
    enabled: true,
  });

  // Save quiz mutation (updated to include user_id)
  const saveQuizMutation = useMutation({
    mutationFn: async (quizData: QuizData & { folderId?: string }) => {
      const { folderId, ...quiz } = quizData;
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          quiz_title: quiz.quiz_title,
          description: quiz.description,
          questions: JSON.stringify(quiz.questions),
          folder_id: folderId || null,
          user_id: user?.id || null,
        })
        .select()
        .single();
      if (error) throw error;
      return {
        ...data,
        questions:
          typeof data.questions === "string"
            ? JSON.parse(data.questions)
            : data.questions,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Quiz saved successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save quiz. Please try again.",
        variant: "destructive",
      });
      console.error('Error saving quiz:', error);
    },
  });

  // Move quiz to folder mutation
  const moveQuizMutation = useMutation({
    mutationFn: async ({ quizId, folderId }: { quizId: string; folderId: string | null }) => {
      const { error } = await supabase
        .from('quizzes')
        .update({ 
          folder_id: folderId,
          updated_at: new Date().toISOString()
        })
        .eq('id', quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Quiz moved successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to move quiz. Please try again.",
        variant: "destructive",
      });
      console.error('Error moving quiz:', error);
    },
  });

  // Delete quiz mutation
  const deleteQuizMutation = useMutation({
    mutationFn: async (quizId: string) => {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', quizId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Quiz deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete quiz. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting quiz:', error);
    },
  });

  return {
    quizzes,
    isLoading,
    error,
    saveQuiz: saveQuizMutation.mutate,
    moveQuiz: moveQuizMutation.mutate,
    deleteQuiz: deleteQuizMutation.mutate,
    isSaving: saveQuizMutation.isPending,
    isMoving: moveQuizMutation.isPending,
    isDeleting: deleteQuizMutation.isPending,
  };
};
