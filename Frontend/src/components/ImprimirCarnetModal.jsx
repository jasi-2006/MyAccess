import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { IndividualCarnet } from './ImprimirCarnetViews.jsx';

export default function ImprimirCarnetModal({ styles, selectedCarnet, onClose, onPrint }) {
  const displayName =
    selectedCarnet?.name ||
    selectedCarnet?.learner?.fullName ||
    selectedCarnet?.learner?.full_name ||
    'Carnet individual';

  return (
    <Modal visible={Boolean(selectedCarnet)} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalPanel}>
          <View style={styles.modalHeader}>
            <View style={styles.modalTitleBlock}>
              <Text style={styles.modalTitle}>{displayName}</Text>
              <Text style={styles.modalSubtitle} numberOfLines={1}>
                Carnet individual
              </Text>
            </View>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>

          {selectedCarnet ? (
            <ScrollView style={{ maxHeight: 520 }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.singlePrintArea} nativeID="single-print-area">
              <IndividualCarnet learner={selectedCarnet.learner} card={selectedCarnet.card} />
            </ScrollView>
          ) : null}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.printBtn} onPress={onPrint}>
              <Text style={styles.printBtnText}>Imprimir este carnet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
