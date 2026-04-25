import React, { useRef, useState } from 'react';
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
import SuccessModal from '../components/SuccessModal.jsx';
import { resendVerificationCode, verifyUser } from '../services/authService';

export default function VerificationGatewayScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = height < 700;
  const isTablet = width > 768;
  const isDesktop = width >= 1024;

  const topPadding = isDesktop ? 120 : isTablet ? 100 : isSmallDevice ? 80 : 96;
  const fontSizeTitle = isDesktop ? 42 : isTablet ? 36 : isSmallDevice ? 28 : 32;
  const fontSizeSubtitle = isDesktop ? 22 : isTablet ? 20 : isSmallDevice ? 14 : 16;
  const inputSize = isDesktop ? 72 : isTablet ? 64 : isSmallDevice ? 42 : 48;
  const fontSizeInput = isDesktop ? 28 : isTablet ? 24 : isSmallDevice ? 18 : 20;
  const gap = isDesktop ? 16 : isTablet ? 14 : isSmallDevice ? 8 : 10;
  const buttonHeight = isDesktop ? 64 : isTablet ? 58 : isSmallDevice ? 48 : 52;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const inputs = useRef([]);
  const email = (route?.params?.email ?? '').trim().toLowerCase();
  const registerPayload = route?.params?.registerPayload ?? null;

  const handleChange = (text, index) => {
    const sanitizedText = text.replace(/[^0-9]/g, '');

    if (!sanitizedText) {
      const newCode = [...code];
      newCode[index] = '';
      setCode(newCode);
      return;
    }

    if (sanitizedText.length > 1) {
      const newCode = [...code];

      sanitizedText
        .slice(0, code.length - index)
        .split('')
        .forEach((digit, offset) => {
          newCode[index + offset] = digit;
        });

      setCode(newCode);

      const nextIndex = Math.min(index + sanitizedText.length, code.length - 1);
      inputs.current[nextIndex]?.focus();
      return;
    }

    const newCode = [...code];
    newCode[index] = sanitizedText;
    setCode(newCode);

    if (index < code.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const sanitizedCode = code.join('').replace(/[^0-9]/g, '');

    if (!email) {
      setSubmitError('No encontramos el correo para verificar la cuenta.');
      return;
    }

    if (sanitizedCode.length !== 6) {
      setSubmitError('Ingresa los 6 digitos del codigo.');
      return;
    }

    try {
      setLoading(true);
      setSubmitError('');
      setResendMessage('');
      await verifyUser(email, sanitizedCode);
      setShowSuccess(true);
    } catch (error) {
      setSubmitError(error.message || 'No fue posible verificar la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setSubmitError('No encontramos el correo para reenviar el codigo.');
      return;
    }

    try {
      setResendLoading(true);
      setSubmitError('');
      setResendMessage('');
      await resendVerificationCode(email, registerPayload);
      setCode(['', '', '', '', '', '']);
      setResendMessage('Te enviamos un nuevo codigo de verificacion.');
      inputs.current[0]?.focus();
    } catch (error) {
      setSubmitError(error.message || 'No fue posible reenviar el codigo.');
    } finally {
      setResendLoading(false);
    }
  };

  const isComplete = !code.some((digit) => digit === '');

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
              <Text style={[styles.titleGreen, { fontSize: fontSizeTitle }]}>
                Verifica tu
              </Text>
              <Text style={[styles.titleDark, { fontSize: fontSizeTitle }]}>
                codigo!
              </Text>
            </View>

            <Text style={[styles.subtitle, { fontSize: fontSizeSubtitle }]}>
              Te acabamos de enviar un codigo!
            </Text>

            <View style={[styles.codeContainer, { gap }]}>
              {code.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    inputs.current[index] = ref;
                  }}
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

            {submitError ? (
              <Text style={[styles.submitError, { fontSize: fontSizeSubtitle }]}>
                {submitError}
              </Text>
            ) : null}

            {resendMessage ? (
              <Text style={[styles.successText, { fontSize: fontSizeSubtitle }]}>
                {resendMessage}
              </Text>
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
              disabled={!isComplete || loading}
            >
              <Text style={[styles.verifyButtonText, { fontSize: fontSizeSubtitle + 4 }]}>
                {loading ? 'Verificando...' : 'verificacion'}
              </Text>
            </TouchableOpacity>

            <View style={styles.resendContainer}>
              <Text style={[styles.resendText, { fontSize: fontSizeSubtitle - 1 }]}>
                No recibiste el codigo?{' '}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={resendLoading}>
                <Text style={[styles.resendLink, { fontSize: fontSizeSubtitle - 1 }]}>
                  {resendLoading ? 'Reenviando...' : 'Reenviar codigo'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          navigation.navigate('Login');
        }}
        message="Tu cuenta ha sido verificada exitosamente"
      />
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
    padding: 8,
  },
  backArrow: {
    color: '#999999',
  },
  content: {
    flex: 1,
    paddingHorizontal: '6%',
    alignItems: 'center',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: '4%',
  },
  titleGreen: {
    fontWeight: 'bold',
    color: '#4ADE80',
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
    backgroundColor: '#4ADE80',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '5%',
    shadowColor: '#4ADE80',
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
    color: '#4ADE80',
    fontWeight: '600',
  },
});
