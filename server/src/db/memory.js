const seed = require("./seed");

// 内存数据仓库（本地开发用，重启即重置）
let counter = 0;

const db = {
  users: [],
  exams: [],
  questions: [],
  submissions: [],
};

const memory = {
  async init() {
    db.users = seed.users.map((u) => ({ ...u }));
    db.questions = seed.questions.map((q) => ({
      ...q,
      options: [...q.options],
    }));
    db.exams = seed.exams.map((e) => ({ ...e, questionIds: [...e.questionIds] }));
    db.submissions = [];
  },

  nextId(prefix) {
    counter += 1;
    return `${prefix}-${Date.now()}-${counter}`;
  },

  // users
  async findUserByEmail(email) {
    return db.users.find((u) => u.email === email);
  },
  async findUserById(id) {
    return db.users.find((u) => u.id === id);
  },

  // questions
  async listQuestions({ type } = {}) {
    let list = db.questions;
    if (type) list = list.filter((q) => q.type === type);
    return list;
  },
  async getQuestion(id) {
    return db.questions.find((q) => q.id === id);
  },
  async findQuestionsByIds(ids) {
    return ids.map((id) => db.questions.find((q) => q.id === id)).filter(Boolean);
  },
  async insertQuestion(q) {
    db.questions.unshift(q);
    return q;
  },
  async updateQuestion(id, patch) {
    const q = db.questions.find((x) => x.id === id);
    if (!q) return undefined;
    Object.assign(q, patch);
    return q;
  },
  async removeQuestion(id) {
    const i = db.questions.findIndex((x) => x.id === id);
    if (i === -1) return;
    db.questions.splice(i, 1);
    db.exams.forEach((e) => {
      e.questionIds = e.questionIds.filter((qid) => qid !== id);
    });
  },

  // exams
  async listExams({ status } = {}) {
    let list = db.exams;
    if (status) list = list.filter((e) => e.status === status);
    return list;
  },
  async getExam(id) {
    return db.exams.find((e) => e.id === id);
  },
  async insertExam(e) {
    db.exams.unshift(e);
    return e;
  },
  async updateExam(id, patch) {
    const e = db.exams.find((x) => x.id === id);
    if (!e) return undefined;
    Object.assign(e, patch);
    return e;
  },
  async removeExam(id) {
    const i = db.exams.findIndex((x) => x.id === id);
    if (i === -1) return;
    db.exams.splice(i, 1);
  },

  // submissions
  async insertSubmission(s) {
    db.submissions.push(s);
    return s;
  },
  async getSubmission(id) {
    return db.submissions.find((s) => s.id === id);
  },
  async updateSubmission(id, patch) {
    const s = db.submissions.find((x) => x.id === id);
    if (!s) return undefined;
    Object.assign(s, patch);
    return s;
  },
  async listSubmissions() {
    return db.submissions;
  },
  async listSubmissionsByStudent(studentId) {
    return db.submissions.filter((s) => s.studentId === studentId);
  },
};

module.exports = memory;
