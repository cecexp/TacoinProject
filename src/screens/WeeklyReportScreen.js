import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, useWindowDimensions, Animated,
} from 'react-native';
import { useGame } from '../context/GameContext';
import { getNivelActual } from '../data/gameData';

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
    Animated.timing(barAnim, { toValue: pct / 100, duration: 900, delay: 300, useNativeDriver: false }).start();
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
  wrap:  { marginBottom: 14 },
  row:   { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '700', color: '#3a1a0a' },
  val:   { fontSize: 13, fontWeight: '800' },
  track: { height: 10, backgroundColor: '#e8e0d4', borderRadius: 5, overflow: 'hidden' },
  fill:  { height: '100%', borderRadius: 5 },
});

export default function WeeklyReportScreen() {
  const { state, cerrarReporteSemanal } = useGame();
  const { resumenSemana, xpTotal, logrosObtenidos, misionesCumplidas, rachaDias } = state;
  const { width, height } = useWindowDimensions();
  const nivel = getNivelActual(xpTotal || 0);

  const heroAnim  = useRef(new Animated.Value(0)).current;
  const cardsAnim = useRef(new Animated.Value(40)).current;
  const cardsFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(heroAnim,  { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(cardsAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
        Animated.timing(cardsFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  if (!resumenSemana) return null;

  const { semanaGlobal, totalDecisiones, totalRecomendadas, totalNoRecomendadas, porcentajeRecomendadas, efectivoFinal, ahorroFinal } = resumenSemana;
  const pct = Math.round(porcentajeRecomendadas * 100);
  const maxW = Math.min(width, 520);

  const getMedalla = () => {
    if (pct >= 80) return { emoji: '🥇', label: '¡Empresario estrella!', color: '#b5820a', frase: '"Treinta años de contador no me dieron esto. Tú lo lograste en una semana."' };
    if (pct >= 60) return { emoji: '🥈', label: 'Buen emprendedor',       color: '#6b7280', frase: '"Vas bien, mijo. Mi abuela diría que tienes instinto de taquero."' };
    if (pct >= 40) return { emoji: '🥉', label: 'En proceso',             color: '#b5820a', frase: '"Cada error es una lección. Yo aprendí de los mejores... y de los peores."' };
    return              { emoji: '📉',  label: 'Hay que mejorar',          color: '#c0392b', frase: '"No te desanimes. Hasta el mejor taquero quemó la birria alguna vez."' };
  };
  const medalla = getMedalla();

  const patrimonioTotal = (efectivoFinal || 0) + (ahorroFinal || 0) + (state.carteraCrypto * state.precioBC);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f2eb' }}>
      <TileBackground width={width} height={height} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,245,238,0.5)' }]} />

      <ScrollView contentContainerStyle={[styles.content, { maxWidth: maxW, alignSelf: 'center', width: '100%' }]}>

        {/* Hero */}
        <Animated.View style={[styles.hero, { transform: [{ scale: heroAnim.interpolate({ inputRange: [0,1], outputRange: [0.8, 1] }) }], opacity: heroAnim }]}>
          <View style={styles.tileStripHero}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 6, backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0', borderWidth: 0.5, borderColor: '#d8d2c4' }} />
            ))}
          </View>
          <View style={styles.heroBody}>
            <Text style={styles.heroEmoji}>{medalla.emoji}</Text>
            <Text style={styles.heroSemana}>Semana {semanaGlobal} completada</Text>
            <Text style={[styles.heroLabel, { color: medalla.color }]}>{medalla.label}</Text>
            <Text style={styles.heroPct}>{pct}% de decisiones acertadas</Text>
            {/* Don José comenta */}
            <View style={styles.donJoseQuote}>
              <Text style={styles.donJoseIcon}>👨‍🍳</Text>
              <Text style={styles.donJoseFrase}>{medalla.frase}</Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats Cards */}
        <Animated.View style={{ opacity: cardsFade, transform: [{ translateY: cardsAnim }] }}>

          {/* Decisiones */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Decisiones de la semana</Text>
            <BarraProgreso pct={pct}       color="#4a9e4a" label="✅ Aciertos"  valor={`${totalRecomendadas} de ${totalDecisiones}`} />
            <BarraProgreso pct={100 - pct} color="#c0392b" label="❌ Errores"   valor={`${totalNoRecomendadas} de ${totalDecisiones}`} />
          </View>

          {/* Finanzas */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💰 Estado financiero</Text>
            <View style={styles.finRow}>
              <FinBox icon="💵" label="Efectivo"       value={`$${(efectivoFinal || 0).toFixed(0)}`}  color="#4a9e4a" />
              <FinBox icon="🏦" label="Ahorro"          value={`$${(ahorroFinal  || 0).toFixed(0)}`}  color="#1a6fb5" />
              <FinBox icon="💎" label="Patrimonio"      value={`$${patrimonioTotal.toFixed(0)}`}        color="#8b1a1a" />
            </View>
          </View>

          {/* Progresión */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⬆️ Tu progresión</Text>
            <View style={styles.progRow}>
              <ProgBox emoji={nivel.emoji}  label="Nivel"          value={nivel.titulo}            color={nivel.color} />
              <ProgBox emoji="🎯"           label="Misiones"        value={`${misionesCumplidas} cumplidas`} color="#b5820a" />
              <ProgBox emoji="🔥"           label="Racha"           value={`${rachaDias} días`}     color="#c0392b" />
              <ProgBox emoji="🏅"           label="Logros"          value={`${logrosObtenidos.length} / 7`} color="#4a9e4a" />
            </View>
            {/* XP bar */}
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>{nivel.emoji} {nivel.xpEnNivel} / {nivel.xpParaSiguiente} XP</Text>
              {nivel.siguiente && <Text style={styles.xpNext}>→ {nivel.siguiente.emoji} {nivel.siguiente.titulo}</Text>}
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${Math.round(nivel.progreso * 100)}%`, backgroundColor: nivel.color }]} />
            </View>
          </View>

          {/* Botón */}
          <TouchableOpacity style={styles.btnOuter} onPress={cerrarReporteSemanal} activeOpacity={0.85}>
            <View style={styles.btnShadow} />
            <View style={styles.btnFace}>
              <Text style={styles.btnText}>🌮 Continuar a Semana {semanaGlobal + 1}</Text>
            </View>
          </TouchableOpacity>

          <View style={{ height: 48 }} />
        </Animated.View>
      </ScrollView>
    </View>
  );
}

function FinBox({ icon, label, value, color }) {
  return (
    <View style={fb.box}>
      <Text style={{ fontSize: 20 }}>{icon}</Text>
      <Text style={[fb.val, { color }]}>{value}</Text>
      <Text style={fb.label}>{label}</Text>
    </View>
  );
}
const fb = StyleSheet.create({
  box:   { flex: 1, alignItems: 'center', gap: 4 },
  val:   { fontSize: 15, fontWeight: '800' },
  label: { fontSize: 10, color: '#8c7c6e' },
});

function ProgBox({ emoji, label, value, color }) {
  return (
    <View style={pb.box}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={[pb.val, { color }]}>{value}</Text>
      <Text style={pb.label}>{label}</Text>
    </View>
  );
}
const pb = StyleSheet.create({
  box:   { flex: 1, alignItems: 'center', gap: 3 },
  val:   { fontSize: 12, fontWeight: '800', textAlign: 'center' },
  label: { fontSize: 9, color: '#8c7c6e', textAlign: 'center' },
});

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 52 },
  hero: {
    backgroundColor: '#fff',
    borderRadius: 20, overflow: 'hidden',
    borderWidth: 2, borderColor: '#8b1a1a',
    marginBottom: 14,
    shadowColor: '#8b1a1a', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 8,
  },
  tileStripHero: { flexDirection: 'row', height: 6 },
  heroBody:      { padding: 22, alignItems: 'center' },
  heroEmoji:     { fontSize: 52, marginBottom: 8 },
  heroSemana:    { fontSize: 12, color: '#8c7c6e', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 },
  heroLabel:     { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  heroPct:       { fontSize: 14, color: '#6b5c54', marginBottom: 16 },
  donJoseQuote:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fdf0ec', borderRadius: 12, borderWidth: 1, borderColor: '#e8c4b8', padding: 12, width: '100%' },
  donJoseIcon:   { fontSize: 22 },
  donJoseFrase:  { flex: 1, fontSize: 13, fontStyle: 'italic', color: '#4a3228', lineHeight: 19 },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16, borderWidth: 1, borderColor: '#e8e0d4',
    padding: 16, marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#3a1a0a', marginBottom: 14 },
  finRow:    { flexDirection: 'row', gap: 8 },
  progRow:   { flexDirection: 'row', gap: 8, marginBottom: 12 },
  xpRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel:   { fontSize: 11, color: '#6b5c54', fontWeight: '700' },
  xpNext:    { fontSize: 11, color: '#8c7c6e' },
  xpTrack:   { height: 8, backgroundColor: '#e8e0d4', borderRadius: 4, overflow: 'hidden' },
  xpFill:    { height: '100%', borderRadius: 4 },
  btnOuter:  { position: 'relative', marginTop: 4 },
  btnShadow: { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', backgroundColor: '#4a0c0c', borderRadius: 50 },
  btnFace:   { backgroundColor: '#8b1a1a', borderRadius: 50, paddingVertical: 16, alignItems: 'center', borderWidth: 2.5, borderColor: '#6b1212' },
  btnText:   { color: '#fff', fontWeight: '800', fontSize: 16 },
});
