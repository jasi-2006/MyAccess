import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors } from '../theme/colors.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import HeaderCurved from '../components/HeaderCurved.jsx';

export default function VerifyResetCodeScreen({ navigation, route }) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputs = useRef([]);
  const email = route?.params?.email ?? '';

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text.replace(/[^0-9]/g, '').slice(0, 1);
    setCode(newCode);
    if (text && index < code.length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Ingresa los 6 dígitos');
      return;
    }
    navigation.navigate('ResetPassword', { email, code: fullCode });
  };

  return (
    <View style={styles.container}>
      <HeaderCurved height={180} />
      <View style={styles.content}>
        <Text style={styles.title}>Código de verificación</Text>
        <Text style={styles.subtitle}>Ingresa el código enviado a</Text>
        <Text style={styles.email}>{email}</Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputs.current[index] = ref; }}
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

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <PrimaryButton
          title="Continuar"
          onPress={handleVerify}
          disabled={code.some((d) => d === '')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 30, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textSecondary },
  email: { fontSize: 14, color: colors.textSecondary, marginTop: 4, marginBottom: 32 },
  codeContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  codeInput: {
    width: 44, height: 56, borderRadius: 12,
    backgroundColor: colors.primaryLight,
    fontSize: 24, fontWeight: 'bold', textAlign: 'center', color: colors.text,
  },
  error: { color: colors.error, marginBottom: 16, textAlign: 'center' },
});
