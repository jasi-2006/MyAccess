import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function StatCard({ title, value, color }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.value, color && { color }]}>{value}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexGrow: 1,
    flexBasis: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    padding: 14,
    marginBottom: 10,
  },
  value: {
    color: '#079B72',
    fontSize: 24,
    fontWeight: '900',
  },
  title: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 6,
  },
});
