import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors.jsx';
import PrimaryButton from './PrimaryButton.jsx';

export default function SuccessModal({ visible, onClose, title = '¡Éxito!', message }) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.icon}>✓</Text>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <PrimaryButton title="Explorar" onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modal: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 30,
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
    color: colors.primary,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
});
