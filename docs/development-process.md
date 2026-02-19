# 开发流程阶段与输出清单（基于技能分工）

> 适用于本仓库（Express + Prisma + PostgreSQL + Vue3 + Vite），结合工程内已落地规范与测试工程。每个阶段列出“目标、参与角色（对应技能）、主要活动、产出物与通过标准”。

## 0. 项目启动与治理
- 目标：确立范围、角色、计划与度量基线
- 角色：产品负责人（product-manager-toolkit）、技术负责人（senior-architect/ct o-advisor）、QA（senior-qa）
- 活动：
  - 定义愿景、范围、OKR 与里程碑
  - 建立工作区、分支与提交规范、代码审查策略
  - 明确敏捷节奏与度量（速度、缺陷率、部署频率）
- 产出：
  - OKR/路线图
  - 仓库初始化与工作区配置、CI 基线
  - 度量基线与报告频率
- 通过标准：范围达成一致；工程与流程准备就绪

## 1. 需求与设计（Product/UX）
- 目标：形成清晰、可落地的需求与验收标准
- 角色：产品（product-manager-toolkit）、UX（ux-researcher-designer）
- 活动：
  - 用户旅程、用研摘要、优先级（RICE/WSJF）
  - 编写 PRD 与验收标准（Given-When-Then）
- 产出：
  - PRD、流程图、低/中保真原型
  - 验收标准清单
- 通过标准：需求可被开发与测试直接采用

## 2. 方案与规格（架构/安全/数据）
- 目标：冻结技术方案，明确边界与非功能
- 角色：架构（senior-architect/senior-backend/senior-frontend）、安全（senior-security）、数据（senior-data-engineer）
- 活动：
  - 系统架构与边界设计、ADR
  - 数据建模（ERD/Prisma schema）、迁移策略
  - API 契约、错误码、分页/幂等/速率限制策略
  - 威胁建模与安全基线（鉴权、输入校验、依赖安全）
- 产出：
  - 架构图、ADR、API 契约（OpenAPI/接口文档）
  - 数据库 Schema 与迁移计划
  - 安全清单与修复计划
- 通过标准：评审通过；关键风险有对策与回滚方案

## 3. 开发准备（DevOps/质量）
- 目标：搭建稳定可复用的开发与验证环境
- 角色：DevOps（senior-devops）、QA（senior-qa）、TDD（tdd-guide）
- 活动：
  - 本地与容器环境：PostgreSQL/Redis/MinIO（可选）
  - 质量基线：Lint、TS 检查、单测框架、E2E 基础
  - 流水线/缓存/制品与版本策略
- 产出：
  - Compose 与脚本、环境变量模板
  - 测试骨架（Vitest/Playwright）与覆盖率阈值
  - CI 基线（构建/测试/制品）
- 通过标准：开发与测试环境一键拉起并可运行测试

## 4. 实现（前后端/数据）
- 目标：按规格高质量完成功能
- 角色：后端（senior-backend）、前端（senior-frontend）、数据库（database-designer）
- 活动：
  - 后端：Express 路由、Prisma 访问、分页/幂等/健康探针
  - 前端：页面与路由、Vite 代理、表单校验、文件上传
  - 数据库：索引/唯一约束/回滚脚本
- 产出：
  - 功能代码与单元测试、接口契约实现
  - 数据库迁移与回滚脚本
  - 变更记录（CHANGELOG/Release Notes 草稿）
- 通过标准：单元测试通过、代码评审通过、静态检查通过

## 5. 测试（功能/E2E/性能/安全）
- 目标：验证功能正确性与系统可用性
- 角色：QA（senior-qa）
- 活动：
  - 测试计划与用例（正向/负向/边界）
  - API 测试（Vitest/接口）、E2E（Playwright）、覆盖率分析
  - 性能基线（接口延迟、列表分页）、安全扫描与依赖审计
- 产出：
  - 测试计划、用例与测试报告
  - 缺陷单与修复验证
  - 覆盖率报告与改进项
- 通过标准：P0=0，P1≤1 且有计划；覆盖率达阈值；性能与安全通过基线

## 6. 发布（Release）
- 目标：安全可回滚地交付
- 角色：DevOps（senior-devops）、负责人（cto-advisor）
- 活动：
  - 版本号与制品、变更日志
  - 数据迁移与回滚脚本校验
  - 渐进发布/灰度与回滚预案演练
- 产出：
  - 发布说明、制品与镜像
  - 变更脚本与回滚验证记录
- 通过标准：演练通过；回滚 1 步即可恢复

## 7. 运行与观测（Operate）
- 目标：确保可用性与可观测性
- 角色：DevOps、后端
- 活动：
  - 监控/日志/追踪（healthz、错误率、吞吐）
  - 告警阈值与值班机制
  - 运行手册/常见故障与排错
- 产出：
  - 仪表盘与告警配置
  - Runbook/FAQ
- 通过标准：SLO 达标；高优先级告警闭环

## 8. 迭代与改进（Improve）
- 目标：闭环与持续改进
- 角色：全员
- 活动：
  - 迭代回顾与教训总结
  - 技术债登记与优先级（tech-debt-tracker）
  - 指标复盘（部署频率、Lead Time、缺陷率）
- 产出：
  - 回顾记录与行动项
  - 下一迭代计划与指标目标

---

## 阶段产出物清单（可直接复用的模板/路径）
- 需求/设计
  - PRD/验收标准（docs/ 下新建 prd.md、acceptance.md）
  - 流程与原型（链接/截图）
- 方案/规格
  - 架构图与 ADR（docs/architecture.md、docs/adr/）
  - 数据库 Schema 与迁移计划（apps/api/prisma/schema.prisma、migrations/）
  - API 契约/错误码（docs/api-contract.md）
  - 威胁建模与安全清单（docs/threat-model.md）
- 开发准备
  - Compose 与环境说明（infra/docker、docs/commands.md）
  - 质量基线与覆盖率阈值（tests/vitest.config.ts）
  - E2E 配置（tests/playwright.config.ts、tests/.env）
- 实现
  - 后端主入口与路由（apps/api/src/main.js）
  - 前端页面与路由（apps/frontend/src/pages/*、src/router/index.ts）
  - 迁移脚本与回滚说明（docs/db-migration.md）
- 测试
  - API 用例（tests/api/*.ts）
  - E2E 用例（tests/e2e/*.spec.ts）
  - 测试报告（tests/test-results/）
- 发布/运维
  - 发布说明（CHANGELOG.md / Release Notes）
  - 健康探针/监控（/healthz?db=1、监控脚本）
  - Runbook（docs/runbook.md）

---

## 本项目快速指引（与现有实现对齐）
- 启动基础设施
  - docker compose up -d postgres
- 后端（apps/api）
  - npx -y prisma@5.22.0 generate --schema ./prisma/schema.prisma
  - npx -y prisma@5.22.0 db push --schema ./prisma/schema.prisma
  - node apps\api\src\main.js
- 前端（apps/frontend）
  - pnpm --filter ./apps/frontend dev（/api、/static 已代理到 3000）
- 测试（tests）
  - pnpm --filter ./tests install
  - pnpm --filter ./tests exec npx playwright install
  - pnpm --filter ./tests run test:api
  - pnpm --filter ./tests run test:e2e
- 关键规范
  - 退回后需上传附件≥1 才允许再次提交
  - 附件类型/大小限制：PNG/JPEG/PDF，≤10MB
  - API 响应 no-store，避免 304 导致前端不刷新

---

## 度量与质量门禁
- 指标
  - 覆盖率（单测/E2E）：≥ 80% / 关键路径全覆盖
  - 接口性能（P95）：列表 ≤ 200ms（本地基线）
  - 缺陷红线：P0=0；P1≤1 且有回补计划
- 门禁
  - Lint/TS/单测 必须通过；安全/依赖扫描无高危
  - 迁移脚本具备回滚验证

---

## 附：角色与技能映射
- 产品：product-manager-toolkit
- 架构/技术负责人：senior-architect / cto-advisor
- 后端：senior-backend
- 前端：senior-frontend
- 数据库：database-designer
- QA/测试：senior-qa、tdd-guide
- DevOps/运维：senior-devops
- 安全：senior-security
