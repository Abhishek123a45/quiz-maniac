
-- Create folders table for organizing quizzes
CREATE TABLE public.folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.folders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add folder_id to quizzes table
ALTER TABLE public.quizzes 
ADD COLUMN folder_id UUID REFERENCES public.folders(id) ON DELETE SET NULL;

-- Add user_id to quizzes table if not exists (for proper ownership)
ALTER TABLE public.quizzes 
ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Enable RLS on folders table
ALTER TABLE public.folders ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for folders
CREATE POLICY "Users can view their own folders" 
  ON public.folders 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own folders" 
  ON public.folders 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own folders" 
  ON public.folders 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own folders" 
  ON public.folders 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Update RLS policies for quizzes to include user_id
DROP POLICY IF EXISTS "Allow anonymous access to quizzes" ON public.quizzes;

CREATE POLICY "Users can view their own quizzes" 
  ON public.quizzes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quizzes" 
  ON public.quizzes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quizzes" 
  ON public.quizzes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own quizzes" 
  ON public.quizzes 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
CREATE INDEX idx_folders_parent_id ON public.folders(parent_id);
CREATE INDEX idx_quizzes_folder_id ON public.quizzes(folder_id);
CREATE INDEX idx_quizzes_user_id ON public.quizzes(user_id);
