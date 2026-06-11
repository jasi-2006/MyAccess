import React, { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';
import { resolveImageUrl } from '../services/api';
import { createRequestCard, getRequestCardsByUser } from '../services/requestCardService';
import { resolveUserRole, ROLES } from '../utils/accessControl';

export default function RequestCardButton({ profile }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (resolveUserRole(profile) !== ROLES.APRENDIZ) {
    return null;
  }

  const handlePress = async () => {
    if (sent || loading || !profile?.id) return;

    const photoUrl = resolveImageUrl(profile?.photoUrl);
    if (!photoUrl) {
      Alert.alert(
        'Foto requerida',
        'Debes cargar tu foto de perfil antes de solicitar la impresión del carnet.',
      );
      return;
    }

    try {
      setLoading(true);

      const existing = await getRequestCardsByUser(profile.id).catch(() => []);
      const hasPending = Array.isArray(existing) && existing.some(
        (r) => r.state?.toLowerCase() === 'pendiente'
      );

      if (hasPending) {
        Alert.alert('Solicitud existente', 'Ya tienes una solicitud de impresión pendiente.');
        return;
      }

      await createRequestCard({
        idUser: Number(profile.id),
        requestTipe: 'impresion',
        cardTipe: 'fisico',
        state: 'pendiente',
        approbedBy: null,
        printedBy: null,
      });

      setSent(true);
      Alert.alert('Solicitud enviada', 'Tu solicitud de impresión fue enviada al administrador.');
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar la solicitud. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity
        style={[styles.button, sent && styles.buttonSent]}
        activeOpacity={0.85}
        onPress={handlePress}
        disabled={loading || sent}
      >
        {loading
          ? <ActivityIndicator color="#FFFFFF" />
          : <Text style={styles.buttonText}>{sent ? '✓ Solicitud enviada' : 'Solicitar impresión'}</Text>
        }
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
  buttonSent: {
    backgroundColor: '#059669',
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});
