import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { countUnreadNotifications, getNotifications } from '../services/notificationService.js';
import { logoutUser } from '../services/authService';
import { normalizeRole, ROLES } from '../utils/accessControl';

const logoM = require('../assets/logoM.png');

export default function HomeNavbar({ navigation, active = 'Home', role }) {
  const { width } = useWindowDimensions();
  const isMobile  = width < 480;
  const isTablet  = width >= 480 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 40 : isTablet ? 24 : 16;
  const [notificationCount, setNotificationCount] = useState(0);
  const normalizedRole = normalizeRole(role);
  const canManage = normalizedRole === ROLES.ADMIN || normalizedRole === ROLES.INSTRUCTOR;

  const loadNotificationCount = useCallback(async () => {
    try {
      const response = await getNotifications();
      setNotificationCount(countUnreadNotifications(response));
    } catch {
      setNotificationCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotificationCount();
    }, [loadNotificationCount])
  );

  const badgeText = notificationCount > 99 ? '99+' : String(notificationCount);
  const handleLogout = async () => {
    await logoutUser();
    navigation.replace('Login');
  };

  return (
    <View style={[styles.navbar, { paddingHorizontal: px }]}>
      <Image source={logoM} style={styles.logo} resizeMode="contain" />
      {!isMobile && (
        <View style={styles.navLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Text style={[styles.navLink, active === 'Home' && styles.navLinkActive]}>Inicio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationLink} onPress={() => navigation.navigate('Notifications')}>
            <Text style={[styles.navLink, active === 'Notifications' && styles.navLinkActive]}>Notificaciones</Text>
            {notificationCount > 0 ? (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationBadgeText}>{badgeText}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          {canManage ? (
            <TouchableOpacity onPress={() => navigation.navigate('Instructor')}>
              <Text style={[styles.navLink, active === 'Instructor' && styles.navLinkActive]}>Gestion</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleLogout}> 
            <Text style={styles.logoutText}>salir</Text>

          </TouchableOpacity>
        </View>
      )}
      {isMobile && (
        <View style={styles.mobileActions}>
          <TouchableOpacity style={styles.mobileBell} onPress={() => navigation.navigate('Notifications')}>
            <Text style={styles.mobileBellText}>!</Text>
            {notificationCount > 0 ? (
              <View style={styles.mobileNotificationBadge}>
                <Text style={styles.notificationBadgeText}>{badgeText}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
          {canManage ? (
            <TouchableOpacity onPress={() => navigation.navigate('Instructor')}>
              <Text style={styles.navLink}>Gestion</Text>
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity onPress={handleLogout}>
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
  notificationLink: { position: 'relative' },
  mobileActions: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  mobileBell:    { width: 34, height: 34, borderRadius: 17, backgroundColor: '#E8FFF5', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  mobileBellText:{ color: '#0F766E', fontSize: 16, fontWeight: '900' },
  navLink:       { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  navLinkActive: { color: '#0F766E', fontWeight: '700' },
  notificationBadge: {
    position: 'absolute',
    top: -10,
    right: -16,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileNotificationBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  logoutText:    { fontSize: 12, color: '#EF4444', fontWeight: '600' },
});
