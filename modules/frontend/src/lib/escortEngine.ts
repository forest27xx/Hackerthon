import {
  diceConfigs,
  escortBaseTiles,
  escortBoardArt,
  escortEventBank,
  escortRoute,
  escortScenes,
  merchantSlotIds
} from "../data/escortBoard";
import type {
  CartEntry,
  Category,
  DiceMode,
  EscortEvent,
  EscortGameState,
  EscortOutcome,
  EscortPickupStop,
  EscortResolvedEvent,
  EscortScene,
  EscortTile,
  EscortTileType,
  Mood,
  DeliveryScore
} from "../types";

export const initialEscortScore: DeliveryScore = {
  speed: 72,
  safety: 72,
  health: 68,
  integrity: 76,
  trust: 70
};

const categoryShopGroups: { id: string; name: string; categories: Category[] }[] = [
  { id: "drink-shop", name: "奶茶咖啡店", categories: ["milkTea", "coffee"] },
  { id: "hot-food-shop", name: "热食小吃店", categories: ["snack", "nightFood", "lightFood"] },
  { id: "dessert-shop", name: "甜品店", categories: ["dessert"] },
  { id: "activity-shop", name: "玩乐补给站", categories: ["activity"] }
];

const destinationByMood: Record<Mood, string> = {
  tired: "家",
  hungry: "家",
  emo: "家",
  overtime: "公司",
  slacking: "公司",
  celebration: "朋友据点",
  date: "商场门口",
  crazy: "快乐据点",
  afterWorkout: "健身房",
  lateNight: "家"
};

const tileTypeEventLabels: Record<EscortTileType, string> = {
  start: "起点",
  merchant: "商家取货",
  packaging: "包装配装",
  road: "路况挑战",
  healthQuiz: "健康题",
  foodSafetyQuiz: "食安题",
  riderSafety: "骑手安全",
  note: "备注博弈",
  tool: "道具格",
  reward: "奖励格",
  fork: "岔路格",
  incident: "事故格",
  destination: "终点"
};

const tileTypeSceneKind: Record<EscortTileType, EscortScene["kind"]> = {
  start: "start",
  merchant: "merchant",
  packaging: "packaging",
  road: "road",
  healthQuiz: "quiz",
  foodSafetyQuiz: "quiz",
  riderSafety: "rider",
  note: "note",
  tool: "tool",
  reward: "reward",
  fork: "fork",
  incident: "incident",
  destination: "destination"
};

const clampScore = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const applyScoreEffect = (score: DeliveryScore, effect: Partial<DeliveryScore>): DeliveryScore => ({
  speed: clampScore(score.speed + (effect.speed ?? 0)),
  safety: clampScore(score.safety + (effect.safety ?? 0)),
  health: clampScore(score.health + (effect.health ?? 0)),
  integrity: clampScore(score.integrity + (effect.integrity ?? 0)),
  trust: clampScore(score.trust + (effect.trust ?? 0))
});

const mergeEffects = (effects: Partial<DeliveryScore>[]): Partial<DeliveryScore> =>
  effects.reduce<Partial<DeliveryScore>>(
    (merged, effect) => ({
      speed: (merged.speed ?? 0) + (effect.speed ?? 0),
      safety: (merged.safety ?? 0) + (effect.safety ?? 0),
      health: (merged.health ?? 0) + (effect.health ?? 0),
      integrity: (merged.integrity ?? 0) + (effect.integrity ?? 0),
      trust: (merged.trust ?? 0) + (effect.trust ?? 0)
    }),
    {}
  );

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

export const createEscortSeed = (mood: Mood, entries: CartEntry[]) =>
  `escort-${mood}-${entries.map((entry) => `${entry.item.category}:${entry.item.id}:${entry.quantity}`).join("|") || "empty"}`;

export const rollEscortDice = (mode: DiceMode, random: () => number = Math.random) => {
  const config = diceConfigs.find((item) => item.id === mode) ?? diceConfigs[1];
  const [min, max] = config.range;
  return min + Math.floor(random() * (max - min + 1));
};

const getDestinationName = (mood: Mood) => destinationByMood[mood] ?? "家";

const buildPickupStops = (entries: CartEntry[]): EscortPickupStop[] => {
  const categoriesInCart = new Set(entries.map((entry) => entry.item.category));
  const selectedGroups = categoryShopGroups.filter((group) => group.categories.some((category) => categoriesInCart.has(category))).slice(0, 3);
  const fallbackGroups = selectedGroups.length > 0 ? selectedGroups : [categoryShopGroups[0]];

  return fallbackGroups.map((group, index) => ({
    id: group.id,
    name: group.name,
    categories: group.categories,
    tileId: merchantSlotIds[index],
    completed: false
  }));
};

const buildTiles = (pickups: EscortPickupStop[], destinationName: string): EscortTile[] =>
  escortBaseTiles.map((tile) => {
    if (tile.id === "destination") {
      return { ...tile, label: `目的地：${destinationName}`, eventHint: "取齐后整单送达" };
    }

    const merchantIndex = merchantSlotIds.findIndex((slotId) => slotId === tile.id);
    if (merchantIndex >= 0) {
      const pickup = pickups[merchantIndex];
      if (pickup) {
        return { ...tile, label: pickup.name, shortLabel: "取", pickupId: pickup.id, eventHint: `去${pickup.name}取货` };
      }
      return { ...tile, type: "reward", label: "街角补给", shortLabel: "奖", eventHint: "随机获得小奖励" };
    }

    return tile;
  });

const getMainTileByIndex = (state: EscortGameState, routeIndex: number) => {
  const tileId = state.route.mainTileIds[routeIndex];
  return state.tiles.find((tile) => tile.id === tileId);
};

const getRouteLength = (state: EscortGameState) => state.route.mainTileIds.length;

const getSceneForTile = (tile: EscortTile): EscortScene => {
  const baseScene = (tile.sceneId && escortScenes[tile.sceneId]) || escortScenes["scene-road"];
  const sceneKind = tileTypeSceneKind[tile.type];
  return {
    ...baseScene,
    kind: sceneKind,
    title: tile.type === "destination" ? "终点验货台" : baseScene.title,
    subtitle: `${tile.label} · ${tile.eventHint ?? baseScene.subtitle}`
  };
};

const getEventForTile = (state: EscortGameState, tile: EscortTile): EscortEvent | undefined => {
  if (tile.type === "start") return undefined;

  const candidates = escortEventBank.filter((event) => event.tileType === tile.type);
  if (candidates.length === 0) return undefined;

  const random = seededRandom(`${state.seed}-${tile.id}-${state.triggeredEvents.length}-${state.lastRoll ?? 0}`);
  return candidates[Math.floor(random() * candidates.length)];
};

const markPickupIfNeeded = (state: EscortGameState, tile: EscortTile) => {
  if (!tile.pickupId) return state.pickups;

  return state.pickups.map((pickup) => (pickup.id === tile.pickupId ? { ...pickup, completed: true } : pickup));
};

const allPickedUp = (pickups: EscortPickupStop[]) => pickups.every((pickup) => pickup.completed);

const nextUncollectedPickupIndex = (state: EscortGameState, fromIndex: number, toIndex: number) => {
  for (let index = fromIndex + 1; index <= toIndex; index += 1) {
    const tile = getMainTileByIndex(state, index);
    if (tile?.pickupId && state.pickups.some((pickup) => pickup.id === tile.pickupId && !pickup.completed)) {
      return index;
    }
  }
  return -1;
};

const buildMovePath = (fromIndex: number, toIndex: number) => {
  const path: number[] = [];
  for (let index = fromIndex + 1; index <= toIndex; index += 1) {
    path.push(index);
  }
  return path;
};

const diceModeEffect = (mode: DiceMode, roll: number, outOfEnergy: boolean): Partial<DeliveryScore> => {
  const base =
    mode === "steady"
      ? { speed: -1, safety: 2, integrity: 2, trust: 1 }
      : mode === "speedy"
        ? { speed: 3, safety: roll >= 5 ? -4 : -2, integrity: roll >= 5 ? -4 : -1 }
        : { speed: 1 };

  if (!outOfEnergy) return base;
  return mergeEffects([base, { speed: -3, safety: -4, integrity: -4, trust: -3 }]);
};

const buildOutcome = (state: EscortGameState): EscortOutcome => {
  const { score } = state;
  const stability = Math.round((score.safety + score.integrity + score.trust + score.health) / 4);
  const achievements = new Set<string>();

  if (score.integrity >= 82 || state.tools.some((tool) => tool.includes("袋") || tool.includes("托") || tool.includes("贴"))) {
    achievements.add("包装达人");
  }
  if (score.safety >= 82 || score.trust >= 82) achievements.add("守护骑手");
  if (score.health >= 78 || state.triggeredEvents.some((event) => event.eventType === "healthyLife" && (event.effect.health ?? 0) > 0)) {
    achievements.add("低糖谈判家");
  }
  if (state.pickups.length >= 3 && allPickedUp(state.pickups)) achievements.add("多店协调员");
  if (score.speed >= 78 && state.actionPoints >= 4) achievements.add("路线规划师");
  if (state.triggeredEvents.some((event) => event.tileType === "foodSafetyQuiz" && (event.effect.safety ?? 0) > 0)) {
    achievements.add("食安答题王");
  }

  let rating: EscortOutcome["rating"] = "C";
  let title = "快乐还在，但路上有点翻车";
  if (score.safety >= 88 && score.integrity >= 86 && score.trust >= 84) {
    rating = "隐藏";
    title = "金牌护送员";
    achievements.add("金牌护送员");
  } else if (stability >= 82) {
    rating = "S";
    title = "完美护送";
  } else if (stability >= 70) {
    rating = "A";
    title = "稳定送达";
  } else if (stability >= 58) {
    rating = "B";
    title = "有惊无险";
  }

  const routeLine = `${state.pickups.map((pickup) => pickup.name).join(" -> ")} -> ${state.destinationName}`;
  const pickupLine = `已取 ${state.pickups.filter((pickup) => pickup.completed).length}/${state.pickups.length} 家`;
  const eventLine =
    state.triggeredEvents.length > 0
      ? state.triggeredEvents
          .slice(-4)
          .map((event) => `${event.eventTitle}：${event.choiceLabel}`)
          .join(" / ")
      : "一路顺风，无额外事件";

  return {
    rating,
    title,
    routeLine,
    pickupLine,
    achievements: Array.from(achievements).slice(0, 6),
    finalScore: score,
    turnsTaken: state.turnsTaken,
    routeSummary: state.pickups.map((pickup) => `${pickup.completed ? "已取" : "未取"} · ${pickup.name}`).concat([`送达 · ${state.destinationName}`]),
    sceneSummary: state.triggeredEvents.slice(-5).map((event) => `${event.sceneTitle ?? event.eventTitle}：${event.choiceLabel}`),
    summaryLines: [`护送路线：${routeLine}`, `护送评级：${rating} · ${title}`, `取货进度：${pickupLine}`, `关键事件：${eventLine}`]
  };
};

export const createEscortGame = ({ entries, mood, seed = createEscortSeed(mood, entries) }: { entries: CartEntry[]; mood: Mood; seed?: string }): EscortGameState => {
  const destinationName = getDestinationName(mood);
  const pickups = buildPickupStops(entries);
  const tiles = buildTiles(pickups, destinationName);

  return {
    seed,
    view: "board",
    boardArt: escortBoardArt,
    route: escortRoute,
    positionIndex: 0,
    tiles,
    pickups,
    destinationName,
    diceMode: "normal",
    actionPoints: 12 + pickups.length,
    turnsTaken: 0,
    score: { ...initialEscortScore },
    tools: [],
    triggeredEvents: [],
    branchChoices: [],
    completed: false
  };
};

export const advanceEscortGame = (state: EscortGameState, mode: DiceMode, roll = rollEscortDice(mode)): EscortGameState => {
  if (state.completed || state.currentEvent || state.view === "scene") return state;

  const outOfEnergy = state.actionPoints <= 0;
  const maxIndex = getRouteLength(state) - 1;
  const plannedTarget = Math.min(maxIndex, state.positionIndex + roll);
  const pickupStopIndex = nextUncollectedPickupIndex(state, state.positionIndex, plannedTarget);
  const targetIndex = pickupStopIndex >= 0 ? pickupStopIndex : plannedTarget;
  const targetTile = getMainTileByIndex(state, targetIndex) ?? state.tiles[targetIndex];
  const scoreAfterDice = applyScoreEffect(state.score, diceModeEffect(mode, roll, outOfEnergy));
  const pickupsAfterMove = markPickupIfNeeded(state, targetTile);
  const lastMovePath = buildMovePath(state.positionIndex, targetIndex);
  const baseState: EscortGameState = {
    ...state,
    view: "board",
    positionIndex: targetIndex,
    diceMode: mode,
    lastRoll: roll,
    lastMovePath,
    actionPoints: Math.max(0, state.actionPoints - 1),
    turnsTaken: state.turnsTaken + 1,
    score: scoreAfterDice,
    pickups: pickupsAfterMove
  };

  const event = getEventForTile(baseState, targetTile);
  const currentScene = getSceneForTile(targetTile);

  if (targetTile.type === "destination" && allPickedUp(pickupsAfterMove)) {
    return { ...baseState, view: "scene", currentScene, currentEvent: event };
  }

  return event ? { ...baseState, view: "scene", currentScene, currentEvent: event } : baseState;
};

export const resolveEscortEvent = (state: EscortGameState, selectedOptionIds: string[]): EscortGameState => {
  if (!state.currentEvent) return state;

  const event = state.currentEvent;
  const selectedOptions = event.options.filter((option) => selectedOptionIds.includes(option.id));
  const safeOptions = selectedOptions.length > 0 ? selectedOptions : [event.options[0]];
  const effect = mergeEffects(safeOptions.map((option) => option.effect));
  const score = applyScoreEffect(state.score, effect);
  const toolLabels = safeOptions.flatMap((option) => option.tools ?? []);
  const resolvedEvent: EscortResolvedEvent = {
    id: event.id,
    eventTitle: event.title,
    choiceLabel: safeOptions.map((option) => option.label).join(" + "),
    eventType: event.eventType,
    tileType: event.tileType,
    effect,
    tileLabel: state.tiles.find((tile) => tile.routeIndex === state.positionIndex)?.label,
    sceneTitle: state.currentScene?.title
  };
  const branchChoices =
    event.tileType === "fork" ? Array.from(new Set([...state.branchChoices, ...safeOptions.map((option) => option.label)])) : state.branchChoices;
  const nextState: EscortGameState = {
    ...state,
    view: "board",
    score,
    tools: Array.from(new Set([...state.tools, ...toolLabels])),
    triggeredEvents: [...state.triggeredEvents, resolvedEvent],
    branchChoices,
    currentScene: undefined,
    currentEvent: undefined
  };

  const currentTile = getMainTileByIndex(nextState, nextState.positionIndex);
  if (currentTile?.type === "destination" && allPickedUp(nextState.pickups)) {
    const completedState = { ...nextState, view: "outcome" as const, completed: true };
    return { ...completedState, outcome: buildOutcome(completedState) };
  }

  return nextState;
};

export const getNextTilePreview = (state: EscortGameState) => {
  const nextTile = getMainTileByIndex(state, Math.min(getRouteLength(state) - 1, state.positionIndex + 1)) ?? state.tiles[0];
  return {
    tile: nextTile,
    label: tileTypeEventLabels[nextTile.type],
    hint: nextTile.eventHint ?? "继续前进"
  };
};

export const forceCompleteEscortGame = (state: EscortGameState): EscortGameState => {
  const completedState = {
    ...state,
    view: "outcome" as const,
    pickups: state.pickups.map((pickup) => ({ ...pickup, completed: true })),
    positionIndex: getRouteLength(state) - 1,
    currentScene: undefined,
    currentEvent: undefined,
    completed: true
  };
  return { ...completedState, outcome: buildOutcome(completedState) };
};
