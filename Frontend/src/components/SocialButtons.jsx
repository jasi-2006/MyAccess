import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, Text, useWindowDimensions } from 'react-native';

export default function SocialButtons({ wide = false, onPressGoogle, onPressMicrosoft }) {
  const { width } = useWindowDimensions();
  const isTablet = width >= 500 && width < 1024;
  const isDesktop = width >= 600;

  const btnSize = isDesktop ? 40 : isTablet ? 60 : 50;
  const iconSize = isDesktop ? 25 : isTablet ? 36 : 28;

  if (wide) {
    return (
      <View style={styles.wideContainer}>
        <TouchableOpacity style={styles.wideBtn} onPress={onPressGoogle}>
          <Image source={require('../assets/google.png')} style={styles.wideIcon} />
          <Text style={styles.wideText}>Google</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.wideBtn} onPress={onPressMicrosoft}>
          <Image source={require('../assets/microsoftLogo.png')} style={styles.wideIcon} />
          <Text style={styles.wideText}>Microsoft</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }]} onPress={onPressMicrosoft}>
        <Image source={require('../assets/microsoftLogo.png')} style={{ width: iconSize, height: iconSize, resizeMode: 'contain' }} />
      </TouchableOpacity>
      <TouchableOpacity style={[styles.btn, { width: btnSize, height: btnSize }]} onPress={onPressGoogle}>
        <Image source={require('../assets/google.png')} style={{ width: iconSize, height: iconSize, resizeMode: 'contain' }} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 20, marginBottom: 24 },
  wideContainer: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 20 },
  wideBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  wideIcon: { width: 18, height: 18, resizeMode: 'contain' },
  wideText: { color: '#374151', fontSize: 12, fontWeight: '700' },
  btn: {
    borderRadius: 16, backgroundColor: '#F3F4F6',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
});
