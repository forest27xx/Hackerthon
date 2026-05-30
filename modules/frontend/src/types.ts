export type Category =
  | "milkTea"
  | "coffee"
  | "dessert"
  | "snack"
  | "nightFood"
  | "lightFood"
  | "activity";

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

export interface FoodPersonaResult extends FoodPersonaType {
  variantTitle: string;
  displayName: string;
  axes: PersonaAxisScore[];
  badges: string[];
}

export interface ResultJourneyEvent {
  eventTitle: string;
  choiceLabel: string;
  eventType: DeliveryEventType;
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
  finalScores: {
    joyIndex: number;
    healthIndex: number;
    safetyIndex: number;
  };
}
