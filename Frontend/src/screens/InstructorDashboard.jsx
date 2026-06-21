import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from 'react-native';
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

  const userName    = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  useFocusEffect(
    useCallback(() => {
    let mounted = true;

    async function loadDashboardData() {
      try {
        const [currentProfile, allUsers, allRequests] = await Promise.all([
          getUserProfile(),
          getAllUserProfiles(),
          getAllRequestCards(),
        ]);

        if (!mounted) return;

        const registeredFichas = new Set(
          (Array.isArray(allUsers) ? allUsers : [])
            .filter((user) => normalizeRole(user?.nameRole) === ROLES.APRENDIZ)
            .map((user) => String(user.ficha || user.Ficha || '').trim())
            .filter(Boolean)
        );

        setProfile(currentProfile);
        setFichasCount(registeredFichas.size);
        setRequests(Array.isArray(allRequests) ? allRequests : []);
      } catch {
        if (!mounted) return;
        setProfile(null);
        setFichasCount(0);
      }
    }

    loadDashboardData();

    return () => {
      mounted = false;
    };
  }, [])
  );

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
              <Text style={styles.pageTitle}>Área de instructor</Text>
              <Text style={styles.pageSubtitle}>Seleccione sus fichas, revise solicitudes o consulte el carnet digital.</Text>
            </View>

            <View style={styles.row}>
              <StatCard title="Fichas"      value={String(fichasCount)} />
              <StatCard title="Solicitudes" value={String(requests.length)} />
              <StatCard title="Validados"   value={String(requests.filter(r => r.state?.toLowerCase() === 'validado').length)} />
              <StatCard title="Impresos"    value={String(requests.filter(r => r.state?.toLowerCase() === 'impreso').length)} />
            </View>

            {(() => {
              const isGroupDirector = profile?.nameRole === 'DIRECTOR_DE_GRUPO' || profile?.nameRole === 'DIRECTOR' || String(profile?.nameRole).toLowerCase().includes('director');
              const assignedFichas = profile?.ficha ? [String(profile.ficha).trim()] : ['3144615'];
              return isGroupDirector ? (
                <View style={styles.assignedSection}>
                  <Text style={styles.assignedTitle}>Mis Fichas Asignadas</Text>
                  <View style={styles.assignedGrid}>
                    {assignedFichas.map((ficha) => (
                      <TouchableOpacity
                        key={ficha}
                        style={styles.assignedCard}
                        onPress={() => navigation.navigate('Fichas', { selectedFicha: ficha })}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.assignedCardText}>Ficha: {ficha}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ) : null;
            })()}

            <View style={styles.actions}>
              {[
                { title: 'Ver fichas',          text: 'Gestionar grupos y programas activos.',                          route: 'Fichas' },
                { title: 'Ver solicitudes',      text: 'Revisar estados de impresión de carnets.',                      route: 'Solicitudes' },
                { title: 'Ver carnet digital',   text: 'Abrir la misma estructura de carnet que ve el aprendiz.',       route: 'Carnet' },
                { title: 'Crear notificación',   text: 'Enviar un aviso a un usuario o dejarlo registrado en gestión.', route: null },
                ...(normalizeRole(profile?.nameRole) === ROLES.ADMIN ? [
                  { title: 'Crear Carnet Instructor', text: 'Generar carnet digital exclusivo para instructores.', route: 'CreateInstructorCard' }
                ] : []),
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
  screen:        { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame:  { flex: 1, flexDirection: 'row' },
  mainArea:      { flex: 1 },
  mainScroll:    { flexGrow: 1, paddingTop: 6, paddingBottom: 16 },
  headerBlock:   { marginBottom: 10 },
  pageTitle:     { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle:  { maxWidth: 430, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row:           { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  actions:       { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 15 },
  actionButton:  { flexBasis: 240, flexGrow: 1, backgroundColor: '#FFFFFF', borderColor: '#DDF7EC', borderRadius: 10, borderWidth: 1, padding: 16 },
  actionTitle:   { color: '#079B72', fontSize: 16, fontWeight: '900', marginBottom: 6 },
  actionText:    { color: '#6B7280', fontSize: 13, fontWeight: '700' },
  assignedSection: { marginTop: 15, marginBottom: 5 },
  assignedTitle: { fontSize: 11, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', marginBottom: 8, letterSpacing: 0.3 },
  assignedGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  assignedCard: { flexBasis: 140, flexGrow: 1, backgroundColor: '#FFFFFF', borderColor: '#DDF7EC', borderRadius: 10, borderWidth: 1, padding: 14, alignItems: 'center', justifyContent: 'center' },
  assignedCardText: { color: '#079B72', fontSize: 15, fontWeight: '900' },
});