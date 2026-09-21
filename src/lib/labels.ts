import type {
  Difficulty,
  ExamStatus,
  QuestionType,
  SubmissionStatus,
} from "./types";

export const examStatusLabel: Record<ExamStatus, string> = {
  draft: "草稿",
  published: "已发布",
  closed: "已关闭",
};

export const examStatusVariant: Record<
  ExamStatus,
  "secondary" | "success" | "info"
> = {
  draft: "secondary",
  published: "success",
  closed: "info",
};

export const submissionStatusLabel: Record<SubmissionStatus, string> = {
  in_progress: "进行中",
  submitted: "待评阅",
  reviewed: "已评阅",
  pending_review: "待复核",
};

export const submissionStatusVariant: Record<
  SubmissionStatus,
  "info" | "secondary" | "success" | "warning"
> = {
  in_progress: "info",
  submitted: "secondary",
  reviewed: "success",
  pending_review: "warning",
};

export const questionTypeLabel: Record<QuestionType, string> = {
  single: "单选题",
  multiple: "多选题",
  judge: "判断题",
  short: "简答题",
};

export const difficultyLabel: Record<Difficulty, string> = {
  easy: "简单",
  medium: "中等",
  hard: "困难",
};

export const difficultyVariant: Record<
  Difficulty,
  "success" | "warning" | "destructive"
> = {
  easy: "success",
  medium: "warning",
  hard: "destructive",
};
