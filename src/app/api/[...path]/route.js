import serverless from "serverless-http";
import app from "../../../../server/src/app";
import repo from "../../../../server/src/db";

// 必须用 Node 运行时（Express 需要 Node API）
export const runtime = "nodejs";
// 动态渲染（每次请求都走 Express）
export const dynamic = "force-dynamic";

const handler = serverless(app);

let initPromise = null;

async function handle(request) {
  // 首次请求时初始化数据库（Postgres：建表+种子；内存：填充种子）
  if (!initPromise) {
    initPromise = repo.init().catch((err) => {
      initPromise = null;
      throw err;
    });
  }
  try {
    await initPromise;
  } catch (err) {
    console.error("数据库初始化失败：", err);
    return new Response(
      JSON.stringify({ success: false, message: "数据库初始化失败" }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }

  const url = new URL(request.url);
  const event = {
    httpMethod: request.method,
    path: url.pathname,
    headers: Object.fromEntries(request.headers.entries()),
    queryStringParameters: Object.fromEntries(url.searchParams.entries()),
    body: ["GET", "HEAD"].includes(request.method)
      ? null
      : await request.text(),
    isBase64Encoded: false,
  };

  const result = await handler(event, {});
  return new Response(result.body, {
    status: result.statusCode,
    headers: result.headers,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
export const OPTIONS = handle;
