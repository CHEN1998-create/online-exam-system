const express = require("express");
const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const examController = require("../controllers/exam.controller");
const questionController = require("../controllers/question.controller");
const submissionController = require("../controllers/submission.controller");
const statsController = require("../controllers/stats.controller");

const router = express.Router();

// 管理端所有接口：先登录，再校验「管理员」角色
router.use(authenticate, authorize("admin"));

// 概览统计
router.get("/stats", statsController.getStats);

// 考试管理
router.get("/exams", examController.list);
router.post("/exams", examController.create);
router.get("/exams/:id", examController.detail);
router.patch("/exams/:id", examController.update);
router.delete("/exams/:id", examController.remove);

// 题库管理
router.get("/questions", questionController.list);
router.post("/questions", questionController.create);
router.get("/questions/:id", questionController.detail);
router.put("/questions/:id", questionController.update);
router.delete("/questions/:id", questionController.remove);

// 提交记录
router.get("/submissions", submissionController.listAll);
router.get("/submissions/:id", submissionController.detail);
router.post("/submissions/:id/review", submissionController.review);

module.exports = router;
