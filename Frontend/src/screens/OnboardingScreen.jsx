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
      : 510;
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
          <View style={styles.contentInner}>
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

    // CONTENEDOR VERDE PRINCIPAL
  heroWrapper: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingTop: isDesktop ? 100 : 40,
    shadowColor: '#000',
    shadowOffset: {
     width: 0,
    height: 6,
    },

    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
  },

  hero: {
    width: containerWidth,
    height: heroHeight + 60, 
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },

  heroInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },

  personasImage: {
  width: imageWidth + 100,
  height: imageHeight + 190,
  top: 120,
  marginBottom: isDesktop ? 18 : isSmallDevice ? 10 : 29,
  zIndex: 1,

  },

  bottomSection: {
    marginTop: isDesktop ? -25 : -22,
    alignItems: 'center',
  },

  curve: {
  width: 350,
  height: 300,
  backgroundColor: colors.background,
  transform: [{ translateY: -78 }],
  borderTopLeftRadius: 400,
  borderTopRightRadius: 400,
  alignSelf: 'center',
  },

  content: {
    width: containerWidth,
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingTop: contentPaddingTop + 10,
    paddingHorizontal: contentPaddingHorizontal + 8,
    paddingBottom: isDesktop ? contentPaddingBottom : 12,
  },

  contentInner: {
    width: '100%',
    alignItems: 'center',
    marginTop: isDesktop ? -300 : -300,
  },

  logo: {
    width: logoWidth,
    height: logoHeight,
    marginBottom: isDesktop ? 24 : 18,
  },

  subtitle: {
    width: isDesktop ? 360 : Math.min(width * 0.84, 340),
    fontSize: 14,
    lineHeight: 25,
    color: colors.textSecondary,
    marginBottom: isDesktop ? 32 : 28,
    textAlign: 'center',
  },

  button: {
    width: isDesktop ? 190 : '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  });
}
