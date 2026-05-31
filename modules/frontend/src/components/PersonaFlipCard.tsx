import { HeartPulse, Sparkles } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { foodPersonaTypes, personaAvatarPositions } from "../data/foodPersonas";
import type { FoodPersonaResult, FoodPersonaType } from "../types";

interface PersonaFlipCardProps {
  currentPersona: FoodPersonaResult;
  badges: string[];
  nextTip: string;
  gridImage: string;
}

interface PersonaAvatarSpriteProps {
  code: string;
  gridImage: string;
  label: string;
  className?: string;
}

const personaCodes = Object.keys(foodPersonaTypes);

function getPersonaDisplayName(persona: FoodPersonaType) {
  return `${persona.code} ${persona.name}`;
}

function PersonaAvatarSprite({ code, gridImage, label, className = "" }: PersonaAvatarSpriteProps) {
  const position = personaAvatarPositions[code] ?? { x: 0, y: 0 };

  return (
    <div
      className={`persona-avatar-sprite ${className}`.trim()}
      aria-label={label}
      role="img"
      style={
        {
          "--avatar-x": position.x,
          "--avatar-y": position.y
        } as CSSProperties
      }
    >
      <img src={gridImage} alt="" />
    </div>
  );
}

export function PersonaFlipCard({ currentPersona, badges, nextTip, gridImage }: PersonaFlipCardProps) {
  const [side, setSide] = useState<"front" | "back">("front");
  const [selectedCode, setSelectedCode] = useState(currentPersona.code);
  const selectedPersona = foodPersonaTypes[selectedCode] ?? currentPersona;
  const selectedDisplayName = selectedCode === currentPersona.code ? currentPersona.displayName : getPersonaDisplayName(selectedPersona);
  const isBack = side === "back";

  useEffect(() => {
    setSelectedCode(currentPersona.code);
    setSide("front");
  }, [currentPersona.code]);

  return (
    <section
      className={`persona-card persona-flip-card rarity-${currentPersona.rarity.key}`}
      aria-label="吃商人格结果与16型图鉴"
      style={{ "--persona-grid-image": `url(${gridImage})` } as CSSProperties}
    >
      <div className="persona-flip-stage">
        <div className={`persona-flip-inner ${isBack ? "is-flipped" : ""}`}>
          {!isBack && (
            <div className="persona-card-face persona-card-front">
              <div className="persona-visual">
                <PersonaAvatarSprite code={currentPersona.code} gridImage={gridImage} label={currentPersona.displayName} />
                <div>
                  <span>你的吃商人格</span>
                  <strong>{currentPersona.displayName}</strong>
                  <small>{currentPersona.variantTitle}</small>
                </div>
              </div>
              <div className="persona-confidence">
                <span>
                  {currentPersona.rarity.level === "Hidden" ? "Hidden" : `Lv.${currentPersona.rarity.level}`} · {currentPersona.rarity.label}
                </span>
                <b>{currentPersona.dominantAxis.leaningLabel}</b>
              </div>
              <div className="persona-level-note">{currentPersona.rarity.reason}</div>
              <p>{currentPersona.description}</p>
              <div className="persona-logic-note">
                点单内容决定吃商底色；订单进行中的选择决定过程修正和变体称号。过程指数只辅助强化 C/E、G/R 等轴，不会单独决定人格。
              </div>
              <div className="persona-evidence-list">
                {currentPersona.evidenceLines.map((line) => (
                  <div key={`${line.type}-${line.label}`}>
                    <span>{line.label}</span>
                    <p>{line.text}</p>
                  </div>
                ))}
              </div>
              <div className="variant-reason">
                <Sparkles size={17} />
                <span>{currentPersona.variantReason}</span>
              </div>
              <div className="axis-list">
                {currentPersona.axes.map((axis) => (
                  <div className="axis-row" key={axis.key}>
                    <div>
                      <span>{axis.leftLabel}</span>
                      <b>{axis.codeLetter}</b>
                      <span>{axis.rightLabel}</span>
                    </div>
                    <i>
                      <em style={{ left: `${axis.value}%` }} />
                    </i>
                  </div>
                ))}
              </div>
              <div className="persona-badges">
                {badges.map((badge) => (
                  <span key={badge}>{badge}</span>
                ))}
              </div>
              <div className="next-tip">
                <HeartPulse size={18} />
                <span>{nextTip}</span>
              </div>
              <div className="persona-card-actions">
                <button type="button" className="persona-flip-button" onClick={() => setSide("back")}>
                  查看16型图鉴
                </button>
              </div>
            </div>
          )}

          {isBack && (
            <div className="persona-card-face persona-card-back">
              <div className="persona-index-head">
                <span>点击任意头像查看说明</span>
                <strong>EATI 16 型图鉴</strong>
                <p>背面是全套人格索引：图片只负责角色气质，具体名称、解释和跳转由页面托管，避免生图文字乱码。</p>
              </div>

              <div className="persona-index-grid" aria-label="16型人格索引">
                {personaCodes.map((code) => {
                  const persona = foodPersonaTypes[code];
                  const isCurrent = code === currentPersona.code;
                  const isSelected = code === selectedCode;

                  return (
                    <button
                      type="button"
                      key={code}
                      className={`persona-index-button ${isCurrent ? "is-current" : ""} ${isSelected ? "selected" : ""}`.trim()}
                      aria-label={`查看人格 ${persona.code} ${persona.name}`}
                      aria-pressed={isSelected}
                      onClick={() => setSelectedCode(code)}
                    >
                      <PersonaAvatarSprite code={code} gridImage={gridImage} label={getPersonaDisplayName(persona)} className="persona-index-sprite" />
                      <span>{persona.code}</span>
                      <b>{persona.name}</b>
                    </button>
                  );
                })}
              </div>

              <div className="persona-index-detail">
                <PersonaAvatarSprite code={selectedPersona.code} gridImage={gridImage} label={selectedDisplayName} className="persona-detail-sprite" />
                <div>
                  <span>{selectedCode === currentPersona.code ? "当前结果" : "图鉴人格"}</span>
                  <strong>{selectedDisplayName}</strong>
                  <small>{selectedPersona.shortLine}</small>
                </div>
                <p>{selectedPersona.description}</p>
                <div className="persona-keyword-strip">
                  {selectedPersona.keywords.map((keyword) => (
                    <span key={keyword}>{keyword}</span>
                  ))}
                </div>
                <div className="persona-next-order">
                  <HeartPulse size={16} />
                  <span>{selectedPersona.nextOrder}</span>
                </div>
              </div>

              <div className="persona-card-actions">
                <button type="button" className="persona-flip-button" onClick={() => setSide("front")}>
                  回到我的结果
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
