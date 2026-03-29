import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import AvatarInitials from '../common/AvatarInitials';
import { BuddyBalance } from '../../types/buddy.types';

interface BuddyRowProps {
  balance: BuddyBalance;
}

const BuddyRow: React.FC<BuddyRowProps> = ({ balance }) => {
  const { buddy, netAmount, direction } = balance;
  const displayName = buddy.nickname ?? buddy.email;

  const isOwed = direction === 'TheyOweMe';
  const isOwe = direction === 'IOwe';
  const isSettled = direction === 'Settled';

  const directionLabel = isOwed ? 'owes you' : isOwe ? 'you owe' : 'settled up';
  const amountText = isSettled ? '—' : `MYR ${netAmount.toFixed(2)}`;

  const amountStyle = isOwed ? styles.amountOwed : isOwe ? styles.amountOwes : styles.amountSettled;
  const labelStyle = isOwed ? styles.labelOwed : isOwe ? styles.labelOwes : styles.labelSettled;

  return (
    <View style={styles.row}>
      <AvatarInitials name={displayName} size={44} />
      <Text variant="bodyLarge" style={styles.name} numberOfLines={1}>
        {displayName}
      </Text>
      <View style={styles.amountBlock}>
        <Text variant="labelSmall" style={labelStyle}>
          {directionLabel}
        </Text>
        <Text variant="bodyMedium" style={amountStyle}>
          {amountText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  name: {
    flex: 1,
    color: '#212121',
  },
  amountBlock: {
    alignItems: 'flex-end',
    gap: 2,
  },
  labelOwed: {
    color: '#2E7D32',
    letterSpacing: 0.3,
  },
  labelOwes: {
    color: '#E65100',
    letterSpacing: 0.3,
  },
  labelSettled: {
    color: '#9E9E9E',
    letterSpacing: 0.3,
  },
  amountOwed: {
    color: '#2E7D32',
    fontWeight: '700',
  },
  amountOwes: {
    color: '#E65100',
    fontWeight: '700',
  },
  amountSettled: {
    color: '#9E9E9E',
  },
});

export default BuddyRow;
