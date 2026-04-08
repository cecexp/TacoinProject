import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { useGame } from '../context/GameContext';

export default function MisionDelDia() {
  const { state } = useGame();
  const { misionHoy, misionesCumplidas } = state;
  const slideAnim = useRef(new Animated.Value(-60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [misionHoy?.id]);

  if (!misionHoy) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Franja izquierda dorada */}
      <View style={styles.accentBar} />

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.misionLabel}>🎯 MISIÓN DEL DÍA</Text>
          <View style={styles.recompensaBadge}>
            <Text style={styles.recompensaText}>{misionHoy.recompensaLabel}</Text>
          </View>
        </View>

        <View style={styles.bodyRow}>
          <Text style={styles.icono}>{misionHoy.icono}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.titulo}>{misionHoy.titulo}</Text>
            <Text style={styles.desc}>{misionHoy.desc}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e8c97a',
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#b5820a',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  accentBar: { width: 5, backgroundColor: '#b5820a' },
  content:   { flex: 1, padding: 12 },
  topRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  misionLabel: { fontSize: 10, fontWeight: '800', color: '#b5820a', letterSpacing: 1.5 },
  recompensaBadge: { backgroundColor: '#b5820a', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  recompensaText:  { color: '#fff', fontSize: 10, fontWeight: '700' },
  bodyRow:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icono:     { fontSize: 26 },
  titulo:    { fontSize: 14, fontWeight: '800', color: '#3a1a0a', marginBottom: 2 },
  desc:      { fontSize: 12, color: '#6b5c54', lineHeight: 16 },
});
