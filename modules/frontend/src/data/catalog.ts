import type { Category, ComboRule, DeliveryEvent, MenuItem, MoodOption, OptionGroup } from "../types";

export const categories: { id: Category; label: string; shortLabel: string }[] = [
  { id: "milkTea", label: "奶茶", shortLabel: "茶" },
  { id: "coffee", label: "咖啡", shortLabel: "咖" },
  { id: "dessert", label: "甜品", shortLabel: "甜" },
  { id: "snack", label: "小吃", shortLabel: "吃" },
  { id: "nightFood", label: "夜宵", shortLabel: "夜" },
  { id: "lightFood", label: "轻食", shortLabel: "轻" },
  { id: "staple", label: "主食", shortLabel: "主" },
  { id: "stirFry", label: "炒菜", shortLabel: "炒" },
  { id: "soupPot", label: "汤锅", shortLabel: "汤" },
  { id: "other", label: "其他", shortLabel: "其" }
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

const milkTeaOptions: OptionGroup[] = [
  {
    id: "sugar",
    name: "糖度",
    type: "single",
    choices: [
      { id: "default", label: "标准甜", statDelta: { joy: 2 }, tags: ["sweet"] },
      { id: "less", label: "七分糖", statDelta: { health: 3, joy: 1 }, tags: ["lowSugar"] },
      { id: "half", label: "五分糖", statDelta: { health: 5 }, tags: ["lowSugar"] },
      { id: "zero", label: "无糖", statDelta: { health: 8, joy: -1 }, tags: ["lowSugar"] }
    ]
  },
  {
    id: "ice",
    name: "冰量",
    type: "single",
    choices: [
      { id: "default", label: "正常冰", statDelta: { joy: 1, energy: 1 } },
      { id: "lessIce", label: "少冰", statDelta: { safety: 2 }, tags: ["safe"] },
      { id: "noIce", label: "去冰", statDelta: { health: 2, safety: 2 }, tags: ["safe"] },
      { id: "hot", label: "热饮", statDelta: { safety: 2, health: 1 }, tags: ["warm"] }
    ]
  },
  {
    id: "cup",
    name: "杯型",
    type: "single",
    choices: [
      { id: "medium", label: "中杯" },
      { id: "large", label: "大杯", priceDelta: 3, statDelta: { joy: 2, fullness: 2 }, tags: ["fullness"] }
    ]
  },
  {
    id: "toppings",
    name: "加料",
    type: "multi",
    choices: [
      { id: "boba", label: "珍珠", priceDelta: 2, statDelta: { joy: 3, fullness: 2 }, tags: ["chewy"] },
      { id: "coconut", label: "椰果", priceDelta: 2, statDelta: { joy: 2, fullness: 1 }, tags: ["chewy"] },
      { id: "taro", label: "芋泥", priceDelta: 4, statDelta: { joy: 5, fullness: 4 }, tags: ["comfort"] },
      { id: "cream", label: "芝士奶盖", priceDelta: 3, statDelta: { joy: 4, health: -2 }, tags: ["cheese"] }
    ]
  },
  {
    id: "drinkPack",
    name: "封装",
    type: "multi",
    choices: [
      { id: "cupHolder", label: "加固杯托", priceDelta: 1, statDelta: { safety: 5 }, tags: ["safe"] },
      { id: "sealBag", label: "密封袋", priceDelta: 1, statDelta: { safety: 4 }, tags: ["separatePack"] },
      { id: "splitHotCold", label: "冷热分袋", priceDelta: 1, statDelta: { safety: 5 }, tags: ["separatePack"] }
    ]
  }
];

const coffeeOptions: OptionGroup[] = [
  {
    id: "coffeeTemp",
    name: "冷热",
    type: "single",
    choices: [
      { id: "default", label: "按商品默认", statDelta: { safety: 1 }, tags: ["safe"] },
      { id: "hot", label: "热饮", statDelta: { health: 1, safety: 2 }, tags: ["warm"] },
      { id: "iced", label: "冰饮", statDelta: { joy: 1, energy: 1 } },
      { id: "lessIce", label: "少冰", statDelta: { safety: 2 }, tags: ["safe"] }
    ]
  },
  {
    id: "coffeeCup",
    name: "杯型",
    type: "single",
    choices: [
      { id: "regular", label: "标准杯" },
      { id: "large", label: "大杯", priceDelta: 4, statDelta: { energy: 3, fullness: 1 }, tags: ["caffeine"] }
    ]
  },
  {
    id: "coffeeMilk",
    name: "奶基",
    type: "single",
    choices: [
      { id: "default", label: "默认奶基" },
      { id: "oat", label: "换燕麦奶", priceDelta: 3, statDelta: { health: 3 }, tags: ["healthy"] },
      { id: "lowFat", label: "低脂奶", priceDelta: 2, statDelta: { health: 4 }, tags: ["light"] }
    ]
  },
  {
    id: "coffeeSweet",
    name: "甜度",
    type: "single",
    choices: [
      { id: "default", label: "按商品默认" },
      { id: "less", label: "少糖", statDelta: { health: 4 }, tags: ["lowSugar"] },
      { id: "zero", label: "无糖", statDelta: { health: 7, joy: -1 }, tags: ["lowSugar"] }
    ]
  },
  {
    id: "coffeePack",
    name: "封装",
    type: "multi",
    choices: [
      { id: "cupHolder", label: "加固杯托", priceDelta: 1, statDelta: { safety: 5 }, tags: ["safe"] },
      { id: "heatSleeve", label: "隔热杯套", priceDelta: 1, statDelta: { safety: 3 }, tags: ["safe"] },
      { id: "split", label: "冷热分袋", priceDelta: 1, statDelta: { safety: 5 }, tags: ["separatePack"] }
    ]
  }
];

const drinkOptions: OptionGroup[] = [
  {
    id: "drinkTemp",
    name: "冷热",
    type: "single",
    choices: [
      { id: "default", label: "按商品默认", statDelta: { safety: 1 }, tags: ["safe"] },
      { id: "iced", label: "冰镇", statDelta: { joy: 1, energy: 1 }, tags: ["refresh"] },
      { id: "room", label: "常温", statDelta: { health: 1, safety: 2 }, tags: ["safe"] },
      { id: "hot", label: "热饮", statDelta: { health: 2, safety: 2 }, tags: ["warm"] }
    ]
  },
  {
    id: "drinkSugar",
    name: "甜度",
    type: "single",
    choices: [
      { id: "default", label: "按商品默认" },
      { id: "less", label: "少糖", statDelta: { health: 4 }, tags: ["lowSugar"] },
      { id: "zero", label: "无糖", statDelta: { health: 7, joy: -1 }, tags: ["lowSugar"] }
    ]
  },
  {
    id: "drinkPack",
    name: "封装",
    type: "multi",
    choices: [
      { id: "cupHolder", label: "加固杯托", priceDelta: 1, statDelta: { safety: 5 }, tags: ["safe"] },
      { id: "splitHotCold", label: "冷热分袋", priceDelta: 1, statDelta: { safety: 5 }, tags: ["separatePack"] }
    ]
  }
];

const dessertOptions: OptionGroup[] = [
  {
    id: "dessertPortion",
    name: "规格",
    type: "single",
    choices: [
      { id: "single", label: "单人份" },
      { id: "share", label: "双人分享", priceDelta: 8, statDelta: { joy: 4, fullness: 5 }, tags: ["share"] },
      { id: "light", label: "轻甜小份", statDelta: { health: 3, fullness: -1 }, tags: ["light"] }
    ]
  },
  {
    id: "dessertSweet",
    name: "甜度",
    type: "single",
    choices: [
      { id: "default", label: "标准甜" },
      { id: "less", label: "少糖", statDelta: { health: 5 }, tags: ["lowSugar"] },
      { id: "extra", label: "加甜酱", priceDelta: 2, statDelta: { joy: 3, health: -2 }, tags: ["sweet"] }
    ]
  },
  {
    id: "dessertPack",
    name: "配送包装",
    type: "multi",
    choices: [
      { id: "iceBag", label: "加冰袋", priceDelta: 2, statDelta: { safety: 5 }, tags: ["safe"] },
      { id: "cutlery", label: "配叉勺", priceDelta: 1, statDelta: { safety: 2 }, tags: ["safe"] },
      { id: "separateSauce", label: "酱料分装", priceDelta: 1, statDelta: { safety: 4 }, tags: ["separatePack"] }
    ]
  }
];

const snackOptions: OptionGroup[] = [
  {
    id: "snackPortion",
    name: "分量",
    type: "single",
    choices: [
      { id: "regular", label: "标准份", statDelta: { fullness: 1 } },
      { id: "large", label: "加量", priceDelta: 5, statDelta: { joy: 2, fullness: 6 }, tags: ["fullness"] },
      { id: "half", label: "轻量尝鲜", statDelta: { health: 2, fullness: -2 }, tags: ["light"] }
    ]
  },
  {
    id: "snackTaste",
    name: "口味",
    type: "single",
    choices: [
      { id: "default", label: "默认口味" },
      { id: "spicy", label: "加辣", statDelta: { joy: 3, energy: 2 }, tags: ["spicy"] },
      { id: "noSpicy", label: "不辣", statDelta: { health: 2, safety: 2 }, tags: ["safe"] }
    ]
  },
  {
    id: "snackPack",
    name: "包装",
    type: "multi",
    choices: [
      { id: "sauceSeparate", label: "酱料分装", priceDelta: 1, statDelta: { safety: 4 }, tags: ["separatePack"] },
      { id: "crispBag", label: "脆皮透气袋", priceDelta: 1, statDelta: { safety: 4 }, tags: ["safe"] },
      { id: "lessOil", label: "吸油纸", priceDelta: 1, statDelta: { health: 3 }, tags: ["healthyNote"] }
    ]
  }
];

const nightFoodOptions: OptionGroup[] = [
  {
    id: "nightPortion",
    name: "分量",
    type: "single",
    choices: [
      { id: "regular", label: "标准份", statDelta: { fullness: 2 } },
      { id: "large", label: "加量", priceDelta: 6, statDelta: { fullness: 7, joy: 2 }, tags: ["fullness"] },
      { id: "less", label: "少粉少饭", statDelta: { health: 3, fullness: -2 }, tags: ["light"] }
    ]
  },
  {
    id: "nightTaste",
    name: "夜宵口味",
    type: "single",
    choices: [
      { id: "default", label: "默认口味" },
      { id: "lessOilSalt", label: "少油少盐", statDelta: { health: 6, joy: -1 }, tags: ["healthyNote"] },
      { id: "extraSpicy", label: "重辣", statDelta: { joy: 4, health: -2, energy: 2 }, tags: ["spicy"] }
    ]
  },
  {
    id: "nightPack",
    name: "防漏包装",
    type: "multi",
    choices: [
      { id: "soupSeparate", label: "汤汁分装", priceDelta: 2, statDelta: { safety: 6 }, tags: ["separatePack"] },
      { id: "tableware", label: "餐具包", priceDelta: 1, statDelta: { safety: 2 }, tags: ["safe"] },
      { id: "heatBag", label: "保温袋", priceDelta: 2, statDelta: { safety: 4 }, tags: ["warm"] }
    ]
  }
];

const lightFoodOptions: OptionGroup[] = [
  {
    id: "lightPortion",
    name: "规格",
    type: "single",
    choices: [
      { id: "regular", label: "标准份", statDelta: { health: 1 } },
      { id: "protein", label: "加蛋白", priceDelta: 6, statDelta: { health: 5, fullness: 4 }, tags: ["protein"] },
      { id: "halfCarb", label: "半份主食", statDelta: { health: 4, fullness: -2 }, tags: ["light"] }
    ]
  },
  {
    id: "lightSauce",
    name: "酱料",
    type: "single",
    choices: [
      { id: "default", label: "标准酱" },
      { id: "separate", label: "酱料分装", statDelta: { health: 3, safety: 3 }, tags: ["separatePack"] },
      { id: "less", label: "少酱", statDelta: { health: 5 }, tags: ["healthyNote"] }
    ]
  },
  {
    id: "lightPack",
    name: "包装",
    type: "multi",
    choices: [
      { id: "coldKeep", label: "冷藏保鲜袋", priceDelta: 2, statDelta: { safety: 5 }, tags: ["safe"] },
      { id: "cutlery", label: "餐具包", priceDelta: 1, statDelta: { safety: 2 }, tags: ["safe"] }
    ]
  }
];

const stapleOptions: OptionGroup[] = [
  {
    id: "staplePortion",
    name: "主食分量",
    type: "single",
    choices: [
      { id: "regular", label: "标准份", statDelta: { fullness: 2 } },
      { id: "extraRice", label: "加饭/加面", priceDelta: 4, statDelta: { fullness: 7, joy: 1 }, tags: ["fullness"] },
      { id: "lessRice", label: "少饭/半面", statDelta: { health: 4, fullness: -2 }, tags: ["light"] }
    ]
  },
  {
    id: "stapleTaste",
    name: "口味备注",
    type: "single",
    choices: [
      { id: "default", label: "默认口味" },
      { id: "lessOilSalt", label: "少油少盐", statDelta: { health: 6, joy: -1 }, tags: ["healthyNote"] },
      { id: "spicy", label: "加辣", statDelta: { joy: 3, energy: 2 }, tags: ["spicy"] }
    ]
  },
  {
    id: "staplePack",
    name: "包装",
    type: "multi",
    choices: [
      { id: "sauceSeparate", label: "酱汁分装", priceDelta: 1, statDelta: { safety: 4 }, tags: ["separatePack"] },
      { id: "tableware", label: "餐具包", priceDelta: 1, statDelta: { safety: 2 }, tags: ["safe"] },
      { id: "splitHotCold", label: "冷热分袋", priceDelta: 1, statDelta: { safety: 5 }, tags: ["separatePack"] }
    ]
  }
];

const stirFryOptions: OptionGroup[] = [
  {
    id: "dishPortion",
    name: "菜品分量",
    type: "single",
    choices: [
      { id: "regular", label: "标准份", statDelta: { fullness: 1 } },
      { id: "large", label: "加量", priceDelta: 8, statDelta: { fullness: 6, joy: 3 }, tags: ["fullness"] },
      { id: "half", label: "小份尝鲜", statDelta: { health: 2, fullness: -2 }, tags: ["light"] }
    ]
  },
  {
    id: "dishTaste",
    name: "口味",
    type: "single",
    choices: [
      { id: "default", label: "默认口味" },
      { id: "lessOilSalt", label: "少油少盐", statDelta: { health: 7, joy: -1 }, tags: ["healthyNote"] },
      { id: "spicy", label: "加辣", statDelta: { joy: 4, energy: 2 }, tags: ["spicy"] }
    ]
  },
  {
    id: "dishPack",
    name: "打包",
    type: "multi",
    choices: [
      { id: "rice", label: "加米饭", priceDelta: 4, statDelta: { fullness: 6 }, tags: ["fullness"] },
      { id: "sauceSeparate", label: "汤汁/酱汁分装", priceDelta: 1, statDelta: { safety: 5 }, tags: ["separatePack"] },
      { id: "tableware", label: "餐具包", priceDelta: 1, statDelta: { safety: 2 }, tags: ["safe"] }
    ]
  }
];

const soupPotOptions: OptionGroup[] = [
  {
    id: "potSize",
    name: "锅底规格",
    type: "single",
    choices: [
      { id: "single", label: "单人小锅", statDelta: { fullness: 2 } },
      { id: "share", label: "双人分享锅", priceDelta: 12, statDelta: { joy: 5, fullness: 8 }, tags: ["share"] },
      { id: "light", label: "轻量小锅", statDelta: { health: 3, fullness: -2 }, tags: ["light"] }
    ]
  },
  {
    id: "potTaste",
    name: "汤底/辣度",
    type: "single",
    choices: [
      { id: "default", label: "默认汤底" },
      { id: "mild", label: "微辣", statDelta: { safety: 2 }, tags: ["safe"] },
      { id: "spicy", label: "重辣", statDelta: { joy: 5, health: -2, energy: 2 }, tags: ["spicy"] },
      { id: "clear", label: "清汤", statDelta: { health: 5 }, tags: ["healthy"] }
    ]
  },
  {
    id: "potPack",
    name: "汤锅包装",
    type: "multi",
    choices: [
      { id: "soupSeparate", label: "汤菜分装", priceDelta: 2, statDelta: { safety: 7 }, tags: ["separatePack"] },
      { id: "seal", label: "防漏封膜", priceDelta: 2, statDelta: { safety: 7 }, tags: ["safe"] },
      { id: "heatBag", label: "保温袋", priceDelta: 2, statDelta: { safety: 4 }, tags: ["warm"] }
    ]
  }
];

const otherOptions: OptionGroup[] = [
  {
    id: "addonCount",
    name: "数量规格",
    type: "single",
    choices: [
      { id: "single", label: "单份" },
      { id: "double", label: "双份", priceDelta: 6, statDelta: { fullness: 4, joy: 2 }, tags: ["share"] },
      { id: "small", label: "小份", statDelta: { health: 2, fullness: -1 }, tags: ["light"] }
    ]
  },
  {
    id: "addonPack",
    name: "包装",
    type: "multi",
    choices: [
      { id: "separate", label: "单独分装", priceDelta: 1, statDelta: { safety: 4 }, tags: ["separatePack"] },
      { id: "tableware", label: "餐具包", priceDelta: 1, statDelta: { safety: 2 }, tags: ["safe"] }
    ]
  }
];

const foodOptions: OptionGroup[] = [
  {
    id: "portion",
    name: "分量",
    type: "single",
    choices: [
      { id: "regular", label: "标准份", statDelta: { fullness: 2 } },
      { id: "large", label: "加量", priceDelta: 5, statDelta: { joy: 2, fullness: 7, health: -2 }, tags: ["fullness"] },
      { id: "small", label: "轻量", statDelta: { health: 3, fullness: -2 }, tags: ["light"] }
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

type MenuSeed = {
  name: string;
  category: Category;
  price: number;
  description: string;
  tags: string[];
  stats: ReturnType<typeof s>;
  options?: OptionGroup[];
};

const menuSeeds: MenuSeed[] = [
  { name: "厚芋泥波波", category: "milkTea", price: 18, description: "绵密芋泥和珍珠一起把今天哄好。", tags: ["sweet", "comfort", "milkTea"], stats: s(18, -4, 8, 3, 3) },
  { name: "杨枝甘露", category: "milkTea", price: 20, description: "芒果、柚粒和奶香的阳光组合。", tags: ["fruit", "sweet", "share"], stats: s(19, 1, 6, 3, 4) },
  { name: "茉莉奶绿", category: "milkTea", price: 15, description: "清香不抢戏，适合偷偷回血。", tags: ["refresh", "milkTea", "light"], stats: s(13, 2, 4, 4, 4) },
  { name: "黑糖珍珠鲜奶", category: "milkTea", price: 19, description: "黑糖挂壁，快乐直达脑门。", tags: ["sweet", "chewy", "comfort"], stats: s(21, -7, 9, 4, 3) },
  { name: "桂花酒酿奶茶", category: "milkTea", price: 21, description: "温柔米香，适合把情绪放软。", tags: ["warm", "comfort", "sweet"], stats: s(20, -1, 7, 2, 4) },
  { name: "鸭屎香柠檬茶", category: "milkTea", price: 16, description: "茶香很冲，困意很怂。", tags: ["refresh", "caffeine", "fruit"], stats: s(16, 4, 3, 10, 5) },
  { name: "草莓啵啵酸奶", category: "milkTea", price: 22, description: "酸甜粉色警报，适合庆祝。", tags: ["fruit", "party", "share"], stats: s(22, 2, 8, 4, 4) },
  { name: "海盐芝士乌龙", category: "milkTea", price: 18, description: "咸甜云朵盖在清醒乌龙上。", tags: ["caffeine", "comfort", "share"], stats: s(17, -1, 5, 8, 4) },
  { name: "生椰拿铁奶茶", category: "milkTea", price: 19, description: "椰香和茶感握手言和。", tags: ["caffeine", "refresh", "milkTea"], stats: s(17, 1, 5, 8, 4) },
  { name: "桃桃乌龙", category: "milkTea", price: 17, description: "水蜜桃香气给今天打光。", tags: ["fruit", "light", "share"], stats: s(15, 4, 4, 5, 5) },
  { name: "红豆双皮奶饮", category: "milkTea", price: 20, description: "像把甜品装进吸管里。", tags: ["sweet", "comfort", "fullness"], stats: s(21, -4, 11, 2, 3) },
  { name: "抹茶麻薯奶茶", category: "milkTea", price: 21, description: "抹茶微苦，麻薯认真。", tags: ["chewy", "comfort", "share"], stats: s(20, -2, 10, 5, 4) },
  { name: "烤香乌龙奶茶", category: "milkTea", price: 18, description: "烘焙茶香扎实，甜度刚好。", tags: ["caffeine", "warm", "milkTea"], stats: s(16, 1, 5, 7, 5) },
  { name: "多肉葡萄芝士", category: "milkTea", price: 23, description: "葡萄果肉和芝士奶盖很有存在感。", tags: ["fruit", "share", "party"], stats: s(23, -2, 7, 4, 4) },
  { name: "西瓜椰乳冰", category: "milkTea", price: 18, description: "清甜多汁，适合热天快速降温。", tags: ["fruit", "refresh", "light"], stats: s(16, 5, 4, 4, 6) },

  { name: "冰美式续命杯", category: "coffee", price: 14, description: "苦，但把人从工位边缘拉回来。", tags: ["caffeine", "refresh", "overtime"], stats: s(10, 2, 1, 16, 5) },
  { name: "燕麦拿铁", category: "coffee", price: 19, description: "柔和咖啡因，不和胃吵架。", tags: ["caffeine", "light", "healthy"], stats: s(14, 5, 4, 12, 5) },
  { name: "生椰拿铁", category: "coffee", price: 20, description: "椰香给咖啡加一层假期滤镜。", tags: ["caffeine", "comfort", "share"], stats: s(17, 2, 5, 12, 5) },
  { name: "焦糖玛奇朵", category: "coffee", price: 21, description: "甜得有底气，困得没脾气。", tags: ["caffeine", "sweet", "comfort"], stats: s(20, -5, 5, 13, 4) },
  { name: "橙香冷萃", category: "coffee", price: 22, description: "清爽果香，适合下午三点自救。", tags: ["caffeine", "fruit", "refresh"], stats: s(16, 4, 2, 14, 5) },
  { name: "热拿铁抱抱杯", category: "coffee", price: 18, description: "热杯握住，情绪稍微落地。", tags: ["caffeine", "warm", "comfort"], stats: s(16, 2, 4, 11, 5) },
  { name: "抹茶咖啡云顶", category: "coffee", price: 23, description: "苦、甜、茶、咖，一杯里开会。", tags: ["caffeine", "sweet", "party"], stats: s(21, -2, 5, 14, 4) },
  { name: "低因轻醒拿铁", category: "coffee", price: 20, description: "想清醒，但不想心跳开派对。", tags: ["lowSugar", "light", "healthy"], stats: s(13, 7, 3, 6, 5) },
  { name: "香草拿铁", category: "coffee", price: 19, description: "香草甜香柔和，适合慢慢开机。", tags: ["caffeine", "sweet", "comfort"], stats: s(17, -2, 4, 11, 5) },
  { name: "榛果拿铁", category: "coffee", price: 20, description: "坚果香气扎实，喝完很有底气。", tags: ["caffeine", "comfort", "warm"], stats: s(18, -1, 5, 12, 5) },
  { name: "摩卡咖啡", category: "coffee", price: 21, description: "巧克力和咖啡一起补电。", tags: ["caffeine", "sweet", "energy"], stats: s(19, -4, 5, 13, 4) },
  { name: "Dirty 咖啡", category: "coffee", price: 22, description: "浓缩落进冰奶，层次干净利落。", tags: ["caffeine", "refresh", "share"], stats: s(18, 0, 4, 14, 5) },
  { name: "冷萃气泡咖啡", category: "coffee", price: 20, description: "气泡感把困意推开。", tags: ["caffeine", "refresh", "light"], stats: s(15, 4, 2, 13, 6) },
  { name: "海盐芝士咖啡", category: "coffee", price: 23, description: "咸香奶盖压住咖啡苦味。", tags: ["caffeine", "comfort", "share"], stats: s(20, -3, 5, 13, 4) },
  { name: "浓缩气泡水", category: "coffee", price: 18, description: "清爽但有冲劲，适合轻负担续航。", tags: ["caffeine", "lowSugar", "refresh"], stats: s(13, 8, 1, 12, 7) },

  { name: "芋泥盒子蛋糕", category: "dessert", price: 24, description: "一勺下去，世界安静三秒。", tags: ["sweet", "comfort", "fullness"], stats: s(24, -7, 14, 3, 4) },
  { name: "提拉米苏小方", category: "dessert", price: 22, description: "咖啡香和奶油把疲惫盖住。", tags: ["sweet", "caffeine", "share"], stats: s(22, -6, 10, 7, 4) },
  { name: "草莓奶油可颂", category: "dessert", price: 19, description: "脆皮、奶油、草莓，快乐有层次。", tags: ["sweet", "fruit", "party"], stats: s(21, -5, 9, 4, 4) },
  { name: "低糖酸奶碗", category: "dessert", price: 21, description: "酸奶、水果、坚果，快乐带点自律。", tags: ["lowSugar", "healthy", "light"], stats: s(16, 12, 8, 5, 6) },
  { name: "爆浆麻薯球", category: "dessert", price: 15, description: "糯叽叽小炮弹，适合摸鱼。", tags: ["chewy", "sweet", "fun"], stats: s(18, -4, 7, 2, 4) },
  { name: "榴莲千层", category: "dessert", price: 28, description: "社交风险和快乐浓度都很高。", tags: ["sweet", "party", "bold"], stats: s(25, -6, 12, 3, 3) },
  { name: "焦糖布丁", category: "dessert", price: 13, description: "轻轻一抖，心也跟着软。", tags: ["sweet", "comfort", "light"], stats: s(16, -3, 5, 2, 5) },
  { name: "黑巧能量 brownie", category: "dessert", price: 18, description: "微苦黑巧，适合把情绪扶正。", tags: ["caffeine", "comfort", "energy"], stats: s(17, -1, 9, 8, 5) },
  { name: "芒果甘露慕斯", category: "dessert", price: 24, description: "芒果香气浓，入口很轻。", tags: ["fruit", "sweet", "share"], stats: s(22, -3, 8, 4, 5) },
  { name: "抹茶红豆卷", category: "dessert", price: 20, description: "微苦抹茶和红豆甜度平衡。", tags: ["sweet", "comfort", "share"], stats: s(19, -2, 8, 5, 5) },
  { name: "巴斯克芝士切片", category: "dessert", price: 23, description: "焦香外壳配绵密芝士。", tags: ["sweet", "cheese", "comfort"], stats: s(22, -5, 10, 3, 4) },
  { name: "蓝莓酸奶芝士", category: "dessert", price: 25, description: "酸甜果酱让芝士更清爽。", tags: ["fruit", "sweet", "share"], stats: s(22, -2, 9, 4, 5) },
  { name: "椰奶冻", category: "dessert", price: 16, description: "椰香清甜，冰凉顺滑。", tags: ["sweet", "light", "refresh"], stats: s(16, 0, 5, 3, 6) },
  { name: "红糖冰粉", category: "dessert", price: 14, description: "冰凉滑嫩，红糖香气很足。", tags: ["sweet", "refresh", "comfort"], stats: s(17, -2, 5, 3, 5) },
  { name: "水果杏仁豆腐", category: "dessert", price: 18, description: "杏仁香和鲜果一起收尾。", tags: ["fruit", "light", "healthy"], stats: s(16, 8, 6, 4, 6) },

  { name: "盐酥鸡", category: "snack", price: 18, description: "外脆里嫩，深夜理智杀手。", tags: ["fried", "comfort", "fullness"], stats: s(21, -8, 16, 3, 3) },
  { name: "章鱼小丸子", category: "snack", price: 16, description: "热气、柴鱼片、酱汁，快乐会跳舞。", tags: ["warm", "comfort", "share"], stats: s(19, -4, 10, 2, 4) },
  { name: "芝士薯条", category: "snack", price: 17, description: "拉丝瞬间，烦恼短暂停止加载。", tags: ["fried", "cheese", "party"], stats: s(21, -9, 13, 3, 3) },
  { name: "烤冷面", category: "snack", price: 14, description: "酸甜咸辣齐上阵，路边摊灵魂。", tags: ["spicy", "warm", "comfort"], stats: s(20, -4, 12, 3, 4) },
  { name: "炸鸡翅", category: "snack", price: 22, description: "一口下去，会议暂时不重要。", tags: ["fried", "comfort", "party"], stats: s(24, -10, 18, 4, 3) },
  { name: "蒜香鸡胸条", category: "snack", price: 20, description: "蛋白补给，不放弃好吃。", tags: ["protein", "healthy", "fullness"], stats: s(17, 10, 15, 5, 6) },
  { name: "凉拌毛豆", category: "snack", price: 12, description: "清爽、耐嚼、聊天神器。", tags: ["light", "healthy", "share"], stats: s(13, 10, 7, 2, 6) },
  { name: "牛肉芝士卷", category: "snack", price: 24, description: "饱腹感和罪恶感一起到达。", tags: ["cheese", "fullness", "comfort"], stats: s(23, -5, 20, 5, 4) },
  { name: "脆皮春卷", category: "snack", price: 15, description: "一口酥脆，适合凑单分享。", tags: ["fried", "share", "light"], stats: s(17, -4, 8, 2, 4) },
  { name: "麻辣鸭脖", category: "snack", price: 19, description: "辣味上头，越啃越精神。", tags: ["spicy", "party", "bold"], stats: s(22, -5, 8, 7, 4) },
  { name: "生煎小馒头", category: "snack", price: 16, description: "底脆汁足，热乎很安慰。", tags: ["warm", "fullness", "comfort"], stats: s(20, -3, 14, 3, 5) },
  { name: "葱油手抓饼", category: "snack", price: 13, description: "层层起酥，香气很实在。", tags: ["fullness", "warm", "comfort"], stats: s(18, -4, 13, 3, 4) },
  { name: "炭烤脆皮肠", category: "snack", price: 12, description: "烟火气很足，适合加餐。", tags: ["warm", "party", "fullness"], stats: s(18, -4, 10, 4, 4) },
  { name: "咖喱鱼蛋", category: "snack", price: 14, description: "弹牙鱼蛋裹着浓郁咖喱。", tags: ["warm", "comfort", "share"], stats: s(17, -2, 9, 3, 5) },
  { name: "炸藕盒", category: "snack", price: 18, description: "藕片夹肉，外酥内香。", tags: ["fried", "fullness", "comfort"], stats: s(20, -6, 14, 3, 4) },

  { name: "番茄牛腩粉", category: "nightFood", price: 28, description: "热汤压住夜里的空荡感。", tags: ["warm", "fullness", "comfort"], stats: s(22, 1, 24, 5, 5) },
  { name: "菌菇鸡汤面", category: "nightFood", price: 26, description: "清汤热面，适合把胃哄睡。", tags: ["warm", "healthy", "fullness"], stats: s(18, 8, 20, 4, 6) },
  { name: "麻辣拌", category: "nightFood", price: 25, description: "辣得很认真，快乐也很明确。", tags: ["spicy", "combo", "fullness"], stats: s(25, -6, 22, 6, 4) },
  { name: "砂锅粥", category: "nightFood", price: 23, description: "慢慢热起来，适合深夜降噪。", tags: ["warm", "healthy", "comfort"], stats: s(18, 9, 18, 3, 7) },
  { name: "小龙虾拌面", category: "nightFood", price: 32, description: "仪式感很强，吃完很想截图。", tags: ["spicy", "party", "share"], stats: s(28, -7, 24, 5, 4) },
  { name: "烤鱼饭团", category: "nightFood", price: 21, description: "碳水和鱼香达成停战协议。", tags: ["fullness", "warm", "safe"], stats: s(19, 3, 18, 5, 6) },
  { name: "酸辣汤饺", category: "nightFood", price: 24, description: "酸辣开胃，热汤兜底。", tags: ["spicy", "warm", "comfort"], stats: s(21, 1, 20, 4, 5) },
  { name: "深夜关东煮", category: "nightFood", price: 19, description: "萝卜、鱼丸、热汤，像便利店灯光。", tags: ["warm", "light", "comfort"], stats: s(17, 4, 13, 3, 6) },
  { name: "牛肉汤粉", category: "nightFood", price: 27, description: "牛肉香和米粉一起稳住深夜。", tags: ["warm", "fullness", "comfort"], stats: s(21, 2, 23, 5, 5) },
  { name: "鲜肉云吞汤", category: "nightFood", price: 22, description: "一碗热汤，轻轻落胃。", tags: ["warm", "light", "comfort"], stats: s(18, 5, 14, 3, 6) },
  { name: "麻辣串串碗", category: "nightFood", price: 29, description: "不用排队，也有热辣小摊感。", tags: ["spicy", "party", "combo"], stats: s(27, -6, 22, 6, 4) },
  { name: "卤肉饭夜宵版", category: "nightFood", price: 24, description: "咸香卤汁盖住夜里的饿。", tags: ["fullness", "comfort", "warm"], stats: s(22, -2, 24, 5, 5) },
  { name: "孜然羊肉拌面", category: "nightFood", price: 30, description: "孜然香气很冲，饱腹感更冲。", tags: ["spicy", "fullness", "energy"], stats: s(25, -4, 26, 7, 4) },
  { name: "海鲜砂锅粥", category: "nightFood", price: 31, description: "鲜味热粥，深夜也能吃得稳。", tags: ["warm", "healthy", "share"], stats: s(22, 7, 20, 4, 6) },
  { name: "麻酱凉面", category: "nightFood", price: 18, description: "麻酱浓郁，夜里也很有胃口。", tags: ["fullness", "comfort", "light"], stats: s(18, 0, 17, 4, 5) },

  { name: "鸡胸藜麦碗", category: "lightFood", price: 29, description: "高蛋白、不敷衍，健身后友好。", tags: ["protein", "healthy", "light"], stats: s(17, 15, 18, 7, 7) },
  { name: "牛油果全麦卷", category: "lightFood", price: 27, description: "清爽脂肪和全麦碳水组队。", tags: ["healthy", "light", "share"], stats: s(16, 13, 15, 5, 7) },
  { name: "鲜虾沙拉杯", category: "lightFood", price: 25, description: "吃完不困，适合下午继续做人。", tags: ["healthy", "protein", "refresh"], stats: s(15, 14, 12, 7, 7) },
  { name: "低糖水果盒", category: "lightFood", price: 18, description: "维生素含量和拍照友好度都在线。", tags: ["lowSugar", "fruit", "healthy"], stats: s(15, 14, 8, 5, 7) },
  { name: "紫菜豆腐汤", category: "lightFood", price: 16, description: "轻负担热汤，适合夜里补一口。", tags: ["warm", "healthy", "light"], stats: s(13, 12, 8, 3, 7) },
  { name: "蛋白酸奶杯", category: "lightFood", price: 19, description: "甜口恢复局，不和自律打架。", tags: ["protein", "lowSugar", "afterWorkout"], stats: s(16, 13, 10, 6, 7) },
  { name: "玉米鸡蛋轻食盒", category: "lightFood", price: 20, description: "朴素但可靠，像一个准时下班的人。", tags: ["healthy", "fullness", "safe"], stats: s(14, 12, 16, 5, 8) },
  { name: "无糖气泡水", category: "lightFood", price: 9, description: "给高糖订单踩一脚刹车。", tags: ["lowSugar", "refresh", "healthy"], stats: s(9, 12, 1, 4, 8), options: drinkOptions },
  { name: "三文鱼谷物碗", category: "lightFood", price: 36, description: "脂肪、蛋白和谷物都很稳。", tags: ["protein", "healthy", "share"], stats: s(18, 16, 18, 7, 7) },
  { name: "金枪鱼鸡蛋沙拉", category: "lightFood", price: 28, description: "高蛋白轻负担，口感不无聊。", tags: ["protein", "healthy", "light"], stats: s(16, 15, 14, 7, 7) },
  { name: "鸡胸荞麦面", category: "lightFood", price: 27, description: "清爽冷面和鸡胸肉很搭。", tags: ["protein", "light", "healthy"], stats: s(15, 14, 16, 7, 7) },
  { name: "牛肉蔬菜能量碗", category: "lightFood", price: 32, description: "牛肉和蔬菜让恢复更扎实。", tags: ["protein", "healthy", "fullness"], stats: s(18, 13, 19, 7, 7) },
  { name: "豆腐牛油果沙拉", category: "lightFood", price: 25, description: "植物蛋白和牛油果清爽组队。", tags: ["healthy", "light", "lowSugar"], stats: s(14, 16, 12, 5, 7) },
  { name: "红薯鸡蛋盒", category: "lightFood", price: 19, description: "甜糯红薯配鸡蛋，简单但顶用。", tags: ["healthy", "fullness", "safe"], stats: s(14, 14, 15, 5, 8) },
  { name: "希腊酸奶莓果杯", category: "lightFood", price: 22, description: "酸奶浓稠，莓果清爽。", tags: ["protein", "fruit", "lowSugar"], stats: s(16, 15, 9, 5, 7) },

  { name: "台式卤肉饭", category: "staple", price: 26, description: "卤汁浓郁，米饭粒粒挂香。", tags: ["fullness", "comfort", "warm"], stats: s(23, -3, 28, 5, 5) },
  { name: "咖喱鸡肉饭", category: "staple", price: 28, description: "咖喱浓厚，鸡肉和米饭很合拍。", tags: ["fullness", "warm", "comfort"], stats: s(22, -1, 27, 5, 5) },
  { name: "番茄炒蛋盖饭", category: "staple", price: 22, description: "酸甜家常味，稳稳下饭。", tags: ["warm", "safe", "fullness"], stats: s(18, 4, 22, 4, 6) },
  { name: "牛肉炒饭", category: "staple", price: 25, description: "锅气和牛肉香都很足。", tags: ["fullness", "energy", "comfort"], stats: s(21, -2, 26, 6, 5) },
  { name: "腊味煲仔饭", category: "staple", price: 32, description: "米饭焦香，腊味咸香下饭。", tags: ["fullness", "warm", "party"], stats: s(25, -5, 30, 5, 4) },
  { name: "照烧鸡腿饭", category: "staple", price: 29, description: "甜咸照烧汁包住鸡腿肉。", tags: ["protein", "fullness", "comfort"], stats: s(22, 1, 27, 6, 5) },
  { name: "黑椒牛柳意面", category: "staple", price: 31, description: "黑椒香气醒脑，牛柳很扎实。", tags: ["protein", "fullness", "energy"], stats: s(23, -2, 27, 7, 5) },
  { name: "干炒牛河", category: "staple", price: 28, description: "河粉有锅气，牛肉够香。", tags: ["fullness", "comfort", "warm"], stats: s(23, -4, 28, 5, 4) },
  { name: "葱油拌面", category: "staple", price: 18, description: "葱香油润，简单但很香。", tags: ["fullness", "comfort", "safe"], stats: s(18, -2, 21, 4, 5) },
  { name: "担担面", category: "staple", price: 22, description: "麻酱和辣油把面条裹满。", tags: ["spicy", "fullness", "comfort"], stats: s(22, -4, 24, 6, 4) },
  { name: "鲜肉云吞面", category: "staple", price: 24, description: "云吞饱满，汤面热乎。", tags: ["warm", "fullness", "safe"], stats: s(19, 3, 22, 4, 6) },
  { name: "海鲜炒乌冬", category: "staple", price: 30, description: "乌冬弹牙，海鲜鲜味很足。", tags: ["fullness", "share", "warm"], stats: s(22, 0, 25, 5, 5) },
  { name: "日式蛋包饭", category: "staple", price: 27, description: "滑蛋包住米饭，酱汁很开胃。", tags: ["comfort", "fullness", "share"], stats: s(22, -2, 24, 4, 5) },
  { name: "泡菜五花肉饭", category: "staple", price: 29, description: "泡菜酸辣，五花肉下饭。", tags: ["spicy", "fullness", "party"], stats: s(24, -5, 28, 6, 4) },
  { name: "香酥鸡排饭", category: "staple", price: 27, description: "鸡排酥脆，米饭负责兜底。", tags: ["fried", "fullness", "comfort"], stats: s(23, -5, 29, 5, 4) },

  { name: "宫保鸡丁", category: "stirFry", price: 28, description: "鸡丁嫩，花生香，酸甜微辣。", tags: ["spicy", "protein", "share"], stats: s(22, -2, 18, 5, 5) },
  { name: "麻婆豆腐", category: "stirFry", price: 22, description: "麻辣浓香，拌饭很强。", tags: ["spicy", "warm", "comfort"], stats: s(22, -3, 16, 6, 5) },
  { name: "回锅肉", category: "stirFry", price: 30, description: "酱香和蒜苗香一起爆开。", tags: ["spicy", "fullness", "comfort"], stats: s(25, -6, 20, 6, 4) },
  { name: "鱼香肉丝", category: "stirFry", price: 26, description: "酸甜咸香，下饭能力稳定。", tags: ["fullness", "comfort", "share"], stats: s(22, -3, 18, 5, 5) },
  { name: "青椒牛柳", category: "stirFry", price: 32, description: "牛柳嫩滑，青椒香气足。", tags: ["protein", "fullness", "energy"], stats: s(23, 1, 19, 7, 5) },
  { name: "番茄炒蛋", category: "stirFry", price: 19, description: "家常酸甜，谁点都不出错。", tags: ["safe", "comfort", "healthy"], stats: s(17, 6, 13, 3, 7) },
  { name: "干锅花菜", category: "stirFry", price: 24, description: "花菜脆香，干锅味很足。", tags: ["spicy", "healthy", "share"], stats: s(20, 5, 13, 5, 5) },
  { name: "蒜蓉西兰花", category: "stirFry", price: 20, description: "清爽蒜香，给重口订单找平衡。", tags: ["healthy", "light", "safe"], stats: s(13, 14, 8, 3, 7) },
  { name: "醋溜土豆丝", category: "stirFry", price: 18, description: "酸爽脆口，米饭好搭档。", tags: ["light", "share", "safe"], stats: s(16, 5, 11, 4, 6) },
  { name: "孜然羊肉", category: "stirFry", price: 36, description: "孜然香气很猛，快乐也很猛。", tags: ["spicy", "protein", "party"], stats: s(28, -4, 22, 8, 4) },
  { name: "糖醋小排", category: "stirFry", price: 34, description: "酸甜亮汁，排骨香而不腻。", tags: ["sweet", "comfort", "share"], stats: s(26, -5, 20, 5, 5) },
  { name: "黑椒鸡丁", category: "stirFry", price: 27, description: "黑椒辛香，鸡肉扎实。", tags: ["protein", "energy", "fullness"], stats: s(22, 1, 18, 7, 5) },
  { name: "鱼香茄子", category: "stirFry", price: 23, description: "茄子软糯，酱汁很下饭。", tags: ["comfort", "fullness", "warm"], stats: s(21, -2, 15, 4, 5) },
  { name: "腰果虾仁", category: "stirFry", price: 38, description: "虾仁清甜，腰果香脆。", tags: ["protein", "healthy", "share"], stats: s(24, 6, 16, 6, 6) },
  { name: "辣子鸡", category: "stirFry", price: 33, description: "干香麻辣，适合快乐加码。", tags: ["spicy", "party", "fried"], stats: s(29, -7, 20, 8, 4) },

  { name: "麻辣烫小锅", category: "soupPot", price: 29, description: "一锅热辣，想吃什么都在里面。", tags: ["spicy", "combo", "fullness"], stats: s(26, -4, 24, 7, 4) },
  { name: "番茄牛肉小火锅", category: "soupPot", price: 36, description: "番茄汤底浓，牛肉很下饭。", tags: ["warm", "protein", "share"], stats: s(25, 3, 24, 6, 5) },
  { name: "酸菜鱼汤锅", category: "soupPot", price: 39, description: "酸爽开胃，鱼片滑嫩。", tags: ["spicy", "share", "fullness"], stats: s(28, 0, 23, 6, 5) },
  { name: "椰子鸡汤锅", category: "soupPot", price: 42, description: "椰香清甜，鸡汤温柔。", tags: ["warm", "healthy", "share"], stats: s(24, 10, 22, 5, 7) },
  { name: "莲藕排骨汤", category: "soupPot", price: 31, description: "排骨汤鲜，莲藕粉糯。", tags: ["warm", "healthy", "comfort"], stats: s(21, 9, 20, 4, 7) },
  { name: "酸汤肥牛", category: "soupPot", price: 34, description: "金汤酸辣，肥牛很有存在感。", tags: ["spicy", "protein", "fullness"], stats: s(25, -1, 22, 6, 5) },
  { name: "菌菇汤锅", category: "soupPot", price: 28, description: "菌香清鲜，轻负担热汤。", tags: ["warm", "healthy", "light"], stats: s(18, 12, 15, 4, 7) },
  { name: "金汤花胶鸡", category: "soupPot", price: 45, description: "金汤浓郁，适合认真补一餐。", tags: ["warm", "protein", "comfort"], stats: s(27, 8, 24, 5, 6) },
  { name: "海鲜豆腐汤", category: "soupPot", price: 30, description: "鲜味清爽，豆腐嫩滑。", tags: ["healthy", "warm", "protein"], stats: s(20, 11, 17, 4, 7) },
  { name: "鸭血粉丝汤", category: "soupPot", price: 24, description: "热汤粉丝，鲜香利落。", tags: ["warm", "fullness", "comfort"], stats: s(20, 2, 19, 4, 6) },
  { name: "砂锅豆腐煲", category: "soupPot", price: 26, description: "豆腐吸满汤汁，暖乎乎。", tags: ["warm", "healthy", "comfort"], stats: s(19, 8, 16, 3, 7) },
  { name: "羊肉汤", category: "soupPot", price: 33, description: "汤鲜肉香，适合冷天回血。", tags: ["warm", "protein", "fullness"], stats: s(23, 4, 22, 6, 6) },
  { name: "关东煮拼锅", category: "soupPot", price: 22, description: "萝卜、鱼丸、豆腐都在热汤里。", tags: ["warm", "light", "comfort"], stats: s(18, 5, 14, 3, 6) },
  { name: "牛杂煲", category: "soupPot", price: 35, description: "浓香牛杂，越煮越入味。", tags: ["warm", "fullness", "bold"], stats: s(26, -3, 24, 6, 4) },
  { name: "香辣干锅虾", category: "soupPot", price: 46, description: "虾肉紧实，干锅香辣。", tags: ["spicy", "protein", "party"], stats: s(30, -4, 23, 7, 4) },

  { name: "泰式柠檬凤爪", category: "other", price: 18, description: "酸辣清爽，越啃越开胃。", tags: ["spicy", "refresh", "share"], stats: s(18, 2, 8, 5, 5) },
  { name: "卤味溏心蛋", category: "other", price: 6, description: "加一颗蛋，满足感更完整。", tags: ["protein", "safe", "fullness"], stats: s(9, 5, 6, 3, 6) },
  { name: "凉拌黄瓜", category: "other", price: 10, description: "清脆解腻，重口味订单好搭档。", tags: ["healthy", "light", "refresh"], stats: s(12, 12, 4, 3, 7) },
  { name: "海带丝小菜", category: "other", price: 8, description: "爽口小菜，凑单不负担。", tags: ["healthy", "light", "share"], stats: s(10, 10, 4, 2, 7) },
  { name: "酸甜萝卜", category: "other", price: 7, description: "酸甜脆口，负责清场。", tags: ["refresh", "light", "safe"], stats: s(10, 8, 3, 2, 7) },
  { name: "韩式泡菜盒", category: "other", price: 9, description: "酸辣发酵香，配饭刚好。", tags: ["spicy", "healthy", "share"], stats: s(13, 7, 4, 4, 6) },
  { name: "招牌辣椒油", category: "other", price: 3, description: "给清淡订单加一点灵魂。", tags: ["spicy", "bold", "combo"], stats: s(8, -2, 0, 5, 5) },
  { name: "蒜香蘸料", category: "other", price: 3, description: "蒜香浓，炸物和汤锅都能搭。", tags: ["combo", "share", "comfort"], stats: s(8, -1, 0, 3, 5) },
  { name: "额外米饭", category: "other", price: 4, description: "多一碗饭，酱汁不浪费。", tags: ["fullness", "safe", "combo"], stats: s(6, 0, 12, 2, 6) },
  { name: "鲜切水果杯", category: "other", price: 15, description: "餐后来点清甜，拍照也好看。", tags: ["fruit", "healthy", "refresh"], stats: s(14, 12, 5, 4, 7) },
  { name: "蜂蜜柚子茶瓶", category: "other", price: 12, description: "酸甜润口，适合配炸物。", tags: ["fruit", "sweet", "refresh"], stats: s(12, 3, 1, 4, 6), options: drinkOptions },
  { name: "鲜榨橙汁", category: "other", price: 14, description: "橙香清亮，解腻很快。", tags: ["fruit", "refresh", "healthy"], stats: s(13, 9, 1, 4, 7), options: drinkOptions },
  { name: "豆浆", category: "other", price: 8, description: "热乎豆香，早餐夜宵都能搭。", tags: ["warm", "healthy", "light"], stats: s(10, 8, 4, 3, 7), options: drinkOptions },
  { name: "嫩滑蒸蛋", category: "other", price: 12, description: "口感细嫩，给胃一个温柔缓冲。", tags: ["protein", "healthy", "warm"], stats: s(13, 10, 7, 3, 7) },
  { name: "安心餐具包", category: "other", price: 1, description: "独立包装，外带更省心。", tags: ["safe", "separatePack"], stats: s(1, 0, 0, 0, 10), options: [] }
];

const categoryPrefixes: Record<Category, string> = {
  milkTea: "mt",
  coffee: "cf",
  dessert: "ds",
  snack: "sk",
  nightFood: "nf",
  lightFood: "lf",
  staple: "st",
  stirFry: "sf",
  soupPot: "sp",
  other: "ot"
};

const defaultOptionsByCategory: Record<Category, OptionGroup[]> = {
  milkTea: milkTeaOptions,
  coffee: coffeeOptions,
  dessert: dessertOptions,
  snack: snackOptions,
  nightFood: nightFoodOptions,
  lightFood: lightFoodOptions,
  staple: stapleOptions,
  stirFry: stirFryOptions,
  soupPot: soupPotOptions,
  other: otherOptions
};

const buildMenuItems = (): MenuItem[] => {
  const counters = Object.fromEntries(categories.map(({ id }) => [id, 0])) as Record<Category, number>;

  return menuSeeds.map((seed) => {
    counters[seed.category] += 1;
    const id = `${categoryPrefixes[seed.category]}-${String(counters[seed.category]).padStart(2, "0")}`;
    return item(id, seed.name, seed.category, seed.price, seed.description, seed.tags, seed.stats, seed.options ?? defaultOptionsByCategory[seed.category]);
  });
};

export const menuItems: MenuItem[] = buildMenuItems();

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
