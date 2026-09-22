// 统一 API 客户端：自动附加 JWT token，解析统一 JSON 结构
// API_BASE：本地开发填 http://localhost:4000；部署到 Vercel 时留空（用相对路径，同源）
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

function getToken(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const row = document.cookie
    .split("; ")
    .find((c) => c.startsWith("token="));
  return row ? row.split("=")[1] : undefined;
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  let body: { success?: boolean; message?: string; data?: T } | null = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok || body?.success === false) {
    throw new Error(body?.message || `请求失败（${res.status}）`);
  }
  return (body?.data ?? body) as T;
}

export const api = {
  get<T = unknown>(path: string) {
    return apiFetch<T>(path);
  },
  post<T = unknown>(path: string, data?: unknown) {
    return apiFetch<T>(path, {
      method: "POST",
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  },
  patch<T = unknown>(path: string, data?: unknown) {
    return apiFetch<T>(path, { method: "PATCH", body: JSON.stringify(data) });
  },
  put<T = unknown>(path: string, data?: unknown) {
    return apiFetch<T>(path, { method: "PUT", body: JSON.stringify(data) });
  },
  del<T = unknown>(path: string) {
    return apiFetch<T>(path, { method: "DELETE" });
  },
};
