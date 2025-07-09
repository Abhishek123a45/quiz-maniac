-- Add max_score column to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN max_score integer NOT NULL DEFAULT 0;

-- Create function to update max score if new score is higher
CREATE OR REPLACE FUNCTION public.update_quiz_max_score(quiz_id uuid, new_score integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.quizzes 
  SET max_score = GREATEST(max_score, new_score),
      updated_at = now()
  WHERE id = quiz_id;
END;
$$;