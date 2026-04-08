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

// ── Dentro del GameProvider: accede al state del juego ──────
function GameFlow({ appScreen, setAppScreen }) {
  const { state } = useGame();
  const [showGlosario, setShowGlosario] = useState(false);

  // Cuando termina la semana y vuelve al juego, sincronizamos pantalla
  const semanaActual = state.semanaGlobal;

  if (showGlosario) {
    return (
      <>
        <StatusBar style="dark" />
        <GlosarioScreen
          glosarioDesbloqueado={state.glosarioDesbloqueado || []}
          onCerrar={() => setShowGlosario(false)}
        />
      </>
    );
  }

  if (appScreen === 'map') {
    return (
      <>
        <StatusBar style="dark" />
        <MapScreen
          semanaActual={semanaActual}
          onPlay={() => setAppScreen('level_intro')}
        />
      </>
    );
  }

  if (appScreen === 'level_intro') {
    return (
      <>
        <StatusBar style="dark" />
        <LevelIntroScreen
          semana={semanaActual}
          dia={state.diaGlobal}
          onFinish={() => setAppScreen('game')}
        />
      </>
    );
  }

  // Pantallas del juego en sí
  if (state.screen === 'weekly_report') {
    return (
      <>
        <StatusBar style="dark" />
        <WeeklyReportScreen onContinuar={() => setAppScreen('map')} />
      </>
    );
  }
  if (state.screen === 'bankrupt') return <><StatusBar style="dark" /><BankruptScreen /></>;

  return (
    <>
      <StatusBar style="dark" />
      <GameScreen onVerGlosario={() => setShowGlosario(true)} onVolverMapa={() => setAppScreen('map')} />
    </>
  );
}

// ── App raíz ─────────────────────────────────────────────────
function App() {
  const [screen, setScreen]         = useState('splash');
  const [introVista, setIntroVista] = useState(false);
  const [appScreen, setAppScreen]   = useState('map'); // dentro del GameProvider

  if (screen === 'splash')
    return <><StatusBar style="dark" /><SplashScreen onFinish={() => setScreen('menu')} /></>;

  if (screen === 'menu')
    return <><StatusBar style="dark" /><MenuScreen onPlay={() => setScreen(introVista ? 'game_flow' : 'intro')} /></>;

  if (screen === 'intro')
    return <><StatusBar hidden /><IntroScreen onFinish={() => { setIntroVista(true); setScreen('game_flow'); }} /></>;

  // Todo lo demás vive dentro del GameProvider
  return (
    <GameProvider>
      <GameFlow appScreen={appScreen} setAppScreen={setAppScreen} />
    </GameProvider>
  );
}

registerRootComponent(App);
export default App;
