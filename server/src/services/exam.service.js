const repo = require("../db");
const HttpError = require("../utils/HttpError");

// 去掉答案字段（给学生看的题目，不能泄露正确答案）
function sanitizeQuestion(q) {
  const { answer, ...rest } = q;
  return rest;
}

function toExamSummary(exam) {
  return {
    id: exam.id,
    title: exam.title,
    description: exam.description,
    durationMinutes: exam.durationMinutes,
    status: exam.status,
    questionCount: exam.questionIds.length,
    totalScore: exam.totalScore,
    createdAt: exam.createdAt,
  };
}

async function sumScore(questionIds) {
  const questions = await repo.findQuestionsByIds(questionIds);
  return questions.reduce((sum, q) => sum + q.score, 0);
}

async function listExams({ status } = {}) {
  const list = await repo.listExams({ status });
  return list.map(toExamSummary);
}

async function listPublishedExams() {
  return listExams({ status: "published" });
}

async function getExam(id) {
  const exam = await repo.getExam(id);
  if (!exam) throw new HttpError(404, "考试不存在");
  return exam;
}

// 学生查看已发布考试详情（含题目，但不含正确答案）
async function getPublishedExamForStudent(id) {
  const exam = await getExam(id);
  if (exam.status !== "published") {
    throw new HttpError(404, "考试不存在或未发布");
  }
  const questions = await repo.findQuestionsByIds(exam.questionIds);
  return { ...toExamSummary(exam), questions: questions.map(sanitizeQuestion) };
}

// 管理员创建考试
async function createExam(data) {
  const {
    title,
    description = "",
    durationMinutes = 60,
    questionIds = [],
    status = "draft",
  } = data || {};

  if (!title) throw new HttpError(400, "考试标题不能为空");

  const existing = await repo.findQuestionsByIds(questionIds);
  const validIds = existing.map((q) => q.id);
  const totalScore = await sumScore(validIds);

  const exam = {
    id: repo.nextId("exam"),
    title,
    description,
    durationMinutes: Number(durationMinutes) || 60,
    status,
    questionIds: validIds,
    totalScore,
    createdAt: new Date().toISOString(),
  };
  await repo.insertExam(exam);
  return exam;
}

// 管理员更新考试（含发布/关闭）
async function updateExam(id, data) {
  const exam = await getExam(id);
  const { title, description, durationMinutes, questionIds, status } =
    data || {};

  const patch = {};
  if (title !== undefined) patch.title = title;
  if (description !== undefined) patch.description = description;
  if (durationMinutes !== undefined) {
    patch.durationMinutes = Number(durationMinutes) || exam.durationMinutes;
  }
  if (questionIds !== undefined) {
    const existing = await repo.findQuestionsByIds(questionIds);
    const validIds = existing.map((q) => q.id);
    patch.questionIds = validIds;
    patch.totalScore = await sumScore(validIds);
  }
  if (status !== undefined) patch.status = status;

  return repo.updateExam(id, patch);
}

// 管理员删除考试
async function deleteExam(id) {
  await getExam(id);
  await repo.removeExam(id);
}

module.exports = {
  sanitizeQuestion,
  listExams,
  listPublishedExams,
  getExam,
  getPublishedExamForStudent,
  createExam,
  updateExam,
  deleteExam,
};
