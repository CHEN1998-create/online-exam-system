// Vercel Serverless Function：把所有 /api/* 请求交给 Express app 处理
// 这样前端和后端可以一起部署到 Vercel，无需单独的后端服务器
const app = require("../server/src/app");
const repo = require("../server/src/db");

let initPromise = null;

module.exports = async function handler(req, res) {
  // 首次请求时初始化数据库（Postgres：建表 + 种子；内存：填充种子）
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
    return res
      .status(500)
      .json({ success: false, message: "数据库初始化失败" });
  }
  return app(req, res);
};
