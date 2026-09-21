const memory = require("./memory");
const postgres = require("./postgres");

// 有 DATABASE_URL 用 PostgreSQL，否则用内存（本地开发，重启即重置）
const repo = process.env.DATABASE_URL ? postgres : memory;

module.exports = repo;

