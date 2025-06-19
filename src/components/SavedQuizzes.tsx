
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Play, Calendar, Folder, Search, Edit, Move } from "lucide-react";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useFolders, Folder as FolderType, FolderWithChildren } from "@/hooks/useFolders";
import { QuizData } from "@/types/quiz";
import { FolderCreator } from "./FolderCreator";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { FolderTree } from "./FolderTree";

interface SavedQuizzesProps {
  onQuizSelect: (quiz: QuizData) => void;
  onBack: () => void;
}

export const SavedQuizzes = ({ onQuizSelect, onBack }: SavedQuizzesProps) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingFolder, setEditingFolder] = useState<FolderWithChildren | null>(null);
  const [editName, setEditName] = useState("");
  const [editColor, setEditColor] = useState("");

  const { quizzes, isLoading: quizzesLoading, deleteQuiz, moveQuiz, isDeleting } = useQuizzes(currentFolderId);
  const { 
    folderTree, 
    folders = [], 
    isLoading: foldersLoading, 
    updateFolder,
    isUpdating 
  } = useFolders();

  const getCurrentFolder = (): FolderType | null => {
    if (!currentFolderId) return null;
    return folders.find(f => f.id === currentFolderId) || null;
  };

  const getFolderPath = (): FolderType[] => {
    const path: FolderType[] = [];
    let currentFolder = getCurrentFolder();
    
    while (currentFolder) {
      path.unshift(currentFolder);
      currentFolder = folders.find(f => f.id === currentFolder?.parent_id) || null;
    }
    
    return path;
  };

  const handlePlayQuiz = (quiz: any) => {
    const quizData: QuizData = {
      quiz_title: quiz.quiz_title,
      description: quiz.description,
      questions: quiz.questions,
    };
    onQuizSelect(quizData);
  };

  const handleDeleteQuiz = (quizId: string, quizTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${quizTitle}"?`)) {
      deleteQuiz(quizId);
    }
  };

  const handleEditFolder = (folder: FolderWithChildren) => {
    setEditingFolder(folder);
    setEditName(folder.name);
    setEditColor(folder.color);
  };

  const handleUpdateFolder = () => {
    if (editingFolder && editName.trim()) {
      updateFolder({
        id: editingFolder.id,
        name: editName.trim(),
        color: editColor,
      });
      setEditingFolder(null);
    }
  };

  const filteredQuizzes = quizzes?.filter(quiz =>
    quiz.quiz_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quiz.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const currentFolder = getCurrentFolder();
  const folderPath = getFolderPath();
  const colorOptions = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", 
    "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"
  ];

  if (quizzesLoading || foldersLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4">
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-blue-900 mb-2">Saved Quizzes</h1>
          <p className="text-gray-600">Your collection of saved quizzes organized in folders</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Folder Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Folders
                </CardTitle>
                <FolderCreator parentId={currentFolderId} parentName={currentFolder?.name} />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={currentFolderId === null ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setCurrentFolderId(null)}
                  >
                    All Quizzes
                  </Button>
                  <FolderTree
                    folders={folderTree}
                    currentFolderId={currentFolderId}
                    onSelectFolder={setCurrentFolderId}
                    onEditFolder={handleEditFolder}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <FolderBreadcrumb
              currentFolder={currentFolder}
              folderPath={folderPath}
              onNavigateToFolder={setCurrentFolderId}
            />

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {!filteredQuizzes || filteredQuizzes.length === 0 ? (
              <Card className="w-full">
                <CardContent className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    {currentFolder ? `No quizzes in "${currentFolder.name}"` : "No quizzes found"}
                  </p>
                  <p className="text-gray-400 mt-2">
                    {searchTerm ? "Try adjusting your search terms" : "Create your first quiz to get started!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg text-blue-900 line-clamp-2">
                        {quiz.quiz_title}
                      </CardTitle>
                      <div className="flex items-center text-sm text-gray-500 mt-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {quiz.description}
                      </p>
                      <div className="text-sm text-gray-500 mb-4">
                        {quiz.questions.length} question{quiz.questions.length !== 1 ? 's' : ''}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePlayQuiz(quiz)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                        <Button
                          onClick={() => handleDeleteQuiz(quiz.id, quiz.quiz_title)}
                          variant="outline"
                          size="icon"
                          disabled={isDeleting}
                          className="hover:bg-red-50 hover:border-red-200"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Folder Dialog */}
        <Dialog open={!!editingFolder} onOpenChange={() => setEditingFolder(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Folder Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter folder name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Folder Color</label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        editColor === colorOption ? 'border-gray-800' : 'border-gray-300'
                      }`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setEditColor(colorOption)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingFolder(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateFolder} disabled={isUpdating || !editName.trim()}>
                  {isUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};
