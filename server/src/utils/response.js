// 统一成功响应：{ success: true, message, data }
function ok(res, data = null, message = "OK") {
  return res.json({ success: true, message, data });
}

// 统一失败响应：{ success: false, message }
function fail(res, status = 500, message = "服务器内部错误") {
  return res.status(status).json({ success: false, message });
}

module.exports = { ok, fail };
