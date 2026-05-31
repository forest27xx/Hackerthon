# 内容与素材整理规范

这份文档给负责商品、图片、文案的人使用。目标是让前端可以自动识别图片，让美食内容看起来真实、有食欲、有传播点。

## 商品图片放哪里

建议放到：

```text
modules/frontend/src/assets/menu/
```

当前可以先创建这个目录。图片进入项目后，前端会通过商品名或 `imageKey` 匹配。

## 图片命名

优先规则：

```text
商品名.png
商品名.jpg
```

例子：

```text
厚芋泥波波.png
杨枝甘露.png
番茄牛肉面.png
鸡胸藜麦碗.png
楼下散步取餐.png
```

如果图片文件名不方便完全等于商品名，就在 `catalog.ts` 的商品里加：

```ts
imageKey: "对应图片文件名"
```

## 图片质量建议

- 尺寸不要太小，建议宽高至少 600px。
- 主体要清楚，最好是浅背景或真实餐桌场景。
- 奶茶要能看到杯体和小料。
- 主食要能看到食材，不要过暗。
- 小吃要体现热气、酥脆或分量。
- 轻食要清爽，但不要像医院餐。
- 玩乐活动可以用场景图、票券图、插画图。

## 商品内容字段

每个商品要有：

```ts
{
  id: "mt-01",
  name: "厚芋泥波波",
  category: "milkTea",
  price: 18,
  description: "绵密芋泥和珍珠一起把今天哄好。",
  tags: ["sweet", "comfort", "milkTea"],
  stats: s(18, -4, 8, 3, 3),
  options: drinkOptions
}
```

`stats` 顺序是：

```text
快乐值 joy
健康值 health
饱腹值 fullness
清醒值 energy
安全值 safety
```

## 标签建议

常用标签：

```text
sweet        甜
comfort      治愈/安慰
milkTea      奶茶
caffeine     咖啡因
refresh      清爽
fruit        水果
share        适合分享
party        热闹/庆祝
fun          玩乐
spicy        辣
fried        炸物
healthy      健康
lowSugar     低糖
protein      蛋白
light        轻食
safe         稳妥/安全
warm         热食/热饮
fullness     饱腹
chewy        有嚼感
separatePack 冷热分装
healthyNote  健康备注
```

标签会影响：
- combo 触发
- 美食人格
- 结果卡 badge
- 下次点法建议

## 商品扩量目标

第一版建议：

| 分类 | 数量 |
|---|---:|
| 奶茶/咖啡 | 24 |
| 甜品/小吃 | 16 |
| 夜宵/轻食 | 12 |
| 玩乐活动 | 8 |

总计 60 个左右。

## Combo 命名方向

combo 要像一个“下单爽点”，不是普通套餐名。

已有方向：
- 加班续命包
- 低糖自律局
- 周五发疯套餐
- 深夜罪恶但有分寸
- 健身后恢复局
- 约会不翻车组合
- 摸鱼低调快乐
- 甜品安慰站

新 combo 可以围绕：
- 下班回血
- 暴雨安全到达
- 办公室拼单
- 熬夜但不崩
- 低糖但有料
- 热汤救场
- 辣味醒脑
- 饭后散步

## 配送事件扩写方向

事件必须有选择博弈，不要只有正确答案。

六类事件：

1. 商家食品安全
2. 骑手安全
3. 防撒漏与包装
4. 健康生活
5. 用户备注博弈
6. 趣味突发

每个事件建议格式：

```ts
{
  id: "rs-rain",
  type: "riderSafety",
  title: "暴雨配送",
  body: "骑手预计晚到 4 分钟。",
  knowledge: "恶劣天气下催促赶路会提高交通风险。",
  choices: [
    { id: "safe", label: "安全第一不催单", effect: { speed: -3, safety: 10, trust: 8 } },
    { id: "hurry", label: "继续催一下", effect: { speed: 4, safety: -9, trust: -6 } }
  ]
}
```

## 美食人格文案方向

当前有 16 类主类型。每类建议继续补：

- 一句适合截图分享的短句。
- 一段 40-80 字解释。
- 3-5 个关键词。
- 一个“下次点法建议”。
- 2-3 个称号变体。

语气参考：
- 像社交测试，不像测评报告。
- 要能让用户觉得“有点准，又有点好笑”。
- 不要说教。
- 不要做医疗建议。

## 内容合并注意

`catalog.ts` 是最容易冲突的文件。如果多人一起改，建议：

1. 先按分类分工。
2. 每个人只改自己的分类块。
3. 改完立刻跑：

```bash
cd modules/frontend
npm test
npm run build
```

4. 合并前让前端同学检查界面是否溢出。
