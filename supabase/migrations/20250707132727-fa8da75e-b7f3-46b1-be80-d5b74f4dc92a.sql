
-- Create a table for question comments
CREATE TABLE public.question_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_id INTEGER NOT NULL,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) to ensure users can only see their own comments
ALTER TABLE public.question_comments ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT their own comments
CREATE POLICY "Users can view their own comments" 
  ON public.question_comments 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Create policy that allows users to INSERT their own comments
CREATE POLICY "Users can create their own comments" 
  ON public.question_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own comments
CREATE POLICY "Users can update their own comments" 
  ON public.question_comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own comments
CREATE POLICY "Users can delete their own comments" 
  ON public.question_comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance when querying comments by quiz and question
CREATE INDEX idx_question_comments_quiz_question ON public.question_comments(quiz_id, question_id);
