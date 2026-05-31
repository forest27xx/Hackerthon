import { Clipboard, ReceiptText, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { FinalPersonaReceipt, type FinalPersonaReceiptProps } from "./FinalPersonaReceipt";
import { PersonaFlipCard } from "./PersonaFlipCard";
import type { FoodPersonaResult } from "../types";

interface ResultRevealPanelProps {
  receiptProps: FinalPersonaReceiptProps;
  currentPersona: FoodPersonaResult;
  badges: string[];
  nextTip: string;
  gridImage: string;
  onShare: () => void | Promise<void>;
  shareCopied: boolean;
}

export function ResultRevealPanel({ receiptProps, currentPersona, badges, nextTip, gridImage, onShare, shareCopied }: ResultRevealPanelProps) {
  const [view, setView] = useState<"receipt" | "persona">("receipt");

  useEffect(() => {
    setView("receipt");
  }, [currentPersona.code, receiptProps.orderPlacedAt]);

  if (view === "persona") {
    return (
      <section className="result-reveal-panel persona-step" aria-label="吃商人格结果">
        <div className="result-step-toolbar">
          <button type="button" className="result-ghost-button" onClick={() => setView("receipt")}>
            回看小票
          </button>
          <button type="button" className="result-ghost-button" onClick={onShare}>
            <Clipboard size={15} />
            {shareCopied ? "已复制" : "复制分享文案"}
          </button>
        </div>
        <PersonaFlipCard currentPersona={currentPersona} badges={badges} nextTip={nextTip} gridImage={gridImage} />
      </section>
    );
  }

  return (
    <section className="result-reveal-panel receipt-step" aria-label="最终小票与人格入口">
      <FinalPersonaReceipt {...receiptProps} />
      <div className="receipt-to-persona-panel">
        <div>
          <span>
            <ReceiptText size={16} />
            小票已生成
          </span>
          <strong>这张小票先记录你的真实下单证据。</strong>
          <p>确认完订单、优惠和配送选择后，再翻开吃商人格卡，看这单最终归到哪一种 EATI 风格。</p>
        </div>
        <button type="button" className="reveal-persona-button" onClick={() => setView("persona")}>
          <Sparkles size={17} />
          查看我的吃商人格
        </button>
        <button type="button" className="share-inline-button" onClick={onShare}>
          <Clipboard size={15} />
          {shareCopied ? "已复制" : "复制分享文案"}
        </button>
      </div>
    </section>
  );
}
