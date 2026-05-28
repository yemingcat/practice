本服务使用 Prisma + PostgreSQL 进行数据持久化。

快速开始
1. 启动 PostgreSQL（使用 Docker）
   - docker run -d --name perf-db -p 5432:5432 -e POSTGRES_USER=perf -e POSTGRES_PASSWORD=perf123 -e POSTGRES_DB=perfdb postgres:15-alpine
2. 创建 apps/api/.env 文件
   - DATABASE_URL="postgresql://perf:perf123@localhost:5432/perfdb?schema=public"
3. 安装依赖（根目录）
   - pnpm -r install
4. 生成客户端与推送 Schema（在 apps/api 目录）
   - pnpm run db:generate
   - pnpm run db:push
5. 填充示例数据（可选）
   - pnpm run db:seed
6. 启动 API
   - node src/main.js
7. 验证
   - POST /api/v1/results { type, title }
   - POST /api/v1/results/:id/submit
   - GET  /api/v1/reviews?stage=unit&status=pending

注意
- 当前 schema 位于 prisma/schema.prisma
- 生产请使用 migrate（prisma migrate），开发期可用 db push 快速迭代
