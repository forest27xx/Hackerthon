import type { FoodPersonaType, PersonaAxisKey, PersonaAxisScore } from "../types";

export const personaAxes: Record<PersonaAxisKey, Omit<PersonaAxisScore, "value" | "codeLetter">> = {
  structure: {
    key: "structure",
    leftLabel: "拼图型",
    rightLabel: "单点型",
    leftCode: "H",
    rightCode: "N"
  },
  restraint: {
    key: "restraint",
    leftLabel: "刹车型",
    rightLabel: "油门型",
    leftCode: "C",
    rightCode: "E"
  },
  control: {
    key: "control",
    leftLabel: "控场型",
    rightLabel: "随缘型",
    leftCode: "G",
    rightCode: "R"
  },
  deal: {
    key: "deal",
    leftLabel: "薅毛型",
    rightLabel: "随心型",
    leftCode: "S",
    rightCode: "L"
  }
};

export const foodPersonaTypes: Record<string, FoodPersonaType> = {
  HCGS: {
    code: "HCGS",
    name: "清单薅毛控",
    shortLine: "会搭、会刹车、会控场，也会把券用到刚刚好。",
    description: "你的这单像一张小型作战清单：主食、饮品、收尾和优惠都要各就各位。你不是为了省而省，而是希望每一块钱都服务于完整体验。",
    keywords: ["组合意识", "低负担", "控场", "优惠敏感"],
    nextOrder: "下一单可以继续保留主角+配角+收尾结构，把凑券小件换成更轻的水果或无糖饮。"
  },
  HCGL: {
    code: "HCGL",
    name: "完成度洁癖症",
    shortLine: "你要一整套刚刚好的快乐，但不想被优惠带偏。",
    description: "你会认真搭配，也会主动控制糖油辣和包装风险。优惠可以有，但不会改变你真正想吃的路线。",
    keywords: ["完整体验", "健康修正", "包装稳定", "随心预算"],
    nextOrder: "下一单适合提前勾好分袋、杯托和少糖，把体验稳定性继续拉满。"
  },
  HCRS: {
    code: "HCRS",
    name: "补差省事侠",
    shortLine: "想搭完整，也想省一点，但不想把沟通做太复杂。",
    description: "你有组合意识和克制意识，也会被满减门槛轻轻推动；不过在执行上更愿意相信系统和商家，不会每一步都盯死。",
    keywords: ["搭配", "凑门槛", "省事", "轻控制"],
    nextOrder: "下一单可以把最重要的备注压缩成一句，既省事也能守住关键口感。"
  },
  HCRL: {
    code: "HCRL",
    name: "随手拼图人",
    shortLine: "会自然搭成一套，也能接受路上有点小变量。",
    description: "你点单时有结构感，但不是强迫型控场。你更在意这单整体顺不顺、吃起来舒服不舒服，而不是每个参数都完美。",
    keywords: ["自然组合", "克制", "弹性", "不为券改口味"],
    nextOrder: "下一单可以尝试一个固定主角配一个新配角，用低风险方式刷新口感。"
  },
  HEGS: {
    code: "HEGS",
    name: "加料薅毛怪",
    shortLine: "快乐要满格，优惠也要拿下，但包装不能翻车。",
    description: "你擅长把加料、重口、套餐和优惠组合成一场高密度快乐。你也知道这类订单风险高，所以会用控场手段兜底。",
    keywords: ["加料", "重口", "控场", "满减"],
    nextOrder: "下一单可以继续冲快乐，但建议把冷热分袋和杯身标记设为默认动作。"
  },
  HEGL: {
    code: "HEGL",
    name: "加料稳控人",
    shortLine: "想吃得爽，也想确保爽得完整。",
    description: "你会选择高快乐商品和加料升级，但不太愿意为了券改变初心。真正让你安心的是包装、备注和规格确认都被稳稳接住。",
    keywords: ["快乐优先", "规格控", "包装", "随心"],
    nextOrder: "下一单适合点一个重口主角，再用清爽饮品做收尾，快乐不减但更舒服。"
  },
  HERS: {
    code: "HERS",
    name: "凑单上头人",
    shortLine: "一旦看到差几块满减，快乐齿轮就开始转了。",
    description: "你本来就喜欢丰富的一单，又容易被优惠和加购推一把。你接受一定的不确定性，觉得小翻车也算故事的一部分。",
    keywords: ["丰富", "加购", "即时快乐", "随缘"],
    nextOrder: "下一单可以先定预算上限，再决定凑券小件，避免快乐一路超速。"
  },
  HERL: {
    code: "HERL",
    name: "随心加料徒",
    shortLine: "想吃什么就点什么，快乐不需要太多理由。",
    description: "你喜欢一单里有层次、有加料、有当下情绪，但优惠和规则不是你的主线。你更像在给今天一个痛快交代。",
    keywords: ["随心", "加料", "丰富", "情绪释放"],
    nextOrder: "下一单可以保留加料自由，再加一个包装或低糖小修正，让快乐更稳。"
  },
  NCGS: {
    code: "NCGS",
    name: "低糖薅毛精",
    shortLine: "目标很集中，糖油要刹住，优惠也不能浪费。",
    description: "你通常围绕一个核心需求下单，比如清醒、低糖、补给或轻负担。你对优惠敏感，但会优先选择不破坏健康边界的凑法。",
    keywords: ["单点目标", "低糖", "精算", "控场"],
    nextOrder: "下一单可以用无糖饮、蛋白小食或水果杯来补差，比硬凑炸物更契合你。"
  },
  NCGL: {
    code: "NCGL",
    name: "配方打卡人",
    shortLine: "你知道自己要什么，也知道哪些参数不能乱。",
    description: "你的订单往往围绕一个固定配方展开：少糖、去冰、蛋白、热饮或某个稳定招牌。你不太受优惠干扰，更信任自己的复用经验。",
    keywords: ["固定配方", "克制", "控场", "复购"],
    nextOrder: "下一单适合保留核心配方，只微调一个参数，比如茶底、冰量或蛋白来源。"
  },
  NCRS: {
    code: "NCRS",
    name: "省力薅毛人",
    shortLine: "想要轻负担，也想顺手拿优惠，但不想沟通太累。",
    description: "你有明确核心需求，也会考虑健康和优惠；但执行上更偏省事，不会为了每个细节反复确认。",
    keywords: ["单点", "轻负担", "优惠", "省事"],
    nextOrder: "下一单可以把最重要的健康要求设成默认备注，减少现场纠结。"
  },
  NCRL: {
    code: "NCRL",
    name: "单点清淡人",
    shortLine: "一杯、一碗、一个明确需求，舒服就够了。",
    description: "你更像为身体或情绪找一个精准补丁：不复杂、不凑券、不折腾。只要核心需求被满足，这单就是好单。",
    keywords: ["单点", "清淡", "随缘", "不为券改变"],
    nextOrder: "下一单可以给核心单品加一个安全包装选项，低成本提升到手体验。"
  },
  NEGS: {
    code: "NEGS",
    name: "重口薅毛怪",
    shortLine: "目标很猛，口味很冲，券也要顺手拿。",
    description: "你常常围绕一个强烈核心需求猛冲：辣、甜、炸、加量或咖啡因。你敢踩油门，也会在关键处做一点控场，防止快乐洒在路上。",
    keywords: ["重口", "加量", "控场", "优惠"],
    nextOrder: "下一单可以把重口主角留下，用无糖饮或小菜补差，爽感和收尾都更完整。"
  },
  NEGL: {
    code: "NEGL",
    name: "重口参数控",
    shortLine: "口味可以猛，但规格必须听你的。",
    description: "你喜欢强烈口味和明确刺激，但不是乱点。辣度、加料、分装、门禁和到手方式都可能成为你的参数区。",
    keywords: ["重口", "参数", "控场", "随心"],
    nextOrder: "下一单适合提前设置辣油分装、汤汁分装或杯身标记，把冲劲变成可控快乐。"
  },
  NERS: {
    code: "NERS",
    name: "冲动凑券徒",
    shortLine: "想吃的很明确，看到优惠也容易多走一步。",
    description: "你下单时目标集中、快乐直接，优惠会成为临门一脚。你不太纠结细节，愿意把一些不确定交给命运。",
    keywords: ["冲动", "凑券", "单点", "随缘"],
    nextOrder: "下一单可以先问自己“这份凑单我明天还想吃吗”，让优惠不抢走主角。"
  },
  NERL: {
    code: "NERL",
    name: "随缘重口怪",
    shortLine: "今天就是要这一口，其他都先让路。",
    description: "你会被一个清晰的重口需求牵引：甜、辣、炸、热汤、咖啡因或加料。优惠和细节都不是重点，吃到才是重点。",
    keywords: ["单点", "重口", "随缘", "即时满足"],
    nextOrder: "下一单可以保留这股直接劲，再加一个轻量控场动作，比如分袋或少糖。"
  }
};

export const personaAvatarKeys: Record<string, string> = {
  HCGS: "checklist-coupon",
  HCGL: "perfect-receipt",
  HCRS: "deal-easy",
  HCRL: "casual-combo",
  HEGS: "loaded-deal",
  HEGL: "loaded-control",
  HERS: "coupon-overheat",
  HERL: "free-toppings",
  NCGS: "low-sugar-deal",
  NCGL: "recipe-checkin",
  NCRS: "easy-deal",
  NCRL: "clean-single",
  NEGS: "bold-deal",
  NEGL: "bold-parameters",
  NERS: "impulse-coupon",
  NERL: "wild-bold"
};

export const personaAvatarPositions: Record<string, { x: number; y: number }> = {
  HCGS: { x: 0, y: 0 },
  HCGL: { x: 1, y: 0 },
  HCRS: { x: 2, y: 0 },
  HCRL: { x: 3, y: 0 },
  HEGS: { x: 0, y: 1 },
  HEGL: { x: 1, y: 1 },
  HERS: { x: 2, y: 1 },
  HERL: { x: 3, y: 1 },
  NCGS: { x: 0, y: 2 },
  NCGL: { x: 1, y: 2 },
  NCRS: { x: 2, y: 2 },
  NCRL: { x: 3, y: 2 },
  NEGS: { x: 0, y: 3 },
  NEGL: { x: 1, y: 3 },
  NERS: { x: 2, y: 3 },
  NERL: { x: 3, y: 3 }
};
