const { verifyToken } = require("../utils/jwt");
const HttpError = require("../utils/HttpError");

/**
 * 中间件：校验「是否已登录」
 * 从请求头 Authorization: Bearer <token> 取出并验证 JWT。
 * 通过后把 { id, email, role } 挂到 req.user。
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (!token) {
    return next(new HttpError(401, "未登录或登录已过期"));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    return next(new HttpError(401, "登录凭证无效"));
  }
}

module.exports = authenticate;
