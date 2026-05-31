import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import type { CartEntry, ComboRule, DeliveryScore, ResultSummary, Stats } from "../types";
import { getSelectedOptionChoices } from "../lib/gameEngine";

type ReceiptPersonaCode = `${"H" | "N"}${"C" | "E"}${"G" | "R"}${"S" | "L"}`;
type ReceiptGroup = "HC" | "HE" | "NC" | "NE";
type ReceiptTheme = "magic" | "anime" | "plush" | "ink";

type FinalPersonaReceiptProps = {
  entries: CartEntry[];
  totals: { price: number; stats: Stats };
  combos: ComboRule[];
  couponDiscount: number;
  baseCouponDiscount: number;
  couponBoostDiscount: number;
  selectedCouponLabel?: string;
  payablePrice: number;
  deliveryScore: DeliveryScore;
  orderPlacedAt?: number | null;
  summary: ResultSummary;
};

const receiptGroups: Record<ReceiptGroup, { theme: ReceiptTheme; title: string }> = {
  HC: {
    theme: "magic",
    title: "快乐下单事务所"
  },
  HE: {
    theme: "anime",
    title: "快乐下单事务所"
  },
  NC: {
    theme: "plush",
    title: "快乐下单事务所"
  },
  NE: {
    theme: "ink",
    title: "快乐下单事务所"
  }
};

const receiptGroupOrder: ReceiptGroup[] = ["HC", "HE", "NC", "NE"];

const money = (value: number) => value.toFixed(2);

const isReceiptPersonaCode = (code: string): code is ReceiptPersonaCode => /^[HN][CE][GR][SL]$/.test(code);

const formatReceiptTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

const formatOrderNo = (timestamp: number, amount: number) => {
  const date = new Date(timestamp);
  const pad = (value: number) => String(value).padStart(2, "0");
  const stamp = `${pad(date.getMonth() + 1)}${pad(date.getDate())}${pad(date.getHours())}${pad(date.getMinutes())}`;
  return `CS${stamp}${String(Math.round(amount * 100)).padStart(5, "0")}`;
};

const getOptionSummary = (entry: CartEntry) =>
  getSelectedOptionChoices(entry)
    .map((choice) => choice.label)
    .filter((label) => !["按商品默认", "默认口味", "默认奶基", "默认汤底", "标准酱", "标准甜", "正常冰", "标准份", "标准杯", "中杯", "单人份", "单份", "单人小锅"].includes(label))
    .join(" / ");

export function FinalPersonaReceipt({
  entries,
  totals,
  combos,
  couponDiscount,
  baseCouponDiscount,
  couponBoostDiscount,
  selectedCouponLabel,
  payablePrice,
  deliveryScore,
  orderPlacedAt,
  summary
}: FinalPersonaReceiptProps) {
  const code = isReceiptPersonaCode(summary.foodPersona.code) ? summary.foodPersona.code : "HCGS";
  const defaultGroupKey = code.slice(0, 2) as ReceiptGroup;
  const [activeGroupKey, setActiveGroupKey] = useState<ReceiptGroup>(defaultGroupKey);
  const dragStartXRef = useRef<number | null>(null);
  const dragStartYRef = useRef<number | null>(null);
  const dragPointerIdRef = useRef<number | null>(null);
  const group = receiptGroups[activeGroupKey];
  const receiptItems =
    entries.length > 0
      ? entries.map((entry) => {
          const optionSummary = getOptionSummary(entry);
          const unitPrice = entry.item.price + getSelectedOptionChoices(entry).reduce((sum, choice) => sum + (choice.priceDelta ?? 0), 0);
          return {
            name: entry.item.name,
            quantity: entry.quantity,
            optionSummary,
            unitPrice,
            subtotal: unitPrice * entry.quantity
          };
        })
      : [{ name: "快乐托管单", quantity: 1, optionSummary: "系统兜底", unitPrice: payablePrice, subtotal: payablePrice }];
  const receiptTimestamp = orderPlacedAt ?? Date.now();
  const orderNo = formatOrderNo(receiptTimestamp, totals.price);
  const comboName = combos[0]?.name ?? summary.receipt.combos[0] ?? "自由发挥";
  const couponLabel = baseCouponDiscount > 0 ? selectedCouponLabel ?? "人格优惠券" : "未使用优惠券";
  const computedPayablePrice = Math.max(0, totals.price - couponDiscount);
  const showRows = receiptItems;
  const activeGroupIndex = receiptGroupOrder.indexOf(activeGroupKey);
  const certaintyScore = deliveryScore.safety + deliveryScore.integrity + deliveryScore.trust;
  const receiptTime = formatReceiptTime(receiptTimestamp);
  const itemRowsHeight = showRows.reduce((sum, item) => {
    const optionLines = item.optionSummary ? 12 : 0;
    const nameWrapBuffer = item.name.length > 8 ? 8 : 0;
    return sum + 34 + optionLines + nameWrapBuffer;
  }, 0);
  const receiptHeight = 552 + itemRowsHeight + (couponBoostDiscount > 0 ? 22 : 0);

  useEffect(() => {
    setActiveGroupKey(defaultGroupKey);
  }, [defaultGroupKey]);

  const switchGroup = (offset: number) => {
    setActiveGroupKey((current) => {
      const currentIndex = receiptGroupOrder.indexOf(current);
      const nextIndex = (currentIndex + offset + receiptGroupOrder.length) % receiptGroupOrder.length;
      return receiptGroupOrder[nextIndex];
    });
  };

  const resetDrag = () => {
    dragStartXRef.current = null;
    dragStartYRef.current = null;
    dragPointerIdRef.current = null;
  };

  const handlePointerDown = (event: PointerEvent<HTMLElement>) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    dragStartXRef.current = event.clientX;
    dragStartYRef.current = event.clientY;
    dragPointerIdRef.current = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerUp = (event: PointerEvent<HTMLElement>) => {
    const startX = dragStartXRef.current;
    const startY = dragStartYRef.current;
    const pointerId = dragPointerIdRef.current;
    resetDrag();
    if (startX === null || startY === null || pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    if (Math.abs(deltaX) < 46 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) return;
    switchGroup(deltaX < 0 ? 1 : -1);
  };

  return (
    <section className={`final-persona-receipt ${group.theme}`} aria-label="快乐下单事务所小票">
      <div
        className="final-receipt-paper"
        style={{ "--receipt-height": `${receiptHeight}px` } as CSSProperties}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={resetDrag}
      >
        <header className="final-receipt-head">
          <div className="final-receipt-emblem">{group.theme === "magic" ? "✦" : group.theme === "anime" ? "★" : group.theme === "plush" ? "心" : "印"}</div>
          <div>
            <h2>{group.title}</h2>
          </div>
        </header>

        <div className="final-receipt-meta">
          <span>订单编号：{orderNo}</span>
          <span>下单时间：{receiptTime}</span>
        </div>

        <section className="final-receipt-items">
          <div className="final-table-head">
            <span>商品</span>
            <span>数量</span>
            <span>单价(元)</span>
            <span>小计(元)</span>
          </div>
          {showRows.map((item) => (
            <div className="final-table-row" key={`${item.name}-${item.optionSummary}`}>
              <div>
                <strong>{item.name}</strong>
                {item.optionSummary && <small>{item.optionSummary}</small>}
              </div>
              <span>{item.quantity}</span>
              <span>{money(item.unitPrice)}</span>
              <b>{money(item.subtotal)}</b>
            </div>
          ))}
        </section>

        <section className="final-money-ledger">
          <div><span>商品原价</span><b>{money(totals.price)}</b></div>
          <div><span>配送费</span><b>0.00</b></div>
          <div><span>包装费</span><b>0.00</b></div>
          <div><span>{couponLabel}</span><b>{baseCouponDiscount > 0 ? `-${money(baseCouponDiscount)}` : "0.00"}</b></div>
          {couponBoostDiscount > 0 && <div><span>神券膨胀</span><b>-{money(couponBoostDiscount)}</b></div>}
          <div className="final-payable"><span>实付总额</span><strong>¥{money(computedPayablePrice)}</strong></div>
        </section>

        <section className="final-persona-proof">
          <span>触发组合：{comboName}</span>
          <span>配送证据：{summary.receipt.choices[0] ?? summary.receipt.status}</span>
          <span>控场证据：到手稳妥 {certaintyScore}</span>
        </section>

        <footer className="final-receipt-foot">
          <i aria-hidden="true" />
        </footer>
      </div>
      <div className="receipt-style-switcher" aria-label="切换小票样式">
        <button type="button" onClick={() => switchGroup(-1)} aria-label="上一种小票样式">‹</button>
        <div>
          {receiptGroupOrder.map((key, index) => (
            <button
              key={key}
              className={key === activeGroupKey ? "active" : ""}
              type="button"
              onClick={() => setActiveGroupKey(key)}
              aria-label={`切换到${receiptGroups[key].title}`}
              aria-pressed={key === activeGroupKey}
            >
              <span>{index + 1}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={() => switchGroup(1)} aria-label="下一种小票样式">›</button>
        <em>{activeGroupIndex + 1}/4 · 左右滑动切换样式</em>
      </div>
    </section>
  );
}
