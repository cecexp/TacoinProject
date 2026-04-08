import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useGame } from '../context/GameContext';

export default function DonJoseDialogo() {
  const { state, estadoAnimo } = useGame();
  const { donJoseFrase } = state;
  const [fraseVisible, setFraseVisible] = useState(donJoseFrase);
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (!donJoseFrase) {
      setFraseVisible(null);
      return;
    }
    setFraseVisible(donJoseFrase);
    fadeAnim.setValue(0);
    slideAnim.setValue(10);
    let fadeOutTimeout;
    const anim = Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 10, useNativeDriver: true }),
    ]);
    anim.start(() => {
      fadeOutTimeout = setTimeout(() => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 600, useNativeDriver: true }).start();
      }, 4000);
    });
    return () => {
      anim.stop();
      if (fadeOutTimeout) clearTimeout(fadeOutTimeout);
    };
  }, [donJoseFrase]);

  if (!fraseVisible) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Avatar Don José */}
      <View style={[styles.avatar, { borderColor: estadoAnimo.color }]}>
        <Text style={styles.avatarEmoji}>{estadoAnimo.emoji}</Text>
      </View>

      {/* Burbuja de diálogo */}
      <View style={styles.burbuja}>
        <View style={styles.burbujaFlecha} />
        <Text style={styles.frase}>{fraseVisible}</Text>
        <Text style={styles.firma}>— Don José</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 10,
    paddingHorizontal: 2,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#fdf0ec',
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    marginTop: 4,
  },
  avatarEmoji: { fontSize: 22 },
  burbuja: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#e8e0d4',
    padding: 10,
    position: 'relative',
    shadowColor: '#8c7c6e',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  burbujaFlecha: {
    position: 'absolute',
    left: -8, top: 10,
    width: 0, height: 0,
    borderTopWidth: 6, borderTopColor: 'transparent',
    borderBottomWidth: 6, borderBottomColor: 'transparent',
    borderRightWidth: 8, borderRightColor: '#e8e0d4',
  },
  frase: {
    fontSize: 13,
    color: '#4a3228',
    fontStyle: 'italic',
    lineHeight: 19,
  },
  firma: {
    fontSize: 10,
    color: '#8c7c6e',
    fontWeight: '700',
    marginTop: 4,
    textAlign: 'right',
  },
});
