import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';
import SuccessModal from '../components/SuccessModal';

const VerificaCodigoScreen = ({ onExito, onBack, onReenviar }) => {
  const [code, setCode] = useState(['', '', '', '']);
  const [showModal, setShowModal] = useState(false);
  const inputs = [useRef(), useRef(), useRef(), useRef()];

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text.replace(/[^0-9]/g, '');
    setCode(newCode);
    if (text && index < 3) inputs[index + 1].current.focus();
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputs[index - 1].current.focus();
    }
  };

  const handleVerificar = () => {
    setShowModal(true);
  };

  const handleExplorar = () => {
    setShowModal(false);
    onExito();
  };

  return (
    <SafeAreaView style={styles.container}>

      {/* Botón atrás */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* Contenido */}
      <View style={styles.body}>
        <Text style={styles.title}>
          <Text style={styles.titleGreen}>Verifica tu{'\n'}</Text>
          <Text style={styles.titleDark}>codigo!</Text>
        </Text>
        <Text style={styles.subtitle}>Te acabamos de enviar un codigo!</Text>

        {/* Cajas OTP */}
        <View style={styles.otpRow}>
          {code.map((digit, i) => (
            <TextInput
              key={i}
              ref={inputs[i]}
              style={[styles.otpBox, digit ? styles.otpBoxFilled : null]}
              value={digit}
              onChangeText={(t) => handleChange(t, i)}
              onKeyPress={(e) => handleKeyPress(e, i)}
              keyboardType="numeric"
              maxLength={1}
              textAlign="center"
              selectionColor={COLORS.primary}
            />
          ))}
        </View>

        {/* Botón verificar */}
        <TouchableOpacity style={styles.btn} onPress={handleVerificar} activeOpacity={0.85}>
          <Text style={styles.btnText}>verificación</Text>
        </TouchableOpacity>

        {/* Reenviar */}
        <View style={styles.reenviarRow}>
          <Text style={styles.reenviarText}>No recibiste el codigo? </Text>
          <TouchableOpacity onPress={onReenviar}>
            <Text style={styles.reenviarLink}>Reenviar codigo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Modal éxito */}
      {showModal && <SuccessModal onExplorar={handleExplorar} />}

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    marginTop: Platform.OS === 'ios' ? 12 : 16,
    marginLeft: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grayLight,
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.dark,
    fontWeight: '700',
  },
  body: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 32,
    alignItems: 'center',
  },
  title: {
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 16,
  },
  titleGreen: {
    color: COLORS.primary,
  },
  titleDark: {
    color: COLORS.dark,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 36,
    textAlign: 'center',
  },
  otpRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 40,
  },
  otpBox: {
    width: 72,
    height: 80,
    borderRadius: 16,
    backgroundColor: '#EFEFEF',
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.dark,
    textAlign: 'center',
  },
  otpBoxFilled: {
    backgroundColor: COLORS.inputBg,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  btn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  btnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
    letterSpacing: 0.3,
  },
  reenviarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reenviarText: {
    fontSize: 14,
    color: COLORS.gray,
  },
  reenviarLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '700',
  },
});

export default VerificaCodigoScreen;