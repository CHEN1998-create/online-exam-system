const HttpError = require("../utils/HttpError");

/**
 * 中间件工厂：校验「角色」
 * 用法：authorize("student") 只放行学生；authorize("admin") 只放行管理员。
 * 需先经过 authenticate（否则 req.user 不存在，直接 403）。
 */
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, "没有权限访问该资源"));
    }
    next();
  };
}

module.exports = authorize;
