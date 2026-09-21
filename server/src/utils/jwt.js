const jwt = require("jsonwebtoken");
const config = require("../config");

// 签发令牌：把用户身份信息（id/email/role）写进 token
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

// 校验令牌：合法则返回其中的用户信息，非法则抛错
function verifyToken(token) {
  return jwt.verify(token, config.jwtSecret);
}

module.exports = { signToken, verifyToken };
