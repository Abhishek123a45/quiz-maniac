
import { SavedQuizzes } from "@/components/SavedQuizzes";
import { BottomNavbar } from "@/components/BottomNavbar";

const SavedQuizzesPage = () => {
  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto px-4 py-8">
        <SavedQuizzes />
      </div>
      <BottomNavbar />
    </div>
  );
};

export default SavedQuizzesPage;
