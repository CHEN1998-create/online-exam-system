import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 前端路由守卫：
 * - 未登录（无 token cookie）访问 /student/* 或 /admin/* → 跳 /login
 * - 角色与路径不匹配（例如学生访问 /admin/*）→ 跳回自己该去的首页
 *
 * 说明：这里只做「页面跳转」级别的守卫，真正的权限校验由后端中间件负责。
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;

  // 未登录访问受保护页面
  if (!token) {
    const url = new URL("/login", request.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // 角色与路径不匹配
  if (pathname.startsWith("/student") && role && role !== "student") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  if (pathname.startsWith("/admin") && role && role !== "admin") {
    return NextResponse.redirect(new URL("/student/exams", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*"],
};
