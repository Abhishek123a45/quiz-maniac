
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Trash2, Play, Calendar, Folder, Search, Edit, LogIn, Move, Home, FolderOpen, Brain } from "lucide-react";
import { useQuizzes } from "@/hooks/useQuizzes";
import { useFolders, Folder as FolderType, FolderWithChildren } from "@/hooks/useFolders";
import { QuizData } from "@/types/quiz";
import { FolderCreator } from "./FolderCreator";
import { FolderBreadcrumb } from "./FolderBreadcrumb";
import { FolderTree } from "./FolderTree";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

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
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  const [editQuizTitle, setEditQuizTitle] = useState("");
  const [editQuizDescription, setEditQuizDescription] = useState("");

  const { user } = useAuth();
  const navigate = useNavigate();
  const { quizzes, isLoading: quizzesLoading, deleteQuiz, moveQuiz, updateQuiz, isDeleting, isMoving, isUpdating } = useQuizzes(currentFolderId);
  const { 
    folderTree, 
    folders = [], 
    isLoading: foldersLoading, 
    updateFolder,
    isUpdating: isFolderUpdating 
  } = useFolders();

  const handleMoveQuiz = (quizId: string, folderId: string | null) => {
    moveQuiz({ quizId, folderId });
  };

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

  const handleEditQuiz = (quiz: any) => {
    setEditingQuiz(quiz);
    setEditQuizTitle(quiz.quiz_title);
    setEditQuizDescription(quiz.description);
  };

  const handleUpdateQuiz = () => {
    if (editingQuiz && editQuizTitle.trim() && editQuizDescription.trim()) {
      updateQuiz({
        id: editingQuiz.id,
        quiz_title: editQuizTitle.trim(),
        description: editQuizDescription.trim(),
      });
      setEditingQuiz(null);
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

  const renderMoveOptions = (foldersToRender: FolderWithChildren[], quizId: string, currentQuizFolderId: string | null) => {
    return foldersToRender.map(folder => {
      if (folder.id === currentQuizFolderId) {
        return null;
      }
  
      if (folder.children && folder.children.length > 0) {
        return (
          <DropdownMenuSub key={folder.id}>
            <DropdownMenuSubTrigger>
              <Folder className="w-4 h-4 mr-2" style={{ color: folder.color }} />
              <span>{folder.name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem onClick={() => handleMoveQuiz(quizId, folder.id)}>
                <FolderOpen className="w-4 h-4 mr-2" style={{ color: folder.color }} />
                <span>Move to "{folder.name}"</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {renderMoveOptions(folder.children, quizId, currentQuizFolderId)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      } else {
        return (
          <DropdownMenuItem key={folder.id} onClick={() => handleMoveQuiz(quizId, folder.id)}>
            <Folder className="w-4 h-4 mr-2" style={{ color: folder.color }} />
            <span>{folder.name}</span>
          </DropdownMenuItem>
        );
      }
    });
  };

  const getConceptCount = (quiz: any) => {
    if (quiz.quiz_type === 'concept' && quiz.questions && quiz.questions.length > 0) {
      const firstQuestion = quiz.questions[0];
      if (firstQuestion && typeof firstQuestion === 'object' && 'concept_data' in firstQuestion) {
        const conceptData = firstQuestion.concept_data as any;
        return conceptData?.concepts?.length || 0;
      }
    }
    return 0;
  };

  if (quizzesLoading || foldersLoading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8 px-4">
        <div className="container mx-auto">
          <div className="text-center text-gray-300">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4">
      <div className="container mx-auto">
        <div className="mb-6">
          <Button onClick={onBack} variant="outline" className="mb-4 border-gray-700 text-gray-300 hover:bg-gray-800">
            ← Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-white mb-2">Saved Quizzes</h1>
          <p className="text-gray-400">Your collection of saved quizzes organized in folders</p>
          
          {!user && (
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
              <div className="flex items-center gap-2">
                <LogIn className="w-5 h-5 text-yellow-400" />
                <p className="text-yellow-300">
                  Sign in to create folders and organize your quizzes. 
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-yellow-300 underline ml-1 hover:text-yellow-200"
                    onClick={() => navigate('/auth')}
                  >
                    Sign in here
                  </Button>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Folder Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Folder className="w-5 h-5" />
                  Folders
                </CardTitle>
                {user && <FolderCreator parentId={currentFolderId} parentName={currentFolder?.name} />}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button
                    variant={currentFolderId === null ? "default" : "ghost"}
                    className={`w-full justify-start ${
                      currentFolderId === null 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "text-gray-300 hover:bg-gray-700"
                    }`}
                    onClick={() => setCurrentFolderId(null)}
                  >
                    All Quizzes
                  </Button>
                  {user && (
                    <FolderTree
                      folders={folderTree}
                      currentFolderId={currentFolderId}
                      onSelectFolder={setCurrentFolderId}
                      onEditFolder={handleEditFolder}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {user && (
              <FolderBreadcrumb
                currentFolder={currentFolder}
                folderPath={folderPath}
                onNavigateToFolder={setCurrentFolderId}
              />
            )}

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                />
              </div>
            </div>

            {!filteredQuizzes || filteredQuizzes.length === 0 ? (
              <Card className="w-full bg-gray-800 border-gray-700">
                <CardContent className="text-center py-12">
                  <p className="text-gray-300 text-lg">
                    {currentFolder ? `No quizzes in "${currentFolder.name}"` : "No quizzes found"}
                  </p>
                  <p className="text-gray-500 mt-2">
                    {searchTerm ? "Try adjusting your search terms" : "Create your first quiz to get started!"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredQuizzes.map((quiz) => (
                  <Card key={quiz.id} className="bg-gray-800 border-gray-700 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:border-blue-500/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg text-white line-clamp-2 flex-1">
                          {quiz.quiz_title}
                        </CardTitle>
                        {quiz.quiz_type === 'concept' && (
                          <Badge variant="secondary" className="ml-2 bg-purple-900/50 text-purple-300 border-purple-700">
                            <Brain className="w-3 h-3 mr-1" />
                            Concept
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center text-sm text-gray-400 mt-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(quiz.created_at).toLocaleDateString()}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                        {quiz.description}
                      </p>
                      <div className="text-sm text-gray-500 mb-4">
                        {quiz.quiz_type === 'concept' 
                          ? `${getConceptCount(quiz)} concept${getConceptCount(quiz) !== 1 ? 's' : ''}`
                          : `${quiz.questions.length} question${quiz.questions.length !== 1 ? 's' : ''}`
                        }
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handlePlayQuiz(quiz)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play
                        </Button>
                        {user && (
                          <>
                            <Button
                              onClick={() => handleEditQuiz(quiz)}
                              variant="outline"
                              size="icon"
                              disabled={isUpdating}
                              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-blue-500"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="icon" disabled={isMoving} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                                  <Move className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                                <DropdownMenuItem onClick={() => handleMoveQuiz(quiz.id, null)} disabled={quiz.folder_id === null} className="text-gray-300 hover:bg-gray-700">
                                  <Home className="w-4 h-4 mr-2" />
                                  <span>Move to All Quizzes</span>
                                </DropdownMenuItem>
                                {folderTree.length > 0 && <DropdownMenuSeparator className="bg-gray-700" />}
                                {renderMoveOptions(folderTree, quiz.id, quiz.folder_id)}
                              </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                              onClick={() => handleDeleteQuiz(quiz.id, quiz.quiz_title)}
                              variant="outline"
                              size="icon"
                              disabled={isDeleting}
                              className="border-gray-600 hover:bg-red-900/20 hover:border-red-500 text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </>
                        )}
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
          <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Folder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-300">Folder Name</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter folder name"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-300">Folder Color</label>
                <div className="flex gap-2 mt-2">
                  {colorOptions.map((colorOption) => (
                    <button
                      key={colorOption}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        editColor === colorOption ? 'border-white' : 'border-gray-600'
                      }`}
                      style={{ backgroundColor: colorOption }}
                      onClick={() => setEditColor(colorOption)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingFolder(null)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Cancel
                </Button>
                <Button onClick={handleUpdateFolder} disabled={isFolderUpdating || !editName.trim()} className="bg-blue-600 hover:bg-blue-700">
                  {isFolderUpdating ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Quiz Dialog */}
        <Dialog open={!!editingQuiz} onOpenChange={() => setEditingQuiz(null)}>
          <DialogContent className="sm:max-w-md bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Quiz</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="quiz-title" className="text-sm font-medium text-gray-300">
                  Quiz Title
                </Label>
                <Input
                  id="quiz-title"
                  value={editQuizTitle}
                  onChange={(e) => setEditQuizTitle(e.target.value)}
                  placeholder="Enter quiz title"
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <Label htmlFor="quiz-description" className="text-sm font-medium text-gray-300">
                  Quiz Description
                </Label>
                <Textarea
                  id="quiz-description"
                  value={editQuizDescription}
                  onChange={(e) => setEditQuizDescription(e.target.value)}
                  placeholder="Enter quiz description"
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingQuiz(null)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
                  Cancel
                </Button>
                <Button onClick={handleUpdateQuiz} disabled={isUpdating || !editQuizTitle.trim() || !editQuizDescription.trim()} className="bg-blue-600 hover:bg-blue-700">
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
