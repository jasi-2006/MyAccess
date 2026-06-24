import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import StatCard from '../components/StatCard.jsx';
import CreateNotificationModal from '../components/CreateNotificationModal.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getAllUserProfiles, getUserProfile } from '../services/authService';
import { getAllRequestCards } from '../services/requestCardService';
import { normalizeRole, ROLES } from '../utils/accessControl';

export default function InstructorDashboard({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);
  const [fichasCount, setFichasCount] = useState(0);
  const [requests, setRequests] = useState([]);
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);
  const [redirecting, setRedirecting] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      async function loadData() {
        try {
          const [currentProfile, allUsers, allRequests] = await Promise.all([
            getUserProfile(),
            getAllUserProfiles(),
            getAllRequestCards(),
          ]);

          if (!mounted) return;

          const role = normalizeRole(currentProfile?.nameRole);

          if (role === ROLES.INSTRUCTOR) {
            navigation.replace('Fichas');
            return;
          }

          const registeredFichas = new Set(
            (Array.isArray(allUsers) ? allUsers : [])
              .filter((u) => normalizeRole(u?.nameRole) === ROLES.APRENDIZ)
              .map((u) => String(u.ficha || u.Ficha || '').trim())
              .filter(Boolean)
          );

          setProfile(currentProfile);
          setFichasCount(registeredFichas.size);
          setRequests(Array.isArray(allRequests) ? allRequests : []);
          setRedirecting(false);
        } catch {
          if (mounted) navigation.replace('Home');
        }
      }

      loadData();
      return () => { mounted = false; };
    }, [])
  );

  if (redirecting) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#079B72" size="large" />
      </View>
    );
  }

  const userName = (profile?.fullName || profile?.full_name)?.trim() || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        <View style={styles.contentFrame}>
          {!isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Instructor" />}
          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Instructor" />}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Panel de administración</Text>
              <Text style={styles.pageSubtitle}>Gestiona fichas, solicitudes, carnet y notificaciones.</Text>
            </View>

            <View style={styles.row}>
              <StatCard title="Fichas"      value={String(fichasCount)} />
              <StatCard title="Solicitudes" value={String(requests.length)} />
              <StatCard title="Validados"   value={String(requests.filter(r => r.state?.toLowerCase() === 'validado').length)} />
              <StatCard title="Impresos"    value={String(requests.filter(r => r.state?.toLowerCase() === 'impreso').length)} />
            </View>

            <View style={styles.actions}>
              {[
                { title: 'Instructores',      text: 'Ver y gestionar carnet de instructores.',               route: 'Instructores' },
                { title: 'Fichas',             text: 'Gestionar grupos y aprendices por ficha.',             route: 'Fichas' },
                { title: 'Solicitudes',        text: 'Revisar y gestionar solicitudes de carnet.',          route: 'Solicitudes' },
                { title: 'Historial',          text: 'Consultar el historial completo de solicitudes.',      route: 'Historial' },
                { title: 'Imprimir carnet',   text: 'Imprimir carnet físicos de aprendices.',             route: 'Imprimir' },
                { title: 'Crear notificación', text: 'Enviar avisos a usuarios del sistema.',               route: null },
                { title: 'Carnet instructor',  text: 'Generar carnet digital exclusivo para instructores.', route: 'CreateInstructorCard' },
              ].map((a) => (
                <TouchableOpacity
                  key={a.title}
                  style={styles.actionButton}
                  onPress={() => a.route ? navigation.navigate(a.route) : setNotificationModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.actionTitle}>{a.title}</Text>
                  <Text style={styles.actionText}>{a.text}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>

      <CreateNotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  center:       { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAE6E6' },
  screen:       { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainArea:     { flex: 1 },
  mainScroll:   { flexGrow: 1, paddingTop: 6, paddingBottom: 16 },
  headerBlock:  { marginBottom: 10 },
  pageTitle:    { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle: { maxWidth: 430, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actions:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 15 },
  actionButton: { flexBasis: 240, flexGrow: 1, backgroundColor: '#FFFFFF', borderColor: '#DDF7EC', borderRadius: 10, borderWidth: 1, padding: 16 },
  actionTitle:  { color: '#079B72', fontSize: 15, fontWeight: '900', marginBottom: 6 },
  actionText:   { color: '#6B7280', fontSize: 12, fontWeight: '600' },
});
