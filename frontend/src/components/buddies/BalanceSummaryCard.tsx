import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { DailyExpenseEntry } from '../../types/expense.types';
import DailyBalanceChart from './DailyBalanceChart';

interface BalanceSummaryCardProps {
  totalOwedToMe: number;
  totalIOwe: number;
  timeline: DailyExpenseEntry[];
}

const BalanceSummaryCard: React.FC<BalanceSummaryCardProps> = ({
  totalOwedToMe,
  totalIOwe,
  timeline,
}) => {
  const hasActivity = totalOwedToMe > 0 || totalIOwe > 0;
  const net = totalOwedToMe - totalIOwe;
  const netIsPositive = net > 0;
  const netIsZero = net === 0;

  if (!hasActivity && timeline.every(d => d.owedToMe === 0 && d.iOwe === 0)) {
    return (
      <Surface style={styles.card} elevation={1}>
        <Text variant="bodyLarge" style={styles.settled}>
          You're all settled up!
        </Text>
      </Surface>
    );
  }

  return (
    <Surface style={styles.card} elevation={1}>
      {/* You are owed / You owe columns */}
      <View style={styles.columns}>
        <View style={styles.column}>
          <Text variant="labelSmall" style={styles.colLabel}>You are owed</Text>
          <Text variant="titleMedium" style={styles.owed}>
            MYR {totalOwedToMe.toFixed(2)}
          </Text>
        </View>
        <View style={styles.colDivider} />
        <View style={[styles.column, styles.columnRight]}>
          <Text variant="labelSmall" style={styles.colLabel}>You owe</Text>
          <Text variant="titleMedium" style={totalIOwe > 0 ? styles.owes : styles.neutral}>
            MYR {totalIOwe.toFixed(2)}
          </Text>
        </View>
      </View>

      {/* Net balance strip */}
      <View style={styles.netRow}>
        <Text variant="labelSmall" style={styles.netLabel}>Net balance</Text>
        <Text
          variant="labelMedium"
          style={[
            styles.netAmount,
            netIsZero ? styles.netNeutral : netIsPositive ? styles.netPositive : styles.netNegative,
          ]}
        >
          {netIsZero
            ? 'Settled'
            : netIsPositive
            ? `+MYR ${net.toFixed(2)} in your favour`
            : `-MYR ${Math.abs(net).toFixed(2)} you owe more`}
        </Text>
      </View>

      {/* Chart legend */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
          <Text variant="labelSmall" style={styles.legendText}>Owed to me</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E65100' }]} />
          <Text variant="labelSmall" style={styles.legendText}>You owe</Text>
        </View>
      </View>

      {/* 7-day timeline chart */}
      <DailyBalanceChart data={timeline} />
    </Surface>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 16,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    paddingBottom: 12,
  },
  columns: {
    flexDirection: 'row',
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  column: {
    flex: 1,
    gap: 4,
  },
  columnRight: {
    alignItems: 'flex-end',
  },
  colDivider: {
    width: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 8,
  },
  colLabel: {
    color: '#9E9E9E',
    letterSpacing: 0.3,
  },
  owed: {
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  owes: {
    color: '#E65100',
    fontWeight: 'bold',
  },
  neutral: {
    color: '#9E9E9E',
    fontWeight: 'bold',
  },
  netRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#EEEEEE',
    marginBottom: 10,
  },
  netLabel: {
    color: '#9E9E9E',
    letterSpacing: 0.3,
  },
  netAmount: {
    fontWeight: '700',
  },
  netPositive: {
    color: '#2E7D32',
  },
  netNegative: {
    color: '#E65100',
  },
  netNeutral: {
    color: '#9E9E9E',
  },
  settled: {
    color: '#2E7D32',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 20,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#9E9E9E',
  },
});

export default BalanceSummaryCard;
