import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, SafeAreaView, Dimensions, Platform,
} from 'react-native';
import { COLORS } from '../constants/colors';

const { width, height } = Dimensions.get('window');

const VerificaCorreoScreen = ({ onValidar, onBack }) => {
  const [email, setEmail] = useState('');

  return (
    <SafeAreaView style={styles.container}>

      {/* Botón atrás */}
      <TouchableOpacity style={styles.backBtn} onPress={onBack}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>

      {/* Header ola verde */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          <Text style={styles.headerWhite}>Verifica </Text>
          <Text style={styles.headerDark}>tu{'\n'}correo!</Text>
        </Text>
        <Text style={styles.headerSub}>Un nuevo comienzo te espera.</Text>
      </View>

      {/* Ola curva */}
      <View style={styles.wave} />

      {/* Contenido blanco */}
      <View style={styles.body}>
        <View style={styles.labelRow}>
          <Text style={styles.emailIcon}>✉️</Text>
          <Text style={styles.label}>Ingresa tu correo:</Text>
        </View>

        <TextInput
          style={styles.input}
          placeholder="senacormercio@gmail.com"
          placeholderTextColor={COLORS.gray}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.btn} onPress={onValidar} activeOpacity={0.85}>
          <Text style={styles.btnText}>validar</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 52 : 28,
    left: 20,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  backArrow: {
    fontSize: 20,
    color: COLORS.dark,
    fontWeight: '700',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: Platform.OS === 'ios' ? 100 : 80,
    paddingBottom: 60,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 50,
    marginBottom: 12,
  },
  headerWhite: {
    color: COLORS.white,
  },
  headerDark: {
    color: COLORS.dark,
  },
  headerSub: {
    fontSize: 15,
    color: COLORS.dark,
    opacity: 0.75,
    fontWeight: '500',
  },
  wave: {
    height: 50,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 9999,
    borderBottomRightRadius: 9999,
    marginTop: -1,
  },
  body: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 40,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
  },
  emailIcon: {
    fontSize: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.inputBg,
    borderRadius: 32,
    height: 54,
    paddingHorizontal: 20,
    fontSize: 15,
    color: COLORS.text,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    marginBottom: 24,
  },
  btn: {
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
  },
  btnText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.dark,
    textDecorationLine: 'underline',
    letterSpacing: 0.3,
  },
});

export default VerificaCorreoScreen;