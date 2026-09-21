// 业务错误：service 层抛出，由 errorHandler 中间件统一转成 JSON 响应
class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

module.exports = HttpError;
