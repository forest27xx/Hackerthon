import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { foodPersonaTypes } from "../data/foodPersonas";
import { ResultRevealPanel } from "./ResultRevealPanel";
import type { CartEntry, FoodPersonaResult, ResultSummary } from "../types";

const currentPersona: FoodPersonaResult = {
  ...foodPersonaTypes.HCGL,
  displayName: "HCGL 完成度洁癖症",
  variantTitle: "包装完整主义者",
  axes: [
    { key: "structure", leftLabel: "拼图型", rightLabel: "单点型", leftCode: "H", rightCode: "N", value: 78, codeLetter: "H" },
    { key: "restraint", leftLabel: "刹车型", rightLabel: "油门型", leftCode: "C", rightCode: "E", value: 70, codeLetter: "C" },
    { key: "control", leftLabel: "控场型", rightLabel: "随缘型", leftCode: "G", rightCode: "R", value: 76, codeLetter: "G" },
    { key: "deal", leftLabel: "薅毛型", rightLabel: "随心型", leftCode: "S", rightCode: "L", value: 30, codeLetter: "L" }
  ],
  badges: ["包装完整主义者", "小票核对派"],
  evidenceLines: [
    { type: "structure", label: "商品证据 · H", text: "你点了一整套完整订单。" },
    { type: "control", label: "过程证据 · G", text: "你选择了分装和核对。" }
  ],
  dominantAxis: { key: "control", label: "控场型 / 随缘型", value: 76, codeLetter: "G", leaningLabel: "控场型" },
  variantReason: "因为你选择了分装和核对，这单被标记为包装完整主义者。",
  avatarKey: "perfect-receipt",
  avatarPosition: { x: 1, y: 0 },
  confidenceLabel: "证据样本稳定",
  rarity: { level: 4, key: "gold", label: "高光样本", colorLabel: "金色", reason: "商品和决策高度一致。" }
};

const entry: CartEntry = {
  item: {
    id: "latte",
    name: "热拿铁抱抱杯",
    category: "coffee",
    price: 18,
    description: "暖手咖啡",
    tags: ["drink"],
    stats: { joy: 8, health: 2, fullness: 1, energy: 8, safety: 5 },
    options: []
  },
  quantity: 1,
  selectedChoices: {}
};

const summary: ResultSummary = {
  orderTitle: "热拿铁抱抱杯",
  persona: "HCGL 完成度洁癖症",
  nextTip: "下一单继续保持控场。",
  shareText: "我的吃商人格是 HCGL 完成度洁癖症",
  receiptLines: [],
  journeyLines: [],
  badges: ["包装完整主义者", "安心控场"],
  foodPersona: currentPersona,
  receipt: {
    orderTitle: "热拿铁抱抱杯",
    status: "已核验",
    purpose: "加班回血",
    items: ["热拿铁抱抱杯"],
    choices: ["选择了分装和核对"],
    combos: ["咖啡回血"],
    amount: 18,
    indexes: [],
    evidence: currentPersona.evidenceLines
  },
  personaExplanation: {
    headline: "你的吃商人格",
    axisSummary: "控场稳定",
    evidenceLines: currentPersona.evidenceLines
  },
  finalScores: { joyIndex: 88, healthIndex: 72, safetyIndex: 91 }
};

describe("ResultRevealPanel", () => {
  it("shows the final receipt first, then reveals the persona card by button", async () => {
    const user = userEvent.setup();
    const onShare = vi.fn();

    render(
      <ResultRevealPanel
        receiptProps={{
          entries: [entry],
          totals: { price: 18, stats: entry.item.stats },
          combos: [],
          couponDiscount: 3,
          baseCouponDiscount: 3,
          couponBoostDiscount: 0,
          selectedCouponLabel: "满18减3",
          payablePrice: 15,
          deliveryScore: { speed: 80, safety: 90, health: 70, integrity: 88, trust: 86 },
          orderPlacedAt: new Date("2026-05-31T10:20:00+08:00").getTime(),
          summary
        }}
        currentPersona={currentPersona}
        badges={summary.badges}
        nextTip={summary.nextTip}
        gridImage="chi-shang-grid-v2.png"
        onShare={onShare}
        shareCopied={false}
      />
    );

    expect(screen.getByLabelText("快乐下单事务所小票")).toBeInTheDocument();
    expect(screen.queryByText("你的吃商人格")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "复制分享文案" }));
    expect(onShare).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "查看我的吃商人格" }));

    expect(screen.getByText("你的吃商人格")).toBeInTheDocument();
    expect(screen.getByText("HCGL 完成度洁癖症")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "查看16型图鉴" }));
    expect(screen.getByText("EATI 16 型图鉴")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "回看小票" }));
    expect(screen.getByLabelText("快乐下单事务所小票")).toBeInTheDocument();
  });
});
