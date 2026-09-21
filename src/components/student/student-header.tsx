"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { GraduationCap, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";
import { clearAuth } from "@/lib/auth";

const navItems = [
  { href: "/student/exams", label: "考试" },
  { href: "/student/history", label: "成绩" },
];

export function StudentHeader() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-30 border-b bg-background">
      <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
        <Link href="/student/exams" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <span className="text-base font-semibold">在线考试</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 sm:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
            张
          </div>
          <div className="hidden text-sm leading-tight sm:block">
            <div className="font-medium">张伟</div>
            <div className="text-xs text-muted-foreground">学生</div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="ml-2 flex items-center gap-1 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
            退出
          </button>
        </div>
      </div>
    </header>
  );
}
