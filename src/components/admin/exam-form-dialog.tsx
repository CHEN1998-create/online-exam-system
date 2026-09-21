"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { examStatusLabel } from "@/lib/labels";
import type { ExamStatus } from "@/lib/types";

export interface ExamFormValues {
  title: string;
  description: string;
  durationMinutes: number;
  status: ExamStatus;
}

const empty: ExamFormValues = {
  title: "",
  description: "",
  durationMinutes: 60,
  status: "draft",
};

export interface ExamLike {
  title: string;
  description: string;
  durationMinutes: number;
  status: ExamStatus;
}

export function ExamFormDialog({
  open,
  onClose,
  exam,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  exam: ExamLike | null;
  onSubmit: (values: ExamFormValues) => void;
}) {
  const [values, setValues] = React.useState<ExamFormValues>(empty);

  React.useEffect(() => {
    if (open) {
      setValues(
        exam
          ? {
              title: exam.title,
              description: exam.description,
              durationMinutes: exam.durationMinutes,
              status: exam.status,
            }
          : empty
      );
    }
  }, [open, exam]);

  const set = <K extends keyof ExamFormValues>(
    key: K,
    value: ExamFormValues[K]
  ) => setValues((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={exam ? "编辑考试" : "新建考试"}
      description="设置考试基本信息与时长，发布后学生即可参加。"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button type="submit" form="exam-form">
            保存
          </Button>
        </>
      }
    >
      <form id="exam-form" onSubmit={handleSubmit} className="space-y-4">
        <Field label="考试标题">
          <Input
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="例如：《数据结构》期中考试"
            required
          />
        </Field>

        <Field label="考试说明">
          <Textarea
            rows={3}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="考试范围与注意事项"
          />
        </Field>

        <Field label="时长（分钟）">
          <Input
            type="number"
            min={1}
            value={values.durationMinutes}
            onChange={(e) => set("durationMinutes", Number(e.target.value))}
          />
        </Field>

        <Field label="发布状态">
          <Select
            value={values.status}
            onChange={(e) => set("status", e.target.value as ExamStatus)}
          >
            <option value="draft">{examStatusLabel.draft}</option>
            <option value="published">{examStatusLabel.published}</option>
            <option value="closed">{examStatusLabel.closed}</option>
          </Select>
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
