import React, { useState } from 'react';
import { Alert, ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../theme/colors';
import { resolveImageUrl } from '../services/api';
import { createRequestCard, getRequestCardsByUser } from '../services/requestCardService';
import { resolveUserRole, ROLES } from '../utils/accessControl';

export default function RequestCardButton({ profile }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [warn, setWarn] = useState('');

  if (resolveUserRole(profile) !== ROLES.APRENDIZ) {
    return null;
  }

  const handlePress = async () => {
    if (sent || loading) return;

    const profileId = Number(profile?.id ?? profile?.idUser ?? profile?.userId);
    if (!profileId) {
      Alert.alert(
        'Perfil incompleto',
        'No se pudo identificar tu usuario. Vuelve a iniciar sesion o recarga tu perfil.',
      );
      return;
    }

    const rawPhotoUrl =
      profile?.photoUrl ??
      profile?.photo ??
      profile?.photoURL ??
      profile?.photo_path ??
      profile?.photoPath ??
      null;

    const photoUrl = resolveImageUrl(rawPhotoUrl);
    if (!photoUrl) {
      setWarn(' Debes cargar una foto de perfil antes de solicitar la impresión del carnet. Ve a "Mi perfil" > "Editar".');
      return;
    }

    setWarn('');

    try {
      setLoading(true);

      const existing = await getRequestCardsByUser(profileId).catch(() => []);
      const hasPending = Array.isArray(existing) && existing.some(
        (r) => String(r?.state || '').trim().toLowerCase() === 'pendiente',
      );

      if (hasPending) {
        Alert.alert('Solicitud existente', 'Ya tienes una solicitud de impresion pendiente.');
        return;
      }

      const payload = {
        idUser: profileId,
        requestTipe: 'impresion',
        cardTipe: 'fisico',
        state: 'pendiente',
        approbedBy: null,
        printedBy: null,
      };
      const result = await createRequestCard(payload);
      setSent(true);
      Alert.alert('Solicitud enviada', 'Tu solicitud de impresion fue enviada al administrador.');
    } catch (e) {
      const apiMessage = e?.payload?.message || e?.message || 'No se pudo enviar la solicitud. Intenta de nuevo.';
      Alert.alert('Error', apiMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      {!!warn && (
        <View style={styles.warnBox}>
          <Text style={styles.warnText}>{warn}</Text>
        </View>
      )}
      <TouchableOpacity
        style={[styles.button, sent && styles.buttonSent]}
        activeOpacity={0.85}
        onPress={handlePress}
        disabled={loading || sent}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>
            {sent ? 'Solicitud enviada' : 'Solicitar impresion'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginTop: 18,
    width: '100%',
  },
  warnBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 10,
  },
  warnText: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
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
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
});