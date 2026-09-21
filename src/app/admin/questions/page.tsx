"use client";

import * as React from "react";
import { Plus, Trash2 } from "lucide-react";

import { api } from "@/lib/api";
import {
  difficultyLabel,
  difficultyVariant,
  questionTypeLabel,
} from "@/lib/labels";
import type { Question, QuestionType } from "@/lib/types";
import {
  QuestionFormDialog,
  type QuestionFormValues,
} from "@/components/admin/question-form-dialog";
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

const typeTabs: { value: "all" | QuestionType; label: string }[] = [
  { value: "all", label: "全部" },
  { value: "single", label: "单选题" },
  { value: "judge", label: "判断题" },
  { value: "short", label: "简答题" },
];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Question | null>(null);

  const load = React.useCallback(() => {
    setLoading(true);
    api
      .get<Question[]>("/api/admin/questions")
      .then(setQuestions)
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
  const openEdit = (q: Question) => {
    setEditing(q);
    setDialogOpen(true);
  };

  const handleSubmit = async (values: QuestionFormValues) => {
    try {
      if (editing) {
        await api.put(`/api/admin/questions/${editing.id}`, values);
      } else {
        await api.post("/api/admin/questions", values);
      }
      setDialogOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const removeQuestion = async (id: string) => {
    try {
      await api.del(`/api/admin/questions/${id}`);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "删除失败");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          共 {questions.length} 道题目，支持按题型筛选。
        </p>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          新增题目
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      ) : (
        <Tabs defaultValue="all">
          <TabsList>
            {typeTabs.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {typeTabs.map((t) => (
            <TabsContent key={t.value} value={t.value}>
              <QuestionTable
                list={
                  t.value === "all"
                    ? questions
                    : questions.filter((q) => q.type === t.value)
                }
                onEdit={openEdit}
                onDelete={removeQuestion}
              />
            </TabsContent>
          ))}
        </Tabs>
      )}

      <QuestionFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        question={editing}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

function QuestionTable({
  list,
  onEdit,
  onDelete,
}: {
  list: Question[];
  onEdit: (q: Question) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <Card className="mt-4">
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>题干</TableHead>
              <TableHead>题型</TableHead>
              <TableHead>分类</TableHead>
              <TableHead>难度</TableHead>
              <TableHead className="text-right">分值</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((q) => (
              <TableRow key={q.id}>
                <TableCell>
                  <div className="max-w-[360px] truncate font-medium">
                    {q.stem}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{questionTypeLabel[q.type]}</Badge>
                </TableCell>
                <TableCell>{q.category}</TableCell>
                <TableCell>
                  <Badge variant={difficultyVariant[q.difficulty]}>
                    {difficultyLabel[q.difficulty]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">{q.score}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(q)}>
                      编辑
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => onDelete(q.id)}
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
  );
}
