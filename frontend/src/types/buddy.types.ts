export interface Buddy {
  id: string;
  email: string;
  nickname: string | null;
  linkedUserId: string | null;
}

export interface BuddyBalance {
  buddy: Buddy;
  netAmount: number;
  direction: 'TheyOweMe' | 'IOwe' | 'Settled';
}

export interface BalanceSummary {
  totalOwedToMe: number;
  totalIOwe: number;
  balances: BuddyBalance[];
}
