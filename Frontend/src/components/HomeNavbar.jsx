import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from 'react-native';

const logoM = require('../assets/logoM.png');

export default function HomeNavbar({ navigation, active = 'Home' }) {
  const { width } = useWindowDimensions();
  const isMobile  = width < 480;
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 40 : isTablet ? 24 : 16;

  return (
    <View style={[styles.navbar, { paddingHorizontal: px }]}>
      <Image source={logoM} style={styles.logo} resizeMode="contain" />
      {!isMobile && (
        <View style={styles.navLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={[styles.navLink, active === 'Home' && styles.navLinkActive]}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Notifications')}>
            <Text style={[styles.navLink, active === 'Notifications' && styles.navLinkActive]}>Notificaciones</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> navigation.replace('Login')}> 
            <Text style={styles.logoutText}>salir</Text>

          </TouchableOpacity>
        </View>
      )}
      {isMobile && (
        <View style={styles.mobileActions}>
          <TouchableOpacity style={styles.mobileBell} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.mobileBellText}>!</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={()=> navigation.replace('Login')}>
            <Text style={styles.logoutText}>salir</Text>
          </TouchableOpacity>
        </View>
      )}

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
  mobileActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  mobileBell:    { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E8FFF5', alignItems: 'center', justifyContent: 'center' },
  mobileBellText:{ color: '#0F766E', fontSize: 16, fontWeight: '900' },
  navLink:       { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  navLinkActive: { color: '#0F766E', fontWeight: '700' },
  logoutText:    { fontSize: 12, color: '#EF4444', fontWeight: '600' },
});
