# 快乐下单事务所 / Happy Order Office

四人协作黑客松项目仓库。当前核心 demo 是一个 **Web 仿小程序的吃喝玩乐下单游戏**：前半段模拟奶茶/外卖小程序的点单爽感，后半段把“等待配送”改造成食品安全、健康生活、备注沟通、骑手安全相关的选择小游戏，最终生成可保存/分享的“快乐订单小票”和“美食人格 MBTI”结果卡。

这个项目不是做真实商业交易，而是做一个有故事、有互动、有传播点的 demo：用户在“下单”过程中获得选择、加料、凑单、combo、结果人格判断的心理奖励。

## 当前状态

- 已有可运行前端 demo：`modules/frontend`
- 技术栈：React + Vite + TypeScript + Vitest + html-to-image + lucide-react
- 已实现：
  - 今日下单目的选择
  - 仿小程序点单页
  - 商品分类、规格弹窗、购物车、combo 触发
  - 配送事件小游戏
  - 快乐/健康/安全等分数系统
  - 16 类美食人格 MBTI + 称号变体
  - 烫金风格订单小票 + 黑金人格结果卡
  - 保存结果卡 PNG、复制分享文案
- 仍需重点优化：
  - UI 细节继续贴近高质量小程序界面
  - 商品真实图片与图片命名整理
  - 商品内容、combo、结果文案扩量
  - 配送事件关卡变丰富
  - 最终结果卡视觉继续打磨
  - 后端/AI/部署模块接入

## 第一次拉取

如果 SSH 已配置：

```bash
git clone git@github.com:forest27xx/Hackerthon.git
cd Hackerthon
git checkout develop
```

如果 SSH 失败，可用 HTTPS：

```bash
git clone https://github.com/forest27xx/Hackerthon.git
cd Hackerthon
git checkout develop
```

## 前端启动

```bash
cd modules/frontend
npm install
npm run dev
```

浏览器打开：

```text
http://127.0.0.1:5173/
```

常用校验：

```bash
npm test
npm run build
```

## 仓库结构

```text
Hackerthon/
  README.md
  docs/
    git-workflow.md
    project-roadmap.md
    content-and-assets.md
  modules/
    frontend/              # React/Vite demo，目前主功能在这里
    backend/               # 后端 API、数据存储、服务逻辑
    ai-core/               # 人格算法、文案生成、推荐逻辑
    integration-deploy/    # 集成、部署、演示物料
```

## 分支模型

- `main`：稳定可交付版本。
- `develop`：日常集成分支。
- `feature/frontend`：前端页面、交互、样式、前端状态。
- `feature/backend`：API、数据存储、服务端逻辑。
- `feature/ai-core`：算法、人格规则、推荐和文案生成。
- `feature/integration-deploy`：集成测试、部署、演示材料。

每天开始：

```bash
git checkout develop
git pull origin develop
git checkout feature/frontend
git merge develop
```

提交：

```bash
git status
git add .
git commit -m "feat: describe your change"
git push origin feature/frontend
```

合并：在 GitHub 上开 PR，目标为 `develop`。

## 四人建议分工

### A. 内容与商品策划

负责 `modules/frontend/src/data/catalog.ts` 里的菜单、商品标签、价格、属性、combo 文案，以及真实图片素材的命名表。

重点任务：
- 商品扩量到 60+，每个商品有清晰标签。
- 奶茶/咖啡/甜品/小吃/夜宵/轻食/玩乐活动分类平衡。
- combo 至少 20 个，名字要有传播感。
- 商品图片命名与商品名保持一致。

### B. 前端 UI 与交互

负责 `modules/frontend/src/App.tsx` 和 `modules/frontend/src/styles.css`。

重点任务：
- 继续对齐高质量小程序点单界面。
- 优化底部事务所订单栏、分类图标、商品卡密度。
- 保证移动端文字不重叠。
- 让保存结果卡导出的 PNG 也好看。

### C. 配送事件小游戏与知识机制

负责配送事件、事件选择、评分规则与知识点表达。

重点任务：
- 扩展 24+ 个配送事件到 40+。
- 增加食品安全、骑手安全、包装防撒、健康生活、用户备注、趣味突发的关卡差异。
- 每个事件要有 2-3 个选择，并影响速度/安全/健康/完整度/信任。
- 把知识点写得轻巧，不像说教。

### D. AI / 人格 / 集成部署

负责美食人格、结果文案、后续 AI 接入、部署和演示。

重点任务：
- 打磨 16 类美食人格与称号变体。
- 研究是否把当前规则引擎升级为 AI 辅助生成文案。
- 做部署、分享链接、演示脚本、最终汇报材料。
- 维护 README 和 demo 使用说明。

## AI 接手提示

如果你把这个仓库交给其他 AI，请先让它读：

1. `README.md`
2. `docs/project-roadmap.md`
3. `docs/content-and-assets.md`
4. `modules/frontend/README.md`
5. `modules/frontend/src/lib/gameEngine.ts`
6. `modules/frontend/src/data/catalog.ts`

读完后它应该能理解：
- 项目讲的是“现代人下单时的心理奖励”，不是普通外卖。
- demo 的主流程是“下单目的 -> 点单 -> 配送事件 -> 小票与人格卡”。
- 当前可运行版本在 `modules/frontend`。
- 后续最缺的是内容量、图片素材、事件关卡、结果卡精修和部署集成。
