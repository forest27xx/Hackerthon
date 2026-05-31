import { menuItems } from "./catalog";
import type { Category, MenuItem, PersonaAxisKey } from "../types";

export type ItemPersonaRole = "main" | "drink" | "dessert" | "snack" | "side" | "deal" | "activity";

export interface ItemPersonaProfile {
  itemId: string;
  itemName: string;
  role: ItemPersonaRole;
  axisDelta: Partial<Record<PersonaAxisKey, number>>;
  evidenceTags: string[];
  reason: string;
}

const categoryRole: Record<Category, ItemPersonaRole> = {
  milkTea: "drink",
  coffee: "drink",
  dessert: "dessert",
  snack: "snack",
  nightFood: "main",
  lightFood: "main",
  activity: "activity",
  staple: "main",
  stirFry: "main",
  soupPot: "main",
  other: "side"
};

const emptyAxisDelta = (): Record<PersonaAxisKey, number> => ({
  structure: 0,
  restraint: 0,
  control: 0,
  deal: 0
});

const addTag = (tags: Set<string>, tag: string) => tags.add(tag);

const addReason = (reasons: string[], reason: string) => {
  if (!reasons.includes(reason)) reasons.push(reason);
};

const includesAny = (value: string, words: string[]) => words.some((word) => value.includes(word));

export const inferItemPersonaProfile = (item: MenuItem): ItemPersonaProfile => {
  const role = categoryRole[item.category] ?? "side";
  const delta = emptyAxisDelta();
  const evidenceTags = new Set<string>();
  const reasons: string[] = [];
  const name = item.name;
  const tags = new Set(item.tags);

  if (role === "main") {
    delta.structure -= 2;
    addTag(evidenceTags, "核心主角");
    addReason(reasons, `${name}像本单主角，会把结构推向更明确的核心需求。`);
  }

  if (role === "drink" || role === "dessert" || role === "snack" || role === "side" || role === "activity") {
    delta.structure += role === "side" ? 4 : 2;
    addTag(evidenceTags, role === "side" ? "配角/收尾" : "补充模块");
    addReason(reasons, `${name}提供饮品、甜点、小食或收尾证据，偏向拼图型搭配。`);
  }

  if (tags.has("share") || tags.has("party") || tags.has("combo") || item.category === "activity") {
    delta.structure += 5;
    addTag(evidenceTags, "组合/分享");
    addReason(reasons, `${name}带有分享或组合属性，会加强一整套下单的证据。`);
  }

  if (tags.has("healthy") || tags.has("lowSugar") || tags.has("light") || tags.has("protein") || tags.has("healthyNote")) {
    delta.restraint += 6;
    addTag(evidenceTags, "刹车证据");
    addReason(reasons, `${name}提供低糖、轻负担或蛋白证据，偏 C 刹车型。`);
  }

  if (tags.has("sweet") || tags.has("spicy") || tags.has("fried") || tags.has("cheese") || tags.has("bold")) {
    delta.restraint -= 6;
    addTag(evidenceTags, "油门证据");
    addReason(reasons, `${name}的甜、辣、炸或浓郁感会把本单推向 E 油门型。`);
  }

  if (tags.has("fullness") || tags.has("chewy") || includesAny(name, ["加量", "双", "肥牛", "鸡排", "肉", "珍珠", "芋泥"])) {
    delta.restraint -= 3;
    addTag(evidenceTags, "满足感");
    addReason(reasons, `${name}有加量、饱腹或口感存在感，是即时满足证据。`);
  }

  if (item.stats.health >= 8) {
    delta.restraint += 4;
    addTag(evidenceTags, "健康修正");
  }

  if (item.stats.health <= -6 || item.stats.joy >= 24) {
    delta.restraint -= 4;
    addTag(evidenceTags, "快乐超车");
  }

  if (tags.has("safe") || tags.has("separatePack")) {
    delta.control += 7;
    addTag(evidenceTags, "控场包装");
    addReason(reasons, `${name}带来包装、分装或安全确认，偏 G 控场型。`);
  }

  if (tags.has("warm") || item.category === "soupPot" || includesAny(name, ["汤", "锅", "粉", "面", "冰", "奶茶"])) {
    delta.control += 2;
    addTag(evidenceTags, "到手状态敏感");
    addReason(reasons, `${name}对温度、撒漏或口感状态敏感，需要更清晰的到手控制。`);
  }

  if (tags.has("fun") || tags.has("bold") || includesAny(name, ["盲盒", "新品", "Dirty", "榴莲", "发疯"])) {
    delta.control -= 3;
    addTag(evidenceTags, "接受变量");
    addReason(reasons, `${name}自带一点惊喜或社交风险，也会增加随缘接受的气质。`);
  }

  if (item.price <= 9 || tags.has("combo") || includesAny(name, ["餐具包", "米饭", "小菜", "蘸料", "辣椒油", "萝卜"])) {
    delta.deal += 6;
    addTag(evidenceTags, "凑单小件");
    addReason(reasons, `${name}价格轻、适合补差或完善组合，是 S 薅毛型证据。`);
  }

  if (item.price >= 28 || role === "activity") {
    delta.deal -= 3;
    addTag(evidenceTags, "随心主张");
    addReason(reasons, `${name}更像主动想要的核心体验，不太像被优惠牵着走。`);
  }

  if (tags.has("caffeine")) {
    addTag(evidenceTags, "咖啡因续命");
    addReason(reasons, `${name}提供清醒续航证据，通常来自明确的当下需求。`);
  }

  if (tags.has("fruit") || tags.has("refresh")) {
    addTag(evidenceTags, "清爽收尾");
  }

  return {
    itemId: item.id,
    itemName: item.name,
    role,
    axisDelta: delta,
    evidenceTags: Array.from(evidenceTags).slice(0, 5),
    reason: reasons[0] ?? `${name}按品类、标签、价格和数值自动生成吃商画像。`
  };
};

export const itemPersonaProfiles: Record<string, ItemPersonaProfile> = Object.fromEntries(
  menuItems.map((item) => [item.id, inferItemPersonaProfile(item)])
) as Record<string, ItemPersonaProfile>;

export const getItemPersonaProfile = (item: MenuItem): ItemPersonaProfile =>
  itemPersonaProfiles[item.id] ?? inferItemPersonaProfile(item);

export const missingItemPersonaProfileIds = menuItems
  .filter((item) => !itemPersonaProfiles[item.id])
  .map((item) => item.id);
