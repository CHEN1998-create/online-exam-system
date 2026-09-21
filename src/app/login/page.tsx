import Link from "next/link";
import { GraduationCap } from "lucide-react";

import { LoginForm } from "@/components/student/login-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Role = "student" | "admin";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;
  const initialRole: Role = role === "admin" ? "admin" : "student";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4 py-10">
      <Link
        href="/"
        className="mb-6 flex items-center gap-2 text-muted-foreground hover:text-foreground"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" />
        </div>
        <span className="text-base font-semibold text-foreground">
          在线考试与管理系统
        </span>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>登录</CardTitle>
          <CardDescription>
            选择角色并使用对应账号登录系统
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm initialRole={initialRole} />
        </CardContent>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:underline">
          返回首页
        </Link>
      </p>
    </div>
  );
}
