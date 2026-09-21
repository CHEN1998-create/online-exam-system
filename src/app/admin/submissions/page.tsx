"use client";

import * as React from "react";
import { Eye } from "lucide-react";

import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import {
  submissionStatusLabel,
  submissionStatusVariant,
} from "@/lib/labels";
import type { Question, SubmissionStatus } from "@/lib/types";
import { SubmissionDetailDialog } from "@/components/admin/submission-detail-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SubmissionItem {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentName: string;
  status: SubmissionStatus;
  reviewed: boolean;
  objectiveScore: number;
  score: number | null;
  totalScore: number | null;
  submittedAt: string | null;
}

export interface SubmissionDetail extends SubmissionItem {
  answers: Array<{ questionId: string; answer: string | null }>;
  questions: Question[];
}

const statusTabs: { value: "all" | SubmissionStatus; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "in_progress", label: "进行中" },
  { value: "submitted", label: "待评阅" },
  { value: "reviewed", label: "已评阅" },
  { value: "pending_review", label: "待复核" },
];

export default function AdminSubmissionsPage() {
  const [subs, setSubs] = React.useState<SubmissionItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [detail, setDetail] = React.useState<SubmissionDetail | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    api
      .get<SubmissionItem[]>("/api/admin/submissions")
      .then(setSubs)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openDetail = async (s: SubmissionItem) => {
    try {
      const d = await api.get<SubmissionDetail>(
        `/api/admin/submissions/${s.id}`
      );
      setDetail(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "加载详情失败");
    }
  };

  const review = async (s: SubmissionItem) => {
    const input = window.prompt(
      "请输入复核后的总分",
      String(s.objectiveScore ?? 0)
    );
    if (input === null) return;
    try {
      await api.post(`/api/admin/submissions/${s.id}/review`, {
        score: Number(input),
      });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "复核失败");
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        共 {subs.length} 条提交记录，可查看答案详情并进行人工复核。
      </p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            {statusTabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {statusTabs.map((t) => (
            <TabsContent key={t.value} value={t.value}>
              <SubmissionTable
                list={
                  t.value === "all"
                    ? subs
                    : subs.filter((s) => s.status === t.value)
                }
                onDetail={openDetail}
                onReview={review}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <SubmissionDetailDialog
        submission={detail}
        open={detail !== null}
        onClose={() => setDetail(null)}
      />
    </div>
  );
}

function SubmissionTable({
  list,
  onDetail,
  onReview,
}: {
  list: SubmissionItem[];
  onDetail: (s: SubmissionItem) => void;
  onReview: (s: SubmissionItem) => void;
}) {
  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>学生</TableHead>
              <TableHead>考试</TableHead>
              <TableHead>状态</TableHead>
              <TableHead className="text-right">客观分</TableHead>
              <TableHead className="text-right">总分</TableHead>
              <TableHead>提交时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.studentName}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.studentId}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {s.examTitle}
                </TableCell>
                <TableCell>
                  <Badge variant={submissionStatusVariant[s.status]}>
                    {submissionStatusLabel[s.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {s.objectiveScore}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {s.score ?? "—"}
                  {s.score !== null && (
                    <span className="text-xs font-normal text-muted-foreground">
                      {" "}
                      / {s.totalScore}
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {s.submittedAt ? formatDateTime(s.submittedAt) : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDetail(s)}
                    >
                      <Eye className="h-4 w-4" />
                      详情
                    </Button>
                    {s.status === "pending_review" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onReview(s)}
                      >
                        复核
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
