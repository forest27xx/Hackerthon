import type { FoodPersonaType, PersonaAxisKey, PersonaAxisScore } from "../types";

export const personaAxes: Record<PersonaAxisKey, Omit<PersonaAxisScore, "value" | "codeLetter">> = {
  driver: {
    key: "driver",
    leftLabel: "情绪驱动",
    rightLabel: "理性搭配",
    leftCode: "E",
    rightCode: "R"
  },
  scene: {
    key: "scene",
    leftLabel: "热闹分享",
    rightLabel: "独自回血",
    leftCode: "S",
    rightCode: "I"
  },
  discipline: {
    key: "discipline",
    leftLabel: "放纵快乐",
    rightLabel: "健康平衡",
    leftCode: "F",
    rightCode: "B"
  },
  novelty: {
    key: "novelty",
    leftLabel: "冒险尝鲜",
    rightLabel: "稳定复购",
    leftCode: "N",
    rightCode: "C"
  }
};

export const foodPersonaTypes: Record<string, FoodPersonaType> = {
  ESFN: {
    code: "ESFN",
    name: "辣味冒险家",
    shortLine: "越热闹越敢点，快乐必须有冲击力。",
    description: "你会被新鲜、重口和朋友的起哄推着往前走，适合把一单做成今日高光。",
    keywords: ["热闹", "尝鲜", "加料", "高快乐"],
    nextOrder: "下一单可以保留大胆选择，再加一个清爽搭配稳住节奏。"
  },
  ESFC: {
    code: "ESFC",
    name: "派对复购王",
    shortLine: "会热闹，也知道哪几个招牌不会翻车。",
    description: "你偏爱大家都能接受的经典组合，适合负责聚餐里的安心下单。",
    keywords: ["分享", "招牌", "满足", "稳定"],
    nextOrder: "下一单可以在招牌套餐里加一个新品小杯，快乐更有记忆点。"
  },
  ESBN: {
    code: "ESBN",
    name: "清爽探索官",
    shortLine: "想尝鲜，也会给身体留余地。",
    description: "你喜欢轻盈、好拍、带一点新鲜感的选择，快乐和自律都要在场。",
    keywords: ["清爽", "尝鲜", "均衡", "好分享"],
    nextOrder: "下一单试试果茶、轻食和散步取餐，继续保持漂亮平衡。"
  },
  ESBC: {
    code: "ESBC",
    name: "社交平衡师",
    shortLine: "你的下单像一次小型协调会，既要好吃好分，也要包装稳、负担低。",
    description: "你会照顾场面，也会照顾每个人的状态；快乐要被分享，但体验也不能翻车。",
    keywords: ["社交", "均衡", "稳定", "照顾人"],
    nextOrder: "下一单可以优先选冷热分袋和低糖饮，让分享更省心。"
  },
  EIFN: {
    code: "EIFN",
    name: "深夜灵感家",
    shortLine: "独自放纵的时候，灵感和食欲一起醒来。",
    description: "你会在疲惫或夜晚被强烈口味召唤，适合一单完成情绪重启。",
    keywords: ["独处", "深夜", "放纵", "新鲜感"],
    nextOrder: "下一单可以把高糖高油拆成半份，快乐留住，负担少一点。"
  },
  EIFC: {
    code: "EIFC",
    name: "暖汤守序家",
    shortLine: "偏爱温暖、熟悉、能把自己照顾好的味道。",
    description: "你相信舒服的节奏和稳妥的选择，一碗热汤、一杯奶茶就能让人继续前进。",
    keywords: ["温暖", "复购", "安慰", "安全感"],
    nextOrder: "下一单延续热食热饮，再加一个少糖备注，会更稳。"
  },
  EIBN: {
    code: "EIBN",
    name: "低糖实验员",
    shortLine: "想被治愈，但不想让快乐失控。",
    description: "你会在情绪和健康之间找折中方案，半糖、轻食、新口味都能成立。",
    keywords: ["自我照顾", "低糖", "尝鲜", "回血"],
    nextOrder: "下一单可以试试半糖新品配蛋白小食，继续做聪明妥协。"
  },
  EIBC: {
    code: "EIBC",
    name: "安静回血师",
    shortLine: "不需要很吵，也能把今天慢慢修好。",
    description: "你偏爱低负担、熟悉、安静的快乐，点单更像给自己递一张请假条。",
    keywords: ["安静", "低负担", "复购", "治愈"],
    nextOrder: "下一单选择热饮、轻食和饭后散步，会更适合你的节奏。"
  },
  RSFN: {
    code: "RSFN",
    name: "招牌猎手",
    shortLine: "有策略地追求快乐，看到新品也会认真评估。",
    description: "你不是乱点，而是在口碑、价格和新鲜感之间快速做决定。",
    keywords: ["攻略", "热闹", "尝鲜", "高性价比"],
    nextOrder: "下一单可以先锁定人气 TOP，再用备注把风险降下来。"
  },
  RSFC: {
    code: "RSFC",
    name: "经典搭配家",
    shortLine: "懂组合，也懂什么叫稳定发挥。",
    description: "你擅长把主食、饮品和小食搭成一套完整快乐，适合当拼单军师。",
    keywords: ["组合", "复购", "分享", "稳妥"],
    nextOrder: "下一单继续走套餐路线，记得给冷热分袋留一个备注。"
  },
  RSBN: {
    code: "RSBN",
    name: "轻盈策展人",
    shortLine: "你会把一单点得好看、好吃、还不沉重。",
    description: "你对新鲜感有兴趣，但会用健康搭配和清楚备注把体验策展好。",
    keywords: ["策展", "轻盈", "尝鲜", "均衡"],
    nextOrder: "下一单适合果茶、沙拉和小活动组合，分享图会很漂亮。"
  },
  RSBC: {
    code: "RSBC",
    name: "聚餐安全官",
    shortLine: "大家开心很重要，不撒不漏也很重要。",
    description: "你会主动考虑包装、门禁、备注和健康搭配，是多人订单里的秩序核心。",
    keywords: ["安全", "分享", "均衡", "组织力"],
    nextOrder: "下一单可以继续标记杯身、分装冷热，快乐会更稳。"
  },
  RIFN: {
    code: "RIFN",
    name: "规格研究员",
    shortLine: "你会独自研究糖度、冰量、加料和备注。",
    description: "你享受把一单调到刚刚好的过程，尝鲜也要带着参数感。",
    keywords: ["规格", "尝鲜", "独处", "控制感"],
    nextOrder: "下一单试试新品，但保留少糖少冰和加固包装。"
  },
  RIFC: {
    code: "RIFC",
    name: "稳定复购家",
    shortLine: "熟悉的店、熟悉的搭配，是你的确定性来源。",
    description: "你下单讲究效率和稳定，不喜欢随机翻车，经典组合最能让你安心。",
    keywords: ["复购", "效率", "独处", "稳定"],
    nextOrder: "下一单可以在熟悉套餐里换一个小规格，低风险刷新体验。"
  },
  RIBN: {
    code: "RIBN",
    name: "自律探索家",
    shortLine: "尝鲜可以，但必须有健康边界。",
    description: "你愿意探索更好的选择，也会主动用低糖、蛋白和轻运动修正结果。",
    keywords: ["自律", "探索", "健康", "边界感"],
    nextOrder: "下一单适合低糖新品、蛋白补给和楼下自取。"
  },
  RIBC: {
    code: "RIBC",
    name: "均衡守护者",
    shortLine: "你把快乐过成一套长期可持续方案。",
    description: "你重视健康、安全和可复用的秩序感，快乐不是冲动，是稳定补给。",
    keywords: ["均衡", "守护", "复购", "健康"],
    nextOrder: "下一单继续走低糖、分装、清晰备注，稳定就是你的超能力。"
  }
};

export const personaAvatarKeys: Record<string, string> = {
  ESFN: "spicy-hotpot",
  ESFC: "milk-tea-party",
  ESBN: "fruit-tea",
  ESBC: "balanced-bento",
  EIFN: "night-noodle",
  EIFC: "warm-soup",
  EIBN: "low-sugar-tea",
  EIBC: "quiet-onigiri",
  RSFN: "street-skewer",
  RSFC: "burger-set",
  RSBN: "salad-curator",
  RSBC: "secure-lunchbox",
  RIFN: "spec-notes",
  RIFC: "classic-milk-tea",
  RIBN: "protein-bowl",
  RIBC: "balanced-lunch"
};

export const personaAvatarPositions: Record<string, { x: number; y: number }> = {
  ESFN: { x: 0, y: 0 },
  ESFC: { x: 1, y: 0 },
  ESBN: { x: 2, y: 0 },
  ESBC: { x: 3, y: 0 },
  EIFN: { x: 0, y: 1 },
  EIFC: { x: 1, y: 1 },
  EIBN: { x: 2, y: 1 },
  EIBC: { x: 3, y: 1 },
  RSFN: { x: 0, y: 2 },
  RSFC: { x: 1, y: 2 },
  RSBN: { x: 2, y: 2 },
  RSBC: { x: 3, y: 2 },
  RIFN: { x: 0, y: 3 },
  RIFC: { x: 1, y: 3 },
  RIBN: { x: 2, y: 3 },
  RIBC: { x: 3, y: 3 }
};
