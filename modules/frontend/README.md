# Frontend Module

这里是“快乐下单事务所”的前端 demo，当前已经可以独立运行。它承担黑客松展示里最重要的用户体验：让用户像打开奶茶/外卖小程序一样下单，然后通过配送事件小游戏和结果卡获得一个有趣的“今日快乐订单 + 美食人格 MBTI”。

## 快速启动

```bash
cd modules/frontend
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

## 技术栈

- React 19
- Vite
- TypeScript
- Vitest + Testing Library
- html-to-image：导出结果卡 PNG
- lucide-react：图标

## 当前用户流程

1. 选择今日下单目的  
   例如困、馋、emo、加班、摸鱼、庆祝、约会、发疯、健身后、深夜馋嘴。这个选择不是装饰，它会参与最终美食人格判断。

2. 进入仿小程序点单页  
   包括顶部事务所状态板、快乐/健康/安全分数、左侧分类、商品卡、combo 区和底部“事务所订单”栏。

3. 添加商品和规格  
   商品可选糖度、冰量、加料、包装、分量、健康备注等。不同选择影响快乐、健康、饱腹、清醒、安全。

4. 点击 `下单`  
   注意不是“去配送”。下单后进入配送事件小游戏。

5. 完成 3-5 个配送事件  
   每个事件有 2-3 个选择，会影响速度、安全、健康、完整度、信任值。

6. 生成结果  
   结果页包含：
   - 烫金风格“快乐订单小票”
   - 本次下单过程记录
   - 快乐/健康/安全指数
   - 16 类美食人格 MBTI
   - 称号变体和标签
   - 保存 PNG / 复制分享文案 / 再来一单

## 关键文件

```text
src/App.tsx                 # 主应用流程和 UI 结构
src/styles.css              # 全局视觉、移动端小程序样式、结果卡样式
src/data/catalog.ts         # 商品、分类、combo、配送事件内容
src/lib/gameEngine.ts       # 分数、combo、配送事件、美食人格、结果摘要算法
src/lib/menuImages.ts       # 商品图片自动映射
src/types.ts                # 数据类型
src/App.test.tsx            # UI 流程测试
src/lib/gameEngine.test.ts  # 核心规则测试
```

## 图片素材规则

当前前端会根据商品名尝试自动匹配图片。后续放真实图片时建议：

```text
src/assets/menu/
  厚芋泥波波.png
  杨枝甘露.png
  番茄牛肉面.png
  鸡胸藜麦碗.png
```

命名建议：
- 文件名尽量等于商品名。
- 中文名可以保留，避免空格和奇怪符号。
- 支持常见图片格式，优先 `.png` 或 `.jpg`。
- 如果商品名很长，先统一一份命名表，再在 `imageKey` 里显式指定。

图片风格建议：
- 奶茶、咖啡、甜品要“有食欲”，光线明亮，主体大。
- 主食/小吃要能看清内容，不要过度暗调。
- 结果卡主图优先使用本次购物车第一件商品。

## 美食人格规则

当前人格系统在 `src/lib/gameEngine.ts` 中本地实现，不依赖后端或大模型。

四个轴：
- 情绪驱动 / 理性搭配
- 热闹分享 / 独自回血
- 放纵快乐 / 健康平衡
- 冒险尝鲜 / 稳定复购

输出：
- 16 类主类型
- 一组称号变体
- 一组 badge 标签
- 下次点法建议

参与判断的输入：
- 今日下单目的
- 商品标签
- 商品规格和备注
- combo
- 配送事件类型
- 配送事件选择
- 快乐/健康/安全最终指数

## 内容扩展入口

### 加商品

编辑：

```text
src/data/catalog.ts
```

商品需要：
- `id`
- `name`
- `category`
- `price`
- `description`
- `tags`
- `stats`
- `options`

### 加 combo

编辑 `comboRules`。combo 的关键是条件和奖励：

```ts
{
  id: "c21",
  name: "新的快乐组合",
  description: "一句有记忆点的解释。",
  condition: {
    moods: ["overtime"],
    requiredTags: ["caffeine", "comfort"],
    minItems: 2
  },
  bonus: { joy: 10, energy: 8 }
}
```

### 加配送事件

编辑 `deliveryEvents`。每个事件建议包含：
- 事件类型
- 标题
- 场景描述
- 轻量知识点
- 2-3 个选择
- 每个选择的分数影响

## 当前缺口

- UI 还可以继续贴近成熟点单小程序，尤其商品卡、底部订单栏、配送事件页动画。
- 配送事件目前能跑，但关卡策略感还可以增强。
- 结果卡已有黑金/烫金方向，但还可以继续做更精致的保存图模板。
- 美食人格已有 16 类主类型，但文案还可以更“社交传播化”。
- 真实图片素材还没有完全填充，需要团队统一整理。
- 后端和 AI 模块尚未接入，当前是纯前端本地 demo。

## 给接手 AI 的提示

如果你是另一个 AI，请先读：

1. `src/types.ts`
2. `src/lib/gameEngine.ts`
3. `src/data/catalog.ts`
4. `src/App.tsx`
5. `src/styles.css`

不要先重写项目。当前结构已经能跑，优先做小步迭代：补内容、优化视觉、增强事件、调整人格文案，并且每次改完都跑：

```bash
npm test
npm run build
```
