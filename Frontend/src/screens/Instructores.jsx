import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity,
  ActivityIndicator, TextInput, useWindowDimensions,
} from 'react-native';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import StatCard from '../components/StatCard.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getAllUserProfiles, getUserProfile } from '../services/authService';
import { getAllCards, createCard, updateCardActiveState } from '../services/cardService';
import { normalizeRole, ROLES } from '../utils/accessControl';

export default function InstructoresScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);
  const [instructors, setInstructors] = useState([]);
  const [cardsByUser, setCardsByUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const userName = (profile?.fullName || profile?.full_name)?.trim() || 'Admin';
  const userInitial = userName.charAt(0).toUpperCase();

  const activeCount = instructors.filter((i) => cardsByUser[i.id]?.active ?? true).length;
  const inactiveCount = instructors.filter((i) => cardsByUser[i.id] && !(cardsByUser[i.id]?.active ?? true)).length;
  const noCardCount = instructors.filter((i) => !cardsByUser[i.id]).length;

  const filtered = instructors.filter((i) => {
    const q = search.toLowerCase();
    return (
      !q ||
      (i.fullName || '').toLowerCase().includes(q) ||
      (i.document || '').includes(q) ||
      (i.email || '').toLowerCase().includes(q) ||
      String(i.ficha || '').includes(q)
    );
  });

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [me, allUsers, allCards] = await Promise.all([
          getUserProfile(),
          getAllUserProfiles(),
          getAllCards(),
        ]);
        if (!mounted) return;

        const instructorList = (Array.isArray(allUsers) ? allUsers : []).filter(
          (u) => normalizeRole(u?.nameRole) === ROLES.INSTRUCTOR
        );

        const cardMap = {};
        (Array.isArray(allCards) ? allCards : []).forEach((c) => {
          if (c?.idUser && !cardMap[c.idUser]) cardMap[c.idUser] = c;
        });

        setProfile(me);
        setInstructors(instructorList);
        setCardsByUser(cardMap);
      } catch {
        if (mounted) setError('No fue posible cargar los instructores.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  const buildPayload = (instructor, active) => ({
    idUser: instructor.id,
    photoUrl: instructor.photoUrl || null,
    validPhoto: Boolean(instructor.photoUrl),
    digitalState: active ? 'activo' : 'inactivo',
    physicalState: 'no solicitado',
    active,
    reprints: 0,
  });

  const handleToggle = async (instructor, nextValue) => {
    if (updatingId) return;
    const card = cardsByUser[instructor.id];
    setUpdatingId(instructor.id);
    setError('');

    // Optimistic update
    setCardsByUser((prev) => ({
      ...prev,
      [instructor.id]: { ...(card || buildPayload(instructor, nextValue)), active: nextValue },
    }));

    try {
      const updated = card?.idCard
        ? await updateCardActiveState(card.idCard, nextValue)
        : await createCard(buildPayload(instructor, nextValue));
      setCardsByUser((prev) => ({ ...prev, [updated.idUser]: updated }));
    } catch {
      // Revert
      setCardsByUser((prev) => ({
        ...prev,
        [instructor.id]: card || null,
      }));
      setError('No fue posible actualizar el carnet.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        <View style={styles.contentFrame}>
          {!isMobile && (
            <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Instructores" />
          )}
          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && (
              <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Instructores" />
            )}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Instructores</Text>
              <Text style={styles.pageSubtitle}>
                Consulta y gestiona el estado del carnet de cada instructor registrado.
              </Text>
            </View>

            <View style={styles.row}>
              <StatCard title="Total"     value={String(instructors.length)} />
              <StatCard title="Activos"   value={String(activeCount)} />
              <StatCard title="Inactivos" value={String(inactiveCount)} color="#DC2626" />
              <StatCard title="Sin carnet" value={String(noCardCount)} color="#D97706" />
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <View style={styles.searchWrap}>
              <TextInput
                style={styles.searchInput}
                value={search}
                onChangeText={setSearch}
                placeholder="Buscar por nombre, documento, correo o ficha..."
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.table}>
              <Text style={styles.tableTitle}>
                {filtered.length} Instructor{filtered.length !== 1 ? 'es' : ''}
              </Text>

              {loading ? (
                <ActivityIndicator color="#079B72" style={styles.loader} />
              ) : filtered.length === 0 ? (
                <Text style={styles.emptyText}>No hay instructores que coincidan.</Text>
              ) : (
                filtered.map((instructor) => {
                  const card = cardsByUser[instructor.id];
                  const isActive = card?.active ?? true;
                  const disabled = updatingId === instructor.id;

                  const fichas = String(instructor.ficha || instructor.Ficha || '-')
                    .split(',').map((f) => f.trim()).filter(Boolean);

                  return (
                    <View key={instructor.id} style={styles.row2}>
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>
                          {(instructor.fullName || 'I').charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <View style={styles.info}>
                        <Text style={styles.name} numberOfLines={1}>
                          {instructor.fullName || 'Sin nombre'}
                        </Text>
                        <Text style={styles.meta} numberOfLines={1}>
                          {instructor.typeDocument || 'Doc'} {instructor.document || '-'} · {instructor.email || '-'}
                        </Text>
                        <View style={styles.fichaRow}>
                          {fichas.map((f) => (
                            <View key={f} style={styles.fichaChip}>
                              <Text style={styles.fichaChipText}>#{f}</Text>
                            </View>
                          ))}
                        </View>
                        <Text style={[
                          styles.cardStatus,
                          !card ? styles.noCard : isActive ? styles.activeText : styles.inactiveText,
                        ]}>
                          {!card ? 'Sin carnet' : isActive ? 'Carnet activo' : 'Carnet inactivo'}
                        </Text>
                      </View>

                      <View style={styles.switchWrap}>
                        {disabled
                          ? <ActivityIndicator size="small" color="#079B72" />
                          : (
                            <Switch
                              value={isActive}
                              onValueChange={(v) => handleToggle(instructor, v)}
                              disabled={disabled}
                              trackColor={{ false: '#F3B8B5', true: '#A7E3C1' }}
                              thumbColor={isActive ? '#087C4A' : '#B42318'}
                            />
                          )
                        }
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainArea:     { flex: 1 },
  mainScroll:   { flexGrow: 1, paddingTop: 6, paddingBottom: 16 },
  headerBlock:  { marginBottom: 10 },
  pageTitle:    { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle: { maxWidth: 430, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row:          { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  errorText:    { marginTop: 8, color: '#B42318', fontSize: 12, fontWeight: '800' },
  loader:       { marginVertical: 20 },
  searchWrap:   { marginTop: 14, marginBottom: 4 },
  searchInput:  {
    height: 40, backgroundColor: '#FFFFFF', borderRadius: 10,
    borderWidth: 1, borderColor: '#D1FAE5',
    paddingHorizontal: 14, fontSize: 12, color: '#1F2937',
  },
  table: {
    backgroundColor: '#FFFFFF', marginTop: 10,
    borderRadius: 10, borderWidth: 1, borderColor: '#DDF7EC', overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 12, fontWeight: '800', color: '#1F2937',
    padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6',
  },
  emptyText: { color: '#9CA3AF', fontSize: 12, padding: 16, textAlign: 'center' },
  row2: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 12, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12,
  },
  avatarCircle: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#E6DDD7', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarText:   { color: '#8B6D58', fontWeight: '800', fontSize: 16 },
  info:         { flex: 1, minWidth: 0 },
  name:         { fontSize: 13, fontWeight: '800', color: '#1F2937' },
  meta:         { fontSize: 11, color: '#6B7280', fontWeight: '600', marginTop: 2 },
  fichaRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  fichaChip:    {
    paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20,
    backgroundColor: '#E8FFF5', borderWidth: 1, borderColor: '#2FD16A',
  },
  fichaChipText: { fontSize: 10, fontWeight: '700', color: '#087C4A' },
  cardStatus:   { fontSize: 11, fontWeight: '800', marginTop: 3 },
  activeText:   { color: '#087C4A' },
  inactiveText: { color: '#B42318' },
  noCard:       { color: '#D97706' },
  switchWrap:   { width: 52, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
});
