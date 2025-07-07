
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface QuestionComment {
  id: string;
  user_id: string;
  quiz_id: string | null;
  question_id: number;
  comment_text: string;
  created_at: string;
  updated_at: string;
}

export const useQuestionComments = (quizId?: string, questionId?: number) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch comments for a specific question
  const { data: comments, isLoading } = useQuery({
    queryKey: ['question-comments', quizId, questionId],
    queryFn: async (): Promise<QuestionComment[]> => {
      if (!quizId || questionId === undefined) return [];
      
      const { data, error } = await supabase
        .from('question_comments')
        .select('*')
        .eq('quiz_id', quizId)
        .eq('question_id', questionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!quizId && questionId !== undefined,
  });

  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async ({ quizId, questionId, commentText }: { 
      quizId: string; 
      questionId: number; 
      commentText: string; 
    }) => {
      const { data, error } = await supabase
        .from('question_comments')
        .insert({
          quiz_id: quizId,
          question_id: questionId,
          comment_text: commentText,
          user_id: user?.id || '',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-comments'] });
      toast({
        title: "Success",
        description: "Comment added successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive",
      });
      console.error('Error adding comment:', error);
    },
  });

  // Update comment mutation
  const updateCommentMutation = useMutation({
    mutationFn: async ({ commentId, commentText }: { commentId: string; commentText: string }) => {
      const { data, error } = await supabase
        .from('question_comments')
        .update({ 
          comment_text: commentText,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-comments'] });
      toast({
        title: "Success",
        description: "Comment updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update comment. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating comment:', error);
    },
  });

  // Delete comment mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await supabase
        .from('question_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['question-comments'] });
      toast({
        title: "Success",
        description: "Comment deleted successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        variant: "destructive",
      });
      console.error('Error deleting comment:', error);
    },
  });

  return {
    comments,
    isLoading,
    addComment: addCommentMutation.mutate,
    updateComment: updateCommentMutation.mutate,
    deleteComment: deleteCommentMutation.mutate,
    isAddingComment: addCommentMutation.isPending,
    isUpdatingComment: updateCommentMutation.isPending,
    isDeletingComment: deleteCommentMutation.isPending,
  };
};
