// 客户端鉴权工具：读写登录态 cookie
// 注意：仅可在浏览器端（客户端组件、事件回调）中调用

export function saveAuth(token: string, role: string) {
  const maxAge = 60 * 60 * 24 * 7; // 7 天
  document.cookie = `token=${token}; path=/; max-age=${maxAge}`;
  document.cookie = `role=${role}; path=/; max-age=${maxAge}`;
}

export function clearAuth() {
  document.cookie = "token=; path=/; max-age=0";
  document.cookie = "role=; path=/; max-age=0";
}
