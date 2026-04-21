import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { styles } from '../constants/styles';

const { width, height } = Dimensions.get('window');

const OnboardingScreen = ({ onStart }) => {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.onboardingContainer}>
      <View style={styles.onboardingTop}>
        <View style={styles.teamPhotoPlaceholder}>
          <Text style={styles.teamPhotoIcon}>👥</Text>
          <Text style={styles.teamPhotoLabel}>Equipo MyAccess</Text>
        </View>
      </View>
      <Animated.View style={[styles.onboardingBottom, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}>
        <Text style={styles.onboardingBrand}>MyAccess</Text>
        <Text style={styles.onboardingSubtitle}>
          Innovamos la identificación con carnets{'\n'}digitales seguros y personalizados.
        </Text>
        <TouchableOpacity style={styles.startButton} onPress={onStart} activeOpacity={0.85}>
          <Text style={styles.startButtonText}>comenzar</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export default OnboardingScreen;