# 常用操作命令

> 所有命令默认在 Windows PowerShell 下执行；路径按当前仓库结构组织。

## 包管理与安装

- 启用 pnpm
  - `corepack enable`
  - `corepack prepare pnpm@8.15.4 --activate`
- 工作区安装（根目录）
  - `pnpm -r install`
- 单包安装
  - API：`pnpm --filter ./apps/api install`
  - 前端：`pnpm --filter ./apps/frontend install`

## 开发启动

- 后端（Express + Prisma）
  - `node apps\api\src\main.js`
  - 健康检查：`http://localhost:3000/health`
- 前端（Vite）
  - `pnpm --filter ./apps/frontend dev`
  - 打开：`http://localhost:5173/`

## Prisma（数据库）

- 生成客户端与推送结构（apps/api）
  - `pnpm run db:generate`
  - `pnpm run db:push`
- 使用固定版本 CLI（apps/api）
  - `npx -y prisma@5.22.0 generate --schema ./prisma/schema.prisma`
  - `npx -y prisma@5.22.0 db push --schema ./prisma/schema.prisma`
- 常用校验
  - 清理会话变量：`$env:DATABASE_URL = $null`
  - 验证 schema：`npx -y prisma@5.22.0 validate --schema ./prisma/schema.prisma`

## Docker 基础设施（Postgres/Redis/MinIO）

- 进入目录：`cd H:\develop\AI\infra\docker`
- 启动基础服务：
  - `docker compose up -d postgres redis minio`
- 查看状态与日志：
  - `docker compose ps`
  - `docker compose logs -f postgres`
- PostgreSQL 连接验证：
  - `docker compose exec postgres psql -U postgres -d perfdb -c "select version();"`
- 常用查询：
  - 行数：`docker compose exec postgres psql -U postgres -d perfdb -c "select count(*) from ""Result"";"`
  - 审核汇总：`docker compose exec postgres psql -U postgres -d perfdb -c "select stage,decision,count(*) from ""Review"" group by stage,decision order by 1,2;"`

## API 快速联调（示例）

- 列表：
  - `curl http://localhost:3000/api/v1/results`
- 新建草稿：
  - `curl -H "Content-Type: application/json" -d "{\"type\":\"论文\",\"title\":\"示例\"}" http://localhost:3000/api/v1/results`
- 提交初审：
  - `curl -X POST http://localhost:3000/api/v1/results/<id>/submit`
- 待审列表：
  - `curl "http://localhost:3000/api/v1/reviews?stage=unit&status=pending"`
- 审核结论：
  - `curl -H "Content-Type: application/json" -d "{\"result_id\":\"<id>\",\"stage\":\"unit\",\"decision\":\"approved\"}" http://localhost:3000/api/v1/reviews`
- 补充材料上传（被退回时）：
  - `curl -F "files=@C:\path\to\file.png" http://localhost:3000/api/v1/results/<id>/attachments`

## 常见故障处理

- 端口占用
  - 查询：`Get-NetTCPConnection -LocalPort 3000 | Select LocalAddress,LocalPort,State,OwningProcess`
  - 结束：`Stop-Process -Id <PID> -Force`
- pnpm 报 EBUSY（文件被占用）
  - 关闭 node 进程：`Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force`
  - 为目录添加 Defender 排除（管理员）：
    - `Add-MpPreference -ExclusionPath "H:\develop\AI\node_modules"`
    - `$store = (pnpm store path); if ($store) { Add-MpPreference -ExclusionPath $store }`
  - 重新安装：`pnpm -r install`
- Prisma 旧客户端/版本切换失败
  - 删除生成目录（可选）：删除 `H:\develop\AI\node_modules\.pnpm\@prisma+client...\node_modules\.prisma\client`
  - 重新生成与推送（见上）

## 附件相关

- 列表：`GET /api/v1/results/:id/attachments`
- 上传：`POST /api/v1/results/:id/attachments`（multipart，字段名 `files`）
- 删除：`DELETE /api/v1/attachments/:id`
- 访问：`/static/{resultId}/{文件名}`

## 版本固定与端口

- 固定 Vite 端口并自动打开（已配置）：
  - `http://localhost:5173/`
- 切换后端端口（临时）：
  - `$env:PORT=3001; node apps\api\src\main.js`
  - 前端直连基址（可选）：在 `apps/frontend/.env.development` 设置 `VITE_API_BASE_URL=http://localhost:3001`

## 测试工程

- 目录：`tests/`
- 运行前提：
  - 后端已运行：`http://localhost:3000/`
  - 前端已运行：`http://localhost:5173/`
- 安装依赖（tests 包）：
  - `cd tests && pnpm install` 或 `pnpm --filter ./tests install`
- 运行 API 测试（Vitest）：
  - 根目录：`pnpm --filter ./tests run test:api`
  - tests 目录：`pnpm run test:api`
  - 覆盖 BASE_URL（PowerShell）：`$env:BASE_URL="http://localhost:3000"; pnpm --filter ./tests run test:api`
- 运行 E2E（Playwright）：
  - 根目录：`pnpm --filter ./tests run test:e2e`
  - tests 目录：`pnpm run test:e2e`
  - 覆盖 WEB_BASE_URL（PowerShell）：`$env:WEB_BASE_URL="http://localhost:5173"; pnpm --filter ./tests run test:e2e`
  - 安装浏览器（首次执行）：`pnpm --filter ./tests exec npx playwright install`
  
> 也可在 `tests/.env` 中持久化 BASE_URL 与 WEB_BASE_URL，无需每次设置环境变量。
  
