const express = require("express");
const cors = require("cors");

const config = require("./config");
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
app.use("/api/auth", authRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);

// 404 兜底
app.use((req, res) =>
  res.status(404).json({ success: false, message: "接口不存在" })
);

// 统一错误处理（必须放在所有路由之后）
app.use(errorHandler);

module.exports = app;
