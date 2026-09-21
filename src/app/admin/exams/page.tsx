"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { api } from "@/lib/api";
import { formatDateTime, formatDuration } from "@/lib/format";
import { examStatusLabel, examStatusVariant } from "@/lib/labels";
import type { ExamStatus } from "@/lib/types";
import {
  ExamFormDialog,
  type ExamFormValues,
} from "@/components/admin/exam-form-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExamItem {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  status: ExamStatus;
  questionCount: number;
  totalScore: number;
  createdAt: string;
}

export default function AdminExamsPage() {
  const [examList, setExamList] = React.useState<ExamItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ExamItem | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    api
      .get<ExamItem[]>("/api/admin/exams")
      .then(setExamList)
      .catch((e) => setError(e instanceof Error ? e.message : "加载失败"))
      .finally(() => setLoading(false));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setDialogOpen(true);
  };
  const openEdit = (exam: ExamItem) => {
    setEditing(exam);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: ExamFormValues) => {
    try {
      if (editing) {
        await api.patch(`/api/admin/exams/${editing.id}`, values);
      } else {
        await api.post("/api/admin/exams", values);
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const toggleStatus = async (exam: ExamItem) => {
    const status: ExamStatus =
      exam.status === "published" ? "closed" : "published";
    try {
      await api.patch(`/api/admin/exams/${exam.id}`, { status });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "操作失败");
    }
  };

  const removeExam = async (id: string) => {
    try {
      await api.del(`/api/admin/exams/${id}`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          共 {examList.length} 场考试，发布后学生即可参加。
        </p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          新建考试
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>考试名称</TableHead>
                  <TableHead>题数</TableHead>
                  <TableHead>时长</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {examList.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>
                      <div className="font-medium">{exam.title}</div>
                      <div className="max-w-[260px] truncate text-xs text-muted-foreground">
                        {exam.description}
                      </div>
                    </TableCell>
                    <TableCell>{exam.questionCount}</TableCell>
                    <TableCell>{formatDuration(exam.durationMinutes)}</TableCell>
                    <TableCell>
                      <Badge variant={examStatusVariant[exam.status]}>
                        {examStatusLabel[exam.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDateTime(exam.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(exam)}
                        >
                          编辑
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleStatus(exam)}
                        >
                          {exam.status === "published" ? "关闭" : "发布"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => removeExam(exam.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <ExamFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        exam={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
