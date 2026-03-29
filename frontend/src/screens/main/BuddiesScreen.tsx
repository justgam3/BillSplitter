import React, { useCallback, useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Appbar, FAB, Menu, Divider, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { buddyService } from '../../services/api/buddyService';
import { expenseService } from '../../services/api/expenseService';
import { authService } from '../../services/api/authService';
import { Buddy, BalanceSummary } from '../../types/buddy.types';
import { DailyExpenseEntry } from '../../types/expense.types';
import BalanceSummaryCard from '../../components/buddies/BalanceSummaryCard';
import BuddyRow from '../../components/buddies/BuddyRow';
import { AppModalParamList } from '../../navigation/types';

interface BuddiesScreenProps {
  onLogout: () => void;
}

const BuddiesScreen: React.FC<BuddiesScreenProps> = ({ onLogout }) => {
  const navigation = useNavigation<NativeStackNavigationProp<AppModalParamList>>();
  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [summary, setSummary] = useState<BalanceSummary>({ totalOwedToMe: 0, totalIOwe: 0, balances: [] });
  const [timeline, setTimeline] = useState<DailyExpenseEntry[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [buddyList, balanceSummary, timelineData] = await Promise.all([
        buddyService.getBuddies(),
        expenseService.getBalances(),
        expenseService.getTimeline(7),
      ]);
      setBuddies(buddyList);
      setSummary(balanceSummary);
      setTimeline(timelineData);
    } catch (error) {
      console.error('Failed to load buddies data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  const handleAddExpense = () => {
    navigation.navigate('AddExpense');
  };

  const balanceMap = new Map(summary.balances.map(b => [b.buddy.id, b]));

  const buddiesWithBalances = buddies.map(buddy => {
    const balance = balanceMap.get(buddy.id);
    return balance ?? { buddy, netAmount: 0, direction: 'Settled' as const };
  });

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="BillSplitter" titleStyle={styles.appbarTitle} />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="account-circle"
              color="#FFFFFF"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item onPress={handleLogout} title="Logout" />
        </Menu>
      </Appbar.Header>

      <FlatList
        data={buddiesWithBalances}
        keyExtractor={item => item.buddy.id}
        ListHeaderComponent={
          <View>
            {/* Overall section header */}
            <View style={styles.sectionHeader}>
              <Text variant="titleSmall" style={styles.sectionTitle}>OVERALL</Text>
              <View style={styles.sectionLine} />
            </View>
            <BalanceSummaryCard
              totalOwedToMe={summary.totalOwedToMe}
              totalIOwe={summary.totalIOwe}
              timeline={timeline}
            />
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyState}>
              <Text variant="bodyLarge" style={styles.emptyText}>
                No buddies yet. Add an expense to get started!
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <>
            {index === 0 && (
              <Text variant="labelSmall" style={styles.friendsLabel}>
                FRIENDS
              </Text>
            )}
            <BuddyRow balance={item} />
            <Divider />
          </>
        )}
        contentContainerStyle={styles.list}
      />

      <FAB
        icon="plus"
        label="Add Expense"
        color="#FFFFFF"
        style={styles.fab}
        onPress={handleAddExpense}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  appbar: {
    backgroundColor: '#212121',
  },
  appbarTitle: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  list: {
    paddingBottom: 88,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 4,
    gap: 10,
  },
  sectionTitle: {
    color: '#212121',
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  friendsLabel: {
    color: '#9E9E9E',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
    letterSpacing: 1,
  },
  emptyState: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    marginTop: 16,
  },
  emptyText: {
    color: '#BDBDBD',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#212121',
  },
});

export default BuddiesScreen;
