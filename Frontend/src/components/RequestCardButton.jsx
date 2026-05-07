import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';

export default function RequestCardButton({ onPress }) {
  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.print) {
      window.print();
      return;
    }

    Alert.alert(
      'Solicitud de impresion',
      'La impresion del carnet esta disponible desde la version web.'
    );
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.button} activeOpacity={0.85} onPress={handlePress}>
        <Text style={styles.buttonText}>Solicitar impresion</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: 18,
  },
  button: {
    minWidth: 220,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 13,
    shadowColor: '#000000',
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
