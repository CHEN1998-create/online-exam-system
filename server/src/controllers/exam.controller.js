const examService = require("../services/exam.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");

const list = asyncHandler(async (req, res) => {
  ok(res, await examService.listExams());
});

const detail = asyncHandler(async (req, res) => {
  ok(res, await examService.getExam(req.params.id));
});

const getPublishedExam = asyncHandler(async (req, res) => {
  ok(res, await examService.getPublishedExamForStudent(req.params.id));
});

const create = asyncHandler(async (req, res) => {
  ok(res, await examService.createExam(req.body), "创建成功");
});

const update = asyncHandler(async (req, res) => {
  ok(res, await examService.updateExam(req.params.id, req.body), "更新成功");
});

const remove = asyncHandler(async (req, res) => {
  await examService.deleteExam(req.params.id);
  ok(res, null, "删除成功");
});

module.exports = { list, detail, getPublishedExam, create, update, remove };
