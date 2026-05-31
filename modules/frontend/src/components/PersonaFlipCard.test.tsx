import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { foodPersonaTypes } from "../data/foodPersonas";
import { PersonaFlipCard } from "./PersonaFlipCard";
import type { FoodPersonaResult } from "../types";

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

describe("PersonaFlipCard", () => {
  it("flips from the current result into a clickable 16-persona index and back", async () => {
    const user = userEvent.setup();

    render(
      <PersonaFlipCard
        badges={["包装完整主义者", "安心控场"]}
        currentPersona={currentPersona}
        gridImage="chi-shang-grid-v2.png"
        nextTip="下一单继续保持控场。"
      />
    );

    expect(screen.getByText("你的吃商人格")).toBeInTheDocument();
    expect(screen.getByText("HCGL 完成度洁癖症")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "查看16型图鉴" }));

    expect(screen.getByText("EATI 16 型图鉴")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /查看人格/ })).toHaveLength(16);

    await user.click(screen.getByRole("button", { name: /查看人格 NERL 随缘重口怪/ }));

    expect(screen.getByText("NERL 随缘重口怪")).toBeInTheDocument();
    expect(screen.getByText(/你会被一个清晰的重口需求牵引/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "回到我的结果" }));

    expect(screen.getByText("你的吃商人格")).toBeInTheDocument();
    expect(screen.getByText("HCGL 完成度洁癖症")).toBeInTheDocument();
  });
});
