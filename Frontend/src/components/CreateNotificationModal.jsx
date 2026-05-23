import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { createNotification } from '../services/notificationService.js';

const initialForm = {
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
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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

  const handleSubmit = async () => {
    const affair = form.affair.trim();
    const messaje = form.messaje.trim();
    const idUser = form.idUser.trim();

    if (!affair || !messaje) {
      setError('Completa el asunto y el mensaje.');
      return;
    }

    const userIdNumber = idUser ? Number(idUser) : null;
    if (idUser && (!Number.isInteger(userIdNumber) || userIdNumber <= 0)) {
      setError('El ID del usuario debe ser un numero valido.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        idUser: userIdNumber,
        tipe: form.tipe.trim() || 'General',
        category: form.category.trim() || 'Informativa',
        affair,
        messaje,
        statedSend: form.statedSend.trim() || 'pendiente',
      };

      await createNotification(payload);
      setSuccess('Notificacion creada correctamente.');
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

          <View style={styles.formGrid}>
            <View style={styles.field}>
              <Text style={styles.label}>ID usuario</Text>
              <TextInput
                value={form.idUser}
                onChangeText={(value) => updateField('idUser', value.replace(/[^0-9]/g, ''))}
                placeholder="Opcional"
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor="#9CA3AF"
              />
            </View>

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
