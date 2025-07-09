-- Add attempt_count column to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN attempt_count integer NOT NULL DEFAULT 0;

-- Create function to increment attempt count
CREATE OR REPLACE FUNCTION public.increment_quiz_attempt_count(quiz_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.quizzes 
  SET attempt_count = attempt_count + 1,
      updated_at = now()
  WHERE id = quiz_id;
END;
$$;