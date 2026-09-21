"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Clock, FileText } from "lucide-react";

import { api } from "@/lib/api";
import { formatDuration } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ExamItem {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  status: string;
  questionCount: number;
  totalScore: number;
}

export default function StudentExamsPage() {
  const [exams, setExams] = React.useState<ExamItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    api
      .get<ExamItem[]>("/api/student/exams")
      .then(setExams)
      .catch((e) => setError(e.message || "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">我的考试</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          查看可参加的考试，进入后请在规定时间内完成作答。
        </p>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : error ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            {error}
          </CardContent>
        </Card>
      ) : exams.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            当前没有可参加的考试
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {exams.map((exam) => (
            <Card key={exam.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg leading-snug">
                    {exam.title}
                  </CardTitle>
                  <Badge variant="success">可参加</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {exam.description}
                </p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {formatDuration(exam.durationMinutes)}
                </span>
                <span className="flex items-center gap-1.5">
                  <FileText className="h-4 w-4" />
                  {exam.questionCount} 题
                </span>
                <span>满分 {exam.totalScore} 分</span>
              </CardContent>
              <CardFooter>
                <Button asChild className="w-full">
                  <Link href={`/student/exams/${exam.id}`}>
                    开始考试
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
