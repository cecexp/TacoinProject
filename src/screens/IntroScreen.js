import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
  Animated, useWindowDimensions,
} from 'react-native';

// ── Imágenes ──────────────────────────────────────────────
const IMAGENES = [
  require('../../assets/scenes/escena1.png'),
  require('../../assets/scenes/escena2.png'),
  require('../../assets/scenes/escena3.png'),
  require('../../assets/scenes/escena4.png'),
  require('../../assets/scenes/escena5.png'),
  require('../../assets/scenes/escena6.png'),
  require('../../assets/scenes/escena7.png'),
];

// ── Historia ──────────────────────────────────────────────
const ESCENAS = [
  {
    titulo: 'El Veterano',
    texto: 'Don José trabajó 25 años como el contador más puntual de la textilera de la ciudad. Era el primero en llegar a su oficina gris y el último en irse, un hombre de números y rutinas.',
  },
  {
    titulo: 'El Cierre',
    texto: 'Un lunes gris, el mundo de Don José se detuvo de golpe. Un cartel helado en el tablero de anuncios anunció el "CIERRE DEFINITIVO DE OPERACIONES" en México.',
  },
  {
    titulo: 'La Despedida',
    texto: 'Salió de la textilera con una simple caja de cartón bajo el brazo y un sobre formal que contenía su liquidación de ley. No se sentía derrotado, solo libre por primera vez en décadas.',
  },
  {
    titulo: 'El Secreto Familiar',
    texto: 'En la calidez de su cocina, recordó la receta secreta de birria de su abuela. Nostalgia y especias flotaban en el aire mientras imaginaba un nuevo comienzo.',
  },
  {
    titulo: 'La Inversión',
    texto: 'Usó sus ahorros para comprar un pequeño carro de comida usado pero resistente. Sabía que la gente siempre busca un buen taco de birria para empezar el día.',
  },
  {
    titulo: 'Preparativos',
    texto: 'Pintó el nombre con cuidado en el carro: "Birria Tacoin". Pasó semanas limpiando, pintando y perfeccionando el sazón que su abuela le enseñó.',
  },
  {
    titulo: 'El Primer Cliente',
    texto: 'Amanecía en una esquina concurrida de la ciudad; el olor del consomé humeante atrajo a los curiosos. El primer cliente probó... y pidió tres tacos más.',
  },
];

// ── Typewriter hook ───────────────────────────────────────
function useTypewriter(text, speed = 22) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    ref.current = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(ref.current);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(ref.current);
  }, [text]);

  const skipToEnd = useCallback(() => {
    clearInterval(ref.current);
    setDisplayed(text);
    setDone(true);
  }, [text]);

  return { displayed, done, skipToEnd };
}

// ── Componente principal ──────────────────────────────────
export default function IntroScreen({ onFinish }) {
  const { width, height } = useWindowDimensions();
  const [idx, setIdx] = useState(0);

  // Animaciones
  const imgFade   = useRef(new Animated.Value(0)).current;
  const boxSlide  = useRef(new Animated.Value(60)).current;
  const boxFade   = useRef(new Animated.Value(0)).current;

  const escena = ESCENAS[idx];
  const isLast = idx === ESCENAS.length - 1;
  const { displayed, done, skipToEnd } = useTypewriter(escena.texto, 22);

  // Animar entrada al cambiar escena
  useEffect(() => {
    imgFade.setValue(0);
    boxSlide.setValue(60);
    boxFade.setValue(0);

    Animated.sequence([
      Animated.timing(imgFade, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.parallel([
        Animated.spring(boxSlide, { toValue: 0, tension: 55, friction: 10, useNativeDriver: true }),
        Animated.timing(boxFade, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();
  }, [idx]);

  const goNext = () => {
    if (!done) { skipToEnd(); return; }
    if (isLast) { onFinish(); return; }

    // Fade out rápido antes de cambiar
    Animated.parallel([
      Animated.timing(imgFade,  { toValue: 0, duration: 220, useNativeDriver: true }),
      Animated.timing(boxFade,  { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.timing(boxSlide, { toValue: 40, duration: 180, useNativeDriver: true }),
    ]).start(() => setIdx(i => i + 1));
  };

  const IMG_H = height;
  const BOX_MAX = Math.min(width, 500);

  return (
    <View style={styles.root}>

      {/* ── Imagen de escena ── */}
      <Animated.View style={{ opacity: imgFade, position: 'absolute', top: 0, left: 0, right: 0, height: IMG_H }}>
        <Image
          source={IMAGENES[idx]}
          style={{ width, height: IMG_H }}
          resizeMode="cover"
        />
        {/* Degradado inferior negro */}
        <View style={[styles.gradient, { height: IMG_H * 0.5 }]} />
      </Animated.View>

      {/* ── Número de escena flotante (top-left) ── */}
      <Animated.View style={[styles.sceneCounter, { opacity: imgFade }]}>
        <View style={styles.sceneCounterInner}>
          <Text style={styles.sceneCounterText}>{idx + 1} / {ESCENAS.length}</Text>
        </View>
      </Animated.View>

      {/* ── Botón saltar (top-right) ── */}
      <Animated.View style={[styles.skipWrap, { opacity: imgFade }]}>
        <TouchableOpacity style={styles.skipBtn} onPress={onFinish}>
          <Text style={styles.skipText}>Saltar  ›</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* ── Cuadro de historia ── */}
      <Animated.View style={[
        styles.box,
        {
          opacity: boxFade,
          transform: [{ translateY: boxSlide }],
        }
      ]}>
        {/* Tira de azulejos (misma que Menu/Splash) */}
        <View style={styles.tileStrip}>
          {Array.from({ length: 24 }).map((_, i) => (
            <View key={i} style={[
              styles.miniTile,
              { backgroundColor: i % 2 === 0 ? '#f5f2eb' : '#ede9e0' }
            ]} />
          ))}
        </View>

        <View style={styles.boxBody}>
          {/* Cabecera: badge + título */}
          <View style={styles.boxHeader}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{idx + 1}</Text>
            </View>
            <Text style={styles.titulo} numberOfLines={1}>{escena.titulo}</Text>
          </View>

          {/* Texto con cursor parpadeante */}
          <Text style={styles.texto}>
            {displayed}
            {!done && <Text style={styles.cursor}>▌</Text>}
          </Text>

          {/* Puntos de progreso */}
          <View style={styles.dots}>
            {ESCENAS.map((_, i) => (
              <View key={i} style={[
                styles.dot,
                i === idx   && styles.dotCurrent,
                i < idx     && styles.dotDone,
              ]} />
            ))}
          </View>

          {/* Botón siguiente */}
          <TouchableOpacity onPress={goNext} activeOpacity={0.82} style={styles.btnWrap}>
            <View style={styles.btnShadow} />
            <View style={styles.btnFace}>
              <Text style={styles.btnText}>
                {!done
                  ? '▶▶  Continuar'
                  : isLast
                    ? '🌮  ¡A jugar, Don José!'
                    : 'Siguiente  →'}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

    </View>
  );
}

// ── Estilos ───────────────────────────────────────────────
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
  },

  gradient: { display: 'none' },

  sceneCounter: {
    position: 'absolute',
    top: 48, left: 16,
  },
  sceneCounterInner: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  sceneCounterText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  skipWrap: {
    position: 'absolute',
    top: 48, right: 16,
  },
  skipBtn: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 5,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)',
  },
  skipText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },

  // ── Cuadro ──
  box: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: 'rgba(255,252,248,0.93)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderTopWidth: 4,
    borderColor: '#8b1a1a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 24,
  },

  tileStrip: {
    flexDirection: 'row',
    height: 8,
    overflow: 'hidden',
  },
  miniTile: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: '#d8d2c4',
  },

  boxBody: {
    padding: 20,
    paddingBottom: 30,
  },

  boxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  badge: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#8b1a1a',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  badgeText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  titulo: {
    flex: 1,
    fontSize: 16, fontWeight: '800', color: '#3a1a0a',
  },

  texto: {
    fontSize: 14,
    color: '#4a3228',
    lineHeight: 23,
    minHeight: 70,
    marginBottom: 16,
  },
  cursor: {
    color: '#8b1a1a',
    fontWeight: '800',
  },

  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 18,
  },
  dot: {
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: '#d8d2c4',
  },
  dotCurrent: {
    backgroundColor: '#8b1a1a',
    width: 24,
    borderRadius: 4,
  },
  dotDone: {
    backgroundColor: '#c0a090',
  },

  btnWrap: { position: 'relative' },
  btnShadow: {
    position: 'absolute',
    bottom: -4, left: 4, right: 4,
    height: '100%',
    backgroundColor: '#4a0c0c',
    borderRadius: 50,
  },
  btnFace: {
    backgroundColor: '#8b1a1a',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 2.5, borderColor: '#6b1212',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});