本服务使用 Prisma + SQLite 进行开发期数据持久化，生产可平滑切换至 PostgreSQL。

快速开始
1. 安装依赖（根目录）
   - pnpm -r install
2. 生成客户端与推送 Schema（在 apps/api 目录）
   - pnpm run db:generate
   - pnpm run db:push
3. 启动 API
   - node src/main.js
4. 验证
   - POST /api/v1/results { type, title }
   - POST /api/v1/results/:id/submit
   - GET  /api/v1/reviews?stage=unit&status=pending

切换到 PostgreSQL（可选）
1. 设置环境变量（apps/api/.env）
   - DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
2. 更新数据结构
   - pnpm run db:push
3. 重启 API

注意
- 当前 schema 位于 prisma/schema.prisma
- 生产请使用 migrate（prisma migrate），开发期可用 db push 快速迭代
