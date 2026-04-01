import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../constants/styles';

const BottomTab = ({ active, setActive }) => {
  const tabs = ['Registrate', 'login', 'Datos'];
  return (
    <View style={styles.bottomTab}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tabItem, active === tab && styles.tabItemActive]}
          onPress={() => setActive(tab)}
        >
          <Text style={[styles.tabText, active === tab && styles.tabTextActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default BottomTab;