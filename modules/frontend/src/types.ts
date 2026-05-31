export type Category =
  | "milkTea"
  | "coffee"
  | "dessert"
  | "snack"
  | "nightFood"
  | "lightFood"
  | "activity"
  | "staple"
  | "stirFry"
  | "soupPot"
  | "other";

export type Mood =
  | "tired"
  | "hungry"
  | "emo"
  | "overtime"
  | "slacking"
  | "celebration"
  | "date"
  | "crazy"
  | "afterWorkout"
  | "lateNight";

export interface Stats {
  joy: number;
  health: number;
  fullness: number;
  energy: number;
  safety: number;
}

export interface OptionChoice {
  id: string;
  label: string;
  priceDelta?: number;
  statDelta?: Partial<Stats>;
  tags?: string[];
}

export interface OptionGroup {
  id: string;
  name: string;
  type: "single" | "multi";
  choices: OptionChoice[];
}

export interface MenuItem {
  id: string;
  name: string;
  category: Category;
  price: number;
  description: string;
  imageKey?: string;
  tags: string[];
  stats: Stats;
  options?: OptionGroup[];
}

export interface CartEntry {
  item: MenuItem;
  quantity: number;
  selectedChoices: Record<string, string[]>;
}

export interface ComboRule {
  id: string;
  name: string;
  description: string;
  condition: {
    moods?: Mood[];
    requiredTags?: string[];
    minItems?: number;
    categoryCounts?: Partial<Record<Category, number>>;
    minStats?: Partial<Stats>;
  };
  bonus: Partial<Stats>;
}

export type DeliveryEventType =
  | "foodSafety"
  | "riderSafety"
  | "packaging"
  | "healthyLife"
  | "noteGame"
  | "fun";

export interface DeliveryScore {
  speed: number;
  safety: number;
  health: number;
  integrity: number;
  trust: number;
}

export interface DeliveryChoice {
  id: string;
  label: string;
  detail?: string;
  effect: Partial<DeliveryScore>;
}

export interface DeliveryEvent {
  id: string;
  type: DeliveryEventType;
  title: string;
  body: string;
  knowledge: string;
  choices: DeliveryChoice[];
}

export type EscortTileType =
  | "start"
  | "merchant"
  | "packaging"
  | "road"
  | "healthQuiz"
  | "foodSafetyQuiz"
  | "riderSafety"
  | "note"
  | "tool"
  | "reward"
  | "fork"
  | "incident"
  | "destination";

export type DiceMode = "steady" | "normal" | "speedy";

export interface DiceConfig {
  id: DiceMode;
  name: string;
  description: string;
  range: [number, number];
  riskLabel: string;
}

export interface EscortPickupStop {
  id: string;
  name: string;
  categories: Category[];
  tileId: string;
  completed: boolean;
}

export interface EscortBoardArt {
  id: string;
  theme: string;
  width: number;
  height: number;
  imageKey: string;
}

export interface EscortRoute {
  mainTileIds: string[];
  branchTileIds: string[];
  pickupTileIds: string[];
  destinationTileId: string;
}

export interface EscortTile {
  id: string;
  type: EscortTileType;
  label: string;
  shortLabel: string;
  x: number;
  y: number;
  eventHint?: string;
  pickupId?: string;
  routeIndex?: number;
  isBranch?: boolean;
  branchId?: string;
  landmark?: string;
  sceneId?: string;
}

export type EscortEventMode = "choice" | "packaging" | "quiz";

export interface EscortEventOption {
  id: string;
  label: string;
  detail?: string;
  effect: Partial<DeliveryScore>;
  tools?: string[];
  correct?: boolean;
}

export interface EscortEvent {
  id: string;
  tileType: EscortTileType;
  eventType: DeliveryEventType;
  mode: EscortEventMode;
  title: string;
  body: string;
  knowledge: string;
  options: EscortEventOption[];
}

export interface EscortResolvedEvent {
  id: string;
  eventTitle: string;
  choiceLabel: string;
  eventType: DeliveryEventType;
  tileType: EscortTileType;
  effect: Partial<DeliveryScore>;
  tileLabel?: string;
  sceneTitle?: string;
}

export interface EscortOutcome {
  rating: "S" | "A" | "B" | "C" | "隐藏";
  title: string;
  routeLine: string;
  pickupLine: string;
  achievements: string[];
  finalScore: DeliveryScore;
  summaryLines: string[];
  turnsTaken?: number;
  routeSummary?: string[];
  sceneSummary?: string[];
}

export type EscortView = "board" | "scene" | "outcome";

export type EscortSceneKind =
  | "start"
  | "merchant"
  | "packaging"
  | "road"
  | "quiz"
  | "rider"
  | "note"
  | "tool"
  | "reward"
  | "fork"
  | "incident"
  | "destination";

export interface EscortScene {
  id: string;
  kind: EscortSceneKind;
  title: string;
  subtitle: string;
  visual: string;
  tone: "orange" | "green" | "blue" | "red" | "gold" | "purple";
}

export interface EscortGameState {
  seed: string;
  view: EscortView;
  boardArt: EscortBoardArt;
  route: EscortRoute;
  positionIndex: number;
  tiles: EscortTile[];
  pickups: EscortPickupStop[];
  destinationName: string;
  diceMode: DiceMode;
  actionPoints: number;
  turnsTaken: number;
  lastRoll?: number;
  lastMovePath?: number[];
  score: DeliveryScore;
  tools: string[];
  triggeredEvents: EscortResolvedEvent[];
  branchChoices: string[];
  currentScene?: EscortScene;
  currentEvent?: EscortEvent;
  completed: boolean;
  outcome?: EscortOutcome;
}

export type PersonaAxisKey = "driver" | "scene" | "discipline" | "novelty";

export interface PersonaAxisScore {
  key: PersonaAxisKey;
  leftLabel: string;
  rightLabel: string;
  leftCode: string;
  rightCode: string;
  value: number;
  codeLetter: string;
}

export interface FoodPersonaType {
  code: string;
  name: string;
  shortLine: string;
  description: string;
  keywords: string[];
  nextOrder: string;
}

export type PersonaEvidenceType = "order" | "decision" | "result";

export interface PersonaEvidenceLine {
  type: PersonaEvidenceType;
  label: string;
  text: string;
}

export interface PersonaDominantAxis {
  key: PersonaAxisKey;
  label: string;
  value: number;
  codeLetter: string;
  leaningLabel: string;
}

export interface FoodPersonaResult extends FoodPersonaType {
  variantTitle: string;
  displayName: string;
  axes: PersonaAxisScore[];
  badges: string[];
  evidenceLines: PersonaEvidenceLine[];
  dominantAxis: PersonaDominantAxis;
  variantReason: string;
  avatarKey: string;
  avatarPosition: { x: number; y: number };
  confidenceLabel: string;
}

export interface ResultJourneyEvent {
  eventTitle: string;
  choiceLabel: string;
  eventType: DeliveryEventType;
  tileType?: EscortTileType;
  personaEffect?: Partial<Record<PersonaAxisKey, number>>;
  badges?: string[];
  phase?: OrderProgressPhase;
}

export type OrderProgressPhase = "merchant" | "rider" | "arrival";

export type OrderContextFlag =
  | "hasMilkTea"
  | "hasCoffee"
  | "hasDrink"
  | "hasFood"
  | "hasHotFood"
  | "hasDessert"
  | "hasLightFood"
  | "hasActivity"
  | "hasSweet"
  | "hasLowSugar"
  | "hasSpicy"
  | "hasFried"
  | "hasSoup"
  | "hasToppings"
  | "hasBoba"
  | "hasMultiCup"
  | "hasMixedTemperature"
  | "hasMultipleShops"
  | "hasNotes"
  | "nearDiscount"
  | "isHighSugarOrOil"
  | "isLateNight"
  | "isOffice"
  | "isSocial";

export interface OrderContext {
  mood: Mood;
  destinationName: string;
  categories: Category[];
  tags: string[];
  itemNames: string[];
  totalQuantity: number;
  totalPrice: number;
  flags: Record<OrderContextFlag, boolean>;
}

export interface OrderProgressNode {
  id: string;
  phase: OrderProgressPhase;
  label: string;
  shortLabel: string;
  description: string;
}

export interface OrderProgressChoice {
  id: string;
  label: string;
  detail?: string;
  effect: Partial<DeliveryScore>;
  personaEffect?: Partial<Record<PersonaAxisKey, number>>;
  badges?: string[];
}

export interface OrderProgressEvent {
  id: string;
  phase: OrderProgressPhase;
  nodeIds: string[];
  group: string;
  title: string;
  sender: string;
  body: string;
  insight: string;
  tone: "orange" | "green" | "blue" | "red" | "gold" | "purple";
  visual: string;
  eventType: DeliveryEventType;
  tileType?: EscortTileType;
  requiredCategories?: Category[];
  requiredTags?: string[];
  excludedTags?: string[];
  moods?: Mood[];
  requiredFlags?: OrderContextFlag[];
  excludedFlags?: OrderContextFlag[];
  weight?: number;
  choices: OrderProgressChoice[];
}

export interface OrderResolvedEvent {
  id: string;
  nodeId: string;
  nodeLabel: string;
  phase: OrderProgressPhase;
  eventTitle: string;
  choiceLabel: string;
  eventType: DeliveryEventType;
  tileType?: EscortTileType;
  effect: Partial<DeliveryScore>;
  personaEffect?: Partial<Record<PersonaAxisKey, number>>;
  badges?: string[];
}

export interface OrderProgressGameState {
  seed: string;
  context: OrderContext;
  nodes: OrderProgressNode[];
  events: OrderProgressEvent[];
  currentIndex: number;
  currentEvent?: OrderProgressEvent;
  score: DeliveryScore;
  resolvedEvents: OrderResolvedEvent[];
  completed: boolean;
  outcome?: EscortOutcome;
}

export interface MoodOption {
  id: Mood;
  label: string;
  line: string;
  recommendedTags: string[];
}

export interface ResultSummary {
  orderTitle: string;
  persona: string;
  nextTip: string;
  shareText: string;
  receiptLines: string[];
  journeyLines: string[];
  badges: string[];
  foodPersona: FoodPersonaResult;
  receipt: {
    orderTitle: string;
    status: string;
    purpose: string;
    items: string[];
    choices: string[];
    combos: string[];
    amount: number;
    indexes: Array<{ label: string; value: number }>;
    evidence: PersonaEvidenceLine[];
  };
  personaExplanation: {
    headline: string;
    axisSummary: string;
    evidenceLines: PersonaEvidenceLine[];
  };
  escortOutcome?: EscortOutcome;
  finalScores: {
    joyIndex: number;
    healthIndex: number;
    safetyIndex: number;
  };
}
