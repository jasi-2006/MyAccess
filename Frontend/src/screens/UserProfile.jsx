import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { getUserProfile, updateUserProfile, updateProfilePassword, uploadProfilePhoto, verifyLocalProfile } from '../services/authService';
import { validateCarnetPhoto } from '../services/photoValidationService.js';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import UserSidebar from '../components/UserSidebar.jsx';
import ProfileInfoCard from '../components/ProfileInfoCard.jsx';
import ProfileEditModal from '../components/ProfileEditModal.jsx';
import WebFrame from '../components/WebFrame.jsx';

const passwordRegex = /^[A-Z](?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export default function UserProfile({ navigation }) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDesktop = width >= 910;
  const isTablet = width >= 490 && width < 910;
  const px = isDesktop ? 50 : isTablet ? 40 : 14;

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState({});
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [photoRevision, setPhotoRevision] = useState(Date.now());
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const fields = [
    { label: 'Nombre completo', value: profile?.fullName, key: 'fullName' },
    { label: 'Tipo documento', value: profile?.typeDocument, key: 'typeDocument' },
    { label: 'Documento', value: profile?.document, key: 'document', numeric: true },
    { label: 'Tipo de sangre', value: profile?.bloodType, key: 'bloodType' },
    { label: 'Ficha', value: profile?.ficha, key: 'ficha', numeric: true },
    { label: 'Programa', value: profile?.trainingProgram, key: 'trainingProgram' },
    { label: 'Centro', value: profile?.trainingCenter, key: 'trainingCenter' },
    { label: 'Regional', value: profile?.regional, key: 'regional' },
    { label: 'email', value: profile?.email, key: 'email' },
    { label: 'Verificado Sofia Plus', value: profile?.sofiaVerified ? 'Verificado ✓' : 'Pendiente ✗', key: 'sofiaVerified' },
  ];

  const buildPhotoPayload = () => {
    if (!photo) return null;

    const name = photo.name || photo.fileName || 'profile.jpg';
    if (photo.file) {
      return { file: photo.file, name };
    }

    return {
      file: {
        uri: photo.uri,
        name,
        type: photo.type || 'image/jpeg',
      },
      name,
    };
  };

  const openEdit = () => {
    setForm(Object.fromEntries(fields.map((f) => [f.key, profile?.[f.key] || ''])));
    setPhoto(null);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setModalVisible(true);
  };

  const closeEdit = () => {
    setPhoto(null);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setModalVisible(false);
  };

  const buildUpdatePayload = () => ({
    fullName: form.fullName?.trim() || profile?.fullName,
    typeDocument: form.typeDocument?.trim() || profile?.typeDocument,
    bloodType: form.bloodType?.trim() || profile?.bloodType,
    ficha: form.ficha?.trim() || profile?.ficha,
    trainingProgram: form.trainingProgram?.trim() || profile?.trainingProgram,
    trainingCenter: form.trainingCenter?.trim() || profile?.trainingCenter,
    regional: form.regional?.trim() || profile?.regional,
  });

  const getPasswordValidationError = () => {
    const hasAnyPasswordValue = [
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword,
    ].some((value) => String(value || '').trim().length > 0);

    if (!hasAnyPasswordValue) {
      return null;
    }

    if (!String(passwordForm.currentPassword || '').trim()) {
      return 'Debes ingresar tu contraseña actual para cambiarla.';
    }
    if (!String(passwordForm.newPassword || '').trim()) {
      return 'Debes ingresar la nueva contraseña.';
    }
    if (!String(passwordForm.confirmPassword || '').trim()) {
      return 'Debes confirmar la nueva contraseña.';
    }
    if (!passwordRegex.test(passwordForm.newPassword)) {
      return 'La nueva contraseña debe iniciar con mayáscula, tener 8 caracteres, un número y un carácter especial.';
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return 'Las contraseñas nuevas no coinciden.';
    }

    return null;
  };

  const handleSave = async () => {
    if (!profile?.document) return;

    const passwordValidationError = getPasswordValidationError();
    if (passwordValidationError) {
      Alert.alert('Contraseña no válida', passwordValidationError);
      return;
    }

    setSaving(true);
    let photoError = null;
    let passwordError = null;

    try {
      if (photo?.file) {
        const validation = await validateCarnetPhoto(photo.file);
        if (!validation.valid) {
          Alert.alert('Foto no válida', validation.errors.join('\n'));
          return;
        }
      }

      await updateUserProfile(profile.document, buildUpdatePayload());

      if (photo) {
        try {
          const formData = new FormData();
          const payload = buildPhotoPayload();
          if (payload?.file) {
            formData.append('photo', payload.file, payload.name || 'profile.jpg');
          }
          await uploadProfilePhoto(profile.document, formData);

          try {
            await verifyLocalProfile(profile.document);
          } catch (verifyErr) {
            console.error('Error al validar localmente:', verifyErr);
          }
        } catch (photoErr) {
          photoError = photoErr?.payload?.message || photoErr?.message || 'No se pudo subir la foto.';
        }
      } else {
        try {
          await verifyLocalProfile(profile.document);
        } catch (verifyErr) {
          console.error('Error al validar localmente:', verifyErr);
        }
      }

      if (getPasswordValidationError() === null && String(passwordForm.currentPassword || '').trim() && String(passwordForm.newPassword || '').trim()) {
        try {
          await updateProfilePassword({
            currentPassword: passwordForm.currentPassword.trim(),
            newPassword: passwordForm.newPassword.trim(),
          });
        } catch (pwErr) {
          passwordError = pwErr?.payload?.message || pwErr?.message || 'No se pudo actualizar la contraseña.';
        }
      }

      const freshProfile = await getUserProfile();
      setProfile(freshProfile);
      setPhoto(null);
      setPhotoRevision(Date.now());
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setModalVisible(false);

      if (photoError || passwordError) {
        Alert.alert(
          'Datos guardados',
          [
            photoError ? `La foto fallá: ${photoError}` : null,
            passwordError ? `La contraseña fallá: ${passwordError}` : null,
          ].filter(Boolean).join('\n\n'),
        );
      }
    } catch (err) {
      const apiMessage = err?.payload?.message || err?.message;
      if (err?.status === 403) {
        Alert.alert('Error', 'No tienes permiso para actualizar este perfil.');
        return;
      }
      Alert.alert('Error', apiMessage || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  const studentName = profile?.fullName || '';
  const studentInitial = studentName.charAt(0).toUpperCase();

  return (
    <WebFrame>
      <View style={styles.container}>
        <CarnetTopbar navigation={navigation} studentName={studentName} studentInitial={studentInitial} />
        <View style={styles.body}>
          {!isMobile && <UserSidebar navigation={navigation} activeKey="User" role={profile?.nameRole} />}
          <ScrollView style={styles.main}>
            {isMobile && <UserSidebar navigation={navigation} activeKey="User" role={profile?.nameRole} />}
            <ProfileInfoCard
              profile={profile}
              loading={loading}
              fields={fields}
              onEdit={openEdit}
              px={px}
              photoRevision={photoRevision}
            />
          </ScrollView>
        </View>

        <ProfileEditModal
          visible={modalVisible}
          fields={fields}
          form={form}
          onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
          onSave={handleSave}
          onCancel={closeEdit}
          saving={saving}
          currentPhotoUrl={profile?.photoUrl}
          photo={photo}
          onPhotoChange={setPhoto}
          userRole={profile?.nameRole}
          photoRevision={photoRevision}
          passwordForm={passwordForm}
          onPasswordChange={(key, value) => setPasswordForm((prev) => ({ ...prev, [key]: value }))}
        />
      </View>
    </WebFrame>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  body: { flex: 1, flexDirection: 'row' },
  main: { flex: 1 },
});
