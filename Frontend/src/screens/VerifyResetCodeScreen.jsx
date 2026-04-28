import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { colors } from '../theme/colors.jsx';

export default function VerifyResetCodeScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = height < 700;
  const isTablet = width > 768;
  const isDesktop = width >= 1024;

  const topPadding = isDesktop ? 60 : isTablet ? 100 : isSmallDevice ? 80 : 96;
  const fontSizeTitle = isDesktop ? 42 : isTablet ? 36 : isSmallDevice ? 28 : 32;
  const fontSizeSubtitle = isDesktop ? 22 : isTablet ? 20 : isSmallDevice ? 14 : 16;
  const inputSize = isDesktop ? 72 : isTablet ? 64 : isSmallDevice ? 42 : 48;
  const fontSizeInput = isDesktop ? 28 : isTablet ? 24 : isSmallDevice ? 18 : 20;
  const gap = isDesktop ? 16 : isTablet ? 14 : isSmallDevice ? 8 : 10;
  const buttonHeight = isDesktop ? 64 : isTablet ? 58 : isSmallDevice ? 48 : 52;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const inputs = useRef([]);
  const email = route?.params?.email ?? '';

  const handleChange = (text, index) => {
    const sanitized = text.replace(/[^0-9]/g, '');

    if (!sanitized) {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      return;
    }

    if (sanitized.length > 1) {
      const newCode = [...code];
      sanitized.slice(0, code.length - index).split('').forEach((digit, offset) => {
        newCode[index + offset] = digit;
      });
      setCode(newCode);
      const nextIndex = Math.min(index + sanitized.length, code.length - 1);
      inputs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = sanitized;
    setCode(newCode);
    if (index < code.length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length < 6) {
      setError('Ingresa los 6 dígitos del código.');
      return;
    }
    navigation.navigate('ResetPassword', { email, code: fullCode });
  };

  const isComplete = !code.some((d) => d === '');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={[styles.backButton, { top: isSmallDevice ? 10 : 20 }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.backArrow, { fontSize: isTablet ? 36 : 28 }]}>←</Text>
          </TouchableOpacity>

          <View style={[styles.content, { paddingTop: topPadding }]}>
            <View style={styles.titleContainer}>
              <Text style={[styles.titleGreen, { fontSize: fontSizeTitle }]}>Verifica tu</Text>
              <Text style={[styles.titleDark, { fontSize: fontSizeTitle }]}>correo!</Text>
            </View>

            <Text style={[styles.subtitle, { fontSize: fontSizeSubtitle }]}>
              Ingresa el código enviado a{'\n'}
              <Text style={{ color: colors.primary, fontWeight: '600' }}>{email}</Text>
            </Text>

            <View style={[styles.codeContainer, { gap }]}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => { inputs.current[index] = ref; }}
                  style={[
                    styles.codeInput,
                    {
                      width: inputSize,
                      height: inputSize * 1.2,
                      borderRadius: inputSize * 0.2,
                      fontSize: fontSizeInput,
                    },
                  ]}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                />
              ))}
            </View>

            {error ? (
              <Text style={[styles.submitError, { fontSize: fontSizeSubtitle }]}>{error}</Text>
            ) : null}

            <TouchableOpacity
              style={[
                styles.verifyButton,
                {
                  height: buttonHeight,
                  borderRadius: buttonHeight * 0.25,
                  opacity: isComplete ? 1 : 0.6,
                },
              ]}
              onPress={handleVerify}
              disabled={!isComplete}
            >
              <Text style={[styles.verifyButtonText, { fontSize: fontSizeSubtitle + 4 }]}>
                Continuar
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backButton: {
    position: 'absolute',
    left: '5%',
    zIndex: 10,
    padding: 4,
  },
  backArrow: {
    color: '#999999',
  },
  content: {
    flex: 1,
    paddingHorizontal: '15%',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: '4%',
  },
  titleGreen: {
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
  },
  titleDark: {
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  subtitle: {
    color: '#6B7280',
    marginBottom: '8%',
    textAlign: 'center',
    paddingHorizontal: '5%',
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '8%',
    width: '100%',
  },
  codeInput: {
    backgroundColor: '#E5E7EB',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#374151',
  },
  submitError: {
    color: '#EF4444',
    marginBottom: '4%',
    textAlign: 'center',
    paddingHorizontal: '5%',
  },
  successText: {
    color: colors.primary,
    marginBottom: '4%',
    textAlign: 'center',
    paddingHorizontal: '5%',
  },
  verifyButton: {
    width: '100%',
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '5%',
    shadowColor: colors.textSecondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  verifyButtonDisabled: {
    backgroundColor: '#A7F3D0',
  },
  verifyButtonText: {
    fontWeight: '600',
    color: '#1F2937',
  },
  resendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  resendText: {
    color: '#6B7280',
  },
  resendLink: {
    color: '#000000',
    fontWeight: '600',
  },
});
