import { toPng } from "html-to-image";
import {
  AlertTriangle,
  BadgeCheck,
  BadgePercent,
  Bike,
  CakeSlice,
  Check,
  ChevronDown,
  ChevronLeft,
  Clipboard,
  CloudRain,
  Coffee,
  CircleCheck,
  CupSoda,
  Dice5,
  Download,
  Dumbbell,
  Flame,
  Gamepad2,
  HeartPulse,
  HelpCircle,
  Home,
  MapPinned,
  Megaphone,
  Moon,
  PackageCheck,
  PartyPopper,
  Plus,
  ReceiptText,
  RotateCcw,
  Route,
  Salad,
  ScanFace,
  ShieldCheck,
  ShoppingBag,
  SmilePlus,
  Soup,
  Sparkles,
  Tags,
  TicketPercent,
  Utensils,
  WalletCards,
  Zap,
  type LucideIcon
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type TouchEvent as ReactTouchEvent,
  type UIEvent as ReactUIEvent,
  type WheelEvent as ReactWheelEvent
} from "react";
import escortBoardFoodStreet from "./assets/escort/escort-board-food-street.png";
import riderToken from "./assets/escort/rider-token.png";
import eatiStartCover from "./assets/cover/eati-start-cover.png";
import neonOrderOffice from "./assets/cover/neon-order-office.png";
import chiShangGrid from "./assets/persona/chi-shang-grid.png";
import { categories, comboRules, menuItems, moods } from "./data/catalog";
import { diceConfigs } from "./data/escortBoard";
import {
  applyComboBonuses,
  computeActiveCombos,
  computeOrderTotals,
  generateResultSummary,
  getDefaultChoices,
  getSelectedOptionChoices
} from "./lib/gameEngine";
import {
  advanceEscortGame,
  createEscortGame,
  getNextTilePreview,
  initialEscortScore,
  resolveEscortEvent
} from "./lib/escortEngine";
import {
  createOrderProgressGame,
  getOrderProgressPhaseCounts,
  initialOrderProgressScore,
  resolveOrderProgressEvent,
  toOrderJourneyEvents
} from "./lib/orderProgressEngine";
import { missingLocalImageKeys, resolveMenuImage } from "./lib/menuImages";
import type {
  CartEntry,
  Category,
  ComboRule,
  DiceMode,
  DeliveryEventType,
  DeliveryScore,
  EscortEvent,
  EscortBoardArt,
  EscortGameState,
  EscortTile,
  EscortTileType,
  MenuItem,
  Mood,
  OrderProgressGameState,
  ResultJourneyEvent,
  Stats
} from "./types";
import "./styles.css";

type Stage = "cover" | "mood" | "order" | "delivery" | "result";
type PaymentStatus = "idle" | "scanning" | "success" | "refreshing" | "insufficient";

const eventTypeLabels: Record<DeliveryEventType, string> = {
  foodSafety: "食品安全",
  riderSafety: "骑手安全",
  packaging: "防撒漏",
  healthyLife: "健康生活",
  noteGame: "备注博弈",
  fun: "趣味突发"
};

const statLabels: Record<keyof Stats, string> = {
  joy: "快乐值",
  health: "健康值",
  fullness: "饱腹值",
  energy: "清醒值",
  safety: "安全值"
};

const deliveryLabels: Record<keyof DeliveryScore, string> = {
  speed: "期待",
  safety: "安心",
  health: "平衡",
  integrity: "完整",
  trust: "体贴"
};

const orderSceneIcons: Record<string, LucideIcon> = {
  "merchant-accepted": ShoppingBag,
  "merchant-spec": CupSoda,
  "merchant-stock": Utensils,
  "merchant-package": PackageCheck,
  "rider-pickup": Bike,
  "rider-road": Route,
  "rider-arrival": MapPinned,
  "arrival-check": ReceiptText
};

const escortTileLabels: Record<EscortTileType, string> = {
  start: "起点格",
  merchant: "商家格",
  packaging: "包装格",
  road: "路况格",
  healthQuiz: "健康题",
  foodSafetyQuiz: "食安题",
  riderSafety: "骑手安全格",
  note: "备注格",
  tool: "道具格",
  reward: "奖励格",
  fork: "岔路格",
  incident: "事故格",
  destination: "终点格"
};

const escortTileIcons: Record<EscortTileType, LucideIcon> = {
  start: Bike,
  merchant: ShoppingBag,
  packaging: PackageCheck,
  road: Route,
  healthQuiz: HeartPulse,
  foodSafetyQuiz: ShieldCheck,
  riderSafety: Bike,
  note: Clipboard,
  tool: Gamepad2,
  reward: Sparkles,
  fork: MapPinned,
  incident: AlertTriangle,
  destination: Home
};

const categoryVisuals: Record<Category, { icon: LucideIcon; accent: string }> = {
  milkTea: { icon: CupSoda, accent: "#ff8a3d" },
  coffee: { icon: Coffee, accent: "#9a5a2c" },
  dessert: { icon: CakeSlice, accent: "#ef5f86" },
  snack: { icon: Flame, accent: "#ff4c2e" },
  nightFood: { icon: Soup, accent: "#d9781f" },
  lightFood: { icon: Salad, accent: "#26a269" },
  activity: { icon: Gamepad2, accent: "#4b7bec" },
  staple: { icon: Utensils, accent: "#c96f26" },
  stirFry: { icon: Flame, accent: "#e24d2f" },
  soupPot: { icon: Soup, accent: "#bb6b1f" },
  other: { icon: ShoppingBag, accent: "#64748b" }
};

const purposeVisuals: Record<Mood, { icon: LucideIcon; gradient: string; accent: string; short: string; glow: string }> = {
  tired: {
    icon: Coffee,
    gradient: "linear-gradient(135deg, #2dd4bf 0%, #0f766e 48%, #0f172a 100%)",
    accent: "#5eead4",
    short: "续命开机",
    glow: "rgba(45, 212, 191, 0.32)"
  },
  hungry: {
    icon: Utensils,
    gradient: "linear-gradient(135deg, #fb923c 0%, #ef4444 58%, #7f1d1d 100%)",
    accent: "#fed7aa",
    short: "嘴巴开会",
    glow: "rgba(251, 146, 60, 0.35)"
  },
  emo: {
    icon: CloudRain,
    gradient: "linear-gradient(135deg, #818cf8 0%, #7c3aed 52%, #1e1b4b 100%)",
    accent: "#c4b5fd",
    short: "情绪回血",
    glow: "rgba(129, 140, 248, 0.34)"
  },
  overtime: {
    icon: Zap,
    gradient: "linear-gradient(135deg, #facc15 0%, #fb7185 50%, #7c2d12 100%)",
    accent: "#fde68a",
    short: "电量抢救",
    glow: "rgba(250, 204, 21, 0.34)"
  },
  slacking: {
    icon: SmilePlus,
    gradient: "linear-gradient(135deg, #86efac 0%, #22c55e 45%, #064e3b 100%)",
    accent: "#bbf7d0",
    short: "低调回血",
    glow: "rgba(34, 197, 94, 0.3)"
  },
  celebration: {
    icon: PartyPopper,
    gradient: "linear-gradient(135deg, #f9a8d4 0%, #f97316 52%, #7c2d12 100%)",
    accent: "#fce7f3",
    short: "奖励加料",
    glow: "rgba(249, 168, 212, 0.33)"
  },
  date: {
    icon: HeartPulse,
    gradient: "linear-gradient(135deg, #fb7185 0%, #f43f5e 48%, #881337 100%)",
    accent: "#ffe4e6",
    short: "好看不翻车",
    glow: "rgba(244, 63, 94, 0.3)"
  },
  crazy: {
    icon: Flame,
    gradient: "linear-gradient(135deg, #ff4d4f 0%, #f97316 45%, #431407 100%)",
    accent: "#fed7aa",
    short: "快乐释放",
    glow: "rgba(249, 115, 22, 0.36)"
  },
  afterWorkout: {
    icon: Dumbbell,
    gradient: "linear-gradient(135deg, #38bdf8 0%, #22c55e 48%, #064e3b 100%)",
    accent: "#bae6fd",
    short: "恢复补给",
    glow: "rgba(56, 189, 248, 0.32)"
  },
  lateNight: {
    icon: Moon,
    gradient: "linear-gradient(135deg, #60a5fa 0%, #6366f1 48%, #111827 100%)",
    accent: "#bfdbfe",
    short: "深夜避难",
    glow: "rgba(96, 165, 250, 0.32)"
  }
};

const moodDefault: Mood = "overtime";

const createSeed = (mood: Mood, cart: CartEntry[]) =>
  `${mood}-${cart.map((entry) => `${entry.item.id}:${entry.quantity}`).join("|") || "empty"}`;

const formatSigned = (value: number) => (value > 0 ? `+${value}` : `${value}`);

const clampMeter = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const formatEffect = (effect: Partial<DeliveryScore>) => {
  const parts = Object.entries(effect)
    .filter(([, value]) => value !== undefined && value !== 0)
    .map(([key, value]) => `${deliveryLabels[key as keyof DeliveryScore]}${formatSigned(value ?? 0)}`);
  return parts.length > 0 ? parts.join(" · ") : "仪式感 +1";
};

const toJourneyEvents = (state: EscortGameState): ResultJourneyEvent[] =>
  state.triggeredEvents.map((event) => ({
    eventTitle: event.eventTitle,
    choiceLabel: event.choiceLabel,
    eventType: event.eventType,
    tileType: event.tileType
  }));

const getRouteTile = (state: EscortGameState, routeIndex: number) => {
  const tileId = state.route.mainTileIds[routeIndex];
  return state.tiles.find((tile) => tile.id === tileId) ?? state.tiles[routeIndex];
};

const getBoardTileStyle = (tile: EscortTile, boardArt: EscortBoardArt): CSSProperties => ({
  left: `${(tile.x / boardArt.width) * 100}%`,
  top: `${(tile.y / boardArt.height) * 100}%`
});

const getRoadSegmentStyle = (from: EscortTile, to: EscortTile, boardArt: EscortBoardArt): CSSProperties => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  return {
    left: `${(from.x / boardArt.width) * 100}%`,
    top: `${(from.y / boardArt.height) * 100}%`,
    width: `${(length / boardArt.width) * 100}%`,
    transform: `rotate(${Math.atan2(dy, dx)}rad)`
  };
};

const getProductBadge = (item: MenuItem, index: number) => {
  if (index === 0) return "人气TOP1";
  if (item.tags.includes("healthy") || item.tags.includes("lowSugar")) return "营养均衡";
  if (item.tags.includes("spicy") || item.tags.includes("party")) return "快乐加成";
  if (item.tags.includes("safe") || item.tags.includes("share")) return "稳妥推荐";
  return "今日可点";
};

const comboPresetItems: Record<string, string[]> = {
  c01: ["cf-01", "mt-08"],
  c02: ["lf-08", "ds-04"],
  c03: ["sk-05", "ac-06", "nf-03"],
  c04: ["nf-04", "lf-08"],
  c05: ["lf-01", "lf-06"],
  c06: ["mt-02", "ds-03"],
  c07: ["lf-04", "ac-04"],
  c08: ["mt-05", "ds-07"],
  c09: ["mt-02", "ac-03"],
  c10: ["mt-01", "nf-06"]
};

const getComboItems = (combo: ComboRule) => {
  const minimumItems = combo.condition.minItems ?? 2;
  const presetItems = comboPresetItems[combo.id]
    ?.map((itemId) => menuItems.find((item) => item.id === itemId))
    .filter((item): item is MenuItem => Boolean(item));

  if (presetItems && presetItems.length >= minimumItems) return presetItems;

  const requiredTags = combo.condition.requiredTags ?? [];
  const matchedItems = menuItems.filter((item) => requiredTags.some((tag) => item.tags.includes(tag))).slice(0, minimumItems);
  const mergedItems = [...(presetItems ?? []), ...matchedItems.filter((item) => !presetItems?.some((preset) => preset.id === item.id))].slice(0, minimumItems);
  return mergedItems.length > 0 ? mergedItems : menuItems.slice(0, minimumItems);
};

type Coupon = {
  id: string;
  label: string;
  threshold: number;
  discount: number;
  description: string;
};

const walletLimit = 150;

const coupons: Coupon[] = [
  { id: "c39", label: "满39减5", threshold: 39, discount: 5, description: "轻量可用" },
  { id: "c59", label: "满59减10", threshold: 59, discount: 10, description: "饭饮刚好" },
  { id: "c89", label: "满89减18", threshold: 89, discount: 18, description: "拼单省钱" },
  { id: "c129", label: "满129减28", threshold: 129, discount: 28, description: "聚餐红包" }
];

type MealPreset = {
  id: string;
  name: string;
  line: string;
  moods: Mood[];
  tags: string[];
  itemNames: string[];
};

const mealPresets: MealPreset[] = [
  {
    id: "work-luck",
    name: "加班幸运包",
    line: "咖啡 + 主食 + 蛋白",
    moods: ["overtime", "tired"],
    tags: ["caffeine", "fullness", "protein"],
    itemNames: ["冰美式续命杯", "黑椒牛柳意面", "卤味溏心蛋"]
  },
  {
    id: "low-carb",
    name: "低碳自律局",
    line: "高蛋白 + 低糖 + 清爽",
    moods: ["afterWorkout", "slacking"],
    tags: ["protein", "lowSugar", "healthy"],
    itemNames: ["鸡胸藜麦碗", "无糖气泡水", "低糖水果盒"]
  },
  {
    id: "friday-free",
    name: "周五放纵套餐",
    line: "热辣 + 炸物 + 大杯饮",
    moods: ["crazy", "celebration"],
    tags: ["spicy", "fried", "party"],
    itemNames: ["麻辣烫小锅", "盐酥鸡", "多肉葡萄芝士"]
  },
  {
    id: "night-soft",
    name: "深夜回血包",
    line: "热汤 + 软食 + 热饮",
    moods: ["lateNight", "emo"],
    tags: ["warm", "comfort", "healthy"],
    itemNames: ["砂锅粥", "鲜肉云吞汤", "豆浆"]
  },
  {
    id: "date-safe",
    name: "约会不翻车",
    line: "好看 + 好分 + 不脏手",
    moods: ["date"],
    tags: ["share", "safe", "fruit"],
    itemNames: ["杨枝甘露", "草莓奶油可颂", "鲜切水果杯"]
  },
  {
    id: "hungry-base",
    name: "干饭安心包",
    line: "主食 + 家常菜 + 果饮",
    moods: ["hungry"],
    tags: ["fullness", "safe", "refresh"],
    itemNames: ["台式卤肉饭", "番茄炒蛋", "鲜榨橙汁"]
  }
];

const tagLabels: Record<string, string> = {
  afterWorkout: "运动补给",
  bold: "重口尝鲜",
  caffeine: "咖啡因",
  cheese: "芝士",
  chewy: "糯叽叽",
  combo: "可搭配",
  comfort: "治愈系",
  energy: "补能",
  fried: "酥脆",
  fruit: "果香",
  fullness: "饱腹",
  fun: "趣味",
  healthy: "健康",
  healthyNote: "少油盐",
  lateNight: "夜宵",
  light: "轻负担",
  lowSugar: "低糖",
  milkTea: "奶茶",
  overtime: "续命",
  party: "聚会",
  protein: "高蛋白",
  refresh: "清爽",
  safe: "稳妥",
  separatePack: "分装",
  share: "适合分享",
  slacking: "摸鱼",
  social: "社交",
  spicy: "辣味",
  sweet: "甜口",
  warm: "热乎"
};

const getTagLabel = (tag: string) => tagLabels[tag] ?? tag;

const getEntryUnitPrice = (entry: CartEntry) =>
  entry.item.price + getSelectedOptionChoices(entry).reduce((sum, choice) => sum + (choice.priceDelta ?? 0), 0);

const getEntrySubtotal = (entry: CartEntry) => getEntryUnitPrice(entry) * entry.quantity;

const defaultChoiceLabels = new Set([
  "按商品默认",
  "默认口味",
  "默认奶基",
  "默认汤底",
  "标准酱",
  "标准甜",
  "正常冰",
  "标准份",
  "标准杯",
  "中杯",
  "单人份",
  "单份",
  "单人小锅"
]);

const getEntryOptionSummary = (entry: CartEntry) =>
  getSelectedOptionChoices(entry)
    .map((choice) => choice.label)
    .filter((label) => !defaultChoiceLabels.has(label))
    .join(" / ");

const getBestCoupon = (availableCoupons: Coupon[]) =>
  availableCoupons.reduce<Coupon | null>((best, coupon) => (!best || coupon.discount > best.discount ? coupon : best), null);

const isTargetInsideCartDrawer = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest(".cart-drawer"));

const getMealPresetItems = (preset: MealPreset) =>
  preset.itemNames
    .map((name) => menuItems.find((item) => item.name === name))
    .filter((item): item is MenuItem => Boolean(item));

const getPresetPrice = (items: MenuItem[]) => items.reduce((sum, item) => sum + item.price, 0);

const ORDER_CHOICE_ANIMATION_MS = 360;

function App() {
  const [stage, setStage] = useState<Stage>("cover");
  const [mood, setMood] = useState<Mood>(moodDefault);
  const [activeCategory, setActiveCategory] = useState<Category>("milkTea");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [couponBoost, setCouponBoost] = useState<{ couponId: string; bonus: number } | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [draftChoices, setDraftChoices] = useState<Record<string, string[]>>({});
  const [escortState, setEscortState] = useState<EscortGameState | null>(null);
  const [orderProgressState, setOrderProgressState] = useState<OrderProgressGameState | null>(null);
  const [selectedDice, setSelectedDice] = useState<DiceMode>("normal");
  const [deliveryScore, setDeliveryScore] = useState<DeliveryScore>(initialOrderProgressScore);
  const [selectedEvents, setSelectedEvents] = useState<ResultJourneyEvent[]>([]);
  const [packagingSelection, setPackagingSelection] = useState<string[]>([]);
  const [displayedEscortIndex, setDisplayedEscortIndex] = useState(0);
  const [isRiderMoving, setIsRiderMoving] = useState(false);
  const [fastEscort, setFastEscort] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [selectedOrderChoiceId, setSelectedOrderChoiceId] = useState<string | null>(null);
  const [pendingChoiceEffect, setPendingChoiceEffect] = useState<Partial<DeliveryScore> | null>(null);
  const [isResolvingChoice, setIsResolvingChoice] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("idle");
  const [paymentMessage, setPaymentMessage] = useState("");
  const [isCoverEntering, setIsCoverEntering] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const movementTimersRef = useRef<number[]>([]);
  const orderChoiceTimerRef = useRef<number | null>(null);
  const paymentTimersRef = useRef<number[]>([]);
  const coverTimerRef = useRef<number | null>(null);
  const orderScrollTopRef = useRef(0);
  const touchStartYRef = useRef(0);
  const touchStartedInCartDrawerRef = useRef(false);

  const visibleItems = useMemo(() => menuItems.filter((item) => item.category === activeCategory), [activeCategory]);
  const totals = useMemo(() => computeOrderTotals(cart), [cart]);
  const boostedCoupons = useMemo(
    () =>
      coupons.map((coupon) =>
        coupon.id === couponBoost?.couponId
          ? { ...coupon, discount: coupon.discount + couponBoost.bonus, description: `神券+${couponBoost.bonus}` }
          : coupon
      ),
    [couponBoost]
  );
  const availableCoupons = useMemo(() => boostedCoupons.filter((coupon) => totals.price >= coupon.threshold), [boostedCoupons, totals.price]);
  const nextCoupon = useMemo(() => boostedCoupons.find((coupon) => totals.price < coupon.threshold), [boostedCoupons, totals.price]);
  const bestCoupon = useMemo(() => getBestCoupon(availableCoupons), [availableCoupons]);
  const selectedCoupon = useMemo(
    () => availableCoupons.find((coupon) => coupon.id === selectedCouponId) ?? bestCoupon,
    [availableCoupons, bestCoupon, selectedCouponId]
  );
  const boostTargetCoupon = useMemo(
    () => boostedCoupons.find((coupon) => coupon.id === (selectedCouponId ?? selectedCoupon?.id)) ?? selectedCoupon ?? boostedCoupons[0],
    [boostedCoupons, selectedCoupon, selectedCouponId]
  );
  const couponDiscount = selectedCoupon?.discount ?? 0;
  const payablePrice = Math.max(0, totals.price - couponDiscount);
  const walletRemaining = walletLimit - payablePrice;
  const walletCanPay = cart.length > 0 && walletRemaining >= 0;
  const combos = useMemo(() => computeActiveCombos(cart, comboRules, mood), [cart, mood]);
  const statsWithCombo = useMemo(() => applyComboBonuses(totals.stats, combos), [totals.stats, combos]);
  const summary = useMemo(
    () =>
      generateResultSummary({
        mood,
        totals: { price: payablePrice, stats: totals.stats },
        combos,
        deliveryScore,
        selectedEventTitles: selectedEvents.map((event) => event.eventTitle),
        selectedEvents,
        entries: cart,
        escortOutcome: orderProgressState?.outcome
      }),
    [cart, combos, deliveryScore, orderProgressState?.outcome, mood, payablePrice, selectedEvents, totals.stats]
  );

  const missingImages = useMemo(() => missingLocalImageKeys(menuItems).length, []);
  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const currentOrderEvent = orderProgressState?.currentEvent;
  const currentOrderNode = orderProgressState ? orderProgressState.nodes[orderProgressState.currentIndex] : undefined;
  const orderProgressStep = orderProgressState
    ? Math.min(orderProgressState.resolvedEvents.length + (orderProgressState.completed ? 0 : 1), orderProgressState.nodes.length)
    : 0;
  const orderProgressPercent =
    orderProgressState && orderProgressState.nodes.length > 1
      ? Math.round(((Math.max(1, orderProgressStep) - 1) / (orderProgressState.nodes.length - 1)) * 100)
      : 0;
  const orderPhaseCounts = orderProgressState ? getOrderProgressPhaseCounts(orderProgressState) : { merchant: 0, rider: 0, arrival: 0 };
  const currentOrderSceneClass = currentOrderNode ? `scene-${currentOrderNode.id}` : "scene-merchant-accepted";
  const CurrentOrderSceneIcon = currentOrderNode ? (orderSceneIcons[currentOrderNode.id] ?? ShoppingBag) : ShoppingBag;
  const orderLiveStatusLabel =
    currentOrderNode?.phase === "merchant" ? "正在备餐中" : currentOrderNode?.phase === "rider" ? "正在配送中" : "订单已到达";
  const orderLiveStatusTag =
    currentOrderNode?.phase === "merchant" ? "商家来信" : currentOrderNode?.phase === "rider" ? "骑手来信" : "收餐确认";
  const orderMeters = orderProgressState
    ? [
        { key: "expect", label: "期待值", value: orderProgressState.score.speed, sub: "快乐推进", icon: Sparkles, tone: "red" },
        { key: "safe", label: "安心值", value: orderProgressState.score.safety, sub: "沟通稳定", icon: ShieldCheck, tone: "blue" },
        { key: "complete", label: "完整值", value: orderProgressState.score.integrity, sub: "少错少漏", icon: PackageCheck, tone: "orange" },
        { key: "balance", label: "平衡值", value: orderProgressState.score.health, sub: "负担可控", icon: HeartPulse, tone: "green" },
        { key: "kind", label: "体贴值", value: orderProgressState.score.trust, sub: "双方舒服", icon: Sparkles, tone: "gold" }
      ]
    : [];
  const currentEscortEvent = escortState?.currentEvent;
  const nextTilePreview = escortState ? getNextTilePreview(escortState) : null;
  const selectedDiceConfig = diceConfigs.find((dice) => dice.id === selectedDice) ?? diceConfigs[1];
  const escortMainTiles = escortState ? escortState.route.mainTileIds.map((id) => escortState.tiles.find((tile) => tile.id === id)).filter(Boolean) as EscortTile[] : [];
  const escortBranchTiles = escortState?.tiles.filter((tile) => tile.isBranch) ?? [];
  const currentEscortTile = escortState ? getRouteTile(escortState, displayedEscortIndex) : undefined;
  const actualEscortTile = escortState ? getRouteTile(escortState, escortState.positionIndex) : undefined;
  const riderPoint = escortState && currentEscortTile ? getBoardTileStyle(currentEscortTile, escortState.boardArt) : undefined;
  const escortSceneOpen = Boolean(escortState?.view === "scene" && !isRiderMoving);
  const completedPickupCount = escortState?.pickups.filter((pickup) => pickup.completed).length ?? 0;
  const escortProgressLabel = escortState ? `${escortState.positionIndex + 1} / ${escortState.route.mainTileIds.length}` : "0 / 0";
  const escortRoadSegments =
    escortState && escortMainTiles.length > 1
      ? escortMainTiles.slice(1).map((tile, index) => ({
          id: `${escortMainTiles[index].id}-${tile.id}`,
          style: getRoadSegmentStyle(escortMainTiles[index], tile, escortState.boardArt),
          active: displayedEscortIndex > index
        }))
      : [];
  const escortBranchSegments =
    escortState
      ? Object.values(
          escortBranchTiles.reduce<Record<string, EscortTile[]>>((groups, tile) => {
            if (!tile.branchId) return groups;
            groups[tile.branchId] = [...(groups[tile.branchId] ?? []), tile];
            return groups;
          }, {})
        ).flatMap((branchGroup) => {
          const anchor = escortMainTiles.find((tile) => tile.branchId === branchGroup[0]?.branchId);
          const branchPath = anchor ? [anchor, ...branchGroup] : branchGroup;
          return branchPath.slice(1).map((tile, index) => ({
            id: `${branchPath[index].id}-${tile.id}`,
            style: getRoadSegmentStyle(branchPath[index], tile, escortState.boardArt)
          }));
        })
      : [];
  const escortMeters = escortState
    ? [
        { key: "action", label: "行动力", value: escortState.actionPoints, sub: "剩余步数", icon: Dice5, tone: "red" },
        { key: "integrity", label: "完整度", value: escortState.score.integrity, sub: `已取 ${completedPickupCount}/${escortState.pickups.length}`, icon: PackageCheck, tone: "orange" },
        { key: "safety", label: "安全", value: escortState.score.safety, sub: escortState.score.safety >= 80 ? "优秀" : "良好", icon: ShieldCheck, tone: "blue" },
        { key: "health", label: "健康", value: escortState.score.health, sub: escortState.score.health >= 75 ? "良好" : "可调整", icon: HeartPulse, tone: "green" },
        { key: "trust", label: "信任", value: escortState.score.trust, sub: escortState.score.trust >= 80 ? "优秀" : "稳定", icon: Sparkles, tone: "gold" }
      ]
    : [];
  const activeMood = moods.find((option) => option.id === mood) ?? moods[0];
  const previewMeters = [
    { key: "joy", label: "快乐值", value: clampMeter(50 + statsWithCombo.joy), icon: Sparkles, tone: "green" },
    { key: "health", label: "健康值", value: clampMeter(55 + statsWithCombo.health), icon: HeartPulse, tone: "red" },
    { key: "safety", label: "安全值", value: clampMeter(58 + statsWithCombo.safety), icon: ShieldCheck, tone: "blue" }
  ];
  const recommendedPresets = useMemo(
    () =>
      mealPresets
        .map((preset) => {
          const items = getMealPresetItems(preset);
          const price = getPresetPrice(items);
          const presetCoupon = getBestCoupon(boostedCoupons.filter((coupon) => price >= coupon.threshold));
          const tagScore = preset.tags.filter((tag) => activeMood.recommendedTags.includes(tag)).length;
          const moodScore = preset.moods.includes(mood) ? 100 : 0;
          return {
            preset,
            items,
            price,
            presetCoupon,
            payable: Math.max(0, price - (presetCoupon?.discount ?? 0)),
            score: moodScore + tagScore * 14 + price / 10
          };
        })
        .filter(({ items }) => items.length > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3),
    [activeMood.recommendedTags, boostedCoupons, mood]
  );
  const cartBoosts = [
    { label: "快乐", value: Math.max(0, Math.round(statsWithCombo.joy)) },
    { label: "健康", value: Math.round(statsWithCombo.health) },
    { label: "安全", value: Math.round(statsWithCombo.safety) }
  ];
  const paymentTitle =
    paymentStatus === "scanning"
      ? "Face ID 验证中"
      : paymentStatus === "success"
        ? "支付成功"
        : paymentStatus === "refreshing"
          ? "正在刷新订单页"
        : paymentStatus === "insufficient"
          ? "余额不足"
          : "";
  const PaymentIcon = paymentStatus === "success" ? CircleCheck : paymentStatus === "refreshing" ? Route : paymentStatus === "insufficient" ? WalletCards : ScanFace;
  const clearMovementTimers = () => {
    movementTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    movementTimersRef.current = [];
  };
  const clearPaymentTimers = () => {
    paymentTimersRef.current.forEach((timer) => window.clearTimeout(timer));
    paymentTimersRef.current = [];
  };

  const handleCoverStart = () => {
    if (isCoverEntering) return;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    setIsCoverEntering(true);
    if (coverTimerRef.current !== null) window.clearTimeout(coverTimerRef.current);
    coverTimerRef.current = window.setTimeout(
      () => {
        setIsCoverEntering(false);
        setStage("mood");
        coverTimerRef.current = null;
      },
      reduceMotion ? 80 : 720
    );
  };

  useEffect(() => {
    setPackagingSelection([]);
    setSelectedOrderChoiceId(null);
    setPendingChoiceEffect(null);
    setIsResolvingChoice(false);
  }, [currentOrderEvent?.id]);

  useEffect(
    () => () => {
      clearMovementTimers();
      clearPaymentTimers();
      if (orderChoiceTimerRef.current !== null) window.clearTimeout(orderChoiceTimerRef.current);
      if (coverTimerRef.current !== null) window.clearTimeout(coverTimerRef.current);
    },
    []
  );

  useEffect(() => {
    const bridge = window as Window & {
      render_game_to_text?: () => string;
      advanceTime?: (ms: number) => void;
    };

    bridge.render_game_to_text = () =>
      JSON.stringify({
        stage,
        orderProgress: orderProgressState
          ? {
              currentIndex: orderProgressState.currentIndex,
              currentNode: orderProgressState.nodes[orderProgressState.currentIndex]?.label,
              currentEvent: orderProgressState.currentEvent?.title,
              progress: `${orderProgressState.resolvedEvents.length}/${orderProgressState.nodes.length}`,
              phaseCounts: orderPhaseCounts,
              completed: orderProgressState.completed,
              destination: orderProgressState.context.destinationName,
              score: orderProgressState.score,
              resolved: orderProgressState.resolvedEvents.map((event) => ({
                phase: event.phase,
                node: event.nodeLabel,
                event: event.eventTitle,
                choice: event.choiceLabel
              })),
              rating: orderProgressState.outcome?.rating
            }
          : null,
        escort: escortState
            ? {
              view: escortState.view,
              positionIndex: escortState.positionIndex,
              displayedPositionIndex: displayedEscortIndex,
              positionTile: getRouteTile(escortState, escortState.positionIndex)?.label,
              displayedTile: getRouteTile(escortState, displayedEscortIndex)?.label,
              pickups: escortState.pickups.map((pickup) => ({ name: pickup.name, completed: pickup.completed })),
              destination: escortState.destinationName,
              actionPoints: escortState.actionPoints,
              turnsTaken: escortState.turnsTaken,
              lastRoll: escortState.lastRoll,
              lastMovePath: escortState.lastMovePath,
              currentScene: escortState.currentScene?.title,
              currentEvent: escortState.currentEvent?.title,
              moving: isRiderMoving,
              completed: escortState.completed,
              rating: escortState.outcome?.rating,
              score: escortState.score
            }
          : null
      });
    bridge.advanceTime = () => undefined;

    return () => {
      delete bridge.render_game_to_text;
      delete bridge.advanceTime;
    };
  }, [displayedEscortIndex, escortState, isRiderMoving, orderPhaseCounts, orderProgressState, stage]);

  const chooseMood = (nextMood: Mood) => {
    clearPaymentTimers();
    setPaymentStatus("idle");
    setPaymentMessage("");
    setMood(nextMood);
    setStage("order");
  };

  const closeDrawers = () => {
    setIsCartOpen(false);
    setIsCouponOpen(false);
  };

  const openItem = (item: MenuItem) => {
    setEditingItem(item);
    setDraftChoices(getDefaultChoices(item));
  };

  const toggleChoice = (groupId: string, choiceId: string, type: "single" | "multi") => {
    setDraftChoices((current) => {
      const selected = current[groupId] ?? [];
      return {
        ...current,
        [groupId]: type === "single" ? [choiceId] : selected.includes(choiceId) ? selected.filter((id) => id !== choiceId) : [...selected, choiceId]
      };
    });
  };

  const addCartEntry = (item: MenuItem, selectedChoices = getDefaultChoices(item)) => {
    setCart((current) => {
      const key = JSON.stringify(selectedChoices);
      const existingIndex = current.findIndex((entry) => entry.item.id === item.id && JSON.stringify(entry.selectedChoices) === key);
      if (existingIndex >= 0) {
        return current.map((entry, index) => (index === existingIndex ? { ...entry, quantity: entry.quantity + 1 } : entry));
      }
      return [...current, { item, quantity: 1, selectedChoices }];
    });
    setIsCartOpen(true);
    setIsCouponOpen(false);
  };

  const addComboToCart = (combo: ComboRule) => {
    const items = getComboItems(combo).slice(0, combo.condition.minItems ?? 2);
    items.forEach((item) => addCartEntry(item));
    if (items[0]) setActiveCategory(items[0].category);
  };

  const addPresetToCart = (preset: MealPreset) => {
    const presetItems = getMealPresetItems(preset);
    if (presetItems.length === 0) return;

    setCart((current) => {
      const next = [...current];
      presetItems.forEach((item) => {
        const selectedChoices = getDefaultChoices(item);
        const key = JSON.stringify(selectedChoices);
        const existingIndex = next.findIndex((entry) => entry.item.id === item.id && JSON.stringify(entry.selectedChoices) === key);
        if (existingIndex >= 0) {
          next[existingIndex] = { ...next[existingIndex], quantity: next[existingIndex].quantity + 1 };
        } else {
          next.push({ item, quantity: 1, selectedChoices });
        }
      });
      return next;
    });
    setIsCartOpen(true);
    setIsCouponOpen(false);
  };

  const adjustQuantity = (index: number, delta: number) => {
    setCart((current) =>
      current
        .map((entry, entryIndex) => (entryIndex === index ? { ...entry, quantity: entry.quantity + delta } : entry))
        .filter((entry) => entry.quantity > 0)
    );
  };

  const confirmItem = () => {
    if (!editingItem) return;
    addCartEntry(editingItem, draftChoices);
    setEditingItem(null);
  };

  const beginOrderProgress = () => {
    closeDrawers();
    const game = createOrderProgressGame({ entries: cart, mood, seed: createSeed(mood, cart) });
    setOrderProgressState(game);
    setEscortState(null);
    setDeliveryScore(game.score);
    setSelectedEvents([]);
    setSelectedDice("normal");
    setPackagingSelection([]);
    setDisplayedEscortIndex(0);
    setIsRiderMoving(false);
    setFastEscort(false);
    setSelectedOrderChoiceId(null);
    setPendingChoiceEffect(null);
    setIsResolvingChoice(false);
    setPaymentStatus("idle");
    setPaymentMessage("");
    setStage("delivery");
  };

  const handleCheckoutClick = () => {
    if (cart.length === 0 || paymentStatus === "scanning" || paymentStatus === "success" || paymentStatus === "refreshing") return;

    clearPaymentTimers();

    if (!walletCanPay) {
      setPaymentStatus("insufficient");
      setPaymentMessage(`钱包差 ¥${Math.abs(walletRemaining)}，删减一点或试试神券膨胀。`);
      setIsCartOpen(true);
      setIsCouponOpen(false);
      paymentTimersRef.current.push(
        window.setTimeout(() => {
          setPaymentStatus("idle");
          setPaymentMessage("");
        }, 2800)
      );
      return;
    }

    closeDrawers();
    setPaymentStatus("scanning");
    setPaymentMessage(`本单实付 ¥${payablePrice}，正在核对小票。`);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const successDelay = reduceMotion ? 180 : 720;
    const refreshDelay = reduceMotion ? 420 : 1220;
    const finishDelay = reduceMotion ? 1250 : 2450;

    paymentTimersRef.current.push(
      window.setTimeout(() => {
        setPaymentStatus("success");
        setPaymentMessage("快乐小票已扣款，马上进入订单进行中。");
      }, successDelay)
    );
    paymentTimersRef.current.push(
      window.setTimeout(() => {
        setPaymentStatus("refreshing");
        setPaymentMessage("正在生成商家与骑手进度。");
      }, refreshDelay)
    );
    paymentTimersRef.current.push(window.setTimeout(beginOrderProgress, finishDelay));
  };

  const applyOrderChoice = (choiceId: string) => {
    if (!orderProgressState?.currentEvent) return;
    const next = resolveOrderProgressEvent(orderProgressState, [choiceId]);
    setOrderProgressState(next);
    setDeliveryScore(next.score);
    setSelectedEvents(toOrderJourneyEvents(next));
    if (next.completed) setStage("result");
  };

  const resolveOrderChoice = (choiceId: string) => {
    if (!orderProgressState?.currentEvent || isResolvingChoice) return;
    const choice = orderProgressState.currentEvent.choices.find((item) => item.id === choiceId);
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (!choice || reduceMotion) {
      applyOrderChoice(choiceId);
      return;
    }

    if (orderChoiceTimerRef.current !== null) window.clearTimeout(orderChoiceTimerRef.current);
    setSelectedOrderChoiceId(choiceId);
    setPendingChoiceEffect(choice.effect);
    setIsResolvingChoice(true);
    orderChoiceTimerRef.current = window.setTimeout(() => {
      applyOrderChoice(choiceId);
      orderChoiceTimerRef.current = null;
    }, ORDER_CHOICE_ANIMATION_MS);
  };

  const rollEscort = () => {
    if (!escortState || escortState.currentEvent || escortState.completed || escortState.view === "scene" || isRiderMoving) return;
    const next = advanceEscortGame(escortState, selectedDice);
    const movePath = next.lastMovePath ?? [next.positionIndex];
    const stepDelay = fastEscort ? 110 : 260;

    clearMovementTimers();
    setIsRiderMoving(movePath.length > 0);
    setEscortState(next);
    setDeliveryScore(next.score);
    setSelectedEvents(toJourneyEvents(next));

    if (movePath.length === 0) {
      setDisplayedEscortIndex(next.positionIndex);
      setIsRiderMoving(false);
      if (next.completed) setStage("result");
      return;
    }

    movePath.forEach((routeIndex, index) => {
      const timer = window.setTimeout(() => setDisplayedEscortIndex(routeIndex), stepDelay * (index + 1));
      movementTimersRef.current.push(timer);
    });

    const settleTimer = window.setTimeout(() => {
      setDisplayedEscortIndex(next.positionIndex);
      setIsRiderMoving(false);
      if (next.completed) setStage("result");
    }, stepDelay * (movePath.length + 1) + 90);
    movementTimersRef.current.push(settleTimer);
  };

  const resolveEscortChoice = (optionIds: string[]) => {
    if (!escortState?.currentEvent) return;
    const next = resolveEscortEvent(escortState, optionIds);
    setEscortState(next);
    setDisplayedEscortIndex(next.positionIndex);
    setDeliveryScore(next.score);
    setSelectedEvents(toJourneyEvents(next));
    if (next.completed) setStage("result");
  };

  const togglePackagingChoice = (optionId: string) => {
    setPackagingSelection((current) => {
      if (current.includes(optionId)) return current.filter((id) => id !== optionId);
      if (current.length >= 2) return current;
      return [...current, optionId];
    });
  };

  const saveResult = async () => {
    if (!resultRef.current) return;
    const dataUrl = await toPng(resultRef.current, { pixelRatio: 2, cacheBust: true });
    const link = document.createElement("a");
    link.download = `${summary.orderTitle}.png`;
    link.href = dataUrl;
    link.click();
  };

  const copyShareText = async () => {
    let copied = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(summary.shareText);
        copied = true;
      }
    } catch {
      copied = false;
    }

    if (!copied) {
      const textarea = document.createElement("textarea");
      textarea.value = summary.shareText;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      copied = document.execCommand("copy");
      document.body.removeChild(textarea);
    }

    (window as Window & { __happyOrderLastShareText?: string }).__happyOrderLastShareText = summary.shareText;
    setShareCopied(copied);
    window.setTimeout(() => setShareCopied(false), 1200);
  };

  const restart = () => {
    if (coverTimerRef.current !== null) window.clearTimeout(coverTimerRef.current);
    clearPaymentTimers();
    setStage("cover");
    setCart([]);
    closeDrawers();
    setSelectedCouponId(null);
    setCouponBoost(null);
    setEscortState(null);
    setOrderProgressState(null);
    setSelectedEvents([]);
    setDeliveryScore(initialOrderProgressScore);
    setPackagingSelection([]);
    setShareCopied(false);
    setPaymentStatus("idle");
    setPaymentMessage("");
    setIsCoverEntering(false);
  };

  const toggleCartDrawer = () => {
    if (cart.length === 0) return;
    setIsCartOpen((open) => !open);
    setIsCouponOpen(false);
  };

  const toggleCouponDrawer = () => {
    setIsCouponOpen((open) => !open);
    setIsCartOpen(true);
  };

  const inflateCoupon = () => {
    const targetCoupon = boostTargetCoupon ?? boostedCoupons[0];
    if (!targetCoupon) return;
    const bonus = Math.floor(Math.random() * 8) + 3;
    setCouponBoost({ couponId: targetCoupon.id, bonus });
    setSelectedCouponId(targetCoupon.id);
    setIsCouponOpen(true);
    setIsCartOpen(true);
  };

  const handleOrderScroll = (event: ReactUIEvent<HTMLElement>) => {
    if (isTargetInsideCartDrawer(event.target)) return;
    const nextScrollTop = event.currentTarget.scrollTop;
    if (nextScrollTop > orderScrollTopRef.current + 6) closeDrawers();
    orderScrollTopRef.current = nextScrollTop;
  };

  const handleOrderWheel = (event: ReactWheelEvent<HTMLElement>) => {
    if (isTargetInsideCartDrawer(event.target)) return;
    if (event.deltaY > 4) closeDrawers();
  };

  const handleOrderTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? 0;
    touchStartedInCartDrawerRef.current = isTargetInsideCartDrawer(event.target);
  };

  const handleOrderTouchMove = (event: ReactTouchEvent<HTMLElement>) => {
    if (touchStartedInCartDrawerRef.current || isTargetInsideCartDrawer(event.target)) return;
    const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
    if (touchStartYRef.current - currentY > 6) closeDrawers();
  };

  useEffect(() => {
    if (stage !== "order" || (!isCartOpen && !isCouponOpen)) return;

    let touchStartY = 0;
    let touchStartedInCartDrawer = false;
    const closeOnWheel = (event: globalThis.WheelEvent) => {
      if (isTargetInsideCartDrawer(event.target)) return;
      if (event.deltaY > 4) closeDrawers();
    };
    const trackTouchStart = (event: globalThis.TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
      touchStartedInCartDrawer = isTargetInsideCartDrawer(event.target);
    };
    const closeOnTouchMove = (event: globalThis.TouchEvent) => {
      if (touchStartedInCartDrawer || isTargetInsideCartDrawer(event.target)) return;
      const currentY = event.touches[0]?.clientY ?? touchStartY;
      if (touchStartY - currentY > 6) closeDrawers();
    };
    const closeOnScroll = (event: globalThis.Event) => {
      if (isTargetInsideCartDrawer(event.target)) return;
      closeDrawers();
    };

    document.addEventListener("wheel", closeOnWheel, { passive: true, capture: true });
    document.addEventListener("touchstart", trackTouchStart, { passive: true, capture: true });
    document.addEventListener("touchmove", closeOnTouchMove, { passive: true, capture: true });
    document.addEventListener("scroll", closeOnScroll, { passive: true, capture: true });

    return () => {
      document.removeEventListener("wheel", closeOnWheel, { capture: true });
      document.removeEventListener("touchstart", trackTouchStart, { capture: true });
      document.removeEventListener("touchmove", closeOnTouchMove, { capture: true });
      document.removeEventListener("scroll", closeOnScroll, { capture: true });
    };
  }, [isCartOpen, isCouponOpen, stage]);

  return (
    <main className="page-shell">
      <section className={`phone-frame ${stage === "cover" ? "is-start-cover" : stage === "mood" ? "is-cover" : ""}`} aria-label="快乐下单事务所">
        {stage !== "cover" && (
          <header className="app-header">
            {stage !== "mood" ? (
              <button className="icon-button" type="button" onClick={() => (stage === "order" ? setStage("mood") : setStage("order"))} aria-label="返回">
                <ChevronLeft size={18} />
              </button>
            ) : (
              <span className="brand-dot" />
            )}
            <div>
              <h1>快乐下单事务所</h1>
              <p>{stage === "delivery" ? "订单进行中" : stage === "result" ? "快乐订单已生成" : "选择今日下单目的"}</p>
            </div>
            <div className="header-score" aria-label={`快乐值 ${Math.max(0, statsWithCombo.joy)}`}>
              <Sparkles size={15} />
              <span>快乐值</span>
              <strong>{Math.max(0, statsWithCombo.joy)}</strong>
            </div>
          </header>
        )}

        {stage === "cover" && (
          <section
            className={`start-cover-screen ${isCoverEntering ? "is-entering" : ""}`}
            style={{ "--start-cover-image": `url(${eatiStartCover})` } as CSSProperties}
            aria-label="今天你的吃商几级"
          >
            <div className="start-cover-frame" aria-hidden="true" />
            <div className="start-cover-title">
              <span>
                <Sparkles size={18} />
                EATI 测试营业
              </span>
              <h2>今天你的<br />吃商几级</h2>
              <p>点亮美味 · 升级吃商 · 解锁 EATI</p>
            </div>
            <button className="start-game-button" type="button" onClick={handleCoverStart} disabled={isCoverEntering}>
              <span>开始游戏</span>
              <i aria-hidden="true" />
            </button>
            <div className="start-cover-subline">
              <span />
              <p>看看你是第几级吃商</p>
              <span />
            </div>
          </section>
        )}

        {stage === "mood" && (
          <section className="mood-screen mood-cover-screen" style={{ "--cover-image": `url(${neonOrderOffice})` } as CSSProperties}>
            <div className="cover-hero" aria-label="快乐下单事务所入口">
              <span className="cover-level">
                <ShoppingBag size={17} />
                今日营业中
              </span>
              <h2>快乐下单事务所</h2>
              <p>选一个入口，让今天的食欲、预算和吃商人格一起开局。</p>
              <div className="cover-ticket">
                <ReceiptText size={18} />
                <span>这张小票会记录你为什么下单、怎么点、怎么沟通。</span>
              </div>
            </div>
            <div className="mood-grid cover-purpose-grid">
              {moods.map((option, index) => {
                const visual = purposeVisuals[option.id];
                const Icon = visual.icon;
                return (
                  <button
                    key={option.id}
                    className="mood-card cover-purpose-card"
                    type="button"
                    style={
                      {
                        "--purpose-gradient": visual.gradient,
                        "--purpose-accent": visual.accent,
                        "--purpose-glow": visual.glow,
                        "--purpose-delay": `${index * 55}ms`
                      } as CSSProperties
                    }
                    onClick={() => chooseMood(option.id)}
                  >
                    <span className="purpose-icon">
                      <Icon size={20} />
                    </span>
                    <span className="purpose-title">{option.label}</span>
                    <small>{visual.short}</small>
                    <em>{option.line}</em>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {stage === "order" && (
          <section className="order-screen" onScroll={handleOrderScroll} onWheel={handleOrderWheel} onTouchStart={handleOrderTouchStart} onTouchMove={handleOrderTouchMove}>
            <div className="order-hero">
              <div className="mascot-card">
                <div className="mascot-avatar">单</div>
                <span>Lv.3</span>
              </div>
              <div className="meter-board">
                {previewMeters.map((meter) => {
                  const Icon = meter.icon;
                  return (
                    <div className={`meter-card ${meter.tone}`} key={meter.key}>
                      <div>
                        <Icon size={18} />
                        <span>{meter.label}</span>
                      </div>
                      <strong>{meter.value}<small>/100</small></strong>
                      <i style={{ width: `${meter.value}%` }} />
                    </div>
                  );
                })}
              </div>
              <button className="gift-button" type="button" aria-label="事务所补给">
                <BadgePercent size={22} />
                <b>{combos.length}</b>
              </button>
            </div>

            <div className="purpose-strip">
              <Megaphone size={18} />
              <span>今日下单目的：<b>{activeMood.label}</b>。{activeMood.line}</span>
              <button type="button" onClick={() => setStage("mood")}>更换</button>
            </div>

            <section className="wallet-panel" aria-label="钱包">
              <article>
                <WalletCards size={19} />
                <div>
                  <span>吃商钱包</span>
                  <strong>¥{walletLimit}</strong>
                </div>
                <em className={walletRemaining < 0 ? "danger" : ""}>
                  {walletRemaining >= 0 ? `剩余 ¥${walletRemaining}` : `超出 ¥${Math.abs(walletRemaining)}`}
                </em>
              </article>
              <button className="coupon-boost-card" type="button" onClick={inflateCoupon}>
                <TicketPercent size={18} />
                <div>
                  <span>神券膨胀</span>
                  <strong>{couponBoost ? `+¥${couponBoost.bonus}` : "随机+3-10"}</strong>
                </div>
                <em>{boostTargetCoupon ? boostTargetCoupon.label : "选券膨胀"}</em>
              </button>
            </section>

            <section className="combo-showcase" aria-label="超值搭配">
              <div className="section-heading">
                <div>
                  <h2>吃商线索套餐</h2>
                  <p>按今日状态推荐，一键加入</p>
                </div>
                <Tags size={18} />
              </div>
              <div className="preset-cards">
                {recommendedPresets.map(({ preset, items, price, presetCoupon, payable }, index) => (
                  <button key={preset.id} className={index === 0 ? "top-preset" : ""} type="button" onClick={() => addPresetToCart(preset)}>
                    <div className="preset-copy">
                      <span>{index === 0 ? "力度最大" : "优质搭配"}</span>
                      <strong>{preset.name}</strong>
                      <p>{preset.line}</p>
                    </div>
                    <div className="preset-foods">
                      {items.slice(0, 3).map((item) => (
                        <img key={item.id} src={resolveMenuImage(item)} alt="" loading="lazy" />
                      ))}
                    </div>
                    <div className="preset-meta">
                      <small>{items.map((item) => item.name).join(" / ")}</small>
                      <b>{presetCoupon ? `券后 ¥${payable}` : `¥${price}`}</b>
                      <em>一键添加</em>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <div className="menu-layout">
              <nav className="category-rail" aria-label="菜单分类">
                {categories.map((category) => (
                  (() => {
                    const Icon = categoryVisuals[category.id].icon;
                    return (
                      <button
                        key={category.id}
                        className={category.id === activeCategory ? "active" : ""}
                        type="button"
                        style={{ "--category-accent": categoryVisuals[category.id].accent } as CSSProperties}
                        onClick={() => setActiveCategory(category.id)}
                      >
                        <span><Icon size={19} /></span>
                        {category.label}
                      </button>
                    );
                  })()
                ))}
              </nav>

              <div className="product-pane">
                <div className="section-title section-heading">
                  <div>
                    <h2>人气推荐</h2>
                    <p>已收录 {menuItems.length} 个选择，图片会自动匹配商品名</p>
                  </div>
                  <span>{missingImages} 张待替换</span>
                </div>
                {visibleItems.map((item, index) => (
                  <article className="product-card" key={item.id}>
                    <div className="product-media">
                      <img src={resolveMenuImage(item)} alt={item.name} loading="lazy" />
                      <span>{getProductBadge(item, index)}</span>
                    </div>
                    <div className="product-info">
                      <div>
                        <h3>{item.name}</h3>
                        <p>{item.description}</p>
                      </div>
                      <div className="tag-row">
                        {item.tags.slice(0, 3).map((tag) => (
                          <span key={tag}>{getTagLabel(tag)}</span>
                        ))}
                      </div>
                      <div className="product-actions">
                        <strong>¥{item.price}</strong>
                        <button type="button" onClick={() => openItem(item)} aria-label={`加入 ${item.name}`}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <aside className="cart-bar" aria-label="购物车">
              <button className="cart-toggle" type="button" onClick={toggleCartDrawer} disabled={cart.length === 0} aria-expanded={isCartOpen}>
                <div className="cart-basket">
                  <ShoppingBag size={28} />
                  <b>{cartCount}</b>
                </div>
                <div className="cart-main">
                  <div>
                    <strong>¥{payablePrice}</strong>
                    <span>{couponDiscount > 0 ? `券减¥${couponDiscount} · ` : ""}钱包剩余¥{walletRemaining >= 0 ? walletRemaining : 0}</span>
                  </div>
                </div>
                <ChevronDown className={isCartOpen ? "expanded" : ""} size={18} />
              </button>
              <div className="cart-boosts" aria-label="订单指标">
                {cartBoosts.map((boost) => (
                  <em key={boost.label}>{boost.label} {formatSigned(boost.value)}</em>
                ))}
              </div>
              <button
                className="checkout-button"
                type="button"
                onClick={handleCheckoutClick}
                disabled={cart.length === 0 || paymentStatus === "scanning" || paymentStatus === "success" || paymentStatus === "refreshing"}
              >
                {paymentStatus === "scanning" || paymentStatus === "success" || paymentStatus === "refreshing" ? "处理中" : cart.length > 0 && !walletCanPay ? "余额不足" : "下单"}
              </button>
            </aside>

            {paymentStatus !== "idle" && (
              <div className={`payment-island payment-${paymentStatus}`} role="status" aria-live="polite">
                <span className="payment-face">
                  <PaymentIcon size={22} />
                  {paymentStatus === "scanning" && <i aria-hidden="true" />}
                </span>
                <div>
                  <strong>{paymentTitle}</strong>
                  <small>{paymentMessage}</small>
                </div>
                {paymentStatus === "insufficient" && (
                  <button
                    type="button"
                    onClick={() => {
                      clearPaymentTimers();
                      setPaymentStatus("idle");
                      setPaymentMessage("");
                    }}
                    aria-label="关闭余额提示"
                  >
                    知道了
                  </button>
                )}
              </div>
            )}

            {paymentStatus === "refreshing" && (
              <div className="payment-refresh-mask" role="status" aria-live="polite">
                <div className="refresh-card">
                  <span>
                    <Route size={22} />
                  </span>
                  <strong>订单页加载中</strong>
                  <small>正在把小票同步给商家和骑手</small>
                  <i aria-hidden="true" />
                </div>
              </div>
            )}

            {cart.length > 0 && isCartOpen && (
              <div className="cart-drawer" aria-label="已点餐品">
                <section className="cart-coupon-panel" aria-label="优惠券">
                  <button className="coupon-pocket" type="button" onClick={toggleCouponDrawer} aria-expanded={isCouponOpen}>
                    <TicketPercent size={18} />
                    <div>
                      <span>红包优惠</span>
                      <strong>{selectedCoupon ? `${selectedCoupon.label} · -¥${couponDiscount}` : nextCoupon ? `差¥${nextCoupon.threshold - totals.price}` : "暂无红包"}</strong>
                    </div>
                    <em>{selectedCoupon ? "已自动抵扣" : nextCoupon ? "再点可用" : "已无可用"}</em>
                    <ChevronDown className={isCouponOpen ? "expanded" : ""} size={16} />
                  </button>

                  {isCouponOpen && (
                    <div className="coupon-drawer" aria-label="可使用优惠券">
                      {availableCoupons.length > 0 ? (
                        availableCoupons.map((coupon) => {
                          const active = selectedCoupon?.id === coupon.id;
                          return (
                            <button
                              key={coupon.id}
                              className={active ? "active" : ""}
                              type="button"
                              onClick={() => {
                                setSelectedCouponId(coupon.id);
                                setIsCouponOpen(false);
                              }}
                              aria-pressed={active}
                            >
                              <b>{coupon.label}</b>
                              <span>{coupon.description}</span>
                            </button>
                          );
                        })
                      ) : (
                        <p>{nextCoupon ? `再点¥${nextCoupon.threshold - totals.price}可用` : "暂无红包"}</p>
                      )}
                    </div>
                  )}
                </section>
                <button className="cart-drawer-head" type="button" onClick={toggleCartDrawer} aria-expanded={isCartOpen}>
                  <span>已点餐品</span>
                  <small>共 {cartCount} 件 · 再点一下收起</small>
                  <ChevronDown className="expanded" size={16} />
                </button>
                <div className="combo-row">
                  {combos.slice(0, 3).map((combo) => (
                    <span key={combo.id}>{combo.name}</span>
                  ))}
                  {combos.length === 0 && <span>再加 1-2 件试试隐藏 combo</span>}
                </div>
                {cart.map((entry, index) => (
                  <div className="cart-line" key={`${entry.item.id}-${index}`}>
                    <img src={resolveMenuImage(entry.item)} alt="" loading="lazy" />
                    <div className="cart-line-title">
                      <span>{entry.item.name}</span>
                      <small>{getEntryOptionSummary(entry) || "默认规格"}</small>
                    </div>
                    <div>
                      <b>¥{getEntrySubtotal(entry)}</b>
                      <button type="button" onClick={() => adjustQuantity(index, -1)} aria-label={`减少 ${entry.item.name}`}>-</button>
                      <strong>{entry.quantity}</strong>
                      <button type="button" onClick={() => adjustQuantity(index, 1)} aria-label={`增加 ${entry.item.name}`}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {stage === "delivery" && orderProgressState && (
          <section className={`delivery-screen order-progress-screen ${currentOrderSceneClass} phase-${currentOrderNode?.phase ?? "merchant"}`}>
            <div className={`order-progress-hero phase-${currentOrderNode?.phase ?? "merchant"}`}>
              <div className="order-status-island" aria-live="polite">
                <span className="island-icon" aria-hidden="true">
                  <CurrentOrderSceneIcon size={16} />
                </span>
                <strong>{orderLiveStatusLabel}</strong>
                <em>{orderLiveStatusTag}</em>
              </div>
              <button type="button" onClick={() => setStage("order")} aria-label="修改订单">
                <ChevronLeft size={16} />
                改订单
              </button>
            </div>

            <div
              className={`order-route-card phase-${currentOrderNode?.phase ?? "merchant"} ${isResolvingChoice ? "is-resolving" : ""}`}
              aria-label="订单推进进度"
              style={{ "--route-progress": `${orderProgressPercent}%` } as CSSProperties}
            >
              <div className="route-meta">
                <span>
                  {currentOrderNode?.phase === "merchant" ? "商家处理中" : currentOrderNode?.phase === "rider" ? "骑手沟通中" : "准备收餐"}
                </span>
                <strong>{currentOrderNode?.label ?? "订单推进"}</strong>
              </div>
              <div className="order-route-track">
                <span className="track-start"><ShoppingBag size={16} /></span>
                <i />
                <b className="track-runner"><CupSoda size={18} /></b>
                <span className="track-end"><BadgeCheck size={16} /></span>
              </div>
            </div>

            <div className={`order-scorebar ${isResolvingChoice ? "is-resolving" : ""}`} aria-label="订单状态">
              {orderMeters.map((meter) => {
                const Icon = meter.icon;
                return (
                  <div className={`order-meter ${meter.tone}`} key={meter.key}>
                    <Icon size={17} />
                    <span>{meter.label}</span>
                    <strong>{meter.value}</strong>
                  </div>
                );
              })}
            </div>

            <div className="order-scene-scroll">
              {currentOrderEvent && currentOrderNode && (
                <article
                  key={currentOrderEvent.id}
                  className={`order-event-card tone-${currentOrderEvent.tone} ${currentOrderSceneClass} ${isResolvingChoice ? "is-resolving" : ""}`}
                  aria-label={currentOrderEvent.title}
                >
                  <div className="order-scene-hero">
                    <div className="order-scene-visual" aria-hidden="true">
                      <CurrentOrderSceneIcon size={30} />
                    </div>
                    <div>
                      <span>
                        {currentOrderEvent.phase === "merchant" ? "商家阶段" : currentOrderEvent.phase === "rider" ? "骑手阶段" : "收餐确认"}
                        {" · "}
                        {currentOrderNode.label}
                      </span>
                      <h2>{currentOrderEvent.title}</h2>
                      <p>{currentOrderNode.description}</p>
                    </div>
                    <strong>临场选择</strong>
                  </div>

                  <div className="order-decision-panel">
                    <div className="order-chat-panel">
                      <div className="chat-bubble incoming">
                        <span>{currentOrderEvent.sender}</span>
                        <p>{currentOrderEvent.body}</p>
                      </div>
                      <div className="event-insight">
                        <HelpCircle size={16} />
                        <span>{currentOrderEvent.insight}</span>
                      </div>
                    </div>

                    <div className="order-choice-list">
                      {currentOrderEvent.choices.map((choice) => {
                        const isSelected = selectedOrderChoiceId === choice.id;
                        const effectText = formatEffect(choice.effect);
                        return (
                          <button
                            type="button"
                            key={choice.id}
                            className={isSelected ? "is-selected" : undefined}
                            disabled={isResolvingChoice}
                            aria-busy={isSelected && isResolvingChoice ? "true" : undefined}
                            onClick={() => resolveOrderChoice(choice.id)}
                          >
                            <span>{choice.label}</span>
                            <small>{choice.detail}</small>
                            <em>{effectText}</em>
                            {isSelected && pendingChoiceEffect && <b className="choice-effect-float">{formatEffect(pendingChoiceEffect)}</b>}
                          </button>
                        );
                      })}
                    </div>

                    <details className="resolved-mini-log" aria-label="订单互动记录">
                      <summary className="mini-log-head">
                        <strong>本单记录</strong>
                        <span>{orderProgressState.resolvedEvents.length > 0 ? `已留下 ${orderProgressState.resolvedEvents.length} 条` : "选择会写进小票"}</span>
                      </summary>
                      <div className="mini-log-body">
                        {orderProgressState.resolvedEvents.length === 0 ? (
                          <p>还没有做选择。第一条回复会成为这张快乐小票的开头。</p>
                        ) : (
                          orderProgressState.resolvedEvents.map((event) => (
                            <div className={`mini-log-line phase-${event.phase}`} key={`${event.id}-${event.choiceLabel}`}>
                              <span>{event.nodeLabel}</span>
                              <strong>{event.choiceLabel}</strong>
                            </div>
                          ))
                        )}
                      </div>
                    </details>
                  </div>
                </article>
              )}
            </div>
          </section>
        )}

        {stage === "delivery" && escortState && (
          <section className="delivery-screen escort-screen">
            <div className="escort-title-row">
              <div>
                <h2>快乐护送棋</h2>
                <p>一个骑手按顺序取货，把整单安全送到{escortState.destinationName}</p>
              </div>
              <button type="button" onClick={() => setStage("order")}>
                <ChevronLeft size={16} />
                改订单
              </button>
            </div>

            <div className="escort-scorebar" aria-label="护送状态">
              {escortMeters.map((meter) => {
                const Icon = meter.icon;
                return (
                  <div className={`escort-meter ${meter.tone}`} key={meter.key}>
                    <Icon size={17} />
                    <span>{meter.label}</span>
                    <strong>{meter.value}</strong>
                    <small>{meter.sub}</small>
                  </div>
                );
              })}
            </div>

            <div className="escort-pickup-card">
              <div className="pickup-count">
                <span>已取</span>
                <strong>{completedPickupCount}/{escortState.pickups.length}</strong>
              </div>
              <div className="pickup-track">
                {escortState.pickups.map((pickup) => (
                  <div className={pickup.completed ? "done" : ""} key={pickup.id}>
                    <Check size={14} />
                    <span>{pickup.name}</span>
                  </div>
                ))}
                <div className={escortState.completed ? "done destination" : "destination"}>
                  <Home size={15} />
                  <span>{escortState.destinationName}</span>
                </div>
              </div>
            </div>

            {!escortSceneOpen && (
              <>
                <div className="escort-board-shell">
                  <div
                    className="escort-map-card board-v2"
                    aria-label="快乐护送棋地图"
                    style={{ aspectRatio: `${escortState.boardArt.width} / ${escortState.boardArt.height}` }}
                  >
                    <img className="escort-map-bg" src={escortBoardFoodStreet} alt="" />
                    <div className="escort-road-layer" aria-hidden="true">
                      {escortRoadSegments.map((segment) => (
                        <i className={segment.active ? "escort-road-link active" : "escort-road-link"} key={segment.id} style={segment.style} />
                      ))}
                      {escortBranchSegments.map((segment) => (
                        <i className="escort-road-link branch" key={segment.id} style={segment.style} />
                      ))}
                    </div>

                    {escortBranchTiles.map((tile) => {
                      const Icon = escortTileIcons[tile.type];
                      return (
                        <div
                          className={`escort-tile branch-tile tile-${tile.type}`}
                          key={tile.id}
                          style={getBoardTileStyle(tile, escortState.boardArt)}
                          title={`${escortTileLabels[tile.type]}：${tile.label}`}
                        >
                          <Icon size={13} />
                          <span>{tile.shortLabel}</span>
                        </div>
                      );
                    })}

                    {escortMainTiles.map((tile) => {
                      const Icon = escortTileIcons[tile.type];
                      const index = tile.routeIndex ?? 0;
                      const isCurrent = displayedEscortIndex === index;
                      const isPassed = displayedEscortIndex > index;
                      const isTarget = escortState.positionIndex === index && !isRiderMoving;
                      const pickup = tile.pickupId ? escortState.pickups.find((item) => item.id === tile.pickupId) : undefined;
                      return (
                        <div
                          className={`escort-tile board-tile tile-${tile.type} ${isCurrent ? "current" : ""} ${isPassed ? "passed" : ""} ${isTarget ? "target" : ""} ${pickup?.completed ? "picked" : ""}`}
                          key={tile.id}
                          style={getBoardTileStyle(tile, escortState.boardArt)}
                          title={`${index + 1} 格 · ${escortTileLabels[tile.type]}：${tile.label}`}
                        >
                          <small>{index + 1}</small>
                          <Icon size={14} />
                          <span>{tile.shortLabel}</span>
                          {(tile.type === "merchant" || tile.type === "destination") && <b>{pickup?.completed ? "已取" : tile.label}</b>}
                        </div>
                      );
                    })}

                    {riderPoint && <img className="rider-token" src={riderToken} alt="骑手棋子" style={riderPoint} />}
                    {escortState.lastRoll && (
                      <div className="roll-bubble" style={riderPoint}>
                        骰子 <strong>{escortState.lastRoll}</strong>
                      </div>
                    )}
                  </div>
                  <div className="board-progress-pill">
                    <span>当前格</span>
                    <strong>{escortProgressLabel}</strong>
                    <em>{actualEscortTile?.label}</em>
                  </div>
                </div>

                <div className="escort-legend">
                  {(["merchant", "packaging", "road", "healthQuiz", "tool", "destination"] as EscortTileType[]).map((type) => {
                    const Icon = escortTileIcons[type];
                    return (
                      <span key={type}>
                        <Icon size={17} />
                        {escortTileLabels[type]}
                      </span>
                    );
                  })}
                </div>

                <div className="dice-panel">
                  <div className="dice-head">
                    <div>
                      <strong>选择骰子</strong>
                      <span>{isRiderMoving ? "骑手正在逐格前进" : `当前选择：${selectedDiceConfig.name}`}</span>
                    </div>
                    <button className={fastEscort ? "fast-toggle active" : "fast-toggle"} type="button" onClick={() => setFastEscort((value) => !value)}>
                      加速护送
                    </button>
                  </div>
                  <div className="dice-options">
                    {diceConfigs.map((dice) => (
                      <button
                        className={selectedDice === dice.id ? "selected" : ""}
                        key={dice.id}
                        type="button"
                        onClick={() => setSelectedDice(dice.id)}
                        disabled={isRiderMoving}
                      >
                        <span className="dice-cube">{dice.id === "steady" ? "1" : dice.id === "speedy" ? "6" : "4"}</span>
                        <strong>{dice.name}</strong>
                        <small>{dice.description}</small>
                        <em>{dice.riskLabel}</em>
                      </button>
                    ))}
                  </div>
                  <button className="roll-button" type="button" onClick={rollEscort} disabled={isRiderMoving}>
                    <Dice5 size={30} />
                    <span>{isRiderMoving ? "护送中..." : "掷骰前进"}</span>
                    <small>第 {escortState.turnsTaken + 1} 回合 · 当前 {escortProgressLabel}</small>
                  </button>
                  {nextTilePreview && (
                    <div className="next-event-card">
                      <div>
                        <span>下一格事件预告</span>
                        <strong>{nextTilePreview.tile.label}</strong>
                        <p>{nextTilePreview.hint}</p>
                      </div>
                      <em>{nextTilePreview.label}</em>
                    </div>
                  )}
                </div>
              </>
            )}

            {escortSceneOpen && currentEscortEvent && escortState.currentScene && (
              <article className={`escort-scene-card tone-${escortState.currentScene.tone}`} aria-label={currentEscortEvent.title}>
                <div className="scene-hero">
                  <div className="scene-visual" aria-hidden="true">{escortState.currentScene.visual}</div>
                  <div>
                    <span>{eventTypeLabels[currentEscortEvent.eventType]} · {escortTileLabels[currentEscortEvent.tileType]}</span>
                    <h2>{escortState.currentScene.title}</h2>
                    <p>{escortState.currentScene.subtitle}</p>
                  </div>
                  <strong>{currentEscortEvent.mode === "quiz" ? "知识闯关" : currentEscortEvent.mode === "packaging" ? "配装挑战" : "策略选择"}</strong>
                </div>

                <div className="scene-event-panel">
                  <div className="scene-event-title">
                    <MapPinned size={18} />
                    <div>
                      <span>当前地点</span>
                      <strong>{actualEscortTile?.label}</strong>
                    </div>
                    <em>{escortProgressLabel}</em>
                  </div>
                  <h3>{currentEscortEvent.title}</h3>
                  <p>{currentEscortEvent.body}</p>
                  <div className="knowledge-box escort-knowledge">
                    <ShieldCheck size={18} />
                    <span>{currentEscortEvent.knowledge}</span>
                  </div>
                </div>

                <div className="choice-list escort-choice-list scene-choice-list">
                  {currentEscortEvent.options.map((choice) => {
                    const selected = packagingSelection.includes(choice.id);
                    return (
                      <button
                        className={selected ? "selected" : ""}
                        key={choice.id}
                        type="button"
                        onClick={() => (currentEscortEvent.mode === "packaging" ? togglePackagingChoice(choice.id) : resolveEscortChoice([choice.id]))}
                      >
                        <span>{choice.label}</span>
                        {choice.detail && <small>{choice.detail}</small>}
                        <em>{currentEscortEvent.mode === "quiz" && choice.correct ? "正确答案 · " : ""}{formatEffect(choice.effect)}</em>
                      </button>
                    );
                  })}
                </div>

                {currentEscortEvent.mode === "packaging" && (
                  <button
                    className="confirm-packaging"
                    type="button"
                    onClick={() => resolveEscortChoice(packagingSelection)}
                    disabled={packagingSelection.length === 0}
                  >
                    <PackageCheck size={18} />
                    完成配装，回到大地图（{packagingSelection.length}/2）
                  </button>
                )}
              </article>
            )}
          </section>
        )}

        {stage === "result" && (
          <section className="result-screen">
            <div className="result-card premium-result" ref={resultRef}>
              <section className="gold-receipt" aria-label="快乐订单小票">
                <div className="receipt-glow" />
                <div className="ticket-head">
                  <div className="ticket-brand">
                    <div className="ticket-avatar">单</div>
                    <div>
                      <span>快乐下单事务所</span>
                      <small>HAPPY ORDER OFFICE</small>
                    </div>
                  </div>
                  <strong>{summary.receipt.status}</strong>
                </div>
                <div className="ticket-title">
                  <span>GOLDEN ORDER RECEIPT</span>
                  <h2>{summary.receipt.orderTitle}</h2>
                  <p>{summary.receipt.purpose}</p>
                  <em>吃商样本已封存</em>
                </div>

                <div className="receipt-meta-grid">
                  <div>
                    <span>订单金额</span>
                    <strong>¥{summary.receipt.amount}</strong>
                  </div>
                  <div>
                    <span>触发组合</span>
                    <strong>{summary.receipt.combos[0] ?? "自由发挥"}</strong>
                  </div>
                </div>

                <div className="receipt-main-list">
                  <div className="receipt-list-head">
                    <ReceiptText size={16} />
                    <span>点单内容</span>
                  </div>
                  {summary.receipt.items.map((item) => (
                    <div className="receipt-list-line" key={item}>
                      <span>{item}</span>
                      <i />
                    </div>
                  ))}
                </div>

                <div className="receipt-choice-ledger">
                  <div className="receipt-list-head">
                    <BadgeCheck size={16} />
                    <span>互动证据</span>
                  </div>
                  {summary.receipt.choices.slice(0, 8).map((choice, index) => (
                    <div className="receipt-proof-line" key={`${choice}-${index}`}>
                      <b>{String(index + 1).padStart(2, "0")}</b>
                      <span>{choice}</span>
                    </div>
                  ))}
                </div>

                <div className="score-trio">
                  {summary.receipt.indexes.map((item) => (
                    <div key={item.label}>
                      {item.label === "快乐值" ? <Sparkles size={18} /> : item.label === "健康值" ? <HeartPulse size={18} /> : <ShieldCheck size={18} />}
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div className="receipt-evidence-paper">
                  {summary.receipt.evidence.map((line) => (
                    <p key={`${line.type}-${line.label}`}>
                      <b>{line.label}</b>
                      <span>{line.text}</span>
                    </p>
                  ))}
                  <div className="barcode" aria-hidden="true" />
                </div>
              </section>

              <div className="result-divider">
                <span>继续下滑解锁吃商人格</span>
              </div>

              <section
                className="persona-card"
                aria-label="美食人格 MBTI"
                style={{ "--persona-grid-image": `url(${chiShangGrid})` } as CSSProperties}
              >
                <div className="persona-visual">
                  <div
                    className="persona-avatar-sprite"
                    aria-hidden="true"
                    style={
                      {
                        "--avatar-x": summary.foodPersona.avatarPosition.x,
                        "--avatar-y": summary.foodPersona.avatarPosition.y
                      } as CSSProperties
                    }
                  >
                    <img src={chiShangGrid} alt="" />
                  </div>
                  <div>
                    <span>你的吃商人格</span>
                    <strong>{summary.foodPersona.displayName}</strong>
                    <small>{summary.foodPersona.variantTitle}</small>
                  </div>
                </div>
                <div className="persona-confidence">
                  <span>{summary.foodPersona.confidenceLabel}</span>
                  <b>{summary.foodPersona.dominantAxis.leaningLabel}</b>
                </div>
                <p>{summary.foodPersona.description}</p>
                <div className="persona-evidence-list">
                  {summary.personaExplanation.evidenceLines.map((line) => (
                    <div key={`${line.type}-${line.label}`}>
                      <span>{line.label}</span>
                      <p>{line.text}</p>
                    </div>
                  ))}
                </div>
                <div className="variant-reason">
                  <Sparkles size={17} />
                  <span>{summary.foodPersona.variantReason}</span>
                </div>
                <div className="axis-list">
                  {summary.foodPersona.axes.map((axis) => (
                    <div className="axis-row" key={axis.key}>
                      <div>
                        <span>{axis.leftLabel}</span>
                        <b>{axis.codeLetter}</b>
                        <span>{axis.rightLabel}</span>
                      </div>
                      <i><em style={{ left: `${axis.value}%` }} /></i>
                    </div>
                  ))}
                </div>
                <div className="persona-badges">
                  {summary.badges.map((badge) => (
                    <span key={badge}>{badge}</span>
                  ))}
                </div>
                <div className="next-tip">
                  <HeartPulse size={18} />
                  <span>{summary.nextTip}</span>
                </div>
              </section>
            </div>
            <div className="result-actions">
              <button type="button" onClick={saveResult}>
                <Download size={17} />
                保存结果卡
              </button>
              <button type="button" onClick={copyShareText}>
                <Clipboard size={17} />
                {shareCopied ? "已复制" : "复制分享文案"}
              </button>
              <button type="button" onClick={restart}>
                <RotateCcw size={17} />
                再来一单
              </button>
            </div>
          </section>
        )}

        {editingItem && (
          <div className="modal-backdrop" role="dialog" aria-modal="true" aria-label={`${editingItem.name} 规格`}>
            <div className="option-sheet">
              <div className="sheet-head">
                <img src={resolveMenuImage(editingItem)} alt={editingItem.name} />
                <div>
                  <h2>{editingItem.name}</h2>
                  <p>{editingItem.description}</p>
                  <strong>¥{getEntryUnitPrice({ item: editingItem, quantity: 1, selectedChoices: draftChoices })}</strong>
                  <small>已按当前规格计价</small>
                </div>
              </div>
              {editingItem.options?.map((group) => (
                <fieldset className="option-group" key={group.id}>
                  <legend>{group.name}</legend>
                  <div>
                    {group.choices.map((choice) => {
                      const checked = (draftChoices[group.id] ?? []).includes(choice.id);
                      return (
                        <button
                          key={choice.id}
                          className={checked ? "selected" : ""}
                          type="button"
                          onClick={() => toggleChoice(group.id, choice.id, group.type)}
                        >
                          {checked && <Check size={14} />}
                          {choice.label}
                          {choice.priceDelta ? ` +¥${choice.priceDelta}` : ""}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
              <div className="sheet-actions">
                <button type="button" onClick={() => setEditingItem(null)}>取消</button>
                <button type="button" onClick={confirmItem}>
                  <Utensils size={16} />
                  加入快乐订单
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

export default App;
