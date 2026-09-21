"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  Inbox,
  Send,
  TriangleAlert,
  TrendingUp,
} from "lucide-react";

import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";
import {
  submissionStatusLabel,
  submissionStatusVariant,
} from "@/lib/labels";
import type { SubmissionStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AdminStats {
  examTotal: number;
  publishedExams: number;
  submissionTotal: number;
  pendingReview: number;
  averageScore: number;
  passRate: number;
  scoreDistribution: Array<{ label: string; count: number }>;
  recentSubmissions: Array<{
    id: string;
    studentName: string;
    examTitle: string;
    status: SubmissionStatus;
    score: number | null;
    submittedAt: string | null;
  }>;
}

export default function AdminHomePage() {
  const [stats, setStats] = React.useState<AdminStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .get<AdminStats>("/api/admin/stats")
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-lg bg-muted" />;
  }
  if (error) {
    return (
      <Card>
        <CardContent className="py-16 text-center text-muted-foreground">
          {error}
        </CardContent>
      </Card>
    );
  }
  if (!stats) return null;

  const maxCount = Math.max(...stats.scoreDistribution.map((d) => d.count), 1);

  const cards = [
    {
      label: "考试总数",
      value: stats.examTotal,
      hint: `${stats.publishedExams} 场已发布`,
      icon: ClipboardList,
    },
    {
      label: "学生提交数",
      value: stats.submissionTotal,
      hint: "累计提交",
      icon: Inbox,
    },
    {
      label: "待复核数",
      value: stats.pendingReview,
      hint: "需人工处理",
      icon: TriangleAlert,
    },
    {
      label: "平均分",
      value: stats.averageScore,
      hint: `通过率 ${stats.passRate}%`,
      icon: BarChart3,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardDescription>{c.label}</CardDescription>
              <c.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
              <p className="mt-1 text-xs text-muted-foreground">{c.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">成绩分布概览</CardTitle>
            <CardDescription>已评阅提交的成绩区间分布</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-48 items-end gap-3">
              {stats.scoreDistribution.map((d) => (
                <div
                  key={d.label}
                  className="flex flex-1 flex-col items-center gap-2"
                >
                  <span className="text-xs text-muted-foreground">
                    {d.count}
                  </span>
                  <div
                    className="w-full rounded-t-md bg-primary/80"
                    style={{ height: `${(d.count / maxCount) * 100}%` }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {d.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickLink
              href="/admin/exams"
              icon={<ClipboardList className="h-4 w-4" />}
              label="创建 / 管理考试"
            />
            <QuickLink
              href="/admin/questions"
              icon={<Send className="h-4 w-4" />}
              label="维护题库"
            />
            <QuickLink
              href="/admin/submissions"
              icon={<Inbox className="h-4 w-4" />}
              label="查看提交记录"
            />
            <div className="flex items-center justify-between rounded-md border p-3 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground">
                <TrendingUp className="h-4 w-4" />
                通过率
              </span>
              <span className="font-semibold">{stats.passRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-lg">最近提交</CardTitle>
            <CardDescription>最新的学生提交记录</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/submissions">
              查看全部
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          {stats.recentSubmissions.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              暂无提交记录
            </p>
          ) : (
            stats.recentSubmissions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-md px-3 py-2 hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {s.studentName}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {s.examTitle}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {s.submittedAt ? formatDateTime(s.submittedAt) : "—"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge variant={submissionStatusVariant[s.status]}>
                    {submissionStatusLabel[s.status]}
                  </Badge>
                  <span className="w-14 text-right text-sm font-semibold">
                    {s.score ?? "—"}
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Button asChild variant="outline" className="w-full justify-start">
      <Link href={href}>
        {icon}
        {label}
      </Link>
    </Button>
  );
}

