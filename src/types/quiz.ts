
export interface QuizOption {
  text: string;
  is_correct: boolean;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  options: QuizOption[];
  explanation: string;
  citations?: string;
  concept_id?: number; // Link to concept
}

export interface QuizConcept {
  id: number;
  concept: string;
}

export interface QuizData {
  quiz_title: string;
  description: string;
  questions: QuizQuestion[];
  concepts_used_in_quiz?: QuizConcept[]; // New field for concepts
}

export interface UserAnswer {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
}

export interface ConceptPerformance {
  concept: QuizConcept;
  correct: number;
  total: number;
  questions: number[];
}
