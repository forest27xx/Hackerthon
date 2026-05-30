import { toPng } from "html-to-image";
import {
  BadgeCheck,
  BadgePercent,
  Bike,
  CakeSlice,
  Check,
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
  Utensils,
  type LucideIcon
} from "lucide-react";
import { useMemo, useRef, useState, type CSSProperties } from "react";
import { categories, comboRules, deliveryEvents, menuItems, moods } from "./data/catalog";
import {
  applyComboBonuses,
  applyEventChoice,
  computeActiveCombos,
  computeOrderTotals,
  generateResultSummary,
  getDefaultChoices,
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

function App() {
  const [stage, setStage] = useState<Stage>("mood");
  const [mood, setMood] = useState<Mood>(moodDefault);
  const [activeCategory, setActiveCategory] = useState<Category>("milkTea");
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [draftChoices, setDraftChoices] = useState<Record<string, string[]>>({});
  const [route, setRoute] = useState<DeliveryEvent[]>([]);
  const [eventIndex, setEventIndex] = useState(0);
  const [deliveryScore, setDeliveryScore] = useState<DeliveryScore>(initialDeliveryScore);
  const [selectedEvents, setSelectedEvents] = useState<{ event: DeliveryEvent; choice: DeliveryChoice }[]>([]);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const visibleItems = useMemo(() => menuItems.filter((item) => item.category === activeCategory), [activeCategory]);
  const totals = useMemo(() => computeOrderTotals(cart), [cart]);
  const combos = useMemo(() => computeActiveCombos(cart, comboRules, mood), [cart, mood]);
  const statsWithCombo = useMemo(() => applyComboBonuses(totals.stats, combos), [totals.stats, combos]);
  const summary = useMemo(
    () =>
      generateResultSummary({
        mood,
        totals: { price: totals.price, stats: totals.stats },
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
    [cart, combos, deliveryScore, mood, selectedEvents, totals.price, totals.stats]
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
  const cartDiscount = cartCount >= 3 ? 6 : cartCount >= 2 ? 3 : 0;
  const payablePrice = Math.max(0, totals.price - cartDiscount);
  const cartBoosts = [
    { label: "快乐", value: Math.max(0, Math.round(statsWithCombo.joy)) },
    { label: "健康", value: Math.round(statsWithCombo.health) },
    { label: "安全", value: Math.round(statsWithCombo.safety) }
  ];
  const featuredResultImage = cart[0] ? resolveMenuImage(cart[0].item) : resolveMenuImage(menuItems[0]);

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
    if (cart.length === 0) return;
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
    setRoute([]);
    setSelectedEvents([]);
    setDeliveryScore(initialDeliveryScore);
    setEventIndex(0);
  };

  return (
    <main className="page-shell">
      <section className="phone-frame" aria-label="快乐下单事务所">
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
            <p>{stage === "delivery" ? "订单路上处理中" : stage === "result" ? "快乐订单已生成" : "选择今日下单目的"}</p>
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
                <h2>今天为什么下单？</h2>
                <p>先选择今日下单目的，它会成为美食人格判断的第一层线索，后续点单、备注和互动选择都会继续加权。</p>
              </div>
              <div className="mini-receipt">
                <ReceiptText size={22} />
                <span>这不是普通购物车，是一张记录今日快乐动机的小纸条。</span>
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
          <section className="order-screen">
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

            <section className="combo-showcase" aria-label="超值搭配">
              <div className="section-heading">
                <div>
                  <h2>超值搭配</h2>
                  <p>组合下单，快乐翻倍</p>
                </div>
                <Tags size={18} />
              </div>
              <div className="combo-cards">
                {(combos.length > 0 ? combos : comboRules.slice(0, 3)).slice(0, 3).map((combo, index) => (
                  <article key={combo.id}>
                    <span>{index === 0 ? "当前最搭" : "隐藏组合"}</span>
                    <strong>{combo.name}</strong>
                    <p>{combo.description}</p>
                  </article>
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
                          <span key={tag}>{tag}</span>
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
              <div className="cart-basket">
                <ShoppingBag size={28} />
                <b>{cartCount}</b>
              </div>
              <div className="cart-main">
                <div>
                  <strong>¥{payablePrice}</strong>
                  <span>{cartDiscount > 0 ? `优惠¥${cartDiscount} · ` : ""}事务所订单 · {cartCount} 件</span>
                  <div className="cart-boosts">
                    {cartBoosts.map((boost) => (
                      <em key={boost.label}>{boost.label} {formatSigned(boost.value)}</em>
                    ))}
                  </div>
                </div>
              </div>
              <button type="button" onClick={startDelivery} disabled={cart.length === 0}>
                下单
              </button>
            </aside>

            {cart.length > 0 && (
              <div className="cart-drawer">
                <div className="combo-row">
                  {combos.slice(0, 3).map((combo) => (
                    <span key={combo.id}>{combo.name}</span>
                  ))}
                  {combos.length === 0 && <span>再加 1-2 件试试隐藏 combo</span>}
                </div>
                {cart.map((entry, index) => (
                  <div className="cart-line" key={`${entry.item.id}-${index}`}>
                    <span>{entry.item.name}</span>
                    <div>
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
                <strong>配送事件 {eventIndex + 1} / {route.length}</strong>
                <span>{eventTypeLabels[currentEvent.type]}</span>
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
                      <span>快乐下单事务所</span>
                      <small>HAPPY ORDER OFFICE</small>
                    </div>
                  </div>
                  <strong>已送达</strong>
                </div>
                <div className="ticket-title">
                  <h2>快乐订单小票</h2>
                  <p>感谢你的每一次认真选择</p>
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
                  {cart.map((entry) => (
                    <div className="receipt-line" key={entry.item.id}>
                      <span>{entry.item.name} x{entry.quantity}</span>
                      <b>¥{entry.item.price * entry.quantity}</b>
                    </div>
                  ))}
                  {summary.receiptLines.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  <div className="barcode" aria-hidden="true" />
                </div>
              </section>

              <section className="persona-card" aria-label="美食人格 MBTI">
                <div className="persona-visual">
                  <img src={featuredResultImage} alt="" />
                  <div>
                    <span>你的美食人格 MBTI</span>
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
                  <strong>¥{editingItem.price}</strong>
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
