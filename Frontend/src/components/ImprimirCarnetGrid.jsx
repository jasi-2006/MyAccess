import React from 'react';
import { View, Text } from 'react-native';
import { CarnetPreview } from './ImprimirCarnetViews.jsx';

export default function ImprimirCarnetGrid({
  styles,
  fichaLearners,
  fichasToPrint,
  cardsByUser,
  isPrintingAll,
  onSelectCarnet,
}) {
  return (
    <View style={styles.carnetGrid} nativeID="print-area">
      {fichaLearners.length === 0 ? (
        <Text style={styles.emptyText}>No hay aprendices en esta ficha.</Text>
      ) : (
        fichasToPrint.map((ficha) => {
          const learnersByFicha = fichaLearners.filter((learner) => String(learner?.ficha || learner?.files || '').trim() === ficha);
          if (learnersByFicha.length === 0) return null;

          return (
            <View key={ficha} style={styles.fichaPrintGroup}>
              {isPrintingAll ? <Text style={styles.fichaPrintTitle}>Ficha #{ficha}</Text> : null}
              <View style={styles.carnetGrid}>
                {learnersByFicha.map((learner) => {
                  const card = cardsByUser[learner.id];
                  const name = learner.fullName || learner.full_name || `Aprendiz #${learner.id}`;
                  return (
                    <CarnetPreview
                      key={learner.id}
                      learner={learner}
                      card={card}
                      name={name}
                      onPress={() => onSelectCarnet({ learner, card, name })}
                    />
                  );
                })}
              </View>
            </View>
          );
        })
      )}
    </View>
  );
}
