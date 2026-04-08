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

// Lecciones que Don José da al quebrar
const LECCIONES_BANCARROTA = [
  { concepto: 'fondo_emergencia',   lección: 'Nunca tuve un fondo de emergencia. Cuando llegó el inspector, no tenía para pagar.' },
  { concepto: 'flujo_caja',         lección: 'Gasté más de lo que ganaba cada día. El flujo de caja siempre tiene que ser positivo.' },
  { concepto: 'diversificacion',    lección: 'Puse todo en BirriaCoin cuando bajó... perdí todo de golpe. Hay que diversificar.' },
  { concepto: 'costos_fijos',       lección: 'Los costos fijos se pagan aunque no trabajes. Eso me hundió cuando cerré temprano.' },
];

export default function BankruptScreen() {
  const { state, reiniciar } = useGame();
  const { width, height } = useWindowDimensions();
  const nivel = getNivelActual(state.xpTotal || 0);
  const maxW  = Math.min(width, 520);

  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Shake del emoji
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 1,  duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -1, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 1,  duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 100, useNativeDriver: true }),
    ]).start();
    // Fade in contenido
    Animated.sequence([
      Animated.delay(400),
      Animated.parallel([
        Animated.timing(fadeAnim,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const shakeX = shakeAnim.interpolate({ inputRange: [-1, 1], outputRange: [-15, 15] });

  // Elegir lección según lo que pasó
  const totalDecisiones = state.historial.length;
  const leccionIdx      = totalDecisiones % LECCIONES_BANCARROTA.length;
  const leccion         = LECCIONES_BANCARROTA[leccionIdx];
  const conceptoData    = CONCEPTOS_FINANCIEROS[leccion.concepto];

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f2eb' }}>
      <TileBackground width={width} height={height} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,245,238,0.5)' }]} />

      <ScrollView contentContainerStyle={[styles.content, { maxWidth: maxW, alignSelf: 'center', width: '100%' }]}>

        {/* Hero bancarrota */}
        <View style={styles.heroCard}>
          <View style={styles.tileStrip}>
            {Array.from({ length: 20 }).map((_, i) => (
              <View key={i} style={{ flex: 1, height: 6, backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0', borderWidth: 0.5, borderColor: '#d8d2c4' }} />
            ))}
          </View>
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Animated.Text style={[styles.heroEmoji, { transform: [{ translateX: shakeX }] }]}>😭</Animated.Text>
            <Text style={styles.heroTitulo}>¡Bancarrota!</Text>
            <Text style={styles.heroSub}>
              El puesto cerró en el Día {state.diaGlobal}, Semana {state.semanaGlobal}.
            </Text>
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

          {/* Don José habla */}
          <View style={styles.card}>
            <View style={styles.donJoseRow}>
              <Text style={{ fontSize: 30 }}>👨‍🍳</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.donJoseTitulo}>Don José reflexiona...</Text>
                <Text style={styles.donJoseFrase}>"{leccion.lección}"</Text>
              </View>
            </View>
          </View>

          {/* Lección financiera del fracaso */}
          <View style={[styles.card, { backgroundColor: '#fffbeb', borderColor: '#fde68a' }]}>
            <Text style={styles.leccionBadge}>📚 LO QUE APRENDISTE</Text>
            <Text style={styles.leccionTermino}>{conceptoData?.termino}</Text>
            <Text style={styles.leccionDef}>{conceptoData?.def}</Text>
          </View>

          {/* Stats del intento */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📊 Este intento</Text>
            <View style={styles.statsGrid}>
              <StatBox emoji="📅" label="Días jugados"   value={state.diaGlobal} color="#8b1a1a" />
              <StatBox emoji="🎯" label="Decisiones"     value={totalDecisiones} color="#1a6fb5" />
              <StatBox emoji={nivel.emoji} label="Nivel"  value={nivel.titulo}   color={nivel.color} small />
              <StatBox emoji="🏅" label="Logros"          value={`${state.logrosObtenidos.length}`} color="#b5820a" />
            </View>
          </View>

          {/* XP ganado */}
          <View style={[styles.card, { backgroundColor: '#fdf0ec', borderColor: '#e8c4b8' }]}>
            <Text style={styles.xpGanadoLabel}>💎 XP total acumulado</Text>
            <Text style={styles.xpGanadoNum}>{state.xpTotal || 0} XP</Text>
            <Text style={styles.xpGanadoSub}>
              El conocimiento financiero que ganaste ¡ya nadie te lo quita!
            </Text>
          </View>

          {/* Botón reiniciar */}
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

function StatBox({ emoji, label, value, color, small }) {
  return (
    <View style={sb.box}>
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <Text style={[sb.val, { color, fontSize: small ? 11 : 18 }]}>{value}</Text>
      <Text style={sb.label}>{label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  box:   { flex: 1, alignItems: 'center', gap: 3, padding: 8 },
  val:   { fontWeight: '800', textAlign: 'center' },
  label: { fontSize: 10, color: '#8c7c6e', textAlign: 'center' },
});

const styles = StyleSheet.create({
  content: { padding: 16, paddingTop: 52 },
  heroCard: {
    backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    borderWidth: 2, borderColor: '#c0392b', marginBottom: 14,
  },
  tileStrip: { flexDirection: 'row' },
  heroEmoji:  { fontSize: 60, marginBottom: 10 },
  heroTitulo: { fontSize: 28, fontWeight: '800', color: '#c0392b', marginBottom: 6 },
  heroSub:    { fontSize: 13, color: '#6b5c54', textAlign: 'center' },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16, borderWidth: 1, borderColor: '#e8e0d4',
    padding: 16, marginBottom: 12,
  },
  cardTitle: { fontSize: 14, fontWeight: '800', color: '#3a1a0a', marginBottom: 12 },
  donJoseRow:   { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  donJoseTitulo:{ fontSize: 12, fontWeight: '700', color: '#8c7c6e', marginBottom: 4 },
  donJoseFrase: { fontSize: 14, fontStyle: 'italic', color: '#4a3228', lineHeight: 21 },
  leccionBadge: { fontSize: 10, fontWeight: '800', color: '#b5820a', letterSpacing: 1.5, marginBottom: 8 },
  leccionTermino:{ fontSize: 16, fontWeight: '800', color: '#78520a', marginBottom: 6 },
  leccionDef:   { fontSize: 13, color: '#4a3228', lineHeight: 20 },
  statsGrid:    { flexDirection: 'row', flexWrap: 'wrap' },
  xpGanadoLabel:{ fontSize: 12, color: '#8c7c6e', fontWeight: '700', marginBottom: 4 },
  xpGanadoNum:  { fontSize: 28, fontWeight: '800', color: '#8b1a1a', marginBottom: 4 },
  xpGanadoSub:  { fontSize: 12, color: '#6b5c54', fontStyle: 'italic' },
  btnOuter:  { position: 'relative', marginTop: 4 },
  btnShadow: { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', backgroundColor: '#4a0c0c', borderRadius: 50 },
  btnFace:   { backgroundColor: '#8b1a1a', borderRadius: 50, paddingVertical: 16, alignItems: 'center', borderWidth: 2.5, borderColor: '#6b1212' },
  btnText:   { color: '#fff', fontWeight: '800', fontSize: 16 },
});
