import { registerRootComponent } from 'expo';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GameProvider, useGame } from './src/context/GameContext';
import GameScreen from './src/screens/GameScreen';
import WeeklyReportScreen from './src/screens/WeeklyReportScreen';
import BankruptScreen from './src/screens/BankruptScreen';
import SplashScreen from './src/screens/SplashScreen';
import MenuScreen from './src/screens/MenuScreen';
import MapScreen from './src/screens/MapScreen';
import IntroScreen from './src/screens/IntroScreen';
import LevelIntroScreen from './src/screens/LevelIntroScreen';
import GlosarioScreen from './src/screens/GlosarioScreen';

// ── Navegador dentro del juego ────────────────────────────────
function AppNavigator({ onVerGlosario }) {
  const { state } = useGame();
  if (state.screen === 'weekly_report') return <WeeklyReportScreen />;
  if (state.screen === 'bankrupt')      return <BankruptScreen />;
  return <GameScreen onVerGlosario={onVerGlosario} />;
}

// ── App raíz ──────────────────────────────────────────────────
function App() {
  const [screen, setScreen]           = useState('splash');
  const [introVista, setIntroVista]   = useState(false);
  const [semanaActual, setSemana]     = useState(1);
  const [diaActual]                   = useState(1);
  const [glosarioDesde, setGlosarioDesde] = useState(null); // pantalla desde la que abrió el glosario
  const [glosarioDesbloqueado]        = useState([]); // TODO: conectar con state del juego

  // Pantallas fuera del GameProvider
  if (screen === 'splash')
    return <><StatusBar style="dark" /><SplashScreen onFinish={() => setScreen('menu')} /></>;

  if (screen === 'menu')
    return <><StatusBar style="dark" /><MenuScreen onPlay={() => setScreen(introVista ? 'map' : 'intro')} /></>;

  if (screen === 'intro')
    return <><StatusBar hidden /><IntroScreen onFinish={() => { setIntroVista(true); setScreen('map'); }} /></>;

  if (screen === 'map')
    return <><StatusBar style="dark" /><MapScreen semanaActual={semanaActual} onPlay={() => setScreen('level_intro')} /></>;

  if (screen === 'level_intro')
    return <><StatusBar style="dark" /><LevelIntroScreen semana={semanaActual} dia={diaActual} onFinish={() => setScreen('game')} /></>;

  if (screen === 'glosario')
    return <><StatusBar style="dark" /><GlosarioScreen glosarioDesbloqueado={glosarioDesbloqueado} onCerrar={() => setScreen(glosarioDesde || 'game')} /></>;

  // Pantallas dentro del GameProvider
  return (
    <GameProvider>
      <StatusBar style="dark" />
      <AppNavigator onVerGlosario={() => { setGlosarioDesde('game'); setScreen('glosario'); }} />
    </GameProvider>
  );
}

registerRootComponent(App);
export default App;
