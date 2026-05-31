import type {
  CartEntry,
  ComboRule,
  DeliveryChoice,
  DeliveryEvent,
  DeliveryScore,
  EscortOutcome,
  Mood,
  OptionChoice,
  PersonaDominantAxis,
  PersonaEvidenceLine,
  PersonaAxisKey,
  PersonaAxisScore,
  ResultJourneyEvent,
  ResultSummary,
  Stats
} from "../types";
import {
  foodPersonaTypes as personaTypeBank,
  personaAvatarKeys,
  personaAvatarPositions,
  personaAxes as personaAxisMeta
} from "../data/foodPersonas";
import { getItemPersonaProfile } from "../data/itemPersonaProfiles";

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

const moodAxisWeights: Record<Mood, Partial<Record<PersonaAxisKey, number>>> = {
  tired: { structure: -5, restraint: -3, control: 3, deal: -2 },
  hungry: { structure: -4, restraint: -7, control: -2, deal: -1 },
  emo: { structure: -2, restraint: -6, control: -1, deal: -2 },
  overtime: { structure: 5, restraint: 2, control: 5, deal: 2 },
  slacking: { structure: 2, restraint: -2, control: -3, deal: 4 },
  celebration: { structure: 8, restraint: -6, control: 2, deal: -2 },
  date: { structure: 7, restraint: 1, control: 7, deal: -3 },
  crazy: { structure: 3, restraint: -12, control: -5, deal: 2 },
  afterWorkout: { structure: 3, restraint: 12, control: 5, deal: -1 },
  lateNight: { structure: -4, restraint: -5, control: -1, deal: -2 }
};

const tagAxisWeights: Record<string, Partial<Record<PersonaAxisKey, number>>> = {
  sweet: { restraint: -4 },
  comfort: { restraint: -2, control: 1 },
  warm: { restraint: 1, control: 3 },
  caffeine: { structure: -1, restraint: -1 },
  refresh: { restraint: 2 },
  fruit: { structure: 2, restraint: 2 },
  share: { structure: 6 },
  party: { structure: 8, restraint: -3 },
  social: { structure: 6 },
  fun: { structure: 2, restraint: -2, control: -2 },
  spicy: { restraint: -6, control: -1 },
  fried: { restraint: -7 },
  cheese: { restraint: -5 },
  chewy: { restraint: -2 },
  healthy: { restraint: 8 },
  lowSugar: { restraint: 10 },
  protein: { restraint: 7 },
  light: { restraint: 6 },
  safe: { control: 6 },
  separatePack: { control: 8 },
  healthyNote: { restraint: 8, control: 2 },
  combo: { structure: 4, deal: 2 },
  lateNight: { structure: -2, restraint: -3 },
  afterWorkout: { restraint: 8 },
  slacking: { control: -2, deal: 2 },
  bold: { restraint: -5, control: -2 },
  soup: { control: 3 },
  milkTea: { structure: 1, restraint: -1 },
  ticket: { structure: 4, deal: -2 },
  energy: { restraint: -1 }
};

const personaAxisBaseBias: Record<PersonaAxisKey, number> = {
  structure: -12,
  restraint: 0,
  control: -7,
  deal: -9
};

const clamp = (value: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(value)));

const emptyPersonaScores = (): Record<PersonaAxisKey, number> => ({
  structure: 0,
  restraint: 0,
  control: 0,
  deal: 0
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
  const itemProfiles: ReturnType<typeof getItemPersonaProfile>[] = [];
  const optionLabels: string[] = [];
  const optionTags = new Set<string>();
  let itemCount = 0;

  entries.forEach((entry) => {
    itemCount += entry.quantity;
    categoryCounts[entry.item.category] = (categoryCounts[entry.item.category] ?? 0) + entry.quantity;
    itemProfiles.push(getItemPersonaProfile(entry.item));
    entry.item.tags.forEach((tag) => tags.add(tag));
    getSelectedOptionChoices(entry).forEach((choice) => {
      optionLabels.push(choice.label);
      choice.tags?.forEach((tag) => {
        tags.add(tag);
        optionTags.add(tag);
      });
    });
  });

  const uniqueCategoryCount = Object.keys(categoryCounts).length;
  const profileTags = new Set(itemProfiles.flatMap((profile) => profile.evidenceTags));
  const topCategory =
    Object.entries(categoryCounts).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]?.[0] ?? "other";
  const hasDrink = Boolean((categoryCounts.milkTea ?? 0) + (categoryCounts.coffee ?? 0));
  const hasFood = uniqueCategoryCount > (hasDrink ? 1 : 0);
  const structureSignals = uniqueCategoryCount >= 3 || (hasDrink && hasFood) || tags.has("share") || tags.has("combo");
  const singleSignals = uniqueCategoryCount <= 1 || itemCount <= 1;
  const restraintSignals = [...tags, ...optionTags].filter((tag) =>
    ["healthy", "lowSugar", "protein", "light", "healthyNote", "safe"].includes(tag)
  );
  const oilSignals = [...tags, ...optionTags].filter((tag) =>
    ["sweet", "spicy", "fried", "cheese", "chewy", "bold", "fullness"].includes(tag)
  );
  const controlSignals = [...tags, ...optionTags].filter((tag) => ["safe", "separatePack", "warm"].includes(tag));
  const dealSignals = itemProfiles.filter((profile) => profile.evidenceTags.includes("凑单小件"));

  return {
    tags,
    categoryCounts,
    itemCount,
    uniqueCategoryCount,
    itemProfiles,
    optionLabels,
    optionTags,
    profileTags,
    topCategory,
    hasDrink,
    hasFood,
    structureSignals,
    singleSignals,
    restraintSignals,
    oilSignals,
    controlSignals,
    dealSignals
  };
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
  return (Object.keys(personaAxisMeta) as PersonaAxisKey[]).map((key) => {
    const value = clamp(50 + scores[key], 8, 92);
    const meta = personaAxisMeta[key];
    return {
      ...meta,
      value,
      codeLetter: value > 50 ? meta.leftCode : meta.rightCode
    };
  });
};

const axisValue = (axis: PersonaAxisScore) => Math.abs(axis.value - 50);

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
  selectedEvents.forEach((event) => event.badges?.forEach((badge) => badges.add(badge)));
  if (selectedEvents.some((event) => event.choiceLabel.includes("不催") || event.choiceLabel.includes("安全"))) badges.add("骑手友好派");
  if (selectedEvents.some((event) => event.choiceLabel.includes("散步"))) badges.add("饭后散步");
  if (finalScores.joyIndex >= 80) badges.add("快乐加成");
  if (finalScores.healthIndex >= 72 || deliveryScore.health >= 62 || facts.restraintSignals.length >= 2) badges.add("低糖谈判家");
  if (finalScores.safetyIndex >= 80 || deliveryScore.safety >= 64) badges.add("安心控场");
  if (deliveryScore.integrity >= 62 || facts.controlSignals.length >= 2) badges.add("包装完整主义者");
  if (deliveryScore.trust >= 62) badges.add("骑手友好");
  if (facts.dealSignals.length > 0) badges.add("满减策略家");
  if (facts.tags.has("lowSugar")) badges.add("低糖谈判家");
  if (facts.tags.has("separatePack")) badges.add("冷热分袋");
  if (facts.tags.has("spicy") || facts.tags.has("bold")) badges.add("重口参数控");
  if (facts.tags.has("share") || facts.tags.has("party")) badges.add("社交拼单协调员");
  if (selectedEvents.some((event) => event.choiceLabel.includes("小票") || event.choiceLabel.includes("核对"))) badges.add("小票核对派");
  if (selectedEvents.some((event) => event.choiceLabel.includes("分一半") || event.choiceLabel.includes("明天"))) badges.add("快乐分期师");

  if (badges.size === 0) badges.add("认真下单员");
  return Array.from(badges).slice(0, 6);
};

const buildDominantAxis = (axes: PersonaAxisScore[]): PersonaDominantAxis => {
  const dominant = axes.reduce((current, axis) =>
    Math.abs(axis.value - 50) > Math.abs(current.value - 50) ? axis : current
  );
  const leaningLeft = dominant.value >= 50;

  return {
    key: dominant.key,
    label: `${dominant.leftLabel} / ${dominant.rightLabel}`,
    value: dominant.value,
    codeLetter: dominant.codeLetter,
    leaningLabel: leaningLeft ? dominant.leftLabel : dominant.rightLabel
  };
};

const buildPersonaEvidenceLines = ({
  mood,
  entries,
  combos,
  selectedEvents,
  finalScores,
  dominantAxis,
  facts,
  axes,
  dealDiscount,
  rawPrice
}: {
  mood: Mood;
  entries: CartEntry[];
  combos: ComboRule[];
  selectedEvents: ResultJourneyEvent[];
  finalScores: { joyIndex: number; healthIndex: number; safetyIndex: number };
  dominantAxis: PersonaDominantAxis;
  facts: ReturnType<typeof collectOrderFacts>;
  axes: PersonaAxisScore[];
  dealDiscount?: number;
  rawPrice?: number;
}): PersonaEvidenceLine[] => {
  const itemNames = entries.length > 0 ? entries.slice(0, 3).map((entry) => `${entry.item.name}x${entry.quantity}`) : ["自由发挥单"];
  const optionLabels = facts.optionLabels.slice(0, 3);
  const comboLine = combos[0] ? `，触发「${combos[0].name}」` : "";
  const optionLine = optionLabels.length ? `，还调整了${optionLabels.join("、")}` : "";
  const axisByKey = Object.fromEntries(axes.map((axis) => [axis.key, axis])) as Record<PersonaAxisKey, PersonaAxisScore>;
  const structureLean = axisByKey.structure.codeLetter;
  const restraintLean = axisByKey.restraint.codeLetter;
  const controlLean = axisByKey.control.codeLetter;
  const dealLean = axisByKey.deal.codeLetter;
  const eventLabels = selectedEvents.map((event) => event.choiceLabel).filter(Boolean);
  const controlEvidence = eventLabels.find((label) =>
    /分袋|加固|密封|标记|核对|定位|拍照|不急|安全|前台|楼下/.test(label)
  );
  const casualEvidence = eventLabels.find((label) => /快|直接|同袋|不用|相信|接受|先吃|不管/.test(label));
  const restraintEvidence =
    facts.optionLabels.find((label) => /半糖|无糖|少糖|少油|低脂|燕麦|蛋白|去冰/.test(label)) ??
    eventLabels.find((label) => /半糖|无糖|少油|散步|分一半|蛋白|清淡/.test(label));
  const oilEvidence =
    facts.optionLabels.find((label) => /大杯|加量|双份|全糖|正常糖|重辣|加甜|奶盖|珍珠|芋泥/.test(label)) ??
    eventLabels.find((label) => /先快乐|加购|双份|重辣|原辣|先吃|快点/.test(label));
  const dealEvidence =
    dealDiscount && dealDiscount > 0
      ? `本单使用优惠抵扣 ¥${dealDiscount}`
      : facts.dealSignals[0]?.itemName
        ? `你加入了「${facts.dealSignals[0].itemName}」这类补差/完善组合的小件`
        : undefined;
  const discountRatio = rawPrice && dealDiscount ? Math.round((dealDiscount / rawPrice) * 100) : 0;

  return [
    {
      type: "structure",
      label: `商品证据 · ${structureLean}`,
      text:
        structureLean === "H"
          ? `你以「${moodPurposeLabels[mood]}」开局，点了${itemNames.join(" + ")}${optionLine}${comboLine}，覆盖 ${facts.uniqueCategoryCount} 类内容，像在拼一套完整订单。`
          : `你以「${moodPurposeLabels[mood]}」开局，核心集中在${itemNames[0]}${optionLine}${comboLine}，更像围绕一个明确需求猛冲。`
    },
    {
      type: "restraint",
      label: `规格证据 · ${restraintLean}`,
      text:
        restraintLean === "C"
          ? `${restraintEvidence ? `你选择了「${restraintEvidence}」` : "你的低负担标签更多"}，刹车证据多于油门证据，所以偏 C 刹车型。`
          : `${oilEvidence ? `你选择了「${oilEvidence}」` : "甜、辣、炸、加料或高快乐商品更突出"}，即时满足证据更强，所以偏 E 油门型。`
    },
    {
      type: "control",
      label: `过程证据 · ${controlLean}`,
      text:
        controlLean === "G"
          ? `${controlEvidence ? `你在过程中做了「${controlEvidence}」` : "包装、规格或安全确认更明显"}，说明你会主动把到手风险压低。`
          : `${casualEvidence ? `你在过程中选择了「${casualEvidence}」` : "你较少追加确认和包装控制"}，说明你更愿意把变量交给现场。`
    },
    {
      type: "deal",
      label: `优惠证据 · ${dealLean}`,
      text:
        dealLean === "S"
          ? `${dealEvidence ?? "本单有凑单、套餐或优惠敏感信号"}${discountRatio ? `，优惠约占原价 ${discountRatio}%` : ""}，因此偏 S 薅毛型。`
          : "这单主要由想吃什么决定，优惠没有明显改写原本偏好，因此偏 L 随心型。"
    },
    {
      type: "result",
      label: "指数说明",
      text: `最终预测是订单体验的可视化：快乐浓度 ${finalScores.joyIndex}、负担控制 ${finalScores.healthIndex}、到手稳妥 ${finalScores.safetyIndex}。它们只辅助解释变体，最终看的是你反复做出的选择。`
    }
  ];
};

const buildVariantReason = ({
  variantTitle,
  combos,
  selectedEvents,
  badges
}: {
  variantTitle: string;
  combos: ComboRule[];
  selectedEvents: ResultJourneyEvent[];
  badges: string[];
}) => {
  const eventEvidence =
    selectedEvents.find((event) => event.badges?.includes(variantTitle)) ??
    selectedEvents.find((event) => event.choiceLabel.includes(variantTitle.replace(/家|师|派|者|官|王/g, ""))) ??
    selectedEvents[0];
  const comboEvidence = combos.find((combo) => combo.name === variantTitle);

  if (eventEvidence) {
    return `因为你在「${eventEvidence.eventTitle}」里选择了「${eventEvidence.choiceLabel}」，这单被标记为「${variantTitle}」。`;
  }
  if (comboEvidence) {
    return `因为本单触发了「${comboEvidence.name}」，你的吃商变体落在「${variantTitle}」。`;
  }
  return `这单综合了${badges.slice(0, 3).join("、") || "点单内容"}，所以给出「${variantTitle}」这个变体称号。`;
};

const buildConfidenceLabel = (entries: CartEntry[], selectedEvents: ResultJourneyEvent[]) => {
  const evidenceCount = entries.length + selectedEvents.length;
  if (selectedEvents.length >= 7 && entries.length >= 2) return "证据样本很足";
  if (evidenceCount >= 5) return "证据样本稳定";
  return "证据样本偏轻";
};

const buildPersonaRarity = (axes: PersonaAxisScore[], badges: string[], facts: ReturnType<typeof collectOrderFacts>) => {
  const axisClarity = axes.reduce((sum, axis) => sum + axisValue(axis), 0) / axes.length;
  const strongAxes = axes.filter((axis) => axisValue(axis) >= 22).length;
  const hiddenCombo =
    strongAxes >= 4 ||
    (badges.includes("满减策略家") && badges.includes("包装完整主义者") && badges.includes("重口参数控"));

  if (hiddenCombo) {
    return {
      level: "Hidden" as const,
      key: "hidden" as const,
      label: "隐藏款样本",
      colorLabel: "黑金/虹彩",
      reason: "四轴都很鲜明，或触发了优惠、包装、重口的特殊组合。"
    };
  }

  if (axisClarity >= 24 && facts.itemCount >= 3) {
    return { level: 4, key: "gold" as const, label: "高光样本", colorLabel: "金色", reason: "商品和决策高度一致，吃商风格非常清楚。" };
  }
  if (axisClarity >= 18) {
    return { level: 3, key: "purple" as const, label: "鲜明样本", colorLabel: "紫色", reason: "多个轴有清晰证据，但仍保留一点弹性。" };
  }
  if (axisClarity >= 11) {
    return { level: 2, key: "blue" as const, label: "稳定样本", colorLabel: "蓝色", reason: "已有稳定倾向，可解释证据比较完整。" };
  }
  return { level: 1, key: "green" as const, label: "轻量样本", colorLabel: "绿色", reason: "本单证据较少，结果更像轻量记录。" };
};

export const generateFoodPersona = ({
  mood,
  entries,
  combos,
  deliveryScore,
  selectedEvents,
  finalScores,
  statsWithCombo,
  dealDiscount = 0,
  rawPrice
}: {
  mood: Mood;
  entries: CartEntry[];
  combos: ComboRule[];
  deliveryScore: DeliveryScore;
  selectedEvents: ResultJourneyEvent[];
  finalScores: { joyIndex: number; healthIndex: number; safetyIndex: number };
  statsWithCombo: Stats;
  dealDiscount?: number;
  rawPrice?: number;
}) => {
  const facts = collectOrderFacts(entries);
  const rawScores = emptyPersonaScores();

  addAxisScores(rawScores, personaAxisBaseBias);
  addAxisScores(rawScores, moodAxisWeights[mood]);
  facts.tags.forEach((tag) => addAxisScores(rawScores, tagAxisWeights[tag] ?? {}));
  entries.forEach((entry) => {
    const profile = getItemPersonaProfile(entry.item);
    addAxisScores(rawScores, profile.axisDelta, entry.quantity);
    getSelectedOptionChoices(entry).forEach((choice) => {
      const label = choice.label;
      choice.tags?.forEach((tag) => addAxisScores(rawScores, tagAxisWeights[tag] ?? {}));
      if (/半糖|无糖|少糖|少油|少盐|低脂|燕麦|蛋白|去冰|少冰|吸油/.test(label)) {
        addAxisScores(rawScores, { restraint: 6 });
      }
      if (/大杯|加量|双份|全糖|标准甜|正常糖|重辣|加甜|奶盖|珍珠|芋泥|芝士/.test(label)) {
        addAxisScores(rawScores, { restraint: -6 });
      }
      if (/杯托|密封|分袋|分装|保温|餐具|杯套|防漏|标注|加固/.test(label)) {
        addAxisScores(rawScores, { control: 5 });
      }
      if (/默认|普通|正常/.test(label)) {
        addAxisScores(rawScores, { control: -2 });
      }
      if ((choice.priceDelta ?? 0) > 0 && (choice.priceDelta ?? 0) <= 3) {
        addAxisScores(rawScores, { deal: 1 });
      }
      if ((choice.priceDelta ?? 0) >= 5) {
        addAxisScores(rawScores, { deal: -2 });
      }
    });
  });

  rawScores.structure += facts.uniqueCategoryCount * 2 + (facts.hasDrink && facts.hasFood ? 3 : 0) + (facts.itemCount >= 4 ? 3 : 0);
  rawScores.structure += facts.structureSignals ? 2 : 0;
  rawScores.structure -= facts.singleSignals ? 12 : 0;
  if (facts.itemCount <= 2 && !facts.hasDrink && !facts.tags.has("share") && !facts.tags.has("combo")) {
    rawScores.structure -= 4;
  }
  rawScores.restraint += statsWithCombo.health * 0.12 + statsWithCombo.safety * 0.04 - statsWithCombo.joy * 0.06 - statsWithCombo.fullness * 0.04;
  rawScores.control += statsWithCombo.safety * 0.06 + facts.controlSignals.length * 1.5;
  rawScores.deal += facts.dealSignals.length * 4;
  rawScores.deal += dealDiscount > 0 ? Math.min(18, dealDiscount * 1.5) : -8;
  rawScores.deal += rawPrice && dealDiscount / rawPrice >= 0.14 ? 6 : 0;

  combos.forEach((combo) => {
    rawScores.structure += 1;
    if (/防撒漏|不翻车|安全|完整|分装/.test(combo.name + combo.description)) rawScores.control += 2;
    if (/低糖|自律|恢复|清爽/.test(combo.name + combo.description)) rawScores.restraint += 4;
    if (/发疯|罪恶|辣|甜|加料/.test(combo.name + combo.description)) rawScores.restraint -= 4;
  });

  rawScores.control += Math.max(0, deliveryScore.safety - 50) * 0.07;
  rawScores.control += Math.max(0, deliveryScore.integrity - 50) * 0.08;
  rawScores.control += Math.max(0, deliveryScore.trust - 50) * 0.05;
  rawScores.restraint += Math.max(0, deliveryScore.health - 50) * 0.13;
  rawScores.restraint += Math.max(0, deliveryScore.safety - 50) * 0.04;

  selectedEvents.forEach((event) => {
    if (event.personaEffect) addAxisScores(rawScores, event.personaEffect);
    if (event.eventType === "fun") addAxisScores(rawScores, { structure: 1, restraint: -2, control: -2 });
    if (event.eventType === "healthyLife") addAxisScores(rawScores, { restraint: 7 });
    if (event.eventType === "riderSafety") addAxisScores(rawScores, { control: 4, restraint: 2 });
    if (event.eventType === "packaging" || event.eventType === "foodSafety") {
      addAxisScores(rawScores, { control: 4 });
    }

    if (event.choiceLabel.includes("拼单") || event.choiceLabel.includes("分享")) addAxisScores(rawScores, { structure: 7 });
    if (event.choiceLabel.includes("新品") || event.choiceLabel.includes("尝鲜") || event.choiceLabel.includes("试")) {
      addAxisScores(rawScores, { control: -3, restraint: -2 });
    }
    if (/半糖|无糖|少油|少盐|散步|分一半|蛋白|轻食/.test(event.choiceLabel)) {
      addAxisScores(rawScores, { restraint: 8 });
    }
    if (/加购|满减|券|凑/.test(event.choiceLabel + event.eventTitle)) {
      addAxisScores(rawScores, { deal: 10 });
    }
    if (/不为券|不凑|不加购/.test(event.choiceLabel)) {
      addAxisScores(rawScores, { deal: -14 });
    }
    if (/快|直接|同袋|不用|相信命运|接受原单|先吃|不管/.test(event.choiceLabel)) {
      addAxisScores(rawScores, { control: -8, restraint: -2 });
    }
    if (/安全|不急|分袋|加固|密封|标记|核对|定位|拍照|前台|楼下|重做|确认/.test(event.choiceLabel)) {
      addAxisScores(rawScores, { control: 5 });
    }
  });

  const axes = buildPersonaAxes(rawScores);
  const code = axes.map((axis) => axis.codeLetter).join("");
  const persona = personaTypeBank[code] ?? personaTypeBank.NCRL;
  const badges = buildPersonaBadges({ facts, combos, deliveryScore, finalScores, selectedEvents });
  const variantTitle =
    badges.find((badge) =>
      ["低糖谈判家", "包装完整主义者", "骑手友好派", "满减策略家", "小票核对派", "快乐分期师", "重口参数控", "社交拼单协调员"].includes(badge)
    ) ??
    badges.find((badge) => !combos.some((combo) => combo.name === badge)) ??
    badges[0] ??
    "认真下单员";
  const dominantAxis = buildDominantAxis(axes);
  const rarity = buildPersonaRarity(axes, badges, facts);
  const evidenceLines = buildPersonaEvidenceLines({
    mood,
    entries,
    combos,
    selectedEvents,
    finalScores,
    dominantAxis,
    facts,
    axes,
    dealDiscount,
    rawPrice
  });
  const variantReason = buildVariantReason({ variantTitle, combos, selectedEvents, badges });

  return {
    ...persona,
    variantTitle,
    displayName: `${persona.code} ${persona.name}`,
    axes,
    badges,
    evidenceLines,
    dominantAxis,
    variantReason,
    avatarKey: personaAvatarKeys[code] ?? "clean-single",
    avatarPosition: personaAvatarPositions[code] ?? { x: 3, y: 3 },
    confidenceLabel: buildConfidenceLabel(entries, selectedEvents),
    rarity
  };
};

export const generateResultSummary = ({
  mood,
  totals,
  combos,
  deliveryScore,
  selectedEventTitles = [],
  selectedEvents,
  entries = [],
  escortOutcome,
  rawPrice,
  dealDiscount = 0
}: {
  mood: Mood;
  totals: { price: number; stats: Stats };
  combos: ComboRule[];
  deliveryScore: DeliveryScore;
  selectedEventTitles?: string[];
  selectedEvents?: ResultJourneyEvent[];
  entries?: CartEntry[];
  escortOutcome?: EscortOutcome;
  rawPrice?: number;
  dealDiscount?: number;
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
      : "本次点单内容由快乐点托管";
  const receiptItems = entries.length > 0 ? entries.map((entry) => `${entry.item.name}x${entry.quantity}`) : ["快乐托管单"];
  const receiptChoices = eventRecords.map((event) => event.choiceLabel).filter(Boolean);
  const finalScores = { joyIndex, healthIndex, safetyIndex };
  const foodPersona = generateFoodPersona({
    mood,
    entries,
    combos,
    deliveryScore,
    selectedEvents: eventRecords,
    finalScores,
    statsWithCombo,
    dealDiscount,
    rawPrice
  });
  const persona = `${foodPersona.displayName}，${foodPersona.shortLine} 本次触发「${mainCombo}」`;
  const nextTip =
    healthIndex < 55
      ? "下次可以试试半糖、无糖饮或饭后散步取餐。"
      : safetyIndex < 60
        ? "下次优先冷热分装、加杯托和清晰备注。"
        : foodPersona.nextOrder;
  const outcomeLines = escortOutcome?.summaryLines ?? [];
  const badges = Array.from(new Set([...foodPersona.badges, ...(escortOutcome?.achievements ?? [])])).slice(0, 8);
  const receiptIndexes = [
    { label: "快乐浓度", value: joyIndex },
    { label: "负担控制", value: healthIndex },
    { label: "到手稳妥", value: safetyIndex }
  ];

  const receiptLines = [
    `今日下单目的：${moodPurposeLabels[mood]}`,
    `点单内容：${itemLine}`,
    `互动过程：${choiceLine}`,
    `订单金额：¥${totals.price}`,
    `触发组合：${comboNames.length ? comboNames.join("、") : "暂无，继续加料试试"}`,
    escortOutcome ? `订单进行中：${escortOutcome.rating} · ${escortOutcome.title}` : `订单沟通：${eventLine}`,
    ...(escortOutcome ? [`本单路径：${escortOutcome.routeLine}`, `吃商证据：${escortOutcome.achievements.join("、") || "认真下单员"}`] : []),
    `今日订单名：${moodOrderTitles[mood]}`,
    `最终预测：快乐浓度 ${joyIndex} / 负担控制 ${healthIndex} / 到手稳妥 ${safetyIndex}`
  ];
  const journeyLines = [
    `今日下单目的：${moodPurposeLabels[mood]}`,
    `点单内容：${itemLine}`,
    `互动过程：${choiceLine}`,
    ...outcomeLines,
    `人格推导：${foodPersona.displayName} · ${foodPersona.variantTitle}`
  ];
  const personaExplanation = {
    headline: `${foodPersona.displayName} · ${foodPersona.variantTitle}`,
    axisSummary: `点单内容决定吃商底色，过程选择决定修正和变体；你的主导倾向是「${foodPersona.dominantAxis.leaningLabel}」，${foodPersona.confidenceLabel}。${foodPersona.rarity.label}只代表本单风格鲜明度，不代表好坏。`,
    evidenceLines: foodPersona.evidenceLines
  };

  return {
    orderTitle: moodOrderTitles[mood],
    persona,
    nextTip,
    shareText: `我刚生成了「${moodOrderTitles[mood]}」：${foodPersona.displayName} · ${foodPersona.variantTitle}。最强证据：${foodPersona.evidenceLines[0]?.text ?? "这单很有吃商"} 快乐浓度 ${joyIndex}，负担控制 ${healthIndex}，到手稳妥 ${safetyIndex}${escortOutcome ? `，订单评级 ${escortOutcome.rating} · ${escortOutcome.title}` : ""}。${nextTip}`,
    receiptLines,
    journeyLines,
    badges,
    foodPersona,
    receipt: {
      orderTitle: moodOrderTitles[mood],
      status: escortOutcome ? `${escortOutcome.rating} · ${escortOutcome.title}` : "订单已送达",
      purpose: moodPurposeLabels[mood],
      items: receiptItems,
      choices: receiptChoices,
      combos: comboNames,
      amount: totals.price,
      indexes: receiptIndexes,
      evidence: foodPersona.evidenceLines
    },
    personaExplanation,
    escortOutcome,
    finalScores
  };
};
