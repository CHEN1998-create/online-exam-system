"use client";

import { formatDateTime } from "@/lib/format";
import {
  questionTypeLabel,
  submissionStatusLabel,
  submissionStatusVariant,
} from "@/lib/labels";
import type { SubmissionDetail } from "@/app/admin/submissions/page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

export function SubmissionDetailDialog({
  submission,
  open,
  onClose,
}: {
  submission: SubmissionDetail | null;
  open: boolean;
  onClose: () => void;
}) {
  const questions = submission?.questions ?? [];
  const answers = submission?.answers ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="提交详情"
      description={submission?.examTitle}
      footer={
        <Button variant="outline" onClick={onClose}>
          关闭
        </Button>
      }
    >
      {submission && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/50 p-4 text-sm">
            <Info label="学生" value={submission.studentName} />
            <Info
              label="状态"
              value={
                <Badge variant={submissionStatusVariant[submission.status]}>
                  {submissionStatusLabel[submission.status]}
                </Badge>
              }
            />
            <Info label="客观分" value={submission.objectiveScore} />
            <Info
              label="总分"
              value={
                submission.score !== null
                  ? `${submission.score} / ${submission.totalScore}`
                  : "待评阅"
              }
            />
            <Info
              label="提交时间"
              value={
                submission.submittedAt
                  ? formatDateTime(submission.submittedAt)
                  : "—"
              }
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">答题明细</p>
            {questions.length === 0 ? (
              <p className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
                该考试暂无题目明细。
              </p>
            ) : (
              <div className="space-y-2">
                {questions.map((q, idx) => {
                  const a = answers.find((x) => x.questionId === q.id);
                  const studentAnswer = a ? a.answer : null;
                  return (
                    <div key={q.id} className="rounded-lg border p-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-primary">
                          {idx + 1}.
                        </span>
                        <Badge variant="outline">
                          {questionTypeLabel[q.type]}
                        </Badge>
                        <span className="ml-auto text-sm text-muted-foreground">
                          {q.score} 分
                        </span>
                      </div>
                      <p className="mt-1.5 text-sm leading-relaxed">{q.stem}</p>

                      {q.type === "short" ? (
                        <div className="mt-2 space-y-1 text-sm">
                          <div>
                            学生答案：{studentAnswer || "未作答"}
                          </div>
                          <div className="text-muted-foreground">
                            参考答案：{q.answer}
                          </div>
                          <Badge variant="warning">待人工复核</Badge>
                        </div>
                      ) : (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                          <span>学生答案：{studentAnswer || "未作答"}</span>
                          <span className="text-muted-foreground">
                            正确答案：{q.answer}
                          </span>
                          {String(studentAnswer) === String(q.answer) ? (
                            <Badge variant="success">正确</Badge>
                          ) : (
                            <Badge variant="destructive">错误</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </Dialog>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-medium">{value}</div>
    </div>
  );
}
