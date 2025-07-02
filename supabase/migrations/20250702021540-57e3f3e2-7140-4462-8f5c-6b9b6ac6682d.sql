
-- Add a new column to distinguish concept-based quizzes from regular quizzes
ALTER TABLE public.quizzes 
ADD COLUMN quiz_type TEXT DEFAULT 'regular' CHECK (quiz_type IN ('regular', 'concept'));

-- Add an index for better performance when filtering by quiz type
CREATE INDEX idx_quizzes_quiz_type ON public.quizzes(quiz_type);
