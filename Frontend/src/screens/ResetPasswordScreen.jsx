import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors } from '../theme/colors.jsx';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import HeaderCurved from '../components/HeaderCurved.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { resetPassword } from '../services/authService';
import WebFrame from '../components/WebFrame.jsx';

export default function ResetPasswordScreen({ navigation, route }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { email, code } = route?.params ?? {};

  const validate = () => {
    const newErrors = {};
    if (password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
    if (password !== confirm) newErrors.confirm = 'Las contraseñas no coinciden';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleReset = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      setSubmitError('');
      await resetPassword(email, code, password);
      setShowSuccess(true);
    } catch (e) {
      setSubmitError(e.message || 'No fue posible actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <WebFrame>
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <HeaderCurved height={180} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Nueva contraseña</Text>
        <Text style={styles.subtitle}>Ingresa tu nueva contraseña</Text>

        <CustomInput
          icon="🔒"
          placeholder="Nueva contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={errors.password}
        />

        <CustomInput
          icon="🔒"
          placeholder="Confirmar contraseña"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          error={errors.confirm}
        />

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <PrimaryButton title="Actualizar contraseña" onPress={handleReset} loading={loading} />
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigation.navigate('Login');
        }}
        message="Contraseña actualizada correctamente"
      />
    </KeyboardAvoidingView>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 20, paddingTop: 40 },
  title: { fontSize: 22, fontWeight: 'bold', color: colors.text, marginBottom: 6 },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: 22 },
  submitError: { color: colors.error, marginBottom: 16, textAlign: 'center' },
});
