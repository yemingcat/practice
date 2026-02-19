# 开发指导书（Perf Reporting Monorepo）

## 1. 项目概览
- 目标：支撑“成果填报 → 单位初审/终审 → 报表”的端到端流程，并支持被退回后的补充材料上传（图片/PDF）。
- 模块：
  - Backend（Express + Prisma + PostgreSQL）：提供 REST API 与静态资源服务
  - Frontend（Vue3 + Ant Design Vue + Vite）：工作台、审核、报表与补充材料页面
  - Infra（Docker Compose）：PostgreSQL、Redis、MinIO（可选）
  - Tests（Vitest + Playwright）：API 与 E2E 测试工程

## 2. 技术栈与关键版本
- Node.js v24.x，pnpm 8.x（corepack 管理）
- Backend：Express 4.x，@prisma/client / prisma 5.22.x
- DB：PostgreSQL（推荐 16/17-alpine）
- Frontend：Vue 3 + Vite 5 + Ant Design Vue
- E2E：Playwright

## 3. 目录结构
- apps/
  - api/ 后端服务（Express + Prisma）
  - frontend/ 前端（Vite）
- infra/docker/ Docker Compose 基础设施
- docs/ 文档（commands.md、development-guide.md）
- tests/ 测试工程（API + E2E）

## 4. 环境准备
- 启用 pnpm
  - corepack enable
  - corepack prepare pnpm@8.15.4 --activate
- 安装依赖（工作区根目录）
  - pnpm -r install

## 5. 基础设施（PostgreSQL）
- 推荐使用 Compose（infra/docker）：
  - docker compose up -d postgres
  - 如跨大版本升级（15 → 16/17），采用“备份→新卷→恢复”的方案，避免就地挂载旧数据目录
- 连接检查：
  - docker compose exec postgres psql -U postgres -d perfdb -c "select version();"

## 6. 数据库与 Prisma
- 数据源：apps/api/prisma/schema.prisma 使用 provider = "postgresql"
- 环境变量：
  - apps/api/.env 或 apps/api/prisma/.env（保留其一）：DATABASE_URL="postgresql://postgres:postgres@localhost:5432/perfdb?schema=public"
- 客户端生成与结构推送（apps/api）：
  - npx -y prisma@5.22.0 generate --schema ./prisma/schema.prisma
  - npx -y prisma@5.22.0 db push --schema ./prisma/schema.prisma
- 关键模型与索引
  - Result：@@index([status, created_at])
  - Review：@@unique([result_id, stage])（同一阶段仅一条有效记录）
  - Attachment：@@index([result_id, created_at])

## 7. 后端服务（Express）
- 入口：apps/api/src/main.js
- 端口：3000（/health、/healthz?db=1）
- 路由：
  - 结果
    - GET /api/v1/results?status&limit&cursor
    - POST /api/v1/results（创建草稿）
    - PATCH /api/v1/results/:id（更新草稿）
    - POST /api/v1/results/:id/submit（提交初审；退回后需附件≥1）
  - 审核
    - GET /api/v1/reviews?stage&status&limit&cursor
    - POST /api/v1/reviews（提交结论：approved / rejected）
  - 报表
    - GET /api/v1/reports/summary
  - 附件（仅退回状态，且最近结论为 rejected）
    - GET /api/v1/results/:id/attachments（列表）
    - POST /api/v1/results/:id/attachments（multipart，files[]；PNG/JPEG/PDF ≤10MB）
    - DELETE /api/v1/attachments/:id（删除）
    - GET /api/v1/attachments/:id/download（下载，UTF-8 文件名）
  - 静态
    - /static/{resultId}/{文件名}（apps/api/uploads 下）
- 安全与约束
  - 上传文件类型白名单与大小限制
  - API 响应 Cache-Control: no-store（避免 304 导致前端不刷新）

## 8. 前端应用（Vite）
- 启动：pnpm --filter ./apps/frontend dev（默认 5173）
- 代理：vite.config.ts 将 /api 与 /static 代理到 http://localhost:3000
- HTTP 基址：services/http.ts 默认空字符串，接口路径使用 /api/v1/…（避免 /api/api/...）
- 页面：
  - LabInbox：实验室工作台（退回记录提供“补充材料”入口）
  - FillForm：成果填报（提交初审后跳转二级单位）
  - UnitInbox：二级单位审核（阶段/状态筛选、入口）
  - ReviewUnit：审核面板（通过/退回）
  - Supplement：补充材料（上传/列表/删除/下载）
  - Reports：汇总报表

## 9. 联调与验证
- 后端：node apps\api\src\main.js → http://localhost:3000/health
- 前端：pnpm --filter ./apps/frontend dev NB：使用 5173 访问
- 常用请求（示例）
  - GET /api/v1/results
  - POST /api/v1/results（{type,title}）
  - POST /api/v1/results/:id/submit
  - GET /api/v1/reviews?stage=unit&status=pending
  - POST /api/v1/reviews（{result_id,stage,decision,comment}）
  - POST /api/v1/results/:id/attachments（multipart files）

## 10. 测试工程（tests）
- 位置：tests/（工作区子包；已加入 pnpm-workspace）
- 变量（tests/.env）：
  - BASE_URL=http://localhost:3000
  - WEB_BASE_URL=http://localhost:5173
- 安装依赖：
  - pnpm --filter ./tests install
- API 测试（Vitest）：
  - pnpm --filter ./tests run test:api
- E2E（Playwright）：
  - 首次安装浏览器：pnpm --filter ./tests exec npx playwright install
  - 运行：pnpm --filter ./tests run test:e2e
- 已提供用例：
  - 冒烟渲染（/lab、/unit、/reports）
  - 审核面板渲染（单位阶段）
  - 补充材料上传（退回→上传→列表可见）
  - 注：完整闭环用例已拆分为轻量用例以提升稳定性

## 11. 常见问题与排错
- Prisma 客户端/Provider 不一致（报 file:）：
  - 重新 generate；必要时删除 node_modules 下 .prisma/client
- EPERM/EBUSY（Windows）：
  - 结束 Node 进程；必要时为 node_modules 与 pnpm store 添加 Defender 排除
- Vite 代理：
  - 确保同时代理 /api 与 /static 到 3000
- 304/缓存：
  - 服务端设置 no-store；前端请求可附加 t=Date.now() 强制刷新
- Postgres 升级大版本：
  - 采用 pg_dumpall 备份→新卷→恢复；避免复用旧数据目录

## 12. 安全与规范
- 秘钥与连接串仅保存在 .env，不提交到版本库
- 上传：
  - 类型：image/png、image/jpeg、application/pdf
  - 大小：≤10MB；单次最多 10 个
- 访问控制：
  - 下载接口设置 Content-Type 与 UTF-8 文件名；静态目录仅在 /uploads/{resultId} 之下
- 业务规则：
  - 被退回才允许上传；退回后无附件禁止再次提交
  - 审核阶段唯一性（result_id + stage）

## 13. 版本与变更要点
- 数据库由 SQLite → PostgreSQL（Prisma provider 调整）
- 新增附件模型/接口、下载与前端页面
- 列表分页改为 limit/cursor
- 健康探针支持 DB 连通性探测

## 14. 快捷命令与参考
- 常用命令见：docs/commands.md
- 关键文件：
  - Backend：apps/api/src/main.js
  - Prisma：apps/api/prisma/schema.prisma
  - Frontend 路由/页面：apps/frontend/src/router/index.ts、apps/frontend/src/pages/
  - 测试：tests/api/*.ts、tests/e2e/*.spec.ts

