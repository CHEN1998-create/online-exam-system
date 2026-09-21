// 包装 async 控制器：捕获异常并交给统一错误处理中间件
function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

module.exports = asyncHandler;
