import type {
  CartEntry,
  ComboRule,
  DeliveryChoice,
  DeliveryEvent,
  DeliveryScore,
  FoodPersonaType,
  Mood,
  OptionChoice,
  PersonaAxisKey,
  PersonaAxisScore,
  ResultJourneyEvent,
  ResultSummary,
  Stats
} from "../types";

export const emptyStats: Stats = {
  joy: 0,
  health: 0,
  fullness: 0,
  energy: 0,
  safety: 0
};

export const initialDeliveryScore: DeliveryScore = {
  speed: 50,
  safety: 50,
  health: 50,
  integrity: 50,
  trust: 50
};

const moodOrderTitles: Record<Mood, string> = {
  tired: "今日开机失败修复订单",
  hungry: "嘴巴有意见处理单",
  emo: "情绪临时安置订单",
  overtime: "工作日精神急救订单",
  slacking: "低调摸鱼快乐订单",
  celebration: "今天值得加料订单",
  date: "约会不翻车订单",
  crazy: "周五发疯但有分寸套餐",
  afterWorkout: "运动后认真恢复订单",
  lateNight: "深夜快乐避难所订单"
};

const moodPersonaLines: Record<Mood, string> = {
  tired: "半梦半醒型下单员",
  hungry: "嘴巴先于理智行动派",
  emo: "温热甜口情绪修补师",
  overtime: "加班边缘续命研究员",
  slacking: "低调快乐潜行者",
  celebration: "仪式感加料官",
  date: "稳定发挥型分享家",
  crazy: "理智离线但备注清晰的人",
  afterWorkout: "快乐和恢复都要的人",
  lateNight: "深夜自救型美食家"
};

const moodPurposeLabels: Record<Mood, string> = {
  tired: "困：需要一杯续命",
  hungry: "馋：干饭人干饭魂",
  emo: "emo：吃点好的治愈",
  overtime: "加班：能量急救包",
  slacking: "摸鱼：放松一下下",
  celebration: "庆祝：值得好好奖励",
  date: "约会：心动加分餐",
  crazy: "发疯：释放压力时刻",
  afterWorkout: "健身后：补给充能站",
  lateNight: "深夜馋嘴：罪恶但快乐"
};

const personaAxes: Record<PersonaAxisKey, Omit<PersonaAxisScore, "value" | "codeLetter">> = {
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

const foodPersonaTypes: Record<string, FoodPersonaType> = {
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
    shortLine: "会照顾场面，也会照顾每个人的状态。",
    description: "你的下单像一次小型协调会，既要好吃好分，也要包装稳、负担低。",
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

const moodAxisWeights: Record<Mood, Partial<Record<PersonaAxisKey, number>>> = {
  tired: { driver: 12, scene: -12, discipline: 4, novelty: -4 },
  hungry: { driver: 10, discipline: 9, novelty: -2 },
  emo: { driver: 16, scene: -14, discipline: 5, novelty: -6 },
  overtime: { driver: -10, scene: -6, discipline: -2, novelty: -2 },
  slacking: { driver: 5, scene: -3, discipline: 2, novelty: 8 },
  celebration: { driver: 10, scene: 16, discipline: 8, novelty: 4 },
  date: { driver: -2, scene: 10, discipline: -4, novelty: -2 },
  crazy: { driver: 18, scene: 6, discipline: 14, novelty: 12 },
  afterWorkout: { driver: -14, scene: -3, discipline: -18, novelty: 2 },
  lateNight: { driver: 14, scene: -16, discipline: 8, novelty: -4 }
};

const tagAxisWeights: Record<string, Partial<Record<PersonaAxisKey, number>>> = {
  sweet: { driver: 4, discipline: 5 },
  comfort: { driver: 3, scene: -2, novelty: -2 },
  warm: { scene: -2, novelty: -3, discipline: -1 },
  caffeine: { driver: -2, novelty: -1 },
  refresh: { discipline: -2, novelty: 2 },
  fruit: { discipline: -2, novelty: 4 },
  share: { scene: 7, novelty: 1 },
  party: { scene: 8, discipline: 5, novelty: 4 },
  social: { scene: 8 },
  fun: { driver: 3, scene: 3, novelty: 5 },
  spicy: { driver: 4, discipline: 5, novelty: 7 },
  fried: { discipline: 7, novelty: 1 },
  cheese: { discipline: 5 },
  chewy: { driver: 2, novelty: 1 },
  healthy: { driver: -4, discipline: -8, novelty: -1 },
  lowSugar: { driver: -4, discipline: -10 },
  protein: { driver: -3, discipline: -7 },
  light: { driver: -2, discipline: -6 },
  safe: { driver: -4, discipline: -5, novelty: -5 },
  separatePack: { driver: -5, discipline: -6, novelty: -4 },
  healthyNote: { driver: -4, discipline: -8 },
  combo: { scene: 3, novelty: 4 },
  lateNight: { scene: -7, discipline: 4 },
  afterWorkout: { driver: -5, discipline: -8 },
  slacking: { driver: 4, novelty: 5 },
  bold: { driver: 4, discipline: 4, novelty: 6 }
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));

const emptyPersonaScores = (): Record<PersonaAxisKey, number> => ({
  driver: 0,
  scene: 0,
  discipline: 0,
  novelty: 0
});

const addAxisScores = (
  scores: Record<PersonaAxisKey, number>,
  delta: Partial<Record<PersonaAxisKey, number>>,
  multiplier = 1
) => {
  (Object.entries(delta) as [PersonaAxisKey, number][]).forEach(([key, value]) => {
    scores[key] += value * multiplier;
  });
};

const addStats = (base: Stats, delta: Partial<Stats>, quantity = 1): Stats => ({
  joy: base.joy + (delta.joy ?? 0) * quantity,
  health: base.health + (delta.health ?? 0) * quantity,
  fullness: base.fullness + (delta.fullness ?? 0) * quantity,
  energy: base.energy + (delta.energy ?? 0) * quantity,
  safety: base.safety + (delta.safety ?? 0) * quantity
});

export const getSelectedOptionChoices = (entry: CartEntry): OptionChoice[] => {
  if (!entry.item.options) return [];

  return entry.item.options.flatMap((group) => {
    const selectedIds = entry.selectedChoices[group.id] ?? [];
    return group.choices.filter((choice) => selectedIds.includes(choice.id));
  });
};

export const getDefaultChoices = (item: CartEntry["item"]): CartEntry["selectedChoices"] => {
  const choices: CartEntry["selectedChoices"] = {};
  item.options?.forEach((group) => {
    choices[group.id] = group.type === "single" && group.choices[0] ? [group.choices[0].id] : [];
  });
  return choices;
};

export const computeOrderTotals = (entries: CartEntry[]) => {
  return entries.reduce(
    (total, entry) => {
      const selectedOptions = getSelectedOptionChoices(entry);
      const optionPrice = selectedOptions.reduce((sum, choice) => sum + (choice.priceDelta ?? 0), 0);
      const optionStats = selectedOptions.reduce((stats, choice) => addStats(stats, choice.statDelta ?? {}), emptyStats);
      const unitStats = addStats(entry.item.stats, optionStats);

      return {
        price: total.price + (entry.item.price + optionPrice) * entry.quantity,
        stats: addStats(total.stats, unitStats, entry.quantity)
      };
    },
    { price: 0, stats: { ...emptyStats } }
  );
};

const collectOrderFacts = (entries: CartEntry[]) => {
  const tags = new Set<string>();
  const categoryCounts: Partial<Record<CartEntry["item"]["category"], number>> = {};
  let itemCount = 0;

  entries.forEach((entry) => {
    itemCount += entry.quantity;
    categoryCounts[entry.item.category] = (categoryCounts[entry.item.category] ?? 0) + entry.quantity;
    entry.item.tags.forEach((tag) => tags.add(tag));
    getSelectedOptionChoices(entry).forEach((choice) => choice.tags?.forEach((tag) => tags.add(tag)));
  });

  return { tags, categoryCounts, itemCount };
};

export const computeActiveCombos = (entries: CartEntry[], rules: ComboRule[], mood: Mood) => {
  const facts = collectOrderFacts(entries);
  const totals = computeOrderTotals(entries);

  return rules.filter((rule) => {
    const { condition } = rule;
    const moodOk = !condition.moods || condition.moods.includes(mood);
    const tagsOk = !condition.requiredTags || condition.requiredTags.every((tag) => facts.tags.has(tag));
    const itemCountOk = !condition.minItems || facts.itemCount >= condition.minItems;
    const categoryOk =
      !condition.categoryCounts ||
      Object.entries(condition.categoryCounts).every(([category, count]) => {
        return (facts.categoryCounts[category as CartEntry["item"]["category"]] ?? 0) >= (count ?? 0);
      });
    const statsOk =
      !condition.minStats ||
      Object.entries(condition.minStats).every(([stat, value]) => totals.stats[stat as keyof Stats] >= (value ?? 0));

    return moodOk && tagsOk && itemCountOk && categoryOk && statsOk;
  });
};

export const applyComboBonuses = (stats: Stats, combos: ComboRule[]): Stats => {
  return combos.reduce((current, combo) => addStats(current, combo.bonus), stats);
};

export const applyEventChoice = (score: DeliveryScore, choice: DeliveryChoice): DeliveryScore => ({
  speed: clamp(score.speed + (choice.effect.speed ?? 0)),
  safety: clamp(score.safety + (choice.effect.safety ?? 0)),
  health: clamp(score.health + (choice.effect.health ?? 0)),
  integrity: clamp(score.integrity + (choice.effect.integrity ?? 0)),
  trust: clamp(score.trust + (choice.effect.trust ?? 0))
});

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

export const pickDeliveryEvents = (events: DeliveryEvent[], count: number, seed: string): DeliveryEvent[] => {
  const random = seededRandom(seed);
  const shuffled = [...events];

  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const byType = new Map<string, DeliveryEvent>();
  shuffled.forEach((event) => {
    if (!byType.has(event.type)) byType.set(event.type, event);
  });

  const diverse = Array.from(byType.values());
  const rest = shuffled.filter((event) => !diverse.includes(event));
  return [...diverse, ...rest].slice(0, Math.min(count, events.length));
};

const buildPersonaAxes = (scores: Record<PersonaAxisKey, number>): PersonaAxisScore[] => {
  return (Object.keys(personaAxes) as PersonaAxisKey[]).map((key) => {
    const value = clamp(50 + scores[key], 8, 92);
    const meta = personaAxes[key];
    return {
      ...meta,
      value,
      codeLetter: value >= 50 ? meta.leftCode : meta.rightCode
    };
  });
};

const buildPersonaBadges = ({
  facts,
  combos,
  deliveryScore,
  finalScores,
  selectedEvents
}: {
  facts: ReturnType<typeof collectOrderFacts>;
  combos: ComboRule[];
  deliveryScore: DeliveryScore;
  finalScores: { joyIndex: number; healthIndex: number; safetyIndex: number };
  selectedEvents: ResultJourneyEvent[];
}) => {
  const badges = new Set<string>();

  if (combos[0]) badges.add(combos[0].name);
  if (selectedEvents.some((event) => event.choiceLabel.includes("不催") || event.choiceLabel.includes("安全"))) badges.add("守护骑手");
  if (selectedEvents.some((event) => event.choiceLabel.includes("散步"))) badges.add("饭后散步");
  if (finalScores.joyIndex >= 80) badges.add("快乐加成");
  if (finalScores.healthIndex >= 72 || deliveryScore.health >= 62) badges.add("健康顾问");
  if (finalScores.safetyIndex >= 80 || deliveryScore.safety >= 64) badges.add("安心守护者");
  if (deliveryScore.integrity >= 62) badges.add("包装达人");
  if (deliveryScore.trust >= 62) badges.add("骑手友好");
  if (facts.tags.has("lowSugar")) badges.add("低糖谈判家");
  if (facts.tags.has("separatePack")) badges.add("冷热分袋");
  if (facts.tags.has("spicy")) badges.add("辣味探索");
  if (facts.tags.has("share") || facts.tags.has("party")) badges.add("分享友好");

  if (badges.size === 0) badges.add("认真下单员");
  return Array.from(badges).slice(0, 6);
};

export const generateFoodPersona = ({
  mood,
  entries,
  combos,
  deliveryScore,
  selectedEvents,
  finalScores,
  statsWithCombo
}: {
  mood: Mood;
  entries: CartEntry[];
  combos: ComboRule[];
  deliveryScore: DeliveryScore;
  selectedEvents: ResultJourneyEvent[];
  finalScores: { joyIndex: number; healthIndex: number; safetyIndex: number };
  statsWithCombo: Stats;
}) => {
  const facts = collectOrderFacts(entries);
  const rawScores = emptyPersonaScores();

  addAxisScores(rawScores, moodAxisWeights[mood]);
  facts.tags.forEach((tag) => addAxisScores(rawScores, tagAxisWeights[tag] ?? {}));

  rawScores.driver += statsWithCombo.joy * 0.09 - statsWithCombo.health * 0.08 - statsWithCombo.safety * 0.05;
  rawScores.scene += (facts.tags.has("share") ? 8 : 0) + (facts.tags.has("social") ? 8 : 0) - (mood === "lateNight" ? 7 : 0);
  rawScores.discipline += statsWithCombo.joy * 0.08 + statsWithCombo.fullness * 0.04 - statsWithCombo.health * 0.12 - statsWithCombo.safety * 0.06;
  rawScores.novelty += (combos.length > 1 ? 4 : 0) + (facts.itemCount >= 4 ? 4 : 0);

  rawScores.driver -= Math.max(0, deliveryScore.safety - 50) * 0.08;
  rawScores.driver -= Math.max(0, deliveryScore.health - 50) * 0.08;
  rawScores.discipline -= Math.max(0, deliveryScore.health - 50) * 0.16;
  rawScores.discipline -= Math.max(0, deliveryScore.safety - 50) * 0.1;
  rawScores.novelty -= Math.max(0, deliveryScore.integrity - 50) * 0.08;

  selectedEvents.forEach((event) => {
    if (event.eventType === "fun") addAxisScores(rawScores, { driver: 2, novelty: 4 });
    if (event.eventType === "healthyLife") addAxisScores(rawScores, { driver: -3, discipline: -6 });
    if (event.eventType === "riderSafety") addAxisScores(rawScores, { driver: -4, discipline: -4, novelty: -2 });
    if (event.eventType === "packaging" || event.eventType === "foodSafety") {
      addAxisScores(rawScores, { driver: -4, discipline: -4, novelty: -4 });
    }

    if (event.choiceLabel.includes("拼单")) addAxisScores(rawScores, { scene: 8, novelty: 2 });
    if (event.choiceLabel.includes("新品") || event.choiceLabel.includes("尝鲜") || event.choiceLabel.includes("试")) {
      addAxisScores(rawScores, { novelty: 8 });
    }
    if (event.choiceLabel.includes("半糖") || event.choiceLabel.includes("无糖") || event.choiceLabel.includes("散步")) {
      addAxisScores(rawScores, { driver: -3, discipline: -8 });
    }
  });

  const axes = buildPersonaAxes(rawScores);
  const code = axes.map((axis) => axis.codeLetter).join("");
  const persona = foodPersonaTypes[code] ?? foodPersonaTypes.RIBC;
  const badges = buildPersonaBadges({ facts, combos, deliveryScore, finalScores, selectedEvents });
  const variantTitle = badges.find((badge) => !combos.some((combo) => combo.name === badge)) ?? badges[0] ?? "认真下单员";

  return {
    ...persona,
    variantTitle,
    displayName: `${persona.code} ${persona.name}`,
    axes,
    badges
  };
};

export const generateResultSummary = ({
  mood,
  totals,
  combos,
  deliveryScore,
  selectedEventTitles = [],
  selectedEvents,
  entries = []
}: {
  mood: Mood;
  totals: { price: number; stats: Stats };
  combos: ComboRule[];
  deliveryScore: DeliveryScore;
  selectedEventTitles?: string[];
  selectedEvents?: ResultJourneyEvent[];
  entries?: CartEntry[];
}): ResultSummary => {
  const comboNames = combos.map((combo) => combo.name);
  const statsWithCombo = applyComboBonuses(totals.stats, combos);
  const joyIndex = clamp(45 + statsWithCombo.joy * 0.75 + deliveryScore.trust * 0.15 + deliveryScore.integrity * 0.1);
  const healthIndex = clamp(55 + statsWithCombo.health * 0.8 + deliveryScore.health * 0.25);
  const safetyIndex = clamp(50 + statsWithCombo.safety * 0.7 + deliveryScore.safety * 0.25 + deliveryScore.integrity * 0.2);
  const mainCombo = comboNames[0] ?? "自由发挥单";
  const eventRecords =
    selectedEvents ??
    selectedEventTitles.map((title) => ({
      eventTitle: title,
      choiceLabel: title,
      eventType: "fun" as const
    }));
  const eventLine = selectedEventTitles.length > 0 ? selectedEventTitles.join(" / ") : "安全抵达，无额外事件";
  const choiceLine = eventRecords.length > 0 ? eventRecords.map((event) => event.choiceLabel).join(" / ") : "本单一路顺风";
  const itemLine =
    entries.length > 0
      ? entries
          .slice(0, 4)
          .map((entry) => `${entry.item.name}x${entry.quantity}`)
          .join(" + ")
      : "本次点单内容由快乐值托管";
  const finalScores = { joyIndex, healthIndex, safetyIndex };
  const foodPersona = generateFoodPersona({
    mood,
    entries,
    combos,
    deliveryScore,
    selectedEvents: eventRecords,
    finalScores,
    statsWithCombo
  });
  const persona = `${foodPersona.displayName}，${foodPersona.shortLine} 本次触发「${mainCombo}」`;
  const nextTip =
    healthIndex < 55
      ? "下次可以试试半糖、无糖饮或饭后散步取餐。"
      : safetyIndex < 60
        ? "下次优先冷热分装、加杯托和清晰备注。"
        : foodPersona.nextOrder;

  const receiptLines = [
    `今日下单目的：${moodPurposeLabels[mood]}`,
    `点单内容：${itemLine}`,
    `互动过程：${choiceLine}`,
    `订单金额：¥${totals.price}`,
    `触发组合：${comboNames.length ? comboNames.join("、") : "暂无，继续加料试试"}`,
    `配送博弈：${eventLine}`,
    `今日订单名：${moodOrderTitles[mood]}`,
    `快乐指数：${joyIndex} / 健康指数：${healthIndex} / 安全指数：${safetyIndex}`
  ];
  const journeyLines = [
    `今日下单目的：${moodPurposeLabels[mood]}`,
    `点单内容：${itemLine}`,
    `互动过程：${choiceLine}`,
    `人格推导：${foodPersona.displayName} · ${foodPersona.variantTitle}`
  ];

  return {
    orderTitle: moodOrderTitles[mood],
    persona,
    nextTip,
    shareText: `我刚生成了「${moodOrderTitles[mood]}」：${foodPersona.displayName}，快乐指数 ${joyIndex}，健康指数 ${healthIndex}，安全指数 ${safetyIndex}。${nextTip}`,
    receiptLines,
    journeyLines,
    badges: foodPersona.badges,
    foodPersona,
    finalScores
  };
};
