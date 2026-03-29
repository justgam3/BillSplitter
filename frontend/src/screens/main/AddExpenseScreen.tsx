import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Appbar, Text, TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { buddyService } from '../../services/api/buddyService';
import { expenseService } from '../../services/api/expenseService';
import { Buddy } from '../../types/buddy.types';
import { SplitType } from '../../types/expense.types';
import { AppModalParamList } from '../../navigation/types';

import BuddySearchInput from '../../components/expense/BuddySearchInput';
import ParticipantChip, { ChipParticipant } from '../../components/expense/ParticipantChip';
import SplitTypeSelector from '../../components/expense/SplitTypeSelector';
import SplitBreakdown, { SplitEntry } from '../../components/expense/SplitBreakdown';

const SELF_ID = 'self';

const AddExpenseScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<AppModalParamList>>();

  const [buddies, setBuddies] = useState<Buddy[]>([]);
  const [description, setDescription] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [splitType, setSplitType] = useState<SplitType>('Equal');
  const [paidById, setPaidById] = useState<string>(SELF_ID); // 'self' or buddyId
  const [participants, setParticipants] = useState<ChipParticipant[]>([
    { id: SELF_ID, label: 'You', isSelf: true },
  ]);
  const [splits, setSplits] = useState<SplitEntry[]>([
    { participantId: SELF_ID, label: 'You', amount: 0, percentage: 100 },
  ]);
  const [saving, setSaving] = useState(false);
  const [showPaidByDropdown, setShowPaidByDropdown] = useState(false);

  const totalAmount = parseFloat(amountStr) || 0;

  useEffect(() => {
    buddyService.getBuddies().then(setBuddies).catch(console.error);
  }, []);

  // Recompute splits when participants or splitType or amount changes
  useEffect(() => {
    const count = participants.length;
    if (count === 0) return;

    if (splitType === 'Equal') {
      const each = count > 0 ? totalAmount / count : 0;
      setSplits(participants.map(p => ({
        participantId: p.id,
        label: p.label,
        amount: parseFloat(each.toFixed(2)),
        percentage: parseFloat((100 / count).toFixed(2)),
      })));
    } else {
      // Preserve existing entries, add/remove as needed
      setSplits(prev => {
        const existing = new Map(prev.map(s => [s.participantId, s]));
        return participants.map(p => {
          if (existing.has(p.id)) return { ...existing.get(p.id)!, label: p.label };
          return { participantId: p.id, label: p.label, amount: 0, percentage: 0 };
        });
      });
    }
  }, [participants, splitType, totalAmount]);

  const addParticipant = useCallback((buddy: Buddy) => {
    setParticipants(prev => [
      ...prev,
      { id: buddy.id, label: buddy.nickname ?? buddy.email, isSelf: false },
    ]);
  }, []);

  const addNewBuddy = useCallback(async (email: string, nickname?: string) => {
    try {
      const newBuddy = await buddyService.addBuddy(email, nickname);
      setBuddies(prev => [...prev, newBuddy]);
      setParticipants(prev => [
        ...prev,
        { id: newBuddy.id, label: newBuddy.nickname ?? newBuddy.email, isSelf: false },
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to add buddy. Please try again.');
    }
  }, []);

  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    if (paidById === id) setPaidById(SELF_ID);
  }, [paidById]);

  const selectedBuddyIds = useMemo(
    () => participants.filter(p => !p.isSelf).map(p => p.id),
    [participants]
  );

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert('Missing info', 'Please enter a description.');
      return;
    }
    if (totalAmount <= 0) {
      Alert.alert('Missing info', 'Please enter a valid amount.');
      return;
    }
    if (participants.length < 2) {
      Alert.alert('Missing info', 'Please add at least one buddy to split with.');
      return;
    }

    const splitSum = splits.reduce((sum, s) => sum + s.amount, 0);
    if (splitType === 'Percentage') {
      const pctSum = splits.reduce((sum, s) => sum + s.percentage, 0);
      if (Math.abs(pctSum - 100) > 0.1) {
        Alert.alert('Invalid split', `Percentages must sum to 100% (currently ${pctSum.toFixed(1)}%).`);
        return;
      }
    } else if (splitType === 'Exact') {
      if (Math.abs(splitSum - totalAmount) > 0.01) {
        Alert.alert('Invalid split', `Amounts must sum to MYR ${totalAmount.toFixed(2)} (currently ${splitSum.toFixed(2)}).`);
        return;
      }
    }

    try {
      setSaving(true);

      const paidBy =
        paidById === SELF_ID
          ? { type: 'Me' as const }
          : { type: 'Buddy' as const, buddyId: paidById };

      const expenseParticipants = splits.map(s => ({
        buddyId: s.participantId === SELF_ID ? undefined : s.participantId,
        self: s.participantId === SELF_ID,
        amount: s.amount,
      }));

      await expenseService.createExpense({
        description: description.trim(),
        amount: totalAmount,
        currencyCode: 'MYR',
        splitType,
        paidBy,
        participants: expenseParticipants,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to save expense. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const paidByLabel =
    paidById === SELF_ID
      ? 'You'
      : participants.find(p => p.id === paidById)?.label ?? 'You';

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Action icon="close" color="#212121" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Expense" titleStyle={styles.appbarTitle} />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Description */}
        <Text variant="labelMedium" style={styles.fieldLabel}>Description</Text>
        <TextInput
          mode="outlined"
          placeholder="e.g. Dinner, Groceries..."
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          outlineColor="#E0E0E0"
          activeOutlineColor="#212121"
        />

        {/* Amount */}
        <Text variant="labelMedium" style={styles.fieldLabel}>Amount (MYR)</Text>
        <TextInput
          mode="outlined"
          placeholder="0.00"
          keyboardType="decimal-pad"
          value={amountStr}
          onChangeText={setAmountStr}
          style={styles.input}
          outlineColor="#E0E0E0"
          activeOutlineColor="#212121"
        />

        {/* Paid by */}
        <Text variant="labelMedium" style={styles.fieldLabel}>Paid by</Text>
        <TouchableOpacity
          style={styles.dropdown}
          onPress={() => setShowPaidByDropdown(!showPaidByDropdown)}
        >
          <Text variant="bodyMedium" style={styles.dropdownText}>{paidByLabel}</Text>
          <Text style={styles.dropdownArrow}>▼</Text>
        </TouchableOpacity>
        {showPaidByDropdown && (
          <View style={styles.dropdownList}>
            {participants.map(p => (
              <TouchableOpacity
                key={p.id}
                style={styles.dropdownItem}
                onPress={() => { setPaidById(p.id); setShowPaidByDropdown(false); }}
              >
                <Text variant="bodyMedium" style={[styles.dropdownText, paidById === p.id && styles.dropdownSelected]}>
                  {p.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Split with — search */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text variant="labelMedium" style={styles.sectionLabel}>Split with</Text>
          <View style={styles.dividerLine} />
        </View>

        <BuddySearchInput
          buddies={buddies}
          selectedIds={selectedBuddyIds}
          onSelect={addParticipant}
          onAddNew={addNewBuddy}
        />

        {/* Selected participant chips */}
        {participants.length > 0 && (
          <View style={styles.chips}>
            {participants.map(p => (
              <ParticipantChip key={p.id} participant={p} onRemove={removeParticipant} />
            ))}
          </View>
        )}

        {/* How to split */}
        <View style={styles.sectionDivider}>
          <View style={styles.dividerLine} />
          <Text variant="labelMedium" style={styles.sectionLabel}>How to split?</Text>
          <View style={styles.dividerLine} />
        </View>

        <SplitTypeSelector value={splitType} onChange={setSplitType} />

        {participants.length > 0 && (
          <View style={styles.breakdown}>
            <SplitBreakdown
              participants={participants}
              splitType={splitType}
              totalAmount={totalAmount}
              splits={splits}
              onSplitsChange={setSplits}
            />
          </View>
        )}

        {/* Save button */}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
          buttonColor="#212121"
        >
          Save Expense
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  appbar: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  appbarTitle: {
    color: '#212121',
    fontWeight: 'bold',
  },
  scroll: {
    padding: 16,
    gap: 8,
    paddingBottom: 32,
  },
  fieldLabel: {
    color: '#757575',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  dropdownText: {
    color: '#212121',
  },
  dropdownArrow: {
    color: '#757575',
    fontSize: 12,
  },
  dropdownList: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 2,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  dropdownSelected: {
    fontWeight: 'bold',
  },
  sectionDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    gap: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  sectionLabel: {
    color: '#9E9E9E',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  breakdown: {
    marginTop: 12,
  },
  saveButton: {
    marginTop: 24,
    borderRadius: 8,
  },
  saveButtonContent: {
    paddingVertical: 6,
  },
});

export default AddExpenseScreen;
