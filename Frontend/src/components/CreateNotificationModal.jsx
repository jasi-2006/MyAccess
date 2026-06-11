import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { getAllUserProfiles } from '../services/authService';
import { createNotification } from '../services/notificationService.js';
import { getFichaValue } from '../screens/imprimirUtils.jsx';
import { normalizeRole, ROLES } from '../utils/accessControl';

const initialForm = {
  audience: 'ficha',
  ficha: '',
  idUser: '',
  tipe: 'General',
  category: 'Informativa',
  affair: '',
  messaje: '',
  statedSend: 'pendiente',
};

export default function CreateNotificationModal({ visible, onClose, onCreated }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!visible) return undefined;

    let mounted = true;
    setLoadingUsers(true);

    getAllUserProfiles()
      .then((response) => {
        if (mounted) {
          setUsers(Array.isArray(response) ? response : []);
        }
      })
      .catch(() => {
        if (mounted) setUsers([]);
      })
      .finally(() => {
        if (mounted) setLoadingUsers(false);
      });

    return () => {
      mounted = false;
    };
  }, [visible]);

  const aprendices = useMemo(
    () => users.filter((user) => normalizeRole(user?.nameRole) === ROLES.APRENDIZ),
    [users],
  );

  const fichas = useMemo(
    () => Array.from(new Set(aprendices.map(getFichaValue).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es', { numeric: true })),
    [aprendices],
  );

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
    setSuccess('');
  };

  const resetAndClose = () => {
    if (submitting) return;
    setForm(initialForm);
    setError('');
    setSuccess('');
    onClose?.();
  };

  const buildPayload = () => ({
    tipe: form.tipe.trim() || 'General',
    category: form.category.trim() || 'Informativa',
    affair: form.affair.trim(),
    messaje: form.messaje.trim(),
    statedSend: form.statedSend.trim() || 'pendiente',
  });

  const handleSubmit = async () => {
    const affair = form.affair.trim();
    const messaje = form.messaje.trim();

    if (!affair || !messaje) {
      setError('Completa el asunto y el mensaje.');
      return;
    }

    const payloadBase = buildPayload();
    let recipients = [];

    if (form.audience === 'ficha') {
      const ficha = form.ficha.trim();
      if (!ficha) {
        setError('Selecciona la ficha destino.');
        return;
      }

      recipients = aprendices.filter((user) => getFichaValue(user) === ficha);
      if (recipients.length === 0) {
        setError('No hay aprendices registrados en esa ficha.');
        return;
      }
    } else {
      const idUser = form.idUser.trim();
      const userIdNumber = Number(idUser);
      if (!idUser || !Number.isInteger(userIdNumber) || userIdNumber <= 0) {
        setError('Selecciona un aprendiz valido.');
        return;
      }

      const selected = aprendices.find((user) => Number(user.id) === userIdNumber);
      if (!selected) {
        setError('El aprendiz seleccionado no existe.');
        return;
      }

      recipients = [selected];
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await Promise.all(
        recipients.map((recipient) => createNotification({
          ...payloadBase,
          idUser: Number(recipient.id),
        })),
      );

      if (form.audience === 'ficha') {
        setSuccess(`Notificacion enviada a ${recipients.length} aprendiz${recipients.length !== 1 ? 'es' : ''} de la ficha ${form.ficha.trim()}.`);
      } else {
        const name = recipients[0]?.fullName || recipients[0]?.full_name || 'aprendiz';
        setSuccess(`Notificacion enviada a ${name}.`);
      }

      setForm(initialForm);
      onCreated?.();
    } catch (err) {
      if (err.status === 401) {
        setError('Tu sesion vencio. Inicia sesion nuevamente para crear la notificacion.');
      } else {
        setError(err.message || 'No fue posible crear la notificacion.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={resetAndClose}
    >
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={resetAndClose} />
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Notificaciones</Text>
              <Text style={styles.title}>Crear notificacion</Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={resetAndClose} activeOpacity={0.8}>
              <Text style={styles.closeText}>X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.label}>Destinatario</Text>
            <View style={styles.audienceRow}>
              <TouchableOpacity
                style={[styles.audienceButton, form.audience === 'ficha' && styles.audienceButtonActive]}
                onPress={() => updateField('audience', 'ficha')}
                activeOpacity={0.85}
              >
                <Text style={[styles.audienceText, form.audience === 'ficha' && styles.audienceTextActive]}>
                  Ficha
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.audienceButton, form.audience === 'aprendiz' && styles.audienceButtonActive]}
                onPress={() => updateField('audience', 'aprendiz')}
                activeOpacity={0.85}
              >
                <Text style={[styles.audienceText, form.audience === 'aprendiz' && styles.audienceTextActive]}>
                  Aprendiz
                </Text>
              </TouchableOpacity>
            </View>

            {form.audience === 'ficha' ? (
              <View style={styles.field}>
                <Text style={styles.label}>Ficha</Text>
                {loadingUsers ? (
                  <ActivityIndicator color="#079B72" style={{ marginVertical: 10 }} />
                ) : fichas.length === 0 ? (
                  <Text style={styles.helperText}>No hay fichas con aprendices registrados.</Text>
                ) : (
                  <View style={styles.chipWrap}>
                    {fichas.map((ficha) => (
                      <TouchableOpacity
                        key={ficha}
                        style={[styles.chip, form.ficha === ficha && styles.chipActive]}
                        onPress={() => updateField('ficha', ficha)}
                        activeOpacity={0.85}
                      >
                        <Text style={[styles.chipText, form.ficha === ficha && styles.chipTextActive]}>
                          #{ficha}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.field}>
                <Text style={styles.label}>Aprendiz</Text>
                {loadingUsers ? (
                  <ActivityIndicator color="#079B72" style={{ marginVertical: 10 }} />
                ) : aprendices.length === 0 ? (
                  <Text style={styles.helperText}>No hay aprendices registrados.</Text>
                ) : (
                  <View style={styles.selectList}>
                    {aprendices.map((aprendiz) => {
                      const id = String(aprendiz.id);
                      const name = aprendiz.fullName || aprendiz.full_name || `Aprendiz #${id}`;
                      const ficha = getFichaValue(aprendiz);
                      const selected = form.idUser === id;

                      return (
                        <TouchableOpacity
                          key={id}
                          style={[styles.selectItem, selected && styles.selectItemActive]}
                          onPress={() => updateField('idUser', id)}
                          activeOpacity={0.85}
                        >
                          <Text style={[styles.selectItemTitle, selected && styles.selectItemTitleActive]}>
                            {name}
                          </Text>
                          <Text style={styles.selectItemMeta}>
                            {ficha ? `Ficha #${ficha}` : 'Sin ficha'} · ID {id}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            <View style={styles.formGrid}>
              <View style={styles.field}>
                <Text style={styles.label}>Tipo</Text>
                <TextInput
                  value={form.tipe}
                  onChangeText={(value) => updateField('tipe', value)}
                  maxLength={30}
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Categoria</Text>
                <TextInput
                  value={form.category}
                  onChangeText={(value) => updateField('category', value)}
                  maxLength={30}
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Estado</Text>
                <TextInput
                  value={form.statedSend}
                  onChangeText={(value) => updateField('statedSend', value)}
                  maxLength={20}
                  style={styles.input}
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Asunto</Text>
              <TextInput
                value={form.affair}
                onChangeText={(value) => updateField('affair', value)}
                maxLength={30}
                placeholder="Ej. Entrega de carnets"
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Mensaje</Text>
              <TextInput
                value={form.messaje}
                onChangeText={(value) => updateField('messaje', value)}
                placeholder="Escribe el contenido de la notificacion"
                style={[styles.input, styles.textArea]}
                multiline
                textAlignVertical="top"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>

          {error ? <Text style={styles.error}>{error}</Text> : null}
          {success ? <Text style={styles.success}>{success}</Text> : null}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.secondaryButton} onPress={resetAndClose} activeOpacity={0.85}>
              <Text style={styles.secondaryText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryText}>Crear</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(17, 24, 39, 0.48)',
  },
  modal: {
    width: '100%',
    maxWidth: 620,
    maxHeight: '92%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDF7EC',
    padding: 18,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  eyebrow: {
    color: '#079B72',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  title: {
    color: '#1F2937',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  closeText: {
    color: '#4B5563',
    fontSize: 14,
    fontWeight: '900',
  },
  audienceRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  audienceButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#F9FFFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audienceButtonActive: {
    backgroundColor: '#079B72',
    borderColor: '#079B72',
  },
  audienceText: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '900',
  },
  audienceTextActive: {
    color: '#FFFFFF',
  },
  formGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  field: {
    flexBasis: 220,
    flexGrow: 1,
    marginBottom: 12,
  },
  label: {
    color: '#374151',
    fontSize: 12,
    fontWeight: '900',
    marginBottom: 6,
  },
  helperText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#F9FFFC',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipActive: {
    backgroundColor: '#079B72',
    borderColor: '#079B72',
  },
  chipText: {
    color: '#047857',
    fontSize: 12,
    fontWeight: '900',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  selectList: {
    gap: 8,
    maxHeight: 180,
  },
  selectItem: {
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 8,
    backgroundColor: '#F9FFFC',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectItemActive: {
    backgroundColor: '#E8FFF5',
    borderColor: '#079B72',
  },
  selectItemTitle: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '800',
  },
  selectItemTitleActive: {
    color: '#047857',
  },
  selectItemMeta: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  input: {
    width: '100%',
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 8,
    backgroundColor: '#F9FFFC',
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  textArea: {
    minHeight: 110,
  },
  error: {
    color: '#B91C1C',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  success: {
    color: '#047857',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 4,
  },
  secondaryButton: {
    minWidth: 110,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1FAE5',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
  },
  secondaryText: {
    color: '#047857',
    fontSize: 14,
    fontWeight: '900',
  },
  primaryButton: {
    minWidth: 120,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#24C565',
    paddingHorizontal: 16,
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
