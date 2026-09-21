// 统一错误处理中间件：捕获所有抛出的错误并返回统一 JSON 结构
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || "服务器内部错误";

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({ success: false, message });
}

module.exports = errorHandler;
