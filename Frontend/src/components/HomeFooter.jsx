import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';

const logoM = require('../assets/logoM.png');

export default function HomeFooter() {
  const { width } = useWindowDimensions();
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 40 : isTablet ? 24 : 16;

  return (
    <View style={[styles.footer, { paddingHorizontal: px }]}>
      <Image source={logoM} style={styles.footerLogo} resizeMode="contain" />
      <Text style={[styles.footerText, { fontSize: isDesktop ? 14 : 12 }]}>
        © 2024 MyAccess · SENA Centro de Comercio y Turismo
      </Text>
      <Text style={[styles.footerText, { fontSize: isDesktop ? 14 : 12 }]}>
        Armenia, Quindío
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#1F2937', paddingVertical: 32,
    alignItems: 'center', gap: 8, marginTop: 16,
  },
  footerLogo: { width: 90, height: 30, marginBottom: 8 },
  footerText: { color: '#9CA3AF', textAlign: 'center' },
});
