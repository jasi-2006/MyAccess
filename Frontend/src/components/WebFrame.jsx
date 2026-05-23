import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

export default function WebFrame({ children, style }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={[styles.outer, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    width: '100%',
    ...(Platform.OS === 'web' ? { overflow: 'auto' } : {}),
  },
});
