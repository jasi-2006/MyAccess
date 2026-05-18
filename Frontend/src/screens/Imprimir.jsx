import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, useWindowDimensions,
  TouchableOpacity, Image, ActivityIndicator, Platform, Modal,
} from 'react-native';
import WebFrame from '../components/WebFrame.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import { getUserProfile, getAllUserProfiles } from '../services/authService';
import { getAllCards } from '../services/cardService';
import { API_GATEWAY_URL } from '../services/api';
import { normalizeRole, ROLES } from '../utils/accessControl';

const ALL_FICHAS = '__all__';
const PRINT_STYLE_ID = 'myaccess-print-styles';

function getFichaValue(user) {
  return String(user?.ficha || user?.files || '').trim();
}

function compareText(a, b) {
  return String(a || '').localeCompare(String(b || ''), 'es', {
    numeric: true,
    sensitivity: 'base',
  });
}

function compareLearners(a, b) {
  const fichaCompare = compareText(getFichaValue(a), getFichaValue(b));
  if (fichaCompare !== 0) return fichaCompare;

  const nameA = a?.fullName || a?.full_name || '';
  const nameB = b?.fullName || b?.full_name || '';
  const nameCompare = compareText(nameA, nameB);
  if (nameCompare !== 0) return nameCompare;

  return compareText(a?.document || a?.id, b?.document || b?.id);
}

function resolveImageUrl(url) {
  if (!url) return null;

  const value = String(url).trim();
  if (!value) return null;

  if (value.startsWith('/')) {
    return `${API_GATEWAY_URL}${value}`;
  }

  if (/^https?:\/\//i.test(value)) {
    try {
      const parsedUrl = new URL(value);
      const gatewayUrl = new URL(API_GATEWAY_URL);

      if (parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1') {
        parsedUrl.protocol = gatewayUrl.protocol;
        parsedUrl.hostname = gatewayUrl.hostname;
        parsedUrl.port = gatewayUrl.port;
      }

      return parsedUrl.toString();
    } catch {
      return value;
    }
  }

  return `${API_GATEWAY_URL}/${value.replace(/^\/+/, '')}`;
}

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
  const [selectedCarnet, setSelectedCarnet] = useState(null);

  const userName    = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return undefined;
    if (document.getElementById(PRINT_STYLE_ID)) return undefined;

    const style = document.createElement('style');
    style.id = PRINT_STYLE_ID;
    style.textContent = `
      @media print {
        body * {
          visibility: hidden !important;
        }

        body:not(.print-single-carnet) #print-area,
        body:not(.print-single-carnet) #print-area * {
          visibility: visible !important;
        }

        body:not(.print-single-carnet) #print-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 12px !important;
          padding: 12px !important;
          background: #ffffff !important;
        }

        #print-area > div {
          break-inside: avoid;
          page-break-inside: avoid;
        }

        body.print-single-carnet #single-print-area,
        body.print-single-carnet #single-print-area * {
          visibility: visible !important;
        }

        body.print-single-carnet #single-print-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          min-height: 100vh !important;
          display: flex !important;
          justify-content: center !important;
          align-items: flex-start !important;
          padding: 18px !important;
          background: #ffffff !important;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.getElementById(PRINT_STYLE_ID)?.remove();
    };
  }, []);

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
        const aprendices = (Array.isArray(allUsers) ? allUsers : [])
          .filter((u) => normalizeRole(u?.nameRole) === ROLES.APRENDIZ && getFichaValue(u))
          .sort(compareLearners);

        /* Mapa idUser -> card */
        const cardMap = {};
        (Array.isArray(allCards) ? allCards : []).forEach((c) => {
          if (c?.idUser && !cardMap[c.idUser]) cardMap[c.idUser] = c;
        });

        /* Fichas únicas ordenadas */
        const fichaList = Array.from(
          new Set(aprendices.map(getFichaValue).filter(Boolean))
        ).sort(compareText);

        setProfile(currentProfile);
        setLearners(aprendices);
        setCardsByUser(cardMap);
        setFichas(fichaList);
        setSelectedFicha(fichaList.length > 1 ? ALL_FICHAS : fichaList[0] || '');
      } catch {
        /* silencioso */
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const isPrintingAll = selectedFicha === ALL_FICHAS;
  const fichaLearners = (isPrintingAll
    ? learners
    : learners.filter((u) => getFichaValue(u) === selectedFicha)
  ).slice().sort(compareLearners);
  const fichasToPrint = isPrintingAll ? fichas : selectedFicha ? [selectedFicha] : [];

  const handlePrint = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      document.body.classList.remove('print-single-carnet');
      window.print();
    }
  };

  const handlePrintSelected = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      document.body.classList.add('print-single-carnet');
      window.print();
      window.setTimeout(() => {
        document.body.classList.remove('print-single-carnet');
      }, 300);
    }
  };

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        <View style={styles.contentFrame}>
          {!isMobile && (
            <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Imprimir" />
          )}
          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile && (
              <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Imprimir" />
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
                <TouchableOpacity
                  style={[styles.printBtn, fichaLearners.length === 0 && styles.printBtnDisabled]}
                  onPress={handlePrint}
                  disabled={fichaLearners.length === 0}
                >
                  <Text style={styles.printBtnText}>Imprimir carnets</Text>
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
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.fichaTabsRow}
                  contentContainerStyle={styles.fichaTabsContent}
                >
                  {fichas.length > 1 && (
                    <TouchableOpacity
                      style={[styles.fichaTab, selectedFicha === ALL_FICHAS && styles.fichaTabActive]}
                      onPress={() => setSelectedFicha(ALL_FICHAS)}
                    >
                      <Text style={[styles.fichaTabText, selectedFicha === ALL_FICHAS && styles.fichaTabTextActive]}>
                        Todas
                      </Text>
                    </TouchableOpacity>
                  )}
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
                  <Text style={styles.fichaInfoTitle}>
                    {isPrintingAll ? 'Todas las fichas' : `Ficha #${selectedFicha}`}
                  </Text>
                  <Text style={styles.fichaInfoSub}>
                    {fichaLearners.length} aprendice{fichaLearners.length !== 1 ? 's' : ''}
                  </Text>
                </View>

                {/* Grid de carnets */}
                <View style={styles.carnetGrid} nativeID="print-area">
                  {fichaLearners.length === 0 ? (
                    <Text style={styles.emptyText}>No hay aprendices en esta ficha.</Text>
                  ) : (
                    fichasToPrint.map((ficha) => {
                      const learnersByFicha = fichaLearners.filter((learner) => getFichaValue(learner) === ficha);
                      if (learnersByFicha.length === 0) return null;

                      return (
                        <View key={ficha} style={styles.fichaPrintGroup}>
                          {isPrintingAll && (
                            <Text style={styles.fichaPrintTitle}>Ficha #{ficha}</Text>
                          )}
                          <View style={styles.carnetGrid}>
                            {learnersByFicha.map((learner) => {
                              const card = cardsByUser[learner.id];
                              const name = learner.fullName || learner.full_name || `Aprendiz #${learner.id}`;
                              return (
                                <CarnetPreview
                                  key={learner.id}
                                  learner={learner}
                                  card={card}
                                  name={name}
                                  onPress={() => setSelectedCarnet({ learner, card, name })}
                                />
                              );
                            })}
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </>
            )}
          </ScrollView>
        </View>
        <Modal
          visible={Boolean(selectedCarnet)}
          transparent
          animationType="fade"
          onRequestClose={() => setSelectedCarnet(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalPanel}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTitleBlock}>
                  <Text style={styles.modalTitle}>Carnet individual</Text>
                  <Text style={styles.modalSubtitle} numberOfLines={1}>
                    {selectedCarnet?.name || ''}
                  </Text>
                </View>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedCarnet(null)}>
                  <Text style={styles.closeBtnText}>Cerrar</Text>
                </TouchableOpacity>
              </View>

              {selectedCarnet && (
                <View style={styles.singlePrintArea} nativeID="single-print-area">
                  <IndividualCarnet
                    learner={selectedCarnet.learner}
                    card={selectedCarnet.card}
                    name={selectedCarnet.name}
                  />
                </View>
              )}

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.printBtn} onPress={handlePrintSelected}>
                  <Text style={styles.printBtnText}>Imprimir este carnet</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </WebFrame>
  );
}

function BarcodeBlock() {
  const bars = [2, 1, 3, 1, 1, 2, 4, 1, 2, 1, 3, 2, 1, 1, 4, 2, 1, 3, 1, 2, 2, 1, 3, 1];
  return (
    <View style={styles.verticalBarcodeWrap}>
      {bars.map((bar, index) => (
        <View
          key={`single-bar-${index}`}
          style={[
            styles.verticalBarcodeBar,
            { width: bar, marginRight: index === bars.length - 1 ? 0 : 1 },
          ]}
        />
      ))}
    </View>
  );
}

function IndividualCarnet({ learner, card, name }) {
  const photoUrl = resolveImageUrl(learner?.photoUrl || card?.photoUrl);
  const role = learner?.nameRole || 'APRENDIZ';
  const documentType = learner?.typeDocument || 'CC';
  const documentNumber = learner?.document || 'NA';
  const bloodType = learner?.bloodType || '';
  const regional = learner?.regional || 'Regional Quindio';
  const trainingCenter = learner?.trainingCenter || 'centro comercio y turismo';
  const trainingProgram = learner?.trainingProgram || 'NA';
  const ficha = learner?.ficha || learner?.files || 'NA';

  return (
    <View style={styles.verticalCarnet}>
      <View style={styles.verticalTop}>
        <View style={styles.verticalLogoBox}>
          <Image source={require('../assets/logoSena.png')} style={styles.verticalLogo} resizeMode="contain" />
        </View>
        <View style={styles.verticalPhotoFrame}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.verticalPhoto} resizeMode="cover" />
          ) : null}
        </View>
      </View>

      <View style={styles.verticalBody}>
        <Text style={styles.verticalRole}>{role}</Text>
        <View style={styles.verticalGreenRule} />
        <Text style={styles.verticalBrand}>MyAccess</Text>
        <Text style={styles.verticalIdentity}>
          {`${documentType} ${documentNumber}${bloodType ? ` ${bloodType}` : ''}`}
        </Text>
        <BarcodeBlock />
      </View>

      <View style={styles.verticalFooter}>
        <Text style={styles.verticalRegional}>{regional}</Text>
        <Text style={styles.verticalCenter}>{trainingCenter}</Text>
        <Text style={styles.verticalMuted}>{trainingProgram}</Text>
        <Text style={styles.verticalMuted}>{`Grupo No ${ficha}`}</Text>
      </View>
    </View>
  );
}

/* Componente de vista previa de un carnet individual */
function CarnetPreview({ learner, card, name, onPress }) {
  const photoUrl = resolveImageUrl(learner?.photoUrl || card?.photoUrl);
  const Container = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.88 } : {};

  return (
    <Container style={styles.carnetCard} {...containerProps}>
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
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.carnetPhoto} />
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
    </Container>
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
  modalOverlay:   {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.54)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  modalPanel:     {
    width: '100%',
    maxWidth: 380,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  modalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  modalTitleBlock: { flex: 1 },
  modalTitle:     { fontSize: 15, fontWeight: '900', color: '#111827' },
  modalSubtitle:  { fontSize: 12, fontWeight: '700', color: '#6B7280', marginTop: 2 },
  closeBtn:       { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8, backgroundColor: '#F3F4F6' },
  closeBtnText:   { fontSize: 12, fontWeight: '800', color: '#374151' },
  singlePrintArea: { alignItems: 'center' },
  modalActions:   { alignItems: 'flex-end' },
  verticalCarnet:  {
    width: 265,
    height: 420,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    backgroundColor: '#FDFDFD',
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  verticalTop:     {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  verticalLogoBox: { width: 88, alignItems: 'center', marginTop: 2 },
  verticalLogo:    { width: 80, height: 80 },
  verticalPhotoFrame: {
    width: 122,
    height: 152,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#E9E9E9',
  },
  verticalPhoto:   { width: '100%', height: '100%' },
  verticalBody:    { marginTop: 10 },
  verticalRole:    {
    fontSize: 14,
    color: '#2F2F2F',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  verticalGreenRule: {
    height: 4,
    backgroundColor: '#0A8A4A',
    borderRadius: 2,
    marginBottom: 8,
  },
  verticalBrand:   {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '900',
    color: '#118449',
    marginBottom: 6,
  },
  verticalIdentity: { fontSize: 10, color: '#3A3A3A', marginBottom: 10 },
  verticalBarcodeWrap: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  verticalBarcodeBar: { height: 28, backgroundColor: '#111111' },
  verticalFooter:  { gap: 2 },
  verticalRegional: { color: '#555555', fontSize: 13, fontWeight: '900' },
  verticalCenter:  { color: '#118449', fontSize: 11, fontWeight: '800' },
  verticalMuted:   { color: '#4A4A4A', fontSize: 10 },
  /* Encabezado */
  headerRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 10 },
  pageTitle:      { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle:   { fontSize: 12, color: '#2C2C2C', maxWidth: 400 },
  headerActions:  { flexDirection: 'row', gap: 8 },
  backBtn:        { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D1D5DB' },
  backBtnText:    { fontSize: 12, color: '#374151', fontWeight: '600' },
  printBtn:       { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: '#079B72' },
  printBtnDisabled: { backgroundColor: '#9CA3AF' },
  printBtnText:   { fontSize: 12, color: '#FFFFFF', fontWeight: '700' },
  /* Tabs fichas */
  fichaTabsRow:   { marginBottom: 8, maxHeight: 32 },
  fichaTabsContent: { gap: 8, paddingRight: 4 },
  fichaTab:       {
    width: 82,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7D7D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fichaTabActive: { backgroundColor: '#087C4A', borderColor: '#087C4A' },
  fichaTabText:   { fontSize: 12, lineHeight: 14, fontWeight: '800', color: '#3F4A45', textAlign: 'center' },
  fichaTabTextActive: { color: '#FFFFFF' },
  /* Info ficha */
  fichaInfo:      { marginBottom: 10 },
  fichaInfoTitle: { fontSize: 15, fontWeight: '900', color: '#1F2937' },
  fichaInfoSub:   { fontSize: 12, color: '#6B7280', marginTop: 2 },
  /* Grid carnets */
  carnetGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 16 },
  fichaPrintGroup: { width: '100%', marginBottom: 18 },
  fichaPrintTitle: { fontSize: 14, fontWeight: '900', color: '#087C4A', marginBottom: 10 },
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
