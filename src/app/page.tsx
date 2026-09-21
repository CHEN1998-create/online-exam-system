import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  ClipboardList,
  GraduationCap,
  LibraryBig,
  ListChecks,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const features = [
  {
    icon: LibraryBig,
    title: "题库管理",
    desc: "支持单选、多选、判断、简答题型的集中维护与分类筛选。",
  },
  {
    icon: ClipboardList,
    title: "在线考试",
    desc: "设置考试时间与时长，学生可在线答题并自动倒计时。",
  },
  {
    icon: BarChart3,
    title: "成绩统计",
    desc: "自动判分 + 人工复核，直观呈现平均分、通过率与错误率。",
  },
  {
    icon: ListChecks,
    title: "提交记录",
    desc: "完整记录每份试卷的作答情况，支持查看详情与复核。",
  },
];

const steps = [
  { no: "01", title: "管理员出卷", desc: "维护题库，创建考试并绑定题目，设置时长后发布。" },
  { no: "02", title: "学生答题", desc: "学生登录后进入考试，专注作答并在倒计时内提交试卷。" },
  { no: "03", title: "成绩与复核", desc: "系统自动判分客观题，管理员对简答题进行人工复核。" },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 顶部导航 */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="text-base font-semibold">在线考试与管理系统</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">登录</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/login?role=student">进入考试</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            学生端 / 管理端权限隔离
          </div>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            一站式在线考试与管理系统
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            支持学生在线答题、管理员出卷、题库维护、提交记录与成绩统计，
            让考试从组卷到阅卷全流程在线化。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/login?role=student">
                学生登录
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login?role=admin">
                <ShieldCheck className="h-4 w-4" />
                管理员登录
              </Link>
            </Button>
          </div>
        </section>

        {/* 功能特性 */}
        <section className="mx-auto max-w-6xl px-4 pb-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <Card key={f.title}>
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                  <CardDescription>{f.desc}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>

        {/* 考试说明 */}
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-6xl px-4 py-16">
            <h2 className="text-center text-2xl font-bold sm:text-3xl">
              考试流程
            </h2>
            <p className="mt-3 text-center text-muted-foreground">
              从出卷到成绩，三步完成
            </p>
            <div className="mt-10 grid gap-6 sm:grid-cols-3">
              {steps.map((s) => (
                <Card key={s.no} className="border-0 bg-background">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-primary/30">
                      {s.no}
                    </div>
                    <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {s.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} 在线考试与管理系统 · 骨架演示版本
        </div>
      </footer>
    </div>
  );
}
