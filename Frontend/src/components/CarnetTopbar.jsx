import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { countUnreadNotifications, getNotifications } from '../services/notificationService.js';
import { getUserProfile } from '../services/authService';
import { resolveUserRole, ROLES } from '../utils/accessControl';

export default function CarnetTopbar({ navigation, studentName, studentInitial, notificationRefreshKey }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 14 : isTablet ? 18 : 24;
  const [notificationCount, setNotificationCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;
    getUserProfile()
      .then((profile) => {
        if (mounted && profile) {
          const role = resolveUserRole(profile);
          setIsAdmin(role === ROLES.ADMIN);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

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

  useEffect(() => {
    if (notificationRefreshKey !== undefined) {
      loadNotificationCount();
    }
  }, [loadNotificationCount, notificationRefreshKey]);

  const badgeText = notificationCount > 99 ? '99+' : String(notificationCount);

  return (
    <View style={[styles.topbar, { paddingHorizontal: pagePadding }]}>
      <View style={styles.topbarLeft}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Text style={styles.brand}>MyAccess</Text>
        </TouchableOpacity>
        {!isMobile && (
          <View style={styles.topLinks}>
            <TouchableOpacity onPress={() => navigation.navigate('Home')}>
              <Text style={styles.topLink}>Inicio</Text>
            </TouchableOpacity>
            {isAdmin && (
              <>
                <TouchableOpacity onPress={()=> navigation.navigate('User')}>
                  <Text style={styles.topLink}>Configuracion</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bellWrap} onPress={()=> navigation.navigate('Notifications')}>
                  <Text style={styles.bellIcon}>🔔</Text>
                  {notificationCount > 0 ? (
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationBadgeText}>{badgeText}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      </View>
      <View style={styles.topbarRight}>
        <View style={styles.avatar}>
          <View style={styles.avatarBadge}>
            <Text style={styles.avatarInitial}>{studentInitial}</Text>
          </View>
          <Text style={styles.avatarText} numberOfLines={1}>{studentName}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  topbar: {
    minHeight: 42, backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#2FD16A',
    borderBottomWidth: 1, borderBottomColor: '#DADADA',
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  topbarLeft:  { flexDirection: 'row', alignItems: 'center', gap: 16 },
  brand:       { fontSize: 14, fontWeight: '800', color: '#2FD16A' },
  topLinks:    { flexDirection: 'row', alignItems: 'center', gap: 16 },
  topLink:     { fontSize: 11, color: '#8B8B8B' },
  bellWrap:    { width: 24, height: 24, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  bellIcon:    { fontSize: 14 },
  notificationBadge: {
    position: 'absolute',
    top: -7,
    right: -9,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
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
  topbarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar:      { flexDirection: 'row', alignItems: 'center', gap: 6, maxWidth: 130 },
  avatarBadge: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: '#E6DDD7', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarInitial: { color: '#8B6D58', fontWeight: '700', fontSize: 11 },
  avatarText:    { color: '#3E3E3E', fontWeight: '600', fontSize: 11, flexShrink: 1 },
});
