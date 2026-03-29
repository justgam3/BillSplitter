import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SplitType } from '../../types/expense.types';

interface SplitTypeSelectorProps {
  value: SplitType;
  onChange: (type: SplitType) => void;
}

const OPTIONS: { label: string; value: SplitType }[] = [
  { label: 'Equally', value: 'Equal' },
  { label: 'By %', value: 'Percentage' },
  { label: 'Exact', value: 'Exact' },
];

const SplitTypeSelector: React.FC<SplitTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      {OPTIONS.map(opt => (
        <TouchableOpacity
          key={opt.value}
          style={[styles.option, value === opt.value && styles.optionActive]}
          onPress={() => onChange(opt.value)}
        >
          <Text
            variant="bodySmall"
            style={[styles.optionText, value === opt.value && styles.optionTextActive]}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  optionActive: {
    backgroundColor: '#212121',
  },
  optionText: {
    color: '#757575',
  },
  optionTextActive: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default SplitTypeSelector;
