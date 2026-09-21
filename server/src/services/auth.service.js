const bcrypt = require("bcryptjs");
const repo = require("../db");
const { signToken } = require("../utils/jwt");
const HttpError = require("../utils/HttpError");

function toPublicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

// 登录：校验邮箱密码，签发 token
async function login(email, password) {
  if (!email || !password) {
    throw new HttpError(400, "请输入邮箱和密码");
  }
  const user = await repo.findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    throw new HttpError(401, "邮箱或密码错误");
  }
  const token = signToken(user);
  return { token, user: toPublicUser(user) };
}

// 获取当前登录用户
async function getMe(userId) {
  const user = await repo.findUserById(userId);
  if (!user) throw new HttpError(401, "用户不存在");
  return toPublicUser(user);
}

module.exports = { login, getMe };
