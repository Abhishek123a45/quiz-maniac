
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { QuizData } from '@/types/quiz';
import { useToast } from '@/hooks/use-toast';

interface SavedQuiz {
  id: string;
  quiz_title: string;
  description: string;
  questions: QuizData['questions'];
  created_at: string;
  updated_at: string;
}

export const useQuizzes = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all quizzes
  const { data: quizzes, isLoading, error } = useQuery({
    queryKey: ['quizzes'],
    queryFn: async (): Promise<SavedQuiz[]> => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Save quiz mutation
  const saveQuizMutation = useMutation({
    mutationFn: async (quizData: QuizData) => {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({
          quiz_title: quizData.quiz_title,
          description: quizData.description,
          questions: quizData.questions,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
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
    deleteQuiz: deleteQuizMutation.mutate,
    isSaving: saveQuizMutation.isPending,
    isDeleting: deleteQuizMutation.isPending,
  };
};
