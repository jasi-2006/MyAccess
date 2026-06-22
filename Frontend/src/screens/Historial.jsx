import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, useWindowDimensions,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';

import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import StatCard from '../components/StatCard.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getUserProfile, getAllUserProfiles } from '../services/authService';
import { getAllRequestCards, createRequestCard, updateRequestCard } from '../services/requestCardService';
import { resolveUserRole, normalizeRole, ROLES } from '../utils/accessControl';

const STATE_COLORS = {
  pendiente: { bg: '#FFF7ED', text: '#D97706' },
  validado: { bg: '#ECFDF5', text: '#059669' },
  impreso: { bg: '#EFF6FF', text: '#2563EB' },
  rechazado: { bg: '#FEF2F2', text: '#DC2626' },
};

const FILTERS = ['Todos', 'Pendiente', 'Validado', 'Impreso', 'Rechazado'];

function Badge({ state }) {
  const normalizedState = state?.toLowerCase();
  const colors = STATE_COLORS[normalizedState] || { bg: '#F3F4F6', text: '#6B7280' };

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }]}>
      <Text style={[styles.badgeText, { color: colors.text }]} numberOfLines={1}>
        {state || '-'}
      </Text>
    </View>
  );
}

export default function HistorialScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [requesting, setRequesting] = useState(false);
  const [requestMsg, setRequestMsg] = useState('');

  const userName = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();
  const isAdmin = profile?.nameRole === 'Administrador' || resolveUserRole(profile) === ROLES.ADMIN;
  const isInstructor = resolveUserRole(profile) === ROLES.INSTRUCTOR;

  useEffect(() => {
    getUserProfile().then(setProfile).catch(() => setProfile(null));
    getAllRequestCards()
      .then(setRequests)
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSolicitarImpresion = async () => {
    if (requesting) return;
    setRequesting(true);
    setRequestMsg('');
    try {
      const [allUsers, allRequests] = await Promise.all([
        getAllUserProfiles(),
        getAllRequestCards().catch(() => []),
      ]);

      const instructorFicha = String(profile?.ficha || profile?.Ficha || '').trim();
      const aprendices = (Array.isArray(allUsers) ? allUsers : []).filter(
        (u) => normalizeRole(u?.nameRole) === ROLES.APRENDIZ &&
          String(u?.ficha || u?.Ficha || '').trim() === instructorFicha
      );

      if (!aprendices.length) {
        setRequestMsg('No se encontraron aprendices en tu ficha asignada.');
        return;
      }

      await Promise.all(
        aprendices.map((learner) => {
          const existing = (Array.isArray(allRequests) ? allRequests : []).find(
            (r) => r.idUser === learner.id
          );
          const payload = {
            idUser: learner.id,
            requestTipe: 'impresion_colectiva',
            cardTipe: 'fisico',
            state: 'pendiente',
            approbedBy: null,
            printedBy: null,
          };
          return existing?.idRequest
            ? updateRequestCard(existing.idRequest, { ...existing, state: 'pendiente' })
            : createRequestCard(payload);
        })
      );

      setRequestMsg(`Solicitud enviada para ${aprendices.length} aprendices de la ficha #${instructorFicha}.`);
      const updated = await getAllRequestCards().catch(() => requests);
      setRequests(updated);
    } catch {
      setRequestMsg('Error al enviar la solicitud de impresiÃ³n.');
    } finally {
      setRequesting(false);
    }
  };

  const count = (state) =>
    requests.filter((request) => request.state?.toLowerCase() === state.toLowerCase()).length;

  const filtered = filter === 'Todos'
    ? requests
    : requests.filter((request) => request.state?.toLowerCase() === filter.toLowerCase());

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        <View style={styles.contentFrame}>
          {!isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Historial" />}
          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Historial" />}

            <View style={styles.headerBlock}>
              <View style={styles.headerText}>
                <Text style={styles.pageTitle}>Historial de solicitudes</Text>
                <Text style={styles.pageSubtitle}>Consulta el historial completo de solicitudes de carnet.</Text>
              </View>
              {isAdmin && (
                <TouchableOpacity
                  style={styles.headerPrintBtn}
                  onPress={() => navigation.navigate('Imprimir')}
                >
                  <Text style={styles.headerPrintBtnText}>Imprimir carnets</Text>
                </TouchableOpacity>
              )}
              {isInstructor && (
                <TouchableOpacity
                  style={[styles.headerPrintBtn, requesting && styles.headerPrintBtnDisabled]}
                  onPress={handleSolicitarImpresion}
                  disabled={requesting}
                >
                  <Text style={styles.headerPrintBtnText}>
                    {requesting ? 'Enviando...' : 'Solicitar impresiÃ³n'}
                  </Text>
                </TouchableOpacity>
              )}
              {!!requestMsg && <Text style={styles.requestMsg}>{requestMsg}</Text>}
            </View>

            <View style={styles.row}>
              <StatCard title="Total" value={String(requests.length)} />
              <StatCard title="Pendientes" value={String(count('Pendiente'))} />
              <StatCard title="Validados" value={String(count('Validado'))} />
              <StatCard title="Impresos" value={String(count('Impreso'))} />
              <StatCard title="Rechazados" value={String(count('Rechazado'))} color="#DC2626" />
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterRow}
              contentContainerStyle={styles.filterContent}
            >
              {FILTERS.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.filterBtn, filter === item && styles.filterBtnActive]}
                  onPress={() => setFilter(item)}
                >
                  <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>
                    {item.charAt(0).toUpperCase() + item.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.tableCard}>
              <Text style={styles.tableTitle}>
                {filtered.length} Registro{filtered.length !== 1 ? 's' : ''}
              </Text>

              {loading ? (
                <ActivityIndicator color="#079B72" style={styles.loader} />
              ) : filtered.length === 0 ? (
                <Text style={styles.emptyText}>No hay registros para mostrar.</Text>
              ) : isMobile ? (
                <View style={styles.mobileList}>
                  {filtered.map((request) => (
                    <View key={request.idRequest} style={styles.mobileCard}>
                      <View style={styles.mobileCardHeader}>
                        <Text style={styles.mobileId}>Solicitud #{request.idRequest}</Text>
                        <Badge state={request.state} />
                      </View>
                      <View style={styles.mobileCardRow}>
                        <Text style={styles.mobileLabel}>Usuario</Text>
                        <Text style={styles.mobileValue}>{request.idUser || '-'}</Text>
                      </View>
                      <View style={styles.mobileCardRow}>
                        <Text style={styles.mobileLabel}>Solicitud</Text>
                        <Text style={styles.mobileValue}>{request.requestTipe || '-'}</Text>
                      </View>
                      <View style={styles.mobileCardRow}>
                        <Text style={styles.mobileLabel}>Carnet digital</Text>
                        <Text style={styles.mobileValue}>{request.cardTipe || '-'}</Text>
                      </View>
                      {isAdmin && (
                        <TouchableOpacity
                          style={styles.mobilePrintBtn}
                          onPress={() => navigation.navigate('Imprimir')}
                        >
                          <Text style={styles.printBtnText}>Imprimir</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator style={styles.tableScroll}>
                  <View style={styles.tableContent}>
                    <View style={[styles.tableRow, styles.tableHeader]}>
                      <Text style={[styles.cell, styles.cellHeader, styles.cellIndex]}>#</Text>
                      <Text style={[styles.cell, styles.cellHeader, styles.cellUser]}>Usuario</Text>
                      <Text style={[styles.cell, styles.cellHeader]}>Tipo solicitud</Text>
                      <Text style={[styles.cell, styles.cellHeader]}>Tipo carnet</Text>
                      <Text style={[styles.cell, styles.cellHeader]}>Estado</Text>
                      <Text style={[styles.cell, styles.cellHeader]}>Aprobado por</Text>
                      <Text style={[styles.cell, styles.cellHeader]}>Impreso por</Text>
                      {isAdmin && <Text style={[styles.cell, styles.cellHeader, styles.cellAction]}>Accion</Text>}
                    </View>

                    {filtered.map((request, index) => (
                      <View key={request.idRequest} style={[styles.tableRow, index % 2 === 0 && styles.rowEven]}>
                        <Text style={[styles.cell, styles.cellIndex]}>{index + 1}</Text>
                        <Text style={[styles.cell, styles.cellUser]} numberOfLines={1}>{request.idUser || '-'}</Text>
                        <Text style={styles.cell} numberOfLines={1}>{request.requestTipe || '-'}</Text>
                        <Text style={styles.cell} numberOfLines={1}>{request.cardTipe || '-'}</Text>
                        <View style={[styles.cell, styles.cellCenter]}>
                          <Badge state={request.state} />
                        </View>
                        <Text style={styles.cell} numberOfLines={1}>{request.approbedBy || '-'}</Text>
                        <Text style={styles.cell} numberOfLines={1}>{request.printedBy || '-'}</Text>
                        {isAdmin && (
                          <View style={[styles.cell, styles.cellAction, styles.cellCenter]}>
                            <TouchableOpacity
                              style={styles.printBtn}
                              onPress={() => navigation.navigate('Imprimir')}
                            >
                              <Text style={styles.printBtnText}>Imprimir</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
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
  mainScroll: { flexGrow: 1, paddingTop: 6, paddingBottom: 16 },
  headerBlock: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  headerText: { flex: 1, minWidth: 220 },
  pageTitle: { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle: { maxWidth: 430, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  headerPrintBtn: {
    backgroundColor: '#079B72',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  headerPrintBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },
  headerPrintBtnDisabled: { opacity: 0.55 },
  requestMsg: { fontSize: 11, color: '#059669', fontWeight: '700', marginTop: 4, flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterRow: { marginTop: 12, marginBottom: 4 },
  filterContent: { paddingRight: 4 },
  filterBtn: {
    width: 75,                  
    height: 60,                 
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    justifyContent: 'center',   
    alignItems: 'center',       
  },
  filterBtnActive: { backgroundColor: '#079B72', borderColor: '#079B72' },
  filterText: { 
    fontSize: 11, 
    color: '#374151', 
    fontWeight: '600',
    textAlign: 'center',        
  },
  filterTextActive: { color: '#FFFFFF' },
  tableCard: {
    backgroundColor: '#FFFFFF',
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1F2937',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tableScroll: { width: '100%' },
  tableContent: { minWidth: 700 },
  tableHeader: { backgroundColor: '#F9FAFB' },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 34,
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  rowEven: { backgroundColor: '#FAFAFA' },
  cell: { flex: 1, minWidth: 80, fontSize: 10, color: '#374151', paddingHorizontal: 4 },
  cellIndex: { flex: 0.35, minWidth: 30 },
  cellUser: { flex: 1.1, minWidth: 90 },
  cellAction: { flex: 0.7, minWidth: 70 },
  cellCenter: { justifyContent: 'center', alignItems: 'flex-start' },
  cellHeader: { fontWeight: '700', color: '#6B7280', fontSize: 10 },
  emptyText: { textAlign: 'center', color: '#9CA3AF', padding: 16, fontSize: 12 },
  loader: { marginTop: 16, marginBottom: 16 },
  badge: { maxWidth: 86, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
  badgeText: { fontSize: 9, fontWeight: '700' },
  printBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  printBtnText: { fontSize: 10, color: '#2563EB', fontWeight: '700' },
  mobileList: { padding: 10, gap: 10 },
  mobileCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEF2F7',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  mobileCardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  mobileId: { fontSize: 13, color: '#111827', fontWeight: '800', flex: 1 },
  mobileCardRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  mobileLabel: { fontSize: 11, color: '#6B7280', fontWeight: '700', width: 72 },
  mobileValue: { fontSize: 12, color: '#1F2937', flex: 1, fontWeight: '600' },
  mobilePrintBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 120,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 2,
  },
});

