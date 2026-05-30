# Hackerthon

四人协作黑客松项目仓库。

## 分支模型

- `main`：稳定可交付分支，只合并经过验证的版本。
- `develop`：日常集成分支，所有功能分支先合并到这里。
- `feature/frontend`：前端页面、交互与视觉呈现。
- `feature/backend`：后端接口、数据存储与服务逻辑。
- `feature/ai-core`：算法、模型、核心业务逻辑。
- `feature/integration-deploy`：集成测试、部署、演示材料与发布。

## 基本流程

1. 每个人从 `develop` 拉取最新代码。
2. 在自己的 `feature/*` 分支开发。
3. 完成一个小功能就提交一次 commit。
4. 通过 Pull Request 合并到 `develop`。
5. `develop` 稳定后再合并到 `main`。
