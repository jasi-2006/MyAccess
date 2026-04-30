import React from 'react';
import { View, Text, StyleSheet, Image, useWindowDimensions } from 'react-native';

const person = require('../assets/person.png');

export default function HomeHero({ fullName }) {
  const { width } = useWindowDimensions();
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 80 : isTablet ? 40 : 20;

  return (
    <View style={[styles.hero, { paddingHorizontal: px, flexDirection: isDesktop ? 'row' : 'column' }]}>
      <View style={[styles.heroText, { maxWidth: isDesktop ? '50%' : '100%' }]}>
        <Text style={[styles.heroTitle, { fontSize: isDesktop ? 42 : isTablet ? 34 : 26 }]}>
          Bienvenido,{'\n'}
          <Text style={styles.heroHighlight}>{fullName ?? 'MyAccess'}</Text>
        </Text>
        <Text style={[styles.heroSubtitle, { fontSize: isDesktop ? 18 : 14 }]}>
          Conoce mas de MyAccess y disfruta de esta gran experiencia.
        </Text>
      </View>
      <Image
        source={person}
        style={{ width: isDesktop ? 340 : isTablet ? 260 : width * 0.7, height: isDesktop ? 260 : isTablet ? 200 : width * 0.5 }}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hero:          { alignItems: 'center', paddingVertical: 48, backgroundColor: '#F0F9F6', gap: 24 },
  heroText:      { alignItems: 'flex-start' },
  heroTitle:     { fontWeight: '800', color: '#1F2937', lineHeight: 48, marginBottom: 12 },
  heroHighlight: { color: '#0F766E' },
  heroSubtitle:  { color: '#6B7280', lineHeight: 24, marginTop: 4 },
});
