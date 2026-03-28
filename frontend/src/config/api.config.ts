import { API_BASE_URL as ENV_API_URL } from '@env';

// API Configuration
// The URL is read from the .env file
// Fallback to Android emulator localhost if not set

export const API_BASE_URL = ENV_API_URL || 'http://10.0.2.2:5000/api';

// Environment-specific notes:
// - Android Emulator: http://10.0.2.2:5000/api (maps to host machine's localhost)
// - iOS Simulator: http://localhost:5000/api
// - Physical Device: http://YOUR_COMPUTER_IP:5000/api (e.g., http://192.168.1.100:5000/api)
// - Production: https://api.billsplitter.com/api

console.log('API Base URL:', API_BASE_URL);
