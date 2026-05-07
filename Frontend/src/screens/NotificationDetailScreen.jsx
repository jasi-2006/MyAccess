import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import UserSidebar from '../components/UserSidebar.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { markNotificationAsRead } from '../services/notificationService.js';

export default function NotificationDetailScreen({ navigation, route }) {
  const { item } = route.params;
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 900;
  const px = isDesktop ? 24 : isMobile ? 10 : 16;
  const [notification, setNotification] = useState(item);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const markAsRead = async () => {
      if (!notification?.id) return;

      try {
        const updated = await markNotificationAsRead(notification.id);
        setNotification((current) => ({
          ...current,
          raw: updated,
          unread: false,
        }));
        setRefreshKey((current) => current + 1);
      } catch {
      }
    };

    markAsRead();
  }, [notification?.id]);

  return (
    <WebFrame>
      <View style={styles.root}>
        <CarnetTopbar navigation={navigation} notificationRefreshKey={refreshKey} />

        <View style={styles.contentFrame}>
          {!isMobile && <UserSidebar navigation={navigation} activeKey="Notifications" />}

          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.scroll, { paddingHorizontal: px }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && <UserSidebar navigation={navigation} activeKey="Notifications" />}

            <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backBtnText}>← Volver</Text>
            </TouchableOpacity>

            <View style={styles.card}>
              <View style={styles.cardTop}>
                <View style={[styles.iconBubble, notification.unread && styles.iconBubbleUnread]}>
                  <Text style={styles.iconText}>{notification.unread ? '!' : 'i'}</Text>
                </View>
                <View style={styles.cardTopInfo}>
                  <Text style={styles.badge}>{notification.type}</Text>
                  <Text style={styles.time}>{notification.time}</Text>
                </View>
              </View>

              <Text style={styles.title}>{notification.title}</Text>
              <View style={styles.divider} />
              <Text style={styles.message}>{notification.message}</Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  root:         { flex: 1, backgroundColor: '#F0F9F6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainArea:     { flex: 1 },
  scroll:       { flexGrow: 1, paddingTop: 16, paddingBottom: 28 },

  backBtn:      { marginBottom: 14 },
  backBtnText:  { fontSize: 13, color: '#079B72', fontWeight: '700' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 20,
    gap: 14,
    borderWidth: 1,
    borderColor: '#DDF7EC',
  },
  cardTop:     { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTopInfo: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  iconBubble: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
  },
  iconBubbleUnread: { backgroundColor: '#24C565' },
  iconText:  { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  badge: {
    color: '#0F766E', backgroundColor: '#E8FFF5',
    borderRadius: 999, overflow: 'hidden',
    paddingHorizontal: 10, paddingVertical: 4,
    fontSize: 11, fontWeight: '800',
  },
  time:    { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  title:   { color: '#1F2937', fontSize: 18, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#E5E7EB' },
  message: { color: '#4B5563', fontSize: 14, lineHeight: 22 },
});
