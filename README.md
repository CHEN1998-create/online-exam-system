# 在线考试与管理系统

支持学生在线答题、管理员出卷、题库维护、提交记录与成绩统计的在线考试系统。

## 在线演示与交付信息

- **在线演示**：https://online-exam-system-six-delta.vercel.app/
- **源码仓库**：https://github.com/CHEN1998-create/online-exam-system
- **PRD 文档**：仓库根目录 `PRD (1).md`

### 演示账号

| 角色 | 账号 | 密码 |
|------|------|------|
| 学生 | `student@demo.com` | `123456` |
| 管理员 | `admin@demo.com` | `123456` |

### 核心功能

- 登录鉴权 + 学生/管理员角色权限隔离
- 学生端：考试列表 → 答题（倒计时、答题卡、单选/判断/简答）→ 提交 → 成绩
- 自动判分（单选/判断），简答题人工复核
- 管理端：概览统计、题库增删改查、考试创建/发布、提交记录查看/复核

## 技术栈

- **前端**：Next.js 15（App Router）+ TypeScript + Tailwind CSS + shadcn/ui
- **后端**：Express + JWT 鉴权 + RBAC 角色控制
- **数据库**：PostgreSQL（Supabase 或任意托管 PostgreSQL）；本地开发可用内存模式（无需装库）

## 核心页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 官网首页 | `/` | 平台介绍、功能特性、学生/管理员双入口 |
| 登录页 | `/login` | 学生/管理员角色切换 + 登录 |
| 学生考试列表 | `/student/exams` | 可参加的已发布考试列表 |
| 学生答题页 | `/student/exams/:id` | 倒计时 + 答题卡 + 单选/判断/简答 + 交卷 |
| 学生成绩页 | `/student/history` | 历史成绩与状态（待复核/已评阅） |
| 管理后台概览 | `/admin` | 统计卡片 + 成绩分布 + 最近提交 |
| 考试管理 | `/admin/exams` | 创建/编辑/发布/关闭/删除考试 |
| 题库管理 | `/admin/questions` | 增删改题目 + 按题型筛选 |
| 提交记录 | `/admin/submissions` | 查看提交详情 + 人工复核 |

## 目录结构

```
├─ src/                          # 前端（Next.js）
│  ├─ middleware.ts              # 前端路由守卫（未登录跳 /login）
│  ├─ lib/auth.ts                # 登录态 cookie 读写
│  └─ app/                       # 页面（首页/登录/学生端/管理端）
├─ server/                       # 后端（Express）
│  ├─ src/
│  │  ├─ index.js                # 入口
│  │  ├─ config.js               # 读取环境变量
│  │  ├─ db/                     # 数据层（memory.js / postgres.js / schema.sql）
│  │  ├─ middleware/             # authenticate / authorize / errorHandler
│  │  ├─ controllers/            # 控制器
│  │  ├─ services/               # 业务逻辑（含判分）
│  │  └─ routes/                 # 路由
│  ├─ .env.example               # 后端环境变量模板
│  └─ Procfile                   # Railway/Render 启动配置
├─ .env.local                    # 前端环境变量（本地）
├─ .env.example                  # 前端环境变量模板
└─ render.yaml                   # Render 部署配置
```

## 本地快速开始

### 1. 安装依赖（前端 + 后端统一在根目录）

```bash
npm install
```

### 2. 启动后端（端口 4000）

```bash
copy server\.env.example server\.env    # Windows；Mac/Linux 用 cp
npm run server:dev                      # 开发模式（热重载）；或 npm run server:start
```

> 未设置 `DATABASE_URL` 时使用**内存存储**（重启即重置），适合本地开发。

### 3. 启动前端（端口 3000）

```bash
copy .env.example .env.local   # Windows；Mac/Linux 用 cp
npm run dev
```

浏览器打开 http://localhost:3000

演示账号（密码均为 `123456`）：
- 学生：`student@demo.com`
- 管理员：`admin@demo.com`

## 环境变量

### 后端 `server/.env`

| 变量 | 必填 | 说明 |
|------|------|------|
| `PORT` | 否 | 服务端口，默认 4000 |
| `JWT_SECRET` | **是** | JWT 签名密钥，生产务必改为长随机串 |
| `JWT_EXPIRES_IN` | 否 | 令牌有效期，默认 7d |
| `CORS_ORIGIN` | **是** | 允许跨域的前端地址（生产填前端域名） |
| `DATABASE_URL` | 生产必填 | PostgreSQL 连接串；不填则用内存 |
| `DB_SSL` | 否 | 数据库是否 SSL，托管库填 true |

### 前端 `.env.local`

| 变量 | 说明 |
|------|------|
| `NEXT_PUBLIC_API_BASE_URL` | 后端地址，本地 `http://localhost:4000`，生产填后端域名 |

## 数据库（Supabase PostgreSQL）

后端通过 `DATABASE_URL` 自动切换存储：**有则用 PostgreSQL，无则用内存**。

### 配置 Supabase

1. 到 [supabase.com](https://supabase.com) 创建项目
2. 项目首页点 **「Connect」** 按钮 → 选 **「Transaction pooler」** → 复制 **URI** 连接串
3. 把连接串填到后端 `DATABASE_URL`

> 后端启动时会自动建表（建表 SQL 已内联在代码里）并在用户表为空时写入演示账号。

## 部署（Vercel + Supabase）

前端（Next.js）和后端（Express，通过 serverless-http 包装成 Next.js API 路由）**一起部署到 Vercel**，数据库用 Supabase。

### 1. 推送代码到 GitHub

```bash
git push
```

### 2. 部署到 Vercel

1. [vercel.com](https://vercel.com) → 用 GitHub 登录 → **Add New → Project** → Import 仓库
2. 框架自动识别 Next.js → Deploy

### 3. 配置环境变量（Vercel → Settings → Environment Variables）

| 变量 | 值 |
|------|-----|
| `JWT_SECRET` | 一段长随机字符串 |
| `DATABASE_URL` | Supabase 的 **Transaction pooler** 连接串（形如 `postgresql://...pooler.supabase.com:6543/postgres`） |
| `DB_SSL` | `true` |

> ⚠️ 不要设置 `NEXT_PUBLIC_API_BASE_URL`，前端会自动用同源相对路径访问 `/api/*`（前后端同域）。

### 4. 上线后核对

1. 打开 Vercel 域名，用 `admin@demo.com / 123456` 登录
2. 新建题目/考试后刷新仍在 → 数据已持久化到 Supabase

## 测试

### 登录并拿 token

```powershell
$base = "http://localhost:4000"
$stu = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType 'application/json' -Body '{"email":"student@demo.com","password":"123456"}'
$adm = Invoke-RestMethod -Method Post -Uri "$base/api/auth/login" -ContentType 'application/json' -Body '{"email":"admin@demo.com","password":"123456"}'
$stuH = @{ Authorization = "Bearer $($stu.data.token)" }
$admH = @{ Authorization = "Bearer $($adm.data.token)" }
```

### 关键接口速查

| 方法 | 路径 | 权限 | 说明 |
|------|------|------|------|
| POST | `/api/auth/login` | 公开 | 登录 |
| GET | `/api/auth/me` | 登录 | 当前用户 |
| GET | `/api/admin/exams` | 管理员 | 考试列表 |
| POST | `/api/admin/exams` | 管理员 | 创建考试 |
| PATCH | `/api/admin/exams/:id` | 管理员 | 更新/发布 |
| POST | `/api/admin/questions` | 管理员 | 新增题目 |
| PUT | `/api/admin/questions/:id` | 管理员 | 编辑题目 |
| GET | `/api/admin/submissions` | 管理员 | 所有提交 |
| POST | `/api/admin/submissions/:id/review` | 管理员 | 复核打分 |
| GET | `/api/student/exams` | 学生 | 已发布考试 |
| POST | `/api/student/exams/:id/start` | 学生 | 开始考试 |
| POST | `/api/student/submissions/:id/submit` | 学生 | 提交（自动判分） |
| GET | `/api/student/history` | 学生 | 历史成绩 |

### 判分规则

- 单选/判断：答案与标准答案一致则得分
- 简答：只保存答案，`score = null`、`reviewed = false`，管理员复核后置 `reviewed = true`

## 部署前检查清单

- [ ] 环境变量齐全（`JWT_SECRET`、`DATABASE_URL`、`CORS_ORIGIN`、`NEXT_PUBLIC_API_BASE_URL`）
- [ ] 前后端 API 地址互指正确（前端指向后端域名，后端 CORS 指向前端域名）
- [ ] 生产环境能正常登录（token 写入 cookie，路由守卫生效）
- [ ] 管理员账号能真实访问后台（`admin@demo.com` 登录后进入 `/admin`）
- [ ] README 包含启动、部署、测试说明（本文件）

