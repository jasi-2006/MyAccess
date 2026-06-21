import { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { normalizeRole, ROLES } from '../utils/accessControl';
import { getUserProfile } from '../services/authService';

export default function InstructorDashboard({ navigation }) {
  useEffect(() => {
    getUserProfile()
      .then((profile) => {
        if (normalizeRole(profile?.nameRole) === ROLES.INSTRUCTOR) {
          navigation.replace('Fichas');
        } else {
          navigation.replace('Home');
        }
      })
      .catch(() => navigation.replace('Home'));
  }, []);

  return (
    <View style={styles.center}>
      <ActivityIndicator color="#079B72" size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EAE6E6' },
});
