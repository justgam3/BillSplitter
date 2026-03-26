import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Appbar, FAB } from 'react-native-paper';
import { tokenService } from '../services/api/tokenService';
import { authService } from '../services/api/authService';

interface MainScreenProps {
  onLogout: () => void;
}

const MainScreen: React.FC<MainScreenProps> = ({ onLogout }) => {
  const [email, setEmail] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    const userData = await tokenService.getUserData();
    if (userData) {
      setEmail(userData.email);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    onLogout();
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="BillSplitter" />
        <Appbar.Action
          icon="account-circle"
          onPress={() => setMenuVisible(!menuVisible)}
        />
      </Appbar.Header>

      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.welcome}>
          Welcome!
        </Text>
        <Text variant="bodyLarge" style={styles.email}>
          {email}
        </Text>

        <View style={styles.emptyState}>
          <Text variant="bodyLarge" style={styles.emptyText}>
            Your expense groups will appear here
          </Text>
        </View>
      </View>

      {menuVisible && (
        <View style={styles.menu}>
          <Text
            variant="bodyLarge"
            style={styles.menuItem}
            onPress={handleLogout}
          >
            Logout
          </Text>
        </View>
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        label="Add Expense"
        disabled
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  welcome: {
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 8,
  },
  email: {
    color: '#757575',
    marginBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  menu: {
    position: 'absolute',
    top: 64,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuItem: {
    padding: 12,
    color: '#212121',
  },
});

export default MainScreen;
