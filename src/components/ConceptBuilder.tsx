import { useState } from "react";
import { ConceptData } from "@/types/concept";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useQuizzes } from "@/hooks/useQuizzes";

interface ConceptBuilderProps {
  onConceptCreate: (conceptData: ConceptData, title: string, description: string) => void;
  onCancel: () => void;
}

export const ConceptBuilder = ({ onConceptCreate, onCancel }: ConceptBuilderProps) => {
  const [jsonInput, setJsonInput] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validatedConceptData, setValidatedConceptData] = useState<ConceptData | null>(null);
  
  const { saveQuiz, isSaving } = useQuizzes();

  const handleValidateConcept = () => {
    if (!jsonInput.trim() || !title.trim() || !description.trim()) {
      setError("Please enter title, description, and concept JSON data");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const parsedData = JSON.parse(jsonInput.trim());
      
      // Validate the structure
      if (!parsedData.concepts || !Array.isArray(parsedData.concepts) || parsedData.concepts.length === 0) {
        throw new Error("Invalid concept format. Must have 'concepts' array with at least one concept");
      }

      // Validate each concept
      parsedData.concepts.forEach((concept: any, index: number) => {
        if (!concept.name || !concept.explanation) {
          throw new Error(`Concept ${index + 1} is missing required fields: name or explanation`);
        }
        
        // Questions are now optional, but if they exist, validate them
        if (concept.questions) {
          if (!Array.isArray(concept.questions)) {
            throw new Error(`Concept ${index + 1} questions must be an array`);
          }

          // Validate concept questions if they exist
          concept.questions.forEach((q: any, qIndex: number) => {
            if (!q.question_text || !q.options) {
              throw new Error(`Question ${qIndex + 1} in concept ${index + 1} is missing required fields`);
            }
            if (!Array.isArray(q.options) || q.options.length === 0) {
              throw new Error(`Question ${qIndex + 1} in concept ${index + 1} must have options array`);
            }
            const hasCorrectAnswer = q.options.some((opt: any) => opt.is_correct === true);
            if (!hasCorrectAnswer) {
              throw new Error(`Question ${qIndex + 1} in concept ${index + 1} must have at least one correct answer`);
            }
          });
        }

        // Validate sub-explanations if they exist
        if (concept.sub_explanations && Array.isArray(concept.sub_explanations)) {
          concept.sub_explanations.forEach((subExp: any, subIndex: number) => {
            if (!subExp.title || !subExp.explanation) {
              throw new Error(`Sub-explanation ${subIndex + 1} in concept ${index + 1} is missing required fields: title or explanation`);
            }
            
            // Questions are optional for sub-explanations too
            if (subExp.questions) {
              if (!Array.isArray(subExp.questions)) {
                throw new Error(`Sub-explanation ${subIndex + 1} in concept ${index + 1} questions must be an array`);
              }

              // Validate sub-explanation questions if they exist
              subExp.questions.forEach((q: any, qIndex: number) => {
                if (!q.question_text || !q.options) {
                  throw new Error(`Question ${qIndex + 1} in sub-explanation ${subIndex + 1} of concept ${index + 1} is missing required fields`);
                }
                const hasCorrectAnswer = q.options.some((opt: any) => opt.is_correct === true);
                if (!hasCorrectAnswer) {
                  throw new Error(`Question ${qIndex + 1} in sub-explanation ${subIndex + 1} of concept ${index + 1} must have at least one correct answer`);
                }
              });
            }
          });
        }
      });

      setValidatedConceptData(parsedData as ConceptData);
      setError("");
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError(`JSON formatting error: ${err.message}`);
      } else {
        setError(err instanceof Error ? err.message : "Invalid JSON format");
      }
      setValidatedConceptData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayConcept = () => {
    if (validatedConceptData && title && description) {
      onConceptCreate(validatedConceptData, title, description);
    }
  };

  const handleSaveConcept = () => {
    if (validatedConceptData && title && description) {
      // Convert concept data to quiz format for saving
      const quizData = {
        quiz_title: title,
        description: description,
        questions: [], // Concept quizzes don't use the regular questions format
        quiz_type: 'concept'
      };

      // Save with concept data in a special format
      const conceptQuizData = {
        ...quizData,
        questions: [{ concept_data: validatedConceptData }] // Store concept data in questions field
      };

      saveQuiz(conceptQuizData);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-green-600">
            Create Concept Builder Quiz
          </CardTitle>
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isLoading || isSaving}
          >
            ← Back to Home
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-sm font-medium text-gray-700">
            Quiz Title
          </Label>
          <Input
            id="title"
            placeholder="Enter quiz title..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setValidatedConceptData(null);
              setError("");
            }}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-sm font-medium text-gray-700">
            Quiz Description
          </Label>
          <Input
            id="description"
            placeholder="Enter quiz description..."
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              setValidatedConceptData(null);
              setError("");
            }}
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="concept-input" className="text-sm font-medium text-gray-700">
            Concept JSON Data
          </Label>
          <Textarea
            id="concept-input"
            placeholder="Paste your concept JSON data here..."
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setValidatedConceptData(null);
              setError("");
            }}
            className="min-h-[300px] mt-2 font-mono text-sm"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {validatedConceptData && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-green-600 text-sm">✓ Concept data validated successfully!</p>
            <p className="text-green-600 text-xs mt-1">
              Found {validatedConceptData.concepts.length} concept(s) with {
                validatedConceptData.concepts.reduce((total, concept) => 
                  total + (concept.questions?.length || 0) + 
                  (concept.sub_explanations?.reduce((subTotal, subExp) => subTotal + (subExp.questions?.length || 0), 0) || 0), 0
                )
              } total questions
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleValidateConcept}
            disabled={isLoading || !jsonInput.trim() || !title.trim() || !description.trim()}
            variant="outline"
          >
            {isLoading ? "Validating..." : "Validate Concept"}
          </Button>
          
          {validatedConceptData && (
            <>
              <Button
                onClick={handlePlayConcept}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                Play Concept Quiz
              </Button>
              <Button
                onClick={handleSaveConcept}
                disabled={isSaving}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isSaving ? "Saving..." : "Save Concept Quiz"}
              </Button>
            </>
          )}
        </div>

        <div className="mt-6 p-4 bg-background rounded-md">
          <h4 className="font-medium text-gray-800 mb-2">Expected Concept JSON Format:</h4>
          <pre className="text-xs text-gray-600 overflow-x-auto">
{`{
  "concepts": [
    {
      "name": "Concept Name",
      "explanation": "Detailed explanation of the concept",
      "questions": [ // Optional
        {
          "question_text": "Your question?",
          "explanation": "Explanation for this question (optional)",
          "options": [
            {"text": "Option A", "is_correct": false},
            {"text": "Option B", "is_correct": true}
          ]
        }
      ],
      "sub_explanations": [
        {
          "title": "Sub-topic Title",
          "explanation": "Sub-topic explanation",
          "questions": [ // Optional
            {
              "question_text": "Sub-topic question?",
              "explanation": "Explanation for this question (optional)",
              "options": [
                {"text": "Sub Option A", "is_correct": true}
              ]
            }
          ]
        }
      ]
    }
  ]
}`}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
};
