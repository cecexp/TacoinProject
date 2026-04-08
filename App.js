import { registerRootComponent } from 'expo';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { GameProvider, useGame } from './src/context/GameContext';
import GameScreen from './src/screens/GameScreen';
import WeeklyReportScreen from './src/screens/WeeklyReportScreen';
import BankruptScreen from './src/screens/BankruptScreen';
import SplashScreen from './src/screens/SplashScreen';

function AppNavigator() {
  const { state } = useGame();
  if (state.screen === 'weekly_report') return <WeeklyReportScreen />;
  if (state.screen === 'bankrupt') return <BankruptScreen />;
  return <GameScreen />;
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <GameProvider>
      <StatusBar style="light" />
      <AppNavigator />
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} />
      )}
    </GameProvider>
  );
}

registerRootComponent(App);
export default App;
