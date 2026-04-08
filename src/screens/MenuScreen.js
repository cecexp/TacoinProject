import React, { useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, useWindowDimensions, ScrollView, Modal,
} from 'react-native';

function TileBackground({ width, height }) {
  const TILE_SIZE = 60;
  const cols = Math.ceil(width / TILE_SIZE) + 1;
  const rows = Math.ceil(height / TILE_SIZE) + 1;
  const tiles = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      tiles.push(
        <View key={`${row}-${col}`} style={{
          width: TILE_SIZE, height: TILE_SIZE,
          backgroundColor: (row + col) % 2 === 0 ? '#f5f2eb' : '#ede9e0',
          borderWidth: 0.8, borderColor: '#d8d2c4',
        }} />
      );
    }
  }
  return (
    <View style={StyleSheet.absoluteFill}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{tiles}</View>
    </View>
  );
}

export default function MenuScreen({ onPlay }) {
  const { width, height } = useWindowDimensions();
  const logoAnim = useRef(new Animated.Value(0)).current;
  const buttonsAnim = useRef(new Animated.Value(0)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const [showInstructions, setShowInstructions] = React.useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      Animated.spring(buttonsAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const floatY = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });
  const logoScale = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] });
  const btnsY = buttonsAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  // Logo nunca mayor al 42% del alto ni al 68% del ancho, max 280px
  const LOGO_SIZE = Math.min(width * 0.68, height * 0.42, 280);
  const BTN_WIDTH = Math.min(width * 0.86, 380);

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f2eb' }}>
      <TileBackground width={width} height={height} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,245,238,0.4)' }]} />

      <View style={styles.inner}>

        <Animated.View style={{
          opacity: logoAnim,
          transform: [{ scale: logoScale }, { translateY: floatY }],
          width: LOGO_SIZE, height: LOGO_SIZE,
          marginBottom: 8,
        }}>
          <Image
            source={require('../../assets/logo.png')}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.Text style={[styles.tagline, { opacity: buttonsAnim }]}>
          El simulador financiero del barrio
        </Animated.Text>

        <Animated.View style={[
          styles.btnsWrap,
          { opacity: buttonsAnim, transform: [{ translateY: btnsY }] },
        ]}>
          <TouchableOpacity onPress={onPlay} activeOpacity={0.82}
            style={[styles.btnPlayOuter, { width: BTN_WIDTH }]}>
            <View style={styles.btnPlayShadow} />
            <View style={styles.btnPlayFace}>
              <Text style={styles.btnPlayIcon}>▶  </Text>
              <Text style={styles.btnPlayText}>JUGAR</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowInstructions(true)} activeOpacity={0.82}
            style={[styles.btnInstr, { width: BTN_WIDTH }]}>
            <Text style={styles.btnInstrBadge}>?</Text>
            <Text style={styles.btnInstrText}>INSTRUCCIONES</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.Text style={[styles.footer, { opacity: buttonsAnim }]}>
          🌮  BirriaCoin · Temporada 1
        </Animated.Text>

      </View>

      <Modal visible={showInstructions} transparent animationType="slide"
        onRequestClose={() => setShowInstructions(false)}>
        <View style={styles.modalBg}>
          <View style={[styles.modalCard, { maxWidth: Math.min(width, 500), alignSelf: 'center', width: '100%' }]}>
            <View style={styles.modalHead}>
              <Text style={styles.modalTitle}>¿Cómo se juega?</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowInstructions(false)}>
                <Text style={styles.closeX}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: height * 0.55 }}>
              {INSTRUCCIONES.map((item, i) => (
                <View key={i} style={styles.instrRow}>
                  <View style={styles.instrIconBox}>
                    <Text style={{ fontSize: 22 }}>{item.icon}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.instrTitle}>{item.titulo}</Text>
                    <Text style={styles.instrDesc}>{item.desc}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.modalBtn} onPress={() => setShowInstructions(false)}>
              <Text style={styles.modalBtnText}>¡A vender tacos! 🌮</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const INSTRUCCIONES = [
  { icon: '🌮', titulo: 'Eres el taquero', desc: 'Un vendedor de birria que perdió su trabajo. Haz crecer tu negocio tomando decisiones financieras inteligentes.' },
  { icon: '💵', titulo: 'Efectivo del negocio', desc: 'Dinero para operar. Si llega a cero sin ahorro, ¡bancarrota! Úsalo para reinvertir o comprar BirriaCoin.' },
  { icon: '🏦', titulo: 'Ahorro personal', desc: 'Tu fondo de emergencia. Separa dinero aquí para protegerte de los malos días.' },
  { icon: '🪙', titulo: 'BirriaCoin', desc: 'La cripto del barrio. Su precio cambia cada día. Alto riesgo, alta recompensa.' },
  { icon: '📅', titulo: 'Ciclo diario', desc: 'Tienes 3 decisiones por día. Al terminar, el puesto genera ventas y el precio de BC cambia.' },
  { icon: '📰', titulo: 'Noticias del barrio', desc: 'Eventos aleatorios afectan BirriaCoin. ¡Mantente al tanto!' },
  { icon: '📊', titulo: 'Reporte semanal', desc: 'Cada 6 días ves tus aciertos y errores para mejorar.' },
];

const styles = StyleSheet.create({
  inner: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 28, paddingTop: 40, paddingBottom: 20, gap: 0,
  },
  tagline: { fontSize: 13, color: '#8c7c6e', letterSpacing: 0.8, fontStyle: 'italic', marginBottom: 24, marginTop: 4 },
  btnsWrap: { alignItems: 'center', gap: 14 },
  btnPlayOuter: { position: 'relative', marginBottom: 4 },
  btnPlayShadow: { position: 'absolute', bottom: -5, left: 4, right: 4, height: '100%', backgroundColor: '#4a0c0c', borderRadius: 50 },
  btnPlayFace: { backgroundColor: '#8b1a1a', borderRadius: 50, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 2.5, borderColor: '#6b1212' },
  btnPlayIcon: { color: '#fff', fontSize: 16 },
  btnPlayText: { color: '#fff', fontSize: 20, fontWeight: '800', letterSpacing: 4 },
  btnInstr: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 50, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, borderWidth: 2, borderColor: '#8b1a1a' },
  btnInstrBadge: { color: '#8b1a1a', fontSize: 14, fontWeight: '800', width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#8b1a1a', textAlign: 'center', lineHeight: 20 },
  btnInstrText: { color: '#8b1a1a', fontSize: 14, fontWeight: '700', letterSpacing: 3 },
  footer: { marginTop: 20, color: '#a89880', fontSize: 11, letterSpacing: 1 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, borderTopWidth: 4, borderColor: '#8b1a1a' },
  modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#1a0a0a' },
  closeBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#fdf0ec', alignItems: 'center', justifyContent: 'center' },
  closeX: { color: '#8b1a1a', fontWeight: '700', fontSize: 13 },
  instrRow: { flexDirection: 'row', gap: 12, marginBottom: 16, alignItems: 'flex-start' },
  instrIconBox: { width: 42, height: 42, borderRadius: 10, backgroundColor: '#fdf0ec', borderWidth: 1.5, borderColor: '#e8c4b8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  instrTitle: { fontSize: 14, fontWeight: '700', color: '#1a0a0a', marginBottom: 2 },
  instrDesc: { fontSize: 12, color: '#6b5c54', lineHeight: 18 },
  modalBtn: { backgroundColor: '#8b1a1a', borderRadius: 50, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
