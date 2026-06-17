import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import StatCard from '../components/StatCard.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getUserProfile, getAllUserProfiles } from '../services/authService';
import { getAllRequestCards, updateRequestCard } from '../services/requestCardService';

const STATES = ['pendiente', 'validado', 'impreso', 'rechazado'];

const STATE_COLORS = {
  pendiente: { bg: '#FFF7ED', text: '#D97706' },
  validado: { bg: '#ECFDF5', text: '#059669' },
  impreso: { bg: '#EFF6FF', text: '#2563EB' },
  rechazado: { bg: '#FEF2F2', text: '#DC2626' },
};

export default function SolicitudesScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [savingId, setSavingId] = useState(null);

  const userName = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      setLoading(true);

      Promise.all([getUserProfile(), getAllRequestCards(), getAllUserProfiles()])
        .then(([p, r, users]) => {
          if (!mounted) return;
          setProfile(p);
          setRequests(Array.isArray(r) ? r : []);
          const map = {};
          (Array.isArray(users) ? users : []).forEach((u) => {
            map[u.id] = u;
          });
          setUsersMap(map);
        })
        .catch(() => {})
        .finally(() => {
          if (mounted) setLoading(false);
        });

      return () => {
        mounted = false;
      };
    }, [])
  );

  // Periodically refresh the request list so new submissions appear without manual refresh
  useEffect(() => {
    const interval = setInterval(() => {
      getAllRequestCards()
        .then((r) => {
          if (Array.isArray(r)) setRequests(r);
        })
        .catch(() => {});
    }, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, []);

  const count = (state) => requests.filter((r) => r.state?.toLowerCase() === state).length;

  const handleChangeState = async (request, newState) => {
    setSavingId(request.idRequest);
    try {
      await updateRequestCard(request.idRequest, { ...request, state: newState });
      setRequests((prev) =>
        prev.map((r) => (r.idRequest === request.idRequest ? { ...r, state: newState } : r))
      );
    } catch {
      // silent
    } finally {
      setSavingId(null);
      setEditingId(null);
    }
  };

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        <View style={styles.contentFrame}>
          {!isMobile && (
            <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Solicitudes" />
          )}

          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[
              styles.mainScroll,
              { paddingHorizontal: pagePadding, minHeight: height - 60 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && (
              <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Solicitudes" />
            )}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Solicitudes de impresion</Text>
              <Text style={styles.pageSubtitle}>
                Revisa y gestiona las solicitudes de impresion de carnets.
              </Text>
            </View>

            <View style={styles.row}>
              <StatCard title="Total" value={String(requests.length)} />
              <StatCard title="Pendientes" value={String(count('pendiente'))} />
              <StatCard title="Validados" value={String(count('validado'))} />
              <StatCard title="Impresos" value={String(count('impreso'))} />
            </View>

            <View style={styles.tableWrap}>
              <View style={styles.table}>
                <Text style={styles.tableTitle}>
                  {requests.length} solicitud{requests.length !== 1 ? 'es' : ''}
                </Text>

                {loading ? (
                  <ActivityIndicator color="#079B72" style={{ marginTop: 12 }} />
                ) : requests.length === 0 ? (
                  <Text style={styles.emptyText}>No hay solicitudes registradas.</Text>
                ) : (
                  requests
                    .slice()
                    .reverse()
                    .map((r) => {
                      const stateColors =
                        STATE_COLORS[r.state?.toLowerCase()] || { bg: '#F3F4F6', text: '#6B7280' };
                      const user = usersMap[r.idUser];
                      const uName = user?.fullName || user?.full_name || `Usuario #${r.idUser}`;
                      const uDoc = user?.document
                        ? `${user.typeDocument || 'Doc'}: ${user.document}`
                        : '';
                      const uFicha = user?.ficha ? `Ficha: ${user.ficha}` : '';
                      const isEditing = editingId === r.idRequest;
                      const isSaving = savingId === r.idRequest;

                      return (
                        <View key={r.idRequest} style={styles.requestCard}>
                          <View style={styles.requestCardTop}>
                            <View style={styles.requestInfo}>
                              <Text style={styles.requestId}>Solicitud #{r.idRequest}</Text>
                              <Text style={styles.requestUser}>{uName}</Text>
                              {uDoc ? <Text style={styles.requestMeta}>{uDoc}</Text> : null}
                              {uFicha ? <Text style={styles.requestMeta}>{uFicha}</Text> : null}
                              <Text style={styles.requestMeta}>
                                {r.requestTipe} · {r.cardTipe}
                              </Text>
                              {r.registrationDate ? (
                                <Text style={styles.requestDate}>
                                  {new Date(r.registrationDate).toLocaleDateString('es-CO', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </Text>
                              ) : null}
                            </View>

                            <TouchableOpacity
                              style={[styles.badge, { backgroundColor: stateColors.bg }]}
                              onPress={() => setEditingId(isEditing ? null : r.idRequest)}
                            >
                              <Text style={[styles.badgeText, { color: stateColors.text }]}>
                                {r.state || '-'} ✎
                              </Text>
                            </TouchableOpacity>
                          </View>

                          {isEditing ? (
                            <View style={styles.stateSelector}>
                              <Text style={styles.stateSelectorLabel}>Cambiar estado:</Text>
                              <View style={styles.stateBtns}>
                                {STATES.map((s) => {
                                  const sc = STATE_COLORS[s];
                                  const isActive = r.state?.toLowerCase() === s;
                                  return (
                                    <TouchableOpacity
                                      key={s}
                                      style={[
                                        styles.stateBtn,
                                        { backgroundColor: sc.bg, borderColor: sc.text },
                                        isActive && styles.stateBtnActive,
                                      ]}
                                      onPress={() => handleChangeState(r, s)}
                                      disabled={isSaving || isActive}
                                    >
                                      {isSaving && isActive ? (
                                        <ActivityIndicator size="small" color={sc.text} />
                                      ) : (
                                        <Text style={[styles.stateBtnText, { color: sc.text }]}>{s}</Text>
                                      )}
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </View>
                          ) : null}
                        </View>
                      );
                    })
                )}
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainArea: { flex: 1 },
  mainScroll: { flexGrow: 1, paddingTop: 6, paddingBottom: 24 },
  headerBlock: { marginBottom: 10 },
  pageTitle: { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle: { maxWidth: 430, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tableWrap: { marginTop: 'auto', paddingTop: 12 },
  table: {
    backgroundColor: '#FFFFFF',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    gap: 10,
  },
  tableTitle: { color: '#1F2937', fontWeight: '900', marginBottom: 4, fontSize: 15 },
  emptyText: { color: '#9CA3AF', fontSize: 13, textAlign: 'center', paddingVertical: 16 },
  requestCard: { backgroundColor: '#F9FAFB', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  requestCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  requestInfo: { flex: 1, gap: 3 },
  requestId: { fontSize: 13, fontWeight: '900', color: '#111827' },
  requestUser: { fontSize: 13, fontWeight: '700', color: '#1F2937' },
  requestMeta: { fontSize: 11, color: '#6B7280' },
  requestDate: { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  badgeText: { fontSize: 11, fontWeight: '800' },
  stateSelector: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  stateSelectorLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginBottom: 8 },
  stateBtns: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stateBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5 },
  stateBtnActive: { opacity: 0.5 },
  stateBtnText: { fontSize: 12, fontWeight: '800' },
});
