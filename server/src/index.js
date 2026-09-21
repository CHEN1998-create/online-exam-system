const express = require("express");
const cors = require("cors");

const config = require("./config");
const repo = require("./db");
const authRoutes = require("./routes/auth.routes");
const studentRoutes = require("./routes/student.routes");
const adminRoutes = require("./routes/admin.routes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// 跨域：允许前端访问
app.use(cors({ origin: config.corsOrigin }));
// 解析 JSON 请求体
app.use(express.json());

// 健康检查
app.get("/api/health", (req, res) =>
  res.json({ success: true, message: "OK", data: { ok: true } })
);

// 挂载路由
app.use("/api/auth", authRoutes); // 登录（公开）、获取当前用户（需登录）
app.use("/api/student", studentRoutes); // 学生端（需学生角色）
app.use("/api/admin", adminRoutes); // 管理端（需管理员角色）

// 404 兜底
app.use((req, res) =>
  res.status(404).json({ success: false, message: "接口不存在" })
);

// 统一错误处理（必须放在所有路由之后）
app.use(errorHandler);

async function main() {
  // 内存模式：填充种子数据；Postgres 模式：建表 + 首次种子
  await repo.init();

  app.listen(config.port, () => {
    console.log(`✅ 后端已启动：http://localhost:${config.port}`);
    console.log(
      process.env.DATABASE_URL
        ? "📦 数据存储：PostgreSQL"
        : "📦 数据存储：内存（本地开发）"
    );
  });
}

main().catch((err) => {
  console.error("❌ 后端启动失败：", err);
  process.exit(1);
});
