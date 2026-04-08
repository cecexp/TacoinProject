import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useGame } from '../context/GameContext';

function Particula({ x, emoji, delay }) {
  const posY   = useRef(new Animated.Value(0)).current;
  const posX   = useRef(new Animated.Value(0)).current;
  const fadeA  = useRef(new Animated.Value(1)).current;
  const scaleA = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const driftX = (Math.random() - 0.5) * 120;
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(posY,   { toValue: -200, duration: 1000, useNativeDriver: true }),
        Animated.timing(posX,   { toValue: driftX, duration: 1000, useNativeDriver: true }),
        Animated.timing(fadeA,  { toValue: 0, duration: 900, useNativeDriver: true }),
        Animated.spring(scaleA, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      ]).start();
    }, delay);
  }, []);

  return (
    <Animated.Text style={[
      styles.particula,
      { left: x, opacity: fadeA, transform: [{ translateY: posY }, { translateX: posX }, { scale: scaleA }] }
    ]}>
      {emoji}
    </Animated.Text>
  );
}

const CONFIGS = {
  gana:   { emojis: ['💵', '🌮', '✨', '💰', '🎉'], count: 12 },
  pierde: { emojis: ['📉', '💸', '😢'], count: 6 },
  logro:  { emojis: ['🏅', '⭐', '🎊', '✨'], count: 14 },
  nivel:  { emojis: ['🚀', '⬆️', '🌟', '🎉', '🏆'], count: 16 },
};

export default function CelebracionOverlay() {
  const { width } = useWindowDimensions();
  const { state } = useGame();
  const [burst, setBurst] = useState(null); // { tipo, key }
  const prevPopup = useRef(null);

  // Detecta cambios en popupActual para disparar celebración
  useEffect(() => {
    const popup = state.popupActual;
    if (!popup) { prevPopup.current = null; return; }
    const key = popup.tipo + (popup.data?.titulo || '') + (popup.data?.tipo || '');
    if (key === prevPopup.current) return;
    prevPopup.current = key;

    let tipo = null;
    if (popup.tipo === 'feedback') {
      tipo = popup.data?.tipo === 'bueno' ? 'gana' : popup.data?.tipo === 'malo' ? 'pierde' : null;
    } else if (popup.tipo === 'logro') {
      tipo = 'logro';
    } else if (popup.tipo === 'nivel') {
      tipo = 'nivel';
    }

    if (tipo) {
      setBurst({ tipo, key: Date.now() });
      setTimeout(() => setBurst(null), 1400);
    }
  }, [state.popupActual]);

  if (!burst) return null;

  const cfg = CONFIGS[burst.tipo] || CONFIGS.gana;
  const particulas = Array.from({ length: cfg.count }).map((_, i) => ({
    id: `${burst.key}-${i}`,
    x: Math.random() * Math.max(width - 40, 100) + 20,
    emoji: cfg.emojis[i % cfg.emojis.length],
    delay: i * 60,
  }));

  return (
    <View style={styles.container} pointerEvents="none">
      {particulas.map(p => (
        <Particula key={p.id} x={p.x} emoji={p.emoji} delay={p.delay} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { ...StyleSheet.absoluteFillObject, zIndex: 999 },
  particula: { position: 'absolute', bottom: 120, fontSize: 22 },
});
