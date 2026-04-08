import React, { useRef, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated, useWindowDimensions } from 'react-native';
import { useGame } from '../context/GameContext';

export default function EventoSorpresaPopup() {
  const { state, cerrarEvento } = useGame();
  const { eventoHoy } = state;
  const { width } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(0.7)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (eventoHoy) {
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      scaleAnim.setValue(0.7);
      fadeAnim.setValue(0);
    }
  }, [eventoHoy]);

  if (!eventoHoy) return null;

  const esBueno    = eventoHoy.tipo === 'bueno';
  const esNeutro   = eventoHoy.tipo === 'neutro';
  const borderColor = esBueno ? '#4a9e4a' : esNeutro ? '#d4901a' : '#c0392b';

  return (
    <Modal transparent animationType="none" visible={!!eventoHoy}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[
          styles.card,
          { borderColor, transform: [{ scale: scaleAnim }], maxWidth: Math.min(width - 32, 400), alignSelf: 'center', width: '100%' }
        ]}>
          {/* Tira azulejos */}
          <View style={styles.tileStrip}>
            {Array.from({ length: 24 }).map((_, i) => (
              <View key={i} style={[styles.tile, { backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0' }]} />
            ))}
          </View>

          <View style={styles.body}>
            {/* Badge tipo */}
            <View style={[styles.tipoBadge, { backgroundColor: borderColor }]}>
              <Text style={styles.tipoText}>
                {esBueno ? '⚡ EVENTO ESPECIAL' : esNeutro ? '⚡ EVENTO DEL DÍA' : '⚠️ IMPREVISTO'}
              </Text>
            </View>

            {/* Ícono principal animado */}
            <Text style={styles.iconoGrande}>{eventoHoy.icono}</Text>

            <Text style={styles.titulo}>{eventoHoy.titulo}</Text>
            <Text style={styles.desc}>{eventoHoy.desc}</Text>

            {/* Impacto visual */}
            <View style={[styles.impactoBox, { backgroundColor: borderColor + '15', borderColor: borderColor + '50' }]}>
              {eventoHoy.impactoEfectivo !== 0 && (
                <View style={styles.impactoFila}>
                  <Text style={styles.impactoIcon}>💵</Text>
                  <Text style={[styles.impactoVal, { color: eventoHoy.impactoEfectivo > 0 ? '#4a9e4a' : '#c0392b' }]}>
                    {eventoHoy.impactoEfectivo > 0 ? '+' : ''}${eventoHoy.impactoEfectivo} en efectivo
                  </Text>
                </View>
              )}
              {eventoHoy.impactoVentas !== 1 && (
                <View style={styles.impactoFila}>
                  <Text style={styles.impactoIcon}>🌮</Text>
                  <Text style={[styles.impactoVal, { color: eventoHoy.impactoVentas > 1 ? '#4a9e4a' : '#c0392b' }]}>
                    Ventas x{eventoHoy.impactoVentas} hoy
                  </Text>
                </View>
              )}
            </View>

            {/* Don José reacciona */}
            <View style={styles.donJoseBox}>
              <Text style={styles.donJoseEmoji}>👨‍🍳</Text>
              <Text style={styles.donJoseFrase}>{eventoHoy.donJoseFrase}</Text>
            </View>

            {/* Lección financiera */}
            <View style={styles.leccionBox}>
              <Text style={styles.leccionIcon}>📚</Text>
              <Text style={styles.leccionText}>{eventoHoy.leccionFinanciera}</Text>
            </View>

            {/* Botón */}
            <TouchableOpacity style={[styles.btnOuter]} onPress={cerrarEvento} activeOpacity={0.85}>
              <View style={[styles.btnShadow, { backgroundColor: borderColor + '88' }]} />
              <View style={[styles.btnFace, { backgroundColor: borderColor }]}>
                <Text style={styles.btnText}>Entendido, ¡a trabajar!  →</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 16 },
  card:       { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 2 },
  tileStrip:  { flexDirection: 'row', height: 8 },
  tile:       { flex: 1, borderWidth: 0.5, borderColor: '#d8d2c4' },
  body:       { padding: 20, alignItems: 'center' },
  tipoBadge:  { borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 14 },
  tipoText:   { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  iconoGrande:{ fontSize: 52, marginBottom: 10 },
  titulo:     { fontSize: 18, fontWeight: '800', color: '#3a1a0a', textAlign: 'center', marginBottom: 8 },
  desc:       { fontSize: 13, color: '#6b5c54', textAlign: 'center', lineHeight: 19, marginBottom: 14 },
  impactoBox: { width: '100%', borderRadius: 12, borderWidth: 1.5, padding: 12, marginBottom: 12, gap: 6 },
  impactoFila:{ flexDirection: 'row', alignItems: 'center', gap: 8 },
  impactoIcon:{ fontSize: 16 },
  impactoVal: { fontSize: 14, fontWeight: '700' },
  donJoseBox: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fdf0ec', borderRadius: 12, borderWidth: 1, borderColor: '#e8c4b8', padding: 12, marginBottom: 10 },
  donJoseEmoji: { fontSize: 22 },
  donJoseFrase: { flex: 1, fontSize: 13, fontStyle: 'italic', color: '#4a3228', lineHeight: 19 },
  leccionBox: { width: '100%', flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fffbeb', borderRadius: 10, borderWidth: 1, borderColor: '#fde68a', padding: 10, marginBottom: 16 },
  leccionIcon:{ fontSize: 14 },
  leccionText:{ flex: 1, fontSize: 11, color: '#78520a', lineHeight: 17 },
  btnOuter:   { position: 'relative', width: '100%' },
  btnShadow:  { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', borderRadius: 50 },
  btnFace:    { borderRadius: 50, paddingVertical: 14, alignItems: 'center' },
  btnText:    { color: '#fff', fontWeight: '800', fontSize: 15 },
});
