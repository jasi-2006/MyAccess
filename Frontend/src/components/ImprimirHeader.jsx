import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export default function ImprimirHeader({ styles, navigation, onPrint, canPrint }) {
  return (
    <View style={styles.headerRow}>
      <View>
        <Text style={styles.pageTitle}>Imprimir carnets por ficha</Text>
        <Text style={styles.pageSubtitle}>Selecciona una ficha y visualiza los carnets de sus aprendices.</Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Volver</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.printBtn, !canPrint && styles.printBtnDisabled]}
          onPress={onPrint}
          disabled={!canPrint}
        >
          <Text style={styles.printBtnText}>Imprimir carnets</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
