import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, useWindowDimensions,
} from 'react-native';

// ── Niveles con mínimo de sobrevivencia ───────────────────────
const NIVEL_INFO = [
  {
    semana: 1, icon: '🛒', titulo: 'El Arranque',
    titleDonJose: 'Novato de la Birria',
    desc: 'Tu primer día como taquero. Aprende lo básico: vender, gastar y ahorrar.',
    recompensa: '$200 de capital inicial',
    minimoSobrevivir: 300,
    tip: 'Guarda al menos $100 en ahorro desde el primer día.',
    dificultad: 1, difLabel: 'Fácil', difColor: '#4a9e4a',
  },
  {
    semana: 2, icon: '🪙', titulo: 'Primeros Riesgos',
    titleDonJose: 'Emprendedor Local',
    desc: 'BirriaCoin hace su aparición. ¿Entras al mundo crypto o te quedas seguro?',
    recompensa: 'Acceso a BirriaCoin',
    minimoSobrevivir: 500,
    tip: 'No inviertas más del 20% en crypto al inicio.',
    dificultad: 1, difLabel: 'Fácil', difColor: '#4a9e4a',
  },
  {
    semana: 3, icon: '🎪', titulo: 'Feria del Barrio',
    titleDonJose: 'Maestro del Puesto',
    desc: 'Evento especial: ventas al doble pero costos también suben.',
    recompensa: 'x1.5 ganancias esta semana',
    minimoSobrevivir: 800,
    tip: 'Reinvierte rápido — la ventana de ventas es corta.',
    dificultad: 2, difLabel: 'Normal', difColor: '#d4901a',
  },
  {
    semana: 4, icon: '📈', titulo: 'Crypto Volátil',
    titleDonJose: 'Dueño de Negocio',
    desc: 'BirriaCoin sube y baja con fuerza. Noticias del barrio casi a diario.',
    recompensa: 'Bono si tu BC vale x2',
    minimoSobrevivir: 1200,
    tip: 'Diversifica. No pongas todo en crypto.',
    dificultad: 3, difLabel: 'Difícil', difColor: '#c0392b',
  },
  {
    semana: 5, icon: '🏪', titulo: 'La Expansión',
    titleDonJose: 'Magnate de la Esquina',
    desc: 'Puedes abrir un segundo punto de venta. Requiere inversión grande.',
    recompensa: 'x2 capacidad de venta',
    minimoSobrevivir: 1800,
    tip: 'Asegúrate de tener fondo de emergencia antes de expandir.',
    dificultad: 3, difLabel: 'Difícil', difColor: '#c0392b',
  },
  {
    semana: 6, icon: '🤝', titulo: 'Inversionista',
    titleDonJose: 'Gurú Financiero',
    desc: 'Un vecino quiere invertir en tu negocio. Decide si aceptas o negocias.',
    recompensa: 'Capital x2 si negocias bien',
    minimoSobrevivir: 2500,
    tip: 'Lee bien los términos antes de aceptar cualquier socio.',
    dificultad: 2, difLabel: 'Normal', difColor: '#d4901a',
  },
  {
    semana: 7, icon: '🏆', titulo: '¡La Gran Final!',
    titleDonJose: 'Rey de la Birria',
    desc: 'La semana más difícil. Eventos extremos, crypto en máxima volatilidad.',
    recompensa: '¡Puesto Famoso del Barrio!',
    minimoSobrevivir: 3500,
    tip: 'Llega con ahorro, efectivo e inversiones balanceadas.',
    dificultad: 4, difLabel: 'BOSS', difColor: '#8b1a1a',
    meta: true,
  },
];

function TileBackground({ width, height }) {
  const TILE = 60;
  const cols = Math.ceil(width / TILE) + 1, rows = Math.ceil(height / TILE) + 1;
  const tiles = [];
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      tiles.push(<View key={`${r}-${c}`} style={{ width: TILE, height: TILE, backgroundColor: (r + c) % 2 === 0 ? '#f5f2eb' : '#ede9e0', borderWidth: 0.8, borderColor: '#d8d2c4' }} />);
  return <View style={StyleSheet.absoluteFill}><View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{tiles}</View></View>;
}

// ── Paso 1: Recompensa ────────────────────────────────────────
function StepRecompensa({ nivel, onNext }) {
  const scale   = useRef(new Animated.Value(0)).current;
  const fadeIn  = useRef(new Animated.Value(0)).current;
  const btnFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale,  { toValue: 1, tension: 50, friction: 7, useNativeDriver: true }),
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(300),
      Animated.timing(btnFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={ss.container}>
      <Animated.View style={{ opacity: fadeIn, transform: [{ scale }] }}>
        <View style={ss.iconCircle}>
          <Text style={{ fontSize: 44 }}>🏅</Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: fadeIn, alignItems: 'center', width: '100%' }}>
        <Text style={ss.label}>RECOMPENSA DE LA SEMANA</Text>
        <Text style={ss.titulo}>{nivel.titulo}</Text>

        {/* Recompensa */}
        <View style={ss.recompensaBox}>
          <Text style={{ fontSize: 22 }}>🎁</Text>
          <Text style={ss.recompensaText}>{nivel.recompensa}</Text>
        </View>

        {/* Mínimo para sobrevivir */}
        <View style={ss.minimoBox}>
          <View style={ss.minimoLeft}>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
            <View>
              <Text style={ss.minimoLabel}>Mínimo para avanzar</Text>
              <Text style={ss.minimoSub}>Título: {nivel.titleDonJose}</Text>
            </View>
          </View>
          <Text style={ss.minimoValor}>${nivel.minimoSobrevivir.toLocaleString()}</Text>
        </View>

        {/* Dificultad */}
        <View style={[ss.difBadge, { backgroundColor: nivel.difColor + '20', borderColor: nivel.difColor + '60' }]}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: i < nivel.dificultad ? nivel.difColor : '#d8d2c4', marginHorizontal: 2 }} />
          ))}
          <Text style={[ss.difText, { color: nivel.difColor }]}>{nivel.difLabel}</Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: btnFade, width: '100%' }}>
        <TouchableOpacity style={ss.btnOuter} onPress={onNext} activeOpacity={0.85}>
          <View style={ss.btnShadow} />
          <View style={ss.btnFace}>
            <Text style={ss.btnText}>Ver consejo del día  →</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Paso 2: Consejo ───────────────────────────────────────────
function StepConsejo({ nivel, onNext }) {
  const slideY  = useRef(new Animated.Value(40)).current;
  const fade    = useRef(new Animated.Value(0)).current;
  const btnFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(slideY, { toValue: 0, tension: 55, friction: 9, useNativeDriver: true }),
        Animated.timing(fade,   { toValue: 1, duration: 450, useNativeDriver: true }),
      ]),
      Animated.delay(400),
      Animated.timing(btnFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={ss.container}>
      <Animated.View style={{ opacity: fade, transform: [{ translateY: slideY }], alignItems: 'center', width: '100%' }}>
        <View style={ss.consejoIconCircle}>
          <Text style={{ fontSize: 36 }}>💡</Text>
        </View>
        <Text style={ss.label}>CONSEJO DEL DÍA</Text>
        <Text style={ss.titulo}>{nivel.titulo}</Text>

        <View style={ss.consejoBox}>
          <Text style={{ fontSize: 20 }}>{nivel.icon}</Text>
          <Text style={ss.consejoDesc}>{nivel.desc}</Text>
        </View>

        <View style={ss.tipBox}>
          <Text style={ss.tipText}>"{nivel.tip}"</Text>
        </View>
      </Animated.View>

      <Animated.View style={{ opacity: btnFade, width: '100%' }}>
        <TouchableOpacity style={ss.btnOuter} onPress={onNext} activeOpacity={0.85}>
          <View style={ss.btnShadow} />
          <View style={ss.btnFace}>
            <Text style={ss.btnText}>¡Listo, a jugar! 🌮</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Paso 3: ¡Comienza! ────────────────────────────────────────
function StepDia({ nivel, dia, onFinish }) {
  const scale     = useRef(new Animated.Value(0.5)).current;
  const fade      = useRef(new Animated.Value(0)).current;
  const btnFade   = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, { toValue: 1, tension: 55, friction: 8, useNativeDriver: true }),
        Animated.timing(fade,  { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.delay(200),
      Animated.timing(btnFade, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.1, duration: 650, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,   duration: 650, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={ss.container}>
      <Animated.View style={{ opacity: fade, transform: [{ scale }], alignItems: 'center', width: '100%' }}>
        <Animated.View style={[ss.diaCircle, { transform: [{ scale: pulseAnim }] }]}>
          <Text style={{ fontSize: 44 }}>{nivel.icon}</Text>
        </Animated.View>

        <Text style={ss.diaLabel}>¡COMIENZA!</Text>

        <View style={ss.diaInfoRow}>
          <View style={ss.diaInfoBox}>
            <Text style={ss.diaInfoNum}>Día {dia}</Text>
            <Text style={ss.diaInfoSub}>Jornada</Text>
          </View>
          <View style={ss.diaInfoDivider} />
          <View style={ss.diaInfoBox}>
            <Text style={ss.diaInfoNum}>Semana {nivel.semana}</Text>
            <Text style={ss.diaInfoSub}>Nivel</Text>
          </View>
        </View>

        {/* Meta mínima visible al inicio del día */}
        <View style={[ss.minimoBox, { marginTop: 8 }]}>
          <View style={ss.minimoLeft}>
            <Text style={{ fontSize: 16 }}>🎯</Text>
            <Text style={ss.minimoLabel}>Meta mínima: ${nivel.minimoSobrevivir.toLocaleString()}</Text>
          </View>
        </View>

        <Text style={ss.diaNivelNombre}>{nivel.titleDonJose}</Text>
      </Animated.View>

      <Animated.View style={{ opacity: btnFade, width: '100%' }}>
        <TouchableOpacity style={ss.btnOuter} onPress={onFinish} activeOpacity={0.85}>
          <View style={ss.btnShadow} />
          <View style={ss.btnFace}>
            <Text style={ss.btnText}>▶  ¡Empezar Día {dia}!</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Componente principal ──────────────────────────────────────
export default function LevelIntroScreen({ semana = 1, dia = 1, onFinish }) {
  const { width, height } = useWindowDimensions();
  const [step, setStep]   = useState(0);
  const nivel = NIVEL_INFO[Math.min(semana - 1, NIVEL_INFO.length - 1)];

  const fadeAnim = useRef(new Animated.Value(1)).current;

  const goToStep = (next) => {
    Animated.timing(fadeAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setStep(next);
      Animated.timing(fadeAnim, { toValue: 1, duration: 280, useNativeDriver: true }).start();
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f2eb' }}>
      <TileBackground width={width} height={height} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,245,238,0.55)' }]} />

      {/* Indicador de pasos */}
      <View style={ss.stepsRow}>
        {['🎁', '💡', '📅'].map((icon, i) => (
          <View key={i} style={[ss.stepDot, i === step && ss.stepDotActive, i < step && ss.stepDotDone]}>
            <Text style={{ fontSize: i === step ? 14 : 10, opacity: i <= step ? 1 : 0.4 }}>{icon}</Text>
          </View>
        ))}
      </View>

      <Animated.View style={[ss.card, { opacity: fadeAnim, maxWidth: Math.min(width - 32, 420), alignSelf: 'center', width: '100%' }]}>
        <View style={ss.tileStrip}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View key={i} style={[ss.tile, { backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0' }]} />
          ))}
        </View>
        <View style={ss.cardBody}>
          {step === 0 && <StepRecompensa nivel={nivel} onNext={() => goToStep(1)} />}
          {step === 1 && <StepConsejo    nivel={nivel} onNext={() => goToStep(2)} />}
          {step === 2 && <StepDia        nivel={nivel} dia={dia} onFinish={onFinish} />}
        </View>
      </Animated.View>
    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────────
const ss = StyleSheet.create({
  stepsRow:   { flexDirection: 'row', justifyContent: 'center', gap: 12, paddingTop: 56, paddingBottom: 16 },
  stepDot:    { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#d8d2c4', alignItems: 'center', justifyContent: 'center' },
  stepDotActive: { borderColor: '#8b1a1a', borderWidth: 2.5, backgroundColor: '#fdf0ec' },
  stepDotDone:   { backgroundColor: '#8b1a1a', borderColor: '#6b1212' },
  card:       { backgroundColor: '#fff', borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#8b1a1a', marginHorizontal: 16, shadowColor: '#8b1a1a', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 16, elevation: 10 },
  tileStrip:  { flexDirection: 'row', height: 8 },
  tile:       { flex: 1, borderWidth: 0.5, borderColor: '#d8d2c4' },
  cardBody:   { padding: 22, paddingBottom: 26 },
  container:  { alignItems: 'center', gap: 14 },
  label:      { fontSize: 10, fontWeight: '800', letterSpacing: 2, color: '#8c7c6e', textTransform: 'uppercase', marginBottom: 2 },
  titulo:     { fontSize: 22, fontWeight: '800', color: '#3a1a0a', textAlign: 'center', marginBottom: 10 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fdf0ec', borderWidth: 2.5, borderColor: '#e8c4b8', alignItems: 'center', justifyContent: 'center' },
  recompensaBox: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fdf0ec', borderRadius: 12, borderWidth: 1.5, borderColor: '#e8c4b8', padding: 12, width: '100%', marginBottom: 10 },
  recompensaText:{ fontSize: 15, fontWeight: '700', color: '#8b1a1a', flex: 1 },
  minimoBox:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#fff3cd', borderRadius: 12, borderWidth: 1.5, borderColor: '#fde68a', padding: 12, width: '100%', marginBottom: 10 },
  minimoLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  minimoLabel:{ fontSize: 13, fontWeight: '700', color: '#78520a' },
  minimoSub:  { fontSize: 10, color: '#b5820a', marginTop: 1 },
  minimoValor:{ fontSize: 18, fontWeight: '800', color: '#8b1a1a' },
  difBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 12, paddingVertical: 6 },
  difText:    { fontSize: 12, fontWeight: '700', marginLeft: 4 },
  consejoIconCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#fffbeb', borderWidth: 2, borderColor: '#fde68a', alignItems: 'center', justifyContent: 'center' },
  consejoBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fdf0ec', borderRadius: 12, borderWidth: 1, borderColor: '#e8c4b8', padding: 12, width: '100%' },
  consejoDesc:{ flex: 1, fontSize: 13, color: '#4a3228', lineHeight: 19 },
  tipBox:     { backgroundColor: '#fffbeb', borderRadius: 12, borderWidth: 1.5, borderColor: '#fde68a', padding: 12, width: '100%' },
  tipText:    { fontSize: 13, fontStyle: 'italic', color: '#78520a', lineHeight: 20, textAlign: 'center' },
  diaCircle:  { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fdf0ec', borderWidth: 4, borderColor: '#8b1a1a', alignItems: 'center', justifyContent: 'center', marginBottom: 8, shadowColor: '#8b1a1a', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  diaLabel:   { fontSize: 12, fontWeight: '800', letterSpacing: 3, color: '#8b1a1a', marginBottom: 14 },
  diaInfoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fdf0ec', borderRadius: 14, borderWidth: 1.5, borderColor: '#e8c4b8', padding: 14, width: '100%', marginBottom: 10 },
  diaInfoBox: { flex: 1, alignItems: 'center' },
  diaInfoNum: { fontSize: 17, fontWeight: '800', color: '#3a1a0a' },
  diaInfoSub: { fontSize: 10, color: '#8c7c6e', marginTop: 2 },
  diaInfoDivider: { width: 1, height: 32, backgroundColor: '#e8c4b8', marginHorizontal: 8 },
  diaNivelNombre: { fontSize: 13, color: '#8c7c6e', fontStyle: 'italic' },
  btnOuter:   { position: 'relative', marginTop: 4 },
  btnShadow:  { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', backgroundColor: '#4a0c0c', borderRadius: 50 },
  btnFace:    { backgroundColor: '#8b1a1a', borderRadius: 50, paddingVertical: 14, alignItems: 'center', borderWidth: 2.5, borderColor: '#6b1212' },
  btnText:    { color: '#fff', fontSize: 15, fontWeight: '800', letterSpacing: 0.5 },
});
