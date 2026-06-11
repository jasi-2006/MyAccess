import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';

const person2 = require('../assets/persona2.png');

export default function HomeAbout() {
  const { width } = useWindowDimensions();
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 40 : isTablet ? 24 : 16;


  
  return (
    <View style={[styles.about, { paddingHorizontal: px }]}>
      <View style={[styles.aboutContent, isDesktop && { flexDirection: 'row', gap: 40 }]}>
        <Image
          source={personImage}
          style={{ width: isDesktop ? 200 : isTablet ? 170 : width * 0.5, height: isDesktop ? 160 : isTablet ? 140 : width * 0.4 }}
          resizeMode="contain"
        />
        <View style={isDesktop && { flex: 1 }}>
          <Text style={[styles.aboutTitle, { fontSize: isDesktop ? 32 : isTablet ? 26 : 22 }]}>
            Sobre Nosotros
          </Text>
          <Text style={[styles.aboutText, { fontSize: isDesktop ? 13 : 12 }]}>
            <Text style={styles.highlight}>MyAccess</Text> es una aplicación creada para gestionar
            accesos, usuarios y carnets digitales de manera segura y organizada en el
            Centro de Comercio y Turismo del{' '}
            <Text style={styles.highlight}>SENA</Text> en Armenia, Quindío.
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  about: {
    paddingVertical: 28,
  },

  aboutContent: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 24,
    minHeight: 300, // más altura para poder bajar el texto
  },

  aboutTitle: {
  fontWeight: 'bold',
  color: '#0F766E', // verde corporativo
  marginBottom: 16,
  textAlign: 'center',
  },

  aboutText: {
    color: '#6B7280',
    lineHeight: 26,
    textAlign: 'justify',
  },

  highlight: {
    color: '#0F766E',
  },
});
