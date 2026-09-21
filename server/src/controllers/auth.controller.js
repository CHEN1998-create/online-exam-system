const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body || {};
  const data = await authService.login(email, password);
  ok(res, data, "登录成功");
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user.id);
  ok(res, { user });
});

module.exports = { login, me };
