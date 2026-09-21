const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const examController = require("../controllers/exam.controller");
const submissionController = require("../controllers/submission.controller");

const router = express.Router();

// 学生端所有接口：先登录，再校验「学生」角色
router.use(authenticate, authorize("student"));

router.get("/exams", submissionController.listPublishedExams);
router.get("/exams/:id", examController.getPublishedExam);
router.post("/exams/:id/start", submissionController.startExam);
router.post("/submissions/:id/submit", submissionController.submit);
router.get("/history", submissionController.history);

module.exports = router;
