import React, { useRef, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, useWindowDimensions,
} from 'react-native';
import { useGame } from '../context/GameContext';

// ── Popup genérico con tira de azulejos ─────────────────────
function GamePopup({ visible, borderColor = '#8b1a1a', onContinuar, btnLabel = 'Continuar  →', children }) {
  const { width } = useWindowDimensions();
  const slideAnim = useRef(new Animated.Value(400)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
        Animated.timing(fadeAnim,  { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      slideAnim.setValue(400); fadeAnim.setValue(0);
    }
  }, [visible]);

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View style={[styles.card, { borderTopColor: borderColor, transform: [{ translateY: slideAnim }], maxWidth: Math.min(width, 520), alignSelf: 'center', width: '100%' }]}>
          <View style={styles.tileStrip}>
            {Array.from({ length: 28 }).map((_, i) => (
              <View key={i} style={[styles.tile, { backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0' }]} />
            ))}
          </View>
          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 460 }}>
            {children}
          </ScrollView>
          <View style={styles.footer}>
            <TouchableOpacity style={styles.btnOuter} onPress={onContinuar} activeOpacity={0.85}>
              <View style={[styles.btnShadow, { backgroundColor: borderColor + '88' }]} />
              <View style={[styles.btnFace, { backgroundColor: borderColor }]}>
                <Text style={styles.btnText}>{btnLabel}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ── POPUP FEEDBACK del día ───────────────────────────────────
function PopupFeedback({ data, onContinuar }) {
  const borderColor = data.tipo === 'bueno' ? '#4a9e4a' : data.tipo === 'malo' ? '#c0392b' : '#d4901a';
  const btnLabel = data.tipo === 'bueno' ? '¡Siguiente día!  →' : 'Entendido  →';
  return (
    <GamePopup visible borderColor={borderColor} onContinuar={onContinuar} btnLabel={btnLabel}>
      <View style={styles.body}>
        <Text style={styles.titulo}>{data.titulo}</Text>
        <Text style={styles.seccion}>📊 Resumen</Text>
        {data.detalles.map((d, i) => (
          <View key={i} style={[styles.detalleRow, { borderLeftColor: d.color }]}>
            <View style={styles.detalleLeft}>
              <Text style={{ fontSize: 18 }}>{d.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.detalleLabel}>{d.label}</Text>
                {d.sub ? <Text style={styles.detalleSub}>{d.sub}</Text> : null}
              </View>
            </View>
            <Text style={[styles.detalleValue, { color: d.color }]}>{d.value}</Text>
          </View>
        ))}
        <View style={styles.patrimonioBox}>
          <Text style={styles.patrimonioLabel}>Patrimonio total</Text>
          <Text style={styles.patrimonioValue}>${data.patrimonioTotal.toFixed(0)}</Text>
        </View>
        {data.concepto && (
          <View style={styles.conceptoInline}>
            <Text style={styles.conceptoIcon}>📚</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.conceptoTermino}>{data.concepto.termino}</Text>
              <Text style={styles.conceptoDef}>{data.concepto.def}</Text>
            </View>
          </View>
        )}
      </View>
    </GamePopup>
  );
}

// ── POPUP CONSEJO educativo ──────────────────────────────────
function PopupConsejo({ data, onContinuar }) {
  return (
    <GamePopup visible borderColor="#8b1a1a" onContinuar={onContinuar} btnLabel="¡Entendido!">
      <View style={[styles.body, { alignItems: 'center' }]}>
        <View style={styles.consejoIconCircle}><Text style={{ fontSize: 32 }}>💡</Text></View>
        <Text style={[styles.titulo, { color: '#8b1a1a', textAlign: 'center' }]}>{data.titulo}</Text>
        <View style={styles.divider} />
        <Text style={[styles.mensaje, { textAlign: 'center' }]}>{data.consejo}</Text>
      </View>
    </GamePopup>
  );
}

// ── POPUP LOGRO desbloqueado ─────────────────────────────────
function PopupLogro({ data, onContinuar }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 50, friction: 6, useNativeDriver: true, delay: 200 }).start();
  }, []);
  return (
    <GamePopup visible borderColor="#b5820a" onContinuar={onContinuar} btnLabel="¡Genial!  🎉">
      <View style={[styles.body, { alignItems: 'center' }]}>
        <Animated.View style={[styles.logroCircle, { transform: [{ scale: scaleAnim }] }]}>
          <Text style={{ fontSize: 48 }}>{data.emoji}</Text>
        </Animated.View>
        <View style={styles.logroBadge}><Text style={styles.logroBadgeText}>🏅 LOGRO DESBLOQUEADO</Text></View>
        <Text style={[styles.titulo, { textAlign: 'center', color: '#b5820a' }]}>{data.titulo}</Text>
        <Text style={[styles.mensaje, { textAlign: 'center' }]}>{data.desc}</Text>
      </View>
    </GamePopup>
  );
}

// ── POPUP NOTICIA del barrio ─────────────────────────────────
function PopupNoticia({ data, onContinuar }) {
  const esBuena     = data.cambioPorcentualPrecio >= 0;
  const pct         = Math.abs(data.cambioPorcentualPrecio * 100).toFixed(0);
  const accentColor = esBuena ? '#4a9e4a' : '#c0392b';
  return (
    <GamePopup visible borderColor={accentColor} onContinuar={onContinuar} btnLabel="Ok, entendido">
      <View style={styles.body}>
        <Text style={styles.noticiaBadge}>📰 NOTICIAS DEL BARRIO</Text>
        <Text style={styles.titulo}>{data.titulo}</Text>
        <Text style={styles.mensaje}>{data.descripcion}</Text>
        <View style={[styles.impactoBox, { backgroundColor: accentColor + '15', borderColor: accentColor + '55' }]}>
          <Text style={[styles.impactoText, { color: accentColor }]}>
            {esBuena ? '📈' : '📉'}  BirriaCoin {esBuena ? '+' : '-'}{pct}%
          </Text>
        </View>
      </View>
    </GamePopup>
  );
}


// ── POPUP SUBIDA DE NIVEL ────────────────────────────────────
function PopupNivel({ data, onContinuar }) {
  const scaleAnim  = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim,  { toValue: 1.2, tension: 50, friction: 5, useNativeDriver: true }),
      Animated.spring(scaleAnim,  { toValue: 1,   tension: 80, friction: 8, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotateAnim, { toValue: 1,  duration: 300, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: -1, duration: 300, useNativeDriver: true }),
        Animated.timing(rotateAnim, { toValue: 0,  duration: 300, useNativeDriver: true }),
      ]), { iterations: 2 }
    ).start();
  }, []);
  const rotate = rotateAnim.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] });
  return (
    <GamePopup visible borderColor={data.color || '#b5820a'} onContinuar={onContinuar} btnLabel="¡Vamos por más! 🚀">
      <View style={[styles.body, { alignItems: 'center' }]}>
        <View style={[styles.logroBadge, { backgroundColor: data.color || '#b5820a' }]}>
          <Text style={styles.logroBadgeText}>⬆️ SUBISTE DE NIVEL</Text>
        </View>
        <Animated.Text style={{ fontSize: 60, marginVertical: 12, transform: [{ scale: scaleAnim }, { rotate }] }}>
          {data.emoji}
        </Animated.Text>
        <Text style={[styles.titulo, { color: data.color || '#b5820a', textAlign: 'center' }]}>
          {data.titulo}
        </Text>
        <Text style={[styles.mensaje, { textAlign: 'center' }]}>
          ¡Don José está creciendo! Nivel {data.nivel} desbloqueado.
        </Text>
        {data.siguiente && (
          <View style={[styles.patrimonioBox, { borderColor: data.color + '44' || '#b5820a44', backgroundColor: data.color + '10' || '#b5820a10' }]}>
            <Text style={styles.patrimonioLabel}>Siguiente nivel</Text>
            <Text style={[styles.patrimonioValue, { color: data.color || '#b5820a' }]}>
              {data.siguiente.emoji} {data.siguiente.titulo}
            </Text>
          </View>
        )}
      </View>
    </GamePopup>
  );
}

// ── POPUP CONCEPTO FINANCIERO ────────────────────────────────
function PopupConcepto({ data, onContinuar }) {
  return (
    <GamePopup visible borderColor="#b5820a" onContinuar={onContinuar} btnLabel="📖 Guardado en mi glosario">
      <View style={[styles.body, { alignItems: 'center' }]}>
        <View style={styles.consejoIconCircle}>
          <Text style={{ fontSize: 32 }}>📚</Text>
        </View>
        <View style={[styles.logroBadge, { backgroundColor: '#b5820a' }]}>
          <Text style={styles.logroBadgeText}>CONCEPTO DEL DÍA</Text>
        </View>
        <Text style={[styles.titulo, { color: '#78520a', textAlign: 'center', marginTop: 10 }]}>{data.termino}</Text>
        <View style={styles.divider} />
        <Text style={[styles.mensaje, { textAlign: 'center', color: '#4a3228' }]}>{data.def}</Text>
        <View style={{ backgroundColor: '#fffbeb', borderRadius: 10, borderWidth: 1, borderColor: '#fde68a', padding: 12, width: '100%', marginTop: 4 }}>
          <Text style={{ fontSize: 11, color: '#78520a', fontStyle: 'italic', textAlign: 'center' }}>
            Este concepto fue desbloqueado por tus decisiones de hoy
          </Text>
        </View>
      </View>
    </GamePopup>
  );
}

// ── MANAGER: muestra el popup actual de la cola ──────────────
export default function PopupManager() {
  const { state, avanzarPopup, cerrarPopup } = useGame();
  const { popupActual, popupConsejo } = state;

  // Popup legacy (consejo inmediato durante el día)
  if (popupConsejo && !popupActual) {
    return (
      <GamePopup visible borderColor="#8b1a1a" onContinuar={cerrarPopup} btnLabel="¡Entendido!">
        <View style={[styles.body, { alignItems: 'center' }]}>
          <View style={styles.consejoIconCircle}><Text style={{ fontSize: 32 }}>💡</Text></View>
          <Text style={[styles.titulo, { color: '#8b1a1a', textAlign: 'center' }]}>{popupConsejo.titulo}</Text>
          <View style={styles.divider} />
          <Text style={[styles.mensaje, { textAlign: 'center' }]}>{popupConsejo.consejo}</Text>
        </View>
      </GamePopup>
    );
  }

  if (!popupActual) return null;

  const { tipo, data } = popupActual;

  if (tipo === 'feedback') return <PopupFeedback data={data} onContinuar={avanzarPopup} />;
  if (tipo === 'consejo')  return <PopupConsejo  data={data} onContinuar={avanzarPopup} />;
  if (tipo === 'logro')    return <PopupLogro    data={data} onContinuar={avanzarPopup} />;
  if (tipo === 'noticia')  return <PopupNoticia  data={data} onContinuar={avanzarPopup} />;
  if (tipo === 'nivel')    return <PopupNivel    data={data} onContinuar={avanzarPopup} />;
  if (tipo === 'concepto') return <PopupConcepto data={data} onContinuar={avanzarPopup} />;

  return null;
}

// ── Estilos compartidos ──────────────────────────────────────
const styles = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  card:     { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: 'hidden', borderTopWidth: 4 },
  tileStrip:{ flexDirection: 'row', height: 8 },
  tile:     { flex: 1, borderWidth: 0.5, borderColor: '#d8d2c4' },
  body:     { padding: 20 },
  footer:   { padding: 16, paddingBottom: 30 },

  titulo:   { fontSize: 20, fontWeight: '800', color: '#3a1a0a', marginBottom: 6 },
  mensaje:  { fontSize: 13, color: '#6b5c54', lineHeight: 20, marginBottom: 14 },
  seccion:  { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#8c7c6e', textTransform: 'uppercase', marginBottom: 10 },
  divider:  { width: '100%', height: 1, backgroundColor: '#e8e0d4', marginBottom: 12 },

  detalleRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#faf8f5', borderRadius: 10, borderLeftWidth: 4, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#ede9e0' },
  detalleLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  detalleLabel: { fontSize: 13, fontWeight: '700', color: '#3a1a0a' },
  detalleSub:   { fontSize: 11, color: '#8c7c6e', marginTop: 2 },
  detalleValue: { fontSize: 14, fontWeight: '800', marginLeft: 8 },

  patrimonioBox:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fdf0ec', borderRadius: 12, borderWidth: 1.5, borderColor: '#e8c4b8', padding: 14, marginTop: 6 },
  patrimonioLabel: { fontSize: 13, color: '#8c7c6e', fontWeight: '600' },
  patrimonioValue: { fontSize: 18, fontWeight: '800', color: '#8b1a1a' },

  consejoIconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fffbeb', borderWidth: 2, borderColor: '#fde68a', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },

  logroCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fdf0ec', borderWidth: 3, borderColor: '#b5820a', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  logroBadge:  { backgroundColor: '#b5820a', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 10 },
  logroBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },

  noticiaBadge: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#8c7c6e', textTransform: 'uppercase', marginBottom: 10 },
  impactoBox:   { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5, marginTop: 6 },
  impactoText:  { fontSize: 17, fontWeight: '800' },

  conceptoInline: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, backgroundColor: '#fffbeb', borderRadius: 10, borderWidth: 1, borderColor: '#fde68a', padding: 10, marginTop: 10 },
  conceptoIcon:   { fontSize: 16 },
  conceptoTermino:{ fontSize: 12, fontWeight: '800', color: '#78520a', marginBottom: 2 },
  conceptoDef:    { fontSize: 11, color: '#78520a', lineHeight: 16 },
  btnOuter:  { position: 'relative' },
  btnShadow: { position: 'absolute', bottom: -4, left: 4, right: 4, height: '100%', borderRadius: 50 },
  btnFace:   { borderRadius: 50, paddingVertical: 15, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  btnText:   { color: '#fff', fontWeight: '800', fontSize: 16 },
});
