import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "在线考试与管理系统",
    template: "%s | 在线考试与管理系统",
  },
  description:
    "支持学生答题、管理员出卷、题库维护、成绩统计的在线考试系统。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
