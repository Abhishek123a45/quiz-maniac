
import { useState } from "react";
import { QuizData } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface QuizCreatorProps {
  onQuizCreate: (quizData: QuizData) => void;
  onCancel: () => void;
}

export const QuizCreator = ({ onQuizCreate, onCancel }: QuizCreatorProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateQuiz = () => {
    if (!jsonInput.trim()) {
      setError("Please enter JSON data");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const parsedData = JSON.parse(jsonInput);
      
      // Validate the structure
      if (!parsedData.quiz_title || !parsedData.description || !parsedData.questions) {
        throw new Error("Invalid quiz format. Missing required fields: quiz_title, description, or questions");
      }

      if (!Array.isArray(parsedData.questions) || parsedData.questions.length === 0) {
        throw new Error("Questions must be a non-empty array");
      }

      // Validate each question
      parsedData.questions.forEach((q: any, index: number) => {
        if (!q.id || !q.question_text || !q.options || !q.explanation) {
          throw new Error(`Question ${index + 1} is missing required fields`);
        }
        if (!Array.isArray(q.options) || q.options.length === 0) {
          throw new Error(`Question ${index + 1} must have options array`);
        }
        const hasCorrectAnswer = q.options.some((opt: any) => opt.is_correct === true);
        if (!hasCorrectAnswer) {
          throw new Error(`Question ${index + 1} must have at least one correct answer`);
        }
      });

      onQuizCreate(parsedData as QuizData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid JSON format");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-blue-900">
          Create New Quiz
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="json-input" className="text-sm font-medium text-gray-700">
            Quiz JSON Data
          </Label>
          <Textarea
            id="json-input"
            placeholder="Paste your quiz JSON data here..."
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            className="min-h-[300px] mt-2 font-mono text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleCreateQuiz}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Creating Quiz..." : "Create Quiz"}
          </Button>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Expected JSON Format:</h4>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "quiz_title": "Your Quiz Title",
  "description": "Quiz description",
  "questions": [
    {
      "id": 1,
      "question_text": "Your question?",
      "options": [
        {"text": "Option A", "is_correct": false},
        {"text": "Option B", "is_correct": true}
      ],
      "explanation": "Explanation text",
      "citations": ""
    }
  ]
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
