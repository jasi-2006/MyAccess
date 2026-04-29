import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from 'react-native';

const logoM = require('../assets/logoM.png');

export default function HomeNavbar({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile  = width < 480;
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 80 : isTablet ? 40 : 20;

  return (
    <View style={[styles.navbar, { paddingHorizontal: px }]}>
      <Image source={logoM} style={styles.logo} resizeMode="contain" />
      {!isMobile && (
        <View style={styles.navLinks}>
          <TouchableOpacity>
            <Text style={[styles.navLink, styles.navLinkActive]}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.navLink}>Notificaciones</Text>
          </TouchableOpacity>
        </View>
      )}
      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={styles.logoutText}>Salir</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  navbar: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 14,
    backgroundColor: '#FFFFFF', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 4,
  },
  logo:          { width: 100, height: 34 },
  navLinks:      { flexDirection: 'row', gap: 28 },
  navLink:       { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  navLinkActive: { color: '#0F766E', fontWeight: '700' },
  logoutText:    { fontSize: 14, color: '#EF4444', fontWeight: '600' },
});
