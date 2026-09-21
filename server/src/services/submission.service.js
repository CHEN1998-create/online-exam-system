const repo = require("../db");
const HttpError = require("../utils/HttpError");
const examService = require("./exam.service");

/**
 * 判分规则（考试系统的核心业务逻辑）
 * - 单选 single：答案与标准答案一致则得分
 * - 判断 judge：答案与标准答案一致则得分
 * - 简答 short：只保存答案，分数为空，待人工复核（reviewed = false）
 */
function gradeQuestion(q, studentAnswer) {
  if (q.type === "short") {
    return { reviewed: false, correct: null, score: null };
  }
  const correct = String(studentAnswer) === String(q.answer);
  return { reviewed: true, correct, score: correct ? q.score : 0 };
}

// 学生开始考试：校验已发布，创建（或复用）in_progress 的 submission
async function startExam(examId, studentId) {
  const exam = await examService.getExam(examId);
  if (exam.status !== "published") {
    throw new HttpError(400, "该考试尚未发布，无法开始");
  }

  const all = await repo.listSubmissionsByStudent(studentId);
  let submission = all.find(
    (s) => s.examId === examId && s.status === "in_progress"
  );

  if (!submission) {
    submission = {
      id: repo.nextId("sub"),
      examId,
      studentId,
      status: "in_progress",
      reviewed: false,
      answers: [],
      objectiveScore: 0,
      score: null,
      submittedAt: null,
      reviewedAt: null,
      createdAt: new Date().toISOString(),
    };
    await repo.insertSubmission(submission);
  }

  const questions = await repo.findQuestionsByIds(exam.questionIds);
  const sanitized = questions.map(examService.sanitizeQuestion);

  return {
    submission: {
      id: submission.id,
      examId: submission.examId,
      status: submission.status,
      reviewed: submission.reviewed,
      createdAt: submission.createdAt,
    },
    exam: {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      durationMinutes: exam.durationMinutes,
      totalScore: exam.totalScore,
      questions: sanitized,
    },
  };
}

// 学生提交答案：自动判分单选/判断，简答题标记待复核
async function submitAnswers(submissionId, studentId, answers) {
  const submission = await repo.getSubmission(submissionId);
  if (!submission) throw new HttpError(404, "提交记录不存在");
  if (submission.studentId !== studentId) {
    throw new HttpError(403, "无权操作该提交记录");
  }
  if (submission.status !== "in_progress") {
    throw new HttpError(400, "该试卷已提交，不能重复提交");
  }

  const exam = await examService.getExam(submission.examId);
  const questions = await repo.findQuestionsByIds(exam.questionIds);

  const answerList = (Array.isArray(answers) ? answers : []).map((a) => ({
    questionId: a.questionId,
    answer: a.answer,
  }));

  let objectiveScore = 0;
  const results = questions.map((q) => {
    const student = answerList.find((a) => a.questionId === q.id);
    const studentAnswer = student ? student.answer : null;
    const grading = gradeQuestion(q, studentAnswer);
    if (grading.reviewed && grading.score !== null) {
      objectiveScore += grading.score;
    }
    return {
      questionId: q.id,
      type: q.type,
      ...grading,
      studentAnswer,
      correctAnswer: q.answer,
    };
  });

  const hasShort = questions.some((q) => q.type === "short");

  const updated = await repo.updateSubmission(submissionId, {
    answers: answerList,
    objectiveScore,
    reviewed: !hasShort,
    status: hasShort ? "pending_review" : "reviewed",
    score: objectiveScore,
    submittedAt: new Date().toISOString(),
  });

  return {
    submission: {
      id: updated.id,
      examId: updated.examId,
      status: updated.status,
      reviewed: updated.reviewed,
      objectiveScore: updated.objectiveScore,
      score: updated.score,
      submittedAt: updated.submittedAt,
    },
    results,
  };
}

// 学生历史成绩
async function getHistory(studentId) {
  const list = await repo.listSubmissionsByStudent(studentId);
  const exams = await repo.listExams();
  const examMap = new Map(exams.map((e) => [e.id, e]));

  return list.map((s) => {
    const exam = examMap.get(s.examId);
    return {
      id: s.id,
      examId: s.examId,
      examTitle: exam ? exam.title : "未知考试",
      status: s.status,
      reviewed: s.reviewed,
      score: s.score,
      totalScore: exam ? exam.totalScore : null,
      submittedAt: s.submittedAt,
    };
  });
}

// 管理员查看所有提交记录
async function listSubmissions() {
  const list = await repo.listSubmissions();
  const exams = await repo.listExams();
  const examMap = new Map(exams.map((e) => [e.id, e]));

  const result = [];
  for (const s of list) {
    const student = await repo.findUserById(s.studentId);
    const exam = examMap.get(s.examId);
    result.push({
      id: s.id,
      examId: s.examId,
      examTitle: exam ? exam.title : "未知考试",
      studentId: s.studentId,
      studentName: student ? student.name : "未知",
      status: s.status,
      reviewed: s.reviewed,
      objectiveScore: s.objectiveScore,
      score: s.score,
      totalScore: exam ? exam.totalScore : null,
      submittedAt: s.submittedAt,
    });
  }
  return result;
}

// 管理员查看提交详情（含题目与答案，用于复核）
async function getSubmissionDetail(id) {
  const submission = await repo.getSubmission(id);
  if (!submission) throw new HttpError(404, "提交记录不存在");

  const exam = await repo.getExam(submission.examId);
  const questions = exam
    ? await repo.findQuestionsByIds(exam.questionIds)
    : [];
  const student = await repo.findUserById(submission.studentId);

  return {
    id: submission.id,
    examId: submission.examId,
    examTitle: exam ? exam.title : "",
    studentName: student ? student.name : "未知",
    status: submission.status,
    reviewed: submission.reviewed,
    objectiveScore: submission.objectiveScore,
    score: submission.score,
    totalScore: exam ? exam.totalScore : null,
    submittedAt: submission.submittedAt,
    answers: submission.answers,
    questions,
  };
}

// 管理员复核：填入最终总分，状态变为已评阅
async function reviewSubmission(id, data) {
  const submission = await repo.getSubmission(id);
  if (!submission) throw new HttpError(404, "提交记录不存在");
  if (submission.status !== "pending_review") {
    throw new HttpError(400, "该提交无需复核");
  }
  const { score } = data || {};
  if (score === undefined) throw new HttpError(400, "请提供复核后的总分 score");

  return repo.updateSubmission(id, {
    score: Number(score),
    status: "reviewed",
    reviewed: true,
    reviewedAt: new Date().toISOString(),
  });
}

module.exports = {
  startExam,
  submitAnswers,
  getHistory,
  listSubmissions,
  getSubmissionDetail,
  reviewSubmission,
};

