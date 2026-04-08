import React, { useRef, useEffect, useState } from 'react';
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

// ============================================================
// NIVELES — ajustados a la lógica del juego
// Dificultad: 1=fácil, 2=normal, 3=difícil, 4=boss
// ============================================================
const NIVELES = [
  {
    id: 1, semana: 1,
    titulo: 'El Arranque',
    desc: 'Tu primer día como taquero. Aprendes lo básico: vender, gastar y ahorrar. Las decisiones son simples pero sientan las bases.',
    icon: '🛒', dificultad: 1, reward: '$200 de capital inicial',
    tip: 'Guarda al menos $100 en ahorro desde el primer día.',
    color: '#4a9e4a',
  },
  {
    id: 2, semana: 2,
    titulo: 'Primeros Riesgos',
    desc: 'Se presenta BirriaCoin por primera vez. Decides si entras al mundo crypto o te quedas en lo seguro.',
    icon: '🪙', dificultad: 1, reward: 'Acceso a BirriaCoin',
    tip: 'No inviertas más del 20% en crypto al inicio.',
    color: '#4a9e4a',
  },
  {
    id: 3, semana: 3,
    titulo: 'Feria del Barrio',
    desc: 'Evento especial: las ventas se duplican pero los costos también suben. Gestiona bien tu efectivo.',
    icon: '🎪', dificultad: 2, reward: 'x1.5 ganancias esta semana',
    tip: 'Reinvierte rápido, la ventana de ventas es corta.',
    color: '#d4901a',
  },
  {
    id: 4, semana: 4,
    titulo: 'Crypto Volátil',
    desc: 'BirriaCoin sube y baja con más fuerza. Noticias del barrio ocurren casi a diario. Decisiones de alto riesgo.',
    icon: '📈', dificultad: 3, reward: 'Bono si tu BC vale x2',
    tip: 'Diversifica. No pongas todo en crypto.',
    color: '#c0392b',
  },
  {
    id: 5, semana: 5,
    titulo: 'La Expansión',
    desc: 'Puedes abrir un segundo punto de venta. Requiere inversión grande. Si te quedas sin efectivo, pierdes.',
    icon: '🏪', dificultad: 3, reward: 'x2 capacidad de venta',
    tip: 'Asegúrate de tener fondo de emergencia antes de expandir.',
    color: '#c0392b',
  },
  {
    id: 6, semana: 6,
    titulo: 'Inversionista',
    desc: 'Un vecino quiere invertir en tu negocio. Decide si aceptas, negocias o rechazas. Cada opción tiene consecuencias.',
    icon: '🤝', dificultad: 2, reward: 'Capital x2 si negocias bien',
    tip: 'Lee bien los términos antes de aceptar cualquier socio.',
    color: '#d4901a',
  },
  {
    id: 7, semana: 7,
    titulo: '¡La Gran Final!',
    desc: 'La semana más difícil. Eventos extremos, crypto en máxima volatilidad. Solo los mejores taqueros sobreviven.',
    icon: '🏆', dificultad: 4, reward: '¡Puesto Famoso del Barrio!',
    tip: 'Llega con ahorro, efectivo E inversiones balanceadas.',
    color: '#8b1a1a',
    meta: true,
  },
];

const DIFICULTAD_LABEL = { 1: 'Fácil', 2: 'Normal', 3: 'Difícil', 4: 'BOSS' };
const DIFICULTAD_COLOR = { 1: '#4a9e4a', 2: '#d4901a', 3: '#c0392b', 4: '#8b1a1a' };

// Patrón de zigzag: true = derecha, false = izquierda
const ZIGZAG = [false, true, false, true, false, true, false];

function DificultadStars({ nivel }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3 }}>
      {[1,2,3,4].map(i => (
        <View key={i} style={{
          width: 8, height: 8, borderRadius: 4,
          backgroundColor: i <= nivel ? DIFICULTAD_COLOR[nivel] : '#d8d2c4',
        }} />
      ))}
    </View>
  );
}

function NivelNode({ nivel, isUnlocked, isCurrent, onPress, width }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const isRight = ZIGZAG[nivel.id - 1];
  const NODE_SIZE = nivel.meta ? 82 : 70;

  useEffect(() => {
    setTimeout(() => {
      Animated.spring(scaleAnim, {
        toValue: 1, tension: 55, friction: 8, useNativeDriver: true,
      }).start();
    }, (nivel.id - 1) * 100);

    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.12, duration: 650, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 650, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [isCurrent]);

  const MAX_W = Math.min(width, 480);
  const SIDE_PAD = 28;
  const usableW = MAX_W - SIDE_PAD * 2;
  // Nodo izquierdo: centrado en 22%, derecho: centrado en 78%
  const centerX = isRight ? usableW * 0.75 : usableW * 0.25;

  return (
    <View style={{ width: '100%', alignItems: 'flex-start', marginBottom: 0 }}>
      {/* Fila con nodo */}
      <View style={{
        width: '100%',
        maxWidth: MAX_W,
        alignSelf: 'center',
        paddingHorizontal: SIDE_PAD,
        alignItems: 'flex-start',
      }}>
        <View style={{ marginLeft: centerX - NODE_SIZE / 2 }}>
          <TouchableOpacity
            onPress={() => (isUnlocked || isCurrent) && onPress(nivel)}
            activeOpacity={isUnlocked || isCurrent ? 0.8 : 1}
          >
            <Animated.View style={{
              transform: [
                { scale: scaleAnim },
                { scale: isCurrent ? pulseAnim : 1 },
              ],
            }}>
              {/* Sombra del nodo */}
              <View style={[
                styles.nodeShadow,
                {
                  width: NODE_SIZE, height: NODE_SIZE / 3,
                  bottom: -8, borderRadius: NODE_SIZE,
                  backgroundColor: isUnlocked ? '#00000018' : '#00000008',
                }
              ]} />

              {/* Nodo principal */}
              <View style={[
                styles.nodeCircle,
                {
                  width: NODE_SIZE, height: NODE_SIZE, borderRadius: NODE_SIZE / 2,
                  backgroundColor: isUnlocked || isCurrent
                    ? nivel.meta ? '#8b1a1a' : nivel.color
                    : '#ccc5b8',
                  borderColor: isUnlocked || isCurrent
                    ? nivel.meta ? '#fbbf24' : '#fff'
                    : '#b8b0a4',
                  borderWidth: nivel.meta ? 4 : 3,
                  shadowColor: isUnlocked ? nivel.color : 'transparent',
                  shadowOpacity: isCurrent ? 0.6 : 0.25,
                  shadowRadius: isCurrent ? 18 : 8,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: isCurrent ? 12 : 4,
                }
              ]}>
                <Text style={{ fontSize: nivel.meta ? 32 : 26 }}>
                  {isUnlocked || isCurrent ? nivel.icon : '🔒'}
                </Text>
              </View>

              {/* Badge semana */}
              <View style={[
                styles.semBadge,
                { backgroundColor: isUnlocked || isCurrent ? nivel.color : '#b8b0a4' }
              ]}>
                <Text style={styles.semText}>S{nivel.semana}</Text>
              </View>
            </Animated.View>

            {/* Etiqueta */}
            <View style={[
              styles.labelWrap,
              { width: 110, marginLeft: -(110 - NODE_SIZE) / 2 }
            ]}>
              <Text style={[
                styles.labelTitle,
                { color: isUnlocked || isCurrent ? '#3a1a0a' : '#a89880' }
              ]} numberOfLines={1}>
                {nivel.titulo}
              </Text>
              {isCurrent && (
                <View style={styles.aquiBadge}>
                  <Text style={styles.aquiText}>● AQUÍ</Text>
                </View>
              )}
              {isUnlocked && !isCurrent && (
                <View style={[styles.aquiBadge, { backgroundColor: '#4a9e4a' }]}>
                  <Text style={styles.aquiText}>✓ LISTO</Text>
                </View>
              )}
              <DificultadStars nivel={nivel.dificultad} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function PathConnector({ fromRight, toRight, width, unlocked }) {
  const MAX_W = Math.min(width, 480);
  const SIDE_PAD = 28;
  const usableW = MAX_W - SIDE_PAD * 2;
  const leftX  = usableW * 0.25 + SIDE_PAD;
  const rightX = usableW * 0.75 + SIDE_PAD;
  const fromX  = fromRight ? rightX : leftX;
  const toX    = toRight   ? rightX : leftX;
  const isCross = fromRight !== toRight;

  return (
    <View style={{
      height: 52,
      maxWidth: MAX_W,
      alignSelf: 'center',
      width: '100%',
      position: 'relative',
    }}>
      {isCross ? (
        // Línea diagonal
        <View style={{
          position: 'absolute',
          left: Math.min(fromX, toX),
          top: 0,
          width: Math.abs(toX - fromX),
          height: '100%',
          justifyContent: 'center',
        }}>
          {/* Línea SVG-like con View rotado */}
          <View style={{
            position: 'absolute',
            left: fromX < toX ? 0 : undefined,
            right: fromX < toX ? undefined : 0,
            width: Math.abs(toX - fromX) + 4,
            height: 4,
            borderRadius: 2,
            backgroundColor: unlocked ? '#8b1a1a' : 'transparent',
            borderTopWidth: unlocked ? 0 : 3,
            borderColor: '#c8c0b4',
            borderStyle: 'dashed',
            top: '45%',
            transform: [{
              rotate: `${Math.atan2(52, Math.abs(toX - fromX)) * (fromX < toX ? 1 : -1) * (180 / Math.PI)}deg`
            }],
          }} />
        </View>
      ) : (
        // Línea recta vertical
        <View style={{
          position: 'absolute',
          left: fromX - 2,
          top: 0,
          width: 4,
          height: '100%',
          borderRadius: 2,
          backgroundColor: unlocked ? '#8b1a1a' : 'transparent',
          borderLeftWidth: unlocked ? 0 : 3,
          borderColor: '#c8c0b4',
          borderStyle: 'dashed',
        }} />
      )}
    </View>
  );
}

export default function MapScreen({ onPlay, semanaActual = 1 }) {
  const { width, height } = useWindowDimensions();
  const [selectedNivel, setSelectedNivel] = useState(null);
  const modalAnim = useRef(new Animated.Value(0)).current;

  const openModal = (nivel) => {
    setSelectedNivel(nivel);
    Animated.spring(modalAnim, { toValue: 1, tension: 60, friction: 9, useNativeDriver: true }).start();
  };
  const closeModal = () => {
    Animated.timing(modalAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => setSelectedNivel(null));
  };

  const modalSlide = modalAnim.interpolate({ inputRange: [0, 1], outputRange: [400, 0] });

  // Niveles en orden de abajo (inicio) hacia arriba (meta)
  const nivelesDisplay = [...NIVELES].reverse();

  return (
    <View style={{ flex: 1, backgroundColor: '#f5f2eb' }}>
      <TileBackground width={width} height={height} />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,245,238,0.4)' }]} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: 44 }]}>
        <Text style={styles.headerTitle}>🗺️ Tu Camino al Éxito</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>Semana {semanaActual}</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Meta en la cima */}
        <View style={styles.metaTop}>
          <Text style={styles.metaStar}>⭐</Text>
          <Text style={styles.metaTitulo}>¡El Puesto Más Famoso!</Text>
          <Text style={styles.metaSubtitulo}>Tu destino final, taquero</Text>
        </View>

        {/* Nodos de arriba a abajo: meta primero, inicio último */}
        {nivelesDisplay.map((nivel, idx) => {
          const realIdx    = NIVELES.length - 1 - idx; // índice real (0 = primero)
          const isUnlocked = realIdx < semanaActual - 1;
          const isCurrent  = realIdx === semanaActual - 1;
          const nextNivel  = nivelesDisplay[idx + 1];

          return (
            <View key={nivel.id}>
              <NivelNode
                nivel={nivel}
                isUnlocked={isUnlocked}
                isCurrent={isCurrent}
                onPress={openModal}
                width={width}
              />
              {nextNivel && (
                <PathConnector
                  fromRight={ZIGZAG[nivel.id - 1]}
                  toRight={ZIGZAG[nextNivel.id - 1]}
                  width={width}
                  unlocked={realIdx < semanaActual}
                />
              )}
            </View>
          );
        })}

        {/* Inicio */}
        <View style={styles.inicioRow}>
          <View style={styles.inicioBadge}>
            <Text style={styles.inicioText}>🚀 INICIO</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Botón jugar */}
      <View style={[styles.bottomBar, { paddingBottom: 32 }]}>
        <View style={{ maxWidth: Math.min(width, 480), width: '100%', alignSelf: 'center' }}>
          <TouchableOpacity onPress={onPlay} activeOpacity={0.85} style={styles.btnJugar}>
            <View style={styles.btnShadow} />
            <View style={styles.btnFace}>
              <Text style={styles.btnText}>▶  JUGAR SEMANA {semanaActual}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal detalle nivel */}
      {selectedNivel && (
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <TouchableOpacity style={styles.modalOverlay} onPress={closeModal} activeOpacity={1} />
          <Animated.View style={[
            styles.modalCard,
            {
              transform: [{ translateY: modalSlide }],
              maxWidth: Math.min(width, 480),
              alignSelf: 'center',
              width: '100%',
            }
          ]}>
            {/* Icono */}
            <View style={styles.modalIconRow}>
              <View style={[styles.modalIconBg, { borderColor: DIFICULTAD_COLOR[selectedNivel.dificultad] + '66' }]}>
                <Text style={{ fontSize: 38 }}>{selectedNivel.icon}</Text>
              </View>
            </View>

            {/* Dificultad */}
            <View style={[styles.difRow, { backgroundColor: DIFICULTAD_COLOR[selectedNivel.dificultad] + '18' }]}>
              <DificultadStars nivel={selectedNivel.dificultad} />
              <Text style={[styles.difLabel, { color: DIFICULTAD_COLOR[selectedNivel.dificultad] }]}>
                {DIFICULTAD_LABEL[selectedNivel.dificultad]}
              </Text>
            </View>

            <Text style={styles.modalTitle}>{selectedNivel.titulo}</Text>
            <Text style={styles.modalDesc}>{selectedNivel.desc}</Text>

            {/* Tip */}
            <View style={styles.tipRow}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>{selectedNivel.tip}</Text>
            </View>

            {/* Reward */}
            <View style={styles.rewardRow}>
              <Text style={styles.rewardLabel}>🏅 Recompensa</Text>
              <Text style={styles.rewardValue}>{selectedNivel.reward}</Text>
            </View>

            <TouchableOpacity style={styles.modalBtn} onPress={closeModal}>
              <Text style={styles.modalBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 14, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(245,242,235,0.95)',
    borderBottomWidth: 1, borderBottomColor: '#d8d2c4',
    zIndex: 10,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#3a1a0a' },
  headerBadge: { backgroundColor: '#8b1a1a', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 4 },
  headerBadgeText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  scrollContent: { paddingTop: 20 },

  metaTop: { alignItems: 'center', paddingVertical: 16, marginBottom: 4 },
  metaStar: { fontSize: 32 },
  metaTitulo: { fontSize: 16, fontWeight: '800', color: '#3a1a0a', marginTop: 4 },
  metaSubtitulo: { fontSize: 12, color: '#8c7c6e', fontStyle: 'italic' },

  nodeShadow: { position: 'absolute', alignSelf: 'center' },
  nodeCircle: { alignItems: 'center', justifyContent: 'center' },
  semBadge: {
    position: 'absolute', top: -4, right: -4,
    width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  semText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  labelWrap: { marginTop: 8, alignItems: 'center', gap: 3 },
  labelTitle: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  aquiBadge: {
    backgroundColor: '#8b1a1a', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  aquiText: { color: '#fff', fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },

  inicioRow: { alignItems: 'center', paddingVertical: 16 },
  inicioBadge: {
    backgroundColor: '#8b1a1a', borderRadius: 20,
    paddingHorizontal: 20, paddingVertical: 8,
    borderWidth: 2, borderColor: '#6b1212',
  },
  inicioText: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 2 },

  bottomBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16,
    backgroundColor: 'rgba(245,242,235,0.97)',
    borderTopWidth: 1, borderTopColor: '#d8d2c4',
  },
  btnJugar: { position: 'relative' },
  btnShadow: {
    position: 'absolute', bottom: -5, left: 4, right: 4,
    height: '100%', backgroundColor: '#4a0c0c', borderRadius: 50,
  },
  btnFace: {
    backgroundColor: '#8b1a1a', borderRadius: 50,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 2.5, borderColor: '#6b1212',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 3 },

  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  modalCard: {
    position: 'absolute', bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 36,
    borderTopWidth: 4, borderColor: '#8b1a1a',
  },
  modalIconRow: { alignItems: 'center', marginBottom: 12 },
  modalIconBg: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#fdf0ec',
    borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  difRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    alignSelf: 'center', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
    marginBottom: 12,
  },
  difLabel: { fontSize: 12, fontWeight: '700' },
  modalTitle: { fontSize: 21, fontWeight: '800', color: '#1a0a0a', textAlign: 'center', marginBottom: 8 },
  modalDesc: { fontSize: 13, color: '#6b5c54', textAlign: 'center', lineHeight: 20, marginBottom: 14 },
  tipRow: {
    flexDirection: 'row', gap: 10, alignItems: 'flex-start',
    backgroundColor: '#fffbeb', borderRadius: 12, padding: 12,
    borderWidth: 1, borderColor: '#fde68a', marginBottom: 12,
  },
  tipIcon: { fontSize: 16 },
  tipText: { flex: 1, fontSize: 12, color: '#78520a', lineHeight: 18 },
  rewardRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#fdf0ec', borderRadius: 12, padding: 14, marginBottom: 18,
    borderWidth: 1.5, borderColor: '#e8c4b8',
  },
  rewardLabel: { fontSize: 13, color: '#8c7c6e', fontWeight: '600' },
  rewardValue: { fontSize: 14, fontWeight: '800', color: '#8b1a1a' },
  modalBtn: {
    backgroundColor: '#8b1a1a', borderRadius: 50,
    paddingVertical: 14, alignItems: 'center',
  },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
