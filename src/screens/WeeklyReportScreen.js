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

// Tarjeta de análisis contrafactual
function ContrafactualCard({ item }) {
  const bg = item.tipo === 'fracaso' ? '#fef3f2' : '#f0f9ff';
  const border = item.tipo === 'fracaso' ? '#fca5a5' : '#bae6fd';
  const color = item.tipo === 'fracaso' ? '#c0392b' : '#1a6fb5';
  return (
    <View style={[cf.card, { backgroundColor: bg, borderColor: border }]}>
      <View style={cf.header}>
        <Text style={{ fontSize: 20 }}>{item.emoji}</Text>
        <Text style={[cf.titulo, { color }]}>{item.titulo}</Text>
      </View>
      <Text style={cf.descripcion}>{item.descripcion}</Text>
      <View style={cf.leccionRow}>
        <Text style={cf.leccionIcon}>💡</Text>
        <Text style={cf.leccion}>{item.leccion}</Text>
      </View>
    </View>
  );
}
const cf = StyleSheet.create({
  card:       { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 10 },
  header:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  titulo:     { flex: 1, fontSize: 13, fontWeight: '800', lineHeight: 18 },
  descripcion:{ fontSize: 12, color: '#4a3228', lineHeight: 18, marginBottom: 8 },
  leccionRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  leccionIcon:{ fontSize: 14 },
  leccion:    { flex: 1, fontSize: 11, color: '#6b5c54', fontStyle: 'italic', lineHeight: 16 },
});

// Historial de decisiones probabilísticas
function HistorialDecision({ entrada }) {
  if (!entrada.resultado) return null;
  const { exito } = entrada.resultado;
  const pct = Math.round((entrada.decision.probabilidadExito || 1) * 100);
  const color = exito ? '#4a9e4a' : '#c0392b';
  const icon = exito ? '✅' : '❌';
  return (
    <View style={hd.row}>
      <Text style={hd.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={hd.titulo}>{entrada.decision.titulo}</Text>
        <Text style={hd.sub}>{exito ? entrada.resultado.efecto.label : entrada.resultado.efecto.label}</Text>
      </View>
      <View style={[hd.badge, { backgroundColor: color + '20', borderColor: color + '60' }]}>
        <Text style={[hd.badgeText, { color }]}>{pct}%</Text>
      </View>
    </View>
  );
}
const hd = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#e8e0d4' },
  icon:      { fontSize: 14, width: 20 },
  titulo:    { fontSize: 12, fontWeight: '700', color: '#3a1a0a' },
  sub:       { fontSize: 11, color: '#8c7c6e', marginTop: 2 },
  badge:     { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  badgeText: { fontSize: 11, fontWeight: '800' },
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

  const {
    semanaGlobal, totalDecisiones, totalRecomendadas, totalNoRecomendadas,
    porcentajeRecomendadas, efectivoFinal, ahorroFinal, contrafactual, historialSemana,
  } = resumenSemana;
  const pct = Math.round(porcentajeRecomendadas * 100);
  const maxW = Math.min(width, 520);

  // Stats roguelike de la semana
  const decisionesConResultado = (historialSemana || []).filter(h => h.resultado);
  const exitosRoguelike = decisionesConResultado.filter(h => h.resultado.exito).length;
  const totalRoguelike  = decisionesConResultado.length;
  const pctRoguelike    = totalRoguelike > 0 ? Math.round((exitosRoguelike / totalRoguelike) * 100) : 0;

  // CHECK DE SUPERVIVENCIA
  const CAPITAL_MIN = 50;
  const decConRes = (historialSemana || []).filter(h => h.resultado);
  const exitosPct = decConRes.length > 0 ? decConRes.filter(h => h.resultado.exito).length / decConRes.length : 1;
  const capitalOk = (efectivoFinal || 0) >= CAPITAL_MIN;
  const scoreOk   = exitosPct >= 0.50;

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
            <View style={styles.donJoseQuote}>
              <Text style={styles.donJoseIcon}>👨‍🍳</Text>
              <Text style={styles.donJoseFrase}>{medalla.frase}</Text>
            </View>
          </View>
        </Animated.View>

        <Animated.View style={{ opacity: cardsFade, transform: [{ translateY: cardsAnim }] }}>

          {/* Stats de decisiones */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Decisiones de la semana</Text>
            <BarraProgreso pct={pct}       color="#4a9e4a" label="✅ Acertadas"  valor={`${totalRecomendadas} de ${totalDecisiones}`} />
            <BarraProgreso pct={100 - pct} color="#c0392b" label="❌ Errores"    valor={`${totalNoRecomendadas} de ${totalDecisiones}`} />
            {/* Nuevo: suerte roguelike */}
            {totalRoguelike > 0 && (
              <>
                <View style={styles.separador} />
                <Text style={styles.subCardTitle}>🎲 Resultados probabilísticos</Text>
                <BarraProgreso
                  pct={pctRoguelike}
                  color="#b5820a"
                  label="🎲 Decisiones exitosas"
                  valor={`${exitosRoguelike}/${totalRoguelike}`}
                />
                <Text style={styles.ayudaTexto}>
                  {pctRoguelike >= 60
                    ? 'El azar estuvo de tu lado esta semana 🍀'
                    : pctRoguelike >= 40
                    ? 'Semana pareja — mezcla de suerte y desgracia'
                    : 'El mercado fue difícil. Las probabilidades no estuvieron a tu favor 🎰'}
                </Text>
              </>
            )}
          </View>

          {/* Finanzas */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>💰 Estado financiero</Text>
            <View style={styles.finRow}>
              <FinBox icon="💵" label="Efectivo"  value={`$${(efectivoFinal || 0).toFixed(0)}`}   color="#4a9e4a" />
              <FinBox icon="🏦" label="Ahorro"    value={`$${(ahorroFinal  || 0).toFixed(0)}`}   color="#1a6fb5" />
              <FinBox icon="💎" label="Patrimonio" value={`$${patrimonioTotal.toFixed(0)}`}         color="#8b1a1a" />
            </View>
            {state.carteraCrypto > 0 && (
              <View style={styles.cryptoRow}>
                <Text style={styles.cryptoIcon}>🪙</Text>
                <Text style={styles.cryptoText}>
                  {state.carteraCrypto.toFixed(2)} BC × ${state.precioBC.toFixed(2)} = ${(state.carteraCrypto * state.precioBC).toFixed(0)}
                </Text>
              </View>
            )}
          </View>

          {/* ── ANÁLISIS CONTRAFACTUAL — lo nuevo ──────────────── */}
          {contrafactual && (contrafactual.contrafactuales?.length > 0 || contrafactual.consejoPróximaSemana) && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔮 ¿Qué hubiera pasado si...?</Text>
              <Text style={styles.contrafactualIntro}>
                Análisis de tus decisiones de esta semana y lo que podría haber sido diferente.
              </Text>

              {contrafactual.contrafactuales?.map((item, i) => (
                <ContrafactualCard key={i} item={item} />
              ))}

              {/* Consejo para la siguiente semana */}
              <View style={styles.consejoPróximo}>
                <Text style={styles.consejoPróximoIcon}>🧭</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.consejoPróximoTitulo}>Consejo para la semana {semanaGlobal + 1}</Text>
                  <Text style={styles.consejoPróximoTexto}>{contrafactual.consejoPróximaSemana}</Text>
                </View>
              </View>
            </View>
          )}

          {/* Historial de decisiones de la semana */}
          {historialSemana && historialSemana.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📋 Historial de decisiones</Text>
              {historialSemana.filter(h => h.resultado).map((entrada, i) => (
                <HistorialDecision key={i} entrada={entrada} />
              ))}
              {historialSemana.filter(h => !h.resultado).length > 0 && (
                <Text style={styles.ayudaTexto}>
                  Algunas decisiones fueron garantizadas (sin probabilidad).
                </Text>
              )}
            </View>
          )}

          {/* Progresión */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>⬆️ Tu progresión</Text>
            <View style={styles.progRow}>
              <ProgBox emoji={nivel.emoji}  label="Nivel"    value={nivel.titulo}                color={nivel.color} />
              <ProgBox emoji="🎯"           label="Misiones" value={`${misionesCumplidas} cumplidas`} color="#b5820a" />
              <ProgBox emoji="🔥"           label="Racha"    value={`${rachaDias} días`}         color="#c0392b" />
              <ProgBox emoji="🏅"           label="Logros"   value={`${logrosObtenidos.length} / 8`} color="#4a9e4a" />
            </View>
            <View style={styles.xpRow}>
              <Text style={styles.xpLabel}>{nivel.emoji} {nivel.xpEnNivel} / {nivel.xpParaSiguiente} XP</Text>
              {nivel.siguiente && <Text style={styles.xpNext}>→ {nivel.siguiente.emoji} {nivel.siguiente.titulo}</Text>}
            </View>
            <View style={styles.xpTrack}>
              <View style={[styles.xpFill, { width: `${Math.round(nivel.progreso * 100)}%`, backgroundColor: nivel.color }]} />
            </View>
          </View>

          {/* CHECK DE SUPERVIVENCIA */}
          <View style={[styles.card, !capitalOk || !scoreOk ? { borderColor: '#fca5a5', borderWidth: 2 } : {}]}>
            <Text style={styles.cardTitle}>🛡️ Check de Supervivencia</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={[sv.chip, { borderColor: capitalOk ? '#bbf7d0' : '#fca5a5', backgroundColor: capitalOk ? '#f0fdf4' : '#fef2f2' }]}>
                <Text style={{ fontSize: 14 }}>{capitalOk ? '✅' : '❌'}</Text>
                <View>
                  <Text style={sv.chipLabel}>Capital mín. $50</Text>
                  <Text style={[sv.chipVal, { color: capitalOk ? '#15803d' : '#991b1b' }]}>${(efectivoFinal || 0).toFixed(0)}</Text>
                </View>
              </View>
              <View style={[sv.chip, { borderColor: scoreOk ? '#bbf7d0' : '#fca5a5', backgroundColor: scoreOk ? '#f0fdf4' : '#fef2f2', flex: 1 }]}>
                <Text style={{ fontSize: 14 }}>{scoreOk ? '✅' : '❌'}</Text>
                <View>
                  <Text style={sv.chipLabel}>Score ≥50% éxito</Text>
                  <Text style={[sv.chipVal, { color: scoreOk ? '#15803d' : '#991b1b' }]}>{Math.round(exitosPct * 100)}%</Text>
                </View>
              </View>
            </View>
            {(!capitalOk || !scoreOk) && (
              <View style={sv.alerta}>
                <Text style={sv.alertaTxt}>⚠️ Don José está en quiebra al avanzar. ¡Mejora ambos criterios!</Text>
              </View>
            )}
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

const sv = StyleSheet.create({
  chip:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  chipLabel: { fontSize: 10, color: '#6b5c54', fontWeight: '700' },
  chipVal:   { fontSize: 15, fontWeight: '800' },
  alerta:    { marginTop: 10, backgroundColor: '#fef2f2', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#fca5a5' },
  alertaTxt: { fontSize: 12, color: '#991b1b', fontWeight: '600', lineHeight: 18 },
});

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 52 },
  hero: {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    borderWidth: 2, borderColor: '#8b1a1a', marginBottom: 14,
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
  cardTitle:    { fontSize: 14, fontWeight: '800', color: '#3a1a0a', marginBottom: 14 },
  subCardTitle: { fontSize: 12, fontWeight: '700', color: '#6b5c54', marginBottom: 10 },
  separador:    { height: 1, backgroundColor: '#e8e0d4', marginVertical: 12 },
  ayudaTexto:   { fontSize: 11, color: '#8c7c6e', fontStyle: 'italic', marginTop: 4 },
  finRow:       { flexDirection: 'row', gap: 8 },
  cryptoRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, paddingTop: 12, borderTopWidth: 0.5, borderTopColor: '#e8e0d4' },
  cryptoIcon:   { fontSize: 16 },
  cryptoText:   { fontSize: 12, color: '#8b1a1a', fontWeight: '700' },
  contrafactualIntro: { fontSize: 12, color: '#6b5c54', marginBottom: 12, lineHeight: 18 },
  consejoPróximo: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#f0fdf4', borderRadius: 10, borderWidth: 1, borderColor: '#bbf7d0',
    padding: 12, marginTop: 4,
  },
  consejoPróximoIcon:   { fontSize: 20 },
  consejoPróximoTitulo: { fontSize: 12, fontWeight: '800', color: '#166534', marginBottom: 4 },
  consejoPróximoTexto:  { fontSize: 12, color: '#15803d', lineHeight: 17 },
  progRow:  { flexDirection: 'row', gap: 8, marginBottom: 12 },
  xpRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  xpLabel:  { fontSize: 11, color: '#6b5c54', fontWeight: '700' },
  xpNext:   { fontSize: 11, color: '#8c7c6e' },
  xpTrack:  { height: 8, backgroundColor: '#e8e0d4', borderRadius: 4, overflow: 'hidden' },
  xpFill:   { height: '100%', borderRadius: 4 },
  btnOuter:  { position: 'relative', marginTop: 4 },
  btnShadow: { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', backgroundColor: '#4a0c0c', borderRadius: 50 },
  btnFace:   { backgroundColor: '#8b1a1a', borderRadius: 50, paddingVertical: 16, alignItems: 'center', borderWidth: 2.5, borderColor: '#6b1212' },
  btnText:   { color: '#fff', fontWeight: '800', fontSize: 16 },
});
