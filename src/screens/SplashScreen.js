import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Image, useWindowDimensions,
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

export default function SplashScreen({ onFinish }) {
  const { width, height } = useWindowDimensions();

  const logoAnim   = useRef(new Animated.Value(0)).current;
  const titleAnim  = useRef(new Animated.Value(0)).current;
  const titleY     = useRef(new Animated.Value(24)).current;
  const dotsAnim   = useRef(new Animated.Value(0)).current;
  const fadeOut    = useRef(new Animated.Value(1)).current;
  const floatAnim  = useRef(new Animated.Value(0)).current;

  const LOGO_SIZE = Math.min(width * 0.68, height * 0.42, 280);

  useEffect(() => {
    Animated.sequence([
      // Logo aparece
      Animated.spring(logoAnim, { toValue: 1, tension: 50, friction: 8, useNativeDriver: true }),
      // Título sube
      Animated.parallel([
        Animated.timing(titleAnim, { toValue: 1, duration: 380, useNativeDriver: true }),
        Animated.spring(titleY, { toValue: 0, tension: 80, friction: 9, useNativeDriver: true }),
      ]),
      // Puntitos
      Animated.timing(dotsAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      // Pausa
      Animated.delay(900),
      // Fade out
      Animated.timing(fadeOut, { toValue: 0, duration: 550, useNativeDriver: true }),
    ]).start(() => onFinish && onFinish());

    // Float loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const logoScale = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const floatY    = floatAnim.interpolate({ inputRange: [0, 1], outputRange: [0, -8] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeOut, backgroundColor: '#f5f2eb' }]}>
      <TileBackground width={width} height={height} />

      {/* Overlay igual que MenuScreen */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(248,245,238,0.4)' }]} />

      <View style={styles.inner}>

        {/* Logo */}
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

        {/* Tagline igual que MenuScreen */}
        <Animated.Text style={[
          styles.tagline,
          { opacity: titleAnim, transform: [{ translateY: titleY }] }
        ]}>
          El simulador financiero del barrio
        </Animated.Text>

        {/* Monedas girando */}
        <Animated.View style={[styles.dotsRow, { opacity: dotsAnim }]}>
          <CoinSpin delay={0} />
          <CoinSpin delay={180} />
          <CoinSpin delay={360} />
        </Animated.View>

      </View>
    </Animated.View>
  );
}

function CoinSpin({ delay }) {
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(spin, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(spin, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }, delay);
  }, []);

  const scale = spin.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0.15, 1] });

  return (
    <Animated.View style={[styles.coin, { transform: [{ scaleX: scale }] }]}>
      <View style={styles.coinCircle}>
        <Text style={styles.coinText}>$</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 20,
  },
  tagline: {
    fontSize: 13,
    color: '#8c7c6e',
    letterSpacing: 0.8,
    fontStyle: 'italic',
    marginBottom: 28,
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  coin: {
    width: 32,
    height: 32,
  },
  coinCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#8b1a1a',
    borderWidth: 2,
    borderColor: '#6b1212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});
