import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StatusBar } from 'react-native';
import { styles } from '../constants/styles';
import { COLORS } from '../constants/colors';

const SplashScreen = ({ onFinish }) => {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();
    const timer = setTimeout(() => onFinish(), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.splashContainer}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="dark-content" />
      <Animated.View style={[styles.splashLogoWrapper, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
        <View style={styles.hexOuter}>
          <View style={styles.hexMiddle}>
            <View style={styles.hexInner}>
              <Text style={styles.splashLogoText}>MyAccess</Text>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;