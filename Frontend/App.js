import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator.jsx';
import { TourProvider } from './src/utils/tourContext.js';
import TourOverlay from './src/components/TourOverlay.jsx';

export default function App() {
  return (
    <TourProvider>
      <StatusBar style="auto" />
      <AppNavigator />
      <TourOverlay />
    </TourProvider>
  );
}
