import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, Animated, Dimensions,
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }) {
  const logoScale = useRef(new Animated.Value(0.3)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const coinSpin = useRef(new Animated.Value(0)).current;
  const bgOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1. Logo aparece
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      // 2. Título sube
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.spring(titleY, {
          toValue: 0,
          tension: 80,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // 3. Subtítulo aparece
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      // 4. Esperar un momento
      Animated.delay(900),
      // 5. Fade out
      Animated.timing(bgOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onFinish && onFinish();
    });

    // Moneda girando en loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(coinSpin, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(coinSpin, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const coinRotate = coinSpin.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacity }]}>
      {/* Círculos decorativos de fondo */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />
      <View style={styles.bgCircle3} />

      {/* Logo del taquero */}
      <Animated.View style={[
        styles.logoContainer,
        { opacity: logoOpacity, transform: [{ scale: logoScale }] }
      ]}>
        {/* Círculo blanco detrás del logo */}
        <View style={styles.logoCircle}>
          {/* Representación del taquero con texto/emojis */}
          <Text style={styles.logoEmoji}>👨‍🍳</Text>
          <Text style={styles.tacoEmoji}>🌮</Text>
        </View>
      </Animated.View>

      {/* Título */}
      <Animated.View style={[
        styles.titleContainer,
        { opacity: titleOpacity, transform: [{ translateY: titleY }] }
      ]}>
        <Text style={styles.title}>Tacoin</Text>
        <Text style={styles.titleSub}>Tycoon</Text>
      </Animated.View>

      {/* Monedas girando */}
      <Animated.View style={[
        styles.coinContainer,
        { opacity: subtitleOpacity }
      ]}>
        <Animated.Text style={[styles.coin, { transform: [{ rotate: coinRotate }] }]}>🪙</Animated.Text>
        <Animated.Text style={[styles.coin, { transform: [{ rotate: coinRotate }], marginLeft: 8 }]}>🪙</Animated.Text>
        <Animated.Text style={[styles.coin, { transform: [{ rotate: coinRotate }], marginLeft: 8 }]}>🪙</Animated.Text>
      </Animated.View>

      {/* Subtítulo */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Aprende a manejar tu lana 💸
      </Animated.Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#f9731608',
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: '#f9731610',
    bottom: -50,
    left: -80,
  },
  bgCircle3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fbbf2408',
    top: height * 0.3,
    right: -60,
  },
  logoContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  logoCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#f97316',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 20,
  },
  logoEmoji: {
    fontSize: 64,
    lineHeight: 80,
  },
  tacoEmoji: {
    fontSize: 36,
    position: 'absolute',
    bottom: 20,
    right: 16,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 56,
    fontWeight: '800',
    color: '#f97316',
    letterSpacing: -1,
    fontStyle: 'italic',
    textShadowColor: '#f9731644',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  titleSub: {
    fontSize: 22,
    fontWeight: '300',
    color: '#94a3b8',
    letterSpacing: 8,
    textTransform: 'uppercase',
    marginTop: -8,
  },
  coinContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  coin: {
    fontSize: 28,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 15,
    letterSpacing: 0.5,
  },
});
