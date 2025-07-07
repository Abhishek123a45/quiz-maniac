
import { useState } from 'react';
import { MessageCircle, Edit, Trash2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useQuestionComments } from '@/hooks/useQuestionComments';
import { useAuth } from '@/hooks/useAuth';

interface QuestionCommentsDialogProps {
  quizId?: string;
  questionId: number;
  questionText: string;
}

export const QuestionCommentsDialog = ({ 
  quizId, 
  questionId, 
  questionText 
}: QuestionCommentsDialogProps) => {
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  
  const { user } = useAuth();
  const {
    comments,
    isLoading,
    addComment,
    updateComment,
    deleteComment,
    isAddingComment,
    isUpdatingComment,
    isDeletingComment,
  } = useQuestionComments(quizId, questionId);

  const handleAddComment = () => {
    if (!newComment.trim() || !quizId) return;
    
    addComment({
      quizId,
      questionId,
      commentText: newComment.trim(),
    });
    setNewComment('');
  };

  const handleEditComment = (commentId: string, currentText: string) => {
    setEditingComment(commentId);
    setEditText(currentText);
  };

  const handleUpdateComment = () => {
    if (!editText.trim() || !editingComment) return;
    
    updateComment({
      commentId: editingComment,
      commentText: editText.trim(),
    });
    setEditingComment(null);
    setEditText('');
  };

  const handleDeleteComment = (commentId: string) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteComment(commentId);
    }
  };

  if (!user) {
    return null; // Don't show comments if user is not authenticated
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <MessageCircle className="w-4 h-4" />
          Comments ({comments?.length || 0})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-left">Question Comments</DialogTitle>
          <p className="text-sm text-gray-600 text-left mt-2">
            {questionText}
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Add new comment */}
          <div className="space-y-2">
            <Textarea
              placeholder="Share your thoughts about this question..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[100px]"
            />
            <Button
              onClick={handleAddComment}
              disabled={!newComment.trim() || isAddingComment}
              className="flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isAddingComment ? 'Adding...' : 'Add Comment'}
            </Button>
          </div>

          {/* Comments list */}
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {isLoading ? (
              <p className="text-gray-500 text-center">Loading comments...</p>
            ) : comments && comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-background border rounded-lg">
                  {editingComment === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={handleUpdateComment}
                          disabled={!editText.trim() || isUpdatingComment}
                        >
                          {isUpdatingComment ? 'Saving...' : 'Save'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingComment(null);
                            setEditText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm mb-2">{comment.comment_text}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()} at{' '}
                          {new Date(comment.created_at).toLocaleTimeString()}
                        </p>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditComment(comment.id, comment.comment_text)}
                            className="h-6 w-6 p-0"
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteComment(comment.id)}
                            disabled={isDeletingComment}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center">No comments yet. Be the first to comment!</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
