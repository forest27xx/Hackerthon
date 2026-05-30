import { toPng } from "html-to-image";
import {
  BadgeCheck,
  BadgePercent,
  Bike,
  CakeSlice,
  Check,
  ChevronDown,
  ChevronLeft,
  Clipboard,
  Coffee,
  CupSoda,
  Download,
  Flame,
  HeartPulse,
  Megaphone,
  Plus,
  ReceiptText,
  RotateCcw,
  Salad,
  ShieldCheck,
  ShoppingBag,
  Soup,
  Sparkles,
  Tags,
  TicketPercent,
  Utensils,
  WalletCards,
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
import { categories, comboRules, deliveryEvents, menuItems, moods } from "./data/catalog";
import {
  applyComboBonuses,
  applyEventChoice,
  computeActiveCombos,
  computeOrderTotals,
  generateResultSummary,
  getDefaultChoices,
  getSelectedOptionChoices,
  initialDeliveryScore,
  pickDeliveryEvents
} from "./lib/gameEngine";
import { missingLocalImageKeys, resolveMenuImage } from "./lib/menuImages";
import type { CartEntry, Category, DeliveryChoice, DeliveryEvent, DeliveryScore, MenuItem, Mood, Stats } from "./types";
import "./styles.css";

type Stage = "mood" | "order" | "delivery" | "result";

const eventTypeLabels: Record<DeliveryEvent["type"], string> = {
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
  speed: "速度",
  safety: "安全",
  health: "健康",
  integrity: "完整",
  trust: "信任"
};

const categoryVisuals: Record<Category, { icon: LucideIcon; accent: string }> = {
  milkTea: { icon: CupSoda, accent: "#ff8a3d" },
  coffee: { icon: Coffee, accent: "#9a5a2c" },
  dessert: { icon: CakeSlice, accent: "#ef5f86" },
  snack: { icon: Flame, accent: "#ff4c2e" },
  nightFood: { icon: Soup, accent: "#d9781f" },
  lightFood: { icon: Salad, accent: "#26a269" },
  staple: { icon: Utensils, accent: "#c05a28" },
  stirFry: { icon: Flame, accent: "#d93f25" },
  soupPot: { icon: Soup, accent: "#b65e20" },
  other: { icon: ShoppingBag, accent: "#4b7bec" }
};

const purposeIcons: Record<Mood, string> = {
  tired: "Zz",
  hungry: "饭",
  emo: "雨",
  overtime: "电",
  slacking: "闲",
  celebration: "奖",
  date: "心",
  crazy: "燃",
  afterWorkout: "动",
  lateNight: "月"
};

const moodDefault: Mood = "overtime";

const createSeed = (mood: Mood, cart: CartEntry[]) =>
  `${mood}-${cart.map((entry) => `${entry.item.id}:${entry.quantity}`).join("|") || "empty"}`;

const formatSigned = (value: number) => (value > 0 ? `+${value}` : `${value}`);

const clampMeter = (value: number) => Math.min(100, Math.max(0, Math.round(value)));

const getProductBadge = (item: MenuItem, index: number) => {
  if (index === 0) return "人气TOP1";
  if (item.tags.includes("healthy") || item.tags.includes("lowSugar")) return "营养均衡";
  if (item.tags.includes("spicy") || item.tags.includes("party")) return "快乐加成";
  if (item.tags.includes("safe") || item.tags.includes("share")) return "稳妥推荐";
  return "今日可点";
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
  { id: "work-luck", name: "加班幸运包", line: "咖啡 + 主食 + 蛋白", moods: ["overtime", "tired"], tags: ["caffeine", "fullness", "protein"], itemNames: ["冰美式续命杯", "黑椒牛柳意面", "卤味溏心蛋"] },
  { id: "low-carb", name: "低碳自律局", line: "高蛋白 + 低糖 + 清爽", moods: ["afterWorkout", "slacking"], tags: ["protein", "lowSugar", "healthy"], itemNames: ["鸡胸藜麦碗", "无糖气泡水", "低糖水果盒"] },
  { id: "friday-free", name: "周五放纵套餐", line: "热辣 + 炸物 + 大杯饮", moods: ["crazy", "celebration"], tags: ["spicy", "fried", "party"], itemNames: ["麻辣烫小锅", "盐酥鸡", "多肉葡萄芝士"] },
  { id: "night-soft", name: "深夜回血包", line: "热汤 + 软食 + 热饮", moods: ["lateNight", "emo"], tags: ["warm", "comfort", "healthy"], itemNames: ["砂锅粥", "鲜肉云吞汤", "豆浆"] },
  { id: "date-safe", name: "约会不翻车", line: "好看 + 好分 + 不脏手", moods: ["date"], tags: ["share", "safe", "fruit"], itemNames: ["杨枝甘露", "草莓奶油可颂", "鲜切水果杯"] },
  { id: "hungry-base", name: "干饭安心包", line: "主食 + 家常菜 + 果饮", moods: ["hungry"], tags: ["fullness", "safe", "refresh"], itemNames: ["台式卤肉饭", "番茄炒蛋", "鲜榨橙汁"] }
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

const defaultChoiceLabels = new Set(["按商品默认", "默认口味", "默认奶基", "默认汤底", "标准酱", "标准甜", "正常冰", "标准份", "标准杯", "中杯", "单人份", "单份", "单人小锅"]);

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

function App() {
  const [stage, setStage] = useState<Stage>("mood");
  const [mood, setMood] = useState<Mood>(moodDefault);
  const [activeCategory, setActiveCategory] = useState<Category>("milkTea");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCouponOpen, setIsCouponOpen] = useState(false);
  const [selectedCouponId, setSelectedCouponId] = useState<string | null>(null);
  const [couponBoost, setCouponBoost] = useState<{ couponId: string; bonus: number } | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [draftChoices, setDraftChoices] = useState<Record<string, string[]>>({});
  const [route, setRoute] = useState<DeliveryEvent[]>([]);
  const [eventIndex, setEventIndex] = useState(0);
  const [deliveryScore, setDeliveryScore] = useState<DeliveryScore>(initialDeliveryScore);
  const [selectedEvents, setSelectedEvents] = useState<{ event: DeliveryEvent; choice: DeliveryChoice }[]>([]);
  const resultRef = useRef<HTMLDivElement | null>(null);
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
        selectedEventTitles: selectedEvents.map(({ event }) => event.title),
        selectedEvents: selectedEvents.map(({ event, choice }) => ({
          eventTitle: event.title,
          choiceLabel: choice.label,
          eventType: event.type
        })),
        entries: cart
      }),
    [cart, combos, deliveryScore, mood, payablePrice, selectedEvents, totals.stats]
  );

  const missingImages = useMemo(() => missingLocalImageKeys(menuItems).length, []);
  const cartCount = cart.reduce((sum, entry) => sum + entry.quantity, 0);
  const currentEvent = route[eventIndex];
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
          return { preset, items, price, presetCoupon, payable: Math.max(0, price - (presetCoupon?.discount ?? 0)), score: moodScore + tagScore * 14 + price / 10 };
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
  const featuredResultImage = cart[0] ? resolveMenuImage(cart[0].item) : resolveMenuImage(menuItems[0]);

  const closeDrawers = () => {
    setIsCartOpen(false);
    setIsCouponOpen(false);
  };

  const chooseMood = (nextMood: Mood) => {
    setMood(nextMood);
    setStage("order");
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

  const startDelivery = () => {
    if (cart.length === 0 || !walletCanPay) return;
    closeDrawers();
    const eventCount = Math.min(5, Math.max(3, Math.ceil(cartCount / 2)));
    setRoute(pickDeliveryEvents(deliveryEvents, eventCount, createSeed(mood, cart)));
    setDeliveryScore(initialDeliveryScore);
    setSelectedEvents([]);
    setEventIndex(0);
    setStage("delivery");
  };

  const selectDeliveryChoice = (choice: DeliveryChoice) => {
    if (!currentEvent) return;
    setDeliveryScore((score) => applyEventChoice(score, choice));
    setSelectedEvents((events) => [...events, { event: currentEvent, choice }]);
    if (eventIndex >= route.length - 1) {
      setStage("result");
    } else {
      setEventIndex((index) => index + 1);
    }
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
    await navigator.clipboard?.writeText(summary.shareText);
  };

  const restart = () => {
    setStage("mood");
    setCart([]);
    closeDrawers();
    setSelectedCouponId(null);
    setCouponBoost(null);
    setRoute([]);
    setSelectedEvents([]);
    setDeliveryScore(initialDeliveryScore);
    setEventIndex(0);
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
    const bonus = Math.floor(Math.random() * 8) + 3;
    setCouponBoost({ couponId: targetCoupon.id, bonus });
    setSelectedCouponId(targetCoupon.id);
  };

  const handleOrderScroll = (event: ReactUIEvent<HTMLElement>) => {
    if (isTargetInsideCartDrawer(event.target)) return;
    const nextScrollTop = event.currentTarget.scrollTop;
    if (nextScrollTop > orderScrollTopRef.current + 6) {
      closeDrawers();
    }
    orderScrollTopRef.current = nextScrollTop;
  };

  const handleOrderWheel = (event: ReactWheelEvent<HTMLElement>) => {
    if (isTargetInsideCartDrawer(event.target)) return;
    if (event.deltaY > 4) {
      closeDrawers();
    }
  };

  const handleOrderTouchStart = (event: ReactTouchEvent<HTMLElement>) => {
    touchStartYRef.current = event.touches[0]?.clientY ?? 0;
    touchStartedInCartDrawerRef.current = isTargetInsideCartDrawer(event.target);
  };

  const handleOrderTouchMove = (event: ReactTouchEvent<HTMLElement>) => {
    if (touchStartedInCartDrawerRef.current || isTargetInsideCartDrawer(event.target)) return;
    const currentY = event.touches[0]?.clientY ?? touchStartYRef.current;
    if (touchStartYRef.current - currentY > 6) {
      closeDrawers();
    }
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
      <section className="phone-frame" aria-label="今天你吃商几级">
        <header className="app-header">
          {stage !== "mood" ? (
            <button className="icon-button" type="button" onClick={() => (stage === "order" ? setStage("mood") : setStage("order"))} aria-label="返回">
              <ChevronLeft size={18} />
            </button>
          ) : (
            <span className="brand-dot" />
          )}
          <div>
            <h1>今天你吃商几级？</h1>
            <p>{stage === "delivery" ? "外卖配送选择中" : stage === "result" ? "真实 MBTI 已生成" : "点一单，看穿你的吃商人格"}</p>
          </div>
          <div className="header-score">
            <Sparkles size={16} />
            {Math.max(0, statsWithCombo.joy)}
          </div>
        </header>

        {stage === "mood" && (
          <section className="mood-screen">
            <div className="intro-panel">
              <div className="intro-copy">
                <h2>今天你吃商几级？</h2>
                <p>先选择今日下单动机，再完成点单。外卖员配送途中会出现不同时间点的选择题，你的反应会继续推导真实 MBTI 性格。</p>
              </div>
              <div className="mini-receipt">
                <ReceiptText size={22} />
                <span>从点单偏好到配送选择，生成你的吃商等级和真实 MBTI。</span>
              </div>
            </div>
            <div className="mood-grid">
              {moods.map((option) => (
                <button key={option.id} className="mood-card" type="button" onClick={() => chooseMood(option.id)}>
                  <i>{purposeIcons[option.id]}</i>
                  <span>{option.label}</span>
                  <small>{option.line}</small>
                </button>
              ))}
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
                    <div className="cart-boosts">
                      {cartBoosts.map((boost) => (
                        <em key={boost.label}>{boost.label} {formatSigned(boost.value)}</em>
                      ))}
                    </div>
                  </div>
                </div>
                <ChevronDown className={isCartOpen ? "expanded" : ""} size={18} />
              </button>
              <button className="checkout-button" type="button" onClick={startDelivery} disabled={!walletCanPay}>
                {cart.length > 0 && !walletCanPay ? "余额不足" : "下单"}
              </button>
            </aside>

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

        {stage === "delivery" && currentEvent && (
          <section className="delivery-screen">
            <div className="delivery-progress">
              <Bike size={22} />
              <div>
                <strong>外卖配送选择 {eventIndex + 1} / {route.length}</strong>
                <span>{eventTypeLabels[currentEvent.type]} · 你的选择会影响真实 MBTI</span>
              </div>
            </div>
            <article className="event-card">
              <div className="event-type">{eventTypeLabels[currentEvent.type]}</div>
              <h2>{currentEvent.title}</h2>
              <p>{currentEvent.body}</p>
              <div className="knowledge-box">
                <ShieldCheck size={18} />
                <span>{currentEvent.knowledge}</span>
              </div>
              <div className="choice-list">
                {currentEvent.choices.map((choice) => (
                  <button key={choice.id} type="button" onClick={() => selectDeliveryChoice(choice)}>
                    <span>{choice.label}</span>
                    {choice.detail && <small>{choice.detail}</small>}
                    <em>{Object.entries(choice.effect).map(([key, value]) => `${deliveryLabels[key as keyof DeliveryScore]}${formatSigned(value ?? 0)}`).join(" · ")}</em>
                  </button>
                ))}
              </div>
            </article>
            <div className="delivery-meters">
              {Object.entries(deliveryScore).map(([key, value]) => (
                <div key={key}>
                  <span>{deliveryLabels[key as keyof DeliveryScore]}</span>
                  <strong>{value}</strong>
                  <i style={{ width: `${value}%` }} />
                </div>
              ))}
            </div>
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
                      <span>今天你吃商几级？</span>
                      <small>FOOD IQ TEST</small>
                    </div>
                  </div>
                  <strong>已送达</strong>
                </div>
                <div className="ticket-title">
                  <h2>吃商测试小票</h2>
                  <p>你的每次配送选择都在推导人格</p>
                </div>

                <div className="journey-ledger">
                  {summary.journeyLines.map((line) => (
                    <div key={line}>
                      <BadgeCheck size={16} />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>

                <div className="score-trio">
                  <div><Sparkles size={18} /><strong>{summary.finalScores.joyIndex}</strong><span>快乐值</span></div>
                  <div><HeartPulse size={18} /><strong>{summary.finalScores.healthIndex}</strong><span>健康值</span></div>
                  <div><ShieldCheck size={18} /><strong>{summary.finalScores.safetyIndex}</strong><span>安全值</span></div>
                </div>

                <div className="receipt">
                  <div className="receipt-top">
                    <ReceiptText size={18} />
                    <span>{summary.orderTitle}</span>
                  </div>
                  {cart.map((entry, index) => (
                    <div className="receipt-line" key={`${entry.item.id}-${index}`}>
                      <span>{entry.item.name} x{entry.quantity}{getEntryOptionSummary(entry) ? ` · ${getEntryOptionSummary(entry)}` : ""}</span>
                      <b>¥{getEntrySubtotal(entry)}</b>
                    </div>
                  ))}
                  {couponDiscount > 0 && (
                    <div className="receipt-line discount">
                      <span>{selectedCoupon?.label}</span>
                      <b>-¥{couponDiscount}</b>
                    </div>
                  )}
                  <div className="receipt-line">
                    <span>钱包实付</span>
                    <b>¥{payablePrice}</b>
                  </div>
                  {summary.receiptLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <div className="barcode" aria-hidden="true" />
                </div>
              </section>

              <section className="persona-card" aria-label="真实 MBTI 吃商人格">
                <div className="persona-visual">
                  <img src={featuredResultImage} alt="" />
                  <div>
                    <span>你的真实 MBTI 吃商人格</span>
                    <strong>{summary.foodPersona.displayName}</strong>
                    <small>{summary.foodPersona.variantTitle}</small>
                  </div>
                </div>
                <p>{summary.foodPersona.description}</p>
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
                复制分享文案
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
