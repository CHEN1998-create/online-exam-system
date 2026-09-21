const repo = require("../db");

// 后台首页概览统计
async function getAdminStats() {
  const exams = await repo.listExams();
  const submissions = await repo.listSubmissions();
  const examMap = new Map(exams.map((e) => [e.id, e]));

  const examTotal = exams.length;
  const publishedExams = exams.filter((e) => e.status === "published").length;
  const submissionTotal = submissions.length;
  const pendingReview = submissions.filter(
    (s) => s.status === "pending_review"
  ).length;

  // 已评阅的提交，按百分比算通过率与分布
  const reviewed = submissions
    .filter((s) => s.status === "reviewed" && s.score !== null)
    .map((s) => {
      const exam = examMap.get(s.examId);
      const totalScore = exam ? exam.totalScore : null;
      const pct = totalScore ? (s.score / totalScore) * 100 : 0;
      return { ...s, pct };
    });

  const averageScore = reviewed.length
    ? Number(
        (reviewed.reduce((sum, s) => sum + s.score, 0) / reviewed.length).toFixed(1)
      )
    : 0;

  const passed = reviewed.filter((s) => s.pct >= 60);
  const passRate = reviewed.length
    ? Math.round((passed.length / reviewed.length) * 100)
    : 0;

  const buckets = [
    { label: "0-59", min: 0, max: 59 },
    { label: "60-69", min: 60, max: 69 },
    { label: "70-79", min: 70, max: 79 },
    { label: "80-89", min: 80, max: 89 },
    { label: "90-100", min: 90, max: 100 },
  ];
  const scoreDistribution = buckets.map((b) => ({
    label: b.label,
    count: reviewed.filter((s) => s.pct >= b.min && s.pct <= b.max).length,
  }));

  // 最近 5 条已提交
  const recent = submissions
    .filter((s) => s.submittedAt)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);

  const recentSubmissions = [];
  for (const s of recent) {
    const exam = examMap.get(s.examId);
    const student = await repo.findUserById(s.studentId);
    recentSubmissions.push({
      id: s.id,
      studentName: student ? student.name : "未知",
      examTitle: exam ? exam.title : "未知考试",
      status: s.status,
      score: s.score,
      submittedAt: s.submittedAt,
    });
  }

  return {
    examTotal,
    publishedExams,
    submissionTotal,
    pendingReview,
    averageScore,
    passRate,
    scoreDistribution,
    recentSubmissions,
  };
}

module.exports = { getAdminStats };
