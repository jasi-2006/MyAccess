import React, { useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { COLORS } from '../constants/colors';

const SuccessModal = ({ onExplorar }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 70,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
      <Animated.View style={[styles.modal, { transform: [{ scale: scaleAnim }] }]}>

        {/* Círculo check */}
        <View style={styles.checkCircle}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>

        <Text style={styles.exitoTitle}>¡exito!</Text>
        <Text style={styles.exitoSub}>Haz creado tu cuenta{'\n'}correctamente!</Text>

        <TouchableOpacity style={styles.explorarBtn} onPress={onExplorar} activeOpacity={0.85}>
          <Text style={styles.explorarText}>Explorar</Text>
        </TouchableOpacity>

      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  modal: {
    backgroundColor: COLORS.white,
    borderRadius: 28,
    paddingHorizontal: 36,
    paddingVertical: 40,
    alignItems: 'center',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  checkCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
  checkIcon: {
    fontSize: 36,
    color: COLORS.white,
    fontWeight: '900',
  },
  exitoTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: COLORS.dark,
    marginBottom: 8,
  },
  exitoSub: {
    fontSize: 15,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  explorarBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 32,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  explorarText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.dark,
  },
});

export default SuccessModal;