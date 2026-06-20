import { useEffect, useState } from 'react';
import { View, Text, ScrollView, useWindowDimensions, ActivityIndicator, Platform } from 'react-native';
import WebFrame from '../components/WebFrame.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import ImprimirHeader from '../components/ImprimirHeader.jsx';
import ImprimirFichaTabs from '../components/ImprimirFichaTabs.jsx';
import ImprimirCarnetGrid from '../components/ImprimirCarnetGrid.jsx';
import ImprimirCarnetModal from '../components/ImprimirCarnetModal.jsx';
import { styles } from './Imprimir.styles.jsx';
import { getUserProfile, getAllUserProfiles } from '../services/authService';
import { getAllCards, updateCard } from '../services/cardService';
import { getAllRequestCards, updateRequestCard } from '../services/requestCardService';
import {
  getFichaValue,
  compareText,
  compareLearners,
  installPrintStyles,
  buildCarnetPairHtml,
  buildPrintHtml,
} from './imprimirUtils.jsx';
import { normalizeRole, ROLES } from '../utils/accessControl';

const ALL_FICHAS = '__all__';

export default function ImprimirScreen({ navigation }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const pagePadding = isMobile ? 10 : 18;

  const [profile, setProfile] = useState(null);
  const [learners, setLearners] = useState([]);
  const [cardsByUser, setCardsByUser] = useState({});
  const [fichas, setFichas] = useState([]);
  const [selectedFicha, setSelectedFicha] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedCarnet, setSelectedCarnet] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');

  const userName = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();

  useEffect(() => installPrintStyles(), []);

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

        const aprendices = (Array.isArray(allUsers) ? allUsers : [])
          .filter((u) => normalizeRole(u?.nameRole) === ROLES.APRENDIZ && getFichaValue(u))
          .sort(compareLearners);

        const cardMap = {};
        (Array.isArray(allCards) ? allCards : []).forEach((c) => {
          if (c?.idUser && !cardMap[c.idUser]) cardMap[c.idUser] = c;
        });

        const fichaList = Array.from(new Set(aprendices.map(getFichaValue).filter(Boolean))).sort(compareText);

        setProfile(currentProfile);
        setLearners(aprendices);
        setCardsByUser(cardMap);
        setFichas(fichaList);
        setSelectedFicha(fichaList.length > 1 ? ALL_FICHAS : fichaList[0] || '');
      } catch {
        // silencioso
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    setWarningMessage('');
  }, [selectedFicha]);

  useEffect(() => {
    setWarningMessage('');
  }, [selectedCarnet]);

  const isPrintingAll = selectedFicha === ALL_FICHAS;
  const fichaLearners = (isPrintingAll ? learners : learners.filter((u) => getFichaValue(u) === selectedFicha))
    .slice()
    .sort(compareLearners);
  const fichasToPrint = isPrintingAll ? fichas : selectedFicha ? [selectedFicha] : [];

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
          const payload = {
            idUser: request.idUser,
            requestTipe: request.requestTipe,
            cardTipe: request.cardTipe,
            state: 'impreso',
            approbedBy: request.approbedBy ?? null,
            printedBy,
          };
          await updateRequestCard(request.idRequest, payload).catch(() => {});
        }
      })
    );
  };

  const openPrintWindow = (title, subtitle, bodyHtml, singleCarnet = false) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') return;

    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.setAttribute('aria-hidden', 'true');

    const cleanup = () => {
      iframe.remove();
    };

    iframe.onload = () => {
      const printDoc = iframe.contentWindow?.document;
      if (!printDoc) {
        cleanup();
        return;
      }

      const printWin = iframe.contentWindow;
      printWin.focus();
      printWin.addEventListener?.('afterprint', cleanup, { once: true });
      setTimeout(() => {
        try {
          printWin.print();
        } catch {
          cleanup();
        }
      }, 50);
    };

    iframe.srcdoc = buildPrintHtml(title, subtitle, bodyHtml, singleCarnet);
    document.body.appendChild(iframe);
  };

  const handlePrint = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;

    // Check if any learner has no photo url
    const learnersWithNoPhoto = fichaLearners.filter((learner) => {
      const card = cardsByUser[learner.id];
      return !Boolean(learner.photoUrl || card?.photoUrl);
    });

    if (learnersWithNoPhoto.length > 0) {
      setWarningMessage(
        learnersWithNoPhoto.length === 1
          ? `Se necesita cargar la foto del aprendiz: ${learnersWithNoPhoto[0].fullName || learnersWithNoPhoto[0].full_name}`
          : `Se necesita cargar la foto de ${learnersWithNoPhoto.length} aprendices para poder imprimir.`
      );
      return;
    }

    setWarningMessage('');
    markAsPrinted(fichaLearners);
    const pairsHtml = fichaLearners
      .map((learner) => buildCarnetPairHtml(learner, cardsByUser[learner.id]))
      .join('');
    openPrintWindow('Carnets MyAccess', 'Vista previa - haz clic en "Imprimir" para enviar a la impresora.', `<div class="grid">${pairsHtml}</div>`);
  };

  const handlePrintSelected = () => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !selectedCarnet) return;

    const hasPhoto = Boolean(selectedCarnet.learner?.photoUrl || selectedCarnet.card?.photoUrl);
    if (!hasPhoto) {
      setWarningMessage('Se necesita cargar la foto del aprendiz para poder imprimir.');
      return;
    }

    setWarningMessage('');
    markAsPrinted([selectedCarnet.learner]);
    const pairHtml = buildCarnetPairHtml(selectedCarnet.learner, selectedCarnet.card);
    const selectedName =
      selectedCarnet?.name ||
      selectedCarnet?.learner?.fullName ||
      selectedCarnet?.learner?.full_name ||
      'Carnet individual';
    openPrintWindow(
      selectedName,
      'Vista previa - haz clic en "Imprimir" para enviar a la impresora.',
      pairHtml,
      true
    );
  };

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar navigation={navigation} studentName={userName} studentInitial={userInitial} />
        <View style={styles.contentFrame}>
          {!isMobile ? <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Imprimir" /> : null}

          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[styles.mainScroll, { paddingHorizontal: pagePadding, minHeight: height - 60 }]}
            showsVerticalScrollIndicator={false}
          >
            {isMobile ? <CarnetSidebar navigation={navigation} role={profile?.nameRole} activeKey="Imprimir" /> : null}

            <ImprimirHeader
              styles={styles}
              navigation={navigation}
              onPrint={handlePrint}
              canPrint={fichaLearners.length > 0}
            />

            {warningMessage ? (
              <View style={styles.warningBox}>
                <Text style={styles.warningIcon}>⚠️</Text>
                <Text style={styles.warningText}>{warningMessage}</Text>
                <TouchableOpacity onPress={() => setWarningMessage('')} style={styles.warningClose}>
                  <Text style={styles.warningCloseText}>×</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {loading ? (
              <ActivityIndicator color="#079B72" style={{ marginTop: 30 }} />
            ) : fichas.length === 0 ? (
              <Text style={styles.emptyText}>No hay fichas con aprendices registrados.</Text>
            ) : (
              <>
                <ImprimirFichaTabs
                  styles={styles}
                  fichas={fichas}
                  selectedFicha={selectedFicha}
                  onSelect={setSelectedFicha}
                  allFichasValue={ALL_FICHAS}
                />

                <View style={styles.fichaInfo}>
                  <Text style={styles.fichaInfoTitle}>{isPrintingAll ? 'Todas las fichas' : `Ficha #${selectedFicha}`}</Text>
                  <Text style={styles.fichaInfoSub}>
                    {fichaLearners.length} aprendiz{fichaLearners.length !== 1 ? 'es' : ''}
                  </Text>
                </View>

                <ImprimirCarnetGrid
                  styles={styles}
                  fichaLearners={fichaLearners}
                  fichasToPrint={fichasToPrint}
                  cardsByUser={cardsByUser}
                  isPrintingAll={isPrintingAll}
                  onSelectCarnet={setSelectedCarnet}
                />
              </>
            )}
          </ScrollView>
        </View>

        <ImprimirCarnetModal
          styles={styles}
          selectedCarnet={selectedCarnet}
          onClose={() => setSelectedCarnet(null)}
          onPrint={handlePrintSelected}
          warningMessage={warningMessage}
        />
      </View>
    </WebFrame>
  );
}
