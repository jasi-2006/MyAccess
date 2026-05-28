import { useEffect, useState, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, useWindowDimensions,
  TouchableOpacity, Image, ActivityIndicator, Platform, Modal, Animated,
} from 'react-native';
import WebFrame from '../components/WebFrame.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import { getUserProfile, getAllUserProfiles } from '../services/authService';
import { getAllCards, updateCard } from '../services/cardService';
import { getAllRequestCards, updateRequestCard } from '../services/requestCardService';
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

  const buildCarnetPairHtml = (learner, card) => {
    const photoUrl = resolveImageUrl(learner?.photoUrl || card?.photoUrl);
    const role = learner?.nameRole || '';
    const docType = learner?.typeDocument || 'CC';
    const docNum = learner?.document || '';
    const blood = learner?.bloodType || '';
    const regional = learner?.regional || 'Regional Quindio';
    const center = learner?.trainingCenter || 'centro comercio y turismo';
    const program = learner?.trainingProgram || 'NA';
    const ficha = learner?.ficha || learner?.files || '';

    const photoHtml = photoUrl
      ? `<img src="${photoUrl}" style="width:122px;height:152px;border-radius:10px;object-fit:cover;" />`
      : `<div style="width:122px;height:152px;border-radius:10px;background:#E9E9E9;"></div>`;

    const bars = [2,1,3,1,1,2,4,1,2,1,3,2,1,1,4,2,1,3,1,2,2,1,3,1];
    const barcodeHtml = `<div style="display:flex;align-items:flex-end;height:34px;margin-bottom:10px;">${
      bars.map((w, i) => `<div style="width:${w}px;height:28px;background:#111;${i < bars.length-1 ? 'margin-right:1px;' : ''}"></div>`).join('')
    }</div>`;

    const QR_PATTERN = [
      '11111110001001111111','10000010110010100001','10111010101110101101','10111010010000101101',
      '10111010111110101101','10000010001000100001','11111110101010111111','00000000110110000000',
      '10110111100011101011','00101100111001011001','11100011101011100011','00111001010100101110',
      '10101110111110001011','00000000101000100000','11111110110101111111','10000010001100100001',
      '10111010111010101101','10111010010100101101','10000010101110100001','11111110011000111111',
    ];
    const qrHtml = `<div style="padding:6px;background:#fff;border:1px solid #111;display:inline-block;">${
      QR_PATTERN.map(row =>
        `<div style="display:flex;">${row.split('').map(c =>
          `<div style="width:4px;height:4px;background:${c==='1'?'#111':'#fff'};"></div>`
        ).join('')}</div>`
      ).join('')
    }</div>`;

    const logoHtml = `<img src="${window.location.origin}/static/media/logoSena.png" style="width:80px;height:80px;" onerror="this.style.display='none'" />`;

    const front = `
      <div style="width:265px;height:420px;border-radius:12px;border:1px solid #D7D7D7;background:#FDFDFD;padding:14px 14px 12px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="width:88px;text-align:center;margin-top:2px;">${logoHtml}</div>
          ${photoHtml}
        </div>
        <div style="margin-top:10px;">
          <div style="font-size:14px;color:#2F2F2F;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:4px;">${role}</div>
          <div style="height:4px;background:#0A8A4A;border-radius:2px;margin-bottom:8px;"></div>
          <div style="font-size:17px;font-weight:900;color:#118449;margin-bottom:6px;">MyAccess</div>
          <div style="font-size:10px;color:#3A3A3A;margin-bottom:10px;">${docType} ${docNum}${blood ? ' '+blood : ''}</div>
          ${barcodeHtml}
        </div>
        <div>
          <div style="color:#555;font-size:13px;font-weight:900;">${regional}</div>
          <div style="color:#118449;font-size:11px;font-weight:800;">${center}</div>
          <div style="color:#4A4A4A;font-size:10px;">${program}</div>
          <div style="color:#4A4A4A;font-size:10px;">Grupo No ${ficha}</div>
        </div>
      </div>`;

    const back = `
      <div style="width:265px;height:420px;border-radius:12px;border:1px solid #D7D7D7;background:#FFF;padding:14px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;">
        <div style="font-size:10px;color:#2E2E2E;line-height:14px;">Este carnet pertenece a quien lo porta, únicamente para el cumplimiento de sus funciones y para la obtención de servicios que el SENA presta a sus funcionarios y/o contratistas.<br/>Se solicita a las autoridades civiles y militares prestarle toda la colaboración para su desempeño.</div>
        <div style="text-align:center;margin:8px 0;">${qrHtml}</div>
        <div style="text-align:center;margin-bottom:10px;">
          <div style="font-size:10px;color:#2B2B2B;">cesar augusto ospina p</div>
          <div style="font-size:11px;color:#333;">Firma de autoría</div>
        </div>
        <div style="font-size:10px;color:#2E2E2E;line-height:14px;">Si por algún motivo este carné es extraviado, por favor diríjase a la Dirección Regional Quindío - Avenida Centenario #44 Norte -15</div>
      </div>`;

    return `<div style="display:flex;gap:16px;break-inside:avoid;page-break-inside:avoid;margin-bottom:24px;">${front}${back}</div>`;
  };

  const markAsPrinted = async (learnersList) => {
    const [allCards, allRequests] = await Promise.all([
      getAllCards().catch(() => []),
      getAllRequestCards().catch(() => []),
    ]);

    const printedBy = profile?.fullName || profile?.full_name || 'instructor';

    await Promise.allSettled(
      learnersList.map(async (learner) => {
        const card = allCards.find((c) => c.idUser === learner.id);
        if (card?.idCard) {
          await updateCard(card.idCard, { ...card, physicalState: 'impreso' }).catch(() => {});
        }

        const request = allRequests.find((r) => r.idUser === learner.id);
        if (request?.idRequest) {
          await updateRequestCard(request.idRequest, { ...request, state: 'impreso', printedBy }).catch(() => {});
        }
      })
    );
  };

  const handlePrint = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    markAsPrinted(fichaLearners);

    const pairsHtml = fichaLearners.map((learner) => {
      const card = cardsByUser[learner.id];
      return buildCarnetPairHtml(learner, card);
    }).join('');

    const printWin = window.open('', '_blank', 'width=800,height=600');
    printWin.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"/>
      <style>
        body { margin: 0; padding: 20px; background: #fff; }
        @media print { body { padding: 10px; } }
      </style></head>
      <body>${pairsHtml}</body></html>
    `);
    printWin.document.close();
    printWin.focus();
    printWin.onload = () => { printWin.print(); printWin.close(); };
  };

  const handlePrintSelected = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !selectedCarnet) return;

    markAsPrinted([selectedCarnet.learner]);

    const { learner, card } = selectedCarnet;
    const pairHtml = buildCarnetPairHtml(learner, card);

    const printWin = window.open('', '_blank', 'width=700,height=500');
    printWin.document.write(`
      <!DOCTYPE html><html><head><meta charset="utf-8"/>
      <style>
        body { margin: 0; padding: 20px; background: #fff; display: flex; justify-content: center; }
        @media print { body { padding: 10px; } }
      </style></head>
      <body>${pairHtml}</body></html>
    `);
    printWin.document.close();
    printWin.focus();
    printWin.onload = () => { printWin.print(); printWin.close(); };
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
                <ScrollView
                  style={{ maxHeight: 520 }}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.singlePrintArea}
                  nativeID="single-print-area"
                >
                  <IndividualCarnet
                    learner={selectedCarnet.learner}
                    card={selectedCarnet.card}
                    name={selectedCarnet.name}
                  />
                </ScrollView>
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

const QR_PATTERN = [
  '11111110001001111111',
  '10000010110010100001',
  '10111010101110101101',
  '10111010010000101101',
  '10111010111110101101',
  '10000010001000100001',
  '11111110101010111111',
  '00000000110110000000',
  '10110111100011101011',
  '00101100111001011001',
  '11100011101011100011',
  '00111001010100101110',
  '10101110111110001011',
  '00000000101000100000',
  '11111110110101111111',
  '10000010001100100001',
  '10111010111010101101',
  '10111010010100101101',
  '10000010101110100001',
  '11111110011000111111',
];

function QrBlock() {
  return (
    <View style={styles.qrOuter}>
      <View style={styles.qrGrid}>
        {QR_PATTERN.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.qrRow}>
            {row.split('').map((cell, colIndex) => (
              <View
                key={`cell-${rowIndex}-${colIndex}`}
                style={[styles.qrCell, cell === '1' ? styles.qrCellDark : styles.qrCellLight]}
              />
            ))}
          </View>
        ))}
      </View>
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

  const [flipped, setFlipped] = useState(false);
  const flipAnim = useRef(new Animated.Value(0)).current;

  const flipCard = () => {
    const next = flipped ? 0 : 1;
    Animated.spring(flipAnim, { toValue: next, friction: 8, tension: 12, useNativeDriver: true }).start();
    setFlipped(!flipped);
  };

  const frontRotate = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const backRotate  = flipAnim.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const frontOpacity = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [1, 0] });
  const backOpacity  = flipAnim.interpolate({ inputRange: [0.4, 0.5], outputRange: [0, 1] });

  return (
    <View style={{ alignItems: 'center', gap: 10 }}>
      <TouchableOpacity onPress={flipCard} activeOpacity={1}>
        <View style={{ width: 265, height: 420 }}>
          {/* Frente */}
          <Animated.View style={[
            styles.verticalCarnet,
            { position: 'absolute', backfaceVisibility: 'hidden', transform: [{ rotateY: frontRotate }], opacity: frontOpacity },
          ]}>
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
          </Animated.View>

          {/* Reverso */}
          <Animated.View style={[
            styles.verticalCarnet,
            styles.verticalCarnetBack,
            { position: 'absolute', backfaceVisibility: 'hidden', transform: [{ rotateY: backRotate }], opacity: backOpacity },
          ]}>
            <Text style={styles.verticalBackText}>
              Este carnet pertenece a quien lo porta, únicamente para el cumplimiento de sus funciones y para la obtención de servicios que el SENA presta a sus funcionarios y/o contratistas.
e solicita a las autoridades civiles y militares prestarle toda la colaboración para su desempeño.
            </Text>
            <View style={{ alignItems: 'center', marginVertical: 8 }}>
              <QrBlock />
            </View>
            <View style={{ alignItems: 'center', marginBottom: 10 }}>
              <Text style={styles.verticalSignatureName}>cesar augusto ospina p</Text>
              <Text style={styles.verticalSignatureLabel}>Firma de autoría</Text>
            </View>
            <Text style={styles.verticalBackText}>
              Si por algún motivo este carné es extraviado, por favor diríjase a la Dirección Regional Quindío - Avenida Centenario #44 Norte -15
            </Text>
          </Animated.View>
        </View>
      </TouchableOpacity>
      <Text style={styles.flipHint}>{flipped ? 'Toca para ver el frente' : 'Toca para ver el reverso'}</Text>
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
  singlePrintArea: { alignItems: 'center', paddingVertical: 8 },
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
  verticalCarnetBack: { backgroundColor: '#FFFFFF', justifyContent: 'space-between' },
  verticalBackText: { fontSize: 10, color: '#2E2E2E', lineHeight: 14 },
  verticalSignatureName: { fontSize: 10, color: '#2B2B2B', marginBottom: 3, textAlign: 'center' },
  verticalSignatureLabel: { fontSize: 11, color: '#333333', textAlign: 'center' },
  flipHint: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  qrOuter: { padding: 6, backgroundColor: '#FFFFFF' },
  qrGrid: { borderWidth: 1, borderColor: '#111111' },
  qrRow: { flexDirection: 'row' },
  qrCell: { width: 4, height: 4 },
  qrCellDark: { backgroundColor: '#111111' },
  qrCellLight: { backgroundColor: '#FFFFFF' },
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
