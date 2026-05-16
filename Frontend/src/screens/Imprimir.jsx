import { useEffect, useState, Platform } from 'react';
import {
  View, Text, StyleSheet, ScrollView, useWindowDimensions,
  TouchableOpacity, Image, ActivityIndicator,
} from 'react-native';
import WebFrame from '../components/WebFrame.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import { getUserProfile, getAllUserProfiles } from '../services/authService';
import { getAllCards } from '../services/cardService';
import { normalizeRole, ROLES } from '../utils/accessControl';

export default function ImprimirScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile    = width < 768;
  const pagePadding = isMobile ? 10 : 18;

  const [profile,      setProfile]      = useState(null);
  const [learners,     setLearners]     = useState([]);
  const [cardsByUser,  setCardsByUser]  = useState({});
  const [fichas,       setFichas]       = useState([]);
  const [selectedFicha, setSelectedFicha] = useState('');
  const [loading,      setLoading]      = useState(true);

  const userName    = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [currentProfile, allUsers, allCards] = await Promise.all([
          getUserProfile(),
          getAllUserProfiles(),
          getAllCards(),
        ]);

        if (!mounted) return;

        /* Solo aprendices con ficha */
        const aprendices = (Array.isArray(allUsers) ? allUsers : []).filter(
          (u) => normalizeRole(u?.nameRole) === ROLES.APRENDIZ && (u?.ficha || u?.files)
        );

        /* Mapa idUser -> card */
        const cardMap = {};
        (Array.isArray(allCards) ? allCards : []).forEach((c) => {
          if (c?.idUser && !cardMap[c.idUser]) cardMap[c.idUser] = c;
        });

        /* Fichas únicas ordenadas */
        const fichaList = Array.from(
          new Set(aprendices.map((u) => String(u.ficha || u.files || '').trim()).filter(Boolean))
        ).sort();

        setProfile(currentProfile);
        setLearners(aprendices);
        setCardsByUser(cardMap);
        setFichas(fichaList);
        setSelectedFicha(fichaList[0] || '');
      } catch {
        /* silencioso */
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  /* Aprendices de la ficha seleccionada */
  const fichaLearners = learners.filter(
    (u) => String(u.ficha || u.files || '').trim() === selectedFicha
  );

  const handlePrint = () => {
    if (Platform.OS === 'web') window.print();
  };

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        <View style={styles.contentFrame}>
          {!isMobile && (
            <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Historial" />
          )}
          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && (
              <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Historial" />
            )}

            {/* Encabezado */}
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.pageTitle}>Imprimir carnets por ficha</Text>
                <Text style={styles.pageSubtitle}>
                  Selecciona una ficha y visualiza los carnets de sus aprendices.
                </Text>
              </View>
              <View style={styles.headerActions}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
                  <Text style={styles.backBtnText}>← Volver</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.printBtn} onPress={handlePrint}>
                  <Text style={styles.printBtnText}>🖨️ Imprimir página</Text>
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <ActivityIndicator color="#079B72" style={{ marginTop: 30 }} />
            ) : fichas.length === 0 ? (
              <Text style={styles.emptyText}>No hay fichas con aprendices registrados.</Text>
            ) : (
              <>
                {/* Tabs de fichas */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.fichaTabsRow}>
                  {fichas.map((f) => (
                    <TouchableOpacity
                      key={f}
                      style={[styles.fichaTab, selectedFicha === f && styles.fichaTabActive]}
                      onPress={() => setSelectedFicha(f)}
                    >
                      <Text style={[styles.fichaTabText, selectedFicha === f && styles.fichaTabTextActive]}>
                        #{f}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Info ficha */}
                <View style={styles.fichaInfo}>
                  <Text style={styles.fichaInfoTitle}>Ficha #{selectedFicha}</Text>
                  <Text style={styles.fichaInfoSub}>
                    {fichaLearners.length} aprendice{fichaLearners.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Grid de carnets */}
                <View style={styles.carnetGrid} id="print-area">
                  {fichaLearners.length === 0 ? (
                    <Text style={styles.emptyText}>No hay aprendices en esta ficha.</Text>
                  ) : (
                    fichaLearners.map((learner) => {
                      const card = cardsByUser[learner.id];
                      const name = learner.fullName || learner.full_name || `Aprendiz #${learner.id}`;
                      return (
                        <CarnetPreview key={learner.id} learner={learner} card={card} name={name} />
                      );
                    })
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </WebFrame>
  );
}

/* Componente de vista previa de un carnet individual */
function CarnetPreview({ learner, card, name }) {
  return (
    <View style={styles.carnetCard}>
      {/* Header */}
      <View style={styles.carnetHeader}>
        <View style={styles.carnetLogoBox}>
          <Text style={styles.carnetLogoText}>SENA</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.carnetInstitution}>Servicio Nacional de Aprendizaje</Text>
          <Text style={styles.carnetSubtitle}>MyAccess — Carnet Digital</Text>
        </View>
      </View>

      {/* Cuerpo */}
      <View style={styles.carnetBody}>
        {/* Foto */}
        <View style={styles.carnetPhotoBox}>
          {card?.photoUrl ? (
            <Image source={{ uri: card.photoUrl }} style={styles.carnetPhoto} />
          ) : (
            <View style={styles.carnetPhotoPlaceholder}>
              <Text style={styles.carnetPhotoInitial}>{name.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>

        {/* Datos */}
        <View style={styles.carnetData}>
          <Text style={styles.carnetName} numberOfLines={2}>{name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>APRENDIZ</Text>
          </View>
          <CarnetField label="Doc"      value={`${learner.typeDocument || ''} ${learner.document || '—'}`} />
          <CarnetField label="Programa" value={learner.trainingProgram || '—'} />
          <CarnetField label="Centro"   value={learner.trainingCenter  || '—'} />
          <CarnetField label="Regional" value={learner.regional        || '—'} />
          <CarnetField label="Sangre"   value={learner.bloodType       || '—'} />
          <CarnetField label="Ficha"    value={learner.ficha || learner.files || '—'} />
          {card?.expirationDate && (
            <CarnetField
              label="Vence"
              value={new Date(card.expirationDate).toLocaleDateString('es-CO')}
            />
          )}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.carnetFooter}>
        <Text style={styles.carnetFooterText}>
          Digital: {card?.digitalState || 'pendiente'}
        </Text>
        <Text style={styles.carnetFooterText}>
          Físico: {card?.physicalState || 'no solicitado'}
        </Text>
      </View>
    </View>
  );
}

function CarnetField({ label, value }) {
  return (
    <View style={styles.carnetFieldRow}>
      <Text style={styles.carnetFieldLabel}>{label}: </Text>
      <Text style={styles.carnetFieldValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame:   { flex: 1, flexDirection: 'row' },
  mainArea:       { flex: 1 },
  mainScroll:     { flexGrow: 1, paddingTop: 6, paddingBottom: 24 },
  /* Encabezado */
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
  pageTitle:      { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle:   { fontSize: 12, color: '#2C2C2C', maxWidth: 400 },
  headerActions:  { flexDirection: 'row', gap: 8 },
  backBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB' },
  backBtnText:    { fontSize: 12, color: '#374151', fontWeight: '600' },
  printBtn:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#079B72' },
  printBtnText:   { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },
  /* Tabs fichas */
  fichaTabsRow:   { marginBottom: 12 },
  fichaTab:       { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#C7D7D0', marginRight: 8 },
  fichaTabActive: { backgroundColor: '#087C4A', borderColor: '#087C4A' },
  fichaTabText:   { fontSize: 12, fontWeight: '900', color: '#3F4A45' },
  fichaTabTextActive: { color: '#FFFFFF' },
  /* Info ficha */
  fichaInfo:      { marginBottom: 14 },
  fichaInfoTitle: { fontSize: 15, fontWeight: '900', color: '#1F2937' },
  fichaInfoSub:   { fontSize: 12, color: '#6B7280', marginTop: 2 },
  /* Grid carnets */
  carnetGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  emptyText:      { color: '#9CA3AF', fontSize: 13, padding: 20 },
  /* Carnet */
  carnetCard:     {
    width: 300, borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14, shadowRadius: 10, elevation: 6,
    backgroundColor: '#FFFFFF',
  },
  carnetHeader:   { backgroundColor: '#079B72', flexDirection: 'row', alignItems: 'center', padding: 10, gap: 8 },
  carnetLogoBox:  { width: 32, height: 32, borderRadius: 6, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  carnetLogoText: { fontSize: 9, fontWeight: '900', color: '#079B72' },
  carnetInstitution: { fontSize: 10, fontWeight: '800', color: '#FFFFFF' },
  carnetSubtitle: { fontSize: 8, color: '#D1FAE5' },
  carnetBody:     { flexDirection: 'row', padding: 12, gap: 10 },
  carnetPhotoBox: {},
  carnetPhoto:    { width: 70, height: 88, borderRadius: 6, resizeMode: 'cover' },
  carnetPhotoPlaceholder: { width: 70, height: 88, borderRadius: 6, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center' },
  carnetPhotoInitial: { fontSize: 28, fontWeight: '900', color: '#079B72' },
  carnetData:     { flex: 1, gap: 2 },
  carnetName:     { fontSize: 12, fontWeight: '900', color: '#111827', marginBottom: 3 },
  roleBadge:      { backgroundColor: '#ECFDF5', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 4 },
  roleBadgeText:  { fontSize: 8, fontWeight: '700', color: '#059669' },
  carnetFieldRow: { flexDirection: 'row', flexWrap: 'wrap' },
  carnetFieldLabel: { fontSize: 8, color: '#6B7280', fontWeight: '700' },
  carnetFieldValue: { fontSize: 8, color: '#1F2937', flex: 1 },
  carnetFooter:   { backgroundColor: '#F9FAFB', flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 6, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  carnetFooterText: { fontSize: 8, color: '#6B7280' },
});
