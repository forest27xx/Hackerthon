import type { Category, ComboRule, DeliveryEvent, MenuItem, MoodOption, OptionGroup } from "../types";

export const categories: { id: Category; label: string; shortLabel: string }[] = [
  { id: "milkTea", label: "奶茶", shortLabel: "茶" },
  { id: "coffee", label: "咖啡", shortLabel: "咖" },
  { id: "dessert", label: "甜品", shortLabel: "甜" },
  { id: "snack", label: "小吃", shortLabel: "吃" },
  { id: "nightFood", label: "夜宵", shortLabel: "夜" },
  { id: "lightFood", label: "轻食", shortLabel: "轻" },
  { id: "activity", label: "玩乐", shortLabel: "玩" }
];

export const moods: MoodOption[] = [
  { id: "tired", label: "困", line: "眼睛开机失败，急需一杯精神启动液。", recommendedTags: ["caffeine", "refresh"] },
  { id: "hungry", label: "馋", line: "不是饿，是嘴巴需要一个明确交代。", recommendedTags: ["fullness", "comfort"] },
  { id: "emo", label: "emo", line: "今天要把情绪泡进温热甜口里。", recommendedTags: ["comfort", "warm"] },
  { id: "overtime", label: "加班", line: "把电量从 3% 拉回可沟通状态。", recommendedTags: ["caffeine", "comfort"] },
  { id: "slacking", label: "摸鱼", line: "要低调，但快乐不能低配。", recommendedTags: ["light", "fun"] },
  { id: "celebration", label: "庆祝", line: "今天值得多加一份小料。", recommendedTags: ["party", "sweet"] },
  { id: "date", label: "约会", line: "好喝、好看、好分享，不能出错。", recommendedTags: ["share", "safe"] },
  { id: "crazy", label: "发疯", line: "理智下线，但订单要有章法。", recommendedTags: ["spicy", "combo"] },
  { id: "afterWorkout", label: "健身后", line: "快乐可以有，恢复也要安排。", recommendedTags: ["protein", "light"] },
  { id: "lateNight", label: "深夜嘴馋", line: "罪恶感先放一边，健康备注跟上。", recommendedTags: ["warm", "lowSugar"] }
];

const drinkOptions: OptionGroup[] = [
  {
    id: "sugar",
    name: "糖度",
    type: "single",
    choices: [
      { id: "zero", label: "无糖", statDelta: { health: 8, joy: -1 }, tags: ["lowSugar"] },
      { id: "half", label: "半糖", statDelta: { health: 5, joy: 1 }, tags: ["lowSugar"] },
      { id: "normal", label: "正常糖", statDelta: { joy: 4, health: -3 }, tags: ["sweet"] }
    ]
  },
  {
    id: "ice",
    name: "冰量",
    type: "single",
    choices: [
      { id: "hot", label: "热饮", statDelta: { safety: 2, health: 1 }, tags: ["warm"] },
      { id: "lessIce", label: "少冰", statDelta: { safety: 2 }, tags: ["safe"] },
      { id: "ice", label: "正常冰", statDelta: { joy: 2, energy: 1 } }
    ]
  },
  {
    id: "toppings",
    name: "加料",
    type: "multi",
    choices: [
      { id: "boba", label: "珍珠", priceDelta: 2, statDelta: { joy: 3, fullness: 2 }, tags: ["chewy"] },
      { id: "taro", label: "芋泥", priceDelta: 4, statDelta: { joy: 5, fullness: 4 }, tags: ["comfort"] },
      { id: "sealed", label: "加固杯托", priceDelta: 1, statDelta: { safety: 5 }, tags: ["safe"] }
    ]
  }
];

const foodOptions: OptionGroup[] = [
  {
    id: "portion",
    name: "分量",
    type: "single",
    choices: [
      { id: "small", label: "轻量", statDelta: { health: 3, fullness: -2 }, tags: ["light"] },
      { id: "normal", label: "标准", statDelta: { fullness: 2 } },
      { id: "large", label: "加量", priceDelta: 5, statDelta: { joy: 2, fullness: 7, health: -2 }, tags: ["fullness"] }
    ]
  },
  {
    id: "packaging",
    name: "包装",
    type: "multi",
    choices: [
      { id: "separate", label: "冷热分装", priceDelta: 1, statDelta: { safety: 5 }, tags: ["separatePack"] },
      { id: "lessOil", label: "少油少盐备注", statDelta: { health: 6, joy: -1 }, tags: ["healthyNote"] }
    ]
  }
];

const activityOptions: OptionGroup[] = [
  {
    id: "duration",
    name: "时长",
    type: "single",
    choices: [
      { id: "mini", label: "15 分钟", statDelta: { health: 1, joy: 2 } },
      { id: "normal", label: "30 分钟", priceDelta: 6, statDelta: { joy: 6 } },
      { id: "deep", label: "60 分钟", priceDelta: 16, statDelta: { joy: 12, energy: -2 } }
    ]
  }
];

const s = (joy: number, health: number, fullness: number, energy: number, safety: number) => ({
  joy,
  health,
  fullness,
  energy,
  safety
});

const item = (
  id: string,
  name: string,
  category: Category,
  price: number,
  description: string,
  tags: string[],
  stats: ReturnType<typeof s>,
  options?: OptionGroup[]
): MenuItem => ({ id, name, category, price, description, tags, stats, options });

export const menuItems: MenuItem[] = [
  item("mt-01", "厚芋泥波波", "milkTea", 18, "绵密芋泥和珍珠一起把今天哄好。", ["sweet", "comfort", "milkTea"], s(18, -4, 8, 3, 3), drinkOptions),
  item("mt-02", "杨枝甘露", "milkTea", 20, "芒果、柚粒和奶香的阳光组合。", ["fruit", "sweet", "share"], s(19, 1, 6, 3, 4), drinkOptions),
  item("mt-03", "茉莉奶绿", "milkTea", 15, "清香不抢戏，适合偷偷回血。", ["refresh", "milkTea", "light"], s(13, 2, 4, 4, 4), drinkOptions),
  item("mt-04", "黑糖珍珠鲜奶", "milkTea", 19, "黑糖挂壁，快乐直达脑门。", ["sweet", "chewy", "comfort"], s(21, -7, 9, 4, 3), drinkOptions),
  item("mt-05", "桂花酒酿奶茶", "milkTea", 21, "温柔米香，适合把情绪放软。", ["warm", "comfort", "sweet"], s(20, -1, 7, 2, 4), drinkOptions),
  item("mt-06", "鸭屎香柠檬茶", "milkTea", 16, "茶香很冲，困意很怂。", ["refresh", "caffeine", "fruit"], s(16, 4, 3, 10, 5), drinkOptions),
  item("mt-07", "草莓啵啵酸奶", "milkTea", 22, "酸甜粉色警报，适合庆祝。", ["fruit", "party", "share"], s(22, 2, 8, 4, 4), drinkOptions),
  item("mt-08", "海盐芝士乌龙", "milkTea", 18, "咸甜云朵盖在清醒乌龙上。", ["caffeine", "comfort", "share"], s(17, -1, 5, 8, 4), drinkOptions),
  item("mt-09", "生椰拿铁奶茶", "milkTea", 19, "椰香和茶感握手言和。", ["caffeine", "refresh", "milkTea"], s(17, 1, 5, 8, 4), drinkOptions),
  item("mt-10", "桃桃乌龙", "milkTea", 17, "水蜜桃香气给今天打光。", ["fruit", "light", "share"], s(15, 4, 4, 5, 5), drinkOptions),
  item("mt-11", "红豆双皮奶饮", "milkTea", 20, "像把甜品装进吸管里。", ["sweet", "comfort", "fullness"], s(21, -4, 11, 2, 3), drinkOptions),
  item("mt-12", "抹茶麻薯奶茶", "milkTea", 21, "抹茶微苦，麻薯认真。", ["chewy", "comfort", "share"], s(20, -2, 10, 5, 4), drinkOptions),
  item("cf-01", "冰美式续命杯", "coffee", 14, "苦，但把人从工位边缘拉回来。", ["caffeine", "refresh", "overtime"], s(10, 2, 1, 16, 5), drinkOptions),
  item("cf-02", "燕麦拿铁", "coffee", 19, "柔和咖啡因，不和胃吵架。", ["caffeine", "light", "healthy"], s(14, 5, 4, 12, 5), drinkOptions),
  item("cf-03", "生椰拿铁", "coffee", 20, "椰香给咖啡加一层假期滤镜。", ["caffeine", "comfort", "share"], s(17, 2, 5, 12, 5), drinkOptions),
  item("cf-04", "焦糖玛奇朵", "coffee", 21, "甜得有底气，困得没脾气。", ["caffeine", "sweet", "comfort"], s(20, -5, 5, 13, 4), drinkOptions),
  item("cf-05", "橙香冷萃", "coffee", 22, "清爽果香，适合下午三点自救。", ["caffeine", "fruit", "refresh"], s(16, 4, 2, 14, 5), drinkOptions),
  item("cf-06", "热拿铁抱抱杯", "coffee", 18, "热杯握住，情绪稍微落地。", ["caffeine", "warm", "comfort"], s(16, 2, 4, 11, 5), drinkOptions),
  item("cf-07", "抹茶咖啡云顶", "coffee", 23, "苦、甜、茶、咖，一杯里开会。", ["caffeine", "sweet", "party"], s(21, -2, 5, 14, 4), drinkOptions),
  item("cf-08", "低因轻醒拿铁", "coffee", 20, "想清醒，但不想心跳开派对。", ["lowSugar", "light", "healthy"], s(13, 7, 3, 6, 5), drinkOptions),
  item("ds-01", "芋泥盒子蛋糕", "dessert", 24, "一勺下去，世界安静三秒。", ["sweet", "comfort", "fullness"], s(24, -7, 14, 3, 4), foodOptions),
  item("ds-02", "提拉米苏小方", "dessert", 22, "咖啡香和奶油把疲惫盖住。", ["sweet", "caffeine", "share"], s(22, -6, 10, 7, 4), foodOptions),
  item("ds-03", "草莓奶油可颂", "dessert", 19, "脆皮、奶油、草莓，快乐有层次。", ["sweet", "fruit", "party"], s(21, -5, 9, 4, 4), foodOptions),
  item("ds-04", "低糖酸奶碗", "dessert", 21, "酸奶、水果、坚果，快乐带点自律。", ["lowSugar", "healthy", "light"], s(16, 12, 8, 5, 6), foodOptions),
  item("ds-05", "爆浆麻薯球", "dessert", 15, "糯叽叽小炮弹，适合摸鱼。", ["chewy", "sweet", "fun"], s(18, -4, 7, 2, 4), foodOptions),
  item("ds-06", "榴莲千层", "dessert", 28, "社交风险和快乐浓度都很高。", ["sweet", "party", "bold"], s(25, -6, 12, 3, 3), foodOptions),
  item("ds-07", "焦糖布丁", "dessert", 13, "轻轻一抖，心也跟着软。", ["sweet", "comfort", "light"], s(16, -3, 5, 2, 5), foodOptions),
  item("ds-08", "黑巧能量 brownie", "dessert", 18, "微苦黑巧，适合把情绪扶正。", ["caffeine", "comfort", "energy"], s(17, -1, 9, 8, 5), foodOptions),
  item("sk-01", "盐酥鸡", "snack", 18, "外脆里嫩，深夜理智杀手。", ["fried", "comfort", "fullness"], s(21, -8, 16, 3, 3), foodOptions),
  item("sk-02", "章鱼小丸子", "snack", 16, "热气、柴鱼片、酱汁，快乐会跳舞。", ["warm", "comfort", "share"], s(19, -4, 10, 2, 4), foodOptions),
  item("sk-03", "芝士薯条", "snack", 17, "拉丝瞬间，烦恼短暂停止加载。", ["fried", "cheese", "party"], s(21, -9, 13, 3, 3), foodOptions),
  item("sk-04", "烤冷面", "snack", 14, "酸甜咸辣齐上阵，路边摊灵魂。", ["spicy", "warm", "comfort"], s(20, -4, 12, 3, 4), foodOptions),
  item("sk-05", "炸鸡翅", "snack", 22, "一口下去，会议暂时不重要。", ["fried", "comfort", "party"], s(24, -10, 18, 4, 3), foodOptions),
  item("sk-06", "蒜香鸡胸条", "snack", 20, "蛋白补给，不放弃好吃。", ["protein", "healthy", "fullness"], s(17, 10, 15, 5, 6), foodOptions),
  item("sk-07", "凉拌毛豆", "snack", 12, "清爽、耐嚼、聊天神器。", ["light", "healthy", "share"], s(13, 10, 7, 2, 6), foodOptions),
  item("sk-08", "牛肉芝士卷", "snack", 24, "饱腹感和罪恶感一起到达。", ["cheese", "fullness", "comfort"], s(23, -5, 20, 5, 4), foodOptions),
  item("nf-01", "番茄牛腩粉", "nightFood", 28, "热汤压住夜里的空荡感。", ["warm", "fullness", "comfort"], s(22, 1, 24, 5, 5), foodOptions),
  item("nf-02", "菌菇鸡汤面", "nightFood", 26, "清汤热面，适合把胃哄睡。", ["warm", "healthy", "fullness"], s(18, 8, 20, 4, 6), foodOptions),
  item("nf-03", "麻辣拌", "nightFood", 25, "辣得很认真，快乐也很明确。", ["spicy", "combo", "fullness"], s(25, -6, 22, 6, 4), foodOptions),
  item("nf-04", "砂锅粥", "nightFood", 23, "慢慢热起来，适合深夜降噪。", ["warm", "healthy", "comfort"], s(18, 9, 18, 3, 7), foodOptions),
  item("nf-05", "小龙虾拌面", "nightFood", 32, "仪式感很强，吃完很想截图。", ["spicy", "party", "share"], s(28, -7, 24, 5, 4), foodOptions),
  item("nf-06", "烤鱼饭团", "nightFood", 21, "碳水和鱼香达成停战协议。", ["fullness", "warm", "safe"], s(19, 3, 18, 5, 6), foodOptions),
  item("nf-07", "酸辣汤饺", "nightFood", 24, "酸辣开胃，热汤兜底。", ["spicy", "warm", "comfort"], s(21, 1, 20, 4, 5), foodOptions),
  item("nf-08", "深夜关东煮", "nightFood", 19, "萝卜、鱼丸、热汤，像便利店灯光。", ["warm", "light", "comfort"], s(17, 4, 13, 3, 6), foodOptions),
  item("lf-01", "鸡胸藜麦碗", "lightFood", 29, "高蛋白、不敷衍，健身后友好。", ["protein", "healthy", "light"], s(17, 15, 18, 7, 7), foodOptions),
  item("lf-02", "牛油果全麦卷", "lightFood", 27, "清爽脂肪和全麦碳水组队。", ["healthy", "light", "share"], s(16, 13, 15, 5, 7), foodOptions),
  item("lf-03", "鲜虾沙拉杯", "lightFood", 25, "吃完不困，适合下午继续做人。", ["healthy", "protein", "refresh"], s(15, 14, 12, 7, 7), foodOptions),
  item("lf-04", "低糖水果盒", "lightFood", 18, "维生素含量和拍照友好度都在线。", ["lowSugar", "fruit", "healthy"], s(15, 14, 8, 5, 7), foodOptions),
  item("lf-05", "紫菜豆腐汤", "lightFood", 16, "轻负担热汤，适合夜里补一口。", ["warm", "healthy", "light"], s(13, 12, 8, 3, 7), foodOptions),
  item("lf-06", "蛋白酸奶杯", "lightFood", 19, "甜口恢复局，不和自律打架。", ["protein", "lowSugar", "afterWorkout"], s(16, 13, 10, 6, 7), foodOptions),
  item("lf-07", "玉米鸡蛋轻食盒", "lightFood", 20, "朴素但可靠，像一个准时下班的人。", ["healthy", "fullness", "safe"], s(14, 12, 16, 5, 8), foodOptions),
  item("lf-08", "无糖气泡水", "lightFood", 9, "给高糖订单踩一脚刹车。", ["lowSugar", "refresh", "healthy"], s(9, 12, 1, 4, 8), drinkOptions),
  item("ac-01", "电玩城 30 分钟", "activity", 18, "把压力投进投篮机。", ["fun", "party", "energy"], s(24, 4, 0, 5, 6), activityOptions),
  item("ac-02", "楼下散步取餐", "activity", 0, "把等待变成轻运动。", ["healthy", "light", "safe"], s(10, 12, 0, 3, 8), activityOptions),
  item("ac-03", "朋友拼单邀请", "activity", 0, "快乐有时需要见证人。", ["share", "party", "social"], s(20, 1, 0, 2, 6), activityOptions),
  item("ac-04", "十五分钟桌游局", "activity", 12, "等餐时把脑子切到另一个频道。", ["fun", "share", "slacking"], s(21, 2, 0, 2, 6), activityOptions),
  item("ac-05", "饭后拉伸提醒", "activity", 0, "给久坐生活打一个小补丁。", ["healthy", "afterWorkout", "light"], s(8, 13, 0, 2, 8), activityOptions),
  item("ac-06", "K 歌单曲券", "activity", 16, "把今天的怨气唱成副歌。", ["fun", "crazy", "party"], s(25, 1, 0, 4, 6), activityOptions),
  item("ac-07", "盲盒电影片段", "activity", 10, "随机 8 分钟短片，给等待开窗。", ["fun", "comfort", "slacking"], s(18, 2, 0, 1, 7), activityOptions),
  item("ac-08", "夜风醒脑路线", "activity", 0, "下楼吹风，顺手把外卖接回来。", ["healthy", "lateNight", "safe"], s(14, 10, 0, 3, 9), activityOptions)
];

export const comboRules: ComboRule[] = [
  { id: "c01", name: "加班续命包", description: "咖啡因和安慰感把电量拉回可沟通区间。", condition: { moods: ["overtime", "tired"], requiredTags: ["caffeine", "comfort"], minItems: 2 }, bonus: { joy: 10, energy: 12 } },
  { id: "c02", name: "低糖自律局", description: "快乐有安排，糖分先谈判。", condition: { requiredTags: ["lowSugar", "healthy"], minItems: 2 }, bonus: { health: 14, safety: 4 } },
  { id: "c03", name: "周五发疯套餐", description: "辣、炸、玩乐齐上，理智下线但流程完整。", condition: { moods: ["crazy", "celebration"], requiredTags: ["party", "fun"], minItems: 3 }, bonus: { joy: 18, energy: 5 } },
  { id: "c04", name: "深夜罪恶但有分寸", description: "热汤兜底，备注少油，深夜也留一手。", condition: { moods: ["lateNight"], requiredTags: ["warm", "healthyNote"], minItems: 2 }, bonus: { health: 8, safety: 6 } },
  { id: "c05", name: "健身后恢复局", description: "蛋白、低糖、补水，快乐没有拖后腿。", condition: { moods: ["afterWorkout"], requiredTags: ["protein", "lowSugar"], minItems: 2 }, bonus: { health: 16, energy: 8 } },
  { id: "c06", name: "约会不翻车组合", description: "好看、好分享、包装稳。", condition: { moods: ["date"], requiredTags: ["share", "safe"], minItems: 2 }, bonus: { joy: 8, safety: 8 } },
  { id: "c07", name: "摸鱼低调快乐", description: "轻食和小玩乐，不惊动任何工作群。", condition: { moods: ["slacking"], requiredTags: ["light", "fun"], minItems: 2 }, bonus: { joy: 10, health: 6 } },
  { id: "c08", name: "甜品安慰站", description: "甜口和热饮负责暂存坏情绪。", condition: { moods: ["emo"], requiredTags: ["sweet", "warm"], minItems: 2 }, bonus: { joy: 14, safety: 3 } },
  { id: "c09", name: "朋友见证快乐", description: "能分享的东西，快乐会自动扩容。", condition: { requiredTags: ["share", "party"], minItems: 2 }, bonus: { joy: 10 } },
  { id: "c10", name: "防撒漏工程队", description: "冷热分装和加固包装让路途更稳。", condition: { requiredTags: ["separatePack", "safe"], minItems: 2 }, bonus: { safety: 16 } },
  { id: "c11", name: "热汤降噪模式", description: "热食热饮让夜里的噪音小一点。", condition: { requiredTags: ["warm", "comfort"], minItems: 2 }, bonus: { joy: 8, health: 5 } },
  { id: "c12", name: "清醒不心慌", description: "低负担咖啡因，救急但不乱跳。", condition: { requiredTags: ["caffeine", "light"], minItems: 2 }, bonus: { energy: 10, health: 6 } },
  { id: "c13", name: "糯叽叽快乐派", description: "每一口都很有存在感。", condition: { requiredTags: ["chewy"], minItems: 2 }, bonus: { joy: 9, fullness: 5 } },
  { id: "c14", name: "辣味清醒警报", description: "辣度把困意推出房间。", condition: { requiredTags: ["spicy"], minItems: 2 }, bonus: { joy: 8, energy: 8 } },
  { id: "c15", name: "水果打光计划", description: "果香负责让订单看起来更像生活。", condition: { requiredTags: ["fruit"], minItems: 2 }, bonus: { joy: 7, health: 6 } },
  { id: "c16", name: "饱腹安全垫", description: "碳水和蛋白给情绪垫个底。", condition: { requiredTags: ["fullness"], minItems: 2 }, bonus: { fullness: 12, safety: 4 } },
  { id: "c17", name: "安静复活仪式", description: "不用很吵，也能慢慢回血。", condition: { moods: ["tired", "emo"], requiredTags: ["comfort"], minItems: 3 }, bonus: { joy: 12, health: 5 } },
  { id: "c18", name: "清爽逃离会议", description: "柠檬、气泡和轻活动一起把脑袋打开。", condition: { requiredTags: ["refresh", "healthy"], minItems: 2 }, bonus: { energy: 7, health: 9 } },
  { id: "c19", name: "派对不失控", description: "庆祝可以热闹，包装和备注也要跟上。", condition: { moods: ["celebration"], requiredTags: ["party", "safe"], minItems: 2 }, bonus: { joy: 10, safety: 8 } },
  { id: "c20", name: "便利店灯光联盟", description: "夜风、热汤和小食组成微型避难所。", condition: { moods: ["lateNight"], requiredTags: ["lateNight", "warm"], minItems: 2 }, bonus: { joy: 10, health: 5 } }
];

export const deliveryEvents: DeliveryEvent[] = [
  { id: "fs-seal", type: "foodSafety", title: "封口机临时故障", body: "商家说重新封口要多等 2 分钟。", knowledge: "饮品封口完整能降低撒漏和外界污染风险。", choices: [{ id: "wait", label: "等重新封口", detail: "慢一点，但稳很多。", effect: { speed: -2, safety: 8, integrity: 8, trust: 3 } }, { id: "go", label: "直接出餐", detail: "速度快，但风险上升。", effect: { speed: 5, safety: -6, integrity: -8, trust: -2 } }] },
  { id: "fs-hot-cold", type: "foodSafety", title: "冷热能否分袋", body: "热食和冷饮正在同一个袋子里相遇。", knowledge: "冷热分开能保护口感，也降低包装受潮和串味。", choices: [{ id: "split", label: "要求冷热分装", effect: { speed: -2, safety: 7, integrity: 9, trust: 2 } }, { id: "same", label: "同袋快送", effect: { speed: 3, safety: -4, integrity: -6 } }] },
  { id: "fs-boba", type: "foodSafety", title: "小料刚煮好", body: "店员提醒珍珠还很烫，马上封杯可能影响口感。", knowledge: "热小料和冷饮直接混合会影响温度与口感稳定。", choices: [{ id: "cool", label: "等小料稍微冷却", effect: { speed: -3, safety: 5, integrity: 8, health: 1 } }, { id: "now", label: "马上装杯", effect: { speed: 4, integrity: -5, safety: -2 } }] },
  { id: "fs-note", type: "foodSafety", title: "少糖少冰被忽略", body: "系统发现商家回传的规格和备注不一致。", knowledge: "清晰备注和及时确认能减少误单，也能帮助控制添加糖摄入。", choices: [{ id: "redo", label: "礼貌请商家重做", effect: { speed: -6, health: 9, trust: 5, integrity: 5 } }, { id: "accept", label: "接受原单", effect: { speed: 4, health: -7, trust: -2 } }, { id: "tea", label: "换无糖茶底", effect: { speed: -2, health: 8, integrity: 2 } }] },
  { id: "rs-rain", type: "riderSafety", title: "暴雨配送", body: "骑手预计晚到 4 分钟。", knowledge: "恶劣天气下催促赶路会提高交通风险。", choices: [{ id: "safe", label: "安全第一不催单", effect: { speed: -3, safety: 10, trust: 8 } }, { id: "hurry", label: "继续催一下", effect: { speed: 4, safety: -9, trust: -6 } }] },
  { id: "rs-traffic", type: "riderSafety", title: "骑手想抄近路", body: "近路会逆行一小段，但能快 3 分钟。", knowledge: "遵守交通规则比几分钟速度更重要。", choices: [{ id: "rule", label: "提醒遵守交通规则", effect: { speed: -3, safety: 12, trust: 6 } }, { id: "fast", label: "默认快一点", effect: { speed: 5, safety: -12, trust: -4 } }] },
  { id: "rs-gate", type: "riderSafety", title: "门禁复杂", body: "小区入口和楼栋距离有点绕。", knowledge: "提前提供清晰取餐点能减少绕路和沟通成本。", choices: [{ id: "map", label: "发送清晰取餐点", effect: { speed: 3, trust: 8, integrity: 3, safety: 3 } }, { id: "wait", label: "等骑手到了再说", effect: { speed: -4, trust: -4, integrity: -2 } }] },
  { id: "rs-heat", type: "riderSafety", title: "高温配送", body: "室外温度很高，饮品和骑手都在接受考验。", knowledge: "高温天气可选择保温/隔热包装，也应减少催促。", choices: [{ id: "coolbag", label: "加隔热袋并不催", effect: { speed: -1, safety: 8, integrity: 7, trust: 5 } }, { id: "normal", label: "普通配送", effect: { speed: 2, integrity: -5, safety: -3 } }] },
  { id: "pk-soup", type: "packaging", title: "汤粉和奶茶同袋", body: "汤、粉、炸物、奶茶正在同袋出发。", knowledge: "液体和脆皮食物分开能降低撒漏和变软风险。", choices: [{ id: "separate", label: "分装并加杯托", effect: { speed: -2, integrity: 12, safety: 7 } }, { id: "together", label: "保持同袋", effect: { speed: 3, integrity: -10, safety: -4 } }] },
  { id: "pk-elevator", type: "packaging", title: "电梯拥堵", body: "楼上队伍很长，骑手卡在电梯口。", knowledge: "清晰的交付方式能减少等待和餐品晃动。", choices: [{ id: "frontdesk", label: "放前台自取", effect: { speed: 4, integrity: 4, trust: 4, health: 2 } }, { id: "upstairs", label: "继续等上楼", effect: { speed: -5, trust: -2, integrity: 1 } }, { id: "downstairs", label: "楼下碰头", effect: { speed: 2, health: 5, trust: 5 } }] },
  { id: "pk-bumpy", type: "packaging", title: "路线颠簸", body: "系统预测有一段路很颠。", knowledge: "满杯饮品更适合加杯托和密封袋。", choices: [{ id: "reinforce", label: "加固包装", effect: { speed: -1, integrity: 10, safety: 5 } }, { id: "risk", label: "相信命运", effect: { speed: 2, integrity: -8 } }] },
  { id: "pk-label", type: "packaging", title: "多杯拼单易拿错", body: "三杯饮品长得几乎一样。", knowledge: "杯身标记能减少错拿和过敏/忌口风险。", choices: [{ id: "label", label: "请商家标记杯身", effect: { speed: -1, integrity: 7, safety: 6, trust: 3 } }, { id: "memory", label: "靠记忆分辨", effect: { speed: 2, integrity: -7, safety: -3 } }] },
  { id: "hl-sugar", type: "healthyLife", title: "深夜高糖订单", body: "系统发现糖分和夜色都偏高。", knowledge: "减少添加糖摄入是更稳的日常选择。", choices: [{ id: "half", label: "改半糖并加水", effect: { health: 10, trust: 1 } }, { id: "tomorrow", label: "分一半明天吃", effect: { health: 8, integrity: 2 } }, { id: "full", label: "今晚先快乐", effect: { health: -8, speed: 2 } }] },
  { id: "hl-salt", type: "healthyLife", title: "高油高盐组合", body: "炸物和重口味主食一起冲线。", knowledge: "搭配蔬菜、水果或无糖饮能让这一单更平衡。", choices: [{ id: "veg", label: "补一个轻食或无糖饮", effect: { health: 9, trust: 2 } }, { id: "lessoil", label: "备注少油少盐", effect: { health: 7, integrity: 2 } }, { id: "ignore", label: "保持原样", effect: { health: -6, speed: 2 } }] },
  { id: "hl-walk", type: "healthyLife", title: "饭后久坐预警", body: "系统建议饭后走 10 分钟。", knowledge: "轻量活动可以帮助形成更好的餐后生活节奏。", choices: [{ id: "walk", label: "下楼散步取餐", effect: { speed: 1, health: 9, trust: 2 } }, { id: "sofa", label: "沙发等外卖", effect: { health: -4, integrity: 1 } }] },
  { id: "hl-workout", type: "healthyLife", title: "健身后补给", body: "你刚运动完，系统建议补水和蛋白。", knowledge: "运动后选择蛋白、补水和低糖搭配更稳。", choices: [{ id: "protein", label: "加蛋白轻食", effect: { health: 11, integrity: 2 } }, { id: "sugar", label: "奖励高糖甜品", effect: { health: -4, trust: 1 } }] },
  { id: "ng-long", type: "noteGame", title: "备注太长", body: "商家可能看不懂这段小作文。", knowledge: "备注越清晰，执行越稳定。", choices: [{ id: "short", label: "简化成三条要求", effect: { speed: 2, integrity: 8, trust: 5 } }, { id: "essay", label: "保留完整备注", effect: { speed: -3, integrity: -5, trust: -2 } }] },
  { id: "ng-fast-steady", type: "noteGame", title: "想快又想稳", body: "系统要求你在速度和完整度之间做选择。", knowledge: "速度、包装、准确度常常需要取舍。", choices: [{ id: "steady", label: "稳一点，别撒", effect: { speed: -3, integrity: 10, safety: 5 } }, { id: "fast", label: "快一点，我能承受", effect: { speed: 6, integrity: -7, safety: -2 } }] },
  { id: "ng-compromise", type: "noteGame", title: "健康和加料冲突", body: "你想低糖，但也想双份芋泥。", knowledge: "健康选择可以是折中方案，不必全有或全无。", choices: [{ id: "balance", label: "半糖 + 双份芋泥", effect: { health: 5, integrity: 5 } }, { id: "wild", label: "正常糖 + 双份芋泥", effect: { health: -6, integrity: 3 } }] },
  { id: "ng-kind", type: "noteGame", title: "想让骑手快点", body: "系统建议把催促改成更安全的表达。", knowledge: "友好沟通能降低压力，也更容易获得配合。", choices: [{ id: "kind", label: "路上注意安全，不急", effect: { safety: 9, trust: 10, speed: -1 } }, { id: "push", label: "麻烦快一点", effect: { speed: 3, trust: -5, safety: -5 } }] },
  { id: "fun-coupon", type: "fun", title: "优惠券诱惑", body: "满 49 减 8，只差一份小吃。", knowledge: "凑单很快乐，但也要看自己是否真的需要。", choices: [{ id: "add", label: "加购触发快乐", effect: { speed: -1, health: -4, integrity: 3 } }, { id: "skip", label: "不为券凑单", effect: { health: 7, trust: 2 } }] },
  { id: "fun-friend", type: "fun", title: "朋友突然拼单", body: "朋友发来一句：带我一杯。", knowledge: "拼单提升社交快乐，也提高备注和分装复杂度。", choices: [{ id: "join", label: "接受拼单", effect: { trust: 5, integrity: -2, speed: -2 } }, { id: "solo", label: "今天独享", effect: { speed: 2, integrity: 3 } }] },
  { id: "fun-new", type: "fun", title: "店家新品试喝", body: "商家送了一小杯新品。", knowledge: "尝鲜可以带来惊喜，但也要注意过敏和忌口。", choices: [{ id: "try", label: "标记后尝鲜", effect: { integrity: 4, trust: 5, safety: 3 } }, { id: "no", label: "婉拒赠品", effect: { safety: 5, health: 2 } }] },
  { id: "fun-name", type: "fun", title: "订单名生成失败", body: "系统灵感短路，需要你手动选择一个荒诞名字。", knowledge: "给订单命名会强化记忆点，也让结果更适合分享。", choices: [{ id: "one", label: "工作日精神急救", effect: { trust: 3, integrity: 2 } }, { id: "two", label: "周五发疯但有分寸", effect: { trust: 3, health: 2 } }, { id: "three", label: "深夜快乐避难所", effect: { trust: 3, safety: 2 } }] }
];
