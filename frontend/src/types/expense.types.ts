export type SplitType = 'Equal' | 'Percentage' | 'Exact';

export interface Participant {
  buddyId?: string;
  self?: boolean;
  amount: number;
}

export interface CreateExpensePayload {
  description: string;
  amount: number;
  currencyCode: string;
  splitType: SplitType;
  paidBy: { type: 'Me' } | { type: 'Buddy'; buddyId: string };
  participants: Participant[];
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currencyCode: string;
  splitType: string;
}

export interface DailyExpenseEntry {
  date: string;       // "YYYY-MM-DD"
  owedToMe: number;
  iOwe: number;
}
