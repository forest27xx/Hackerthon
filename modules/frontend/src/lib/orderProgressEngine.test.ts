import { describe, expect, it } from "vitest";
import type { CartEntry, MenuItem } from "../types";
import {
  buildOrderContext,
  createInitialOrderProgressScore,
  createOrderProgressGame,
  getEligibleOrderProgressEvents,
  getOrderProgressPhaseCounts,
  initialOrderProgressScore,
  orderProgressEventBank,
  resolveOrderProgressEvent,
  selectOrderProgressEvents,
  toOrderJourneyEvents
} from "./orderProgressEngine";

const milkTea: MenuItem = {
  id: "milk-tea",
  name: "Pearl Milk Tea",
  category: "milkTea",
  price: 18,
  description: "drink",
  imageKey: "milk-tea",
  tags: ["sweet", "chewy"],
  stats: { joy: 16, health: -3, fullness: 5, energy: 3, safety: 2 },
  options: [
    {
      id: "sugar",
      name: "Sugar",
      type: "single",
      choices: [
        { id: "half", label: "Half", tags: ["lowSugar"], statDelta: { health: 3 } },
        { id: "full", label: "Full", tags: ["sweet"], statDelta: { joy: 3, health: -3 } }
      ]
    },
    {
      id: "toppings",
      name: "Toppings",
      type: "multi",
      choices: [{ id: "boba", label: "Boba", tags: ["chewy"], priceDelta: 2, statDelta: { joy: 3 } }]
    }
  ]
};

const coffee: MenuItem = {
  id: "coffee",
  name: "Iced Coffee",
  category: "coffee",
  price: 22,
  description: "coffee",
  imageKey: "coffee",
  tags: ["caffeine", "refresh"],
  stats: { joy: 10, health: 0, fullness: 1, energy: 14, safety: 2 }
};

const hotMeal: MenuItem = {
  id: "hot-meal",
  name: "Hot Soup Noodles",
  category: "nightFood",
  price: 32,
  description: "hot food",
  imageKey: "hot-meal",
  tags: ["warm", "soup", "comfort"],
  stats: { joy: 14, health: -2, fullness: 16, energy: 2, safety: 1 }
};

const friedSnack: MenuItem = {
  id: "fried-snack",
  name: "Fried Snack",
  category: "snack",
  price: 16,
  description: "fried",
  imageKey: "fried-snack",
  tags: ["fried", "comfort"],
  stats: { joy: 12, health: -5, fullness: 9, energy: 1, safety: 1 }
};

const dessert: MenuItem = {
  id: "dessert",
  name: "Photo Dessert",
  category: "dessert",
  price: 24,
  description: "dessert",
  imageKey: "dessert",
  tags: ["sweet", "share"],
  stats: { joy: 12, health: -2, fullness: 4, energy: 1, safety: 2 }
};

const lightFood: MenuItem = {
  id: "light-food",
  name: "Protein Bowl",
  category: "lightFood",
  price: 28,
  description: "light food",
  imageKey: "light-food",
  tags: ["protein", "healthyNote"],
  stats: { joy: 8, health: 10, fullness: 12, energy: 4, safety: 3 }
};

const activity: MenuItem = {
  id: "activity",
  name: "Movie Ticket",
  category: "activity",
  price: 18,
  description: "activity",
  imageKey: "activity",
  tags: ["safe", "ticket"],
  stats: { joy: 16, health: 0, fullness: 0, energy: 2, safety: 5 }
};

const entry = (item: MenuItem, quantity = 1, selectedChoices: CartEntry["selectedChoices"] = {}): CartEntry => ({
  item,
  quantity,
  selectedChoices
});

const personaAxisKeys = ["structure", "restraint", "control", "deal"];
const legacyPersonaAxisKeys = ["driver", "scene", "discipline", "novelty"];

describe("orderProgressEngine", () => {
  it("keeps the expanded local event bank at the planned scale", () => {
    const counts = orderProgressEventBank.reduce<Record<string, number>>((acc, event) => {
      acc[event.phase] = (acc[event.phase] ?? 0) + 1;
      return acc;
    }, {});

    expect(orderProgressEventBank).toHaveLength(100);
    expect(counts).toMatchObject({ merchant: 44, rider: 40, arrival: 16 });
  });

  it("keeps enough eligible event variety at each fixed node", () => {
    const context = buildOrderContext(
      [
        entry(milkTea, 2, { sugar: ["half"], toppings: ["boba"] }),
        entry(coffee),
        entry(hotMeal),
        entry({ ...friedSnack, tags: [...friedSnack.tags, "share"] }),
        entry(dessert),
        entry(lightFood),
        entry(activity)
      ],
      "overtime"
    );

    const minimums: Record<string, number> = {
      "merchant-accepted": 6,
      "merchant-spec": 12,
      "merchant-stock": 14,
      "merchant-package": 12,
      "rider-pickup": 8,
      "rider-road": 16,
      "rider-arrival": 16,
      "arrival-check": 16
    };

    Object.entries(minimums).forEach(([nodeId, minimum]) => {
      expect(getEligibleOrderProgressEvents(context, nodeId).length).toBeGreaterThanOrEqual(minimum);
    });
  });

  it("gives every event choice scoring and persona evidence", () => {
    orderProgressEventBank.forEach((event) => {
      event.choices.forEach((choice) => {
        expect(Object.keys(choice.effect).length).toBeGreaterThan(0);
        expect(choice.personaEffect).toBeTruthy();
        expect(Object.keys(choice.personaEffect ?? {}).length).toBeGreaterThan(0);
        expect(Object.keys(choice.personaEffect ?? {}).every((key) => personaAxisKeys.includes(key))).toBe(true);
        expect(Object.keys(choice.personaEffect ?? {}).some((key) => legacyPersonaAxisKeys.includes(key))).toBe(false);
        expect(choice.badges?.length).toBeGreaterThan(0);
      });
    });
  });

  it("filters milk tea events by the actual order context", () => {
    const teaContext = buildOrderContext([entry(milkTea, 1, { sugar: ["half"], toppings: ["boba"] })], "overtime");
    const teaSpecEvents = getEligibleOrderProgressEvents(teaContext, "merchant-spec");
    const teaStockEvents = getEligibleOrderProgressEvents(teaContext, "merchant-stock");

    expect(teaContext.flags.hasMilkTea).toBe(true);
    expect(teaContext.flags.hasBoba).toBe(true);
    expect(teaSpecEvents.map((event) => event.id)).toEqual(expect.arrayContaining(["m-spec-sugar", "m-spec-ice"]));
    expect(teaStockEvents.map((event) => event.id)).toContain("m-stock-boba");

    const foodContext = buildOrderContext([entry(friedSnack)], "hungry");
    const foodSpecEvents = getEligibleOrderProgressEvents(foodContext, "merchant-spec");
    const foodStockEvents = getEligibleOrderProgressEvents(foodContext, "merchant-stock");

    expect(foodContext.flags.hasMilkTea).toBe(false);
    expect(foodSpecEvents.map((event) => event.id)).not.toEqual(expect.arrayContaining(["m-spec-sugar", "m-spec-ice"]));
    expect(foodStockEvents.map((event) => event.id)).not.toContain("m-stock-boba");
  });

  it("does not draw hot-food packaging problems for drink-only orders", () => {
    const drinkOnly = buildOrderContext([entry(coffee), entry(milkTea)], "slacking");
    const packageEvents = getEligibleOrderProgressEvents(drinkOnly, "merchant-package");
    const riderRoadEvents = getEligibleOrderProgressEvents(drinkOnly, "rider-road");

    expect(drinkOnly.flags.hasDrink).toBe(true);
    expect(drinkOnly.flags.hasFood).toBe(false);
    expect(drinkOnly.flags.hasMixedTemperature).toBe(false);
    expect(packageEvents.map((event) => event.id)).not.toEqual(expect.arrayContaining(["m-pack-hotcold", "m-pack-soup", "m-pack-fried"]));
    expect(riderRoadEvents.map((event) => event.id)).not.toEqual(expect.arrayContaining(["r-status-hot", "r-status-tilt"]));
  });

  it("unlocks cold-hot split events only for mixed temperature orders", () => {
    const mixed = buildOrderContext([entry(milkTea), entry(hotMeal)], "overtime");
    const packageEvents = getEligibleOrderProgressEvents(mixed, "merchant-package");
    const riderRoadEvents = getEligibleOrderProgressEvents(mixed, "rider-road");

    expect(mixed.flags.hasMixedTemperature).toBe(true);
    expect(packageEvents.map((event) => event.id)).toContain("m-pack-hotcold");
    expect(riderRoadEvents.map((event) => event.id)).toContain("r-status-tilt");
  });

  it("derives the initial process state from a 70 baseline and order risk", () => {
    expect(initialOrderProgressScore).toEqual({ speed: 70, safety: 70, health: 70, integrity: 70, trust: 70 });

    const ordinary = createInitialOrderProgressScore(buildOrderContext([entry(coffee)], "slacking"));
    const risky = createInitialOrderProgressScore(buildOrderContext([entry(milkTea), entry(hotMeal), entry(friedSnack)], "lateNight"));

    expect(ordinary.integrity).toBeGreaterThan(risky.integrity);
    expect(ordinary.safety).toBeGreaterThan(risky.safety);
    expect(risky.health).toBeLessThan(70);
  });

  it("raises integrity and safety when packaging control is selected", () => {
    const packableTea: MenuItem = {
      ...milkTea,
      options: [
        ...(milkTea.options ?? []),
        {
          id: "package",
          name: "Package",
          type: "multi",
          choices: [
            { id: "cupHolder", label: "Cup holder", tags: ["safe"], statDelta: { safety: 3 } },
            { id: "separate", label: "Separate pack", tags: ["separatePack"], statDelta: { safety: 4 } }
          ]
        }
      ]
    };

    const loose = createInitialOrderProgressScore(buildOrderContext([entry(milkTea), entry(hotMeal)], "overtime"));
    const packed = createInitialOrderProgressScore(
      buildOrderContext([entry(packableTea, 1, { package: ["cupHolder", "separate"] }), entry(hotMeal)], "overtime")
    );

    expect(packed.integrity).toBeGreaterThan(loose.integrity);
    expect(packed.safety).toBeGreaterThan(loose.safety);
  });

  it("selects a stable 4/3/1 event sequence for the same order and seed", () => {
    const context = buildOrderContext([entry(milkTea), entry(hotMeal)], "overtime");
    const first = selectOrderProgressEvents(context, "stable-seed").map((event) => event.id);
    const second = selectOrderProgressEvents(context, "stable-seed").map((event) => event.id);
    const game = createOrderProgressGame({ entries: [entry(milkTea), entry(hotMeal)], mood: "overtime", seed: "stable-seed" });

    expect(first).toEqual(second);
    expect(first).toHaveLength(8);
    expect(getOrderProgressPhaseCounts(game)).toEqual({ merchant: 4, rider: 3, arrival: 1 });
  });

  it("applies choice effects, persona effects, badges, and creates an outcome after 8 nodes", () => {
    let game = createOrderProgressGame({
      entries: [entry(milkTea, 1, { sugar: ["half"], toppings: ["boba"] }), entry(hotMeal)],
      mood: "overtime",
      seed: "resolve-seed"
    });

    while (game.currentEvent) {
      game = resolveOrderProgressEvent(game, [game.currentEvent.choices[0].id]);
    }

    const journeyEvents = toOrderJourneyEvents(game);

    expect(game.completed).toBe(true);
    expect(game.resolvedEvents).toHaveLength(8);
    expect(game.score).not.toEqual(initialOrderProgressScore);
    expect(game.outcome?.rating).toBeTruthy();
    expect(journeyEvents).toHaveLength(8);
    expect(journeyEvents.some((event) => event.personaEffect && Object.keys(event.personaEffect).length > 0)).toBe(true);
    expect(journeyEvents.some((event) => event.badges && event.badges.length > 0)).toBe(true);
  });
});
