import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../theme/colors.jsx';
import CustomInput from '../components/CustomInput.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';
import { forgotPassword } from '../services/authService';
import WebFrame from '../components/WebFrame.jsx';

export default function ForgotPasswordScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isDesktop = width >= 1024;
  const isTablet = width >= 768 && width < 1024;
  const horizontalPadding = isDesktop ? width * 0.18 : isTablet ? width * 0.1 : width * 0.06;

  const handleSend = async () => {
    if (!email.includes('@')) {
      setError('Email inválido');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await forgotPassword(email);
      navigation.navigate('VerifyResetCode', { email });
    } catch (e) {
      setError(e.message || 'No fue posible enviar el código.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <WebFrame>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ===== HEADER VERDE CON CURVA ===== */}
          <View style={styles.headerContainer}>
            <View style={[styles.headerCurved, { paddingHorizontal: horizontalPadding }]}>
              {/* Botón de regreso */}
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backArrow}>←</Text>
              </TouchableOpacity>

             <Text style={styles.headerTitle}>
                 Verifica tu correo!
                   </Text>
              <Text style={styles.headerSubtitle}>
                Un nuevo comienzo te espera.
              </Text>
            </View>
            {/* Curva decorativa inferior */}
            <View style={[styles.curveDecoration, {
              height: isDesktop ? 60 : isTablet ? 45 : 35,
              borderTopLeftRadius: isDesktop ? 60 : isTablet ? 45 : 35,
              borderTopRightRadius: isDesktop ? 60 : isTablet ? 45 : 35,
            }]} />
          </View>

          {/* ===== CONTENIDO PRINCIPAL ===== */}
          <View style={[styles.content, { paddingHorizontal: horizontalPadding }]}>
            {/* Label del input */}
            <View style={styles.inputLabelContainer}>
              <Text style={styles.inputLabel}>Ingresa tu correo:</Text>
            </View>

            {/* Input Email */}
            <View style={styles.inputWrapper}>
              <CustomInput
                placeholder=""
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                error={error}
                style={styles.customInput}
              />
            </View>

            {/* Botón Validar */}
            <PrimaryButton
              title="validar"
              onPress={handleSend}
              loading={loading}
              style={styles.validateButton}
              textStyle={styles.validateButtonText}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      </WebFrame>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff', // Verde del header
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ===== HEADER =====
  headerContainer: {
    width: '100%',
    backgroundColor: '#0F9F76',
  },
  headerCurved: {
    backgroundColor: '#0F9F76',
    paddingTop: 100,
    paddingBottom: 36,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    top: 90,
    left: 80,
    width: 63,
    height: 50,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  backArrow: {
    fontSize: 30,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 50,
    fontWeight: '700', 
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 50,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 30,
    opacity: 0.9,
  },
  curveDecoration: {
    backgroundColor: '#FFFFFF',
    marginTop: -10,
  },

  // ===== CONTENIDO =====
  content: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
  },
  inputLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  inputLabel: {
    fontSize: 20,
    color: '#6B7280',
    fontWeight: '500',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 20,
  },
  customInput: {
    backgroundColor: '#E8FDF4', // Verde muy claro
    borderRadius: 30,
    paddingVertical: 16,
    paddingHorizontal: 20,
    textAlign: 'center',
    fontSize: 30,
    color: '#9CA3AF',
    borderWidth: 0,
  },
  validateButton: {
    backgroundColor: '#0F9F76',
    borderRadius: 50,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 40,
  },
  validateButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#f2f5f9',
  },
});
