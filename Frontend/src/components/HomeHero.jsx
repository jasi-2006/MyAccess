import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';

const person = require('../assets/person.png');

export default function HomeHero({ fullName }) {
  const { width } = useWindowDimensions();
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 40 : isTablet ? 24 : 16;

  return (
    <View style={[styles.hero, { paddingHorizontal: px, flexDirection: isDesktop ? 'row' : 'column' }]}>
      <View style={[styles.heroText, { maxWidth: isDesktop ? '50%' : '100%' }]}>
        <Text style={[styles.heroTitle, { fontSize: isDesktop ? 26 : isTablet ? 22 : 20 }]}>
          Bienvenido,{'\n'}
          <Text style={styles.heroHighlight}>{fullName ?? 'MyAccess'}</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { fontSize: isDesktop ? 14 : 13 }]}>
          Conoce mas de MyAccess y disfruta de esta gran experiencia.
        </Text>
      </View>
      <Image
        source={person}
        style={{ width: isDesktop ? 240 : isTablet ? 200 : width * 0.6, height: isDesktop ? 190 : isTablet ? 160 : width * 0.45 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero:          { alignItems: 'center', paddingVertical: 28, backgroundColor: '#F0F9F6', gap: 16 },
  heroText:      { alignItems: 'flex-start' },
  heroTitle:     { fontWeight: '800', color: '#1F2937', lineHeight: 48, marginBottom: 12 },
  heroHighlight: { color: '#0F766E' },
  heroSubtitle:  { color: '#6B7280', lineHeight: 24, marginTop: 4 },
});
