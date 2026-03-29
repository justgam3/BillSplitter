import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { DailyExpenseEntry } from '../../types/expense.types';

interface DailyBalanceChartProps {
  data: DailyExpenseEntry[];  // exactly 7 entries, oldest → today
}

const BAR_MAX_HEIGHT = 60;

function shortDay(dateStr: string): string {
  // dateStr is "YYYY-MM-DD"
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3);
}

function shortDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return String(d.getDate());
}

const DailyBalanceChart: React.FC<DailyBalanceChartProps> = ({ data }) => {
  const maxTotal = Math.max(...data.map(d => d.owedToMe + d.iOwe), 1);
  const isToday = (_: string, index: number) => index === data.length - 1;

  return (
    <View style={styles.container}>
      {/* Bar rows */}
      <View style={styles.barsRow}>
        {data.map((entry, index) => {
          const today = isToday(entry.date, index);
          const total = entry.owedToMe + entry.iOwe;
          const totalBarH = (total / maxTotal) * BAR_MAX_HEIGHT;
          const owedH = total > 0 ? (entry.owedToMe / total) * totalBarH : 0;
          const oweH = total > 0 ? (entry.iOwe / total) * totalBarH : 0;
          const isEmpty = total === 0;
          const hasBoth = entry.owedToMe > 0 && entry.iOwe > 0;

          return (
            <View key={entry.date} style={styles.column}>
              {/* Bar area */}
              <View style={styles.barArea}>
                {isEmpty ? (
                  <View style={[styles.emptyDash, today && styles.emptyDashToday]} />
                ) : (
                  <View style={styles.stack}>
                    {owedH > 0 && (
                      <View
                        style={[
                          styles.segment,
                          {
                            height: owedH,
                            backgroundColor: '#2E7D32',
                            borderTopLeftRadius: 4,
                            borderTopRightRadius: 4,
                            borderBottomLeftRadius: hasBoth ? 0 : 4,
                            borderBottomRightRadius: hasBoth ? 0 : 4,
                          },
                        ]}
                      />
                    )}
                    {oweH > 0 && (
                      <View
                        style={[
                          styles.segment,
                          {
                            height: oweH,
                            backgroundColor: '#E65100',
                            borderTopLeftRadius: hasBoth ? 0 : 4,
                            borderTopRightRadius: hasBoth ? 0 : 4,
                            borderBottomLeftRadius: 4,
                            borderBottomRightRadius: 4,
                          },
                        ]}
                      />
                    )}
                  </View>
                )}
              </View>

              {/* Baseline */}
              <View style={[styles.baseline, today && styles.baselineToday]} />

              {/* Labels */}
              <Text style={[styles.dateNum, today && styles.labelToday]}>{shortDate(entry.date)}</Text>
              <Text style={[styles.dayStr, today && styles.labelToday]}>{shortDay(entry.date)}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 4,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  barArea: {
    height: BAR_MAX_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'center',
    width: '100%',
  },
  stack: {
    width: '60%',
    alignItems: 'stretch',
  },
  segment: {
    width: '100%',
  },
  emptyDash: {
    width: '60%',
    height: 3,
    borderRadius: 2,
    backgroundColor: '#EEEEEE',
  },
  emptyDashToday: {
    backgroundColor: '#BDBDBD',
  },
  baseline: {
    width: '100%',
    height: 1,
    backgroundColor: '#E0E0E0',
    marginTop: 4,
    marginBottom: 4,
  },
  baselineToday: {
    backgroundColor: '#212121',
    height: 2,
    borderRadius: 1,
  },
  dateNum: {
    fontSize: 10,
    color: '#9E9E9E',
    lineHeight: 14,
  },
  dayStr: {
    fontSize: 9,
    color: '#BDBDBD',
    lineHeight: 12,
  },
  labelToday: {
    color: '#212121',
    fontWeight: '700',
  },
});

export default DailyBalanceChart;
