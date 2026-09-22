const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

// 建表 SQL（内联在代码里，避免 serverless 部署时读不到 schema.sql 文件）
const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'admin'))
);

CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('single', 'judge', 'short')),
  stem TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  answer TEXT NOT NULL DEFAULT '',
  score INTEGER NOT NULL DEFAULT 0,
  category TEXT DEFAULT '',
  difficulty TEXT DEFAULT 'easy'
);

CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'draft',
  total_score INTEGER NOT NULL DEFAULT 0,
  question_ids JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  exam_id TEXT NOT NULL REFERENCES exams(id),
  student_id TEXT NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'in_progress',
  reviewed BOOLEAN NOT NULL DEFAULT false,
  answers JSONB NOT NULL DEFAULT '[]',
  objective_score INTEGER NOT NULL DEFAULT 0,
  score INTEGER,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
`;

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      // 生产托管库（Supabase 等）需 SSL；本地裸连可设 DB_SSL=false
      ssl:
        process.env.DB_SSL === "false"
          ? false
          : { rejectUnauthorized: false },
    });
  }
  return pool;
}

// 建表 + 首次种子
async function init() {
  const p = getPool();
  await p.query(CREATE_TABLES_SQL);

  const { rowCount } = await p.query("SELECT 1 FROM users LIMIT 1");
  if (rowCount === 0) {
    const hash = bcrypt.hashSync("123456", 10);
    await p.query(
      `INSERT INTO users (id, name, email, password_hash, role) VALUES
        ($1,$2,$3,$4,'student'),($5,$6,$7,$8,'admin')`,
      [
        "u-student", "张伟", "student@demo.com", hash,
        "u-admin", "管理员", "admin@demo.com", hash,
      ]
    );
  }
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
  };
}

function mapQuestion(row) {
  return {
    id: row.id,
    type: row.type,
    stem: row.stem,
    options: row.options || [],
    answer: row.answer,
    score: row.score,
    category: row.category,
    difficulty: row.difficulty,
  };
}

function mapExam(row) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    durationMinutes: row.duration_minutes,
    status: row.status,
    totalScore: row.total_score,
    questionIds: row.question_ids || [],
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

function mapSubmission(row) {
  return {
    id: row.id,
    examId: row.exam_id,
    studentId: row.student_id,
    status: row.status,
    reviewed: row.reviewed,
    answers: row.answers || [],
    objectiveScore: row.objective_score,
    score: row.score,
    submittedAt: row.submitted_at
      ? new Date(row.submitted_at).toISOString()
      : null,
    reviewedAt: row.reviewed_at
      ? new Date(row.reviewed_at).toISOString()
      : null,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : null,
  };
}

const repo = {
  init,

  nextId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  },

  // users
  async findUserByEmail(email) {
    const r = await getPool().query("SELECT * FROM users WHERE email = $1", [email]);
    return r.rows[0] ? mapUser(r.rows[0]) : undefined;
  },
  async findUserById(id) {
    const r = await getPool().query("SELECT * FROM users WHERE id = $1", [id]);
    return r.rows[0] ? mapUser(r.rows[0]) : undefined;
  },

  // questions
  async listQuestions({ type } = {}) {
    let sql = "SELECT * FROM questions";
    const params = [];
    if (type) {
      sql += " WHERE type = $1";
      params.push(type);
    }
    sql += " ORDER BY id";
    const r = await getPool().query(sql, params);
    return r.rows.map(mapQuestion);
  },
  async getQuestion(id) {
    const r = await getPool().query("SELECT * FROM questions WHERE id = $1", [id]);
    return r.rows[0] ? mapQuestion(r.rows[0]) : undefined;
  },
  async findQuestionsByIds(ids) {
    if (!ids.length) return [];
    const r = await getPool().query(
      "SELECT * FROM questions WHERE id = ANY($1)",
      [ids]
    );
    const map = new Map(r.rows.map((row) => [row.id, mapQuestion(row)]));
    return ids.map((id) => map.get(id)).filter(Boolean);
  },
  async insertQuestion(q) {
    await getPool().query(
      `INSERT INTO questions (id, type, stem, options, answer, score, category, difficulty)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        q.id, q.type, q.stem, JSON.stringify(q.options || []),
        q.answer ?? "", q.score, q.category, q.difficulty,
      ]
    );
    return q;
  },
  async updateQuestion(id, patch) {
    const cur = await repo.getQuestion(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch };
    await getPool().query(
      `UPDATE questions SET type=$1, stem=$2, options=$3, answer=$4, score=$5, category=$6, difficulty=$7 WHERE id=$8`,
      [
        next.type, next.stem, JSON.stringify(next.options || []),
        next.answer, next.score, next.category, next.difficulty, id,
      ]
    );
    return next;
  },
  async removeQuestion(id) {
    await getPool().query("DELETE FROM questions WHERE id = $1", [id]);
    const exams = await getPool().query("SELECT id, question_ids FROM exams");
    for (const e of exams.rows) {
      const ids = (e.question_ids || []).filter((qid) => qid !== id);
      await getPool().query(
        "UPDATE exams SET question_ids = $1 WHERE id = $2",
        [JSON.stringify(ids), e.id]
      );
    }
  },

  // exams
  async listExams({ status } = {}) {
    let sql = "SELECT * FROM exams";
    const params = [];
    if (status) {
      sql += " WHERE status = $1";
      params.push(status);
    }
    sql += " ORDER BY created_at DESC";
    const r = await getPool().query(sql, params);
    return r.rows.map(mapExam);
  },
  async getExam(id) {
    const r = await getPool().query("SELECT * FROM exams WHERE id = $1", [id]);
    return r.rows[0] ? mapExam(r.rows[0]) : undefined;
  },
  async insertExam(e) {
    await getPool().query(
      `INSERT INTO exams (id, title, description, duration_minutes, status, total_score, question_ids)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        e.id, e.title, e.description, e.durationMinutes, e.status,
        e.totalScore, JSON.stringify(e.questionIds || []),
      ]
    );
    return e;
  },
  async updateExam(id, patch) {
    const cur = await repo.getExam(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch };
    await getPool().query(
      `UPDATE exams SET title=$1, description=$2, duration_minutes=$3, status=$4, total_score=$5, question_ids=$6 WHERE id=$7`,
      [
        next.title, next.description, next.durationMinutes, next.status,
        next.totalScore, JSON.stringify(next.questionIds || []), id,
      ]
    );
    return next;
  },
  async removeExam(id) {
    await getPool().query("DELETE FROM exams WHERE id = $1", [id]);
  },

  // submissions
  async insertSubmission(s) {
    await getPool().query(
      `INSERT INTO submissions (id, exam_id, student_id, status, reviewed, answers, objective_score, score, submitted_at, reviewed_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        s.id, s.examId, s.studentId, s.status, s.reviewed,
        JSON.stringify(s.answers || []), s.objectiveScore, s.score,
        s.submittedAt, s.reviewedAt,
      ]
    );
    return s;
  },
  async getSubmission(id) {
    const r = await getPool().query("SELECT * FROM submissions WHERE id = $1", [id]);
    return r.rows[0] ? mapSubmission(r.rows[0]) : undefined;
  },
  async updateSubmission(id, patch) {
    const cur = await repo.getSubmission(id);
    if (!cur) return undefined;
    const next = { ...cur, ...patch };
    await getPool().query(
      `UPDATE submissions SET status=$1, reviewed=$2, answers=$3, objective_score=$4, score=$5, submitted_at=$6, reviewed_at=$7 WHERE id=$8`,
      [
        next.status, next.reviewed, JSON.stringify(next.answers || []),
        next.objectiveScore, next.score, next.submittedAt, next.reviewedAt, id,
      ]
    );
    return next;
  },
  async listSubmissions() {
    const r = await getPool().query("SELECT * FROM submissions ORDER BY created_at DESC");
    return r.rows.map(mapSubmission);
  },
  async listSubmissionsByStudent(studentId) {
    const r = await getPool().query(
      "SELECT * FROM submissions WHERE student_id = $1 ORDER BY created_at DESC",
      [studentId]
    );
    return r.rows.map(mapSubmission);
  },
};

module.exports = repo;

