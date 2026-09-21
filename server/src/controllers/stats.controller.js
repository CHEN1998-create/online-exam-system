const statsService = require("../services/stats.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");

// GET /api/admin/stats —— 后台概览统计
const getStats = asyncHandler(async (req, res) => {
  ok(res, await statsService.getAdminStats());
});

module.exports = { getStats };
