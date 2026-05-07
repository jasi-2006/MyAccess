import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout.jsx';
import StatCard from '../components/StatCard.jsx';

export default function HistorialScreen({ navigation }) {
  return (
    <Layout title="Historial" navigation={navigation} activeKey="Historial">
      <View style={styles.row}>
        <StatCard title="Seleccion" value="120" />
        <StatCard title="Validacion" value="45" />
        <StatCard title="Solicitud" value="30" />
        <StatCard title="Impresion" value="15" />
      </View>

      <View style={styles.chart}>
        <Text style={styles.chartText}>Resumen de movimientos recientes</Text>
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
  chart: {
    backgroundColor: '#FFFFFF',
    marginTop: 15,
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDF7EC',
  },
  chartText: {
    color: '#6B7280',
    fontWeight: '700',
  },
});
