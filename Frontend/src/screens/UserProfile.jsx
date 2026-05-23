import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ScrollView, Alert, useWindowDimensions } from 'react-native';
import { getUserProfile, updateUserProfile } from '../services/authService';
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
    { label: 'Documento',        value: profile?.document,        key: 'document' },
    { label: 'Tipo de sangre',   value: profile?.bloodType,       key: 'bloodType' },
    { label: 'Ficha',            value: profile?.ficha,           key: 'ficha' },
    { label: 'Programa',         value: profile?.trainingProgram, key: 'trainingProgram' },
    { label: 'Centro',           value: profile?.trainingCenter,  key: 'trainingCenter' },
    { label: 'Regional',         value: profile?.regional,        key: 'regional' },
    // { label: 'Role',              value: profile?.nameRole,        key: 'nameRole' },
    { label: 'email',            value: profile?.email,           key: 'email' },
  ];

  const openEdit = () => {
    setForm(Object.fromEntries(fields.map((f) => [f.key, profile?.[f.key] || ''])));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!profile?.document) return;
    setSaving(true);
    try {
      const updated = await updateUserProfile(profile.document, {
        ...form,
        nameRole: form.nameRole || profile?.nameRole,
      });
      setProfile(updated);
      setModalVisible(false);
    } catch {
      Alert.alert('Error', 'No se pudo actualizar el perfil.');
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
          onCancel={() => setModalVisible(false)}
          saving={saving}
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
