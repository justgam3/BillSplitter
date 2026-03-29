import apiClient from './apiClient';
import { Buddy, BalanceSummary } from '../../types/buddy.types';

const buddyService = {
  async addBuddy(email: string, nickname?: string): Promise<Buddy> {
    const response = await apiClient.post<Buddy>('/buddies', { email, nickname });
    return response.data;
  },

  async getBuddies(): Promise<Buddy[]> {
    const response = await apiClient.get<Buddy[]>('/buddies');
    return response.data;
  },

  async updateNickname(buddyId: string, nickname: string): Promise<Buddy> {
    const response = await apiClient.patch<Buddy>(`/buddies/${buddyId}/nickname`, { nickname });
    return response.data;
  },
};

export { buddyService };
