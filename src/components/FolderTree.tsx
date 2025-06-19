
import { useState } from "react";
import { ChevronDown, ChevronRight, Folder, FolderOpen, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { FolderWithChildren, useFolders } from "@/hooks/useFolders";

interface FolderTreeProps {
  folders: FolderWithChildren[];
  currentFolderId: string | null;
  onSelectFolder: (folderId: string | null) => void;
  onEditFolder: (folder: FolderWithChildren) => void;
  level?: number;
}

export const FolderTree = ({ 
  folders, 
  currentFolderId, 
  onSelectFolder, 
  onEditFolder,
  level = 0 
}: FolderTreeProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const { deleteFolder } = useFolders();

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleDeleteFolder = (folder: FolderWithChildren) => {
    if (window.confirm(`Are you sure you want to delete "${folder.name}"? This will move all quizzes in this folder to the root level.`)) {
      deleteFolder(folder.id);
    }
  };

  return (
    <div className="space-y-1">
      {folders.map((folder) => {
        const isExpanded = expandedFolders.has(folder.id);
        const hasChildren = folder.children.length > 0;
        const isSelected = currentFolderId === folder.id;

        return (
          <div key={folder.id}>
            <div 
              className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer group ${
                isSelected ? 'bg-blue-50 border border-blue-200' : ''
              }`}
              style={{ paddingLeft: `${8 + level * 16}px` }}
            >
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => toggleExpanded(folder.id)}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronRight className="w-3 h-3" />
                  )}
                </Button>
              ) : (
                <div className="w-4" />
              )}
              
              <div 
                className="flex items-center gap-2 flex-1"
                onClick={() => onSelectFolder(folder.id)}
              >
                {isExpanded && hasChildren ? (
                  <FolderOpen className="w-4 h-4" style={{ color: folder.color }} />
                ) : (
                  <Folder className="w-4 h-4" style={{ color: folder.color }} />
                )}
                <span className="text-sm font-medium">{folder.name}</span>
                {folder.quizCount > 0 && (
                  <span className="text-xs text-gray-500">({folder.quizCount})</span>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditFolder(folder)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteFolder(folder)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {isExpanded && hasChildren && (
              <FolderTree
                folders={folder.children}
                currentFolderId={currentFolderId}
                onSelectFolder={onSelectFolder}
                onEditFolder={onEditFolder}
                level={level + 1}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
