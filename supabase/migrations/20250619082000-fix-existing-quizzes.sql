
-- Update RLS policies for quizzes to handle legacy data
DROP POLICY IF EXISTS "Users can view their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can create their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can update their own quizzes" ON public.quizzes;
DROP POLICY IF EXISTS "Users can delete their own quizzes" ON public.quizzes;

-- Allow users to view quizzes they own OR legacy quizzes without user_id
CREATE POLICY "Users can view their own quizzes or legacy quizzes" 
  ON public.quizzes 
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND auth.uid() IS NOT NULL)
  );

-- Allow users to create quizzes (will set user_id automatically)
CREATE POLICY "Users can create their own quizzes" 
  ON public.quizzes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to update their own quizzes OR legacy quizzes
CREATE POLICY "Users can update their own quizzes or legacy quizzes" 
  ON public.quizzes 
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND auth.uid() IS NOT NULL)
  );

-- Allow users to delete their own quizzes OR legacy quizzes
CREATE POLICY "Users can delete their own quizzes or legacy quizzes" 
  ON public.quizzes 
  FOR DELETE 
  USING (
    auth.uid() = user_id OR 
    (user_id IS NULL AND auth.uid() IS NOT NULL)
  );
