import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import AvatarInitials from '../common/AvatarInitials';

export interface ChipParticipant {
  id: string;      // buddyId or 'self'
  label: string;   // display name
  isSelf: boolean;
}

interface ParticipantChipProps {
  participant: ChipParticipant;
  onRemove: (id: string) => void;
}

const ParticipantChip: React.FC<ParticipantChipProps> = ({ participant, onRemove }) => {
  return (
    <View style={styles.chip}>
      <AvatarInitials name={participant.label} size={28} />
      <Text variant="bodySmall" style={styles.label}>{participant.label}</Text>
      {!participant.isSelf && (
        <TouchableOpacity onPress={() => onRemove(participant.id)} hitSlop={8}>
          <Text style={styles.remove}>×</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0E0E0',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 8,
    gap: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  label: {
    color: '#212121',
  },
  remove: {
    fontSize: 16,
    color: '#757575',
    lineHeight: 18,
  },
});

export default ParticipantChip;
