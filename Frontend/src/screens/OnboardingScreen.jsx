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
  const isDesktop = width >= 980;
  const isSmallDevice = height < 700;

  // Ancho unificado para hero y content
  const containerWidth = isDesktop ? Math.min(width * 0.68, 920) : width;
  const contentPaddingHorizontal = isDesktop ? 40 : Math.max(width * 0.08, 24);
  
  const circleSize = isDesktop ? 220 : Math.min(width * 0.6, 390);
  const imageWidth = isDesktop ? 330 : Math.min(width * 0.78, 340);
  const imageHeight = imageWidth * 0.74;
  const logoWidth = isDesktop ? 210 : Math.min(width * 0.5, 210);
  const logoHeight = logoWidth * 0.3;
  const heroHeight = isDesktop
    ? Math.min(Math.max(height * 0.42, 270), 340)
    : isSmallDevice
      ? 280
      : 550;
  const contentPaddingBottom = isDesktop ? 6 : isSmallDevice ? 20 : 24;
  const contentPaddingTop = isDesktop ? -14 : isSmallDevice ? 12 : 8;

  const styles = createStyles({
    width,
    height,
    containerWidth,
    circleSize,
    imageWidth,
    imageHeight,
    logoWidth,
    logoHeight,
    heroHeight,
    contentPaddingHorizontal,
    contentPaddingBottom,
    contentPaddingTop,
    isDesktop,
    isSmallDevice,
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Hero ahora usa el mismo ancho que el content */}
      <View style={styles.heroWrapper}>
        <View style={styles.hero}>
          <View style={styles.overlay} />
          <View style={styles.heroInner}>
            <View style={styles.circle} />
            <Image
              source={require('../assets/students.png')}
              style={styles.personasImage}
              resizeMode="contain"
            />
          </View>
        </View>
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
            Bienvenido a MyAccess!
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
  containerWidth,
  circleSize,
  imageWidth,
  imageHeight,
  logoWidth,
  logoHeight,
  heroHeight,
  contentPaddingHorizontal,
  contentPaddingBottom,
  contentPaddingTop,
  isDesktop,
  isSmallDevice,
}) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    // Wrapper que limita el ancho del hero igual que el content
    heroWrapper: {
      width: '100%',
      alignItems: 'center',
      backgroundColor: colors.primary, // Color verde solo dentro del área del hero
    },
    hero: {
      width: containerWidth, // Mismo ancho que el content
      height: heroHeight,
      position: 'relative',
      overflow: 'hidden',
      alignItems: 'center',
      backgroundColor: colors.primary,
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
    heroInner: {
      width: '100%',
      height: '100%',
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'flex-end',
      backgroundColor:colors.primary,
    },
    
    personasImage: {
      top:11,
      width: imageWidth,
      height: imageHeight,
      marginBottom: isDesktop ? 12 : isSmallDevice ? 8 : 23,
      zIndex: 1,
    },
    bottomSection: {
      flex: 1,
      marginTop: isDesktop ? -18 : isSmallDevice ? -18 : -24,
      alignItems: 'center',
    },
    curve: {
      width: containerWidth, // Mismo ancho que el hero y el content
      height: isDesktop ? 100 : isSmallDevice ? 86 : 96,
      backgroundColor: colors.background,
      borderTopLeftRadius: isDesktop ? 60 : width * 0.5,
      borderTopRightRadius: isDesktop ? 60 : width * 0.5,
    },
    content: {
      width: containerWidth, // Mismo ancho que el hero
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
      marginBottom: isDesktop ? 20 : isSmallDevice ? 12 : 16,
    },
    subtitle: {
      width: isDesktop ? 360 : Math.min(width * 0.82, 340),
      fontSize: 16,
      lineHeight: 24,
      color: colors.textSecondary,
      marginBottom: isDesktop ? 28 : isSmallDevice ? 24 : 32,
      textAlign: 'center',
    },
    button: {
      width: isDesktop ? 220 : '100%',
      maxWidth: 340,
      alignSelf: 'center',
    },
  });
}
