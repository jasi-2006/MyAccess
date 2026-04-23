import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  useWindowDimensions,
} from 'react-native';
import { colors } from '../theme/colors.jsx';
import PrimaryButton from '../components/PrimaryButton.jsx';

export default function OnboardingScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isSmallDevice = height < 700;

  const circleSize = Math.min(width * 0.60, 280);
  const imageWidth = Math.min(width * 0.78, 320);
  const imageHeight = imageWidth * 0.74;
  const logoWidth = Math.min(width * 0.5, 210);
  const logoHeight = logoWidth * 0.3;
  const heroHeight = Math.max(height * 0.44, 220)/0.7;
  const curveSize = Math.max(width * 1.6, height * 0.1);
  const contentPaddingHorizontal = Math.max(width * 0.08 );
  const contentPaddingBottom = Math.max(height * 0.06);
  const contentPaddingTop = isSmallDevice ? 12 : 20;

  const styles = createStyles({
    width,
    height,
    circleSize,
    imageWidth,
    imageHeight,
    logoWidth,
    logoHeight,
    heroHeight,
    curveSize,
    contentPaddingHorizontal,
    contentPaddingBottom,
    contentPaddingTop,
    isSmallDevice,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.hero}>
        <View style={styles.overlay} />

        <View style={styles.circle} />

        <Image
          source={require('../assets/students.png')}
          style={styles.personasImage}
          resizeMode="contain"
        />
      </View>

      <View style={styles.bottomSection}>
        <View style={styles.curve} />

        <View style={styles.content}>
          <Image
            source={require('../assets/LogoMyAccess.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.subtitle}>
            Innovamos la identificación con carnets digitales seguros y personalizados.
          </Text>

          <PrimaryButton
            title="Comenzar"
            onPress={() => navigation.navigate('Login')}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function createStyles({
  width,
  height,
  circleSize,
  imageWidth,
  imageHeight,
  logoWidth,
  logoHeight,
  heroHeight,
  curveSize,
  contentPaddingHorizontal,
  contentPaddingBottom,
  contentPaddingTop,
  isSmallDevice,
}) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.primary,
    },
    hero: {
      position: 'relative',
      height: heroHeight,
      width: '100%',
      backgroundColor: colors.primary,
      overflow: 'hidden',
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.15)',
    },
    circle: {
      position: 'absolute',
      alignSelf: 'center',
      top: Math.max(height * 0.08, 330),
      width: circleSize,
      height: circleSize,
      backgroundColor: colors.circle,
      borderRadius: circleSize / 2,
      shadowColor: '#ffffff',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 3,
    },
    personasImage: {
      position: 'absolute',
      alignSelf: 'center',
      bottom: isSmallDevice ? 0 : 8,
      width: imageWidth,
      height: imageHeight,
      zIndex: 1,
    },
    bottomSection: {
      flex: 1,
      marginTop: -Math.min(height * 0.08, 56),
      alignItems: 'center',
    },
    curve: {
      width: curveSize,
      height: curveSize,
      borderRadius: curveSize / 2.2,
      backgroundColor: colors.background,
      marginBottom: -(curveSize - Math.max(height * 0.18, 125)),
    },
    content: {
      width: '100%',
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      paddingTop: contentPaddingTop,
      paddingHorizontal: contentPaddingHorizontal,
      paddingBottom: contentPaddingBottom,
    },
    logo: {
      width: logoWidth,
      height: logoHeight,
      marginBottom: isSmallDevice ? 16 : 24,
    },
    subtitle: {
      width: Math.min(width * 0.82, 340),
      fontSize: width < 360 ? 15 : 16,
      lineHeight: width < 360 ? 22 : 24,
      color: colors.textSecondary,
      marginBottom: isSmallDevice ? 24 : 32,
      textAlign: 'center',
    },
    button: {
      width: '100%',
      maxWidth: 340,
    },
  });
}
