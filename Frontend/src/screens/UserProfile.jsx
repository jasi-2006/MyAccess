import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { getUserProfile, updateUserProfile, uploadProfilePhoto, verifyLocalProfile } from '../services/authService';
import { validateCarnetPhoto } from '../services/photoValidationService.js';
import CarnetTopbar from '../components/CarnetTopbar.jsx';
import UserSidebar from '../components/UserSidebar.jsx';
import ProfileInfoCard from '../components/ProfileInfoCard.jsx';
import ProfileEditModal from '../components/ProfileEditModal.jsx';
import WebFrame from '../components/WebFrame.jsx';

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

  useEffect(() => {
    getUserProfile()
      .then(setProfile)
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  const fields = [
    { label: 'Nombre completo',  value: profile?.fullName,        key: 'fullName' },
    { label: 'Tipo documento',   value: profile?.typeDocument,    key: 'typeDocument' },
    { label: 'Documento',        value: profile?.document,        key: 'document', numeric: true },
    { label: 'Tipo de sangre',   value: profile?.bloodType,       key: 'bloodType' },
    { label: 'Ficha',            value: profile?.ficha,           key: 'ficha', numeric: true },
    { label: 'Programa',         value: profile?.trainingProgram, key: 'trainingProgram' },
    { label: 'Centro',           value: profile?.trainingCenter,  key: 'trainingCenter' },
    { label: 'Regional',         value: profile?.regional,        key: 'regional' },
    // { label: 'Role',              value: profile?.nameRole,        key: 'nameRole' },
    { label: 'email',            value: profile?.email,           key: 'email' },
    { label: 'Verificado Sofia Plus', value: profile?.sofiaVerified ? 'Verificado âœ“' : 'Pendiente âœ—', key: 'sofiaVerified' },
  ];


  const openEdit = () => {
    setForm(Object.fromEntries(fields.map((f) => [f.key, profile?.[f.key] || ''])));
    setPhoto(null);
    setModalVisible(true);
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

  const handleSave = async () => {
    if (!profile?.document) return;
    setSaving(true);
    let photoError = null;

    try {
      if (photo?.file) {
        const validation = await validateCarnetPhoto(photo.file);
        if (!validation.valid) {
          Alert.alert('Foto no vÃ¡lida', validation.errors.join('\n'));
          return;
        }
        if (validation.file) {
          // Use the preview URL provided by validation if available
          const uri = validation.previewUrl || URL.createObjectURL(validation.file);
          photo.file = validation.file;
          photo.uri = uri;
          setPhoto({ ...photo });
        }
      }

      await updateUserProfile(profile.document, buildUpdatePayload());

      if (photo) {
        try {
          const formData = new FormData();
          if (photo.file) {
            formData.append('photo', photo.file, photo.name || photo.fileName || 'profile.jpg');
          } else {
            formData.append('photo', {
              uri: photo.uri,
              name: photo.name || photo.fileName || 'profile.jpg',
              type: photo.type || 'image/jpeg',
            });
          }
          await uploadProfilePhoto(profile.document, formData);
          
          // Validar localmente y marcar como verificado si la foto estÃ¡ cargada
          try {
            await verifyLocalProfile(profile.document);
          } catch (verifyErr) {
            console.error('Error al validar localmente:', verifyErr);
          }
        } catch (photoErr) {
          photoError = photoErr?.payload?.message || photoErr?.message || 'No se pudo subir la foto.';
        }
      } else {
        // Si no hay foto, validar igualmente (pero no se marcarÃ¡ como verificado)
        try {
          await verifyLocalProfile(profile.document);
        } catch (verifyErr) {
          console.error('Error al validar localmente:', verifyErr);
        }
      }

      const freshProfile = await getUserProfile();
      setProfile(freshProfile);
      setPhoto(null);
      setModalVisible(false);

      if (photoError) {
        Alert.alert(
          'Datos guardados',
          `Tu informaciÃ³n se actualizÃ³, pero la foto fallÃ³: ${photoError}`,
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
            />
          </ScrollView>
        </View>

        <ProfileEditModal
          visible={modalVisible}
          fields={fields}
          form={form}
          onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))}
          onSave={handleSave}
          onCancel={() => {
            setPhoto(null);
            setModalVisible(false);
          }}
          saving={saving}
          currentPhotoUrl={profile?.photoUrl}
          photo={photo}
          onPhotoChange={setPhoto}
          userRole={profile?.nameRole}
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



