"use client";

import * as React from "react";
import { Award, CheckCircle2, Clock3, XCircle } from "lucide-react";

import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import { submissionStatusLabel, submissionStatusVariant } from "@/lib/labels";
import type { SubmissionStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface HistoryItem {
  id: string;
  examId: string;
  examTitle: string;
  status: SubmissionStatus;
  reviewed: boolean;
  score: number | null;
  totalScore: number | null;
  submittedAt: string | null;
}

export default function StudentHistoryPage() {
  const [history, setHistory] = React.useState<HistoryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .get<HistoryItem[]>("/api/student/history")
      .then(setHistory)
      .catch((e) => setError(e.message || "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  const reviewed = history.filter((h) => h.status === "reviewed");
  const averageScore = reviewed.length
    ? reviewed.reduce((s, h) => s + (h.score ?? 0), 0) / reviewed.length
    : 0;
  const passedCount = reviewed.filter(
    (h) => h.score !== null && h.totalScore && h.score / h.totalScore >= 0.6
  ).length;
  const passRate = reviewed.length
    ? Math.round((passedCount / reviewed.length) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">我的成绩</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          查看历史考试的成绩与状态，简答题以人工复核为准。
        </p>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-lg bg-muted" />
      ) : error ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard label="已考次数" value={history.length} icon={<Clock3 className="h-4 w-4 text-muted-foreground" />} />
            <StatCard label="平均分" value={averageScore.toFixed(1)} icon={<Award className="h-4 w-4 text-muted-foreground" />} />
            <StatCard label="通过率" value={`${passRate}%`} icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />} />
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">历史记录</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>考试名称</TableHead>
                    <TableHead>提交时间</TableHead>
                    <TableHead>状态</TableHead>
                    <TableHead className="text-right">成绩</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                        暂无成绩记录
                      </TableCell>
                    </TableRow>
                  ) : (
                    history.map((h) => (
                      <TableRow key={h.id}>
                        <TableCell className="font-medium">{h.examTitle}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {h.submittedAt ? formatDateTime(h.submittedAt) : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={submissionStatusVariant[h.status]}>
                            {submissionStatusLabel[h.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {h.score !== null ? (
                            <span className="inline-flex items-center gap-1.5 font-semibold">
                              {h.score}
                              <span className="text-sm font-normal text-muted-foreground">
                                / {h.totalScore}
                              </span>
                              {h.reviewed && h.totalScore && h.score / h.totalScore >= 0.6 ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : h.reviewed ? (
                                <XCircle className="h-4 w-4 text-destructive" />
                              ) : null}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">待复核</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardDescription>{label}</CardDescription>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
