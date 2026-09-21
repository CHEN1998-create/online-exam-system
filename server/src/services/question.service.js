const repo = require("../db");
const HttpError = require("../utils/HttpError");

const VALID_TYPES = ["single", "judge", "short"];

async function listQuestions({ type } = {}) {
  return repo.listQuestions({ type });
}

async function getQuestion(id) {
  const q = await repo.getQuestion(id);
  if (!q) throw new HttpError(404, "题目不存在");
  return q;
}

async function createQuestion(data) {
  const {
    type,
    stem,
    options = [],
    answer,
    score = 5,
    category = "",
    difficulty = "easy",
  } = data || {};

  if (!VALID_TYPES.includes(type)) {
    throw new HttpError(400, "题型无效，仅支持 single / judge / short");
  }
  if (!stem) throw new HttpError(400, "题干不能为空");

  const question = {
    id: repo.nextId("q"),
    type,
    stem,
    options,
    answer: answer ?? "",
    score: Number(score) || 0,
    category,
    difficulty,
  };
  return repo.insertQuestion(question);
}

async function updateQuestion(id, data) {
  await getQuestion(id);
  const { type, stem, options, answer, score, category, difficulty } =
    data || {};

  const patch = {};
  if (type !== undefined) {
    if (!VALID_TYPES.includes(type)) throw new HttpError(400, "题型无效");
    patch.type = type;
  }
  if (stem !== undefined) patch.stem = stem;
  if (options !== undefined) patch.options = options;
  if (answer !== undefined) patch.answer = answer;
  if (score !== undefined) patch.score = Number(score) || 0;
  if (category !== undefined) patch.category = category;
  if (difficulty !== undefined) patch.difficulty = difficulty;

  return repo.updateQuestion(id, patch);
}

async function deleteQuestion(id) {
  await getQuestion(id);
  await repo.removeQuestion(id);
}

module.exports = {
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
};
