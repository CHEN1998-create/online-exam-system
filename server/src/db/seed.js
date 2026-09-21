const bcrypt = require("bcryptjs");

function hash(password) {
  return bcrypt.hashSync(password, 10);
}

// 演示用户（生产环境请从数据库读取，且密码只存哈希）
const users = [
  {
    id: "u-student",
    name: "张伟",
    email: "student@demo.com",
    passwordHash: hash("123456"),
    role: "student",
  },
  {
    id: "u-admin",
    name: "管理员",
    email: "admin@demo.com",
    passwordHash: hash("123456"),
    role: "admin",
  },
];

// 题目：type 为 single（单选）/ judge（判断）/ short（简答）
const questions = [
  {
    id: "q-1",
    type: "single",
    stem: "在长度为 n 的顺序表中插入一个元素，平均需要移动的元素个数是？",
    options: [
      { key: "A", text: "n" },
      { key: "B", text: "n/2" },
      { key: "C", text: "n-1" },
      { key: "D", text: "(n-1)/2" },
    ],
    answer: "B",
    score: 5,
    category: "数据结构",
    difficulty: "easy",
  },
  {
    id: "q-2",
    type: "single",
    stem: "栈（Stack）的典型操作特征是？",
    options: [
      { key: "A", text: "先进先出" },
      { key: "B", text: "后进先出" },
      { key: "C", text: "随机访问" },
      { key: "D", text: "按优先级出队" },
    ],
    answer: "B",
    score: 5,
    category: "数据结构",
    difficulty: "easy",
  },
  {
    id: "q-3",
    type: "judge",
    stem: "二叉树的先序遍历与中序遍历结果可以唯一确定一棵二叉树。",
    options: [
      { key: "T", text: "正确" },
      { key: "F", text: "错误" },
    ],
    answer: "T",
    score: 5,
    category: "数据结构",
    difficulty: "medium",
  },
  {
    id: "q-4",
    type: "single",
    stem: "快速排序的平均时间复杂度是？",
    options: [
      { key: "A", text: "O(n)" },
      { key: "B", text: "O(n log n)" },
      { key: "C", text: "O(n²)" },
      { key: "D", text: "O(log n)" },
    ],
    answer: "B",
    score: 10,
    category: "数据结构",
    difficulty: "medium",
  },
  {
    id: "q-5",
    type: "judge",
    stem: "哈希表查找的平均时间复杂度可以达到 O(1)。",
    options: [
      { key: "T", text: "正确" },
      { key: "F", text: "错误" },
    ],
    answer: "T",
    score: 5,
    category: "数据结构",
    difficulty: "easy",
  },
  {
    id: "q-6",
    type: "short",
    stem: "请简述「递归」的基本思想，并说明使用递归时需要注意的两个基本要素。",
    options: [],
    answer: "递归由「基线条件（递归出口）」和「递归关系（缩小问题规模）」构成；需注意栈溢出与重复计算。",
    score: 70,
    category: "数据结构",
    difficulty: "hard",
  },
];

// 考试：status 为 draft（草稿）/ published（已发布）/ closed（已关闭）
const exams = [
  {
    id: "exam-1",
    title: "《数据结构》期中考试",
    description: "覆盖线性表、栈与队列、树与二叉树等章节。",
    durationMinutes: 60,
    status: "published",
    questionIds: ["q-1", "q-2", "q-3", "q-4", "q-5", "q-6"],
    totalScore: 100,
    createdAt: "2026-09-18T10:00:00.000Z",
  },
  {
    id: "exam-2",
    title: "《计算机网络》单元测验（一）",
    description: "OSI 参考模型、TCP/IP 协议族与常见网络设备。",
    durationMinutes: 45,
    status: "draft",
    questionIds: [],
    totalScore: 100,
    createdAt: "2026-09-19T09:30:00.000Z",
  },
];

module.exports = { users, questions, exams };
