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
  return (Object.keys(personaAxisMeta) as PersonaAxisKey[]).map((key) => {
    const value = clamp(50 + scores[key], 8, 92);
    const meta = personaAxisMeta[key];
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
  selectedEvents.forEach((event) => event.badges?.forEach((badge) => badges.add(badge)));
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
  dominantAxis
}: {
  mood: Mood;
  entries: CartEntry[];
  combos: ComboRule[];
  selectedEvents: ResultJourneyEvent[];
  finalScores: { joyIndex: number; healthIndex: number; safetyIndex: number };
  dominantAxis: PersonaDominantAxis;
}): PersonaEvidenceLine[] => {
  const itemNames = entries.length > 0 ? entries.slice(0, 3).map((entry) => `${entry.item.name}x${entry.quantity}`) : ["自由发挥单"];
  const optionLabels = entries
    .flatMap((entry) => getSelectedOptionChoices(entry).map((choice) => choice.label))
    .slice(0, 3);
  const decision = selectedEvents.find((event) => event.choiceLabel);
  const comboLine = combos[0] ? `，触发「${combos[0].name}」` : "";
  const optionLine = optionLabels.length ? `，还调整了${optionLabels.join("、")}` : "";

  return [
    {
      type: "order",
      label: "点单证据",
      text: `你以「${moodPurposeLabels[mood]}」开局，像一个${moodPersonaLines[mood]}，点了${itemNames.join(" + ")}${optionLine}${comboLine}。`
    },
    {
      type: "decision",
      label: "决策证据",
      text: decision
        ? `在「${decision.eventTitle}」里，你选择了「${decision.choiceLabel}」。`
        : "本单没有明显纠结点，你更像顺滑完成订单的人。"
    },
    {
      type: "result",
      label: "结果证据",
      text: `最终快乐 ${finalScores.joyIndex}、健康 ${finalScores.healthIndex}、安全 ${finalScores.safetyIndex}，最明显的轴是「${dominantAxis.leaningLabel}」。`
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
    if (event.personaEffect) addAxisScores(rawScores, event.personaEffect);
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
  const persona = personaTypeBank[code] ?? personaTypeBank.RIBC;
  const badges = buildPersonaBadges({ facts, combos, deliveryScore, finalScores, selectedEvents });
  const variantTitle = badges.find((badge) => !combos.some((combo) => combo.name === badge)) ?? badges[0] ?? "认真下单员";
  const dominantAxis = buildDominantAxis(axes);
  const evidenceLines = buildPersonaEvidenceLines({
    mood,
    entries,
    combos,
    selectedEvents,
    finalScores,
    dominantAxis
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
    avatarKey: personaAvatarKeys[code] ?? "balanced-lunch",
    avatarPosition: personaAvatarPositions[code] ?? { x: 3, y: 3 },
    confidenceLabel: buildConfidenceLabel(entries, selectedEvents)
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
  escortOutcome
}: {
  mood: Mood;
  totals: { price: number; stats: Stats };
  combos: ComboRule[];
  deliveryScore: DeliveryScore;
  selectedEventTitles?: string[];
  selectedEvents?: ResultJourneyEvent[];
  entries?: CartEntry[];
  escortOutcome?: EscortOutcome;
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
    statsWithCombo
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
    { label: "快乐值", value: joyIndex },
    { label: "健康值", value: healthIndex },
    { label: "安全值", value: safetyIndex }
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
    `快乐指数：${joyIndex} / 健康指数：${healthIndex} / 安全指数：${safetyIndex}`
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
    axisSummary: `你的主导倾向是「${foodPersona.dominantAxis.leaningLabel}」，${foodPersona.confidenceLabel}。`,
    evidenceLines: foodPersona.evidenceLines
  };

  return {
    orderTitle: moodOrderTitles[mood],
    persona,
    nextTip,
    shareText: `我刚生成了「${moodOrderTitles[mood]}」：${foodPersona.displayName} · ${foodPersona.variantTitle}。最强证据：${foodPersona.evidenceLines[0]?.text ?? "这单很有吃商"} 快乐指数 ${joyIndex}，健康指数 ${healthIndex}，安全指数 ${safetyIndex}${escortOutcome ? `，订单评级 ${escortOutcome.rating} · ${escortOutcome.title}` : ""}。${nextTip}`,
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
