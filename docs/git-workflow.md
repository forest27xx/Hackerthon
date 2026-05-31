# Git 工作流

项目已经完成黑客松阶段开发，仓库从多人并行开发模式收束为作品集维护模式。

## 当前分支约定

| 分支 | 用途 |
|---|---|
| `main` | 项目源码主分支，也是对外展示和面试讲解时默认查看的版本。 |
| `gh-pages` | GitHub Pages 静态部署产物分支，不在这里手写源码。 |

历史开发分支已经合入 `main`，后续不再长期保留 `develop` 或多个 `feature/*` 分支。

## 日常修改

小改动可以直接在本地创建短分支：

```bash
git checkout main
git pull origin main
git checkout -b feature/readme-polish
```

提交前检查：

```bash
cd modules/frontend
npm test
npm run build
```

提交并推送：

```bash
git add README.md docs modules/frontend
git commit -m "docs: polish project portfolio"
git push origin feature/readme-polish
```

然后在 GitHub 上开 Pull Request，目标分支为 `main`。

## 部署

前端是静态 Vite 项目：

```bash
cd modules/frontend
npm run build -- --base ./
```

部署产物来自：

```text
modules/frontend/dist/
```

当前公网演示通过 `gh-pages` 分支发布：

```text
https://forest27xx.github.io/Hackerthon/v5-36/
```

注意：GitHub Pages 项目站点部署在 `/Hackerthon/` 子路径下，音频和静态资源路径必须使用相对路径或 `import.meta.env.BASE_URL`，不要写死为 `/audio/...`。

## 交付前检查清单

- `npm test` 通过。
- `npm run build` 通过。
- 手机端能打开公网链接。
- 点击页面后能播放 BGM、按钮音效和订单语音。
- 完整走通：选择目的 -> 点单 -> 下单 -> 订单事件 -> 结果卡。
