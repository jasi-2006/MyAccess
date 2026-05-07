import { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import CreateNotificationModal from '../components/CreateNotificationModal.jsx';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';

export default function InstructorDashboard({ navigation }) {
  const [notificationModalVisible, setNotificationModalVisible] = useState(false);

  return (
    <Layout title="Area de instructor" navigation={navigation} activeKey="Instructor">
      <Text style={styles.subtitle}>
        Seleccione sus fichas, revise solicitudes o consulte el carnet digital.
      </Text>

      <View style={styles.row}>
        <StatCard title="Fichas" value="128" />
        <StatCard title="Solicitudes" value="12" />
        <StatCard title="Validados" value="8" />
        <StatCard title="Impresos" value="45" />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Fichas')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionTitle}>Ver fichas</Text>
          <Text style={styles.actionText}>Gestionar grupos y programas activos.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Solicitudes')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionTitle}>Ver solicitudes</Text>
          <Text style={styles.actionText}>Revisar estados de impresion de carnets.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Card')}
          activeOpacity={0.85}
        >
          <Text style={styles.actionTitle}>Ver carnet digital</Text>
          <Text style={styles.actionText}>Abrir la misma estructura de carnet que ve el aprendiz.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setNotificationModalVisible(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.actionTitle}>Crear notificacion</Text>
          <Text style={styles.actionText}>Enviar un aviso a un usuario o dejarlo registrado en gestion.</Text>
        </TouchableOpacity>
      </View>

      <CreateNotificationModal
        visible={notificationModalVisible}
        onClose={() => setNotificationModalVisible(false)}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 15,
  },
  actionButton: {
    flexBasis: 240,
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderColor: '#DDF7EC',
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
  },
  actionTitle: {
    color: '#079B72',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  actionText: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '700',
  },
});
