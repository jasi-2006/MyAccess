import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.jsx';

export default function HeaderCurved({ height = 200 }) {
  return (
    <View style={[styles.header, { height }]}>
      <View style={styles.curve} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.primary,
    width: '100%',
  },
  curve: {
    position: 'absolute',
    bottom: -50,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: colors.background,
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
  },
});
