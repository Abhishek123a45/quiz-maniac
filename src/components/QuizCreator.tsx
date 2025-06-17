
import { useState } from "react";
import { QuizData } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useQuizzes } from "@/hooks/useQuizzes";

interface QuizCreatorProps {
  onQuizCreate: (quizData: QuizData) => void;
  onCancel: () => void;
}

export const QuizCreator = ({ onQuizCreate, onCancel }: QuizCreatorProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [conceptsInput, setConceptsInput] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validatedQuizData, setValidatedQuizData] = useState<QuizData | null>(null);
  
  const { saveQuiz, isSaving } = useQuizzes();

  const handleValidateQuiz = () => {
    if (!jsonInput.trim()) {
      setError("Please enter JSON data");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Clean up common JSON formatting issues
      let cleanedJson = jsonInput.trim();
      
      // Fix incomplete citations fields (citations": -> citations": "")
      cleanedJson = cleanedJson.replace(/"citations":\s*}/g, '"citations": ""}');
      cleanedJson = cleanedJson.replace(/"citations":\s*,/g, '"citations": "",');
      
      const parsedData = JSON.parse(cleanedJson);
      
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

      // Parse concepts if provided
      let concepts = null;
      if (conceptsInput.trim()) {
        try {
          const conceptsData = JSON.parse(conceptsInput.trim());
          if (conceptsData.concepts_used_in_quiz && Array.isArray(conceptsData.concepts_used_in_quiz)) {
            concepts = conceptsData.concepts_used_in_quiz;
          } else {
            throw new Error("Concepts JSON must have 'concepts_used_in_quiz' array");
          }
        } catch (conceptError) {
          throw new Error(`Invalid concepts JSON: ${conceptError instanceof Error ? conceptError.message : 'Parse error'}`);
        }
      }

      // Add concepts to quiz data if provided
      if (concepts) {
        parsedData.concepts_used_in_quiz = concepts;
      }

      setValidatedQuizData(parsedData as QuizData);
      setError("");
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError(`JSON formatting error: ${err.message}. Please check for missing commas, quotes, or incomplete fields like "citations": `);
      } else {
        setError(err instanceof Error ? err.message : "Invalid JSON format");
      }
      setValidatedQuizData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayQuiz = () => {
    if (validatedQuizData) {
      onQuizCreate(validatedQuizData);
    }
  };

  const handleSaveQuiz = () => {
    if (validatedQuizData) {
      saveQuiz(validatedQuizData);
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
            onChange={(e) => {
              setJsonInput(e.target.value);
              setValidatedQuizData(null);
              setError("");
            }}
            className="min-h-[200px] mt-2 font-mono text-sm"
          />
        </div>

        <div>
          <Label htmlFor="concepts-input" className="text-sm font-medium text-gray-700">
            Concepts JSON Data (Optional - for topic analytics)
          </Label>
          <Textarea
            id="concepts-input"
            placeholder='{"concepts_used_in_quiz": [{"id": 1, "concept": "Topic Name"}]}'
            value={conceptsInput}
            onChange={(e) => {
              setConceptsInput(e.target.value);
              setValidatedQuizData(null);
              setError("");
            }}
            className="min-h-[100px] mt-2 font-mono text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {validatedQuizData && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">✓ Quiz validated successfully!</p>
            <p className="text-green-600 text-xs mt-1">
              "{validatedQuizData.quiz_title}" with {validatedQuizData.questions.length} questions
              {validatedQuizData.concepts_used_in_quiz && (
                <span> and {validatedQuizData.concepts_used_in_quiz.length} concepts</span>
              )}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleValidateQuiz}
            disabled={isLoading || !jsonInput.trim()}
            variant="outline"
          >
            {isLoading ? "Validating..." : "Validate Quiz"}
          </Button>
          
          {validatedQuizData && (
            <>
              <Button
                onClick={handlePlayQuiz}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Play Quiz
              </Button>
              <Button
                onClick={handleSaveQuiz}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? "Saving..." : "Save Quiz"}
              </Button>
            </>
          )}
          
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isLoading || isSaving}
          >
            Cancel
          </Button>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Expected Quiz JSON Format:</h4>
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
      "citations": "",
      "concept_id": 1
    }
  ]
}`}
          </pre>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h4 className="font-medium text-blue-800 mb-2">Expected Concepts JSON Format:</h4>
          <pre className="text-xs text-blue-700 overflow-x-auto">
{`{
  "concepts_used_in_quiz": [
    {
      "id": 1,
      "concept": "Definition of Verb (Doing words & State)"
    },
    {
      "id": 2,
      "concept": "Function of Auxiliary Verbs"
    }
  ]
}`}
          </pre>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <h4 className="font-medium text-yellow-800 mb-2">Common JSON Issues:</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Make sure all "citations" fields have values: "citations": ""</li>
            <li>• Check for missing commas between objects</li>
            <li>• Ensure all quotes are properly closed</li>
            <li>• Verify all braces {"{"} and brackets ["] are matched</li>
            <li>• Add "concept_id" to questions if using topic analytics</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
