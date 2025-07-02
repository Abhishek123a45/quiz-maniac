
export interface ConceptOption {
  text: string;
  is_correct: boolean;
}

export interface ConceptQuestion {
  question_text: string;
  options: ConceptOption[];
}

export interface SubExplanation {
  title: string;
  explanation: string;
  questions: ConceptQuestion[];
}

export interface Concept {
  name: string;
  explanation: string;
  questions: ConceptQuestion[];
  sub_explanations: SubExplanation[];
}

export interface ConceptData {
  concepts: Concept[];
}

export interface ConceptAnswer {
  conceptIndex: number;
  questionIndex: number;
  selectedOption: number;
  isCorrect: boolean;
  score: number;
  isSubExplanation?: boolean;
  subExplanationIndex?: number;
}
