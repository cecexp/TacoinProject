import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGame } from '../context/GameContext';
import { getNivelActual } from '../data/gameData';

export default function XPBar() {
  const { state } = useGame();
  const xpTotal = state.xpTotal || 0;
  const nivel   = getNivelActual(xpTotal);
  const barAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(barAnim, {
      toValue: nivel.progreso,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [xpTotal]);

  const barWidth = barAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.nivelLeft}>
          <Text style={styles.nivelEmoji}>{nivel.emoji}</Text>
          <Text style={[styles.nivelTitulo, { color: nivel.color }]}>{nivel.titulo}</Text>
        </View>
        <Text style={styles.xpTexto}>
          {nivel.xpEnNivel} / {nivel.xpParaSiguiente} XP
          {nivel.siguiente ? ` → ${nivel.siguiente.emoji}` : ' ★ MAX'}
        </Text>
      </View>
      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: nivel.color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 8 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nivelLeft:   { flexDirection: 'row', alignItems: 'center', gap: 5 },
  nivelEmoji:  { fontSize: 14 },
  nivelTitulo: { fontSize: 12, fontWeight: '700' },
  xpTexto:     { fontSize: 10, color: '#8c7c6e' },
  barTrack:    { height: 6, backgroundColor: '#e8e0d4', borderRadius: 3, overflow: 'hidden' },
  barFill:     { height: '100%', borderRadius: 3 },
});
