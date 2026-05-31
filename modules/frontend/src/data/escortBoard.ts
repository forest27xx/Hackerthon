import type { DiceConfig, EscortBoardArt, EscortEvent, EscortRoute, EscortScene, EscortTile } from "../types";

export const diceConfigs: DiceConfig[] = [
  { id: "steady", name: "稳稳骰", description: "步数 1-3，更稳妥", range: [1, 3], riskLabel: "风险低" },
  { id: "normal", name: "普通骰", description: "步数 1-6，更均衡", range: [1, 6], riskLabel: "均衡" },
  { id: "speedy", name: "加速骰", description: "步数 2-6，收益高", range: [2, 6], riskLabel: "风险升" }
];

export const escortBoardArt: EscortBoardArt = {
  id: "food-street-sunny",
  theme: "晴天美食街",
  width: 900,
  height: 900,
  imageKey: "escort-board-food-street"
};

export const escortMainTiles: EscortTile[] = [
  { id: "start", type: "start", label: "事务所出发", shortLabel: "起", x: 105, y: 780, routeIndex: 0, sceneId: "scene-start", eventHint: "骑手已接单，准备进入美食街" },
  { id: "pack-gate", type: "packaging", label: "打包门口", shortLabel: "包", x: 243, y: 780, routeIndex: 1, sceneId: "scene-packaging", eventHint: "检查袋子和杯托" },
  { id: "road-plaza", type: "road", label: "广场慢行道", shortLabel: "路", x: 381, y: 780, routeIndex: 2, sceneId: "scene-road", eventHint: "看天气和路线" },
  { id: "fork-snack", type: "fork", label: "美食街岔路", shortLabel: "岔", x: 519, y: 780, routeIndex: 3, branchId: "snack-alley", sceneId: "scene-fork", eventHint: "近路和稳路二选一" },
  { id: "health-sip", type: "healthQuiz", label: "低糖提醒站", shortLabel: "康", x: 657, y: 780, routeIndex: 4, sceneId: "scene-quiz", eventHint: "随机健康知识" },
  { id: "shop-a", type: "merchant", label: "取货点 A", shortLabel: "店", x: 795, y: 780, routeIndex: 5, landmark: "奶茶店", sceneId: "scene-merchant", eventHint: "第一家商家出餐核验" },
  { id: "pack-cup", type: "packaging", label: "杯托补给", shortLabel: "包", x: 795, y: 645, routeIndex: 6, sceneId: "scene-packaging", eventHint: "奶茶防撒漏" },
  { id: "road-bridge", type: "road", label: "小桥路况", shortLabel: "路", x: 657, y: 645, routeIndex: 7, sceneId: "scene-road", eventHint: "路面颠簸" },
  { id: "foodsafe-window", type: "foodSafetyQuiz", label: "食安窗口", shortLabel: "安", x: 519, y: 645, routeIndex: 8, sceneId: "scene-quiz", eventHint: "食品安全快问快答" },
  { id: "rider-light", type: "riderSafety", label: "红绿灯口", shortLabel: "骑", x: 381, y: 645, routeIndex: 9, sceneId: "scene-rider", eventHint: "安全沟通" },
  { id: "tool-kiosk", type: "tool", label: "道具便利亭", shortLabel: "具", x: 243, y: 645, routeIndex: 10, sceneId: "scene-tool", eventHint: "可能获得道具" },
  { id: "incident-crowd", type: "incident", label: "人流拥挤口", shortLabel: "突", x: 105, y: 645, routeIndex: 11, sceneId: "scene-incident", eventHint: "突发状况处理" },
  { id: "shop-b", type: "merchant", label: "取货点 B", shortLabel: "店", x: 105, y: 510, routeIndex: 12, landmark: "热食店", sceneId: "scene-merchant", eventHint: "第二家取热食" },
  { id: "pack-hot", type: "packaging", label: "冷热分袋台", shortLabel: "包", x: 243, y: 510, routeIndex: 13, sceneId: "scene-packaging", eventHint: "冷热分离" },
  { id: "health-garden", type: "healthQuiz", label: "饭后散步角", shortLabel: "康", x: 381, y: 510, routeIndex: 14, sceneId: "scene-quiz", eventHint: "健康生活选择" },
  { id: "road-park", type: "road", label: "公园外环", shortLabel: "路", x: 519, y: 510, routeIndex: 15, sceneId: "scene-road", eventHint: "绕行还是直达" },
  { id: "note-pin", type: "note", label: "门牌备注点", shortLabel: "注", x: 657, y: 510, routeIndex: 16, sceneId: "scene-note", eventHint: "把备注说清楚" },
  { id: "reward-star", type: "reward", label: "五星鼓励站", shortLabel: "奖", x: 795, y: 510, routeIndex: 17, sceneId: "scene-reward", eventHint: "护送奖励" },
  { id: "fork-market", type: "fork", label: "市场双路线", shortLabel: "岔", x: 795, y: 375, routeIndex: 18, branchId: "market-loop", sceneId: "scene-fork", eventHint: "选择取货节奏" },
  { id: "road-market", type: "road", label: "市场石板路", shortLabel: "路", x: 657, y: 375, routeIndex: 19, sceneId: "scene-road", eventHint: "颠簸路段" },
  { id: "incident-battery", type: "incident", label: "电量告急点", shortLabel: "突", x: 519, y: 375, routeIndex: 20, sceneId: "scene-incident", eventHint: "定位风险" },
  { id: "rider-heat", type: "riderSafety", label: "遮阳路口", shortLabel: "骑", x: 381, y: 375, routeIndex: 21, sceneId: "scene-rider", eventHint: "高温配送" },
  { id: "foodsafe-cold", type: "foodSafetyQuiz", label: "冷链提醒牌", shortLabel: "安", x: 243, y: 375, routeIndex: 22, sceneId: "scene-quiz", eventHint: "安全温度题" },
  { id: "shop-c", type: "merchant", label: "取货点 C", shortLabel: "店", x: 105, y: 375, routeIndex: 23, landmark: "甜品店", sceneId: "scene-merchant", eventHint: "最后一份取货" },
  { id: "pack-dessert", type: "packaging", label: "甜品防晃台", shortLabel: "包", x: 105, y: 240, routeIndex: 24, sceneId: "scene-packaging", eventHint: "甜品防变形" },
  { id: "road-school", type: "road", label: "校园慢行道", shortLabel: "路", x: 243, y: 240, routeIndex: 25, sceneId: "scene-road", eventHint: "慢行保护" },
  { id: "health-water", type: "healthQuiz", label: "补水提示牌", shortLabel: "康", x: 381, y: 240, routeIndex: 26, sceneId: "scene-quiz", eventHint: "补水和低糖" },
  { id: "note-gate", type: "note", label: "门禁说明处", shortLabel: "注", x: 519, y: 240, routeIndex: 27, sceneId: "scene-note", eventHint: "门禁路线说明" },
  { id: "tool-label", type: "tool", label: "贴纸补给箱", shortLabel: "具", x: 657, y: 240, routeIndex: 28, sceneId: "scene-tool", eventHint: "标记杯身" },
  { id: "reward-sample", type: "reward", label: "新品试喝点", shortLabel: "奖", x: 795, y: 240, routeIndex: 29, sceneId: "scene-reward", eventHint: "隐藏奖励" },
  { id: "road-riverside", type: "road", label: "河边缓行道", shortLabel: "路", x: 795, y: 105, routeIndex: 30, sceneId: "scene-road", eventHint: "最后一公里路况" },
  { id: "fork-community", type: "fork", label: "小区入口岔路", shortLabel: "岔", x: 657, y: 105, routeIndex: 31, branchId: "community-gate", sceneId: "scene-fork", eventHint: "前台、自取、上楼" },
  { id: "pack-final", type: "packaging", label: "终点前验袋", shortLabel: "包", x: 519, y: 105, routeIndex: 32, sceneId: "scene-packaging", eventHint: "终点前检查" },
  { id: "rider-parking", type: "riderSafety", label: "安全停车点", shortLabel: "骑", x: 381, y: 105, routeIndex: 33, sceneId: "scene-rider", eventHint: "停车和交接" },
  { id: "incident-elevator", type: "incident", label: "电梯拥堵口", shortLabel: "突", x: 243, y: 105, routeIndex: 34, sceneId: "scene-incident", eventHint: "最后交付选择" },
  { id: "destination", type: "destination", label: "目的地", shortLabel: "终", x: 105, y: 105, routeIndex: 35, sceneId: "scene-destination", eventHint: "整单送达" }
];

export const escortBranchTiles: EscortTile[] = [
  { id: "branch-snack-1", type: "road", label: "小吃近路", shortLabel: "近", x: 700, y: 970, isBranch: true, branchId: "snack-alley", eventHint: "快一点但更颠簸" },
  { id: "branch-snack-2", type: "reward", label: "街角赠品", shortLabel: "奖", x: 590, y: 910, isBranch: true, branchId: "snack-alley", eventHint: "可能触发加购诱惑" },
  { id: "branch-market-1", type: "healthQuiz", label: "公园绕行", shortLabel: "康", x: 670, y: 575, isBranch: true, branchId: "market-loop", eventHint: "慢一点但健康加成" },
  { id: "branch-market-2", type: "tool", label: "晴天补给", shortLabel: "具", x: 770, y: 515, isBranch: true, branchId: "market-loop", eventHint: "获得小道具" },
  { id: "branch-community-1", type: "note", label: "前台交付点", shortLabel: "注", x: 245, y: 275, isBranch: true, branchId: "community-gate", eventHint: "备注更清晰" },
  { id: "branch-community-2", type: "riderSafety", label: "楼下自取点", shortLabel: "骑", x: 365, y: 205, isBranch: true, branchId: "community-gate", eventHint: "降低骑手压力" }
];

export const escortBaseTiles: EscortTile[] = [...escortMainTiles, ...escortBranchTiles];

export const escortRoute: EscortRoute = {
  mainTileIds: escortMainTiles.map((tile) => tile.id),
  branchTileIds: escortBranchTiles.map((tile) => tile.id),
  pickupTileIds: ["shop-a", "shop-b", "shop-c"],
  destinationTileId: "destination"
};

export const escortScenes: Record<string, EscortScene> = {
  "scene-start": { id: "scene-start", kind: "start", title: "事务所发车", subtitle: "确认订单已经打包进护送箱。", visual: "🛵", tone: "orange" },
  "scene-merchant": { id: "scene-merchant", kind: "merchant", title: "商家取货作业", subtitle: "核对规格、封口和小票，别让快乐在源头翻车。", visual: "🏪", tone: "green" },
  "scene-packaging": { id: "scene-packaging", kind: "packaging", title: "包装配装台", subtitle: "杯托、分袋、贴纸和保温箱会决定完整度。", visual: "📦", tone: "orange" },
  "scene-road": { id: "scene-road", kind: "road", title: "路况判断", subtitle: "速度很香，但稳稳送达更有成就感。", visual: "🛣️", tone: "blue" },
  "scene-quiz": { id: "scene-quiz", kind: "quiz", title: "知识快问快答", subtitle: "健康和食安知识会变成这一单的隐藏加成。", visual: "💡", tone: "green" },
  "scene-rider": { id: "scene-rider", kind: "rider", title: "骑手安全沟通", subtitle: "让骑手安全到达，也是快乐下单的一部分。", visual: "🛡️", tone: "blue" },
  "scene-note": { id: "scene-note", kind: "note", title: "备注谈判室", subtitle: "把复杂愿望改写成商家和骑手都能执行的句子。", visual: "📝", tone: "purple" },
  "scene-tool": { id: "scene-tool", kind: "tool", title: "道具补给点", subtitle: "小小道具可以扭转撒漏、错拿和等太久。", visual: "🎒", tone: "gold" },
  "scene-reward": { id: "scene-reward", kind: "reward", title: "护送奖励站", subtitle: "稳定表现会换来一点额外快乐。", visual: "⭐", tone: "gold" },
  "scene-fork": { id: "scene-fork", kind: "fork", title: "岔路策略局", subtitle: "近路、稳路、绕行路，每条路都在交换不同的分数。", visual: "🧭", tone: "purple" },
  "scene-incident": { id: "scene-incident", kind: "incident", title: "突发事件现场", subtitle: "别怕，翻车不是失败，处理方式才会写进小票。", visual: "⚠️", tone: "red" },
  "scene-destination": { id: "scene-destination", kind: "destination", title: "终点验货台", subtitle: "最后检查完整度，把这趟护送盖章收尾。", visual: "🏠", tone: "red" }
};

export const merchantSlotIds = ["shop-a", "shop-b", "shop-c"] as const;

export const escortEventBank: EscortEvent[] = [
  {
    id: "merchant-verify-note",
    tileType: "merchant",
    eventType: "foodSafety",
    mode: "choice",
    title: "商家出餐核验",
    body: "骑手到店，发现备注很多，店员问要不要逐条核对。",
    knowledge: "出餐前核对规格、忌口和封口，能减少错单和撒漏。",
    options: [
      { id: "check", label: "逐条核对再取", detail: "慢一点但更稳", effect: { speed: -2, integrity: 8, safety: 6, trust: 4 } },
      { id: "rush", label: "看单号直接取走", detail: "赌一把速度", effect: { speed: 4, integrity: -7, safety: -3 } }
    ]
  },
  {
    id: "merchant-lid",
    tileType: "merchant",
    eventType: "packaging",
    mode: "choice",
    title: "最后一杯封口松动",
    body: "奶茶店说封口膜边缘有点起翘，可以重压一次。",
    knowledge: "饮品封口完整能降低外界污染和撒漏风险。",
    options: [
      { id: "reseal", label: "请店员重压封口", effect: { speed: -2, integrity: 10, safety: 6 } },
      { id: "leave", label: "先出发，路上小心", effect: { speed: 3, integrity: -8, trust: -2 } }
    ]
  },
  {
    id: "merchant-temp",
    tileType: "merchant",
    eventType: "foodSafety",
    mode: "choice",
    title: "热食刚刚出锅",
    body: "热汤面还在冒气，马上封袋会让冷饮外杯起雾。",
    knowledge: "冷热食物分开包装能减少串味、受潮和口感损失。",
    options: [
      { id: "separate", label: "冷热分开再上车", effect: { speed: -2, integrity: 9, safety: 7, health: 1 } },
      { id: "same", label: "同袋赶路", effect: { speed: 4, integrity: -8, safety: -4 } }
    ]
  },
  {
    id: "merchant-last-item",
    tileType: "merchant",
    eventType: "noteGame",
    mode: "choice",
    title: "最后一份小料缺货",
    body: "店员说芋圆只剩半份，可以换成珍珠或退掉。",
    knowledge: "明确替代方案比模糊备注更容易执行。",
    options: [
      { id: "swap", label: "换珍珠并标注", effect: { speed: 1, integrity: 5, trust: 5 } },
      { id: "refund", label: "退掉小料", effect: { health: 3, integrity: 2 } },
      { id: "argue", label: "坚持原样等补货", effect: { speed: -5, trust: -4, integrity: 3 } }
    ]
  },
  {
    id: "pack-cold-hot",
    tileType: "packaging",
    eventType: "packaging",
    mode: "packaging",
    title: "冷热分袋挑战",
    body: "订单里冷饮、热食、甜品同时上车，你最多选择 2 个包装道具。",
    knowledge: "液体、热食和脆皮食物分开处理，能显著降低撒漏和变软风险。",
    options: [
      { id: "cup-holder", label: "加固杯托", effect: { integrity: 7, safety: 4 }, tools: ["加固杯托"] },
      { id: "hot-cold-bags", label: "冷热分袋", effect: { integrity: 8, safety: 5 }, tools: ["冷热分袋"] },
      { id: "seal-tape", label: "封口贴", effect: { integrity: 5, trust: 2 }, tools: ["封口贴"] }
    ]
  },
  {
    id: "pack-soup",
    tileType: "packaging",
    eventType: "packaging",
    mode: "packaging",
    title: "汤汁防线",
    body: "汤粉袋子很满，车篮会经过一段石板路。",
    knowledge: "汤类应优先密封、竖放、与饮品分区。",
    options: [
      { id: "upright-box", label: "竖放保温箱", effect: { integrity: 9, safety: 4 }, tools: ["竖放保温箱"] },
      { id: "leak-bag", label: "防漏袋", effect: { integrity: 8 }, tools: ["防漏袋"] },
      { id: "paper-wrap", label: "吸水纸包边", effect: { integrity: 4, speed: -1 }, tools: ["吸水纸"] }
    ]
  },
  {
    id: "pack-label",
    tileType: "packaging",
    eventType: "packaging",
    mode: "packaging",
    title: "多杯识别战",
    body: "三杯饮品颜色接近，稍不注意就会拿错。",
    knowledge: "杯身标记可以减少错拿，也能保护忌口和过敏信息。",
    options: [
      { id: "name-sticker", label: "姓名贴纸", effect: { integrity: 7, safety: 5, trust: 3 }, tools: ["姓名贴纸"] },
      { id: "flavor-tag", label: "口味吊牌", effect: { integrity: 6, trust: 3 }, tools: ["口味吊牌"] },
      { id: "separate-grid", label: "分格袋", effect: { integrity: 8, speed: -1 }, tools: ["分格袋"] }
    ]
  },
  {
    id: "pack-ice",
    tileType: "packaging",
    eventType: "packaging",
    mode: "packaging",
    title: "满杯冰块预警",
    body: "满杯冰饮和热食靠太近，外壁水珠开始出现。",
    knowledge: "冷凝水会让纸袋变软，冷热隔离更稳。",
    options: [
      { id: "insulated-sleeve", label: "隔热杯套", effect: { integrity: 6, safety: 4 }, tools: ["隔热杯套"] },
      { id: "double-bag", label: "双层纸袋", effect: { integrity: 5 }, tools: ["双层纸袋"] },
      { id: "dry-zone", label: "干湿分区", effect: { integrity: 8, safety: 3 }, tools: ["干湿分区"] }
    ]
  },
  {
    id: "road-rain",
    tileType: "road",
    eventType: "riderSafety",
    mode: "choice",
    title: "路面突然下雨",
    body: "云朵临时加戏，路口开始打滑。",
    knowledge: "雨天配送应降低速度，优先保证交通安全。",
    options: [
      { id: "slow", label: "提醒慢行不催单", effect: { speed: -3, safety: 10, trust: 7 } },
      { id: "fast", label: "继续追求准时", effect: { speed: 5, safety: -10, integrity: -4 } }
    ]
  },
  {
    id: "road-bump",
    tileType: "road",
    eventType: "packaging",
    mode: "choice",
    title: "石板路颠簸",
    body: "前面有一段老街石板路，奶茶开始紧张。",
    knowledge: "颠簸路段适合提前加固杯托和减速。",
    options: [
      { id: "hold", label: "减速并固定车篮", effect: { speed: -2, integrity: 8, safety: 4 } },
      { id: "rush", label: "保持速度冲过去", effect: { speed: 4, integrity: -9 } }
    ]
  },
  {
    id: "road-light",
    tileType: "road",
    eventType: "riderSafety",
    mode: "choice",
    title: "红绿灯倒计时",
    body: "绿灯只剩 3 秒，骑手问要不要冲过去。",
    knowledge: "遵守交通规则是配送安全底线。",
    options: [
      { id: "wait", label: "等下一轮绿灯", effect: { speed: -2, safety: 12, trust: 5 } },
      { id: "cross", label: "抓紧通过", effect: { speed: 4, safety: -12, trust: -4 } }
    ]
  },
  {
    id: "road-gate",
    tileType: "road",
    eventType: "noteGame",
    mode: "choice",
    title: "门禁路线绕",
    body: "目的地入口像迷宫，骑手需要清晰地标。",
    knowledge: "提前发送门牌、入口和取餐点能减少绕路。",
    options: [
      { id: "pin", label: "发送取餐点截图", effect: { speed: 3, trust: 8, integrity: 3 } },
      { id: "later", label: "等到了再沟通", effect: { speed: -4, trust: -5, integrity: -2 } }
    ]
  },
  {
    id: "health-sugar",
    tileType: "healthQuiz",
    eventType: "healthyLife",
    mode: "quiz",
    title: "健康快问：深夜甜饮",
    body: "深夜想喝甜饮，哪种处理更稳？",
    knowledge: "减少添加糖摄入可以降低日常负担。",
    options: [
      { id: "half", label: "半糖或无糖，并补水", correct: true, effect: { health: 9, trust: 2 } },
      { id: "full", label: "全糖加双份糖浆", effect: { health: -8, trust: 1 } },
      { id: "none", label: "不看规格随便点", effect: { health: -4 } }
    ]
  },
  {
    id: "health-walk",
    tileType: "healthQuiz",
    eventType: "healthyLife",
    mode: "quiz",
    title: "健康快问：饭后久坐",
    body: "吃完大份主食后，哪种小动作更适合 demo 里的健康加成？",
    knowledge: "轻量活动有助于形成更好的餐后生活节奏。",
    options: [
      { id: "walk", label: "散步 10 分钟或楼下自取", correct: true, effect: { health: 8, speed: 1 } },
      { id: "sofa", label: "立刻躺平到天荒地老", effect: { health: -5 } },
      { id: "drink", label: "再加一杯高糖饮", effect: { health: -6, integrity: 1 } }
    ]
  },
  {
    id: "health-salt",
    tileType: "healthQuiz",
    eventType: "healthyLife",
    mode: "quiz",
    title: "健康快问：高油高盐",
    body: "炸物和重口主食同单时，哪个搭配更合理？",
    knowledge: "增加蔬果、无糖饮和食物多样性，能让一单更平衡。",
    options: [
      { id: "veg", label: "搭配轻食或无糖茶", correct: true, effect: { health: 9, trust: 1 } },
      { id: "sauce", label: "酱料再加两份", effect: { health: -6 } },
      { id: "ignore", label: "完全不改", effect: { health: -3, speed: 1 } }
    ]
  },
  {
    id: "health-workout",
    tileType: "healthQuiz",
    eventType: "healthyLife",
    mode: "quiz",
    title: "健康快问：健身后",
    body: "健身后点单，哪组关键词更适合恢复局？",
    knowledge: "运动后可以优先补水、蛋白和低糖搭配。",
    options: [
      { id: "protein", label: "蛋白、补水、低糖", correct: true, effect: { health: 10, trust: 2 } },
      { id: "dessert", label: "只点超甜甜品", effect: { health: -5, trust: 1 } },
      { id: "spicy", label: "重辣重油加倍", effect: { health: -6 } }
    ]
  },
  {
    id: "foodsafe-clean",
    tileType: "foodSafetyQuiz",
    eventType: "foodSafety",
    mode: "quiz",
    title: "食安快问：哪一步更关键？",
    body: "商家正在处理熟食和冷饮，哪项更符合食品安全原则？",
    knowledge: "WHO 食品安全五要点包括保持清洁、生熟分开、彻底煮熟、安全温度、安全水和原料。",
    options: [
      { id: "separate", label: "生熟/冷热分开处理", correct: true, effect: { safety: 9, integrity: 5 } },
      { id: "mix", label: "全部混在一个台面更快", effect: { safety: -8, speed: 2 } },
      { id: "unknown", label: "不看包装直接走", effect: { safety: -4 } }
    ]
  },
  {
    id: "foodsafe-temp",
    tileType: "foodSafetyQuiz",
    eventType: "foodSafety",
    mode: "quiz",
    title: "食安快问：安全温度",
    body: "热食出餐后等待太久，最该关注什么？",
    knowledge: "保持安全温度可以降低食物变质风险。",
    options: [
      { id: "temp", label: "缩短等待并保温", correct: true, effect: { safety: 8, integrity: 4 } },
      { id: "sun", label: "放在太阳下等更香", effect: { safety: -7 } },
      { id: "open", label: "打开盖子散热一路走", effect: { safety: -5, integrity: -4 } }
    ]
  },
  {
    id: "foodsafe-seal",
    tileType: "foodSafetyQuiz",
    eventType: "foodSafety",
    mode: "quiz",
    title: "食安快问：封口异常",
    body: "饮品封口膜翘起时，哪个选择更稳？",
    knowledge: "完整封口能降低撒漏和外界污染。",
    options: [
      { id: "reseal", label: "重新封口再配送", correct: true, effect: { safety: 8, integrity: 9, speed: -2 } },
      { id: "press", label: "用手按一下就走", effect: { safety: -5, integrity: -5 } },
      { id: "ignore", label: "反正马上到", effect: { speed: 2, integrity: -8 } }
    ]
  },
  {
    id: "foodsafe-water",
    tileType: "foodSafetyQuiz",
    eventType: "foodSafety",
    mode: "quiz",
    title: "食安快问：原料可信",
    body: "新品试喝来路不明，最佳做法是？",
    knowledge: "安全水和安全原料是食品安全的基本原则。",
    options: [
      { id: "ask", label: "确认来源并标记赠品", correct: true, effect: { safety: 7, trust: 4 } },
      { id: "drink", label: "不问直接喝", effect: { safety: -6 } },
      { id: "mix", label: "倒进正餐里增加惊喜", effect: { safety: -8, integrity: -4 } }
    ]
  },
  {
    id: "rider-heat",
    tileType: "riderSafety",
    eventType: "riderSafety",
    mode: "choice",
    title: "高温路段",
    body: "室外温度升高，骑手和饮品都进入耐热测试。",
    knowledge: "高温天气下减少催促，选择隔热包装更稳。",
    options: [
      { id: "care", label: "不催单并加隔热袋", effect: { speed: -1, safety: 9, integrity: 6, trust: 7 } },
      { id: "push", label: "催一下趁热送", effect: { speed: 4, safety: -8, trust: -5 } }
    ]
  },
  {
    id: "rider-shortcut",
    tileType: "riderSafety",
    eventType: "riderSafety",
    mode: "choice",
    title: "近路诱惑",
    body: "抄近路能快 3 分钟，但有逆行风险。",
    knowledge: "交通规则优先级高于几分钟速度。",
    options: [
      { id: "rule", label: "提醒走正规路线", effect: { speed: -3, safety: 12, trust: 6 } },
      { id: "shortcut", label: "默认越快越好", effect: { speed: 5, safety: -12, trust: -5 } }
    ]
  },
  {
    id: "rider-phone",
    tileType: "riderSafety",
    eventType: "riderSafety",
    mode: "choice",
    title: "骑行中来电",
    body: "你想补充地址信息，但骑手正在路上。",
    knowledge: "骑行中频繁通话会分散注意力。",
    options: [
      { id: "text", label: "发文字和定位，等停稳再看", effect: { safety: 9, trust: 6 } },
      { id: "call", label: "连续打电话确认", effect: { safety: -8, trust: -4, speed: -1 } }
    ]
  },
  {
    id: "rider-parking",
    tileType: "riderSafety",
    eventType: "riderSafety",
    mode: "choice",
    title: "楼下停车难",
    body: "楼下临停区很满，骑手需要安全停车点。",
    knowledge: "清晰安全的取餐点能减少违停和绕路。",
    options: [
      { id: "meet", label: "去楼下安全点接餐", effect: { speed: 2, safety: 7, trust: 7, health: 3 } },
      { id: "door", label: "必须送到门口", effect: { speed: -4, trust: -3, safety: -3 } }
    ]
  },
  {
    id: "note-short",
    tileType: "note",
    eventType: "noteGame",
    mode: "choice",
    title: "备注小作文",
    body: "系统检测到你的备注超过三行，商家阅读压力上升。",
    knowledge: "备注越具体、越短，执行稳定性越高。",
    options: [
      { id: "three", label: "改成三条关键要求", effect: { speed: 2, integrity: 8, trust: 6 } },
      { id: "essay", label: "保留完整小作文", effect: { speed: -3, integrity: -5, trust: -2 } }
    ]
  },
  {
    id: "note-kind",
    tileType: "note",
    eventType: "noteGame",
    mode: "choice",
    title: "催单措辞改写",
    body: "你想让订单快点到，系统建议换一种表达。",
    knowledge: "友好沟通能降低压力，也更容易获得配合。",
    options: [
      { id: "kind", label: "路上注意安全，不急", effect: { safety: 8, trust: 10, speed: -1 } },
      { id: "hurry", label: "麻烦快一点", effect: { speed: 3, safety: -5, trust: -5 } }
    ]
  },
  {
    id: "note-healthy",
    tileType: "note",
    eventType: "healthyLife",
    mode: "choice",
    title: "健康备注谈判",
    body: "你想低糖，又想双份芋泥。",
    knowledge: "健康不一定是全有或全无，可以做快乐妥协。",
    options: [
      { id: "balance", label: "半糖 + 双份芋泥", effect: { health: 6, integrity: 4, trust: 2 } },
      { id: "wild", label: "正常糖 + 双份芋泥", effect: { health: -6, integrity: 3 } },
      { id: "plain", label: "无糖不加料", effect: { health: 9, integrity: 1 } }
    ]
  },
  {
    id: "note-door",
    tileType: "note",
    eventType: "noteGame",
    mode: "choice",
    title: "取餐点描述",
    body: "门口有三个相似入口，骑手可能绕晕。",
    knowledge: "入口、楼栋、标志物三件套最容易被执行。",
    options: [
      { id: "clear", label: "写清入口 + 楼栋 + 地标", effect: { speed: 3, trust: 8, integrity: 3 } },
      { id: "vague", label: "写一句到了联系", effect: { speed: -3, trust: -3 } }
    ]
  },
  {
    id: "tool-coupon",
    tileType: "tool",
    eventType: "fun",
    mode: "choice",
    title: "神秘优惠券",
    body: "地图上出现一张满减券，诱惑力很强。",
    knowledge: "凑单快乐，但也要看自己是否真的需要。",
    options: [
      { id: "take", label: "收下但不强行凑单", effect: { trust: 3, health: 3 }, tools: ["克制券"] },
      { id: "add", label: "立刻加购小吃", effect: { speed: -1, health: -5, trust: 1 }, tools: ["加购券"] }
    ]
  },
  {
    id: "tool-raincoat",
    tileType: "tool",
    eventType: "riderSafety",
    mode: "choice",
    title: "备用防水袋",
    body: "事务所背包里翻出一只防水袋。",
    knowledge: "雨天防水包装可以同时保护餐品和取餐体验。",
    options: [
      { id: "use", label: "给订单套防水袋", effect: { safety: 6, integrity: 7 }, tools: ["防水袋"] },
      { id: "save", label: "留到下一段路", effect: { trust: 2 }, tools: ["备用防水袋"] }
    ]
  },
  {
    id: "tool-sticker",
    tileType: "tool",
    eventType: "packaging",
    mode: "choice",
    title: "贴纸补给",
    body: "你获得一张醒目的订单贴纸。",
    knowledge: "清晰标记能降低拿错与漏拿风险。",
    options: [
      { id: "label", label: "贴在主袋正面", effect: { integrity: 5, trust: 4 }, tools: ["醒目贴纸"] },
      { id: "cute", label: "贴在小票上增加仪式感", effect: { trust: 5 }, tools: ["快乐贴纸"] }
    ]
  },
  {
    id: "tool-water",
    tileType: "tool",
    eventType: "healthyLife",
    mode: "choice",
    title: "补水提示卡",
    body: "系统弹出：甜饮旁边可以放一杯水。",
    knowledge: "补水和减少添加糖，是轻量健康策略。",
    options: [
      { id: "water", label: "加一杯水做平衡", effect: { health: 6, trust: 1 }, tools: ["补水卡"] },
      { id: "skip", label: "今天只要快乐", effect: { health: -3, speed: 1 } }
    ]
  },
  {
    id: "reward-five-star",
    tileType: "reward",
    eventType: "fun",
    mode: "choice",
    title: "五星鼓励",
    body: "前半程表现稳定，事务所给你发一枚小星星。",
    knowledge: "正反馈会让等待配送变成有成就感的过程。",
    options: [
      { id: "trust", label: "兑换信任加成", effect: { trust: 8 }, tools: ["信任星"] },
      { id: "safe", label: "兑换安全提醒", effect: { safety: 6 }, tools: ["安全星"] }
    ]
  },
  {
    id: "reward-sample",
    tileType: "reward",
    eventType: "fun",
    mode: "choice",
    title: "新品试喝",
    body: "商家送了一小杯新品，骑手问是否一起带上。",
    knowledge: "赠品也应标记清楚，避免过敏和忌口风险。",
    options: [
      { id: "tag", label: "标记后带上", effect: { trust: 6, safety: 3 }, tools: ["试喝杯"] },
      { id: "no", label: "婉拒赠品", effect: { safety: 5, health: 2 } }
    ]
  },
  {
    id: "reward-rest",
    tileType: "reward",
    eventType: "riderSafety",
    mode: "choice",
    title: "一分钟缓冲",
    body: "系统建议给骑手留出一分钟整理车篮。",
    knowledge: "短暂停靠整理包装，可能换来更高完整度。",
    options: [
      { id: "pause", label: "给一分钟整理", effect: { speed: -1, integrity: 8, trust: 5 } },
      { id: "go", label: "继续赶路", effect: { speed: 3, integrity: -3 } }
    ]
  },
  {
    id: "reward-name",
    tileType: "reward",
    eventType: "fun",
    mode: "choice",
    title: "订单名灵感",
    body: "系统突然想给这单取一个很会分享的名字。",
    knowledge: "命名会强化记忆点，让结果卡更有传播感。",
    options: [
      { id: "office", label: "工作日精神急救", effect: { trust: 3 } },
      { id: "steady", label: "快乐但不翻车", effect: { integrity: 3 } },
      { id: "safe", label: "安全送达小分队", effect: { safety: 3 } }
    ]
  },
  {
    id: "fork-main-road",
    tileType: "fork",
    eventType: "riderSafety",
    mode: "choice",
    title: "岔路：主路还是小巷",
    body: "主路远但稳，小巷近但容易遇到台阶。",
    knowledge: "路线选择要同时考虑时间、路况和餐品完整度。",
    options: [
      { id: "main", label: "走主路稳送", effect: { speed: -2, safety: 8, integrity: 5 } },
      { id: "alley", label: "走小巷提速", effect: { speed: 5, safety: -5, integrity: -6 } }
    ]
  },
  {
    id: "fork-pickup",
    tileType: "fork",
    eventType: "noteGame",
    mode: "choice",
    title: "岔路：先甜品还是先热食",
    body: "甜品怕化，热食怕凉，你要决定下一段取货节奏。",
    knowledge: "不同温度和形态的食物会影响取货顺序。",
    options: [
      { id: "hot", label: "热食后段取，保持温度", effect: { integrity: 6, safety: 3 } },
      { id: "dessert", label: "甜品后段取，减少融化", effect: { integrity: 7, health: 1 } },
      { id: "fast", label: "谁快先取谁", effect: { speed: 4, integrity: -3 } }
    ]
  },
  {
    id: "fork-fountain",
    tileType: "fork",
    eventType: "healthyLife",
    mode: "choice",
    title: "岔路：公园绕行",
    body: "绕公园慢一点，但你可以下楼顺手接餐走几步。",
    knowledge: "把取餐变成轻量活动，是健康生活的小技巧。",
    options: [
      { id: "park", label: "走公园线，顺便散步", effect: { speed: -2, health: 8, trust: 3 } },
      { id: "direct", label: "直线送达", effect: { speed: 3 } }
    ]
  },
  {
    id: "fork-crowd",
    tileType: "fork",
    eventType: "fun",
    mode: "choice",
    title: "岔路：朋友临时拼单",
    body: "朋友在地图另一边发来：能带一杯吗？",
    knowledge: "拼单提升社交快乐，也会提高备注和分装复杂度。",
    options: [
      { id: "join", label: "接受拼单并标记杯身", effect: { trust: 6, integrity: 2, speed: -2 }, tools: ["拼单贴"] },
      { id: "solo", label: "今天独享", effect: { speed: 2, integrity: 2 } }
    ]
  },
  {
    id: "incident-spill",
    tileType: "incident",
    eventType: "packaging",
    mode: "choice",
    title: "疑似撒漏",
    body: "袋子边缘出现一点水痕，可能是冷凝水，也可能是撒漏。",
    knowledge: "发现异常时及时停下检查，比到终点才发现更好。",
    options: [
      { id: "check", label: "停下检查并加固", effect: { speed: -2, integrity: 10, safety: 5 } },
      { id: "ignore", label: "继续赶路", effect: { speed: 3, integrity: -10, trust: -3 } }
    ]
  },
  {
    id: "incident-wrong",
    tileType: "incident",
    eventType: "foodSafety",
    mode: "choice",
    title: "疑似拿错袋",
    body: "袋子上的编号和订单尾号差一位。",
    knowledge: "核对订单号、商品数和备注，是避免错单的关键。",
    options: [
      { id: "verify", label: "回头核对编号", effect: { speed: -4, integrity: 12, safety: 7, trust: 4 } },
      { id: "guess", label: "看起来差不多先走", effect: { speed: 4, integrity: -12, safety: -6 } }
    ]
  },
  {
    id: "incident-elevator",
    tileType: "incident",
    eventType: "noteGame",
    mode: "choice",
    title: "电梯拥堵",
    body: "最后一段楼上电梯排队，餐品在车篮里等候。",
    knowledge: "选择清晰交付方式可以减少等待和晃动。",
    options: [
      { id: "front", label: "放前台自取", effect: { speed: 4, integrity: 4, trust: 3, health: 2 } },
      { id: "downstairs", label: "楼下碰头", effect: { speed: 2, health: 4, trust: 5 } },
      { id: "wait", label: "继续等上楼", effect: { speed: -5, integrity: 1, trust: -2 } }
    ]
  },
  {
    id: "incident-battery",
    tileType: "incident",
    eventType: "riderSafety",
    mode: "choice",
    title: "电量告急",
    body: "骑手手机电量只剩 6%，定位可能中断。",
    knowledge: "提前发送关键信息，能降低最后一公里沟通风险。",
    options: [
      { id: "send", label: "立刻发取餐点和门牌", effect: { trust: 8, speed: 2, integrity: 2 } },
      { id: "wait", label: "等联系不上再说", effect: { trust: -6, speed: -4 } }
    ]
  },
  {
    id: "destination-photo",
    tileType: "destination",
    eventType: "fun",
    mode: "choice",
    title: "送达拍照",
    body: "订单抵达，系统问是否记录本单护送路线。",
    knowledge: "可视化记录让最终小票更有成就感。",
    options: [
      { id: "save", label: "记录路线并生成小票", effect: { trust: 4 } },
      { id: "skip", label: "直接完成", effect: {} }
    ]
  },
  {
    id: "destination-check",
    tileType: "destination",
    eventType: "packaging",
    mode: "choice",
    title: "终点验货",
    body: "到达后可以快速检查杯盖、汤袋和小票。",
    knowledge: "终点检查能帮助用户理解每个选择的后果。",
    options: [
      { id: "check", label: "完成终点验货", effect: { integrity: 4, safety: 2 } },
      { id: "eat", label: "马上开吃", effect: { trust: 2 } }
    ]
  },
  {
    id: "destination-share",
    tileType: "destination",
    eventType: "fun",
    mode: "choice",
    title: "分享结果",
    body: "你获得一次分享文案增幅机会。",
    knowledge: "分享卡要把过程和人格都讲清楚。",
    options: [
      { id: "persona", label: "突出美食 MBTI", effect: { trust: 3 } },
      { id: "route", label: "突出护送评级", effect: { integrity: 2 } }
    ]
  },
  {
    id: "destination-thanks",
    tileType: "destination",
    eventType: "riderSafety",
    mode: "choice",
    title: "送达感谢",
    body: "最后一句话也会影响信任值。",
    knowledge: "良性反馈能让模拟下单更有温度。",
    options: [
      { id: "thanks", label: "谢谢，辛苦了", effect: { trust: 6 } },
      { id: "silent", label: "默默收餐", effect: { trust: 1 } }
    ]
  }
];
