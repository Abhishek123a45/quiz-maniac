
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Folder } from "@/hooks/useFolders";

interface FolderBreadcrumbProps {
  currentFolder: Folder | null;
  folderPath: Folder[];
  onNavigateToFolder: (folderId: string | null) => void;
}

export const FolderBreadcrumb = ({ 
  currentFolder, 
  folderPath, 
  onNavigateToFolder 
}: FolderBreadcrumbProps) => {
  return (
    <div className="flex items-center gap-1 text-sm text-gray-600 mb-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigateToFolder(null)}
        className="h-auto p-1 text-sm"
      >
        <Home className="w-4 h-4 mr-1" />
        All Quizzes
      </Button>
      
      {folderPath.map((folder) => (
        <div key={folder.id} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigateToFolder(folder.id)}
            className="h-auto p-1 text-sm"
            style={{ color: folder.color }}
          >
            {folder.name}
          </Button>
        </div>
      ))}
      
      {currentFolder && !folderPath.some(f => f.id === currentFolder.id) && (
        <div className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1" />
          <span className="font-medium" style={{ color: currentFolder.color }}>
            {currentFolder.name}
          </span>
        </div>
      )}
    </div>
  );
};
