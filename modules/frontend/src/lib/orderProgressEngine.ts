import type {
  CartEntry,
  Category,
  DeliveryScore,
  EscortOutcome,
  Mood,
  OptionChoice,
  OrderContext,
  OrderContextFlag,
  OrderProgressChoice,
  OrderProgressEvent,
  OrderProgressGameState,
  OrderProgressNode,
  OrderResolvedEvent,
  PersonaAxisKey,
  ResultJourneyEvent
} from "../types";

export const initialOrderProgressScore: DeliveryScore = {
  speed: 72,
  safety: 70,
  health: 68,
  integrity: 76,
  trust: 70
};

const destinationByMood: Record<Mood, string> = {
  tired: "家",
  hungry: "家",
  emo: "家",
  overtime: "公司",
  slacking: "公司",
  celebration: "朋友据点",
  date: "商场门口",
  crazy: "快乐据点",
  afterWorkout: "健身房",
  lateNight: "家"
};

export const orderProgressNodes: OrderProgressNode[] = [
  { id: "merchant-accepted", phase: "merchant", label: "商家接单", shortLabel: "接", description: "确认订单已经进入制作队列" },
  { id: "merchant-spec", phase: "merchant", label: "规格确认", shortLabel: "规", description: "糖冰辣度、备注和口感开始拉扯" },
  { id: "merchant-stock", phase: "merchant", label: "备餐变化", shortLabel: "备", description: "缺货、现做、排队都会影响期待" },
  { id: "merchant-package", phase: "merchant", label: "出餐包装", shortLabel: "包", description: "决定到手时还像不像你想象中那样快乐" },
  { id: "rider-pickup", phase: "rider", label: "骑手取餐", shortLabel: "取", description: "骑手和商家交接，第一轮沟通开始" },
  { id: "rider-road", phase: "rider", label: "路上沟通", shortLabel: "路", description: "天气、路况和语气共同影响这单的命运" },
  { id: "rider-arrival", phase: "rider", label: "到达附近", shortLabel: "达", description: "门禁、楼栋、前台和电话都可能临门一脚" },
  { id: "arrival-check", phase: "arrival", label: "收餐确认", shortLabel: "收", description: "第一反应会暴露你的吃商人格" }
];

const persona = (effect: Partial<Record<PersonaAxisKey, number>>) => effect;

const choice = (
  id: string,
  label: string,
  detail: string,
  effect: Partial<DeliveryScore>,
  personaEffect: Partial<Record<PersonaAxisKey, number>>,
  badges: string[] = []
): OrderProgressChoice => ({ id, label, detail, effect, personaEffect, badges });

const merchantEvents: OrderProgressEvent[] = [
  {
    id: "m-accepted-peak",
    phase: "merchant",
    nodeIds: ["merchant-accepted"],
    group: "accepted",
    title: "商家提示现在是出餐高峰",
    sender: "商家",
    body: "现在单量有点多，预计会比平时慢 6 分钟。你希望我们优先保证速度，还是按原备注慢慢做？",
    insight: "这是典型的速度和体验完整度取舍。",
    tone: "orange",
    visual: "🏪",
    eventType: "noteGame",
    tileType: "merchant",
    weight: 4,
    choices: [
      choice("steady", "按原备注做，不急这几分钟", "完整体验优先，期待更稳。", { speed: -3, integrity: 6, trust: 4 }, persona({ driver: -4, novelty: -2 }), ["快乐完整主义者"]),
      choice("fast", "可以快一点，细节别太纠结", "更像当下需要立刻被安抚。", { speed: 5, integrity: -3 }, persona({ driver: 5, discipline: 3 }), ["即时快乐派"]),
      choice("ask", "先问一句大概还要多久", "不催，但要掌握局面。", { safety: 2, trust: 3 }, persona({ driver: -3, novelty: -2 }), ["沟通控场型"])
    ]
  },
  {
    id: "m-accepted-note",
    phase: "merchant",
    nodeIds: ["merchant-accepted"],
    group: "note",
    title: "商家说备注有点长",
    sender: "商家",
    body: "你这段备注我们看到了，但信息有点多。要不要帮你简化成最关键的三条？",
    insight: "真正有效的备注不是长，而是可执行。",
    tone: "purple",
    visual: "📝",
    eventType: "noteGame",
    tileType: "note",
    requiredFlags: ["hasNotes"],
    weight: 5,
    choices: [
      choice("short", "简化成三条关键要求", "控制感还在，但更容易执行。", { speed: 2, integrity: 6, trust: 5 }, persona({ driver: -5, novelty: -4 }), ["备注谈判家"]),
      choice("keep", "保留完整备注，我真的很在意", "细节被完整表达，但执行成本变高。", { speed: -3, integrity: 2, trust: -1 }, persona({ driver: 2, novelty: -5 }), ["嘴上随便但备注很细型"]),
      choice("core", "只保留最不能妥协的一条", "愿意放手一部分细节。", { speed: 4, trust: 2 }, persona({ driver: -2, novelty: 1 }), ["轻量沟通型"])
    ]
  },
  {
    id: "m-accepted-generic",
    phase: "merchant",
    nodeIds: ["merchant-accepted"],
    group: "accepted",
    title: "商家发来接单确认",
    sender: "商家",
    body: "订单已经接到。现在可以最后确认一次：你更希望这单稳定复刻，还是接受一点小惊喜？",
    insight: "复购和尝鲜的分岔，通常从接单那刻就开始了。",
    tone: "gold",
    visual: "🧾",
    eventType: "fun",
    tileType: "merchant",
    weight: 2,
    choices: [
      choice("classic", "按经典做，别给我惊喜", "稳定复购型回答。", { integrity: 5, safety: 2 }, persona({ novelty: -7, driver: -2 }), ["稳定复购派"]),
      choice("surprise", "可以有一点店员推荐", "给新品留一扇门。", { speed: -1, trust: 3 }, persona({ novelty: 8, scene: 1 }), ["尝鲜冒险家"]),
      choice("balanced", "别太离谱就行", "愿意尝试，但保留边界。", { trust: 3, health: 1 }, persona({ novelty: 2, driver: -1 }), ["有边界尝鲜"])
    ]
  },
  {
    id: "m-spec-sugar",
    phase: "merchant",
    nodeIds: ["merchant-spec"],
    group: "spec-sugar",
    title: "少糖备注和口感发生冲突",
    sender: "奶茶店",
    body: "这杯如果半糖，茶味会更明显；正常糖会更顺口。你要保留少糖，还是尊重今天的快乐？",
    insight: "不是标准答案，是你如何和快乐谈判。",
    tone: "green",
    visual: "🥤",
    eventType: "healthyLife",
    tileType: "healthQuiz",
    requiredFlags: ["hasMilkTea"],
    weight: 5,
    choices: [
      choice("half", "保留半糖，我要清醒的快乐", "平衡感更强。", { health: 7, integrity: 2 }, persona({ driver: -5, discipline: -7 }), ["低糖谈判家"]),
      choice("normal", "改正常糖，今天需要顺口", "即时快乐更高。", { speed: 1, health: -4, integrity: 3 }, persona({ driver: 6, discipline: 7 }), ["快乐优先"]),
      choice("tea", "半糖，但茶底换清爽一点", "折中但很会点。", { health: 5, trust: 3 }, persona({ driver: -3, novelty: 3 }), ["聪明妥协型"])
    ]
  },
  {
    id: "m-spec-ice",
    phase: "merchant",
    nodeIds: ["merchant-spec"],
    group: "spec-ice",
    title: "少冰会影响满杯状态",
    sender: "奶茶店",
    body: "少冰可能不会满杯，正常冰拍照更好看。你怎么选？",
    insight: "体感、照片和心理满足感在同一杯里打架。",
    tone: "blue",
    visual: "🧊",
    eventType: "packaging",
    tileType: "note",
    requiredFlags: ["hasMilkTea"],
    choices: [
      choice("less", "少冰，不满也接受", "体感优先。", { health: 3, integrity: 2 }, persona({ driver: -4, discipline: -3 }), ["体感优先"]),
      choice("normal", "正常冰，视觉满足也重要", "仪式感更强。", { speed: 1, health: -2, integrity: 3 }, persona({ driver: 4, scene: 2 }), ["视觉仪式派"]),
      choice("separate", "少冰，麻烦标注正常液位", "细节控制拉满。", { speed: -1, integrity: 5, trust: 2 }, persona({ driver: -2, novelty: -5 }), ["细节控制型"])
    ]
  },
  {
    id: "m-spec-coffee",
    phase: "merchant",
    nodeIds: ["merchant-spec"],
    group: "spec-coffee",
    title: "咖啡豆临时更换",
    sender: "咖啡店",
    body: "你选的豆子刚好用完，可以换成更酸一点的浅烘，也可以等下一锅。",
    insight: "咖啡选择很容易暴露尝鲜和稳定复购的倾向。",
    tone: "orange",
    visual: "☕",
    eventType: "fun",
    tileType: "merchant",
    requiredFlags: ["hasCoffee"],
    choices: [
      choice("wait", "等原豆，我就想要那个味", "稳定复购更明显。", { speed: -4, integrity: 7 }, persona({ novelty: -8, driver: -2 }), ["稳定复购派"]),
      choice("new", "换浅烘，今天试试", "尝鲜值上升。", { speed: 2, trust: 2 }, persona({ novelty: 9, driver: 2 }), ["咖啡尝鲜派"]),
      choice("milk", "换可以，但奶味帮我压一下酸", "有边界地冒险。", { integrity: 3, trust: 3 }, persona({ novelty: 4, driver: -2 }), ["理性尝鲜"])
    ]
  },
  {
    id: "m-spec-spicy",
    phase: "merchant",
    nodeIds: ["merchant-spec"],
    group: "spec-spicy",
    title: "辣度要不要降一档",
    sender: "热食店",
    body: "店员提醒今天这锅辣油比较冲。你要原辣，还是降一档更稳？",
    insight: "这一题测的是你要爽感，还是要后半场不翻车。",
    tone: "red",
    visual: "🌶️",
    eventType: "healthyLife",
    tileType: "healthQuiz",
    requiredFlags: ["hasSpicy"],
    choices: [
      choice("hot", "原辣，今天就是要醒脑", "刺激感优先。", { health: -4, speed: 2 }, persona({ driver: 7, discipline: 6, novelty: 3 }), ["辣味探索"]),
      choice("mild", "降一档，快乐要可持续", "后劲更稳。", { health: 6, integrity: 3 }, persona({ driver: -4, discipline: -6 }), ["可持续快乐"]),
      choice("sauce", "辣油分开放，我自己控制", "控制感和爽感都要。", { integrity: 6, trust: 2 }, persona({ driver: -2, novelty: -3 }), ["自控加辣型"])
    ]
  },
  {
    id: "m-spec-portion",
    phase: "merchant",
    nodeIds: ["merchant-spec"],
    group: "spec-portion",
    title: "分量升级只差几元",
    sender: "商家",
    body: "主食可以加量，价格差不多，但吃完会更撑。你要升级吗？",
    insight: "饱腹、预算和负罪感会一起参与决策。",
    tone: "gold",
    visual: "🍱",
    eventType: "healthyLife",
    tileType: "healthQuiz",
    requiredFlags: ["hasFood"],
    choices: [
      choice("large", "升级，今天要吃够", "满足感更强。", { speed: 1, health: -4, integrity: 2 }, persona({ driver: 5, discipline: 6 }), ["满足感优先"]),
      choice("normal", "不升级，刚好就行", "边界清楚。", { health: 5, trust: 1 }, persona({ driver: -4, discipline: -5 }), ["刚好主义"]),
      choice("share", "升级但分一半明天吃", "会自我谈判。", { health: 4, integrity: 3 }, persona({ driver: -2, scene: -2, discipline: -3 }), ["快乐分期"])
    ]
  },
  {
    id: "m-stock-boba",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "stock-boba",
    title: "珍珠刚好卖完",
    sender: "奶茶店",
    body: "珍珠暂时没了，可以等 8 分钟新一锅，也可以换成椰果或芋圆。",
    insight: "珍珠不是配料，是很多人的订单主权。",
    tone: "orange",
    visual: "🧋",
    eventType: "fun",
    tileType: "merchant",
    requiredFlags: ["hasBoba"],
    weight: 5,
    choices: [
      choice("wait", "等新一锅，珍珠不能退让", "稳定且执着。", { speed: -6, integrity: 8, trust: 2 }, persona({ novelty: -7, driver: 2 }), ["珍珠主权派"]),
      choice("swap", "换芋圆，口感相近就行", "灵活接受替代。", { speed: 3, integrity: 2 }, persona({ novelty: 3, driver: -1 }), ["弹性替换型"]),
      choice("new", "换店员推荐的小料", "尝鲜倾向更明显。", { trust: 4, integrity: -1 }, persona({ novelty: 8, scene: 1 }), ["隐藏小料探索"])
    ]
  },
  {
    id: "m-stock-topping",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "stock-topping",
    title: "加料组合需要调整",
    sender: "商家",
    body: "你选的其中一种小料库存不够。要保留核心小料，还是换成双倍另一种？",
    insight: "这题不是缺货，是你如何定义“这单的灵魂”。",
    tone: "purple",
    visual: "🍡",
    eventType: "fun",
    tileType: "merchant",
    requiredFlags: ["hasToppings"],
    choices: [
      choice("core", "保留我最想要的那一种", "目标明确。", { integrity: 6, trust: 2 }, persona({ novelty: -4, driver: -2 }), ["核心需求清楚"]),
      choice("double", "双倍另一种，也挺爽", "满足感优先。", { health: -2, integrity: 2 }, persona({ driver: 4, discipline: 4 }), ["加料快乐型"]),
      choice("light", "少一种也行，别太甜", "轻负担。", { health: 6, speed: 2 }, persona({ driver: -4, discipline: -6 }), ["轻负担下单"])
    ]
  },
  {
    id: "m-stock-dessert",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "stock-dessert",
    title: "甜品口味只剩最后两款",
    sender: "甜品柜",
    body: "你选的口味售罄了，剩下招牌款和新品款。你要哪个？",
    insight: "甜品替换最能看出复购安全感和新鲜感的拉扯。",
    tone: "gold",
    visual: "🍰",
    eventType: "fun",
    tileType: "merchant",
    requiredFlags: ["hasDessert"],
    choices: [
      choice("classic", "招牌款，稳一点", "安全感优先。", { integrity: 5, safety: 2 }, persona({ novelty: -7 }), ["招牌复购型"]),
      choice("new", "新品款，来都来了", "新鲜感优先。", { trust: 3, integrity: -1 }, persona({ novelty: 9, driver: 2 }), ["甜品冒险家"]),
      choice("skip", "甜品取消，别影响主单", "理性切割。", { speed: 4, health: 3, integrity: -2 }, persona({ driver: -5, discipline: -5 }), ["理性止损"])
    ]
  },
  {
    id: "m-stock-light",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "stock-light",
    title: "轻食配料需要替换",
    sender: "轻食店",
    body: "牛油果没有了，可以换成玉米或鸡蛋。你更在意口感还是营养？",
    insight: "健康选择也有偏好，不是越克制越好。",
    tone: "green",
    visual: "🥗",
    eventType: "healthyLife",
    tileType: "healthQuiz",
    requiredFlags: ["hasLightFood"],
    choices: [
      choice("egg", "换鸡蛋，蛋白质补上", "目标很明确。", { health: 7, integrity: 2 }, persona({ driver: -6, discipline: -8 }), ["恢复局玩家"]),
      choice("corn", "换玉米，口感甜一点", "快乐也要在。", { health: 3, integrity: 2 }, persona({ driver: 1, discipline: -3 }), ["轻甜平衡"]),
      choice("cancel", "这份取消，别勉强", "边界感强。", { speed: 3, health: 2, integrity: -3 }, persona({ driver: -4, novelty: -2 }), ["不勉强型"])
    ]
  },
  {
    id: "m-wait-boba",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "wait-boba",
    title: "小料刚煮好，需要等冷却",
    sender: "奶茶店",
    body: "小料刚出锅，马上装会影响温度和口感。要等一会儿吗？",
    insight: "等，是为了让期待不在第一口翻车。",
    tone: "orange",
    visual: "♨️",
    eventType: "foodSafety",
    tileType: "foodSafetyQuiz",
    requiredFlags: ["hasMilkTea", "hasToppings"],
    choices: [
      choice("wait", "等冷却，第一口要稳", "完整度更高。", { speed: -4, safety: 4, integrity: 7 }, persona({ driver: -4, novelty: -3 }), ["第一口完整主义"]),
      choice("now", "直接装，我现在就想喝", "即时满足。", { speed: 5, integrity: -4 }, persona({ driver: 6, discipline: 3 }), ["立刻喝型"]),
      choice("lessice", "等一下，同时少冰", "兼顾温度和体感。", { health: 3, integrity: 4 }, persona({ driver: -2, discipline: -4 }), ["聪明温控"])
    ]
  },
  {
    id: "m-wait-hotfood",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "wait-hotfood",
    title: "热食还要现做",
    sender: "热食店",
    body: "这份热食现在做会更好吃，但要多等 7 分钟。也可以拿现成的。",
    insight: "速度和热乎感，经常不能同时满分。",
    tone: "red",
    visual: "🍜",
    eventType: "foodSafety",
    tileType: "merchant",
    requiredFlags: ["hasHotFood"],
    choices: [
      choice("fresh", "等现做，热乎感重要", "体验完整。", { speed: -5, integrity: 8, safety: 2 }, persona({ driver: -2, novelty: -2 }), ["热乎感守护者"]),
      choice("ready", "拿现成的，先吃上", "效率优先。", { speed: 5, integrity: -4 }, persona({ driver: 4, discipline: 2 }), ["效率优先"]),
      choice("split", "现做，但饮品先分开放", "考虑包装风险。", { speed: -4, integrity: 9, safety: 5 }, persona({ driver: -5, novelty: -4 }), ["冷热分袋"])
    ]
  },
  {
    id: "m-wait-coffee",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "wait-coffee",
    title: "咖啡机排队",
    sender: "咖啡店",
    body: "前面还有几杯，预计等 5 分钟。可以换成冷萃更快。",
    insight: "清醒续命时，等待本身也是成本。",
    tone: "blue",
    visual: "☕",
    eventType: "noteGame",
    tileType: "merchant",
    requiredFlags: ["hasCoffee"],
    choices: [
      choice("wait", "等原单，口味别改", "稳定感更强。", { speed: -3, integrity: 5 }, persona({ novelty: -6, driver: -2 }), ["口味稳定派"]),
      choice("coldbrew", "换冷萃，快点也清醒", "效率和清醒优先。", { speed: 4, trust: 2 }, persona({ novelty: 4, driver: -1 }), ["效率续命"]),
      choice("decaf", "顺便换低因，别心跳太快", "身体感受优先。", { health: 6, speed: -1 }, persona({ driver: -6, discipline: -8 }), ["清醒不心慌"])
    ]
  },
  {
    id: "m-wait-dessert",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "wait-dessert",
    title: "甜品需要现切",
    sender: "甜品柜",
    body: "现切更好看，但等一会儿；预切款更快，但边缘没那么漂亮。",
    insight: "你是在买甜品，还是在买一张能截图的快乐？",
    tone: "purple",
    visual: "🍮",
    eventType: "fun",
    tileType: "merchant",
    requiredFlags: ["hasDessert"],
    choices: [
      choice("pretty", "等现切，好看很重要", "仪式感更高。", { speed: -3, integrity: 6 }, persona({ scene: 4, driver: 2 }), ["拍照友好"]),
      choice("fast", "预切也行，快点到", "效率优先。", { speed: 4, integrity: -2 }, persona({ driver: -1, novelty: -1 }), ["快点吃型"]),
      choice("small", "换小份现切，别太撑", "精致且克制。", { health: 4, integrity: 3 }, persona({ driver: -3, discipline: -6, scene: 2 }), ["精致克制"])
    ]
  },
  {
    id: "m-pack-multicup",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "pack-multicup",
    title: "多杯饮品容易拿错",
    sender: "商家",
    body: "你这单有多杯饮品，要不要帮你把杯身标清楚？会稍微慢一点。",
    insight: "多杯订单的快乐，常常毁在“这杯是谁的”。",
    tone: "blue",
    visual: "🥤",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasMultiCup"],
    weight: 5,
    choices: [
      choice("label", "标清楚，别拿错", "完整度更高。", { speed: -1, integrity: 8, trust: 4 }, persona({ driver: -4, scene: 4, novelty: -3 }), ["杯身标记师"]),
      choice("memory", "不用标，我自己分得清", "自信但有风险。", { speed: 2, integrity: -4 }, persona({ driver: 3, novelty: 2 }), ["自信分杯"]),
      choice("simple", "只标无糖/少冰那几杯", "抓关键差异。", { integrity: 6, trust: 3 }, persona({ driver: -3, scene: 3 }), ["重点标注型"])
    ]
  },
  {
    id: "m-pack-hotcold",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "pack-hotcold",
    title: "冷热要不要分袋",
    sender: "商家",
    body: "你这单有冷饮和热食，同袋更快，分袋更稳。你怎么选？",
    insight: "这不是包装细节，是到手口感的保险。",
    tone: "orange",
    visual: "🛍️",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasMixedTemperature"],
    weight: 6,
    choices: [
      choice("split", "冷热分袋，慢一点也行", "完整度和安心值提升。", { speed: -2, safety: 6, integrity: 9 }, persona({ driver: -5, novelty: -4 }), ["冷热分袋"]),
      choice("same", "同袋吧，我想快点", "速度优先但承担风险。", { speed: 4, integrity: -6, safety: -3 }, persona({ driver: 5, discipline: 2 }), ["快点到手"]),
      choice("drinkbag", "饮品单独拎，热食正常装", "折中方案。", { speed: -1, integrity: 7, trust: 3 }, persona({ driver: -3, novelty: -2 }), ["包装妥协家"])
    ]
  },
  {
    id: "m-pack-soup",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "pack-soup",
    title: "汤粉密封需要确认",
    sender: "热食店",
    body: "汤类打包可以加密封袋，但会多等一小会儿。你要加吗？",
    insight: "汤类订单的安全感来自“不要洒”。",
    tone: "red",
    visual: "🍲",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasSoup"],
    choices: [
      choice("seal", "加密封袋，别洒最重要", "完整值提升。", { speed: -1, integrity: 10, safety: 5 }, persona({ driver: -5, novelty: -4 }), ["防撒漏工程师"]),
      choice("normal", "普通打包就行", "省时间。", { speed: 3, integrity: -5 }, persona({ driver: 3 }), ["随缘收餐"]),
      choice("separate", "汤和粉分开放", "口感和完整都更稳。", { speed: -3, integrity: 9, trust: 2 }, persona({ driver: -4, novelty: -5 }), ["汤粉分离派"])
    ]
  },
  {
    id: "m-pack-fried",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "pack-fried",
    title: "炸物会不会回潮",
    sender: "小吃店",
    body: "炸物密封更稳，但可能回潮；透气包装更脆，但香味会跑出来。",
    insight: "脆感和稳定感，不能全都要满分。",
    tone: "gold",
    visual: "🍗",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasFried"],
    choices: [
      choice("crisp", "透气包装，我要脆", "口感优先。", { integrity: 5, safety: -1 }, persona({ driver: 4, novelty: 2 }), ["脆感优先"]),
      choice("seal", "密封包装，别出意外", "稳定优先。", { safety: 4, integrity: 3 }, persona({ driver: -4, novelty: -4 }), ["稳定包装派"]),
      choice("paper", "吸油纸隔一下", "快乐和负担都照顾。", { health: 4, integrity: 5 }, persona({ driver: -3, discipline: -5 }), ["少油谈判家"])
    ]
  },
  {
    id: "m-pack-cake",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "pack-cake",
    title: "蛋糕需要防晃",
    sender: "甜品柜",
    body: "甜品路上容易晃，店员建议加固定托。要等 2 分钟。",
    insight: "好看的甜品，本质上也是一种易碎快乐。",
    tone: "purple",
    visual: "🍰",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasDessert"],
    choices: [
      choice("holder", "加固定托，好看不能塌", "仪式感和完整度提升。", { speed: -2, integrity: 9, trust: 3 }, persona({ scene: 3, driver: -3 }), ["甜品守护者"]),
      choice("skip", "不用，快点送来", "即时满足。", { speed: 3, integrity: -4 }, persona({ driver: 4 }), ["快点吃型"]),
      choice("photo", "加托，麻烦放小票贴纸", "分享感增强。", { speed: -2, integrity: 7, trust: 4 }, persona({ scene: 6, novelty: 1 }), ["截图友好"])
    ]
  },
  {
    id: "m-discount-near",
    phase: "merchant",
    nodeIds: ["merchant-spec", "merchant-stock"],
    group: "discount",
    title: "满减只差一点点",
    sender: "系统",
    body: "再加一点就能触发优惠。你是真的需要，还是只是被数字推着走？",
    insight: "凑单快乐，是现代下单里最危险的快乐。",
    tone: "gold",
    visual: "🏷️",
    eventType: "fun",
    tileType: "reward",
    requiredFlags: ["nearDiscount"],
    weight: 5,
    choices: [
      choice("snack", "加个小食，快乐最大化", "爽感上升，负担也上升。", { speed: -1, health: -4, integrity: 2 }, persona({ driver: 6, discipline: 5 }), ["满减猎人"]),
      choice("water", "加无糖饮，凑单也要平衡", "会自我修正。", { health: 6, safety: 2 }, persona({ driver: -3, discipline: -7 }), ["聪明凑单"]),
      choice("skip", "不凑，为优惠加购不值得", "理性规划。", { health: 4, trust: 2 }, persona({ driver: -7, novelty: -3 }), ["预算清醒"])
    ]
  },
  {
    id: "m-discount-upgrade",
    phase: "merchant",
    nodeIds: ["merchant-spec"],
    group: "discount-upgrade",
    title: "升级大杯的诱惑",
    sender: "系统",
    body: "大杯只多几元，看起来很划算。你要升级吗？",
    insight: "大杯不是容量问题，是你今天需要多少安慰。",
    tone: "orange",
    visual: "🥤",
    eventType: "fun",
    tileType: "reward",
    requiredFlags: ["hasDrink"],
    choices: [
      choice("large", "升级，今天值得大杯", "快乐期待上涨。", { health: -2, integrity: 3 }, persona({ driver: 5, discipline: 4 }), ["大杯安慰"]),
      choice("normal", "不升级，刚好才舒服", "边界清楚。", { health: 4, trust: 2 }, persona({ driver: -5, discipline: -4 }), ["刚好主义"]),
      choice("share", "升级但分给朋友一半", "社交分享感上升。", { trust: 3, health: 1 }, persona({ scene: 7, driver: 1 }), ["分享型大杯"])
    ]
  },
  {
    id: "m-discount-balance",
    phase: "merchant",
    nodeIds: ["merchant-spec"],
    group: "health-balance",
    title: "系统发现本单有点放纵",
    sender: "系统",
    body: "这一单快乐很足，但糖油也偏高。要不要做一个小调整？",
    insight: "这不是劝退，是看你怎么给快乐找台阶。",
    tone: "green",
    visual: "💚",
    eventType: "healthyLife",
    tileType: "healthQuiz",
    requiredFlags: ["isHighSugarOrOil"],
    choices: [
      choice("adjust", "加一个低负担搭配", "平衡值上升。", { health: 7, safety: 2 }, persona({ driver: -4, discipline: -8 }), ["低糖谈判家"]),
      choice("split", "保持原单，但分两次吃", "自我谈判。", { health: 5, integrity: 1 }, persona({ driver: -2, discipline: -5 }), ["快乐分期"]),
      choice("full", "今天就要完整快乐", "即时快乐更明显。", { health: -5, speed: 2 }, persona({ driver: 7, discipline: 6 }), ["完整快乐派"])
    ]
  },
  {
    id: "m-complex-friend",
    phase: "merchant",
    nodeIds: ["merchant-accepted"],
    group: "friend",
    title: "朋友突然想拼单",
    sender: "朋友",
    body: "你点哪家？帮我也带一杯，但我不要太甜、不要太冰、别太贵。",
    insight: "拼单会暴露你的社交体贴和边界感。",
    tone: "purple",
    visual: "👥",
    eventType: "noteGame",
    tileType: "note",
    requiredFlags: ["isSocial"],
    choices: [
      choice("accept", "接，顺手帮你配一杯", "社交体贴上升，复杂度上升。", { speed: -3, integrity: -1, trust: 6 }, persona({ scene: 9, driver: -1 }), ["社交拼单协调员"]),
      choice("link", "我发你链接，你自己选更准", "边界清楚。", { speed: 2, trust: 3 }, persona({ scene: 2, driver: -4 }), ["边界清楚"]),
      choice("recommend", "我直接推荐低糖招牌", "体贴但不接管全部。", { trust: 5, health: 2 }, persona({ scene: 6, novelty: -2 }), ["推荐型朋友"])
    ]
  },
  {
    id: "m-complex-multishop",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "multishop",
    title: "多店订单节奏不同",
    sender: "系统",
    body: "几家店出餐速度不一样。你希望先取快的，还是等齐再走？",
    insight: "多店订单最考验你对完整体验的耐心。",
    tone: "blue",
    visual: "🧭",
    eventType: "packaging",
    tileType: "fork",
    requiredFlags: ["hasMultipleShops"],
    choices: [
      choice("together", "等齐再走，整体更稳", "完整度上升。", { speed: -3, integrity: 7, trust: 3 }, persona({ driver: -5, novelty: -3 }), ["多店协调员"]),
      choice("fast", "先取快的，别全卡住", "速度优先。", { speed: 4, integrity: -2 }, persona({ driver: 3, novelty: 2 }), ["效率派"]),
      choice("coldlast", "冷饮最后取，热食先准备", "策略感更强。", { integrity: 8, safety: 4 }, persona({ driver: -4, novelty: -1 }), ["温度策略师"])
    ]
  },
  {
    id: "m-package-generic",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "pack-generic",
    title: "出餐前最后确认",
    sender: "商家",
    body: "餐品准备好了。要不要把小票贴在袋子上，方便到手核对？",
    insight: "核对不是不信任，是给快乐上保险。",
    tone: "orange",
    visual: "🛍️",
    eventType: "packaging",
    tileType: "packaging",
    weight: 2,
    choices: [
      choice("receipt", "贴小票，方便核对", "完整值上升。", { speed: -1, integrity: 5, trust: 3 }, persona({ driver: -4, novelty: -3 }), ["小票核对派"]),
      choice("skip", "不用，直接出餐", "速度更快。", { speed: 3 }, persona({ driver: 2, novelty: 1 }), ["随缘接受"]),
      choice("photo", "出餐前拍照确认一下", "控制感更强。", { speed: -2, integrity: 6 }, persona({ driver: -2, novelty: -4 }), ["确认型下单"])
    ]
  },
  {
    id: "m-stock-generic",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "stock-generic",
    title: "商家询问是否接受小调整",
    sender: "商家",
    body: "当前制作条件和你想象中有一点差异，但不影响主体。你希望我们直接按最接近的方案做吗？",
    insight: "真实下单里，很多选择不是对错，而是你愿不愿意接受轻微偏差。",
    tone: "gold",
    visual: "🍽️",
    eventType: "noteGame",
    tileType: "merchant",
    weight: 2,
    choices: [
      choice("close", "可以，接近原方案就行", "弹性接受。", { speed: 3, trust: 3 }, persona({ novelty: 2, driver: 1 }), ["弹性替换型"]),
      choice("exact", "还是尽量按原单来", "稳定和控制感更强。", { speed: -2, integrity: 5 }, persona({ novelty: -5, driver: -2 }), ["稳定复购派"]),
      choice("recommend", "你推荐一个更好吃的做法", "把选择权交给经验。", { trust: 5, integrity: 1 }, persona({ novelty: 5, scene: 1 }), ["店员信任型"])
    ]
  }
];

const extraMerchantEvents: OrderProgressEvent[] = [
  {
    id: "m-extra-priority-window",
    phase: "merchant",
    nodeIds: ["merchant-accepted", "merchant-spec"],
    group: "extra-priority-window",
    title: "商家问你要不要插队优先做",
    sender: "商家",
    body: "现在可以帮你优先排到前面，但备注细节可能没那么慢慢确认。你要抢时间吗？",
    insight: "吃商测试里，速度焦虑和体验完整度经常在第一步就分岔。",
    tone: "orange",
    visual: "⏱️",
    eventType: "noteGame",
    tileType: "merchant",
    choices: [
      choice("priority", "优先做，先救急", "即时需求最强。", { speed: 6, integrity: -3, trust: -1 }, persona({ driver: 6, discipline: 3 }), ["救急型下单"]),
      choice("normal", "按正常顺序，别牺牲细节", "稳定感更高。", { speed: -2, integrity: 5, safety: 2 }, persona({ driver: -5, novelty: -3 }), ["稳定复购派"]),
      choice("key", "只保留关键备注再优先", "会抓重点。", { speed: 3, integrity: 3, trust: 3 }, persona({ driver: -2, novelty: -1 }), ["关键需求型"])
    ]
  },
  {
    id: "m-extra-staff-combo",
    phase: "merchant",
    nodeIds: ["merchant-accepted", "merchant-stock"],
    group: "extra-staff-combo",
    title: "店员说今天有隐藏搭配",
    sender: "商家",
    body: "店员说这单可以换成今天更顺口的隐藏搭配，不加钱，但会和你原来想象不太一样。",
    insight: "愿不愿意把选择权交出去，是尝鲜人格的重要证据。",
    tone: "purple",
    visual: "✨",
    eventType: "fun",
    tileType: "merchant",
    choices: [
      choice("try", "可以，给我隐藏搭配", "尝鲜值上升。", { trust: 4, integrity: -1 }, persona({ novelty: 9, scene: 2 }), ["隐藏菜单探索"]),
      choice("safe", "不用，按我原来点的做", "复购稳定。", { integrity: 5, safety: 2 }, persona({ novelty: -8, driver: -2 }), ["稳定复购派"]),
      choice("half", "只换一处，别全改", "有边界尝鲜。", { trust: 3, integrity: 2 }, persona({ novelty: 3, driver: -3 }), ["有边界尝鲜"])
    ]
  },
  {
    id: "m-extra-receipt-name",
    phase: "merchant",
    nodeIds: ["merchant-accepted", "merchant-package"],
    group: "extra-receipt-name",
    title: "商家问要不要给袋子写名字",
    sender: "商家",
    body: "如果这单要带去办公室或和朋友一起吃，可以在袋子上标名字和主品类。",
    insight: "分享型订单最怕到手以后大家一起猜。",
    tone: "blue",
    visual: "🏷️",
    eventType: "packaging",
    tileType: "packaging",
    choices: [
      choice("mark", "写名字和主品类", "分发更稳。", { integrity: 6, trust: 4 }, persona({ scene: 5, driver: -4 }), ["分发协调员"]),
      choice("none", "不用，我自己分", "简单省事。", { speed: 3, integrity: -2 }, persona({ driver: 2, novelty: 1 }), ["自信分发"]),
      choice("only", "只标特殊备注那份", "抓关键差异。", { integrity: 5, trust: 2 }, persona({ driver: -3, scene: 2 }), ["重点标注型"])
    ]
  },
  {
    id: "m-extra-coupon-switch",
    phase: "merchant",
    nodeIds: ["merchant-accepted"],
    group: "extra-coupon-switch",
    title: "活动券突然弹出来",
    sender: "系统",
    body: "现在加 6 元小食可以用券，账面看起来更划算，但你原本没想吃它。",
    insight: "凑单不是省钱题，是自我说服题。",
    tone: "gold",
    visual: "🎟️",
    eventType: "fun",
    tileType: "reward",
    requiredFlags: ["nearDiscount"],
    choices: [
      choice("add", "加，小快乐也算快乐", "快乐冲动上升。", { speed: 2, health: -3, trust: 2 }, persona({ driver: 5, discipline: 4 }), ["快乐投资家"]),
      choice("skip", "不加，别被券牵着走", "预算清醒。", { health: 4, safety: 2 }, persona({ driver: -6, discipline: -5 }), ["预算清醒"]),
      choice("swap", "用无糖饮凑单", "会优化方案。", { health: 6, integrity: 1 }, persona({ driver: -4, discipline: -7 }), ["聪明凑单"])
    ]
  },
  {
    id: "m-extra-caffeine-level",
    phase: "merchant",
    nodeIds: ["merchant-spec", "merchant-stock"],
    group: "extra-caffeine-level",
    title: "咖啡因浓度要不要拉满",
    sender: "咖啡店",
    body: "这杯可以加浓，醒得更快；也可以保持原浓度，少一点心慌风险。",
    insight: "清醒续命也有吃商：不是越猛越好。",
    tone: "blue",
    visual: "☕",
    eventType: "healthyLife",
    tileType: "healthQuiz",
    requiredFlags: ["hasCoffee"],
    choices: [
      choice("strong", "加浓，先把今天救回来", "救急感强。", { speed: 3, health: -3, integrity: 1 }, persona({ driver: 5, discipline: 4 }), ["救急型下单"]),
      choice("normal", "原浓度，别把心跳拉爆", "身体感受优先。", { health: 6, safety: 2 }, persona({ driver: -6, discipline: -7 }), ["清醒不心慌"]),
      choice("milk", "加奶压一下刺激感", "折中处理。", { health: 3, integrity: 3 }, persona({ driver: -2, novelty: 2 }), ["理性续命"])
    ]
  },
  {
    id: "m-extra-date-photo",
    phase: "merchant",
    nodeIds: ["merchant-spec", "merchant-package"],
    group: "extra-date-photo",
    title: "店员提醒这款更上镜",
    sender: "商家",
    body: "如果是要分享或约会场景，换透明杯/好看包装会更出片，但包装费多一点。",
    insight: "有人买的是味道，有人买的是场景记忆。",
    tone: "purple",
    visual: "📷",
    eventType: "fun",
    tileType: "packaging",
    requiredFlags: ["isSocial"],
    choices: [
      choice("photo", "换上镜包装", "仪式感拉高。", { integrity: 4, trust: 3 }, persona({ scene: 8, driver: 2 }), ["截图友好"]),
      choice("taste", "不用，好吃更重要", "结果导向。", { health: 1, safety: 2 }, persona({ scene: -4, driver: -2 }), ["务实快乐"]),
      choice("one", "只给主角那杯换包装", "会分配重点。", { integrity: 3, trust: 4 }, persona({ scene: 4, driver: -3 }), ["场景规划师"])
    ]
  },
  {
    id: "m-extra-protein-choice",
    phase: "merchant",
    nodeIds: ["merchant-spec"],
    group: "extra-protein-choice",
    title: "轻食蛋白质可以升级",
    sender: "轻食店",
    body: "鸡胸/鸡蛋可以加一份，恢复更稳，但口感会更扎实。你要加吗？",
    insight: "健身后点单不是只能克制，也可以把快乐做成恢复局。",
    tone: "green",
    visual: "🥚",
    eventType: "healthyLife",
    tileType: "healthQuiz",
    requiredFlags: ["hasLightFood"],
    choices: [
      choice("protein", "加蛋白，恢复优先", "平衡值提升。", { health: 8, integrity: 2 }, persona({ driver: -6, discipline: -8 }), ["恢复局玩家"]),
      choice("taste", "不加，轻盈口感优先", "体感轻松。", { health: 3, speed: 2 }, persona({ driver: -2, discipline: -3 }), ["轻盈派"]),
      choice("half", "加半份，别太撑", "自我谈判。", { health: 5, integrity: 2 }, persona({ driver: -3, discipline: -5 }), ["刚好主义"])
    ]
  },
  {
    id: "m-extra-late-night-light",
    phase: "merchant",
    nodeIds: ["merchant-spec", "merchant-stock"],
    group: "extra-late-night-light",
    title: "深夜模式要不要减负",
    sender: "系统",
    body: "现在已经很晚了。系统建议把高糖/高油项改轻一点，但快乐会没那么炸裂。",
    insight: "深夜吃商的核心，是给快乐留刹车。",
    tone: "green",
    visual: "🌙",
    eventType: "healthyLife",
    tileType: "healthQuiz",
    moods: ["lateNight"],
    choices: [
      choice("light", "改轻一点，明天还要活", "健康感更稳。", { health: 8, safety: 2 }, persona({ driver: -7, discipline: -8 }), ["深夜有分寸"]),
      choice("full", "不改，今晚就是要完整快乐", "即时满足强。", { health: -5, speed: 2 }, persona({ driver: 7, discipline: 7 }), ["完整快乐派"]),
      choice("split", "不改，但分一半明天吃", "快乐分期。", { health: 5, integrity: 2 }, persona({ driver: -3, discipline: -6 }), ["快乐分期"])
    ]
  },
  {
    id: "m-extra-soup-lid",
    phase: "merchant",
    nodeIds: ["merchant-stock", "merchant-package"],
    group: "extra-soup-lid",
    title: "汤汁需要二次封盖",
    sender: "热食店",
    body: "汤类餐盒可以加一层封膜，慢一点，但路上更稳。",
    insight: "有汤的订单，包装就是体验的一部分。",
    tone: "orange",
    visual: "🍲",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasSoup"],
    choices: [
      choice("seal", "加封膜，别撒", "完整度显著提升。", { speed: -2, integrity: 9, safety: 5 }, persona({ driver: -5, novelty: -4 }), ["防撒漏工程队"]),
      choice("go", "直接出，快点到", "速度优先但有风险。", { speed: 4, integrity: -5 }, persona({ driver: 4, discipline: 2 }), ["效率优先"]),
      choice("separate", "加封膜，汤和主食分开", "最稳。", { speed: -3, integrity: 10, safety: 6 }, persona({ driver: -6, novelty: -5 }), ["包装达人"])
    ]
  },
  {
    id: "m-extra-new-dessert-size",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "extra-new-dessert-size",
    title: "新品甜品只剩大份",
    sender: "甜品柜",
    body: "新品只剩大份。你原本想小小治愈一下，现在可能会变成甜品主场。",
    insight: "份量变化会把安慰变成放纵，也可能刚好满足。",
    tone: "gold",
    visual: "🍰",
    eventType: "fun",
    tileType: "merchant",
    requiredFlags: ["hasDessert"],
    choices: [
      choice("large", "大份也行，今天值得", "快乐放大。", { speed: 1, health: -4, integrity: 3 }, persona({ driver: 5, discipline: 5 }), ["甜品主场"]),
      choice("classic", "换小份招牌款", "稳定且克制。", { health: 4, integrity: 3 }, persona({ novelty: -4, driver: -4 }), ["招牌复购型"]),
      choice("share", "大份，但找人一起分", "社交化解负担。", { health: 2, trust: 4 }, persona({ scene: 6, discipline: -3 }), ["分享友好"])
    ]
  },
  {
    id: "m-extra-friend-add",
    phase: "merchant",
    nodeIds: ["merchant-stock"],
    group: "extra-friend-add",
    title: "朋友突然想拼一口",
    sender: "朋友",
    body: "朋友说看起来不错，想让你顺手加一份小食。接受会更热闹，但配送复杂度上升。",
    insight: "吃商也包括你如何处理临时社交需求。",
    tone: "purple",
    visual: "👥",
    eventType: "fun",
    tileType: "merchant",
    requiredFlags: ["isSocial"],
    choices: [
      choice("add", "加，快乐一起吃更大", "社交值上升。", { trust: 5, integrity: -1 }, persona({ scene: 8, driver: 2 }), ["社交拼单协调员"]),
      choice("no", "这单先不加，怕乱", "边界清楚。", { integrity: 4, safety: 2 }, persona({ scene: -4, driver: -3 }), ["边界清楚"]),
      choice("simple", "只加不影响包装的小食", "会控制复杂度。", { trust: 4, integrity: 3 }, persona({ scene: 4, driver: -3 }), ["复杂度管理"])
    ]
  },
  {
    id: "m-extra-office-split",
    phase: "merchant",
    nodeIds: ["merchant-stock", "merchant-package"],
    group: "extra-office-split",
    title: "办公室分发要不要分袋",
    sender: "商家",
    body: "如果送到公司，可以按饮品/热食/小食分袋，拿起来更清楚，但袋子会多一点。",
    insight: "多人场景里，清晰比省袋更能保护体验。",
    tone: "blue",
    visual: "🏢",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["isOffice"],
    choices: [
      choice("split", "分袋，办公室别乱", "分发稳定。", { integrity: 8, trust: 4 }, persona({ scene: 5, driver: -5 }), ["办公室分发员"]),
      choice("single", "一个袋子就行，别麻烦", "省事但风险高。", { speed: 3, integrity: -3 }, persona({ driver: 3, novelty: 1 }), ["省事优先"]),
      choice("label", "同袋但贴标签", "折中方案。", { integrity: 5, trust: 3 }, persona({ driver: -2, scene: 3 }), ["重点标注型"])
    ]
  },
  {
    id: "m-extra-fries-vent",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "extra-fries-vent",
    title: "炸物要不要透气包装",
    sender: "小吃店",
    body: "密封更保温，透气更脆。你这份炸物更在意哪一个？",
    insight: "炸物的完整度不是热就够，还要脆。",
    tone: "orange",
    visual: "🍟",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasFried"],
    choices: [
      choice("crisp", "透气包装，我要脆", "口感优先。", { integrity: 8, safety: 2 }, persona({ driver: -4, novelty: -2 }), ["脆感守护者"]),
      choice("warm", "密封保温，热更重要", "热乎优先。", { integrity: 3, health: -1 }, persona({ driver: 2, novelty: -2 }), ["热乎感守护者"]),
      choice("separate", "炸物单独袋装", "防串味。", { speed: -1, integrity: 7 }, persona({ driver: -5, novelty: -3 }), ["防串味达人"])
    ]
  },
  {
    id: "m-extra-activity-proof",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "extra-activity-proof",
    title: "活动券/兑换码要不要单独截图",
    sender: "活动商家",
    body: "这单里有玩乐活动，系统建议单独保存兑换码，避免到店翻记录。",
    insight: "吃喝玩乐订单里，信息保管也是体验的一部分。",
    tone: "purple",
    visual: "🎮",
    eventType: "noteGame",
    tileType: "tool",
    requiredFlags: ["hasActivity"],
    choices: [
      choice("save", "立刻截图收藏", "完整度上升。", { integrity: 8, safety: 3 }, persona({ driver: -6, novelty: -3 }), ["证据链完整"]),
      choice("later", "到时候再找也行", "随缘但有风险。", { speed: 2, integrity: -4 }, persona({ driver: 3, novelty: 2 }), ["随缘接受"]),
      choice("share", "发给同行的人备份", "社交协作。", { trust: 5, integrity: 5 }, persona({ scene: 6, driver: -3 }), ["协作型玩家"])
    ]
  },
  {
    id: "m-extra-lid-sticker",
    phase: "merchant",
    nodeIds: ["merchant-package"],
    group: "extra-lid-sticker",
    title: "杯盖贴纸可以加固",
    sender: "饮品店",
    body: "骑手路上可能会颠簸。杯盖可以多贴一圈封口贴，但会影响一点开杯速度。",
    insight: "到手开得快，和路上不翻车，是两个不同愿望。",
    tone: "green",
    visual: "🥤",
    eventType: "foodSafety",
    tileType: "foodSafetyQuiz",
    requiredFlags: ["hasDrink"],
    choices: [
      choice("sticker", "加固，别漏", "安心和完整度提升。", { speed: -1, safety: 7, integrity: 7 }, persona({ driver: -5, novelty: -4 }), ["防撒漏工程队"]),
      choice("normal", "正常就行，方便喝", "便利优先。", { speed: 3, integrity: -2 }, persona({ driver: 3, discipline: 1 }), ["便利优先"]),
      choice("hotonly", "只给热饮/满杯加固", "策略性处理。", { integrity: 5, trust: 3 }, persona({ driver: -3, novelty: -2 }), ["包装策略师"])
    ]
  },
  {
    id: "m-extra-budget-reset",
    phase: "merchant",
    nodeIds: ["merchant-spec"],
    group: "extra-budget-reset",
    title: "系统提醒本单预算略超",
    sender: "系统",
    body: "这单已经超过你平时点单价位。要不要删掉一个非核心加料？",
    insight: "吃商不是少花钱，而是知道哪一口最值得。",
    tone: "gold",
    visual: "💰",
    eventType: "healthyLife",
    tileType: "note",
    requiredFlags: ["nearDiscount"],
    choices: [
      choice("trim", "删一个非核心加料", "预算和负担下降。", { health: 4, safety: 3 }, persona({ driver: -6, discipline: -5 }), ["预算清醒"]),
      choice("keep", "不删，今天就是要完整", "快乐完整度优先。", { integrity: 4, health: -2 }, persona({ driver: 5, discipline: 4 }), ["完整快乐派"]),
      choice("swap", "把加料换成低糖饮", "聪明平衡。", { health: 6, integrity: 1 }, persona({ driver: -4, discipline: -7 }), ["低糖谈判家"])
    ]
  }
];

const riderEvents: OrderProgressEvent[] = [
  {
    id: "r-pickup-wait",
    phase: "rider",
    nodeIds: ["rider-pickup"],
    group: "pickup-wait",
    title: "骑手到店但还没出餐",
    sender: "骑手",
    body: "我到店了，商家说还要等几分钟。你这边急吗？",
    insight: "催不催，不只是效率问题，也会影响整单沟通氛围。",
    tone: "blue",
    visual: "🛵",
    eventType: "riderSafety",
    tileType: "riderSafety",
    weight: 5,
    choices: [
      choice("safe", "不急，路上注意安全", "体贴值和安心值提升。", { speed: -1, safety: 7, trust: 7 }, persona({ driver: -5, scene: 3, discipline: -2 }), ["骑手友好"]),
      choice("ask", "大概还要多久？我好安排", "沟通清晰。", { trust: 4, integrity: 2 }, persona({ driver: -3, novelty: -2 }), ["沟通控场型"]),
      choice("hurry", "麻烦尽量快一点", "效率优先，但信任略降。", { speed: 4, trust: -3, safety: -2 }, persona({ driver: 4, discipline: 2 }), ["效率优先"])
    ]
  },
  {
    id: "r-pickup-multishop",
    phase: "rider",
    nodeIds: ["rider-pickup"],
    group: "pickup-multishop",
    title: "骑手需要连续取几家",
    sender: "骑手",
    body: "你这单涉及几家店，我会按系统路线取。冷饮那家要不要最后取？",
    insight: "用户能做的不是指挥路线，而是明确偏好。",
    tone: "blue",
    visual: "🧭",
    eventType: "riderSafety",
    tileType: "fork",
    requiredFlags: ["hasMultipleShops"],
    choices: [
      choice("coldlast", "冷饮最后取，口感更稳", "完整值提升。", { integrity: 7, trust: 4 }, persona({ driver: -4, novelty: -2 }), ["温度策略师"]),
      choice("system", "按系统路线就好", "随缘且信任系统。", { speed: 2, trust: 2 }, persona({ novelty: 1, driver: 1 }), ["随缘接受"]),
      choice("ask", "你方便就行，别绕太多", "体贴但保留目标。", { safety: 4, trust: 5 }, persona({ scene: 4, driver: -2 }), ["体贴沟通"])
    ]
  },
  {
    id: "r-pickup-cold",
    phase: "rider",
    nodeIds: ["rider-pickup"],
    group: "pickup-cold",
    title: "冷饮已经取到",
    sender: "骑手",
    body: "冷饮取到了，商家袋子里有冰袋但天气有点热。我会尽快送。",
    insight: "这时最合理的选择是表达偏好，而不是指挥细节。",
    tone: "green",
    visual: "🥤",
    eventType: "riderSafety",
    tileType: "riderSafety",
    requiredFlags: ["hasDrink"],
    choices: [
      choice("thanks", "辛苦，安全第一", "信任感提升。", { safety: 6, trust: 7 }, persona({ driver: -5, scene: 3 }), ["骑手友好"]),
      choice("shade", "尽量别暴晒就好，谢谢", "表达具体偏好。", { integrity: 5, trust: 4 }, persona({ driver: -3, novelty: -2 }), ["温度在意型"]),
      choice("fast", "那麻烦尽快，怕化冰", "完整优先但略有压力。", { speed: 3, integrity: 1, trust: -2 }, persona({ driver: 3 }), ["口感焦虑型"])
    ]
  },
  {
    id: "r-pickup-hot",
    phase: "rider",
    nodeIds: ["rider-pickup"],
    group: "pickup-hot",
    title: "热食刚出餐",
    sender: "骑手",
    body: "热食刚拿到，袋子有点烫。我会放保温袋里。",
    insight: "热食订单的期待值，常常和温度绑定。",
    tone: "red",
    visual: "🍜",
    eventType: "riderSafety",
    tileType: "riderSafety",
    requiredFlags: ["hasHotFood"],
    choices: [
      choice("safe", "注意安全，不急着赶", "安心和体贴上升。", { safety: 7, trust: 6 }, persona({ driver: -5, scene: 3 }), ["守护骑手"]),
      choice("warm", "辛苦，尽量保温就好", "明确核心诉求。", { integrity: 5, trust: 4 }, persona({ driver: -3, novelty: -2 }), ["热乎感守护者"]),
      choice("front", "到了放前台我马上拿", "效率和温度兼顾。", { speed: 3, integrity: 3, trust: 2 }, persona({ driver: -1, scene: 2 }), ["高效收餐"])
    ]
  },
  {
    id: "r-road-late",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "road-late",
    title: "预计晚到 5 分钟",
    sender: "骑手",
    body: "路上有点堵，可能比预计晚 5 分钟。",
    insight: "等待中的语气，会被写进这单的隐形体验。",
    tone: "blue",
    visual: "⏱️",
    eventType: "riderSafety",
    tileType: "riderSafety",
    weight: 4,
    choices: [
      choice("safe", "没事，安全第一", "安心值和体贴值上升。", { safety: 8, trust: 8, speed: -1 }, persona({ driver: -6, scene: 3 }), ["守护骑手"]),
      choice("eta", "收到，大概几点到？", "掌握节奏。", { trust: 4, integrity: 1 }, persona({ driver: -3, novelty: -2 }), ["时间管理型"]),
      choice("hurry", "我这边有点急，麻烦快些", "速度优先。", { speed: 4, safety: -4, trust: -3 }, persona({ driver: 5, discipline: 2 }), ["效率优先"])
    ]
  },
  {
    id: "r-road-rain",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "weather",
    title: "突然下雨",
    sender: "骑手",
    body: "这边开始下雨了，路会慢一点，我会把袋子放雨披里。",
    insight: "天气事件最能看出你对速度和安全的排序。",
    tone: "blue",
    visual: "🌧️",
    eventType: "riderSafety",
    tileType: "riderSafety",
    choices: [
      choice("safe", "别赶，注意安全", "安全和信任显著提升。", { speed: -2, safety: 10, trust: 8 }, persona({ driver: -7, scene: 4 }), ["守护骑手"]),
      choice("bag", "辛苦，袋口别进水就好", "表达具体需求。", { integrity: 6, trust: 5 }, persona({ driver: -4, novelty: -2 }), ["包装在意型"]),
      choice("front", "到楼下我下来拿", "减少骑手压力。", { speed: 2, safety: 5, trust: 6 }, persona({ scene: 5, driver: -3 }), ["楼下自取型"])
    ]
  },
  {
    id: "r-road-heat",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "weather",
    title: "高温路段",
    sender: "骑手",
    body: "外面很热，冷饮可能会有一点化冰。需要我到门口后电话提醒你马上取吗？",
    insight: "这是口感、打扰和效率之间的选择。",
    tone: "green",
    visual: "☀️",
    eventType: "riderSafety",
    tileType: "riderSafety",
    requiredFlags: ["hasDrink"],
    choices: [
      choice("call", "到门口电话我，我马上拿", "完整值提升。", { integrity: 6, speed: 2, trust: 3 }, persona({ driver: -2, novelty: -2 }), ["高效收餐"]),
      choice("msg", "发消息就行，别急", "减少打扰。", { safety: 4, trust: 4 }, persona({ driver: -3, scene: -2 }), ["安静等待"]),
      choice("desk", "可以先放前台阴凉处", "交付灵活。", { speed: 3, integrity: 2 }, persona({ scene: 2, novelty: 1 }), ["灵活交付"])
    ]
  },
  {
    id: "r-road-traffic",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "traffic",
    title: "公司附近车流很慢",
    sender: "骑手",
    body: "你公司附近有点堵，我可能从侧门绕过去，方便你到侧门拿吗？",
    insight: "公司场景里，效率通常来自双方配合。",
    tone: "blue",
    visual: "🏢",
    eventType: "riderSafety",
    tileType: "riderSafety",
    requiredFlags: ["isOffice"],
    choices: [
      choice("side", "可以，我去侧门", "速度和体贴都上升。", { speed: 4, trust: 6, safety: 3 }, persona({ scene: 4, driver: -2 }), ["主动配合"]),
      choice("front", "还是正门吧，我怕找不到", "稳定优先。", { integrity: 3, speed: -2 }, persona({ novelty: -5, driver: -2 }), ["稳定交付"]),
      choice("map", "我发你侧门定位", "秩序感很强。", { speed: 3, trust: 7 }, persona({ driver: -5, novelty: -3 }), ["定位清晰"])
    ]
  },
  {
    id: "r-road-detour",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "traffic",
    title: "系统推荐绕路",
    sender: "骑手",
    body: "系统建议绕一点路，时间差不多但路更稳。要按系统走吗？",
    insight: "你对路线的态度，也是一种风险偏好。",
    tone: "purple",
    visual: "🛣️",
    eventType: "riderSafety",
    tileType: "fork",
    choices: [
      choice("system", "按系统走，稳一点", "安心值提升。", { safety: 6, integrity: 3 }, persona({ driver: -4, novelty: -5 }), ["稳定路线"]),
      choice("fast", "你看哪个快就走哪个", "信任骑手经验。", { speed: 3, trust: 4 }, persona({ scene: 2, novelty: 2 }), ["经验信任型"]),
      choice("rule", "别逆行别赶路就行", "安全边界清晰。", { safety: 8, trust: 5 }, persona({ driver: -5, discipline: -3 }), ["安全边界"])
    ]
  },
  {
    id: "r-road-chat",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "tone",
    title: "你想补一句备注",
    sender: "你",
    body: "订单正在路上，你突然想补一句交付说明。你会怎么说？",
    insight: "同样是说明，语气会决定沟通成本。",
    tone: "purple",
    visual: "💬",
    eventType: "noteGame",
    tileType: "note",
    choices: [
      choice("kind", "路上注意安全，不急，到了我下来", "体贴又清晰。", { safety: 6, trust: 8, speed: 1 }, persona({ driver: -6, scene: 5 }), ["骑手友好"]),
      choice("short", "到了放前台，谢谢", "信息密度高。", { speed: 3, trust: 3 }, persona({ driver: -3, novelty: -2 }), ["高效备注"]),
      choice("push", "麻烦快点，我赶时间", "效率强诉求。", { speed: 4, trust: -4, safety: -3 }, persona({ driver: 5, discipline: 3 }), ["催单型"])
    ]
  },
  {
    id: "r-address-office",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "address-office",
    title: "公司前台需要登记",
    sender: "骑手",
    body: "我到楼下了，前台说外卖需要登记。你希望我怎么处理？",
    insight: "公司场景的最后一公里，本质是信息协作。",
    tone: "blue",
    visual: "🏢",
    eventType: "noteGame",
    tileType: "note",
    requiredFlags: ["isOffice"],
    choices: [
      choice("desk", "放前台，我马上去拿", "速度和清晰度上升。", { speed: 4, trust: 5, integrity: 2 }, persona({ scene: 2, driver: -2 }), ["高效收餐"]),
      choice("down", "我下楼当面取", "体贴和完整度上升。", { speed: 2, safety: 4, trust: 6 }, persona({ scene: 4, driver: -3 }), ["主动配合"]),
      choice("up", "麻烦送上来，我开会走不开", "自我需求优先。", { speed: -3, trust: -1, integrity: 2 }, persona({ driver: 3, scene: -2 }), ["会议续命"])
    ]
  },
  {
    id: "r-address-home",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "address-home",
    title: "小区门禁不好进",
    sender: "骑手",
    body: "门禁进不去，你方便给一下取餐点吗？",
    insight: "最后几百米，最需要的是清楚而不是着急。",
    tone: "green",
    visual: "🏘️",
    eventType: "noteGame",
    tileType: "note",
    excludedFlags: ["isOffice"],
    choices: [
      choice("spot", "我发定位，你放门口置物架", "清晰交付。", { speed: 3, integrity: 3, trust: 6 }, persona({ driver: -4, novelty: -2 }), ["定位清晰"]),
      choice("down", "我下楼取，辛苦了", "体贴值提升。", { speed: 2, safety: 5, trust: 7 }, persona({ scene: 4, driver: -4 }), ["楼下自取型"]),
      choice("try", "你再试试另一个门", "自我便利优先。", { speed: -3, trust: -2 }, persona({ driver: 3, novelty: -1 }), ["原地等待型"])
    ]
  },
  {
    id: "r-address-phone",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "address-phone",
    title: "骑手打电话时你正在忙",
    sender: "系统",
    body: "骑手来电，你正在开会/游戏/洗澡。你会怎么处理？",
    insight: "接不接电话，往往决定这单最后顺不顺。",
    tone: "orange",
    visual: "📞",
    eventType: "noteGame",
    tileType: "note",
    choices: [
      choice("answer", "先接 10 秒说清位置", "秩序感更强。", { speed: 3, trust: 6, integrity: 3 }, persona({ driver: -5, novelty: -3 }), ["关键沟通"]),
      choice("text", "挂掉后立刻发文字说明", "低打扰但负责。", { trust: 5, speed: 1 }, persona({ driver: -3, scene: -2 }), ["文字沟通派"]),
      choice("later", "等会儿再回，应该能找到", "随缘但有风险。", { speed: -3, integrity: -3, trust: -4 }, persona({ driver: 3, novelty: 2 }), ["随缘接受"])
    ]
  },
  {
    id: "r-delivery-frontdesk",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "handoff",
    title: "前台堆了很多外卖",
    sender: "骑手",
    body: "前台外卖有点多，要不要我帮你拍一下放置位置？",
    insight: "拍照不是多此一举，是减少拿错的证据链。",
    tone: "blue",
    visual: "📍",
    eventType: "packaging",
    tileType: "destination",
    requiredFlags: ["isOffice"],
    choices: [
      choice("photo", "拍一下位置，谢谢", "完整和信任提升。", { integrity: 6, trust: 5 }, persona({ driver: -4, novelty: -2 }), ["证据链完整"]),
      choice("name", "放前台并备注我的名字", "信息明确。", { speed: 2, integrity: 4 }, persona({ driver: -3, scene: 1 }), ["名字标注"]),
      choice("self", "我现在下去拿", "最稳但要行动。", { speed: 3, trust: 5, integrity: 5 }, persona({ scene: 3, driver: -2 }), ["主动配合"])
    ]
  },
  {
    id: "r-delivery-downstairs",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "handoff",
    title: "电梯等候时间很长",
    sender: "骑手",
    body: "电梯排队有点久。你要我继续等上楼，还是你下楼取？",
    insight: "这是便利和体贴之间的真实博弈。",
    tone: "purple",
    visual: "🛗",
    eventType: "riderSafety",
    tileType: "destination",
    excludedFlags: ["isOffice"],
    choices: [
      choice("down", "我下楼取，别等了", "体贴和速度上升。", { speed: 4, trust: 7, safety: 4 }, persona({ scene: 4, driver: -4 }), ["楼下自取型"]),
      choice("wait", "麻烦等上楼，我不方便", "自我便利优先。", { speed: -4, trust: -1, integrity: 2 }, persona({ driver: 3, scene: -2 }), ["宅家等待"]),
      choice("front", "放门口柜子，我马上拿", "折中交付。", { speed: 3, integrity: 3, trust: 3 }, persona({ driver: -1, novelty: 1 }), ["灵活交付"])
    ]
  },
  {
    id: "r-delivery-contactless",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "handoff",
    title: "是否无接触放置",
    sender: "骑手",
    body: "我快到了，要当面交付还是放指定位置？",
    insight: "收餐方式会暴露你对秩序、社交和效率的偏好。",
    tone: "green",
    visual: "📦",
    eventType: "noteGame",
    tileType: "destination",
    choices: [
      choice("face", "当面拿，顺便确认完整", "控制感更强。", { integrity: 5, trust: 4 }, persona({ driver: -3, scene: 2, novelty: -2 }), ["当面确认"]),
      choice("place", "放指定位置，拍照即可", "低打扰高效率。", { speed: 3, trust: 3 }, persona({ scene: -3, driver: -2 }), ["低打扰收餐"]),
      choice("depends", "到了看情况，我会留意消息", "弹性处理。", { trust: 2, safety: 2 }, persona({ novelty: 2 }), ["弹性收餐"])
    ]
  },
  {
    id: "r-status-multicup",
    phase: "rider",
    nodeIds: ["rider-road", "rider-arrival"],
    group: "status-drink",
    title: "多杯饮品需要确认",
    sender: "骑手",
    body: "商家给了几杯，我看标签有点小。你要不要到手后先核对？",
    insight: "多杯不是多快乐这么简单，也多了错拿风险。",
    tone: "orange",
    visual: "🥤",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasMultiCup"],
    choices: [
      choice("check", "到手先核对杯身", "完整度上升。", { integrity: 7, trust: 3 }, persona({ driver: -5, novelty: -3 }), ["杯身核对"]),
      choice("photo", "麻烦你拍一下标签", "提前确认。", { speed: -1, integrity: 6, trust: 4 }, persona({ driver: -4, scene: 2 }), ["确认型下单"]),
      choice("fine", "没事，应该没问题", "随缘接受。", { speed: 2, integrity: -3 }, persona({ driver: 2, novelty: 2 }), ["随缘接受"])
    ]
  },
  {
    id: "r-status-cold",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "status-drink",
    title: "冷饮可能开始化冰",
    sender: "系统",
    body: "订单路程略长，冷饮口感正在和时间赛跑。",
    insight: "你在意的是准时，还是第一口的状态？",
    tone: "blue",
    visual: "🧊",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasDrink"],
    choices: [
      choice("pickup", "到了马上取，别放太久", "完整值上升。", { speed: 2, integrity: 5 }, persona({ driver: -2, novelty: -2 }), ["第一口守护"]),
      choice("accept", "化一点也能接受", "随缘接受。", { trust: 2, integrity: -1 }, persona({ novelty: 2, driver: 1 }), ["随缘接受"]),
      choice("next", "下次我要少冰/去冰备注", "结果会写进小票建议。", { health: 2, trust: 3 }, persona({ driver: -4, novelty: -3 }), ["复盘型下单"])
    ]
  },
  {
    id: "r-status-hot",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "status-hot",
    title: "热食温度开始下降",
    sender: "系统",
    body: "热食出餐后已经过了一会儿，你要不要调整收餐方式？",
    insight: "热食的快乐曲线，通常比奶茶更怕拖延。",
    tone: "red",
    visual: "🔥",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasHotFood"],
    choices: [
      choice("down", "到楼下我直接拿", "温度和速度更稳。", { speed: 3, integrity: 5, trust: 3 }, persona({ scene: 3, driver: -3 }), ["热乎感守护者"]),
      choice("wait", "照常送上来", "便利优先。", { speed: -2, integrity: -2 }, persona({ driver: 2, scene: -2 }), ["便利优先"]),
      choice("microwave", "凉一点也行，回去加热", "随缘且能接受。", { trust: 2, integrity: -1 }, persona({ novelty: 2 }), ["随缘接受"])
    ]
  },
  {
    id: "r-status-tilt",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "status-package",
    title: "袋子轻微倾斜",
    sender: "骑手",
    body: "刚才过减速带，袋子晃了一下。我看外面没漏，到门口你可以先检查。",
    insight: "这类沟通考验你是追责，还是先解决问题。",
    tone: "orange",
    visual: "⚠️",
    eventType: "packaging",
    tileType: "incident",
    requiredFlags: ["hasMixedTemperature"],
    choices: [
      choice("check", "收到，到手我先检查", "冷静处理。", { integrity: 4, trust: 4 }, persona({ driver: -4, novelty: -2 }), ["冷静核对"]),
      choice("photo", "麻烦到门口拍一下袋口", "证据和完整度并重。", { integrity: 6, trust: 2 }, persona({ driver: -3, novelty: -3 }), ["证据链完整"]),
      choice("complain", "怎么会晃到？这单很重要", "控制感强但沟通压力上升。", { integrity: 1, trust: -5 }, persona({ driver: 5, novelty: -4 }), ["高控制型"])
    ]
  },
  {
    id: "r-tone-thanks",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "tone-final",
    title: "骑手说快到了",
    sender: "骑手",
    body: "我还有 200 米到，你这边方便取餐吗？",
    insight: "最后一句回复，会给整单收尾定调。",
    tone: "gold",
    visual: "🙌",
    eventType: "riderSafety",
    tileType: "destination",
    choices: [
      choice("ready", "方便，我准备好了", "交付顺畅。", { speed: 3, trust: 4 }, persona({ driver: -2, scene: 2 }), ["高效收餐"]),
      choice("thanks", "方便，辛苦你了", "体贴值提升。", { trust: 7, safety: 3 }, persona({ scene: 5, driver: -3 }), ["骑手友好"]),
      choice("wait", "等我两分钟，我马上到", "真实但会延迟。", { speed: -2, trust: 2 }, persona({ driver: 1, scene: 1 }), ["诚实沟通"])
    ]
  },
  {
    id: "r-tone-location",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "address-generic",
    title: "定位有一点偏差",
    sender: "骑手",
    body: "系统定位在路口，我不确定具体入口。你能补一条说明吗？",
    insight: "地址沟通不是附加题，是订单完成的最后钥匙。",
    tone: "purple",
    visual: "📍",
    eventType: "noteGame",
    tileType: "note",
    choices: [
      choice("clear", "发楼栋/门口照片/取餐点", "清晰度最高。", { speed: 4, integrity: 4, trust: 7 }, persona({ driver: -6, novelty: -3 }), ["定位清晰"]),
      choice("call", "我打电话说更快", "直接沟通。", { speed: 3, trust: 5 }, persona({ scene: 3, driver: -2 }), ["电话解决型"]),
      choice("guess", "你按定位走，应该差不多", "风险更高。", { speed: -2, integrity: -3, trust: -2 }, persona({ driver: 3, novelty: 2 }), ["随缘接受"])
    ]
  },
  {
    id: "r-pickup-receipt",
    phase: "rider",
    nodeIds: ["rider-pickup"],
    group: "pickup-receipt",
    title: "骑手核对订单尾号",
    sender: "骑手",
    body: "我在店里核对尾号，商家这边有几单很像。你方便确认一下尾号吗？",
    insight: "用户能参与的合理动作，是提供信息，而不是替骑手操作。",
    tone: "blue",
    visual: "🔢",
    eventType: "riderSafety",
    tileType: "riderSafety",
    weight: 3,
    choices: [
      choice("number", "马上发尾号和品名", "错单风险下降。", { speed: 2, integrity: 6, trust: 5 }, persona({ driver: -5, novelty: -3 }), ["信息清晰"]),
      choice("name", "只发品名，应该够了", "简单但略有风险。", { speed: 3, integrity: 1 }, persona({ driver: -1 }), ["简洁沟通"]),
      choice("wait", "你按系统核对就好", "信任系统但参与度低。", { trust: 1, integrity: -2 }, persona({ novelty: 1, driver: 2 }), ["系统信任型"])
    ]
  },
  {
    id: "r-arrival-parking",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "arrival-parking",
    title: "楼下临停不方便",
    sender: "骑手",
    body: "楼下不太好停车，我可能不能停太久。你方便快点取吗？",
    insight: "最后交付时，双方时间都是真实资源。",
    tone: "orange",
    visual: "🅿️",
    eventType: "riderSafety",
    tileType: "destination",
    weight: 3,
    choices: [
      choice("quick", "我现在就下去/出来取", "速度和体贴上升。", { speed: 5, safety: 4, trust: 6 }, persona({ scene: 4, driver: -4 }), ["主动配合"]),
      choice("place", "放指定位置，拍照即可", "低打扰交付。", { speed: 4, trust: 3 }, persona({ scene: -2, driver: -2 }), ["低打扰收餐"]),
      choice("wait", "麻烦等我两分钟", "自我便利优先但沟通真实。", { speed: -2, trust: 1 }, persona({ driver: 2, scene: -1 }), ["诚实沟通"])
    ]
  }
];

const extraRiderEvents: OrderProgressEvent[] = [
  {
    id: "r-extra-pickup-queue-photo",
    phase: "rider",
    nodeIds: ["rider-pickup", "rider-road"],
    group: "extra-pickup-queue-photo",
    title: "骑手说店里在排队",
    sender: "骑手",
    body: "骑手已经到店，但取餐台前面还有几单。你要不要让他拍一下取餐号确认进度？",
    insight: "掌握进度和信任骑手，是两种不同的安心方式。",
    tone: "blue",
    visual: "🧾",
    eventType: "riderSafety",
    tileType: "riderSafety",
    choices: [
      choice("photo", "拍一下取餐号就好", "证据和安心并重。", { integrity: 5, trust: 3 }, persona({ driver: -4, novelty: -3 }), ["证据链完整"]),
      choice("trust", "不用拍，辛苦等一下", "信任感上升。", { safety: 3, trust: 6 }, persona({ scene: 4, driver: -3 }), ["骑手友好"]),
      choice("switch", "等太久就先走下一家", "效率优先。", { speed: 4, integrity: -2 }, persona({ driver: 4, novelty: 2 }), ["效率调度"])
    ]
  },
  {
    id: "r-extra-pickup-double-check",
    phase: "rider",
    nodeIds: ["rider-pickup", "rider-arrival"],
    group: "extra-pickup-double-check",
    title: "骑手提醒袋子里有多种品类",
    sender: "骑手",
    body: "这袋里有饮品和热食，我取的时候帮你核对一下数量和袋口？",
    insight: "真正的完整度，常常在取餐瞬间就决定了。",
    tone: "green",
    visual: "🛍️",
    eventType: "packaging",
    tileType: "packaging",
    requiredFlags: ["hasMixedTemperature"],
    choices: [
      choice("check", "麻烦核对数量和袋口", "完整值上升。", { speed: -1, integrity: 8, trust: 5 }, persona({ driver: -5, novelty: -4 }), ["冷静核对"]),
      choice("count", "只帮我看饮品数量", "抓关键风险。", { integrity: 5, trust: 3 }, persona({ driver: -3, scene: 2 }), ["重点核对"]),
      choice("go", "商家给的就行，先送", "效率优先。", { speed: 4, integrity: -3 }, persona({ driver: 3, novelty: 2 }), ["系统信任型"])
    ]
  },
  {
    id: "r-extra-pickup-pin",
    phase: "rider",
    nodeIds: ["rider-pickup"],
    group: "extra-pickup-pin",
    title: "骑手想确认取餐码",
    sender: "骑手",
    body: "店员需要取餐码末尾几位。你现在方便发一下吗？",
    insight: "信息给得越准，错单概率越低。",
    tone: "orange",
    visual: "🔢",
    eventType: "noteGame",
    tileType: "note",
    choices: [
      choice("code", "发尾号和品名", "信息最清晰。", { speed: 3, integrity: 6, trust: 5 }, persona({ driver: -5, novelty: -3 }), ["信息清晰"]),
      choice("name", "只发品名", "简单但略有风险。", { speed: 2, integrity: 1 }, persona({ driver: -1, novelty: 1 }), ["简洁沟通"]),
      choice("later", "我找一下，稍等", "真实但会拖慢。", { speed: -2, trust: 2 }, persona({ driver: 1, scene: 1 }), ["诚实沟通"])
    ]
  },
  {
    id: "r-extra-pickup-late-merchant",
    phase: "rider",
    nodeIds: ["rider-pickup"],
    group: "extra-pickup-late-merchant",
    title: "商家说还差最后一道工序",
    sender: "骑手",
    body: "骑手到店了，但商家说还要最后封袋/装盒。你要不要让骑手继续等？",
    insight: "催商家、体贴骑手、保住完整度，三者很难同时满分。",
    tone: "gold",
    visual: "⏳",
    eventType: "riderSafety",
    tileType: "riderSafety",
    choices: [
      choice("wait", "继续等，完整最重要", "完整度更稳。", { speed: -3, integrity: 7, trust: 3 }, persona({ driver: -4, novelty: -3 }), ["快乐完整主义者"]),
      choice("ask", "问下还要几分钟", "掌握节奏。", { safety: 2, trust: 4 }, persona({ driver: -3, novelty: -2 }), ["时间管理型"]),
      choice("leave", "太久就先别等", "效率优先但可能分散。", { speed: 4, integrity: -4 }, persona({ driver: 5, discipline: 2 }), ["效率优先"])
    ]
  },
  {
    id: "r-extra-road-wind",
    phase: "rider",
    nodeIds: ["rider-road", "rider-arrival"],
    group: "extra-road-wind",
    title: "路上风有点大",
    sender: "骑手",
    body: "骑手说路上风大，袋子可能会晃。你希望他慢一点稳着送，还是按预计时间来？",
    insight: "安全和速度的取舍，最好说得温柔但明确。",
    tone: "blue",
    visual: "🌬️",
    eventType: "riderSafety",
    tileType: "road",
    choices: [
      choice("slow", "慢一点稳着送", "安心和完整提升。", { speed: -2, safety: 8, integrity: 5, trust: 5 }, persona({ driver: -6, scene: 3 }), ["守护骑手"]),
      choice("normal", "正常送就好，注意安全", "平衡回答。", { safety: 5, trust: 4 }, persona({ driver: -3, scene: 2 }), ["安全边界"]),
      choice("time", "尽量按时间到", "时间敏感。", { speed: 4, safety: -3, trust: -2 }, persona({ driver: 4, discipline: 2 }), ["时间敏感型"])
    ]
  },
  {
    id: "r-extra-road-school",
    phase: "rider",
    nodeIds: ["rider-road", "rider-arrival"],
    group: "extra-road-school",
    title: "路线经过学校门口",
    sender: "骑手",
    body: "前面学校门口人多，绕一点路更稳，直走会快但更拥挤。",
    insight: "你对路线的态度，也是风险偏好的一部分。",
    tone: "green",
    visual: "🚦",
    eventType: "riderSafety",
    tileType: "road",
    choices: [
      choice("detour", "绕一点，安全稳妥", "安心值上升。", { speed: -2, safety: 8, trust: 4 }, persona({ driver: -6, novelty: -4 }), ["稳定路线"]),
      choice("judge", "你按现场判断", "信任经验。", { trust: 5, safety: 3 }, persona({ scene: 2, novelty: 2 }), ["经验信任型"]),
      choice("fast", "如果能走就直走", "速度优先。", { speed: 4, safety: -3 }, persona({ driver: 4, discipline: 2 }), ["效率优先"])
    ]
  },
  {
    id: "r-extra-road-light-rain",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "extra-road-light-rain",
    title: "突然下起小雨",
    sender: "骑手",
    body: "雨不大，但饮品袋口和纸质包装可能会湿。你要不要调整收餐方式？",
    insight: "天气题考的不是天气，是你会不会把需求说具体。",
    tone: "blue",
    visual: "🌦️",
    eventType: "packaging",
    tileType: "road",
    choices: [
      choice("bag", "袋口别进水就好，慢慢来", "具体又体贴。", { safety: 5, integrity: 6, trust: 5 }, persona({ driver: -5, scene: 4 }), ["包装在意型"]),
      choice("down", "到楼下我马上拿", "效率和完整兼顾。", { speed: 3, integrity: 4, trust: 4 }, persona({ scene: 4, driver: -3 }), ["楼下自取型"]),
      choice("fast", "快点送到就好", "即时需求强。", { speed: 4, safety: -2, trust: -2 }, persona({ driver: 4, discipline: 2 }), ["效率优先"])
    ]
  },
  {
    id: "r-extra-road-bridge",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "extra-road-bridge",
    title: "系统推荐绕开颠簸路段",
    sender: "系统",
    body: "前面一段路比较颠，绕开会慢 3 分钟，但饮品和汤类更稳。",
    insight: "完整度不是到手后才检查，而是路上就开始保护。",
    tone: "orange",
    visual: "🛵",
    eventType: "packaging",
    tileType: "road",
    requiredFlags: ["hasMixedTemperature"],
    choices: [
      choice("avoid", "绕开颠簸路，稳一点", "完整值提升。", { speed: -3, integrity: 9, safety: 4 }, persona({ driver: -5, novelty: -4 }), ["防撒漏工程队"]),
      choice("normal", "正常走，别绕太远", "效率优先。", { speed: 3, integrity: -3 }, persona({ driver: 3, discipline: 2 }), ["效率优先"]),
      choice("slow", "不绕，但这段慢一点", "折中。", { speed: -1, integrity: 5, trust: 3 }, persona({ driver: -2, novelty: -1 }), ["路线折中派"])
    ]
  },
  {
    id: "r-extra-road-chat-tone",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "extra-road-chat-tone",
    title: "你想补一句话给骑手",
    sender: "系统",
    body: "现在可以发一条短消息。你会怎么说？",
    insight: "沟通语气会直接影响这单的体贴值。",
    tone: "purple",
    visual: "💬",
    eventType: "noteGame",
    tileType: "note",
    choices: [
      choice("kind", "路上注意安全，不急", "体贴感最强。", { safety: 7, trust: 7 }, persona({ scene: 5, driver: -6 }), ["骑手友好"]),
      choice("clear", "到了放前台，我马上取", "信息密度高。", { speed: 3, trust: 4 }, persona({ driver: -4, novelty: -2 }), ["高效备注"]),
      choice("push", "麻烦尽快，我有点急", "速度诉求强。", { speed: 4, trust: -4, safety: -2 }, persona({ driver: 5, discipline: 2 }), ["催单型"])
    ]
  },
  {
    id: "r-extra-road-cold-drink",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "extra-road-cold-drink",
    title: "冷饮开始化冰",
    sender: "系统",
    body: "路上时间比预计长一点，冷饮口感可能变淡。你怎么收尾？",
    insight: "口感变化后，你是补救派、接受派，还是复盘派？",
    tone: "blue",
    visual: "🧊",
    eventType: "foodSafety",
    tileType: "road",
    requiredFlags: ["hasDrink"],
    choices: [
      choice("pickup", "到了马上取，别放太久", "口感更稳。", { speed: 2, integrity: 5, trust: 3 }, persona({ driver: -3, novelty: -2 }), ["第一口守护"]),
      choice("accept", "化一点也能接受", "随缘接受。", { trust: 2, integrity: -1 }, persona({ novelty: 2, driver: 1 }), ["随缘接受"]),
      choice("note", "下次备注少冰/去冰", "复盘意识强。", { health: 2, trust: 3 }, persona({ driver: -4, novelty: -4 }), ["复盘型下单"])
    ]
  },
  {
    id: "r-extra-road-keepwarm",
    phase: "rider",
    nodeIds: ["rider-road"],
    group: "extra-road-keepwarm",
    title: "热食保温袋空间紧张",
    sender: "骑手",
    body: "保温袋里已经有几单。你的热食可以优先放进去，但饮品要单独拿。",
    insight: "热乎感和防撒漏，有时要拆开处理。",
    tone: "red",
    visual: "🍜",
    eventType: "packaging",
    tileType: "road",
    requiredFlags: ["hasHotFood"],
    choices: [
      choice("hot", "热食进保温袋，饮品单独拿", "温度和完整兼顾。", { integrity: 8, trust: 4 }, persona({ driver: -5, novelty: -3 }), ["热乎感守护者"]),
      choice("all", "能放一起就一起", "省事但风险高。", { speed: 2, integrity: -3 }, persona({ driver: 3, novelty: 1 }), ["省事优先"]),
      choice("down", "到了我下楼取，缩短路程", "主动配合。", { speed: 3, trust: 6, integrity: 3 }, persona({ scene: 4, driver: -4 }), ["主动配合"])
    ]
  },
  {
    id: "r-extra-arrival-lobby-crowd",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "extra-arrival-lobby-crowd",
    title: "公司楼下人有点多",
    sender: "骑手",
    body: "前台附近很多外卖，放在那里可能会混。你要不要下来取？",
    insight: "临门一脚最容易错拿，越忙越需要清晰交付。",
    tone: "blue",
    visual: "🏢",
    eventType: "riderSafety",
    tileType: "destination",
    requiredFlags: ["isOffice"],
    choices: [
      choice("down", "我下楼当面取", "错拿风险下降。", { speed: 2, integrity: 6, trust: 5 }, persona({ scene: 4, driver: -4 }), ["当面确认"]),
      choice("front", "放前台并拍照", "低打扰但有证据。", { speed: 3, integrity: 4, trust: 3 }, persona({ scene: -2, driver: -3 }), ["证据链完整"]),
      choice("desk", "麻烦送到工位附近", "便利优先。", { speed: -3, trust: -1, integrity: 2 }, persona({ driver: 3, scene: -2 }), ["会议续命"])
    ]
  },
  {
    id: "r-extra-arrival-gate-code",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "extra-arrival-gate-code",
    title: "门禁需要临时码",
    sender: "骑手",
    body: "骑手到了小区/楼下，但需要门禁临时码。你现在怎么处理？",
    insight: "好地址不是定位准，是别人能按它完成交付。",
    tone: "green",
    visual: "🔐",
    eventType: "noteGame",
    tileType: "note",
    choices: [
      choice("code", "发临时码和楼栋照片", "信息最完整。", { speed: 3, integrity: 5, trust: 7 }, persona({ driver: -6, novelty: -3 }), ["定位清晰"]),
      choice("down", "我下楼取，别绕了", "体贴和效率上升。", { speed: 4, safety: 4, trust: 6 }, persona({ scene: 4, driver: -4 }), ["楼下自取型"]),
      choice("try", "你先试试跟别人进来", "风险更高。", { speed: -2, safety: -4, trust: -3 }, persona({ driver: 3, novelty: 2 }), ["随缘接受"])
    ]
  },
  {
    id: "r-extra-arrival-phone-silent",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "extra-arrival-phone-silent",
    title: "你手机刚好静音",
    sender: "系统",
    body: "骑手可能会打电话确认位置。你现在要不要主动发一条说明？",
    insight: "低打扰不等于低沟通，提前说明才是高手。",
    tone: "purple",
    visual: "📱",
    eventType: "noteGame",
    tileType: "note",
    choices: [
      choice("text", "提前发文字说明", "低打扰但负责。", { speed: 2, trust: 6, integrity: 3 }, persona({ driver: -5, scene: -2 }), ["文字沟通派"]),
      choice("call", "取消静音，等电话", "直接沟通。", { trust: 5, speed: 2 }, persona({ scene: 3, driver: -2 }), ["电话解决型"]),
      choice("ignore", "应该能找到，先不管", "随缘但风险高。", { speed: -3, integrity: -3, trust: -4 }, persona({ driver: 3, novelty: 2 }), ["随缘接受"])
    ]
  },
  {
    id: "r-extra-arrival-name-similar",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "extra-arrival-name-similar",
    title: "前台有两个相似名字",
    sender: "骑手",
    body: "前台已经有另一个同姓/相似名字的外卖。你要怎么避免拿错？",
    insight: "错单经常不是大事故，而是少了一条识别信息。",
    tone: "orange",
    visual: "🏷️",
    eventType: "packaging",
    tileType: "destination",
    choices: [
      choice("last4", "发手机号尾号和品名", "识别最清楚。", { integrity: 7, trust: 5 }, persona({ driver: -5, novelty: -3 }), ["信息清晰"]),
      choice("photo", "让骑手拍袋子标签", "提前确认。", { speed: -1, integrity: 6, trust: 4 }, persona({ driver: -4, scene: 2 }), ["确认型下单"]),
      choice("guess", "应该是我的那袋", "风险上升。", { speed: 2, integrity: -5 }, persona({ driver: 3, novelty: 2 }), ["自信收餐"])
    ]
  },
  {
    id: "r-extra-arrival-elevator",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "extra-arrival-elevator",
    title: "电梯排队很久",
    sender: "骑手",
    body: "骑手到楼下了，但电梯排队。你要继续等上楼，还是楼下自取？",
    insight: "最后 100 米，经常决定这单是丝滑还是焦躁。",
    tone: "blue",
    visual: "🛗",
    eventType: "riderSafety",
    tileType: "destination",
    choices: [
      choice("down", "我下楼取，别等了", "速度和体贴上升。", { speed: 4, trust: 7, safety: 4 }, persona({ scene: 4, driver: -4 }), ["楼下自取型"]),
      choice("wait", "麻烦等上来，我不方便", "自我便利优先。", { speed: -4, trust: -1, integrity: 2 }, persona({ driver: 3, scene: -2 }), ["宅家等待"]),
      choice("front", "放门口柜子，我马上拿", "折中交付。", { speed: 3, integrity: 3, trust: 3 }, persona({ driver: -1, novelty: 1 }), ["灵活交付"])
    ]
  },
  {
    id: "r-extra-arrival-low-battery",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "extra-arrival-low-battery",
    title: "骑手手机电量不多",
    sender: "骑手",
    body: "骑手说手机快没电了，希望你一次性发清楚收餐位置。",
    insight: "一次性说清楚，是对双方时间的保护。",
    tone: "green",
    visual: "🔋",
    eventType: "noteGame",
    tileType: "note",
    choices: [
      choice("full", "发楼栋、门口图和取餐点", "清晰度最高。", { speed: 4, integrity: 5, trust: 7 }, persona({ driver: -6, novelty: -3 }), ["定位清晰"]),
      choice("short", "发一句最短路线", "高效但略依赖理解。", { speed: 3, trust: 4 }, persona({ driver: -3, novelty: -1 }), ["高效备注"]),
      choice("call", "直接电话说清楚", "直接但占用双方注意力。", { speed: 2, trust: 5 }, persona({ scene: 3, driver: -2 }), ["电话解决型"])
    ]
  },
  {
    id: "r-extra-arrival-contactless",
    phase: "rider",
    nodeIds: ["rider-arrival"],
    group: "extra-arrival-contactless",
    title: "无接触放置点有点晒",
    sender: "骑手",
    body: "你指定的位置会被太阳晒到，冷饮和甜品可能受影响。要换地方吗？",
    insight: "收餐点不是随便一个点，环境会影响口感。",
    tone: "gold",
    visual: "☀️",
    eventType: "foodSafety",
    tileType: "destination",
    requiredFlags: ["hasDrink"],
    choices: [
      choice("shade", "换阴凉处并拍照", "口感更稳。", { integrity: 6, safety: 4, trust: 4 }, persona({ driver: -5, novelty: -3 }), ["阴凉收餐"]),
      choice("now", "我马上去拿，不用换", "速度补救。", { speed: 4, integrity: 3, trust: 3 }, persona({ scene: 3, driver: -2 }), ["高效收餐"]),
      choice("same", "就放原处吧", "随缘接受。", { speed: 2, integrity: -3 }, persona({ driver: 2, novelty: 2 }), ["随缘接受"])
    ]
  },
  {
    id: "r-extra-road-friend-message",
    phase: "rider",
    nodeIds: ["rider-road", "rider-arrival"],
    group: "extra-road-friend-message",
    title: "朋友问你订单到哪了",
    sender: "朋友",
    body: "朋友已经开始催你分享进度。你会怎么回复？",
    insight: "社交型吃商，会管理别人对这单的期待。",
    tone: "purple",
    visual: "👥",
    eventType: "fun",
    tileType: "note",
    requiredFlags: ["isSocial"],
    choices: [
      choice("shareeta", "发预计到达时间和取餐点", "协调能力强。", { trust: 6, integrity: 3 }, persona({ scene: 7, driver: -3 }), ["社交拼单协调员"]),
      choice("photo", "发骑手进度截图", "仪式和证据都有。", { trust: 4, integrity: 3 }, persona({ scene: 5, driver: -2 }), ["截图友好"]),
      choice("later", "到了再说，别催", "边界感强。", { trust: -1, safety: 2 }, persona({ scene: -4, driver: -2 }), ["独享回回血"])
    ]
  }
];

const arrivalEvents: OrderProgressEvent[] = [
  {
    id: "a-first-sip",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-first",
    title: "到手第一口",
    sender: "系统",
    body: "外卖到了。你会先做什么？",
    insight: "第一反应比任何问卷都诚实。",
    tone: "orange",
    visual: "🥤",
    eventType: "fun",
    tileType: "destination",
    requiredFlags: ["hasDrink"],
    weight: 5,
    choices: [
      choice("drink", "先喝第一口", "快乐释放最直接。", { speed: 2, trust: 2 }, persona({ driver: 6, discipline: 4 }), ["第一口快乐"]),
      choice("photo", "先拍照，再喝", "仪式和分享感更强。", { integrity: 3, trust: 2 }, persona({ scene: 6, driver: 2 }), ["截图友好"]),
      choice("check", "先核对规格和杯身", "控制感强。", { integrity: 6, safety: 2 }, persona({ driver: -5, novelty: -4 }), ["确认型下单"])
    ]
  },
  {
    id: "a-first-food",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-first",
    title: "餐盒打开的瞬间",
    sender: "系统",
    body: "香味已经出来了。你第一件事是什么？",
    insight: "吃之前的动作，决定这单是仪式还是补给。",
    tone: "red",
    visual: "🍱",
    eventType: "fun",
    tileType: "destination",
    requiredFlags: ["hasFood"],
    choices: [
      choice("eat", "先吃，热的时候最重要", "即时快乐强。", { speed: 3, integrity: 2 }, persona({ driver: 5, discipline: 3 }), ["趁热吃型"]),
      choice("set", "摆一下再开吃", "仪式感强。", { integrity: 4, trust: 2 }, persona({ scene: 4, novelty: 1 }), ["仪式感下单"]),
      choice("check", "先看有没有漏/错", "完整度优先。", { integrity: 7, safety: 2 }, persona({ driver: -5, novelty: -4 }), ["确认型下单"])
    ]
  },
  {
    id: "a-photo-share",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-share",
    title: "这单看起来很适合发出去",
    sender: "系统",
    body: "包装完整、颜色也好看。你会分享吗？",
    insight: "有些外卖不是吃完才结束，是发出去才完整。",
    tone: "purple",
    visual: "📸",
    eventType: "fun",
    tileType: "destination",
    requiredFlags: ["isSocial"],
    choices: [
      choice("share", "发朋友圈/群聊晒一下", "社交分享值拉满。", { trust: 3, integrity: 2 }, persona({ scene: 9, driver: 2 }), ["分享友好"]),
      choice("private", "自己吃，不打扰别人", "独享回回血。", { health: 1, trust: 2 }, persona({ scene: -6, driver: -1 }), ["独享回回血"]),
      choice("recommend", "只发给可能喜欢的人", "精准分享。", { trust: 4 }, persona({ scene: 5, driver: -2 }), ["精准安利"])
    ]
  },
  {
    id: "a-package-check",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-check",
    title: "包装完整，但你还没打开",
    sender: "系统",
    body: "你会先检查小票和备注，还是直接开吃？",
    insight: "这题会区分完整主义和快乐释放派。",
    tone: "gold",
    visual: "🧾",
    eventType: "packaging",
    tileType: "destination",
    choices: [
      choice("receipt", "先对小票和备注", "完整度上升。", { integrity: 6, safety: 2 }, persona({ driver: -5, novelty: -4 }), ["小票核对派"]),
      choice("open", "先打开，快乐要紧", "即时快乐。", { speed: 3, trust: 1 }, persona({ driver: 5, discipline: 2 }), ["快乐释放派"]),
      choice("photo", "先拍包装，万一有问题", "证据意识强。", { integrity: 5, trust: 2 }, persona({ driver: -3, novelty: -3 }), ["证据链完整"])
    ]
  },
  {
    id: "a-late-complete",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-result",
    title: "晚到了一点，但东西完整",
    sender: "系统",
    body: "这单比预计晚了几分钟，但包装和规格都没问题。你怎么评价？",
    insight: "你更在意过程准时，还是结果完整？",
    tone: "blue",
    visual: "✅",
    eventType: "riderSafety",
    tileType: "destination",
    choices: [
      choice("complete", "完整就行，可以接受", "结果导向。", { trust: 5, integrity: 3 }, persona({ driver: -3, novelty: -2 }), ["结果导向"]),
      choice("time", "还是有点影响体验", "时间敏感。", { speed: -1, trust: -2 }, persona({ driver: 3, novelty: -3 }), ["时间敏感型"]),
      choice("thanks", "辛苦，给个好评", "体贴值高。", { trust: 8, safety: 3 }, persona({ scene: 5, driver: -4 }), ["骑手友好"])
    ]
  },
  {
    id: "a-missing-topping",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-result",
    title: "小料好像少了一点",
    sender: "系统",
    body: "主体没错，但加料量和你想象中不太一样。你会怎么处理？",
    insight: "小问题处理方式，也会暴露下单人格。",
    tone: "orange",
    visual: "🧋",
    eventType: "foodSafety",
    tileType: "destination",
    requiredFlags: ["hasToppings"],
    choices: [
      choice("feedback", "礼貌反馈一下", "边界和沟通并存。", { trust: 3, integrity: 3 }, persona({ driver: -3, scene: 2 }), ["礼貌反馈"]),
      choice("accept", "算了，主体好喝就行", "随缘接受。", { speed: 2, trust: 1 }, persona({ novelty: 2, driver: 1 }), ["随缘接受"]),
      choice("record", "记下来，下次换备注", "复盘型人格。", { integrity: 2, safety: 2 }, persona({ driver: -4, novelty: -5 }), ["复盘型下单"])
    ]
  },
  {
    id: "a-healthy-balance",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-health",
    title: "快乐到了，负罪感也到了",
    sender: "系统",
    body: "这单很香，但你也知道它不算轻。你给自己什么收尾？",
    insight: "真正的吃商不是不吃，而是会给快乐收尾。",
    tone: "green",
    visual: "💚",
    eventType: "healthyLife",
    tileType: "destination",
    requiredFlags: ["isHighSugarOrOil"],
    choices: [
      choice("walk", "吃完走十分钟", "平衡值提升。", { health: 8, trust: 2 }, persona({ driver: -5, discipline: -8 }), ["饭后散步"]),
      choice("split", "分一半明天吃", "自我谈判。", { health: 6, integrity: 1 }, persona({ driver: -3, discipline: -6 }), ["快乐分期"]),
      choice("full", "今天不反省，先快乐", "即时快乐强。", { health: -4, speed: 2 }, persona({ driver: 7, discipline: 7 }), ["完整快乐派"])
    ]
  },
  {
    id: "a-discount-guilt",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-discount",
    title: "满减成功后的小小反省",
    sender: "系统",
    body: "你确实省到了钱，也确实多点了一点。你怎么定义这次凑单？",
    insight: "同一个满减，有人叫冲动，有人叫规划。",
    tone: "gold",
    visual: "🏷️",
    eventType: "fun",
    tileType: "destination",
    requiredFlags: ["nearDiscount"],
    choices: [
      choice("worth", "值，快乐有折扣就是赚", "快乐投资感。", { speed: 2, trust: 2 }, persona({ driver: 5, discipline: 3 }), ["快乐投资家"]),
      choice("balance", "下次用无糖饮凑更好", "复盘平衡。", { health: 5, trust: 3 }, persona({ driver: -4, discipline: -6 }), ["聪明凑单"]),
      choice("skipnext", "下次不为满减加购", "预算意识强。", { health: 4, safety: 2 }, persona({ driver: -6, novelty: -3 }), ["预算清醒"])
    ]
  }
];

const extraArrivalEvents: OrderProgressEvent[] = [
  {
    id: "a-extra-first-smell",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-smell",
    title: "香味先到了",
    sender: "系统",
    body: "你还没打开袋子，香味已经出来了。你第一反应是什么？",
    insight: "第一反应通常比自我介绍更像真实人格。",
    tone: "orange",
    visual: "🍽️",
    eventType: "fun",
    tileType: "destination",
    choices: [
      choice("open", "直接打开，先吃一口", "即时快乐释放。", { speed: 3, trust: 2 }, persona({ driver: 6, discipline: 4 }), ["快乐释放派"]),
      choice("check", "先看小票和袋口", "完整主义。", { integrity: 6, safety: 2 }, persona({ driver: -5, novelty: -4 }), ["小票核对派"]),
      choice("photo", "先拍一张到手照", "仪式感强。", { integrity: 3, trust: 2 }, persona({ scene: 5, driver: 1 }), ["截图友好"])
    ]
  },
  {
    id: "a-extra-table-setup",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-table",
    title: "桌面还没收拾",
    sender: "系统",
    body: "外卖到了，但桌面有点乱。你会先整理一下，还是立刻开吃？",
    insight: "吃商也体现在你愿不愿意给快乐留一个好场景。",
    tone: "purple",
    visual: "🪑",
    eventType: "fun",
    tileType: "destination",
    choices: [
      choice("setup", "整理桌面再开吃", "仪式和完整上升。", { integrity: 5, trust: 2 }, persona({ scene: 6, driver: -2 }), ["仪式感下单"]),
      choice("eat", "先吃，热的时候最重要", "即时需求强。", { speed: 4, integrity: 1 }, persona({ driver: 5, discipline: 3 }), ["趁热吃型"]),
      choice("half", "只清出一小块地方", "效率和仪式折中。", { speed: 2, integrity: 3 }, persona({ driver: -1, scene: 2 }), ["折中高手"])
    ]
  },
  {
    id: "a-extra-sauce-pack",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-sauce",
    title: "调料包比你想象中多",
    sender: "系统",
    body: "袋子里有好几包酱料。你会全倒、试着来，还是先不加？",
    insight: "调料选择会暴露你对风险和刺激的态度。",
    tone: "red",
    visual: "🌶️",
    eventType: "healthyLife",
    tileType: "destination",
    choices: [
      choice("all", "全倒，味道要到位", "刺激和放纵上升。", { health: -3, integrity: 3 }, persona({ driver: 5, discipline: 5, novelty: 2 }), ["重口快乐派"]),
      choice("try", "先加一半，边吃边调", "控制感强。", { health: 3, integrity: 4 }, persona({ driver: -4, novelty: 1 }), ["自控加料型"]),
      choice("skip", "先不加，吃原味", "稳定复购倾向。", { health: 4, safety: 1 }, persona({ novelty: -5, driver: -3 }), ["原味判断派"])
    ]
  },
  {
    id: "a-extra-share-review",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-review",
    title: "这单值得写一句评价",
    sender: "系统",
    body: "整体体验不错。你会怎么给这单收尾？",
    insight: "评价方式会暴露你是结果导向、关系导向，还是复盘导向。",
    tone: "gold",
    visual: "⭐",
    eventType: "fun",
    tileType: "destination",
    choices: [
      choice("thanks", "给好评，顺便说辛苦了", "体贴值高。", { trust: 8, safety: 3 }, persona({ scene: 5, driver: -4 }), ["骑手友好"]),
      choice("note", "记录下次还这么点", "复购证据强。", { integrity: 4, trust: 3 }, persona({ novelty: -7, driver: -3 }), ["稳定复购派"]),
      choice("share", "发给朋友安利", "社交分享。", { trust: 4, integrity: 2 }, persona({ scene: 7, driver: 1 }), ["精准安利"])
    ]
  },
  {
    id: "a-extra-leftover-plan",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-leftover",
    title: "分量比想象中多",
    sender: "系统",
    body: "这单看起来吃完会很撑。你怎么处理剩余快乐？",
    insight: "会不会安排剩余，是平衡型吃商的关键证据。",
    tone: "green",
    visual: "🍱",
    eventType: "healthyLife",
    tileType: "destination",
    choices: [
      choice("tomorrow", "分一半明天吃", "快乐分期。", { health: 6, integrity: 2 }, persona({ driver: -3, discipline: -6 }), ["快乐分期"]),
      choice("full", "吃完，今天不留遗憾", "满足感优先。", { health: -4, speed: 2 }, persona({ driver: 6, discipline: 6 }), ["完整快乐派"]),
      choice("share", "分给旁边的人一起吃", "社交化解负担。", { health: 3, trust: 4 }, persona({ scene: 6, discipline: -3 }), ["分享友好"])
    ]
  },
  {
    id: "a-extra-wrong-but-good",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-surprise",
    title: "小地方和备注不完全一样",
    sender: "系统",
    body: "主体没错，但有个小细节和你备注不同。味道却好像还不错。",
    insight: "这题区分的是控制感、弹性和复盘意识。",
    tone: "blue",
    visual: "🧾",
    eventType: "noteGame",
    tileType: "destination",
    choices: [
      choice("accept", "好吃就行，接受惊喜", "弹性和尝鲜上升。", { trust: 3, integrity: 1 }, persona({ novelty: 5, driver: 2 }), ["弹性接受"]),
      choice("feedback", "礼貌反馈一下细节", "边界清楚。", { trust: 4, integrity: 3 }, persona({ driver: -3, scene: 2 }), ["礼貌反馈"]),
      choice("record", "记下来，下次备注更短", "复盘型人格。", { integrity: 3, safety: 2 }, persona({ driver: -5, novelty: -4 }), ["复盘型下单"])
    ]
  },
  {
    id: "a-extra-afterwork-reset",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-afterwork",
    title: "这单像一场下班仪式",
    sender: "系统",
    body: "吃之前，你要不要给自己一个小小的收工动作？",
    insight: "有些人点外卖不是为吃，是为了宣布今天结束。",
    tone: "purple",
    visual: "🌃",
    eventType: "fun",
    tileType: "destination",
    moods: ["overtime", "tired", "emo"],
    choices: [
      choice("pause", "先关掉工作消息五分钟", "自我照顾。", { health: 5, trust: 2 }, persona({ scene: -3, driver: -4 }), ["安静复活仪式"]),
      choice("eat", "边吃边回消息", "任务驱动。", { speed: 3, health: -2 }, persona({ driver: 4, discipline: 2 }), ["加班续命"]),
      choice("music", "放首歌再开吃", "仪式感回血。", { trust: 3, integrity: 2 }, persona({ scene: 5, novelty: 1 }), ["仪式感下单"])
    ]
  },
  {
    id: "a-extra-next-order",
    phase: "arrival",
    nodeIds: ["arrival-check"],
    group: "arrival-next",
    title: "系统让你选一个下次优化",
    sender: "系统",
    body: "这单已经结束。下次你最想优化哪件事？",
    insight: "最后一道题会把这单选择写进吃商人格。",
    tone: "orange",
    visual: "🧠",
    eventType: "noteGame",
    tileType: "destination",
    choices: [
      choice("health", "糖油辣再平衡一点", "健康顾问倾向。", { health: 6, safety: 2 }, persona({ driver: -5, discipline: -7 }), ["健康顾问"]),
      choice("package", "包装和备注更精确", "完整主义倾向。", { integrity: 6, trust: 2 }, persona({ driver: -5, novelty: -4 }), ["包装达人"]),
      choice("new", "下次换一家试试", "尝鲜倾向。", { trust: 2, speed: 1 }, persona({ novelty: 8, driver: 2 }), ["尝鲜冒险家"])
    ]
  }
];

export const orderProgressEventBank: OrderProgressEvent[] = [
  ...merchantEvents,
  ...extraMerchantEvents,
  ...riderEvents,
  ...extraRiderEvents.filter(
    (event) =>
      !["r-extra-arrival-low-battery", "r-extra-arrival-contactless", "r-extra-road-friend-message"].includes(event.id)
  ),
  ...arrivalEvents,
  ...extraArrivalEvents
];

const seededRandom = (seed: string) => {
  let value = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    value ^= seed.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return () => {
    value += value << 13;
    value ^= value >>> 7;
    value += value << 3;
    value ^= value >>> 17;
    value += value << 5;
    return ((value >>> 0) % 10000) / 10000;
  };
};

const clampScore = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const applyScoreEffect = (score: DeliveryScore, effect: Partial<DeliveryScore>): DeliveryScore => ({
  speed: clampScore(score.speed + (effect.speed ?? 0)),
  safety: clampScore(score.safety + (effect.safety ?? 0)),
  health: clampScore(score.health + (effect.health ?? 0)),
  integrity: clampScore(score.integrity + (effect.integrity ?? 0)),
  trust: clampScore(score.trust + (effect.trust ?? 0))
});

const mergeEffects = (effects: Partial<DeliveryScore>[]): Partial<DeliveryScore> =>
  effects.reduce<Partial<DeliveryScore>>(
    (merged, effect) => ({
      speed: (merged.speed ?? 0) + (effect.speed ?? 0),
      safety: (merged.safety ?? 0) + (effect.safety ?? 0),
      health: (merged.health ?? 0) + (effect.health ?? 0),
      integrity: (merged.integrity ?? 0) + (effect.integrity ?? 0),
      trust: (merged.trust ?? 0) + (effect.trust ?? 0)
    }),
    {}
  );

const mergePersonaEffects = (effects: Array<Partial<Record<PersonaAxisKey, number>> | undefined>) =>
  effects.reduce<Partial<Record<PersonaAxisKey, number>>>((merged, effect) => {
    if (!effect) return merged;
    (Object.keys(effect) as PersonaAxisKey[]).forEach((key) => {
      merged[key] = (merged[key] ?? 0) + (effect[key] ?? 0);
    });
    return merged;
  }, {});

const getSelectedOptionChoices = (entry: CartEntry): OptionChoice[] =>
  entry.item.options?.flatMap((group) => {
    const selected = entry.selectedChoices[group.id] ?? [];
    return group.choices.filter((option) => selected.includes(option.id));
  }) ?? [];

const unique = <T,>(items: T[]) => Array.from(new Set(items));

export const createOrderProgressSeed = (mood: Mood, entries: CartEntry[]) =>
  `order-progress-${mood}-${entries.map((entry) => `${entry.item.category}:${entry.item.id}:${entry.quantity}`).join("|") || "empty"}`;

export const buildOrderContext = (entries: CartEntry[], mood: Mood): OrderContext => {
  const categories = unique(entries.map((entry) => entry.item.category));
  const foodCategories: Category[] = ["dessert", "snack", "nightFood", "lightFood", "staple", "stirFry", "soupPot", "other"];
  const totalQuantity = entries.reduce((sum, entry) => sum + entry.quantity, 0);
  const totalPrice = entries.reduce((sum, entry) => sum + entry.quantity * entry.item.price, 0);
  const itemNames = entries.map((entry) => entry.item.name);
  const optionChoices = entries.flatMap(getSelectedOptionChoices);
  const tags = new Set<string>();

  entries.forEach((entry) => {
    tags.add(entry.item.category);
    entry.item.tags.forEach((tag) => tags.add(tag));
    getSelectedOptionChoices(entry).forEach((option) => option.tags?.forEach((tag) => tags.add(tag)));
  });

  if (categories.some((category) => category === "milkTea" || category === "coffee")) tags.add("drink");
  if (categories.some((category) => foodCategories.includes(category))) tags.add("food");

  const joinedNames = itemNames.join(" ");
  const drinkQuantity = entries
    .filter((entry) => entry.item.category === "milkTea" || entry.item.category === "coffee")
    .reduce((sum, entry) => sum + entry.quantity, 0);
  const shopGroups = new Set(
    entries.map((entry) =>
      entry.item.category === "milkTea" || entry.item.category === "coffee"
        ? "drink"
        : entry.item.category === "dessert"
          ? "dessert"
          : entry.item.category === "activity"
            ? "activity"
            : "food"
    )
  );
  const selectedIds = new Set(optionChoices.map((option) => option.id));
  const hasHotFood =
    categories.some((category) => ["nightFood", "staple", "stirFry", "soupPot"].includes(category)) ||
    tags.has("warm") ||
    tags.has("hot") ||
    /汤|粉|面|粥|砂锅|热|烫/.test(joinedNames);
  const hasDrink = categories.includes("milkTea") || categories.includes("coffee");
  const hasFood = categories.some((category) => foodCategories.includes(category));
  const hasSweet = tags.has("sweet") || categories.includes("dessert");
  const hasFried = tags.has("fried") || /炸|酥|鸡翅|薯条/.test(joinedNames);
  const hasSoup = tags.has("soup") || /汤|粉|面|粥|砂锅|关东煮/.test(joinedNames);
  const hasToppings = selectedIds.has("boba") || selectedIds.has("taro") || tags.has("chewy");
  const hasBoba = selectedIds.has("boba") || /珍珠|波波|啵啵/.test(joinedNames);
  const isOffice = mood === "overtime" || mood === "slacking";

  const flags: Record<OrderContextFlag, boolean> = {
    hasMilkTea: categories.includes("milkTea"),
    hasCoffee: categories.includes("coffee"),
    hasDrink,
    hasFood,
    hasHotFood,
    hasDessert: categories.includes("dessert"),
    hasLightFood: categories.includes("lightFood"),
    hasActivity: categories.includes("activity"),
    hasSweet,
    hasLowSugar: tags.has("lowSugar") || selectedIds.has("zero") || selectedIds.has("half"),
    hasSpicy: tags.has("spicy") || /辣|麻/.test(joinedNames),
    hasFried,
    hasSoup,
    hasToppings,
    hasBoba,
    hasMultiCup: drinkQuantity >= 2,
    hasMixedTemperature: hasDrink && hasHotFood,
    hasMultipleShops: shopGroups.size >= 2,
    hasNotes: optionChoices.length > entries.length || tags.has("healthyNote") || tags.has("separatePack") || tags.has("safe"),
    nearDiscount: (totalPrice >= 35 && totalPrice < 49) || (totalPrice >= 84 && totalPrice < 98) || totalQuantity >= 2,
    isHighSugarOrOil: hasSweet || hasFried || tags.has("spicy") || entries.some((entry) => entry.item.stats.health <= -5),
    isLateNight: mood === "lateNight",
    isOffice,
    isSocial: mood === "date" || mood === "celebration" || tags.has("share") || tags.has("party") || tags.has("social")
  };

  flags.hasMixedTemperature = flags.hasDrink && flags.hasHotFood;

  return {
    mood,
    destinationName: destinationByMood[mood] ?? "家",
    categories,
    tags: Array.from(tags),
    itemNames,
    totalQuantity,
    totalPrice,
    flags
  };
};

const eventMatchesContext = (event: OrderProgressEvent, context: OrderContext, nodeId: string) => {
  const tags = new Set(context.tags);
  const categories = new Set(context.categories);

  if (!event.nodeIds.includes(nodeId)) return false;
  if (event.moods && !event.moods.includes(context.mood)) return false;
  if (event.requiredCategories?.some((category) => !categories.has(category))) return false;
  if (event.requiredTags?.some((tag) => !tags.has(tag))) return false;
  if (event.excludedTags?.some((tag) => tags.has(tag))) return false;
  if (event.requiredFlags?.some((flag) => !context.flags[flag])) return false;
  if (event.excludedFlags?.some((flag) => context.flags[flag])) return false;
  return true;
};

export const getEligibleOrderProgressEvents = (context: OrderContext, nodeId: string, usedGroups: string[] = []) => {
  const node = orderProgressNodes.find((item) => item.id === nodeId);
  if (!node) return [];
  const usedGroupSet = new Set(usedGroups);
  const candidates = orderProgressEventBank.filter((event) => event.phase === node.phase && eventMatchesContext(event, context, nodeId));
  const freshCandidates = candidates.filter((event) => !usedGroupSet.has(event.group));
  return freshCandidates.length > 0 ? freshCandidates : candidates;
};

const chooseWeighted = (events: OrderProgressEvent[], random: () => number) => {
  const totalWeight = events.reduce((sum, event) => sum + (event.weight ?? 1), 0);
  let cursor = random() * totalWeight;
  for (const event of events) {
    cursor -= event.weight ?? 1;
    if (cursor <= 0) return event;
  }
  return events[events.length - 1];
};

export const selectOrderProgressEvents = (context: OrderContext, seed: string) => {
  const usedGroups: string[] = [];
  return orderProgressNodes.map((node) => {
    const candidates = getEligibleOrderProgressEvents(context, node.id, usedGroups);
    const fallback = orderProgressEventBank.filter((event) => event.phase === node.phase && event.nodeIds.includes(node.id));
    const selected = chooseWeighted(candidates.length > 0 ? candidates : fallback, seededRandom(`${seed}-${node.id}`));
    usedGroups.push(selected.group);
    return selected;
  });
};

const buildOutcome = (state: OrderProgressGameState): EscortOutcome => {
  const stability = Math.round((state.score.safety + state.score.integrity + state.score.trust + state.score.health) / 4);
  const achievements = new Set<string>();
  state.resolvedEvents.forEach((event) => event.badges?.forEach((badge) => achievements.add(badge)));
  if (state.score.integrity >= 82) achievements.add("快乐完整主义者");
  if (state.score.trust >= 82) achievements.add("骑手友好");
  if (state.score.health >= 78) achievements.add("低糖谈判家");
  if (state.score.safety >= 82) achievements.add("安心守护者");

  let rating: EscortOutcome["rating"] = "C";
  let title = "订单完成，但人格证据有点摇摆";
  if (stability >= 86 && state.resolvedEvents.length >= orderProgressNodes.length) {
    rating = "隐藏";
    title = "金牌吃商鉴定样本";
    achievements.add("金牌吃商鉴定样本");
  } else if (stability >= 80) {
    rating = "S";
    title = "高完成度快乐订单";
  } else if (stability >= 68) {
    rating = "A";
    title = "稳定送达的快乐";
  } else if (stability >= 56) {
    rating = "B";
    title = "有点拉扯但快乐还在";
  }

  const merchantLine = state.resolvedEvents
    .filter((event) => event.phase === "merchant")
    .map((event) => `${event.nodeLabel}：${event.choiceLabel}`)
    .join(" / ");
  const riderLine = state.resolvedEvents
    .filter((event) => event.phase === "rider")
    .map((event) => `${event.nodeLabel}：${event.choiceLabel}`)
    .join(" / ");
  const arrivalLine = state.resolvedEvents
    .filter((event) => event.phase === "arrival")
    .map((event) => `${event.nodeLabel}：${event.choiceLabel}`)
    .join(" / ");

  return {
    rating,
    title,
    routeLine: `商家确认 -> 骑手沟通 -> ${state.context.destinationName}收餐`,
    pickupLine: "关键临场选择已走完",
    achievements: Array.from(achievements).slice(0, 6),
    finalScore: state.score,
    turnsTaken: state.resolvedEvents.length,
    routeSummary: state.nodes.map((node, index) => `${index < state.resolvedEvents.length ? "已完成" : "未完成"} · ${node.label}`),
    sceneSummary: state.resolvedEvents.slice(-5).map((event) => `${event.eventTitle}：${event.choiceLabel}`),
    summaryLines: [
      `商家阶段：${merchantLine || "无额外波动"}`,
      `骑手阶段：${riderLine || "沟通顺畅"}`,
      `收餐反应：${arrivalLine || "等待确认"}`,
      `订单评级：${rating} · ${title}`
    ]
  };
};

export const createOrderProgressGame = ({
  entries,
  mood,
  seed = createOrderProgressSeed(mood, entries)
}: {
  entries: CartEntry[];
  mood: Mood;
  seed?: string;
}): OrderProgressGameState => {
  const context = buildOrderContext(entries, mood);
  const events = selectOrderProgressEvents(context, seed);
  return {
    seed,
    context,
    nodes: orderProgressNodes,
    events,
    currentIndex: 0,
    currentEvent: events[0],
    score: { ...initialOrderProgressScore },
    resolvedEvents: [],
    completed: false
  };
};

export const resolveOrderProgressEvent = (state: OrderProgressGameState, selectedChoiceIds: string[]): OrderProgressGameState => {
  if (!state.currentEvent || state.completed) return state;
  const event = state.currentEvent;
  const selectedChoices = event.choices.filter((item) => selectedChoiceIds.includes(item.id));
  const safeChoices = selectedChoices.length > 0 ? selectedChoices : [event.choices[0]];
  const effect = mergeEffects(safeChoices.map((item) => item.effect));
  const personaEffect = mergePersonaEffects(safeChoices.map((item) => item.personaEffect));
  const node = state.nodes[state.currentIndex];
  const resolvedEvent: OrderResolvedEvent = {
    id: event.id,
    nodeId: node.id,
    nodeLabel: node.label,
    phase: event.phase,
    eventTitle: event.title,
    choiceLabel: safeChoices.map((item) => item.label).join(" + "),
    eventType: event.eventType,
    tileType: event.tileType,
    effect,
    personaEffect,
    badges: unique(safeChoices.flatMap((item) => item.badges ?? []))
  };
  const nextScore = applyScoreEffect(state.score, effect);
  const nextIndex = state.currentIndex + 1;
  const baseState: OrderProgressGameState = {
    ...state,
    score: nextScore,
    resolvedEvents: [...state.resolvedEvents, resolvedEvent],
    currentIndex: Math.min(nextIndex, state.nodes.length - 1),
    currentEvent: state.events[nextIndex],
    completed: nextIndex >= state.nodes.length
  };

  if (!baseState.completed) return baseState;
  const completedState = { ...baseState, currentEvent: undefined };
  return { ...completedState, outcome: buildOutcome(completedState) };
};

export const toOrderJourneyEvents = (state: OrderProgressGameState): ResultJourneyEvent[] =>
  state.resolvedEvents.map((event) => ({
    eventTitle: `${event.nodeLabel} · ${event.eventTitle}`,
    choiceLabel: event.choiceLabel,
    eventType: event.eventType,
    tileType: event.tileType,
    personaEffect: event.personaEffect,
    badges: event.badges,
    phase: event.phase
  }));

export const getOrderProgressPhaseCounts = (state: OrderProgressGameState) =>
  state.nodes.reduce<Record<"merchant" | "rider" | "arrival", number>>(
    (counts, node) => {
      counts[node.phase] += 1;
      return counts;
    },
    { merchant: 0, rider: 0, arrival: 0 }
  );
