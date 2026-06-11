import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';

export default function ImprimirFichaTabs({ styles, fichas, selectedFicha, onSelect, allFichasValue = '__all__' }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fichaTabsRow} contentContainerStyle={styles.fichaTabsContent}>
      {fichas.length > 1 ? (
        <TouchableOpacity
          style={[styles.fichaTab, selectedFicha === allFichasValue && styles.fichaTabActive]}
          onPress={() => onSelect(allFichasValue)}
        >
          <Text style={[styles.fichaTabText, selectedFicha === allFichasValue && styles.fichaTabTextActive]}>Todas</Text>
        </TouchableOpacity>
      ) : null}
      {fichas.map((f) => (
        <TouchableOpacity
          key={f}
          style={[styles.fichaTab, selectedFicha === f && styles.fichaTabActive]}
          onPress={() => onSelect(f)}
        >
          <Text style={[styles.fichaTabText, selectedFicha === f && styles.fichaTabTextActive]}>#{f}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
