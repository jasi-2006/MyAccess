import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { colors } from '../theme/colors';
import CustomButton from '../components/CustomButton';
import HeaderCurved from '../components/HeaderCurved';
import SuccessModal from '../components/SuccessModal';

export default function VerificationScreen({ navigation }) {
  const [code, setCode] = useState(['', '', '', '']);
  const [showSuccess, setShowSuccess] = useState(false);
  const inputs = useRef([]);

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1].focus();
    }
  };

  const handleVerify = () => {
    if (code.every(digit => digit !== '')) {
      setShowSuccess(true);
    }
  };

  return (
    <View style={styles.container}>
      <HeaderCurved height={180} />
      <View style={styles.content}>
        <Text style={styles.title}>Verificación</Text>
        <Text style={styles.subtitle}>Ingresa el código de 4 dígitos</Text>

        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputs.current[index] = ref}
              style={styles.codeInput}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        <CustomButton 
          title="Verificar" 
          onPress={handleVerify}
          disabled={code.some(digit => digit === '')}
        />
      </View>

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigation.navigate('Onboarding');
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
    marginBottom: 40,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  codeInput: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.text,
  },
});
