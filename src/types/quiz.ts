
export interface QuizOption {
  text: string;
  is_correct: boolean;
  score?: number; // Optional score for this option
}

export interface SubQuestion {
  id: number;
  question_text: string;
  options: QuizOption[];
  explanation: string;
  citations?: string;
}

export interface QuizQuestion {
  id: number;
  question_text: string;
  options: QuizOption[];
  explanation: string;
  citations?: string;
  concept_id?: number; // Link to concept
  sub_questions?: SubQuestion[]; // Optional sub-questions
  correct_score?: number; // Points for correct answer
  incorrect_score?: number; // Points deducted for incorrect answer (can be negative)
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
  score: number; // Actual score earned for this answer
  subAnswers?: { // Optional sub-question answers
    subQuestionId: number;
    selectedOption: number;
    isCorrect: boolean;
    score: number;
  }[];
}

export interface ConceptPerformance {
  concept: QuizConcept;
  correct: number;
  total: number;
  questions: number[];
}
