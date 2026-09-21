export type ExamStatus = "draft" | "published" | "closed";

export type SubmissionStatus =
  | "in_progress"
  | "submitted"
  | "reviewed"
  | "pending_review";

export type QuestionType = "single" | "multiple" | "judge" | "short";

export type Difficulty = "easy" | "medium" | "hard";

export interface Exam {
  id: string;
  title: string;
  description: string;
  category: string;
  durationMinutes: number;
  questionCount: number;
  totalScore: number;
  status: ExamStatus;
  startAt: string;
  endAt: string;
  createdAt: string;
}

export interface QuestionOption {
  key: string;
  text: string;
}

export interface Question {
  id: string;
  examId?: string;
  type: QuestionType;
  stem: string;
  options: QuestionOption[];
  answer: string | string[];
  score: number;
  category: string;
  difficulty: Difficulty;
}

export interface Submission {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  status: SubmissionStatus;
  score: number | null;
  totalScore: number;
  submittedAt: string;
  durationUsed: string;
}

export interface StudentHistoryItem {
  examId: string;
  examTitle: string;
  submittedAt: string;
  status: SubmissionStatus;
  score: number | null;
  totalScore: number;
  passed: boolean | null;
}
