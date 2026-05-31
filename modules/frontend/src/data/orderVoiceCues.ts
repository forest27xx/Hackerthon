import type { OrderProgressEvent } from "../types";

export type OrderVoiceRole = "merchant" | "rider" | "system";

export interface OrderVoiceCue {
  role: OrderVoiceRole;
  text: string;
  src: string;
  voice: string;
  style: string;
}

type VoiceCueSource = Pick<OrderProgressEvent, "id" | "sender"> & Partial<Pick<OrderProgressEvent, "body" | "title">>;

const merchantSenders = new Set([
  "商家",
  "奶茶店",
  "咖啡店",
  "热食店",
  "甜品柜",
  "小吃店",
  "轻食店",
  "饮品店",
  "活动商家"
]);

const roleVoice: Record<OrderVoiceRole, string> = {
  merchant: "茉莉",
  rider: "苏打",
  system: "白桦"
};

export const orderVoiceStyles: Record<OrderVoiceRole, string> = {
  merchant: "年轻女店员，语速稍快，服务感自然，像忙碌店铺里顺手提醒一句，不夸张，不机械。",
  rider: "年轻男骑手，语速稍快，口语化，路上实时沟通的感觉，真诚利落。",
  system: "男声科普旁白，语速稍快，清楚、官方、秒懂百科感，只做一句提示。"
};

const cueOverrides: Record<string, string> = {
  "m-accepted-peak": "现在有点忙，我慢点做好。",
  "m-accepted-note": "备注我看到了，马上安排。",
  "m-accepted-generic": "订单接到了，开始制作。",
  "m-spec-sugar": "甜度要不要再确认一下？",
  "m-spec-ice": "冰量我这边再跟你确认。",
  "m-spec-coffee": "咖啡口感，我给你拿稳。",
  "m-spec-spicy": "辣度这里，别冲太猛。",
  "m-spec-portion": "份量要不要加一点？",
  "m-stock-boba": "这个小料快没了。",
  "m-stock-topping": "配料这里有点变化。",
  "m-stock-dessert": "甜品库存要确认一下。",
  "m-stock-light": "轻食材料我帮你看下。",
  "m-wait-boba": "珍珠还在煮，稍等一下。",
  "m-wait-hotfood": "热食现做，会慢一点。",
  "m-wait-coffee": "咖啡还在萃取。",
  "m-wait-dessert": "甜品要重新装盘。",
  "m-pack-multicup": "多杯我给你分好袋。",
  "m-pack-hotcold": "冷热分开放，放心。",
  "m-pack-soup": "汤我会多封一层。",
  "m-pack-fried": "炸物留口透气一下。",
  "m-pack-cake": "蛋糕我会固定好。",
  "m-discount-near": "差一点就能用券了。",
  "m-discount-upgrade": "升级套餐更划算。",
  "m-discount-balance": "预算这边还能卡一下。",
  "m-complex-friend": "多人单，我帮你分清楚。",
  "m-complex-multishop": "拼单内容我再核一下。",
  "m-package-generic": "包装我会处理稳一点。",
  "m-stock-generic": "库存这边有点小变化。",
  "m-extra-priority-window": "可以优先做，但备注会少看点。",
  "m-extra-staff-combo": "今天有隐藏搭配，要试吗？",
  "m-extra-receipt-name": "袋子写名字，大家更好拿。",
  "m-extra-coupon-switch": "加点小食，券才用得上。",
  "m-extra-caffeine-level": "加浓更醒，也更容易心慌。",
  "m-extra-date-photo": "透明杯更出片，要换吗？",
  "m-extra-protein-choice": "蛋白可以加一份。",
  "m-extra-late-night-light": "深夜模式，建议轻一点。",
  "m-extra-soup-lid": "汤盒多封一层，更稳。",
  "m-extra-new-dessert-size": "新品只剩大份了。",
  "m-extra-friend-add": "朋友想顺手加一份。",
  "m-extra-office-split": "公司单可以分袋装。",
  "m-extra-fries-vent": "炸物要脆，袋口得透气。",
  "m-extra-activity-proof": "兑换码先单独存好。",
  "m-extra-lid-sticker": "杯盖多贴一圈更稳。",
  "m-extra-budget-reset": "这单有点超预算了。",
  "r-pickup-wait": "我到店了，还在等餐。",
  "r-pickup-multishop": "我这边要多取一单。",
  "r-pickup-cold": "冷饮我会尽快带走。",
  "r-pickup-hot": "热餐我拿稳再走。",
  "r-road-late": "路上有点堵，我尽快。",
  "r-road-rain": "外面下雨，我稳一点骑。",
  "r-road-heat": "外面很热，冷饮可能化冰。",
  "r-road-call": "我可能需要打个电话。",
  "r-road-traffic": "前面堵住了，我绕一下。",
  "r-road-detour": "绕一点路，会更稳。",
  "r-road-chat": "路上想补话，语气要轻。",
  "r-road-wrongturn": "路线变了，我重新导航。",
  "r-address-office": "我到楼下了，前台要登记。",
  "r-address-home": "门禁进不去，给个取餐点。",
  "r-address-phone": "骑手来电，位置要确认。",
  "r-delivery-frontdesk": "前台单多，要拍放置点吗？",
  "r-delivery-downstairs": "电梯有点堵，我尽快。",
  "r-delivery-contactless": "快到了，放哪里更合适？",
  "r-status-multicup": "杯子有点多，我核下标签。",
  "r-status-cold": "冷饮口感正在抢时间。",
  "r-status-hot": "热食温度在往下走。",
  "r-status-tilt": "刚才有点颠，到门口先看。",
  "r-tone-thanks": "还有两百米，方便取吗？",
  "r-tone-location": "定位偏了，补个入口吧。",
  "r-pickup-receipt": "尾号我在店里核对。",
  "r-arrival-parking": "楼下不好停，我不能久等。",
  "r-arrival-gate": "门禁这里需要确认。",
  "r-arrival-building": "楼栋我再找一下。",
  "r-arrival-frontdesk": "要不要放前台？",
  "r-arrival-phone": "我快到了，保持电话通畅。",
  "r-extra-pickup-queue-photo": "我到店了，前面还排着。",
  "r-extra-pickup-double-check": "饮品热食我帮你核数。",
  "r-extra-pickup-pin": "取餐码末尾发我一下。",
  "r-extra-pickup-late-merchant": "还差封袋，我先等等？",
  "r-extra-road-wind": "风有点大，我骑稳点。",
  "r-extra-road-school": "学校门口人多，我绕稳点。",
  "r-extra-road-light-rain": "小雨来了，袋口可能湿。",
  "r-extra-road-bridge": "前面颠，绕开更护餐。",
  "r-extra-road-chat-tone": "现在补一句，别太硬。",
  "r-extra-road-cold-drink": "冷饮有点化，收餐快点。",
  "r-extra-road-keepwarm": "保温袋紧张，我分开拿。",
  "r-extra-arrival-lobby-crowd": "前台单多，别放混了。",
  "r-extra-arrival-gate-code": "门禁要临时码。",
  "r-extra-arrival-phone-silent": "手机静音，就先发说明。",
  "r-extra-arrival-name-similar": "名字相似，得加个标识。",
  "r-extra-arrival-elevator": "电梯排队，要等还是下楼？",
  "a-check-missing": "先确认袋子里的东西。",
  "a-check-spill": "有洒漏先拍照留证。",
  "a-check-warmth": "温度到手先判断。",
  "a-check-rating": "评价前，先看整体体验。",
  "a-first-sip": "第一口到了，先别急评。",
  "a-first-food": "香味出来了，快乐上线。",
  "a-photo-share": "包装好看，可以拍一下。",
  "a-package-check": "先核小票和备注。",
  "a-late-complete": "晚了几分钟，但东西完整。",
  "a-missing-topping": "加料不太一样，先确认。",
  "a-healthy-balance": "很香，但不算轻负担。",
  "a-discount-guilt": "省到了，也多点了。",
  "a-extra-first-smell": "还没开袋，香味先到了。",
  "a-extra-table-setup": "桌面有点乱，先摆一摆。",
  "a-extra-sauce-pack": "酱料很多，别一次全倒。",
  "a-extra-share-review": "体验不错，收尾也重要。",
  "a-extra-leftover-plan": "分量挺多，剩下要安排。",
  "a-extra-wrong-but-good": "有小偏差，但味道不错。",
  "a-extra-afterwork-reset": "吃之前，给自己收个工。",
  "a-extra-next-order": "这单结束，复盘一下。"
};

export const orderVoiceAssetPath = (eventId: string) => `/audio/voice/order-progress/${eventId}/message.mp3`;

export const getOrderVoiceRole = (sender: string): OrderVoiceRole => {
  if (sender === "骑手") return "rider";
  if (merchantSenders.has(sender)) return "merchant";
  return "system";
};

const normalizeCueText = (value: string) =>
  value
    .replace(/\s+/g, "")
    .replace(/[“”]/g, "")
    .replace(/你希望.*$/u, "")
    .replace(/你要.*$/u, "")
    .replace(/可以.*$/u, "")
    .replace(/怎么办.*$/u, "")
    .replace(/怎么回.*$/u, "");

const clipCueText = (value: string, maxLength = 24) => {
  const clean = value.replace(/\s+/g, "").replace(/[“”]/g, "");
  return clean.length <= maxLength ? clean : `${clean.slice(0, maxLength - 1)}。`;
};

const compactCueText = (value: string, maxLength = 23) => {
  const firstClause = normalizeCueText(value).split(/[。！？?!；;]/u)[0] || value;
  const withStop = /[。！？?!]$/u.test(firstClause) ? firstClause : `${firstClause}。`;
  return clipCueText(withStop, maxLength);
};

const fallbackCueText = (event: VoiceCueSource) => {
  const role = getOrderVoiceRole(event.sender);
  const source = event.body || event.title || event.sender;
  const compact = compactCueText(source);

  if (role === "rider" && !/我|这边|到了|路上/u.test(compact)) return compactCueText(`我这边${compact}`);
  if (role === "merchant" && !/我|这边|店/u.test(compact)) return compactCueText(`这边${compact}`);
  return compact;
};

export const getOrderVoiceCue = (event: VoiceCueSource): OrderVoiceCue => {
  const role = getOrderVoiceRole(event.sender);
  const text = cueOverrides[event.id] ?? fallbackCueText(event);

  return {
    role,
    text: clipCueText(text, 24),
    src: orderVoiceAssetPath(event.id),
    voice: roleVoice[role],
    style: orderVoiceStyles[role]
  };
};
