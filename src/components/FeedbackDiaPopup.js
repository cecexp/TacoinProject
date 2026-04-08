import React, { useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { useGame } from '../context/GameContext';

export default function FeedbackDiaPopup() {
  const { state, cerrarFeedbackDia } = useGame();
  const { feedbackDia } = state;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (feedbackDia) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(300);
      fadeAnim.setValue(0);
    }
  }, [feedbackDia]);

  if (!feedbackDia) return null;

  const borderColor = feedbackDia.tipo === 'bueno' ? '#4a9e4a'
    : feedbackDia.tipo === 'malo' ? '#c0392b' : '#d4901a';

  return (
    <Modal transparent animationType="none" visible={!!feedbackDia}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[
          styles.card,
          { borderTopColor: borderColor, transform: [{ translateY: slideAnim }] }
        ]}>
          {/* Tira de azulejos */}
          <View style={styles.tileStrip}>
            {Array.from({ length: 24 }).map((_, i) => (
              <View key={i} style={[styles.tile, { backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0' }]} />
            ))}
          </View>

          <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
            <View style={styles.body}>

              {/* Título */}
              <Text style={styles.titulo}>{feedbackDia.titulo}</Text>
              <Text style={styles.mensaje}>{feedbackDia.mensaje}</Text>

              {/* Desglose financiero */}
              <Text style={styles.seccionLabel}>💼 Resumen del día</Text>
              {feedbackDia.detalles.map((d, i) => (
                <View key={i} style={[styles.detalleRow, { borderLeftColor: d.color }]}>
                  <View style={styles.detalleLeft}>
                    <Text style={styles.detalleIcon}>{d.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detalleLabel}>{d.label}</Text>
                      <Text style={styles.detalleSub}>{d.sub}</Text>
                    </View>
                  </View>
                  <Text style={[styles.detalleValue, { color: d.color }]}>{d.value}</Text>
                </View>
              ))}

              {/* Patrimonio total */}
              <View style={styles.patrimonioBox}>
                <Text style={styles.patrimonioLabel}>Patrimonio total de Don José</Text>
                <Text style={styles.patrimonioValue}>${feedbackDia.patrimonioTotal.toFixed(0)}</Text>
              </View>

            </View>
          </ScrollView>

          {/* Botón continuar */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnOuter} onPress={cerrarFeedbackDia} activeOpacity={0.85}>
              <View style={styles.btnShadow} />
              <View style={[styles.btnFace, { backgroundColor: borderColor, borderColor: borderColor }]}>
                <Text style={styles.btnText}>Continuar  →</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 4,
  },
  tileStrip: { flexDirection: 'row', height: 8 },
  tile: { flex: 1, borderWidth: 0.5, borderColor: '#d8d2c4' },
  body: { padding: 20 },

  titulo:  { fontSize: 20, fontWeight: '800', color: '#3a1a0a', marginBottom: 6 },
  mensaje: { fontSize: 13, color: '#6b5c54', lineHeight: 20, marginBottom: 16 },

  seccionLabel: {
    fontSize: 11, fontWeight: '800', letterSpacing: 1.5,
    color: '#8c7c6e', textTransform: 'uppercase', marginBottom: 10,
  },

  detalleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#faf8f5', borderRadius: 10,
    borderLeftWidth: 4, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: '#ede9e0',
  },
  detalleLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  detalleIcon:  { fontSize: 20 },
  detalleLabel: { fontSize: 13, fontWeight: '700', color: '#3a1a0a' },
  detalleSub:   { fontSize: 11, color: '#8c7c6e', marginTop: 2 },
  detalleValue: { fontSize: 14, fontWeight: '800', marginLeft: 8 },

  patrimonioBox: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fdf0ec', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#e8c4b8',
    padding: 14, marginTop: 6,
  },
  patrimonioLabel: { fontSize: 13, color: '#8c7c6e', fontWeight: '600' },
  patrimonioValue: { fontSize: 18, fontWeight: '800', color: '#8b1a1a' },

  footer: { padding: 16, paddingBottom: 28 },
  btnOuter:  { position: 'relative' },
  btnShadow: { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', backgroundColor: '#1a0a0a30', borderRadius: 50 },
  btnFace:   { borderRadius: 50, paddingVertical: 15, alignItems: 'center', borderWidth: 2 },
  btnText:   { color: '#fff', fontWeight: '800', fontSize: 16 },
});
