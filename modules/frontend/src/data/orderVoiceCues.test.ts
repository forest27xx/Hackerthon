import { describe, expect, it } from "vitest";
import { orderProgressEventBank } from "../lib/orderProgressEngine";
import { getOrderVoiceCue, getOrderVoiceRole, orderVoiceAssetPath } from "./orderVoiceCues";

describe("orderVoiceCues", () => {
  it("provides one concise message cue for every order progress event", () => {
    orderProgressEventBank.forEach((event) => {
      const cue = getOrderVoiceCue(event);

      expect(cue, event.id).toBeTruthy();
      expect(cue?.text.length, event.id).toBeLessThanOrEqual(24);
      expect(cue?.src).toBe(orderVoiceAssetPath(event.id));
      expect(cue?.src).toBe(`/audio/voice/order-progress/${event.id}/message.mp3`);
    });
  });

  it("maps event senders onto the three planned voice roles", () => {
    expect(getOrderVoiceRole("骑手")).toBe("rider");
    expect(getOrderVoiceRole("商家")).toBe("merchant");
    expect(getOrderVoiceRole("奶茶店")).toBe("merchant");
    expect(getOrderVoiceRole("系统")).toBe("system");
    expect(getOrderVoiceRole("朋友")).toBe("system");
  });
});
