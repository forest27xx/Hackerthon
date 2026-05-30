# Git 协作流程

## 第一次拉取

```bash
git clone git@github.com:forest27xx/Hackerthon.git
cd Hackerthon
git checkout develop
```

## 每天开始开发前

```bash
git checkout develop
git pull origin develop
git checkout feature/frontend   # 换成自己的分支
git merge develop
```

## 提交代码

```bash
git status
git add .
git commit -m "feat: describe your change"
git push origin feature/frontend # 换成自己的分支
```

## 合并方式

在 GitHub 上创建 Pull Request：

```text
feature/your-module -> develop
```

至少由另一名成员检查后再合并。

## 分支职责

| 分支 | 负责人 | 内容 |
|---|---|---|
| `feature/frontend` | 待定 | 页面、交互、样式 |
| `feature/backend` | 待定 | API、数据、服务 |
| `feature/ai-core` | 待定 | 模型、算法、核心逻辑 |
| `feature/integration-deploy` | 待定 | 集成、测试、部署、演示 |
