-- 在线考试系统数据库结构（Supabase PostgreSQL / 任意托管 PostgreSQL）
-- 可在 Supabase SQL Editor 中直接执行，或由后端启动时自动执行（幂等）

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
