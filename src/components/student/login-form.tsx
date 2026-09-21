"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { saveAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "student" | "admin";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export function LoginForm({ initialRole }: { initialRole: Role }) {
  const router = useRouter();
  const [role, setRole] = React.useState<Role>(initialRole);
  const [email, setEmail] = React.useState(
    initialRole === "admin" ? "admin@demo.com" : "student@demo.com"
  );
  const [password, setPassword] = React.useState("123456");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "登录失败，请检查邮箱和密码");
        return;
      }
      // 保存登录态（token + 角色）到 cookie，middleware 会读取做页面守卫
      saveAuth(data.token, data.user.role);
      // 以服务器返回的角色为准跳转
      router.push(data.user.role === "admin" ? "/admin" : "/student/exams");
    } catch {
      setError("无法连接服务器，请确认后端已启动");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
        {(
          [
            { value: "student", label: "学生登录", icon: GraduationCap },
            { value: "admin", label: "管理员登录", icon: ShieldCheck },
          ] as const
        ).map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setRole(item.value)}
            className={cn(
              "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              role === item.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">邮箱 / 账号</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            required
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">密码</Label>
            <Link href="#" className="text-sm text-primary hover:underline">
              忘记密码？
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="请输入密码"
            required
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "登录中…" : "登录"}
        </Button>
      </form>

      <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">演示账号</p>
        <p className="mt-1">学生：student@demo.com / 123456</p>
        <p>管理员：admin@demo.com / 123456</p>
      </div>
    </div>
  );
}
