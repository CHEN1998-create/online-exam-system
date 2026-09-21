const questionService = require("../services/question.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");

const list = asyncHandler(async (req, res) => {
  ok(res, await questionService.listQuestions({ type: req.query.type }));
});

const detail = asyncHandler(async (req, res) => {
  ok(res, await questionService.getQuestion(req.params.id));
});

const create = asyncHandler(async (req, res) => {
  ok(res, await questionService.createQuestion(req.body), "创建成功");
});

const update = asyncHandler(async (req, res) => {
  ok(res, await questionService.updateQuestion(req.params.id, req.body), "更新成功");
});

const remove = asyncHandler(async (req, res) => {
  await questionService.deleteQuestion(req.params.id);
  ok(res, null, "删除成功");
});

module.exports = { list, detail, create, update, remove };
