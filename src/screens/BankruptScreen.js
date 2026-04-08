import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, useWindowDimensions,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { getNivelActual, CONCEPTOS_FINANCIEROS } from '../data/gameData';

function TileBackground({ width, height }) {
  const TILE = 60;
  const cols = Math.ceil(width / TILE) + 1, rows = Math.ceil(height / TILE) + 1;
  const tiles = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      tiles.push(<View key={`${r}-${c}`} style={{ width: TILE, height: TILE, backgroundColor: (r + c) % 2 === 0 ? '#f5f2eb' : '#ede9e0', borderWidth: 0.8, borderColor: '#d8d2c4' }} />);
  return <View style={StyleSheet.absoluteFill}><View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{tiles}</View></View>;
}

function BarraProgreso({ pct, color, label, valor }) {
  const barAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(barAnim, { toValue: pct / 100, duration: 800, delay: 600, useNativeDriver: false }).start();
  }, []);
  const barW = barAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={bs.wrap}>
      <View style={bs.row}>
        <Text style={bs.label}>{label}</Text>
        <Text style={[bs.val, { color }]}>{valor}</Text>
      </View>
      <View style={bs.track}>
        <Animated.View style={[bs.fill, { width: barW, backgroundColor: color }]} />
      </View>
    </View>
  );
}
const bs = StyleSheet.create({
  wrap:  { marginBottom: 12 },
  row:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#3a1a0a' },
  val:   { fontSize: 13, fontWeight: '800' },
  track: { height: 10, backgroundColor: '#e8e0d4', borderRadius: 5, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 5 },
});

const RAZONES_QUIEBRA = [
  { icon: '💸', motivo: 'Te quedaste sin efectivo en el negocio y sin ahorro de respaldo.', concepto: 'fondo_emergencia' },
  { icon: '📉', motivo: 'Los costos del día superaron tus ventas repetidamente.', concepto: 'flujo_caja' },
  { icon: '🪙', motivo: 'BirriaCoin bajó y tenías demasiado invertido en crypto.', concepto: 'diversificacion' },
  { icon: '🌙', motivo: 'Cerraste el puesto antes de tiempo demasiados días seguidos.', concepto: 'costos_fijos' },
  { icon: '🏪', motivo: 'Los costos fijos se pagaron aunque el negocio no generó suficiente.', concepto: 'ingresos_variables' },
];

export default function BankruptScreen() {
  const { state, reiniciar } = useGame();
  const { width, height } = useWindowDimensions();
  const nivel  = getNivelActual(state.xpTotal || 0);
  const maxW   = Math.min(width, 520);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1,  duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1,  duration: 80, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,  duration: 80, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const shakeX = shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-14, 14] });

  // Detectar razón de quiebra
  const razonIdx  = state.historial.length % RAZONES_QUIEBRA.length;
  const razon     = RAZONES_QUIEBRA[razonIdx];
  const concepto  = CONCEPTOS_FINANCIEROS[razon.concepto];

  // Decisiones de la sesión
  const histSemana = state.historial.filter(h => h.semanaGlobal === state.semanaGlobal);
  const totalDec   = histSemana.length;
  const totalRec   = histSemana.filter(h => h.decision?.esRecomendada).length;
  const totalNoRec = totalDec - totalRec;
  const pct        = totalDec > 0 ? Math.round((totalRec / totalDec) * 100) : 0;

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f2eb' }}>
      <TileBackground width={width} height={height} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,245,238,0.5)' }]} />

      <ScrollView contentContainerStyle={[styles.content, { maxWidth: maxW, alignSelf: 'center', width: '100%' }]}>

        {/* Hero */}
        <Animated.View style={[styles.heroCard, { transform: [{ translateX: shakeX }] }]}>
          <View style={styles.tileStrip}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 6, backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0', borderWidth: 0.5, borderColor: '#d8d2c4' }} />
            ))}
          </View>
          <View style={{ padding: 22, alignItems: 'center' }}>
            <Text style={styles.heroEmoji}>😭</Text>
            <Text style={styles.diaSemana}>Día {state.diaGlobal} • Semana {state.semanaGlobal}</Text>
            <Text style={styles.heroTitulo}>¡Bancarrota!</Text>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Motivo de quiebra */}
          <View style={styles.razonCard}>
            <Text style={styles.razonBadge}>MOTIVO DE LA QUIEBRA</Text>
            <View style={styles.razonRow}>
              <Text style={{ fontSize: 24 }}>{razon.icon}</Text>
              <Text style={styles.razonTexto}>{razon.motivo}</Text>
            </View>
          </View>

          {/* Decisiones del intento */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Decisiones del intento</Text>
            <BarraProgreso pct={pct}       color="#4a9e4a" label="✅ Aciertos" valor={`${totalRec} de ${totalDec}`} />
            <BarraProgreso pct={100 - pct} color="#c0392b" label="❌ Errores"  valor={`${totalNoRec} de ${totalDec}`} />
          </View>

          {/* Don José reflexiona */}
          <View style={styles.card}>
            <View style={styles.donJoseRow}>
              <Text style={{ fontSize: 28 }}>👨‍🍳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.donJoseTitulo}>Don José reflexiona...</Text>
                <Text style={styles.donJoseFrase}>"{concepto ? concepto.def.slice(0, 100) + '...' : 'Cada fracaso es una lección, mijo.'}"</Text>
              </View>
            </View>
          </View>

          {/* XP ganado */}
          <View style={[styles.card, { backgroundColor: '#fdf0ec', borderColor: '#e8c4b8' }]}>
            <Text style={styles.xpLabel}>💎 XP total acumulado</Text>
            <Text style={styles.xpNum}>{state.xpTotal || 0} XP</Text>
            <Text style={styles.xpSub}>El conocimiento que ganaste ¡ya nadie te lo quita!</Text>
          </View>

          {/* Botón */}
          <TouchableOpacity style={styles.btnOuter} onPress={reiniciar} activeOpacity={0.85}>
            <View style={styles.btnShadow} />
            <View style={styles.btnFace}>
              <Text style={styles.btnText}>🌮 Volver a empezar</Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 48 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content:    { padding: 16, paddingTop: 52 },
  heroCard:   { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', borderWidth: 2, borderColor: '#c0392b', marginBottom: 14 },
  tileStrip:  { flexDirection: 'row' },
  heroEmoji:  { fontSize: 52, marginBottom: 6 },
  diaSemana:  { fontSize: 12, color: '#8c7c6e', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  heroTitulo: { fontSize: 28, fontWeight: '800', color: '#c0392b' },
  razonCard:  { backgroundColor: '#c0392b', borderRadius: 14, padding: 14, marginBottom: 12 },
  razonBadge: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1.5, marginBottom: 8 },
  razonRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  razonTexto: { flex: 1, fontSize: 14, color: '#fff', fontWeight: '600', lineHeight: 20 },
  card:       { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, borderWidth: 1, borderColor: '#e8e0d4', padding: 16, marginBottom: 12 },
  cardTitle:  { fontSize: 14, fontWeight: '800', color: '#3a1a0a', marginBottom: 12 },
  donJoseRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  donJoseTitulo: { fontSize: 11, fontWeight: '700', color: '#8c7c6e', marginBottom: 4 },
  donJoseFrase:  { fontSize: 13, fontStyle: 'italic', color: '#4a3228', lineHeight: 20 },
  xpLabel:    { fontSize: 12, color: '#8c7c6e', fontWeight: '700', marginBottom: 4 },
  xpNum:      { fontSize: 28, fontWeight: '800', color: '#8b1a1a', marginBottom: 4 },
  xpSub:      { fontSize: 12, color: '#6b5c54', fontStyle: 'italic' },
  btnOuter:   { position: 'relative', marginTop: 4 },
  btnShadow:  { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', backgroundColor: '#4a0c0c', borderRadius: 50 },
  btnFace:    { backgroundColor: '#8b1a1a', borderRadius: 50, paddingVertical: 16, alignItems: 'center', borderWidth: 2.5, borderColor: '#6b1212' },
  btnText:    { color: '#fff', fontWeight: '800', fontSize: 16 },
});
