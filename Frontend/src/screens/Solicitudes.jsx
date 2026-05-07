import { View, Text, StyleSheet } from 'react-native';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';

export default function SolicitudesScreen({ navigation }) {
  return (
    <Layout title="Solicitud de impresiones" navigation={navigation} activeKey="Solicitudes">
      <View style={styles.row}>
        <StatCard title="Pendientes" value="12" />
        <StatCard title="Validados" value="8" />
        <StatCard title="Impresos" value="45" />
      </View>

      <View style={styles.table}>
        <Text style={styles.tableTitle}>Solicitudes recientes</Text>
        <Text style={styles.tableText}>Coni Largo - Pendiente</Text>
        <Text style={styles.tableText}>Jersson Velasquez - Validado</Text>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  table: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDF7EC',
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
});
