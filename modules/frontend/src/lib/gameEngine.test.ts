import { describe, expect, it } from "vitest";
import {
  applyEventChoice,
  computeActiveCombos,
  computeOrderTotals,
  generateFoodPersona,
  generateResultSummary,
  pickDeliveryEvents
} from "./gameEngine";
import { foodPersonaTypes, personaAvatarPositions } from "../data/foodPersonas";
import { itemPersonaProfiles, missingItemPersonaProfileIds } from "../data/itemPersonaProfiles";
import { menuItems } from "../data/catalog";
import type { CartEntry, ComboRule, DeliveryEvent, MenuItem, Mood } from "../types";

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
