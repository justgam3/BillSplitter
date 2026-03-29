import React from 'react';
import { View, StyleSheet, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { SplitType } from '../../types/expense.types';
import { ChipParticipant } from './ParticipantChip';

export interface SplitEntry {
  participantId: string;
  label: string;
  amount: number;
  percentage: number;
}

interface SplitBreakdownProps {
  participants: ChipParticipant[];
  splitType: SplitType;
  totalAmount: number;
  splits: SplitEntry[];
  onSplitsChange: (splits: SplitEntry[]) => void;
}

const SplitBreakdown: React.FC<SplitBreakdownProps> = ({
  participants,
  splitType,
  totalAmount,
  splits,
  onSplitsChange,
}) => {
  const updateAmount = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    onSplitsChange(splits.map(s => s.participantId === id ? { ...s, amount: num } : s));
  };

  const updatePercentage = (id: string, value: string) => {
    const pct = parseFloat(value) || 0;
    const amount = (pct / 100) * totalAmount;
    onSplitsChange(splits.map(s => s.participantId === id ? { ...s, percentage: pct, amount } : s));
  };

  return (
    <View style={styles.container}>
      {splits.map(split => (
        <View key={split.participantId} style={styles.row}>
          <Text variant="bodyMedium" style={styles.name}>{split.label}</Text>
          {splitType === 'Equal' && (
            <Text variant="bodyMedium" style={styles.amount}>
              MYR {split.amount.toFixed(2)}
            </Text>
          )}
          {splitType === 'Percentage' && (
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={split.percentage.toString()}
                onChangeText={v => updatePercentage(split.participantId, v)}
                placeholder="0"
              />
              <Text variant="bodySmall" style={styles.unit}>%</Text>
              <Text variant="bodySmall" style={styles.computed}>
                = MYR {split.amount.toFixed(2)}
              </Text>
            </View>
          )}
          {splitType === 'Exact' && (
            <View style={styles.inputRow}>
              <Text variant="bodySmall" style={styles.unit}>MYR</Text>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                value={split.amount.toFixed(2)}
                onChangeText={v => updateAmount(split.participantId, v)}
                placeholder="0.00"
              />
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  name: {
    flex: 1,
    color: '#212121',
  },
  amount: {
    color: '#212121',
    fontWeight: '600',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#212121',
    minWidth: 60,
    textAlign: 'right',
    fontSize: 14,
    paddingVertical: 2,
    color: '#212121',
  },
  unit: {
    color: '#757575',
  },
  computed: {
    color: '#9E9E9E',
    marginLeft: 4,
  },
});

export default SplitBreakdown;
