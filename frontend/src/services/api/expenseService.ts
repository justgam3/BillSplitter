import apiClient from './apiClient';
import { CreateExpensePayload, Expense, DailyExpenseEntry } from '../../types/expense.types';
import { BalanceSummary } from '../../types/buddy.types';

const expenseService = {
  async createExpense(payload: CreateExpensePayload): Promise<Expense> {
    const response = await apiClient.post<Expense>('/expenses', payload);
    return response.data;
  },

  async getTimeline(days: number = 14): Promise<DailyExpenseEntry[]> {
    const response = await apiClient.get<DailyExpenseEntry[]>(`/expenses/timeline?days=${days}`);
    return response.data;
  },

  async getBalances(): Promise<BalanceSummary> {
    const response = await apiClient.get<{
      totalOwedToMe: number;
      totalIOwe: number;
      balances: Array<{
        buddyId: string;
        email: string;
        nickname: string | null;
        netAmount: number;
        direction: string;
      }>;
    }>('/expenses/balances');

    const data = response.data;
    return {
      totalOwedToMe: data.totalOwedToMe,
      totalIOwe: data.totalIOwe,
      balances: data.balances.map(b => ({
        buddy: { id: b.buddyId, email: b.email, nickname: b.nickname, linkedUserId: null },
        netAmount: b.netAmount,
        direction: b.direction as 'TheyOweMe' | 'IOwe' | 'Settled',
      })),
    };
  },
};

export { expenseService };
