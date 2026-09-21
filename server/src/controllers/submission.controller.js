const submissionService = require("../services/submission.service");
const examService = require("../services/exam.service");
const asyncHandler = require("../utils/asyncHandler");
const { ok } = require("../utils/response");

const listPublishedExams = asyncHandler(async (req, res) => {
  ok(res, await examService.listPublishedExams());
});

const startExam = asyncHandler(async (req, res) => {
  ok(res, await submissionService.startExam(req.params.id, req.user.id), "已开始考试");
});

const submit = asyncHandler(async (req, res) => {
  const answers = (req.body || {}).answers;
  ok(res, await submissionService.submitAnswers(req.params.id, req.user.id, answers), "提交成功");
});

const history = asyncHandler(async (req, res) => {
  ok(res, await submissionService.getHistory(req.user.id));
});

const listAll = asyncHandler(async (req, res) => {
  ok(res, await submissionService.listSubmissions());
});

const detail = asyncHandler(async (req, res) => {
  ok(res, await submissionService.getSubmissionDetail(req.params.id));
});

const review = asyncHandler(async (req, res) => {
  ok(res, await submissionService.reviewSubmission(req.params.id, req.body), "复核完成");
});

module.exports = {
  listPublishedExams,
  startExam,
  submit,
  history,
  listAll,
  detail,
  review,
};
