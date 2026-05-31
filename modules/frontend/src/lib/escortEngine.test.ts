import { describe, expect, it } from "vitest";
import type { CartEntry, MenuItem } from "../types";
import {
  advanceEscortGame,
  createEscortGame,
  forceCompleteEscortGame,
  resolveEscortEvent,
  rollEscortDice
} from "./escortEngine";

const makeItem = (id: string, category: MenuItem["category"]): MenuItem => ({
  id,
  name: id,
  category,
  price: 12,
  description: "测试商品",
  tags: [],
  stats: { joy: 4, health: 1, fullness: 2, energy: 1, safety: 1 }
});

const entries: CartEntry[] = [
  { item: makeItem("珍珠奶茶", "milkTea"), quantity: 1, selectedChoices: {} },
  { item: makeItem("热汤面", "nightFood"), quantity: 1, selectedChoices: {} },
  { item: makeItem("小蛋糕", "dessert"), quantity: 1, selectedChoices: {} }
];

describe("escortEngine", () => {
  it("creates a fixed illustrated board with 36 main tiles and branch tiles", () => {
    const game = createEscortGame({ entries, mood: "overtime" });
    const mainTiles = game.tiles.filter((tile) => !tile.isBranch);
    const branchTiles = game.tiles.filter((tile) => tile.isBranch);
    const coordinateKeys = game.tiles.map((tile) => `${tile.x}:${tile.y}`);

    expect(game.view).toBe("board");
    expect(game.boardArt).toMatchObject({ width: 900, height: 900, theme: "晴天美食街" });
    expect(game.route.mainTileIds).toHaveLength(36);
    expect(mainTiles).toHaveLength(36);
    expect(branchTiles).toHaveLength(6);
    expect(new Set(coordinateKeys).size).toBe(game.tiles.length);
    expect(Math.max(...game.tiles.map((tile) => tile.x))).toBeGreaterThan(100);
  });

  it("lays out the main path as a clear 6x6 snake board", () => {
    const game = createEscortGame({ entries, mood: "overtime" });
    const mainTiles = game.route.mainTileIds.map((id) => game.tiles.find((tile) => tile.id === id)!);
    const rows = Array.from({ length: 6 }, (_, rowIndex) => mainTiles.slice(rowIndex * 6, rowIndex * 6 + 6));

    expect(mainTiles[0]).toMatchObject({ id: "start", x: 105, y: 780 });
    expect(mainTiles[35]).toMatchObject({ id: "destination", x: 105, y: 105 });
    expect(rows.every((row) => new Set(row.map((tile) => tile.y)).size === 1)).toBe(true);
    expect(rows.map((row) => row[0].y)).toEqual([780, 645, 510, 375, 240, 105]);
    expect(rows[0].map((tile) => tile.x)).toEqual([105, 243, 381, 519, 657, 795]);
    expect(rows[1].map((tile) => tile.x)).toEqual([795, 657, 519, 381, 243, 105]);
  });

  it("returns a visible step path when dice movement advances across tiles", () => {
    const game = createEscortGame({ entries, mood: "overtime", seed: "step-path" });
    const moved = advanceEscortGame(game, "normal", 3);

    expect(moved.positionIndex).toBe(3);
    expect(moved.lastMovePath).toEqual([1, 2, 3]);
    expect(moved.turnsTaken).toBe(1);
    expect(moved.view).toBe("scene");
    expect(moved.currentScene?.kind).toBe("fork");
  });

  it("resolves a landing scene and returns to the board", () => {
    const game = createEscortGame({ entries, mood: "date", seed: "scene-return" });
    const landed = advanceEscortGame(game, "steady", 1);

    expect(landed.view).toBe("scene");
    expect(landed.currentEvent?.mode).toBe("packaging");

    const selectedIds = landed.currentEvent?.options.slice(0, 2).map((option) => option.id) ?? [];
    const resolved = resolveEscortEvent(landed, selectedIds);

    expect(resolved.view).toBe("board");
    expect(resolved.currentScene).toBeUndefined();
    expect(resolved.currentEvent).toBeUndefined();
    expect(resolved.triggeredEvents).toHaveLength(1);
  });

  it("generates a stable pickup route from the same cart and purpose", () => {
    const first = createEscortGame({ entries, mood: "overtime" });
    const second = createEscortGame({ entries, mood: "overtime" });

    expect(first.destinationName).toBe("公司");
    expect(first.pickups.map((pickup) => pickup.name)).toEqual(["奶茶咖啡店", "热食小吃店", "甜品店"]);
    expect(first.tiles.map((tile) => `${tile.id}:${tile.label}`)).toEqual(second.tiles.map((tile) => `${tile.id}:${tile.label}`));
  });

  it("rolls the three dice modes within their configured ranges", () => {
    expect(rollEscortDice("steady", () => 0)).toBe(1);
    expect(rollEscortDice("steady", () => 0.99)).toBe(3);
    expect(rollEscortDice("normal", () => 0)).toBe(1);
    expect(rollEscortDice("normal", () => 0.99)).toBe(6);
    expect(rollEscortDice("speedy", () => 0)).toBe(2);
    expect(rollEscortDice("speedy", () => 0.99)).toBe(6);
  });

  it("auto-stops on merchant tiles and updates pickup progress", () => {
    const game = createEscortGame({ entries, mood: "overtime", seed: "merchant-stop" });
    const moved = advanceEscortGame(game, "normal", 6);

    expect(moved.tiles[moved.positionIndex].id).toBe("shop-a");
    expect(moved.pickups[0].completed).toBe(true);
    expect(moved.currentEvent?.tileType).toBe("merchant");
  });

  it("applies packaging or quiz event choices to scores and history", () => {
    const game = createEscortGame({ entries, mood: "date", seed: "packaging-event" });
    const landed = advanceEscortGame(game, "steady", 1);
    const event = landed.currentEvent;

    expect(event?.tileType).toBe("packaging");
    const selectedIds = event?.options.slice(0, 2).map((option) => option.id) ?? [];
    const resolved = resolveEscortEvent(landed, selectedIds);

    expect(resolved.currentEvent).toBeUndefined();
    expect(resolved.triggeredEvents).toHaveLength(1);
    expect(resolved.score.integrity).toBeGreaterThan(game.score.integrity);
  });

  it("calculates a stable escort outcome and hidden rating for excellent scores", () => {
    const game = createEscortGame({ entries, mood: "date", seed: "rating" });
    const completed = forceCompleteEscortGame({
      ...game,
      score: { speed: 82, safety: 91, health: 84, integrity: 89, trust: 88 },
      tools: ["冷热分袋", "加固杯托"]
    });

    expect(completed.completed).toBe(true);
    expect(completed.outcome?.rating).toBe("隐藏");
    expect(completed.outcome?.achievements).toEqual(expect.arrayContaining(["金牌护送员", "包装达人", "守护骑手"]));
  });
});
