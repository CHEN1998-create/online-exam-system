const path = require("path");
const dotenv = require("dotenv");

// 无论从哪个目录启动，都读取 server/.env
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
};

// 生产环境必须显式设置 JWT_SECRET，这里只做提醒
if (!process.env.JWT_SECRET) {
  console.warn("[警告] 未设置 JWT_SECRET，正在使用默认值（仅用于本地开发）");
}

module.exports = config;
