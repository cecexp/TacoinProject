import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

export default function ConceptoDelDia({ concepto, onCerrar }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const [glosarioVisto, setGlosarioVisto] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!concepto) return null;

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badgeWrap}>
          <Text style={styles.badgeIcon}>📚</Text>
          <Text style={styles.badgeText}>CONCEPTO DEL DÍA</Text>
        </View>
        <TouchableOpacity onPress={onCerrar} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Concepto */}
      <Text style={styles.termino}>{concepto.termino}</Text>
      <Text style={styles.definicion}>{concepto.def}</Text>

      {/* Botón glosario */}
      {!glosarioVisto ? (
        <TouchableOpacity
          style={styles.glosarioBtn}
          onPress={() => setGlosarioVisto(true)}
        >
          <Text style={styles.glosarioBtnText}>📖 Agregar a mi glosario</Text>
        </TouchableOpacity>
      ) : (
        <View style={styles.glosarioConfirm}>
          <Text style={styles.glosarioConfirmText}>✅ Agregado a tu glosario</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffbeb',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fde68a',
    padding: 14,
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badgeWrap: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeIcon: { fontSize: 14 },
  badgeText: { fontSize: 10, fontWeight: '800', color: '#b5820a', letterSpacing: 1.5 },
  closeBtn:  { width: 24, height: 24, borderRadius: 12, backgroundColor: '#fde68a', alignItems: 'center', justifyContent: 'center' },
  closeText: { fontSize: 11, color: '#78520a', fontWeight: '700' },
  termino:   { fontSize: 16, fontWeight: '800', color: '#78520a', marginBottom: 6 },
  definicion:{ fontSize: 13, color: '#4a3228', lineHeight: 20, marginBottom: 12 },
  glosarioBtn: {
    backgroundColor: '#b5820a',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  glosarioBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  glosarioConfirm: {
    backgroundColor: '#4a9e4a18',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#4a9e4a44',
  },
  glosarioConfirmText: { color: '#4a9e4a', fontSize: 12, fontWeight: '700' },
});
