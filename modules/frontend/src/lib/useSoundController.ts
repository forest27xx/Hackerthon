import { useCallback, useEffect, useRef, useState } from "react";
import type { OrderVoiceCue, OrderVoiceRole } from "../data/orderVoiceCues";

export type SfxType = "tap" | "select" | "checkout" | "success" | "result";

const BGM_SRC = "/audio/bgm/main-bgm.mp3";

const sfxProfiles: Record<SfxType, { frequency: number; endFrequency: number; duration: number; volume: number }> = {
  tap: { frequency: 760, endFrequency: 980, duration: 0.055, volume: 0.035 },
  select: { frequency: 520, endFrequency: 780, duration: 0.09, volume: 0.045 },
  checkout: { frequency: 430, endFrequency: 740, duration: 0.14, volume: 0.05 },
  success: { frequency: 660, endFrequency: 1120, duration: 0.18, volume: 0.055 },
  result: { frequency: 390, endFrequency: 880, duration: 0.22, volume: 0.055 }
};

const fallbackSpeechProfile: Record<OrderVoiceRole, { rate: number; pitch: number; volume: number }> = {
  merchant: { rate: 1.12, pitch: 1.12, volume: 0.82 },
  rider: { rate: 1.14, pitch: 0.88, volume: 0.86 },
  system: { rate: 1.08, pitch: 0.94, volume: 0.76 }
};

type WindowWithWebkitAudio = Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext };

const isPromiseLike = (value: unknown): value is Promise<unknown> =>
  Boolean(value && typeof (value as Promise<unknown>).catch === "function");

const canUseHtmlAudio = () =>
  typeof Audio !== "undefined" && (typeof navigator === "undefined" || !/jsdom/i.test(navigator.userAgent));

export const useSoundController = () => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [audioReady, setAudioReady] = useState(false);
  const soundEnabledRef = useRef(true);
  const audioReadyRef = useRef(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const bgmAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastVoiceCueRef = useRef<OrderVoiceCue | null>(null);

  const getAudioContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (audioContextRef.current) return audioContextRef.current;

    const AudioContextConstructor = window.AudioContext ?? (window as WindowWithWebkitAudio).webkitAudioContext;
    if (!AudioContextConstructor) return null;

    audioContextRef.current = new AudioContextConstructor();
    return audioContextRef.current;
  }, []);

  const stopVoicePlayback = useCallback(() => {
    voiceAudioRef.current?.pause();
    voiceAudioRef.current = null;
    window.speechSynthesis?.cancel();
  }, []);

  const pauseBgm = useCallback(() => {
    bgmAudioRef.current?.pause();
  }, []);

  const startBgm = useCallback(() => {
    if (!soundEnabledRef.current || !audioReadyRef.current || !canUseHtmlAudio()) return;
    const bgm = bgmAudioRef.current ?? new Audio(BGM_SRC);
    bgmAudioRef.current = bgm;
    bgm.loop = true;
    bgm.volume = 0.12;

    try {
      const playPromise = bgm.play();
      if (isPromiseLike(playPromise)) void playPromise.catch(() => undefined);
    } catch {
      // Missing or blocked BGM must never interrupt gameplay.
    }
  }, []);

  const speakFallback = useCallback((cue: OrderVoiceCue) => {
    if (!soundEnabledRef.current || !audioReadyRef.current || typeof SpeechSynthesisUtterance === "undefined") return;

    const profile = fallbackSpeechProfile[cue.role];
    const utterance = new SpeechSynthesisUtterance(cue.text);
    utterance.lang = "zh-CN";
    utterance.rate = profile.rate;
    utterance.pitch = profile.pitch;
    utterance.volume = profile.volume;

    window.speechSynthesis?.cancel();
    window.speechSynthesis?.speak(utterance);
  }, []);

  const playSfx = useCallback(
    (type: SfxType = "tap") => {
      if (!soundEnabledRef.current || !audioReadyRef.current) return;

      const context = getAudioContext();
      if (!context) return;

      if (context.state === "suspended") void context.resume().catch(() => undefined);

      const profile = sfxProfiles[type];
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;

      oscillator.type = type === "success" || type === "result" ? "triangle" : "sine";
      oscillator.frequency.setValueAtTime(profile.frequency, now);
      oscillator.frequency.exponentialRampToValueAtTime(profile.endFrequency, now + profile.duration);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(profile.volume, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + profile.duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + profile.duration + 0.02);
    },
    [getAudioContext]
  );

  const playOrderVoice = useCallback(
    (cue?: OrderVoiceCue | null) => {
      if (!cue) return;
      lastVoiceCueRef.current = cue;
      if (!soundEnabledRef.current || !audioReadyRef.current || !canUseHtmlAudio()) return;

      stopVoicePlayback();

      let didFallback = false;
      const fallbackOnce = () => {
        if (didFallback) return;
        didFallback = true;
        speakFallback(cue);
      };
      const audio = new Audio(cue.src);
      voiceAudioRef.current = audio;
      audio.preload = "auto";
      audio.volume = 0.9;
      audio.addEventListener("error", fallbackOnce, { once: true });
      audio.addEventListener("ended", () => {
        if (voiceAudioRef.current === audio) voiceAudioRef.current = null;
      }, { once: true });

      try {
        const playPromise = audio.play();
        if (isPromiseLike(playPromise)) void playPromise.catch(fallbackOnce);
      } catch {
        fallbackOnce();
      }
    },
    [speakFallback, stopVoicePlayback]
  );

  const replayCurrentVoice = useCallback(
    (fallbackCue?: OrderVoiceCue | null) => {
      playOrderVoice(fallbackCue ?? lastVoiceCueRef.current);
    },
    [playOrderVoice]
  );

  const unlockAudio = useCallback(() => {
    audioReadyRef.current = true;
    setAudioReady(true);
    const context = getAudioContext();
    if (context?.state === "suspended") void context.resume().catch(() => undefined);
    startBgm();
  }, [getAudioContext, startBgm]);

  const toggleSound = useCallback(() => {
    setSoundEnabled((current) => !current);
  }, []);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    audioReadyRef.current = audioReady;

    if (!soundEnabled) {
      stopVoicePlayback();
      pauseBgm();
      return;
    }

    if (audioReady) startBgm();
  }, [audioReady, pauseBgm, soundEnabled, startBgm, stopVoicePlayback]);

  useEffect(
    () => () => {
      stopVoicePlayback();
      pauseBgm();
      void audioContextRef.current?.close().catch(() => undefined);
    },
    [pauseBgm, stopVoicePlayback]
  );

  return {
    audioReady,
    soundEnabled,
    unlockAudio,
    toggleSound,
    playSfx,
    playOrderVoice,
    replayCurrentVoice
  };
};
