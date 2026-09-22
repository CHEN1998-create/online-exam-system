const app = require("./app");
const config = require("./config");
const repo = require("./db");

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

