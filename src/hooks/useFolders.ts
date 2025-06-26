
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface Folder {
  id: string;
  name: string;
  parent_id: string | null;
  user_id: string;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface FolderWithChildren extends Folder {
  children: FolderWithChildren[];
  quizCount: number;
}

export const useFolders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all folders
  const { data: folders, isLoading, error } = useQuery({
    queryKey: ['folders', user?.id],
    queryFn: async (): Promise<Folder[]> => {
      if (!user) {
        return [];
      }

      const { data, error } = await supabase
        .from('folders')
        .select('*')
        .eq('user_id', user.id)
        .order('name');
      if (error) {
        console.error('Error fetching folders:', error);
        throw error;
      }
      return data || [];
    },
    enabled: !!user,
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async ({ name, parentId, color }: { name: string; parentId?: string; color?: string }) => {
      if (!user) {
        throw new Error('User must be authenticated to create folders');
      }

      const { data, error } = await supabase
        .from('folders')
        .insert({
          name,
          parent_id: parentId || null,
          color: color || '#3B82F6',
          user_id: user.id,
        })
        .select()
        .single();
      if (error) {
        console.error('Error creating folder:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['quizzes'] });
      toast({
        title: "Success",
        description: "Folder created successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create folder. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating folder:', error);
    },
  });

  // Update folder mutation
  const updateFolderMutation = useMutation({
    mutationFn: async ({ id, name, color }: { id: string; name?: string; color?: string }) => {
      if (!user) {
        throw new Error('User must be authenticated to update folders');
      }

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (color !== undefined) updateData.color = color;
      updateData.updated_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('folders')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      toast({
        title: "Success",
        description: "Folder updated successfully!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update folder. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating folder:', error);
    },
  });

  // Delete folder mutation
  // This is the NEW code to paste
const deleteFolderMutation = useMutation({
  mutationFn: async (folderId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete folders');
    }

    // Step 1: Move all quizzes from this folder to the root level.
    // This is crucial to prevent orphaned data or foreign key errors.
    const { error: updateError } = await supabase
      .from('quizzes')
      .update({ folder_id: null })
      .eq('user_id', user.id)
      .eq('folder_id', folderId);

    if (updateError) {
      console.error('Error moving quizzes from deleted folder:', updateError);
      throw updateError;
    }

    // Step 2: Delete the now-empty folder.
    const { error: deleteError } = await supabase
      .from('folders')
      .delete()
      .eq('id', folderId)
      .eq('user_id', user.id);

    if (deleteError) throw deleteError;
  },
  onSuccess: () => {
    // Invalidate both folders and quizzes to reflect the changes
    queryClient.invalidateQueries({ queryKey: ['folders'] });
    queryClient.invalidateQueries({ queryKey: ['quizzes'] });
    toast({
      title: "Success",
      description: "Folder deleted and quizzes moved to root.",
    });
  },
  onError: (error) => {
    toast({
      title: "Error",
      description: "Failed to delete folder. Please try again.",
      variant: "destructive",
    });
    console.error('Error deleting folder:', error);
  },
});


  // Build folder tree structure
  const buildFolderTree = (folders: Folder[]): FolderWithChildren[] => {
    const folderMap = new Map<string, FolderWithChildren>();
    const rootFolders: FolderWithChildren[] = [];

    // Initialize all folders
    folders.forEach(folder => {
      folderMap.set(folder.id, {
        ...folder,
        children: [],
        quizCount: 0,
      });
    });

    // Build tree structure
    folders.forEach(folder => {
      const folderWithChildren = folderMap.get(folder.id)!;
      if (folder.parent_id) {
        const parent = folderMap.get(folder.parent_id);
        if (parent) {
          parent.children.push(folderWithChildren);
        }
      } else {
        rootFolders.push(folderWithChildren);
      }
    });

    return rootFolders;
  };

  const folderTree = folders ? buildFolderTree(folders) : [];

  return {
    folders,
    folderTree,
    isLoading,
    error,
    createFolder: createFolderMutation.mutate,
    updateFolder: updateFolderMutation.mutate,
    deleteFolder: deleteFolderMutation.mutate,
    isCreating: createFolderMutation.isPending,
    isUpdating: updateFolderMutation.isPending,
    isDeleting: deleteFolderMutation.isPending,
  };
};
