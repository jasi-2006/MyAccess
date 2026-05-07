import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CreateNotificationModal from '../components/CreateNotificationModal.jsx';
import UserSidebar from '../components/UserSidebar.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getUserProfile } from '../services/authService';
import { getNotifications, markNotificationAsRead } from '../services/notificationService.js';
import { normalizeRole, ROLES } from '../utils/accessControl';

function formatNotificationDate(value) {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  const today = new Date();
  const diffMs = today.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return 'Ahora';
  if (diffMinutes < 60) return `Hace ${diffMinutes} min`;
  if (diffHours < 24) return `Hace ${diffHours} h`;
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} dias`;

  return date.toLocaleDateString();
}

function mapNotification(item) {
  const date = item.sendDate || item.createdDate;

  return {
    id: String(item.idNotifications),
    raw: item,
    type: item.category || item.tipe || 'Notificacion',
    title: item.affair || 'Notificacion',
    message: item.messaje || 'Sin mensaje disponible.',
    time: formatNotificationDate(date),
    unread: !item.readingDate,
  };
}

function getNotificationDateValue(item) {
  const value = item.sendDate || item.createdDate;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export default function NotificationsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 24 : isTablet ? 16 : 10;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const unreadCount = notifications.filter((item) => item.unread).length;
  const [selected, setSelected] = useState(null);
  const [notificationRefreshKey, setNotificationRefreshKey] = useState(0);
  const [profileRole, setProfileRole] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const canCreateNotifications = [ROLES.ADMIN, ROLES.INSTRUCTOR].includes(normalizeRole(profileRole));

  const loadNotifications = useCallback(async ({ refresh = false } = {}) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError('');
      const response = await getNotifications();
      const list = Array.isArray(response) ? response : [];
      const sortedList = [...list].sort((a, b) => getNotificationDateValue(b) - getNotificationDateValue(a));
      setNotifications(sortedList.map(mapNotification));
    } catch (err) {
      setError(err.message || 'No fue posible cargar las notificaciones.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  useEffect(() => {
    let mounted = true;

    getUserProfile()
      .then((profile) => {
        if (mounted) setProfileRole(profile?.nameRole || '');
      })
      .catch(() => {
        if (mounted) setProfileRole('');
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleNotificationCreated = () => {
    setCreateModalVisible(false);
    setNotificationRefreshKey((current) => current + 1);
    loadNotifications({ refresh: true });
  };

  const openDetail = async (item) => {
    setSelected(item.id);

    if (!item.unread) {
      navigation.navigate('NotificationDetail', { item });
      return;
    }

    const readItem = { ...item, unread: false };
    setNotifications((current) =>
      current.map((notification) => (
        notification.id === item.id ? readItem : notification
      ))
    );
    setNotificationRefreshKey((current) => current + 1);
    navigation.navigate('NotificationDetail', { item: readItem });

    try {
      await markNotificationAsRead(item.id);
      setNotificationRefreshKey((current) => current + 1);
    } catch {
      setNotifications((current) =>
        current.map((notification) => (
          notification.id === item.id ? item : notification
        ))
      );
      setNotificationRefreshKey((current) => current + 1);
    }
  };

  return (
    <WebFrame>
      <View style={styles.root}>
        <CarnetTopbar navigation={navigation} notificationRefreshKey={notificationRefreshKey} />

        <View style={styles.contentFrame}>
          {!isMobile && <UserSidebar navigation={navigation} activeKey="Notifications" />}

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.mainArea}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: px }]}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadNotifications({ refresh: true })}
              tintColor="#079B72"
              colors={['#079B72']}
            />
          }
        >
          {isMobile && <UserSidebar navigation={navigation} activeKey="Notifications" />}
        <View style={[styles.hero, isDesktop && styles.heroDesktop]}>
          <View style={styles.heroCopy}>
            <Text style={styles.eyebrow}>Centro de notificaciones</Text>
            <Text style={[styles.title, { fontSize: isDesktop ? 22 : isMobile ? 18 : 20 }]}>
              Mantente al dia con MyAccess
            </Text>
            <Text style={styles.subtitle}>
              Revisa alertas academicas, novedades del carnet y comunicados institucionales en un solo lugar.
            </Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{unreadCount}</Text>
            <Text style={styles.summaryLabel}>notificaciones nuevas</Text>
          </View>
        </View>

          <View style={[styles.contentGrid, isDesktop && styles.contentGridDesktop]}>
            <View style={styles.listPanel}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recientes</Text>
                <View style={styles.sectionActions}>
                  <Text style={styles.sectionHint}>{notifications.length} mensajes</Text>
                  {canCreateNotifications ? (
                    <TouchableOpacity
                      style={styles.createButton}
                      onPress={() => setCreateModalVisible(true)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.createButtonText}>Crear</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>

              {loading ? (
                <View style={styles.stateBox}>
                  <ActivityIndicator color="#079B72" />
                  <Text style={styles.stateText}>Cargando notificaciones...</Text>
                </View>
              ) : null}

              {!loading && error ? (
                <View style={styles.stateBox}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={loadNotifications}>
                    <Text style={styles.retryText}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {!loading && !error && notifications.length === 0 ? (
                <View style={styles.stateBox}>
                  <Text style={styles.stateText}>No tienes notificaciones por ahora.</Text>
                </View>
              ) : null}

              {!loading && !error ? notifications.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.notificationCard, selected === item.id && styles.notificationCardOpen]}
                  activeOpacity={0.85}
                  onPress={() => openDetail(item)}
                >
                  <View style={[styles.iconBubble, item.unread && styles.iconBubbleUnread]}>
                    <Text style={styles.iconText}>{item.unread ? '!' : 'i'}</Text>
                  </View>

                  <View style={styles.notificationBody}>
                    <View style={styles.notificationTop}>
                      <Text style={styles.badge}>{item.type}</Text>
                      <Text style={styles.time}>{item.time}</Text>
                    </View>
                    <Text style={styles.notificationTitle}>{item.title}</Text>
                    <Text style={styles.notificationMessage}>{item.message}</Text>
                  </View>
                </TouchableOpacity>
              )) : null}
            </View>
          </View>
        </ScrollView>
      </View>
      <CreateNotificationModal
        visible={createModalVisible}
        onClose={() => setCreateModalVisible(false)}
        onCreated={handleNotificationCreated}
      />
    </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  root: { 
    flex: 1, 
    backgroundColor: '#F0F9F6' 
  },
  contentFrame: { 
    flex: 1, 
    flexDirection: 'row' 
  },
  mainArea: { 
    flex: 1
   },
  scroll: { 
    flexGrow: 1, 
    paddingTop: 16, 
    paddingBottom: 28 
  },
  hero: {
    backgroundColor: '#079B72',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    overflow: 'hidden',
  },
  heroDesktop: {
    minHeight: 120,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  heroCopy: { flex: 1 },
  eyebrow: {
    color: '#CFFBE8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: { 
    color: '#FFFFFF', 
    fontWeight: '800', 
    letterSpacing: -0.4, 
    lineHeight: 28 
  },
  subtitle: { 
    color: '#E7FFF5', 
    fontSize: 12, 
    fontWeight: '600', 
    lineHeight: 18, 
    marginTop: 6, 
    maxWidth: 640 
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    minWidth: 130,
    alignItems: 'center',
    shadowColor: '#004C37',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 4,
  },
  summaryNumber: { 
    color: '#079B72', 
    fontSize: 24, 
    fontWeight: '900' 
  },
  summaryLabel: { 
    color: '#6B7280', 
    fontSize: 11, 
    fontWeight: '800', 
    textAlign: 'center', 
    textTransform: 'uppercase' 
  },
  contentGrid: { 
    gap: 12, 
    marginTop: 14 
  },
  contentGridDesktop: { 
    flexDirection: 'row', 
    alignItems: 'flex-start' 
  },
  listPanel: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 18, 
    padding: 14 
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    gap: 10,
    marginBottom: 14 
  },
  sectionTitle: { 
    color: '#1F2937', 
    fontSize: 16, 
    fontWeight: '800' 
  },
  sectionHint: { 
    color: '#9CA3AF', 
    fontSize: 12, 
    fontWeight: '700' 
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  createButton: {
    minHeight: 34,
    borderRadius: 10,
    backgroundColor: '#24C565',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  notificationCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#F8FFFC',
    borderWidth: 1,
    borderColor: '#DDF7EC',
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  notificationCardOpen: {
    borderColor: '#24C565',
    backgroundColor: '#F0FFF8',
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBubbleUnread: { backgroundColor: '#24C565' },
  iconText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  notificationBody: { flex: 1 },
  notificationTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  badge: {
    color: '#0F766E',
    backgroundColor: '#E8FFF5',
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 4,
    fontSize: 11,
    fontWeight: '800',
  },
  time: { color: '#9CA3AF', fontSize: 11, fontWeight: '700' },
  notificationTitle: { color: '#1F2937', fontSize: 14, fontWeight: '800', marginTop: 6 },
  notificationMessage: { color: '#6B7280', fontSize: 13, lineHeight: 20, marginTop: 5 },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
  },
  stateText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  errorText: {
    color: '#D14343',
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#079B72',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  
});
