"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { difficultyLabel, questionTypeLabel } from "@/lib/labels";
import type { Difficulty, Question, QuestionType } from "@/lib/types";

export interface QuestionFormValues {
  type: QuestionType;
  stem: string;
  score: number;
  category: string;
  difficulty: Difficulty;
  options: { key: string; text: string }[];
  answer: string;
}

export function QuestionFormDialog({
  open,
  onClose,
  question,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  question: Question | null;
  onSubmit: (values: QuestionFormValues) => void;
}) {
  const [type, setType] = React.useState<QuestionType>("single");
  const [stem, setStem] = React.useState("");
  const [score, setScore] = React.useState(5);
  const [category, setCategory] = React.useState("计算机");
  const [difficulty, setDifficulty] = React.useState<Difficulty>("easy");
  const [options, setOptions] = React.useState(["", "", "", ""]);
  const [answer, setAnswer] = React.useState("A");

  React.useEffect(() => {
    if (open) {
      if (question) {
        setType(question.type);
        setStem(question.stem);
        setScore(question.score);
        setCategory(question.category);
        setDifficulty(question.difficulty);
        setOptions(
          question.type === "single"
            ? question.options.map((o) => o.text)
            : ["", "", "", ""]
        );
        setAnswer(
          Array.isArray(question.answer)
            ? question.answer.join(",")
            : question.answer
        );
      } else {
        setType("single");
        setStem("");
        setScore(5);
        setCategory("计算机");
        setDifficulty("easy");
        setOptions(["", "", "", ""]);
        setAnswer("A");
      }
    }
  }, [open, question]);

  const setOption = (i: number, v: string) =>
    setOptions((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const builtOptions =
      type === "single"
        ? options.map((text, i) => ({
            key: ["A", "B", "C", "D"][i],
            text,
          }))
        : type === "judge"
          ? [
              { key: "T", text: "正确" },
              { key: "F", text: "错误" },
            ]
          : [];
    onSubmit({
      type,
      stem,
      score,
      category,
      difficulty,
      options: builtOptions,
      answer,
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={question ? "编辑题目" : "新增题目"}
      description="支持单选、判断、简答三种题型。"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" form="question-form">
            保存
          </Button>
        </>
      }
    >
      <form id="question-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="题型">
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as QuestionType)}
            >
              <option value="single">{questionTypeLabel.single}</option>
              <option value="judge">{questionTypeLabel.judge}</option>
              <option value="short">{questionTypeLabel.short}</option>
            </Select>
          </Field>
          <Field label="难度">
            <Select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            >
              <option value="easy">{difficultyLabel.easy}</option>
              <option value="medium">{difficultyLabel.medium}</option>
              <option value="hard">{difficultyLabel.hard}</option>
            </Select>
          </Field>
        </div>

        <Field label="题干">
          <Textarea
            rows={3}
            value={stem}
            onChange={(e) => setStem(e.target.value)}
            placeholder="请输入题目内容"
            required
          />
        </Field>

        {type === "single" && (
          <div className="space-y-2">
            <Label>选项</Label>
            {["A", "B", "C", "D"].map((k, i) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-6 text-sm font-medium text-muted-foreground">
                  {k}
                </span>
                <Input
                  value={options[i]}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`选项 ${k}`}
                  required
                />
              </div>
            ))}
          </div>
        )}

        {type === "judge" && (
          <p className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
            判断题选项固定为「正确 / 错误」。
          </p>
        )}
        <div className="grid grid-cols-2 gap-3">
          <Field label="分值">
            <Input
              type="number"
              min={1}
              value={score}
              onChange={(e) => setScore(Number(e.target.value))}
            />
          </Field>
          <Field label="分类">
            <Input
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
          </Field>
        </div>

        <Field label={type === "short" ? "参考答案" : "正确答案"}>
          {type === "single" && (
            <Select value={answer} onChange={(e) => setAnswer(e.target.value)}>
              {["A", "B", "C", "D"].map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </Select>
          )}
          {type === "judge" && (
            <Select value={answer} onChange={(e) => setAnswer(e.target.value)}>
              <option value="T">正确</option>
              <option value="F">错误</option>
            </Select>
          )}
          {type === "short" && (
            <Textarea
              rows={3}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="填写参考答案，用于人工复核参考"
            />
          )}
        </Field>
      </form>
    </Dialog>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

