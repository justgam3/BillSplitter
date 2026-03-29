import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from 'react-native-paper';
import AvatarInitials from '../common/AvatarInitials';
import { Buddy } from '../../types/buddy.types';

interface BuddySearchInputProps {
  buddies: Buddy[];
  selectedIds: string[];
  onSelect: (buddy: Buddy) => void;
  onAddNew: (email: string, nickname?: string) => void;
}

const BuddySearchInput: React.FC<BuddySearchInputProps> = ({
  buddies,
  selectedIds,
  onSelect,
  onAddNew,
}) => {
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [nicknamePrompt, setNicknamePrompt] = useState<string | null>(null);
  const [nickname, setNickname] = useState('');

  const filtered = buddies.filter(
    b =>
      !selectedIds.includes(b.id) &&
      (b.email.toLowerCase().includes(query.toLowerCase()) ||
        (b.nickname ?? '').toLowerCase().includes(query.toLowerCase()))
  );

  const showAddNew =
    query.trim().length > 0 &&
    query.includes('@') &&
    !buddies.some(b => b.email.toLowerCase() === query.toLowerCase().trim());

  const handleSelectBuddy = (buddy: Buddy) => {
    onSelect(buddy);
    setQuery('');
    setShowDropdown(false);
  };

  const handleAddNew = () => {
    setNicknamePrompt(query.trim());
    setShowDropdown(false);
  };

  const confirmAddNew = () => {
    if (nicknamePrompt) {
      onAddNew(nicknamePrompt, nickname.trim() || undefined);
      setNicknamePrompt(null);
      setNickname('');
      setQuery('');
    }
  };

  return (
    <View>
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search or add by email"
          placeholderTextColor="#9E9E9E"
          value={query}
          onChangeText={text => {
            setQuery(text);
            setShowDropdown(text.length > 0);
          }}
          onFocus={() => setShowDropdown(query.length > 0)}
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      {showDropdown && (filtered.length > 0 || showAddNew) && (
        <View style={styles.dropdown}>
          {filtered.map(buddy => (
            <TouchableOpacity
              key={buddy.id}
              style={styles.dropdownItem}
              onPress={() => handleSelectBuddy(buddy)}
            >
              <AvatarInitials name={buddy.nickname ?? buddy.email} size={32} />
              <View style={styles.dropdownText}>
                {buddy.nickname && (
                  <Text variant="bodyMedium" style={styles.primaryText}>{buddy.nickname}</Text>
                )}
                <Text variant="bodySmall" style={styles.secondaryText}>{buddy.email}</Text>
              </View>
            </TouchableOpacity>
          ))}
          {showAddNew && (
            <TouchableOpacity style={styles.dropdownItem} onPress={handleAddNew}>
              <View style={styles.addIcon}>
                <Text style={styles.addIconText}>+</Text>
              </View>
              <Text variant="bodyMedium" style={styles.primaryText}>
                Add "{query.trim()}"
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Nickname prompt modal */}
      <Modal
        visible={nicknamePrompt !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setNicknamePrompt(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text variant="titleMedium" style={styles.modalTitle}>
              Add buddy
            </Text>
            <Text variant="bodySmall" style={styles.modalEmail}>
              {nicknamePrompt}
            </Text>
            <TextInput
              style={styles.nicknameInput}
              placeholder="Nickname (optional)"
              placeholderTextColor="#9E9E9E"
              value={nickname}
              onChangeText={setNickname}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setNicknamePrompt(null)} style={styles.modalBtn}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmAddNew} style={[styles.modalBtn, styles.confirmBtn]}>
                <Text style={styles.confirmText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#212121',
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F0',
  },
  dropdownText: {
    flex: 1,
  },
  primaryText: {
    color: '#212121',
  },
  secondaryText: {
    color: '#757575',
  },
  addIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#212121',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addIconText: {
    color: '#FFFFFF',
    fontSize: 20,
    lineHeight: 22,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    gap: 12,
  },
  modalTitle: {
    color: '#212121',
    fontWeight: 'bold',
  },
  modalEmail: {
    color: '#757575',
  },
  nicknameInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#212121',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 4,
  },
  modalBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  cancelText: {
    color: '#757575',
    fontSize: 15,
  },
  confirmBtn: {
    backgroundColor: '#212121',
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default BuddySearchInput;
