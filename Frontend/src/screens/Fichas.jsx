import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, useWindowDimensions, Alert } from 'react-native';
import CarnetSidebar from '../components/CarnetSidebar.jsx';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import StatCard from '../components/StatCard.jsx';
import WebFrame from '../components/WebFrame.jsx';
import { getAllUserProfiles, getUserProfile } from '../services/authService';
import { createCard, getAllCards, updateCard, updateCardActiveState } from '../services/cardService';
import { createRequestCard, updateRequestCard, getAllRequestCards } from '../services/requestCardService';
import { normalizeRole, ROLES } from '../utils/accessControl';

export default function FichasScreen({ navigation, route }) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1100;
  const pagePadding = isMobile ? 10 : isTablet ? 14 : 18;

  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [cardsByUser, setCardsByUser] = useState({});
  const [selectedFicha, setSelectedFicha] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [updatingCardId, setUpdatingCardId] = useState(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [error, setError] = useState('');
  const [editingCard, setEditingCard] = useState(null);
  const [editForm, setEditForm] = useState({ digitalState: '', physicalState: '' });
  const [savingEdit, setSavingEdit] = useState(false);

  const isInstructor = normalizeRole(profile?.nameRole) === ROLES.INSTRUCTOR;

  const userName = (profile?.fullName || profile?.full_name)?.trim() || 'Usuario';
  const userInitial = userName.charAt(0).toUpperCase();
  const learners = users.filter((user) => normalizeRole(user?.nameRole) === ROLES.APRENDIZ && (user?.ficha || user?.Ficha));
  const fichas = Array.from(new Set(learners.map((user) => String(user.ficha || user.Ficha).trim()).filter(Boolean))).sort();
  const selectedLearners = learners.filter((user) => String(user.ficha || user.Ficha).trim() === selectedFicha);
  const activeCards = Object.values(cardsByUser).filter((card) => card?.active ?? true).length;
  const inactiveCards = Object.values(cardsByUser).filter((card) => card && !(card.active ?? true)).length;

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      setLoadingData(true);
      setError('');

      try {
        const [currentProfile, allUsers, allCards] = await Promise.all([
          getUserProfile(),
          getAllUserProfiles(),
          getAllCards(),
        ]);

        if (!mounted) return;

        const normalizedUsers = Array.isArray(allUsers) ? allUsers : [];
        const cardMap = {};

        (Array.isArray(allCards) ? allCards : []).forEach((card) => {
          if (card?.idUser && !cardMap[card.idUser]) {
            cardMap[card.idUser] = card;
          }
        });

        const learnerFichas = Array.from(
          new Set(
            normalizedUsers
              .filter((user) => normalizeRole(user?.nameRole) === ROLES.APRENDIZ)
              .map((user) => String(user.ficha || user.Ficha || '').trim())
              .filter(Boolean)
          )
        ).sort();

        setProfile(currentProfile);
        setUsers(normalizedUsers);
        setCardsByUser(cardMap);
        const routeFicha = route?.params?.selectedFicha;
        setSelectedFicha((current) => routeFicha || current || learnerFichas[0] || '');
      } catch {
        if (!mounted) return;
        setProfile(null);
        setError('No fue posible cargar la informacion de las fichas.');
      } finally {
        if (mounted) setLoadingData(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshCard = (updatedCard) => {
    setCardsByUser((current) => ({
      ...current,
      [updatedCard.idUser]: updatedCard,
    }));
  };

  const buildCardPayload = (learner, active) => ({
    idUser: learner.id,
    photoUrl: learner.photoUrl || null,
    validPhoto: Boolean(learner.photoUrl),
    digitalState: active ? 'activo' : 'inactivo',
    physicalState: 'no solicitado',
    active,
    reprints: 0,
  });

  const patchLocalCard = (card, active) => {
    setCardsByUser((current) => ({
      ...current,
      [card.idUser]: {
        ...card,
        active,
      },
    }));
  };

  const handleToggleCard = async (learner, card, nextValue) => {
    if (updatingCardId || bulkUpdating) return;

    const temporaryCard = card || buildCardPayload(learner, nextValue);
    setUpdatingCardId(card?.idCard || `new-${learner.id}`);
    setError('');
    patchLocalCard(temporaryCard, nextValue);

    try {
      const updatedCard = card?.idCard
        ? await updateCardActiveState(card.idCard, nextValue)
        : await createCard(buildCardPayload(learner, nextValue));
      refreshCard(updatedCard);
    } catch {
      if (card?.idCard) {
        patchLocalCard(card, card.active ?? true);
      } else {
        setCardsByUser((current) => {
          const next = { ...current };
          delete next[learner.id];
          return next;
        });
      }
      setError('No fue posible actualizar el estado del carnet.');
    } finally {
      setUpdatingCardId(null);
    }
  };

  const handleBulkUpdate = async (active) => {
    const learnersToUpdate = selectedLearners.filter((learner) => {
      const card = cardsByUser[learner.id];
      return !card?.idCard || (card.active ?? true) !== active;
    });

    if (!learnersToUpdate.length || bulkUpdating) return;

    setBulkUpdating(true);
    setError('');
    setCardsByUser((current) => {
      const next = { ...current };
      learnersToUpdate.forEach((learner) => {
        const card = current[learner.id] || buildCardPayload(learner, active);
        next[learner.id] = { ...card, active };
      });
      return next;
    });

    try {
      const updatedCards = await Promise.all(
        learnersToUpdate.map((learner) => {
          const card = cardsByUser[learner.id];
          return card?.idCard
            ? updateCardActiveState(card.idCard, active)
            : createCard(buildCardPayload(learner, active));
        })
      );
      updatedCards.forEach(refreshCard);
    } catch {
      setCardsByUser((current) => {
        const next = { ...current };
        learnersToUpdate.forEach((learner) => {
          const card = cardsByUser[learner.id];
          if (card) {
            next[learner.id] = card;
          } else {
            delete next[learner.id];
          }
        });
        return next;
      });
      setError('No fue posible actualizar todos los carnets seleccionados.');
    } finally {
      setBulkUpdating(false);
    }
  };

  const openEditCard = (card) => {
    if (!card?.idCard) return;

    setEditingCard(card);
    setEditForm({
      digitalState: card.digitalState || '',
      physicalState: card.physicalState || '',
    });
  };

  const handleSaveEdit = async () => {
    if (!editingCard?.idCard || savingEdit) return;

    setSavingEdit(true);
    setError('');

    try {
      const updatedCard = await updateCard(editingCard.idCard, {
        digitalState: editForm.digitalState,
        physicalState: editForm.physicalState,
      });
      refreshCard(updatedCard);
      setEditingCard(null);
    } catch {
      setError('No fue posible editar el carnet.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleRequestPrintFicha = async () => {
    if (bulkUpdating || !selectedLearners.length) return;
    setBulkUpdating(true);
    setError('');

    const activeLearners = selectedLearners.filter(learner => {
      const card = cardsByUser[learner.id];
      return card?.active ?? true;
    });

    if (activeLearners.length === 0) {
      setError('No hay aprendices activos en esta ficha para solicitar impresión.');
      setBulkUpdating(false);
      return;
    }

    try {
      const allRequests = await getAllRequestCards().catch(() => []);

      const promises = activeLearners.map(async (learner) => {
        const existingRequest = allRequests.find(r => r.idUser === learner.id);
        const payload = {
          idUser: learner.id,
          requestTipe: 'impresion_colectiva',
          cardTipe: 'fisico',
          state: 'pendiente',
          approbedBy: null,
          printedBy: null
        };

        if (existingRequest?.idRequest) {
          return updateRequestCard(existingRequest.idRequest, { ...existingRequest, state: 'pendiente' });
        } else {
          return createRequestCard(payload);
        }
      });

      await Promise.all(promises);
      Alert.alert('Solicitud enviada', `Se ha generado la solicitud de impresión para ${activeLearners.length} aprendices activos de la ficha #${selectedFicha}.`);
    } catch (err) {
      setError('Ocurrió un error al generar las solicitudes de impresión.');
    } finally {
      setBulkUpdating(false);
    }
  };

  return (
    <WebFrame>
      <View style={styles.screen}>
        <CarnetTopbar
          navigation={navigation}
          studentName={userName}
          studentInitial={userInitial}
        />

        <View style={styles.contentFrame}>
          {!isMobile && (
            <CarnetSidebar
              navigation={navigation}
              role={profile?.nameRole}
              activeKey="Fichas"
            />
          )}

          <ScrollView
            style={styles.mainArea}
            contentContainerStyle={[
              styles.mainScroll,
              { paddingHorizontal: pagePadding, minHeight: height - 60 },
            ]}
            showsVerticalScrollIndicator={false}
            overScrollMode="never"
          >
            {isMobile && (
              <CarnetSidebar
                navigation={navigation}
                role={profile?.nameRole}
                activeKey="Fichas"
              />
            )}

            <View style={styles.headerBlock}>
              <Text style={styles.pageTitle}>Gestion de ficha</Text>
              <Text style={styles.pageSubtitle}>
                Revisa los aprendices por ficha y administra el estado de sus carnets.
              </Text>
            </View>

            <View style={styles.row}>
              <StatCard title="Total fichas" value={String(fichas.length)} />
              <StatCard title="Aprendices" value={String(learners.length)} />
              <StatCard title="Carnets activos" value={String(activeCards)} />
              <StatCard title="Carnets inactivos" value={String(inactiveCards)} />
            </View>

            {loadingData ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color="#079B72" />
                <Text style={styles.loadingText}>Cargando fichas...</Text>
              </View>
            ) : (
              <>
                {!!error && <Text style={styles.errorText}>{error}</Text>}

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.fichaTabs}
                >
                  {fichas.map((ficha) => (
                    <TouchableOpacity
                      key={ficha}
                      style={[styles.fichaTab, selectedFicha === ficha && styles.fichaTabActive]}
                      onPress={() => setSelectedFicha(ficha)}
                      activeOpacity={0.85}
                    >
                      <Text style={[styles.fichaTabText, selectedFicha === ficha && styles.fichaTabTextActive]}>
                        #{ficha}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <View>
                      <Text style={styles.tableTitle}>Ficha #{selectedFicha || 'Sin ficha'}</Text>
                      <Text style={styles.tableText}>{selectedLearners.length} aprendices registrados</Text>
                    </View>

                    <View style={styles.bulkActions}>
                      {normalizeRole(profile?.nameRole) === ROLES.INSTRUCTOR ? (
                        <TouchableOpacity
                          style={[styles.bulkButton, styles.requestPrintButton, bulkUpdating && styles.disabledButton]}
                          onPress={handleRequestPrintFicha}
                          disabled={bulkUpdating || !selectedLearners.length}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.bulkButtonText}>Solicitar impresión de ficha</Text>
                        </TouchableOpacity>
                      ) : (
                        <>
                          <TouchableOpacity
                            style={[styles.bulkButton, styles.activateButton, bulkUpdating && styles.disabledButton]}
                            onPress={() => handleBulkUpdate(true)}
                            disabled={bulkUpdating || !selectedLearners.length}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.bulkButtonText}>Activar todos</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.bulkButton, styles.deactivateButton, bulkUpdating && styles.disabledButton]}
                            onPress={() => handleBulkUpdate(false)}
                            disabled={bulkUpdating || !selectedLearners.length}
                            activeOpacity={0.85}
                          >
                            <Text style={styles.bulkButtonText}>Desactivar todos</Text>
                          </TouchableOpacity>
                        </>
                      )}
                    </View>
                  </View>

                  {selectedLearners.length ? (
                    selectedLearners.map((learner) => {
                      const card = cardsByUser[learner.id];
                      const isActive = card?.active ?? true;
                      const disabled = updatingCardId === card?.idCard || updatingCardId === `new-${learner.id}` || bulkUpdating;

                      return (
                        <View key={learner.id} style={styles.learnerRow}>
                          <View style={styles.learnerInfo}>
                            <Text style={styles.learnerName}>{learner.fullName || learner.full_name || 'Aprendiz'}</Text>
                            <Text style={styles.learnerMeta}>
                              {learner.typeDocument || 'Doc'} {learner.document || 'Sin documento'} | {learner.email || 'Sin correo'}
                            </Text>
                            <Text style={[styles.cardState, isActive ? styles.cardStateActive : styles.cardStateInactive]}>
                              {card?.idCard ? (isActive ? 'Carnet activo' : 'Carnet inactivo') : 'Sin carnet registrado'}
                            </Text>
                          </View>

                          <View style={styles.rowActions}>
                            {!isInstructor && (
                              <TouchableOpacity
                                style={[styles.editButton, !card?.idCard && styles.disabledButton]}
                                onPress={() => openEditCard(card)}
                                disabled={!card?.idCard}
                                activeOpacity={0.85}
                              >
                                <Text style={styles.editButtonText}>Editar</Text>
                              </TouchableOpacity>
                            )}
                            <Switch
                              value={isActive}
                              onValueChange={(value) => handleToggleCard(learner, card, value)}
                              disabled={disabled}
                              trackColor={{ false: '#F3B8B5', true: '#A7E3C1' }}
                              thumbColor={isActive ? '#087C4A' : '#B42318'}
                            />
                          </View>
                        </View>
                      );
                    })
                  ) : (
                    <Text style={styles.emptyText}>No hay aprendices registrados en esta ficha.</Text>
                  )}
                </View>
              </>
            )}

          </ScrollView>
        </View>

        {!isInstructor && (
        <Modal
          visible={Boolean(editingCard)}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingCard(null)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>Editar carnet</Text>
              <Text style={styles.modalLabel}>Estado digital</Text>
              <TextInput
                value={editForm.digitalState}
                onChangeText={(value) => setEditForm((current) => ({ ...current, digitalState: value }))}
                style={styles.modalInput}
                placeholder="Ej. activo, pendiente"
              />
              <Text style={styles.modalLabel}>Estado fisico</Text>
              <TextInput
                value={editForm.physicalState}
                onChangeText={(value) => setEditForm((current) => ({ ...current, physicalState: value }))}
                style={styles.modalInput}
                placeholder="Ej. no solicitado, impreso"
              />

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditingCard(null)}
                  disabled={savingEdit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, savingEdit && styles.disabledButton]}
                  onPress={handleSaveEdit}
                  disabled={savingEdit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.saveButtonText}>{savingEdit ? 'Guardando...' : 'Guardar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
        )}
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#EAE6E6' },
  contentFrame: { flex: 1, flexDirection: 'row' },
  mainArea: { flex: 1 },
  mainScroll: { flexGrow: 1, paddingTop: 6, paddingBottom: 16 },
  headerBlock: { marginBottom: 10 },
  pageTitle: { fontSize: 18, fontWeight: '800', color: '#151515', marginBottom: 2 },
  pageSubtitle: { maxWidth: 430, fontSize: 12, lineHeight: 16, color: '#2C2C2C' },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  table: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDF7EC',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tableTitle: {
    color: '#1F2937',
    fontWeight: '900',
    marginBottom: 8,
  },
  tableText: {
    color: '#6B7280',
    fontWeight: '700',
    marginTop: 4,
  },
  loadingBox: {
    marginTop: 16,
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#59645F',
    fontSize: 12,
    fontWeight: '700',
  },
  errorText: {
    marginTop: 12,
    color: '#B42318',
    fontSize: 12,
    fontWeight: '800',
  },
  fichaTabs: {
    gap: 8,
    paddingTop: 14,
    paddingBottom: 2,
  },
  fichaTab: {
    minWidth: 92,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7D7D0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  fichaTabActive: {
    backgroundColor: '#087C4A',
    borderColor: '#087C4A',
  },
  fichaTabText: {
    color: '#3F4A45',
    fontSize: 12,
    fontWeight: '900',
  },
  fichaTabTextActive: {
    color: '#FFFFFF',
  },
  bulkActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bulkButton: {
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  activateButton: {
    backgroundColor: '#087C4A',
  },
  requestPrintButton: {
    backgroundColor: '#079B72',
  },
  deactivateButton: {
    backgroundColor: '#B42318',
  },
  disabledButton: {
    opacity: 0.55,
  },
  bulkButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  learnerRow: {
    minHeight: 74,
    borderTopWidth: 1,
    borderTopColor: '#E5EEE9',
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  rowActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  editButton: {
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#087C4A',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  editButtonText: {
    color: '#087C4A',
    fontSize: 12,
    fontWeight: '900',
  },
  learnerInfo: {
    flex: 1,
    minWidth: 0,
  },
  learnerName: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '900',
  },
  learnerMeta: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
  },
  cardState: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 4,
  },
  cardStateActive: {
    color: '#087C4A',
  },
  cardStateInactive: {
    color: '#B42318',
  },
  emptyText: {
    borderTopWidth: 1,
    borderTopColor: '#E5EEE9',
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    paddingTop: 14,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 24, 39, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
  },
  modalTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  modalLabel: {
    color: '#3F4A45',
    fontSize: 12,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 6,
  },
  modalInput: {
    height: 42,
    borderWidth: 1,
    borderColor: '#C7D7D0',
    borderRadius: 8,
    paddingHorizontal: 10,
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 16,
  },
  modalButton: {
    height: 36,
    minWidth: 92,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  cancelButton: {
    backgroundColor: '#EEF2F0',
  },
  saveButton: {
    backgroundColor: '#087C4A',
  },
  cancelButtonText: {
    color: '#3F4A45',
    fontSize: 12,
    fontWeight: '900',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
});
