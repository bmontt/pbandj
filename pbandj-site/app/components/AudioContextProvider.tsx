'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';

interface AudioContextType {
  ctx: React.MutableRefObject<AudioContext | null>;
  analyser: React.MutableRefObject<AnalyserNode | null>;
  analyserData: React.MutableRefObject<Uint8Array>;
  bgAudio: React.MutableRefObject<HTMLAudioElement | null>;
  bgGain: React.MutableRefObject<GainNode | null>;
  masterGain: React.MutableRefObject<GainNode | null>;
  startBackground: () => Promise<void>;
  fadeBackgroundTo: (value?: number, time?: number) => void;
  restoreBackground: (time?: number) => void;
  connectPreview: (mediaEl: HTMLMediaElement) => MediaElementAudioSourceNode | undefined;
  disconnectPreview: (previewNode?: MediaElementAudioSourceNode) => void;
  isReady: boolean;
  freqData: Uint8Array;
  getAverageFrequency: () => number;
  getLowFrequency: () => number;
  getMidFrequency: () => number;
  getHighFrequency: () => number;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export function AudioProvider({ children }: { children: ReactNode }) {
  const ctxRef = useRef<AudioContext | null>(null);
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analyserDataRef = useRef(new Uint8Array(128));
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize Web Audio API
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    ctxRef.current = ctx;

    // Create master gain
    masterGainRef.current = ctx.createGain();
    masterGainRef.current.gain.value = 1.0;
    masterGainRef.current.connect(ctx.destination);

    // Setup background audio element
    const bgAudio = new Audio('/audio/set1.mp3');
    bgAudio.loop = true;
    bgAudio.crossOrigin = 'anonymous';
    bgAudioRef.current = bgAudio;

    const bgSrc = ctx.createMediaElementSource(bgAudio);
    bgGainRef.current = ctx.createGain();
    bgGainRef.current.gain.value = 1.0;
    bgSrc.connect(bgGainRef.current);
    bgGainRef.current.connect(masterGainRef.current);

    // Setup analyser
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    analyserRef.current = analyser;

    bgGainRef.current.connect(analyserRef.current);
    analyserRef.current.connect(masterGainRef.current);

    setIsReady(true);

    // Update analyser data continuously
    const dataArr = new Uint8Array(analyserRef.current.frequencyBinCount);
    function tick() {
      if (analyserRef.current) {
        analyserRef.current.getByteFrequencyData(dataArr);
        analyserDataRef.current.set(dataArr);
      }
      requestAnimationFrame(tick);
    }
    tick();

    return () => {
      try {
        bgAudio.pause();
      } catch (e) {
        console.error('Error pausing audio:', e);
      }
      if (ctxRef.current) ctxRef.current.close();
    };
  }, []);

  const startBackground = async () => {
    if (!ctxRef.current) return;
    if (ctxRef.current.state === 'suspended') await ctxRef.current.resume();
    if (bgAudioRef.current && bgAudioRef.current.paused) {
      try {
        await bgAudioRef.current.play();
      } catch (e) {
        console.error('Error playing audio:', e);
      }
    }
  };

  const fadeBackgroundTo = (value = 0.05, time = 0.8) => {
    if (!bgGainRef.current || !ctxRef.current) return;
    const g = bgGainRef.current.gain;
    const now = ctxRef.current.currentTime;
    g.cancelScheduledValues(now);
    g.linearRampToValueAtTime(value, now + time);
  };

  const restoreBackground = (time = 0.8) => {
    if (!bgGainRef.current || !ctxRef.current) return;
    const g = bgGainRef.current.gain;
    const now = ctxRef.current.currentTime;
    g.cancelScheduledValues(now);
    g.linearRampToValueAtTime(1.0, now + time);
  };

  const connectPreview = (mediaEl: HTMLMediaElement): MediaElementAudioSourceNode | undefined => {
    if (!ctxRef.current || !analyserRef.current) return;
    const src = ctxRef.current.createMediaElementSource(mediaEl);
    try {
      bgGainRef.current?.disconnect(analyserRef.current);
    } catch (e) {
      console.error('Error disconnecting:', e);
    }
    src.connect(analyserRef.current);
    src.connect(masterGainRef.current!);
    return src;
  };

  const disconnectPreview = (previewNode?: MediaElementAudioSourceNode) => {
    try {
      if (previewNode) previewNode.disconnect();
    } catch (e) {
      console.error('Error disconnecting preview:', e);
    }
    try {
      bgGainRef.current?.connect(analyserRef.current!);
    } catch (e) {
      console.error('Error reconnecting background:', e);
    }
  };

  const getAverageFrequency = () => {
    const data = analyserDataRef.current;
    if (!data) return 0;
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / data.length / 255;
  };

  const getLowFrequency = () => {
    const data = analyserDataRef.current;
    if (!data) return 0;
    const slice = data.slice(0, Math.floor(data.length * 0.25));
    const sum = slice.reduce((a, b) => a + b, 0);
    return (sum / slice.length) / 255;
  };

  const getMidFrequency = () => {
    const data = analyserDataRef.current;
    if (!data) return 0;
    const start = Math.floor(data.length * 0.25);
    const end = Math.floor(data.length * 0.75);
    const slice = data.slice(start, end);
    const sum = slice.reduce((a, b) => a + b, 0);
    return (sum / slice.length) / 255;
  };

  const getHighFrequency = () => {
    const data = analyserDataRef.current;
    if (!data) return 0;
    const slice = data.slice(Math.floor(data.length * 0.75));
    const sum = slice.reduce((a, b) => a + b, 0);
    return (sum / slice.length) / 255;
  };

  const api: AudioContextType = {
    ctx: ctxRef,
    analyser: analyserRef,
    analyserData: analyserDataRef,
    bgAudio: bgAudioRef,
    bgGain: bgGainRef,
    masterGain: masterGainRef,
    startBackground,
    fadeBackgroundTo,
    restoreBackground,
    connectPreview,
    disconnectPreview,
    isReady,
    freqData: analyserDataRef.current,
    getAverageFrequency,
    getLowFrequency,
    getMidFrequency,
    getHighFrequency,
  };

  return <AudioContext.Provider value={api}>{children}</AudioContext.Provider>;
}

export function useAudio(): AudioContextType {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within AudioProvider');
  }
  return context;
}
