# EATI: 今天你吃商几级？

一个把外卖点单做成互动人格测试的 Web 小程序 demo。

EATI 从“今天想吃什么”切入，让用户像在外卖平台里点奶茶、咖啡、甜品、小吃、主食、炒菜和汤锅；系统会根据点单目的、菜品结构、规格选择、优惠券使用、配送沟通和收餐选择，生成一张可分享的“吃商人格小票”。

在线体验：[https://forest27xx.github.io/Hackerthon/v5-36/](https://forest27xx.github.io/Hackerthon/v5-36/)

## 项目亮点

- 真实外卖式点单体验：10 个商品分类、购物车、规格弹窗、钱包额度、红包优惠券、神券膨胀和套餐一键加入。
- 可传播的人格测试结果：基于订单行为和配送选择生成 16 类“吃商人格”，并输出标签、称号、吃商等级和下次点法建议。
- 订单进行中互动剧情：商家备餐、骑手沟通、收餐确认不再只是等待，而是会影响快乐、健康、安全和完整度的选择题。
- 可保存的结果卡：最终生成带订单记录、人格结论和指数面板的分享图，适合社交传播和黑客松展示。
- 纯前端可部署：React + Vite + TypeScript 本地规则引擎，无后端依赖，适合快速演示、扫码体验和后续接入 AI。

## 为什么做这个

外卖平台通常只解决“买到东西”，但年轻用户点单时常常还在做情绪决策：加班要续命、深夜想安慰自己、健身后想奖励但又怕负担、凑券时想省钱又想吃得完整。

EATI 把这些隐性的决策变成游戏化流程：

```text
点单目的 -> 商品选择 -> 规格和优惠 -> 配送事件选择 -> 吃商人格小票
```

它不是一个真实交易平台，而是一个“消费心理 + 互动叙事 + 轻量人格算法”的作品原型。

## 核心流程

1. 选择今日点单目的
   例如困、馋、emo、加班、摸鱼、庆祝、约会、发疯、健身后、深夜嘴馋。

2. 像外卖小程序一样点单
   用户可以在奶茶、咖啡、甜品、小吃、夜宵、轻食、主食、炒菜、汤锅和其他分类中选餐，并设置糖度、冰量、分量、口味、包装和备注。

3. 使用钱包和红包
   初始钱包额度为 150 元，系统提供满减券和随机膨胀优惠，引导用户在预算和快乐之间做选择。

4. 处理订单进行中事件
   下单后进入商家、骑手、收餐三个阶段。每个阶段会根据本单商品生成不同选择，例如冷热分装、汤品防撒、骑手安全、加料缺货、收餐检查。

5. 生成吃商人格小票
   系统综合商品标签、规格偏好、套餐结构、配送选择和结果分数，输出吃商等级、16 型人格、关键词、建议和可保存结果卡。

## 技术栈

| 层级 | 技术 |
|---|---|
| 前端框架 | React 19, TypeScript, Vite |
| 交互和视觉 | CSS, lucide-react, html-to-image |
| 测试 | Vitest, Testing Library, jsdom |
| 规则引擎 | 本地 TypeScript 规则系统 |
| 静态部署 | GitHub Pages |

## 工程结构

```text
Hackerthon/
  README.md
  docs/
    git-workflow.md
    interview-guide.md
    project-roadmap.md
    content-and-assets.md
  modules/
    frontend/
      src/App.tsx
      src/styles.css
      src/data/catalog.ts
      src/lib/gameEngine.ts
      src/lib/orderProgressEngine.ts
      src/lib/useSoundController.ts
      public/audio/
    backend/
    ai-core/
    integration-deploy/
```

当前可运行的完整 demo 位于 `modules/frontend`。`backend`、`ai-core` 和 `integration-deploy` 保留为后续扩展模块。

## 本地运行

```bash
git clone https://github.com/forest27xx/Hackerthon.git
cd Hackerthon/modules/frontend
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:5173/
```

测试和构建：

```bash
npm test
npm run build
```

## 关键实现

- `modules/frontend/src/data/catalog.ts`
  商品、分类、规格、价格、标签和套餐规则。

- `modules/frontend/src/lib/gameEngine.ts`
  订单分数、combo 触发、人格轴计算和结果摘要。

- `modules/frontend/src/lib/orderProgressEngine.ts`
  订单进行中事件池、按商品过滤的节点抽取和配送阶段逻辑。

- `modules/frontend/src/lib/useSoundController.ts`
  BGM、按钮音效、订单语音和浏览器音频解锁。

- `modules/frontend/src/components/FinalPersonaReceipt.tsx`
  最终分享小票和人格结果卡。

- `modules/frontend/src/styles.css`
  小程序式点单页、配送互动页、结果卡和移动端适配。

## 作为面试项目怎么讲

这个项目适合讲三个能力点：

1. 产品抽象能力
   从“外卖点单”这种常见场景里拆出情绪需求、优惠决策、配送沟通和社交分享，转化为一套可玩的互动流程。

2. 前端工程能力
   在纯前端条件下完成复杂状态流、移动端布局、购物车、优惠券、结果图导出、音频播放和 GitHub Pages 部署。

3. AI 方向延展能力
   当前人格判断是可解释规则引擎，未来可以把完整订单轨迹转成结构化 prompt，让模型生成更个性化的小票文案，同时保留本地规则作为 fallback。

面试讲解稿见：[docs/interview-guide.md](docs/interview-guide.md)。

## 后续可以继续做什么

- 接入 LLM，让结果卡文案从规则模板升级为个性化生成。
- 增加真实用户数据埋点，分析不同点单路径和人格结果的分布。
- 把订单进行中事件做成更明显的关卡系统。
- 增加多端分享页、排行榜和好友互测。
- 将菜单和事件数据迁移到后端或 CMS，降低内容迭代成本。

## 项目定位

EATI 是一个黑客松阶段完成的产品原型。它重点展示的是：如何用前端工程、规则建模和 AI 产品想象力，把一个普通消费场景做成可体验、可传播、可继续扩展的小作品。
