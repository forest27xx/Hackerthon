import { describe, expect, it } from "vitest";
import {
  applyComboBonuses,
  applyEventChoice,
  computeActiveCombos,
  computeOrderTotals,
  generateFoodPersona,
  generateResultSummary,
  getDefaultChoices,
  pickDeliveryEvents
} from "./gameEngine";
import { foodPersonaTypes, personaAvatarPositions } from "../data/foodPersonas";
import { itemPersonaProfiles, missingItemPersonaProfileIds } from "../data/itemPersonaProfiles";
import { comboRules as catalogComboRules, menuItems, moods } from "../data/catalog";
import type { CartEntry, ComboRule, DeliveryEvent, MenuItem, Mood, ResultJourneyEvent } from "../types";

const baseStats = {
  joy: 0,
  health: 0,
  fullness: 0,
  energy: 0,
  safety: 0
};

const drink: MenuItem = {
  id: "drink",
  name: "厚芋泥波波",
  category: "milkTea",
  price: 18,
  description: "甜糯回血",
  imageKey: "厚芋泥波波",
  tags: ["sweet", "comfort", "milkTea"],
  stats: { joy: 18, health: -4, fullness: 6, energy: 4, safety: 3 },
  options: [
    {
      id: "sugar",
      name: "糖度",
      type: "single",
      choices: [
        { id: "half", label: "半糖", statDelta: { health: 4 } },
        { id: "full", label: "全糖", statDelta: { joy: 4, health: -4 } }
      ]
    },
    {
      id: "toppings",
      name: "加料",
      type: "multi",
      choices: [
        { id: "taro", label: "双份芋泥", priceDelta: 4, statDelta: { joy: 6, fullness: 4 } },
        { id: "cup", label: "加固杯托", priceDelta: 1, statDelta: { safety: 5 } }
      ]
    }
  ]
};

const snack: MenuItem = {
  id: "snack",
  name: "盐酥鸡",
  category: "snack",
  price: 16,
  description: "热乎乎快乐",
  tags: ["fried", "comfort"],
  stats: { joy: 14, health: -5, fullness: 14, energy: 1, safety: 2 }
};

const comboRules: ComboRule[] = [
  {
    id: "overtime",
    name: "加班续命包",
    description: "甜食和热食一起把电量拉回可工作区间。",
    condition: { moods: ["overtime"], requiredTags: ["comfort"], minItems: 2 },
    bonus: { joy: 12, energy: 8 }
  },
  {
    id: "healthy",
    name: "低糖自律局",
    description: "快乐可以有，糖分先谈判。",
    condition: { requiredTags: ["lowSugar"], minItems: 1 },
    bonus: { health: 10 }
  }
];

const events: DeliveryEvent[] = [
  {
    id: "seal",
    type: "foodSafety",
    title: "封口机临时故障",
    body: "商家说重新封口要多等 2 分钟。",
    knowledge: "饮品封口完整能降低撒漏和外界污染风险。",
    choices: [
      { id: "wait", label: "等重新封口", effect: { speed: -2, safety: 8, integrity: 8, trust: 3 } },
      { id: "go", label: "直接出餐", effect: { speed: 5, safety: -6, integrity: -8, trust: -2 } }
    ]
  },
  {
    id: "rain",
    type: "riderSafety",
    title: "暴雨配送",
    body: "骑手预计晚到 4 分钟。",
    knowledge: "恶劣天气下催促赶路会提高交通风险。",
    choices: [
      { id: "safe", label: "安全第一不催单", effect: { speed: -3, safety: 10, trust: 8 } },
      { id: "hurry", label: "继续催一下", effect: { speed: 4, safety: -9, trust: -6 } }
    ]
  },
  {
    id: "walk",
    type: "healthyLife",
    title: "饭后久坐预警",
    body: "系统建议饭后走 10 分钟。",
    knowledge: "轻量活动可以帮助形成更好的餐后生活节奏。",
    choices: [
      { id: "walk", label: "下楼散步取餐", effect: { speed: 1, health: 9, trust: 2 } },
      { id: "sofa", label: "沙发等外卖", effect: { health: -4, integrity: 1 } }
    ]
  }
];

const findMenuItem = (predicate: (item: MenuItem) => boolean, label: string) => {
  const item = menuItems.find(predicate);
  if (!item) throw new Error(`Missing catalog item for ${label}`);
  return item;
};

const selectCatalogChoices = (item: MenuItem, wantedTags: string[] = []) => {
  const selectedChoices = getDefaultChoices(item);

  item.options?.forEach((group) => {
    const matchingChoices = group.choices.filter((choice) => choice.tags?.some((tag) => wantedTags.includes(tag)));
    if (matchingChoices.length === 0) return;

    selectedChoices[group.id] =
      group.type === "single"
        ? [matchingChoices[0].id]
        : Array.from(new Set([...(selectedChoices[group.id] ?? []), ...matchingChoices.map((choice) => choice.id)]));
  });

  return selectedChoices;
};

const catalogEntry = (item: MenuItem, quantity = 1, wantedTags: string[] = []): CartEntry => ({
  item,
  quantity,
  selectedChoices: selectCatalogChoices(item, wantedTags)
});

const catalogPersona = ({
  mood,
  entries,
  selectedEvents,
  dealDiscount = 0,
  deliveryScore,
  finalScores
}: {
  mood: Mood;
  entries: CartEntry[];
  selectedEvents: ResultJourneyEvent[];
  dealDiscount?: number;
  deliveryScore: Parameters<typeof generateFoodPersona>[0]["deliveryScore"];
  finalScores: Parameters<typeof generateFoodPersona>[0]["finalScores"];
}) => {
  const totals = computeOrderTotals(entries);
  const combos = computeActiveCombos(entries, catalogComboRules, mood);
  const statsWithCombo = applyComboBonuses(totals.stats, combos);

  return generateFoodPersona({
    mood,
    entries,
    combos,
    deliveryScore,
    selectedEvents,
    finalScores,
    statsWithCombo,
    dealDiscount,
    rawPrice: totals.price
  });
};

describe("gameEngine", () => {
  it("computes price and stat totals with quantities and selected options", () => {
    const totals = computeOrderTotals([
      {
        item: drink,
        quantity: 2,
        selectedChoices: {
          sugar: ["half"],
          toppings: ["taro", "cup"]
        }
      },
      {
        item: snack,
        quantity: 1,
        selectedChoices: {}
      }
    ]);

    expect(totals.price).toBe(62);
    expect(totals.stats).toEqual({
      joy: 62,
      health: -5,
      fullness: 34,
      energy: 9,
      safety: 18
    });
  });

  it("activates combo rules from mood, tags, and item count", () => {
    const active = computeActiveCombos(
      [
        { item: drink, quantity: 1, selectedChoices: {} },
        { item: snack, quantity: 1, selectedChoices: {} }
      ],
      comboRules,
      "overtime"
    );

    expect(active.map((combo) => combo.name)).toEqual(["加班续命包"]);
  });

  it("applies delivery choices to the running delivery score", () => {
    const score = applyEventChoice(
      { speed: 50, safety: 50, health: 50, integrity: 50, trust: 50 },
      events[0].choices[0]
    );

    expect(score).toEqual({ speed: 48, safety: 58, health: 50, integrity: 58, trust: 53 });
  });

  it("picks a deterministic non-repeating event route", () => {
    const route = pickDeliveryEvents(events, 2, "demo-seed");

    expect(route).toHaveLength(2);
    expect(new Set(route.map((event) => event.id)).size).toBe(2);
    expect(route.map((event) => event.id)).toEqual(pickDeliveryEvents(events, 2, "demo-seed").map((event) => event.id));
  });

  it("generates a result summary that reflects mood, combos, and delivery choices", () => {
    const summary = generateResultSummary({
      mood: "overtime" as Mood,
      totals: {
        price: 34,
        stats: { joy: 32, health: -9, fullness: 20, energy: 5, safety: 5 }
      },
      combos: [comboRules[0]],
      deliveryScore: { speed: 48, safety: 58, health: 59, integrity: 58, trust: 61 },
      selectedEventTitles: ["封口机临时故障", "饭后久坐预警"],
      selectedEvents: [
        { eventTitle: "封口机临时故障", choiceLabel: "等重新封口", eventType: "foodSafety" },
        { eventTitle: "饭后久坐预警", choiceLabel: "下楼散步取餐", eventType: "healthyLife" }
      ],
      entries: [
        { item: drink, quantity: 1, selectedChoices: { sugar: ["half"], toppings: ["cup"] } },
        { item: snack, quantity: 1, selectedChoices: {} }
      ]
    });

    expect(summary.orderTitle).toBe("工作日精神急救订单");
    expect(summary.persona).toContain("加班续命包");
    expect(summary.shareText).toContain("快乐浓度");
    expect(summary.receiptLines).toContain("订单沟通：封口机临时故障 / 饭后久坐预警");
    expect(summary.receiptLines.join(" / ")).toContain("最终预测");
    expect(summary.foodPersona.code).toHaveLength(4);
    expect(summary.journeyLines.join(" / ")).toContain("今日下单目的");
    expect(summary.receipt.amount).toBe(34);
    expect(summary.receipt.items).toEqual(["厚芋泥波波x1", "盐酥鸡x1"]);
    expect(summary.receipt.choices).toEqual(["等重新封口", "下楼散步取餐"]);
    expect(summary.personaExplanation.evidenceLines.map((line) => line.type)).toEqual(
      expect.arrayContaining(["structure", "restraint", "control", "deal", "result"])
    );
    expect(summary.personaExplanation.evidenceLines.map((line) => line.label)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("商品证据"),
        expect.stringContaining("规格证据"),
        expect.stringContaining("过程证据"),
        expect.stringContaining("优惠证据")
      ])
    );
    expect(summary.personaExplanation.evidenceLines.map((line) => line.text).join(" ")).not.toContain("分数决定");
    expect(summary.foodPersona.evidenceLines.length).toBeGreaterThanOrEqual(5);
    expect(summary.foodPersona.variantReason).toContain(summary.foodPersona.variantTitle);
    expect(summary.foodPersona.avatarKey).toBeTruthy();
    expect(summary.foodPersona.avatarPosition).toEqual(personaAvatarPositions[summary.foodPersona.code]);
    expect(summary.foodPersona.confidenceLabel).toMatch(/证据|样本/);
    expect(summary.foodPersona.rarity.colorLabel).not.toBe("红色");
  });

  it("generates a stable food persona from the same purpose, cart, and choices", () => {
    const input: Parameters<typeof generateFoodPersona>[0] = {
      mood: "overtime" as Mood,
      entries: [
        { item: drink, quantity: 1, selectedChoices: { sugar: ["half"], toppings: ["cup"] } },
        { item: snack, quantity: 1, selectedChoices: {} }
      ],
      combos: [comboRules[0]],
      deliveryScore: { speed: 48, safety: 64, health: 63, integrity: 66, trust: 65 },
      selectedEvents: [
        { eventTitle: "封口机临时故障", choiceLabel: "等重新封口", eventType: "foodSafety" as const },
        { eventTitle: "饭后久坐预警", choiceLabel: "下楼散步取餐", eventType: "healthyLife" as const }
      ],
      finalScores: { joyIndex: 76, healthIndex: 72, safetyIndex: 82 },
      statsWithCombo: { joy: 44, health: 3, fullness: 20, energy: 13, safety: 10 }
    };

    expect(generateFoodPersona(input).code).toBe(generateFoodPersona(input).code);
  });

  it("maps the four persona axes into a 16-type style code", () => {
    const persona = generateFoodPersona({
      mood: "crazy" as Mood,
      entries: [{ item: { ...snack, tags: ["spicy", "fried", "party", "fun"] }, quantity: 2, selectedChoices: {} }],
      combos: [],
      deliveryScore: { speed: 55, safety: 45, health: 42, integrity: 48, trust: 50 },
      selectedEvents: [{ eventTitle: "店家新品试喝", choiceLabel: "标记后尝鲜", eventType: "fun" }],
      finalScores: { joyIndex: 88, healthIndex: 48, safetyIndex: 55 },
      statsWithCombo: { joy: 48, health: -16, fullness: 32, energy: 6, safety: 4 }
    });

    expect(persona.code).toMatch(/^[HN][CE][GR][SL]$/);
    expect(persona.axes).toHaveLength(4);
  });

  it("keeps high-contrast food persona paths distinct", () => {
    const coffee = findMenuItem((item) => item.category === "coffee" && item.tags.includes("caffeine"), "caffeine coffee");
    const lightFood = findMenuItem((item) => item.category === "lightFood" && item.tags.includes("protein"), "protein light food");
    const cheapComboSide = findMenuItem((item) => item.price <= 4 && item.tags.includes("combo"), "cheap combo side");
    const spicyMain = findMenuItem(
      (item) => ["nightFood", "stirFry", "soupPot"].includes(item.category) && item.tags.includes("spicy"),
      "spicy main"
    );
    const friedPartyItem = findMenuItem((item) => item.tags.includes("fried") || item.tags.includes("party") || item.tags.includes("fun"), "party item");
    const sweetDessert = findMenuItem((item) => item.category === "dessert" && (item.tags.includes("sweet") || item.tags.includes("share")), "dessert");
    const healthyFruit = findMenuItem((item) => item.tags.includes("fruit") && item.tags.includes("healthy"), "healthy fruit");

    const checklistDealControl = catalogPersona({
      mood: "overtime",
      entries: [
        catalogEntry(coffee, 1, ["lowSugar", "healthy", "light", "safe", "separatePack"]),
        catalogEntry(lightFood, 1, ["lowSugar", "protein", "healthy", "light"]),
        catalogEntry(cheapComboSide)
      ],
      dealDiscount: 10,
      deliveryScore: { speed: 48, safety: 74, health: 74, integrity: 76, trust: 68 },
      finalScores: { joyIndex: 72, healthIndex: 82, safetyIndex: 88 },
      selectedEvents: [
        {
          eventTitle: "冷热分袋确认",
          choiceLabel: "冷热分袋，慢一点也行",
          eventType: "packaging",
          personaEffect: { control: 8, restraint: 2 },
          badges: ["包装完整主义者"]
        },
        {
          eventTitle: "优惠券诱惑",
          choiceLabel: "加购触发快乐",
          eventType: "fun",
          personaEffect: { deal: 8, structure: 2 },
          badges: ["满减策略家"]
        }
      ]
    });
    const freeLoadedHappy = catalogPersona({
      mood: "celebration",
      entries: [
        catalogEntry(spicyMain, 1, ["spicy", "fullness"]),
        catalogEntry(friedPartyItem, 1, ["fullness", "sweet", "cheese"]),
        catalogEntry(sweetDessert, 1, ["share", "sweet"])
      ],
      deliveryScore: { speed: 60, safety: 45, health: 42, integrity: 45, trust: 50 },
      finalScores: { joyIndex: 92, healthIndex: 45, safetyIndex: 55 },
      selectedEvents: [
        {
          eventTitle: "健康和加料冲突",
          choiceLabel: "正常糖 + 双份芋泥",
          eventType: "fun",
          personaEffect: { restraint: -8, control: -2 },
          badges: ["快乐释放派"]
        },
        {
          eventTitle: "路线颠簸",
          choiceLabel: "相信命运",
          eventType: "packaging",
          personaEffect: { control: -6, restraint: -2 },
          badges: ["随缘接受"]
        }
      ]
    });
    const recipeSelfControl = catalogPersona({
      mood: "afterWorkout",
      entries: [
        catalogEntry(lightFood, 1, ["protein", "lowSugar", "healthy", "light"]),
        catalogEntry(healthyFruit, 1, ["lowSugar", "healthy", "light", "safe"])
      ],
      deliveryScore: { speed: 50, safety: 72, health: 82, integrity: 72, trust: 64 },
      finalScores: { joyIndex: 70, healthIndex: 90, safetyIndex: 82 },
      selectedEvents: [
        {
          eventTitle: "健身后补给",
          choiceLabel: "加蛋白轻食",
          eventType: "healthyLife",
          personaEffect: { restraint: 9, control: 2 },
          badges: ["低糖谈判家"]
        },
        {
          eventTitle: "订单复盘",
          choiceLabel: "记录下次还这么点",
          eventType: "fun",
          personaEffect: { control: 5, deal: -8 },
          badges: ["稳定复购派"]
        }
      ]
    });
    const wildHeavySingle = catalogPersona({
      mood: "hungry",
      entries: [catalogEntry(spicyMain, 1, ["spicy", "fullness"])],
      deliveryScore: { speed: 62, safety: 42, health: 38, integrity: 44, trust: 45 },
      finalScores: { joyIndex: 88, healthIndex: 42, safetyIndex: 52 },
      selectedEvents: [
        {
          eventTitle: "先吃还是先核对",
          choiceLabel: "直接打开，先吃一口",
          eventType: "fun",
          personaEffect: { restraint: -6, control: -6 },
          badges: ["快乐释放派"]
        },
        {
          eventTitle: "优惠券诱惑",
          choiceLabel: "不为券凑单",
          eventType: "fun",
          personaEffect: { deal: -10 },
          badges: ["随心预算"]
        }
      ]
    });

    expect(checklistDealControl.code).toBe("HCGS");
    expect(freeLoadedHappy.code).toBe("HERL");
    expect(recipeSelfControl.code).toBe("NCGL");
    expect(wildHeavySingle.code).toBe("NERL");
  });

  it("keeps sampled persona results from collapsing into only a few common types", () => {
    let seed = 53535;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    const pick = <T,>(items: T[]) => items[Math.floor(random() * items.length)];
    const randomChoices = (item: MenuItem) => {
      const selectedChoices = getDefaultChoices(item);
      item.options?.forEach((group) => {
        selectedChoices[group.id] =
          group.type === "single"
            ? [pick(group.choices).id]
            : group.choices.filter(() => random() < 0.28).map((choice) => choice.id);
      });
      return selectedChoices;
    };
    const eventPool: ResultJourneyEvent[] = [
      { eventTitle: "细致包装", choiceLabel: "分袋核对后再出发", eventType: "packaging", personaEffect: { control: 9, restraint: 2, deal: 1 } },
      { eventTitle: "随缘放行", choiceLabel: "直接接受，快点就行", eventType: "fun", personaEffect: { control: -9, restraint: -3, deal: -2 } },
      { eventTitle: "健康补救", choiceLabel: "无糖饮加饭后散步", eventType: "healthyLife", personaEffect: { restraint: 10, control: 2, deal: -2 } },
      { eventTitle: "优惠券诱惑", choiceLabel: "加购触发满减券", eventType: "fun", personaEffect: { deal: 12, structure: 2, restraint: -2 } },
      { eventTitle: "不为券凑单", choiceLabel: "不为券凑单", eventType: "fun", personaEffect: { deal: -12, control: -1 } },
      { eventTitle: "朋友拼单", choiceLabel: "分享给朋友一起吃", eventType: "fun", personaEffect: { structure: 10, control: -1 } },
      { eventTitle: "单点明确", choiceLabel: "只要这个单点核心", eventType: "fun", personaEffect: { structure: -10, deal: -3 } },
      { eventTitle: "骑手安全", choiceLabel: "安全第一，不急", eventType: "riderSafety", personaEffect: { control: 8, restraint: 2 } },
      { eventTitle: "重口直冲", choiceLabel: "重辣直接开吃", eventType: "fun", personaEffect: { restraint: -10, control: -4 } }
    ];
    const counts: Partial<Record<string, number>> = {};
    const sampleCount = 500;

    for (let index = 0; index < sampleCount; index += 1) {
      const mood = pick(moods).id;
      const itemCount = 1 + Math.floor(random() * 4);
      const usedItemIds = new Set<string>();
      const entries: CartEntry[] = [];

      for (let entryIndex = 0; entryIndex < itemCount; entryIndex += 1) {
        let item = pick(menuItems);
        let guard = 0;
        while (usedItemIds.has(item.id) && guard < 10) {
          item = pick(menuItems);
          guard += 1;
        }
        usedItemIds.add(item.id);
        entries.push({ item, quantity: random() < 0.12 ? 2 : 1, selectedChoices: randomChoices(item) });
      }

      const totals = computeOrderTotals(entries);
      const combos = computeActiveCombos(entries, catalogComboRules, mood);
      const statsWithCombo = applyComboBonuses(totals.stats, combos);
      const selectedEvents = Array.from({ length: 1 + Math.floor(random() * 4) }, () => pick(eventPool));
      const deliveryScore = {
        speed: 40 + Math.floor(random() * 45),
        safety: 40 + Math.floor(random() * 45),
        health: 40 + Math.floor(random() * 45),
        integrity: 40 + Math.floor(random() * 45),
        trust: 40 + Math.floor(random() * 45)
      };
      const dealDiscount =
        random() < 0.45 ? Math.min(16, Math.max(0, Math.round(totals.price * (0.05 + random() * 0.25)))) : 0;
      const persona = generateFoodPersona({
        mood,
        entries,
        combos,
        deliveryScore,
        selectedEvents,
        finalScores: { joyIndex: 60, healthIndex: 60, safetyIndex: 60 },
        statsWithCombo,
        dealDiscount,
        rawPrice: totals.price
      });

      counts[persona.code] = (counts[persona.code] ?? 0) + 1;
    }

    const coveredTypes = Object.keys(counts);
    const largestBucket = Math.max(...Object.values(counts).map((count) => count ?? 0));

    expect(coveredTypes.length).toBeGreaterThanOrEqual(14);
    expect(largestBucket / sampleCount).toBeLessThan(0.4);
    expect(coveredTypes).toEqual(expect.arrayContaining(["NCRS", "NERS", "NERL", "HERL"]));
  });

  it("provides complete copy for all 16 food persona codes", () => {
    expect(Object.keys(foodPersonaTypes).sort()).toEqual([
      "HCGL",
      "HCGS",
      "HCRL",
      "HCRS",
      "HEGL",
      "HEGS",
      "HERL",
      "HERS",
      "NCGL",
      "NCGS",
      "NCRL",
      "NCRS",
      "NEGL",
      "NEGS",
      "NERL",
      "NERS"
    ]);

    Object.values(foodPersonaTypes).forEach((persona) => {
      expect(persona.name).toBeTruthy();
      expect(persona.description.length).toBeGreaterThan(12);
      expect(persona.keywords.length).toBeGreaterThanOrEqual(4);
      expect(persona.nextOrder).toBeTruthy();
    });
    expect(Object.keys(personaAvatarPositions).sort()).toEqual(Object.keys(foodPersonaTypes).sort());
    expect(new Set(Object.values(personaAvatarPositions).map((position) => `${position.x},${position.y}`)).size).toBe(16);
    Object.values(personaAvatarPositions).forEach((position) => {
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThan(4);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThan(4);
    });
  });

  it("adds persona badges from health and safety choices", () => {
    const persona = generateFoodPersona({
      mood: "afterWorkout" as Mood,
      entries: [{ item: drink, quantity: 1, selectedChoices: { sugar: ["half"], toppings: ["cup"] } }],
      combos: [comboRules[1]],
      deliveryScore: { speed: 48, safety: 70, health: 75, integrity: 66, trust: 68 },
      selectedEvents: [
        { eventTitle: "暴雨配送", choiceLabel: "安全第一不催单", eventType: "riderSafety" },
        { eventTitle: "饭后久坐预警", choiceLabel: "下楼散步取餐", eventType: "healthyLife" }
      ],
      finalScores: { joyIndex: 70, healthIndex: 84, safetyIndex: 88 },
      statsWithCombo: { joy: 18, health: 10, fullness: 6, energy: 4, safety: 8 }
    });

    expect(persona.badges).toEqual(expect.arrayContaining(["低糖谈判家", "安心控场", "骑手友好派"]));
  });

  it("explains persona variants from different decision evidence", () => {
    const sharedInput: Omit<Parameters<typeof generateFoodPersona>[0], "selectedEvents"> = {
      mood: "overtime" as Mood,
      entries: [
        { item: drink, quantity: 1, selectedChoices: { sugar: ["half"], toppings: ["cup"] } },
        { item: snack, quantity: 1, selectedChoices: {} }
      ] satisfies CartEntry[],
      combos: [comboRules[0]],
      deliveryScore: { speed: 48, safety: 64, health: 63, integrity: 66, trust: 65 },
      finalScores: { joyIndex: 76, healthIndex: 72, safetyIndex: 82 },
      statsWithCombo: { joy: 44, health: 3, fullness: 20, energy: 13, safety: 10 }
    };

    const careful = generateFoodPersona({
      ...sharedInput,
      selectedEvents: [
        {
          eventTitle: "冷热要不要分袋",
          choiceLabel: "冷热分袋，慢一点也行",
          eventType: "packaging" as const,
          badges: ["包装完整主义者"],
          personaEffect: { control: 8, restraint: 2 }
        }
      ]
    });
    const friendly = generateFoodPersona({
      ...sharedInput,
      selectedEvents: [
        {
          eventTitle: "预计晚到四分钟",
          choiceLabel: "安全第一不催单",
          eventType: "riderSafety" as const,
          badges: ["骑手友好派"],
          personaEffect: { control: 6, restraint: 2 }
        }
      ]
    });

    expect(careful.variantTitle).not.toBe(friendly.variantTitle);
    expect(careful.variantReason).toContain("冷热分袋");
    expect(friendly.variantReason).toContain("安全第一");
  });

  it("builds an item persona profile for every menu item", () => {
    expect(missingItemPersonaProfileIds).toEqual([]);
    expect(Object.keys(itemPersonaProfiles)).toHaveLength(menuItems.length);
    menuItems.forEach((item) => {
      expect(itemPersonaProfiles[item.id].reason).toContain(item.name);
      expect(itemPersonaProfiles[item.id].evidenceTags.length).toBeGreaterThan(0);
    });
  });
});
