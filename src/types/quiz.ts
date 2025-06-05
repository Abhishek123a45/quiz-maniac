
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
}

export interface QuizData {
  quiz_title: string;
  description: string;
  questions: QuizQuestion[];
}

export interface UserAnswer {
  questionId: number;
  selectedOption: number;
  isCorrect: boolean;
}
