import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors } from '../theme/colors.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import HeaderCurved from '../components/HeaderCurved.jsx';
import SuccessModal from '../components/SuccessModal.jsx';
import { verifyUser } from '../services/authService';

export default function VerificationGatewayScreen({ navigation, route }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputs = useRef([]);
  const email = route?.params?.email ?? '';

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text.replace(/[^0-9]/g, '').slice(0, 1);
    setCode(newCode);

    if (text && index < code.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    if (!email) {
      setSubmitError('No encontramos el correo para verificar la cuenta.');
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');
      await verifyUser(email, code.join(''));
      setShowSuccess(true);
    } catch (error) {
      setSubmitError(error.message || 'No fue posible verificar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderCurved height={180} />
      <View style={styles.content}>
        <Text style={styles.title}>Verificacion</Text>
        <Text style={styles.subtitle}>Ingresa el codigo de 6 digitos</Text>
        <Text style={styles.emailText}>{email || 'Correo no disponible'}</Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputs.current[index] = ref;
              }}
              style={styles.codeInput}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

        <PrimaryButton
          title="Verificar"
          onPress={handleVerify}
          disabled={code.some((digit) => digit === '')}
          loading={loading}
        />
      </View>

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigation.navigate('Login');
        }}
        message="Tu cuenta ha sido verificada exitosamente"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 30,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emailText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 32,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  codeInput: {
    width: 44,
    height: 56,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text,
  },
  submitError: {
    color: colors.error,
    marginBottom: 16,
    textAlign: 'center',
  },
});
