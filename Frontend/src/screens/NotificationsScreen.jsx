import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import UserSidebar from '../components/UserSidebar.jsx';
import WebFrame from '../components/WebFrame.jsx';

const notifications = [
  {
    id: 'class-update',
    type: 'Academico',
    title: 'Actualizacion de ficha',
    message: 'Tu ficha tiene una novedad academica pendiente por revisar.',
    time: 'Hace 10 min',
    unread: true,
  },
  {
    id: 'card-ready',
    type: 'Carnet',
    title: 'Carnet digital disponible',
    message: 'Ya puedes consultar y presentar tu carnet institucional desde MyAccess.',
    time: 'Hoy',
    unread: true,
  },
  {
    id: 'profile',
    type: 'Perfil',
    title: 'Datos personales',
    message: 'Recuerda mantener tu informacion actualizada para evitar novedades de acceso.',
    time: 'Ayer',
    unread: false,
  },
  {
    id: 'center-news',
    type: 'Centro',
    title: 'Comunicado institucional',
    message: 'Consulta las ultimas novedades del Centro de Comercio y Turismo.',
    time: 'Esta semana',
    unread: false,
  },
];

export default function NotificationsScreen({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 900;
  const isDesktop = width >= 900;
  const px = isDesktop ? 24 : isTablet ? 16 : 10;
  const unreadCount = notifications.filter((item) => item.unread).length;
  const [selected, setSelected] = useState(null);

  const openDetail = (item) => navigation.navigate('NotificationDetail', { item });

  return (
    <WebFrame>
      <View style={styles.root}>
        <CarnetTopbar navigation={navigation} />

        <View style={styles.contentFrame}>
          {!isMobile && <UserSidebar navigation={navigation} activeKey="Notifications" />}

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.mainArea}
          contentContainerStyle={[styles.scroll, { paddingHorizontal: px }]}
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
                <Text style={styles.sectionHint}>{notifications.length} mensajes</Text>
              </View>

              {notifications.map((item) => (
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
              ))}
            </View>

            <View style={[styles.sidePanel, isDesktop && styles.sidePanelDesktop]}>
              <Text style={styles.sideTitle}>Estado</Text>
              <Text style={styles.sideText}>
                Tus avisos importantes apareceran aqui para que no tengas que buscarlos en distintos modulos.
              </Text>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.backButtonText}>Volver al inicio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F0F9F6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainArea: { flex: 1 },
  scroll: { flexGrow: 1, paddingTop: 16, paddingBottom: 28 },
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
  title: { color: '#FFFFFF', fontWeight: '800', letterSpacing: -0.4, lineHeight: 28 },
  subtitle: { color: '#E7FFF5', fontSize: 12, fontWeight: '600', lineHeight: 18, marginTop: 6, maxWidth: 640 },
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
  summaryNumber: { color: '#079B72', fontSize: 24, fontWeight: '900' },
  summaryLabel: { color: '#6B7280', fontSize: 11, fontWeight: '800', textAlign: 'center', textTransform: 'uppercase' },
  contentGrid: { gap: 12, marginTop: 14 },
  contentGridDesktop: { flexDirection: 'row', alignItems: 'flex-start' },
  listPanel: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 18, padding: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  sectionTitle: { color: '#1F2937', fontSize: 16, fontWeight: '800' },
  sectionHint: { color: '#9CA3AF', fontSize: 12, fontWeight: '700' },
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
  sidePanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    width: '100%',
    maxWidth: 260,
  },
  sidePanelDesktop: { width: 260 },
  sideTitle: { color: '#1F2937', fontSize: 18, fontWeight: '800', marginBottom: 10 },
  sideText: { color: '#6B7280', fontSize: 13, lineHeight: 21 },
  notificationCardOpen: { borderColor: '#079B72', backgroundColor: '#EDFFF7' },
  notificationDetail: { marginTop: 10, padding: 10, backgroundColor: '#F0FFF8', borderRadius: 10 },
  notificationDetailText: { color: '#374151', fontSize: 13, lineHeight: 20 },
  backButton: {
    height: 44,
    borderRadius: 12,
    backgroundColor: '#24C565',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  backButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
});
