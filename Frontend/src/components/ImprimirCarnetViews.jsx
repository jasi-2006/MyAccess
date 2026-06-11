import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import CarnetCard from './CarnetCard.jsx';
import { learnerToProfile } from '../screens/imprimirUtils.jsx';

export function CarnetPreview({ learner, card, onPress }) {
  const profile = learnerToProfile(learner);
  const content = (
    <CarnetCard profile={profile} card={card} loading={false} cardError="" />
  );

  if (!onPress) {
    return content;
  }

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88}>
      {content}
    </TouchableOpacity>
  );
}

export function IndividualCarnet({ learner, card }) {
  const profile = learnerToProfile(learner);

  return (
    <View style={{ alignItems: 'center' }}>
      <CarnetCard profile={profile} card={card} loading={false} cardError="" />
    </View>
  );
}
