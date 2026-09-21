"use client";

import * as React from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileQuestion,
  List,
  TriangleAlert,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { questionTypeLabel } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type AnswerMap = Record<string, string>;

interface QuestionView {
  id: string;
  type: "single" | "judge" | "short";
  stem: string;
  options: { key: string; text: string }[];
  score: number;
}

interface ExamView {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  totalScore: number;
  questions: QuestionView[];
}

interface SubmitResult {
  submission: {
    id: string;
    status: string;
    reviewed: boolean;
    objectiveScore: number;
    score: number | null;
  };
  results: Array<{
    questionId: string;
    type: string;
    reviewed: boolean;
    correct: boolean | null;
    score: number | null;
    studentAnswer: string | null;
  }>;
}

function isAnswered(v: string | undefined): boolean {
  return v !== undefined && v.trim() !== "";
}

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

export function ExamPlayer({ examId }: { examId: string }) {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [submitError, setSubmitError] = React.useState("");
  const [exam, setExam] = React.useState<ExamView | null>(null);
  const [submissionId, setSubmissionId] = React.useState("");
  const [answers, setAnswers] = React.useState<AnswerMap>({});
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [timeLeft, setTimeLeft] = React.useState(0);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<SubmitResult | null>(null);
  const [navOpen, setNavOpen] = React.useState(false);

  React.useEffect(() => {
    api
      .post<{ submission: { id: string }; exam: ExamView }>(
        `/api/student/exams/${examId}/start`
      )
      .then((data) => {
        setExam(data.exam);
        setSubmissionId(data.submission.id);
        setTimeLeft(data.exam.durationMinutes * 60);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, [examId]);

  const doSubmit = React.useCallback(async () => {
    if (!submissionId) return;
    setSubmitting(true);
    setSubmitError("");
    try {
      const answerList = Object.entries(answers)
        .filter(([, v]) => isAnswered(v))
        .map(([questionId, answer]) => ({ questionId, answer }));
      const data = await api.post<SubmitResult>(
        `/api/student/submissions/${submissionId}/submit`,
        { answers: answerList }
      );
      setResult(data);
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  }, [submissionId, answers]);

  const doSubmitRef = React.useRef(doSubmit);
  doSubmitRef.current = doSubmit;

  React.useEffect(() => {
    if (loading || submitted || !exam || exam.questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          doSubmitRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, submitted, exam]);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!exam) return null;

  if (submitted) {
    return <SubmittedSummary examTitle={exam.title} result={result} />;
  }

  const questions = exam.questions;
  const current = questions[currentIndex];
  const answeredCount = questions.filter((q) =>
    isAnswered(answers[q.id])
  ).length;
  const progress = (answeredCount / questions.length) * 100;
  const timeTone =
    timeLeft < 60 ? "critical" : timeLeft < 300 ? "warning" : "normal";

  const setAnswer = (qid: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [qid]: value }));
  const goPrev = () => setCurrentIndex((i) => Math.max(0, i - 1));
  const goNext = () =>
    setCurrentIndex((i) => Math.min(questions.length - 1, i + 1));

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <header className="sticky top-0 z-30 -mx-4 mb-6 border-b bg-background/95 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold sm:text-lg">
              {exam.title}
            </h1>
            <p className="mt-0.5 text-xs text-muted-foreground">
              已答{" "}
              <span className="font-semibold text-foreground">
                {answeredCount}
              </span>{" "}
              / {questions.length} 题
            </p>
          </div>
          <CountdownBadge timeLeft={timeLeft} tone={timeTone} />
          <Button
            variant="outline"
            size="sm"
            className="lg:hidden"
            onClick={() => setNavOpen(true)}
          >
            <List className="h-4 w-4" />
            答题卡
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {current ? (
            <Card>
              <CardContent className="space-y-5 pt-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-primary">
                    {currentIndex + 1}.
                  </span>
                  <Badge variant="outline">
                    {questionTypeLabel[current.type]}
                  </Badge>
                  <Badge variant="secondary">{current.score} 分</Badge>
                </div>

                <p className="text-base leading-relaxed">{current.stem}</p>

                {current.type === "single" && (
                  <OptionList
                    options={current.options}
                    selected={answers[current.id]}
                    onSelect={(key) => setAnswer(current.id, key)}
                  />
                )}

                {current.type === "judge" && (
                  <JudgeOptions
                    selected={answers[current.id]}
                    onSelect={(key) => setAnswer(current.id, key)}
                  />
                )}

                {current.type === "short" && (
                  <Textarea
                    rows={6}
                    placeholder="请在此输入你的答案..."
                    value={answers[current.id] ?? ""}
                    onChange={(e) => setAnswer(current.id, e.target.value)}
                  />
                )}
              </CardContent>
            </Card>
          ) : null}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goPrev}
              disabled={currentIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              上一题
            </Button>
            <Button
              variant="outline"
              onClick={goNext}
              disabled={currentIndex === questions.length - 1}
            >
              下一题
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {submitError && (
            <p className="text-sm text-destructive">{submitError}</p>
          )}

          <div className="flex justify-end">
            <Button
              size="lg"
              disabled={submitting}
              onClick={() => setConfirmOpen(true)}
            >
              <CheckCircle2 className="h-4 w-4" />
              {submitting ? "提交中…" : "提交试卷"}
            </Button>
          </div>
        </div>

        {/* 答题卡（桌面端） */}
        <aside className="hidden lg:block">
          <div className="sticky top-20 rounded-xl border bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">答题卡</p>
              <span className="text-xs text-muted-foreground">
                {answeredCount}/{questions.length}
              </span>
            </div>
            <Progress value={progress} className="mb-4" />
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => (
                <QuestionNavButton
                  key={q.id}
                  index={idx}
                  answered={isAnswered(answers[q.id])}
                  active={idx === currentIndex}
                  onClick={() => setCurrentIndex(idx)}
                />
              ))}
            </div>
            <Separator className="my-4" />
            <div className="space-y-2 text-xs text-muted-foreground">
              <Legend dotClass="bg-primary" label="已作答" />
              <Legend
                dotClass="border border-input bg-background"
                label="未作答"
              />
            </div>
          </div>
        </aside>
      </div>

      {/* 移动端答题卡 */}
      {navOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setNavOpen(false)}
          />
          <div className="fixed inset-x-0 bottom-0 rounded-t-2xl border-t bg-background p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">答题卡</p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setNavOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <Progress value={progress} className="mb-4" />
            <div className="grid grid-cols-8 gap-2">
              {questions.map((q, idx) => (
                <QuestionNavButton
                  key={q.id}
                  index={idx}
                  answered={isAnswered(answers[q.id])}
                  active={idx === currentIndex}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setNavOpen(false);
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 交卷确认 */}
      {confirmOpen && (
        <ConfirmDialog
          answeredCount={answeredCount}
          totalCount={questions.length}
          onCancel={() => setConfirmOpen(false)}
          onConfirm={() => {
            setConfirmOpen(false);
            doSubmit();
          }}
        />
      )}
    </div>
  );
}

function CountdownBadge({
  timeLeft,
  tone,
}: {
  timeLeft: number;
  tone: "normal" | "warning" | "critical";
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold tabular-nums",
        tone === "normal" && "bg-muted text-foreground",
        tone === "warning" && "bg-amber-100 text-amber-700",
        tone === "critical" && "bg-red-50 text-red-600"
      )}
    >
      <Clock className={cn("h-4 w-4", tone !== "normal" && "animate-pulse")} />
      {formatTime(timeLeft)}
    </div>
  );
}

function OptionList({
  options,
  selected,
  onSelect,
}: {
  options: { key: string; text: string }[];
  selected?: string;
  onSelect: (key: string) => void;
}) {
  return (
    <div className="space-y-2.5">
      {options.map((opt) => {
        const checked = selected === opt.key;
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => onSelect(opt.key)}
            className={cn(
              "flex w-full items-center gap-3 rounded-lg border p-3.5 text-left transition-colors",
              checked
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "hover:bg-muted/50"
            )}
          >
            <span
              className={cn(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold",
                checked
                  ? "border-primary bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              {opt.key}
            </span>
            <span className="text-sm leading-relaxed">{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
}

function JudgeOptions({
  selected,
  onSelect,
}: {
  selected?: string;
  onSelect: (value: string) => void;
}) {
  const options = [
    {
      key: "T",
      label: "正确",
      icon: Check,
      checkedClass: "border-emerald-500 bg-emerald-50 text-emerald-700",
    },
    {
      key: "F",
      label: "错误",
      icon: X,
      checkedClass: "border-destructive bg-red-50 text-red-700",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map((o) => {
        const checked = selected === o.key;
        return (
          <button
            key={o.key}
            type="button"
            onClick={() => onSelect(o.key)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg border py-4 text-base font-medium transition-colors",
              checked ? o.checkedClass : "hover:bg-muted/50"
            )}
          >
            <o.icon className="h-5 w-5" />
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

function QuestionNavButton({
  index,
  answered,
  active,
  onClick,
}: {
  index: number;
  answered: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : answered
            ? "border-transparent bg-primary/15 text-primary"
            : "text-muted-foreground hover:bg-muted"
      )}
    >
      {index + 1}
    </button>
  );
}

function Legend({ dotClass, label }: { dotClass: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3 w-3 rounded", dotClass)} />
      <span>{label}</span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm text-muted-foreground">正在加载试卷…</span>
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="space-y-3">
          <div className="h-6 w-1/3 animate-pulse rounded bg-muted" />
          <div className="h-56 animate-pulse rounded-xl bg-muted" />
          <div className="flex justify-between">
            <div className="h-9 w-24 animate-pulse rounded bg-muted" />
            <div className="h-9 w-24 animate-pulse rounded bg-muted" />
          </div>
        </div>
        <div className="hidden lg:block">
          <div className="h-72 animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="mt-5 text-lg font-semibold">无法进入考试</h1>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <Button asChild className="mt-6">
        <Link href="/student/exams">返回考试列表</Link>
      </Button>
    </div>
  );
}

function ConfirmDialog({
  answeredCount,
  totalCount,
  onCancel,
  onConfirm,
}: {
  answeredCount: number;
  totalCount: number;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const unanswered = totalCount - answeredCount;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-xl border bg-background p-6 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
            <TriangleAlert className="h-5 w-5 text-amber-600" />
          </div>
          <div>
            <h3 className="font-semibold">确认提交试卷？</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              已作答 {answeredCount}/{totalCount} 题
              {unanswered > 0 && `，还有 ${unanswered} 题未作答`}
              。提交后将无法修改。
            </p>
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            继续答题
          </Button>
          <Button onClick={onConfirm}>确认提交</Button>
        </div>
      </div>
    </div>
  );
}

function SubmittedSummary({
  examTitle,
  result,
}: {
  examTitle: string;
  result: SubmitResult | null;
}) {
  const objectiveScore = result?.submission.objectiveScore ?? 0;
  const hasShort = result?.results.some((r) => r.type === "short") ?? false;

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-8 w-8 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">试卷已提交</h2>
            <p className="mt-1 text-sm text-muted-foreground">{examTitle}</p>
          </div>
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">客观题自动判分</span>
              <span className="font-semibold">{objectiveScore} 分</span>
            </div>
            {hasShort && (
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">简答题</span>
                <Badge variant="warning">待人工复核</Badge>
              </div>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild variant="outline">
              <Link href="/student/exams">返回考试列表</Link>
            </Button>
            <Button asChild>
              <Link href="/student/history">查看成绩记录</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}




