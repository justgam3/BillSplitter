# Feature Plan: Buddies Tab & Add Expense

*Last updated: 2026-03-29*

---

## Overview

Two core features:
1. **Bottom Tab Navigation** — Buddies (default), Groups, Activities, Profile (last 3 show "Coming Soon")
2. **Add Expense Flow** — multi-participant expense with equal / percentage / exact split, buddy balance summary on Buddies tab

---

## Confirmed Design Decisions

| Topic | Decision |
|---|---|
| Buddy model | Contact-based — email + nickname (like phone contacts). Can exist without a system account (ghost buddy). Linked to a `User` account if they later register. |
| Inline add buddy | Search bar in Add Expense screen combines existing buddy search + inline new buddy entry (no separate buddy picker flow) |
| Ghost buddy as payer | Supported — "paid by" can be any buddy including unregistered ones |
| Currency | MYR only for Phase 1. `CurrencyCode` field on `Expense` entity ensures future extensibility |
| Split types | All 3: **Equal**, **By Percentage**, **Exact Amounts** |
| Multi-participant expense | One expense can include 2+ participants. All shares stored in `ExpenseSplit` (including payer's own share) |

---

## Current State

- Auth flow complete: Welcome → SignUp → EmailVerification → Login
- `App.tsx`: `AuthStack` + single `AppStack` with `MainScreen`
- `MainScreen.tsx`: placeholder screen with disabled FAB "Add Expense"
- Theme: MD3 Light (react-native-paper), `#212121` primary, `#F5F5F5` background, `#FFFFFF` surface
- Backend: Clean Architecture, CQRS + MediatR, JWT auth, EF Core + PostgreSQL
- Existing entities: `User`, `EmailVerification`

---

## Part 1 — Backend

### 1.1 New Domain Entities

#### `Buddy`
Represents a contact added by a registered user. Like a phone contact — has a nickname, identified by email, optionally linked to a `User` account.

```
Buddy {
  Id: Guid
  OwnerId: Guid                 → FK: Users (who added this buddy)
  Email: string                 (unique per owner)
  Nickname: string?             (user-assigned display name)
  LinkedUserId: Guid?           → FK: Users (null until buddy registers)
  CreatedAt, UpdatedAt
}
```

#### `Expense`
A shared expense paid by one party and split among participants.

```
Expense {
  Id: Guid
  CreatedByUserId: Guid         → FK: Users (who created the expense)
  Description: string
  Amount: decimal(18,2)
  CurrencyCode: string          (e.g. "MYR" — default MYR, field exists for future expansion)
  SplitType: enum               (Equal = 0, Percentage = 1, Exact = 2)
  PaidByUserId: Guid?           → FK: Users  (null if ghost buddy paid)
  PaidByBuddyId: Guid?          → FK: Buddies (null if registered user paid)
  CreatedAt, UpdatedAt
  → navigation: ExpenseSplits[]
}
```
Constraint: exactly one of `PaidByUserId` / `PaidByBuddyId` must be set.

#### `ExpenseSplit`
Each participant's share in an expense — includes the payer's own share.

```
ExpenseSplit {
  Id: Guid
  ExpenseId: Guid               → FK: Expenses
  UserId: Guid?                 → FK: Users (null if ghost buddy)
  BuddyId: Guid?                → FK: Buddies (null if registered user)
  Amount: decimal(18,2)         (final computed amount this person owes the payer)
  CreatedAt, UpdatedAt
}
```
Constraint: exactly one of `UserId` / `BuddyId` must be set per row.

> Balance is always **computed** from `ExpenseSplit` records — no separate Debt/Settlement entity needed.

---

### 1.2 Balance Calculation Logic

For the logged-in user (Me) vs each buddy:

```
For each expense:
  - If I paid (PaidByUserId = me):
      → each other participant's ExpenseSplit.Amount = what they owe me
  - If buddy paid (PaidByBuddyId = buddy.Id OR PaidByUserId = buddy.LinkedUserId):
      → my ExpenseSplit.Amount = what I owe buddy

Net balance per buddy = sum(they owe me) - sum(I owe them)
  > 0 → they owe me
  < 0 → I owe them
  = 0 → settled
```

---

### 1.3 New API Endpoints

#### Buddies Controller — `[Authorize]` `/api/buddies`

| Method | Route | Description |
|--------|-------|---|
| `POST` | `/api/buddies` | Add a buddy by email + optional nickname |
| `GET` | `/api/buddies` | List all buddies for current user |
| `PATCH` | `/api/buddies/{id}/nickname` | Update buddy nickname |

#### Expenses Controller — `[Authorize]` `/api/expenses`

| Method | Route | Description |
|--------|-------|---|
| `POST` | `/api/expenses` | Create expense with splits |
| `GET` | `/api/expenses/balances` | Net balance per buddy |

**`POST /api/expenses` request shape:**
```json
{
  "description": "Dinner at Jalan Alor",
  "amount": 120.00,
  "currencyCode": "MYR",
  "splitType": "Equal",
  "paidBy": { "type": "Me" },
  "participants": [
    { "buddyId": "guid-alice", "amount": 40.00 },
    { "buddyId": "guid-bob",   "amount": 40.00 },
    { "self": true,            "amount": 40.00 }
  ]
}
```
`paidBy.type` can be `"Me"` or `"Buddy"` (with `buddyId`).
`participants[].amount` is the pre-computed share — frontend calculates per split type, backend validates sum = total.

**`GET /api/expenses/balances` response shape:**
```json
{
  "totalOwedToMe": 40.00,
  "totalIOwe": 0.00,
  "balances": [
    {
      "buddy": { "id": "guid", "email": "alice@email.com", "nickname": "Alice" },
      "netAmount": 40.00,
      "direction": "TheyOweMe"
    }
  ]
}
```

---

### 1.4 CQRS Handlers (following existing MediatR pattern)

**Commands:**
- `AddBuddyCommand(OwnerId, Email, Nickname?)` → creates `Buddy`, returns buddy DTO
- `UpdateBuddyNicknameCommand(OwnerId, BuddyId, Nickname)` → updates nickname
- `CreateExpenseCommand(CreatedByUserId, Description, Amount, CurrencyCode, SplitType, PaidBy, Participants[])` → creates `Expense` + `ExpenseSplit` rows, returns expense DTO

**Queries:**
- `GetBuddiesQuery(OwnerId)` → returns `Buddy[]` with linked user info if available
- `GetBalancesQuery(CurrentUserId)` → computes and returns balance summary

---

### 1.5 Backend Files to Create

**Domain:**
- `Domain/Entities/Buddy.cs`
- `Domain/Entities/Expense.cs`
- `Domain/Entities/ExpenseSplit.cs`
- `Domain/Enums/SplitType.cs`

**Application:**
- `Application/Buddies/Commands/AddBuddy/AddBuddyCommand.cs` + Handler
- `Application/Buddies/Commands/UpdateBuddyNickname/UpdateBuddyNicknameCommand.cs` + Handler
- `Application/Buddies/Queries/GetBuddies/GetBuddiesQuery.cs` + Handler
- `Application/Expenses/Commands/CreateExpense/CreateExpenseCommand.cs` + Handler
- `Application/Expenses/Queries/GetBalances/GetBalancesQuery.cs` + Handler
- `Application/Common/Interfaces/IApplicationDbContext.cs` — add new DbSets

**Infrastructure:**
- `Persistence/Configurations/BuddyConfiguration.cs`
- `Persistence/Configurations/ExpenseConfiguration.cs`
- `Persistence/Configurations/ExpenseSplitConfiguration.cs`
- New EF Core migration

**API:**
- `Controllers/BuddiesController.cs`
- `Controllers/ExpensesController.cs`

---

## Part 2 — Frontend

### 2.1 Navigation Restructure

Replace `AppStack` in `App.tsx` with a **Bottom Tab Navigator** (`@react-navigation/bottom-tabs`).

**Tabs:**
| Tab | Icon | Screen | Default |
|-----|------|--------|---------|
| Buddies | `account-multiple` | `BuddiesScreen` | ✅ |
| Groups | `account-group` | `ComingSoonScreen` | |
| Activities | `format-list-bulleted` | `ComingSoonScreen` | |
| Profile | `account-circle` | `ComingSoonScreen` | |

Tab bar styling:
- Background: `#FFFFFF`
- Active tint: `#212121` (primary)
- Inactive tint: `#BDBDBD` (secondary)
- Active indicator: subtle underline or filled pill

The `AddExpenseScreen` is a **modal** pushed on top of the tab navigator (not inside a tab), so it covers the full screen cleanly.

**`src/navigation/types.ts` additions:**
```ts
export type MainTabParamList = {
  Buddies: undefined;
  Groups: undefined;
  Activities: undefined;
  Profile: undefined;
};

export type AppModalParamList = {
  MainTabs: undefined;
  AddExpense: undefined;
};
```

**Files to modify/create:**
- `src/navigation/types.ts` — add tab + modal param lists
- `src/navigation/MainTabNavigator.tsx` — new bottom tab navigator
- `App.tsx` — replace `AppNavigator` with modal stack wrapping tabs

---

### 2.2 BuddiesScreen

**Layout:**
```
┌─────────────────────────────────────┐
│  BillSplitter              [avatar] │  ← Appbar (logout in avatar menu)
├─────────────────────────────────────┤
│  ┌─────────────────────────────────┐│
│  │  You are owed    MYR 40.00      ││  ← green
│  │  You owe         MYR 0.00       ││  ← red/orange (grey if 0)
│  └─────────────────────────────────┘│
│                                     │
│  FRIENDS                            │  ← section label
│  ┌─────────────────────────────────┐│
│  │ [AL]  Alice       owes MYR 40   ││  ← green amount, right-aligned
│  │ [BO]  Bob      you owe MYR 12   ││  ← orange amount
│  │ [CH]  Charlie      settled up   ││  ← grey, neutral
│  └─────────────────────────────────┘│
│                                     │
│  (empty state if no buddies)        │
│                                     │
└─────────────────────�[+ Add Expense]─┘  ← FAB
     [Buddies] [Groups] [Activities] [Profile]  ← Tab bar
```

**Balance summary card:**
- Two rows: "You are owed" (green) + "You owe" (orange)
- If both zero: single "You're all settled up!" message

**Buddy row:**
- Avatar: circle with 2-letter initials from nickname or email
- Nickname (primary) or email if no nickname set
- Right side: net amount, coloured + direction label
- Tapping a buddy row — no detail page for now (no-op or disabled)

**Files to create:**
- `src/screens/main/BuddiesScreen.tsx`
- `src/components/buddies/BalanceSummaryCard.tsx`
- `src/components/buddies/BuddyRow.tsx`
- `src/components/common/AvatarInitials.tsx`

---

### 2.3 ComingSoonScreen

Simple reusable screen, props-based title.

```
        [icon]
    Coming Soon
  This feature is on
  its way. Stay tuned!
```

**File:** `src/screens/main/ComingSoonScreen.tsx`

---

### 2.4 Add Expense Screen (Modal)

Triggered by FAB on Buddies tab. Full-screen modal with a header back button.

**Layout — 3 logical sections:**

```
┌────────────────────────────────────┐
│  ×  Add Expense                    │  ← header, × closes modal
├────────────────────────────────────┤
│                                    │
│  Description                       │
│  ┌──────────────────────────────┐  │
│  │  e.g. Dinner, Groceries...   │  │
│  └──────────────────────────────┘  │
│                                    │
│  Amount (MYR)                      │
│  ┌──────────────────────────────┐  │
│  │  0.00                        │  │
│  └──────────────────────────────┘  │
│                                    │
│  Paid by                           │
│  ┌──────────────────────────────┐  │
│  │  You  ▼                      │  │  ← dropdown: You or any selected buddy
│  └──────────────────────────────┘  │
│                                    │
│  ────── Split with ─────────────── │
│  ┌──────────────────────────────┐  │
│  │ 🔍  Search or add by email   │  │  ← search/add bar
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ [AL]  Alice (existing buddy) │  │  ← search results / suggestions
│  │ [+]   Add "newuser@x.com"    │  │  ← inline new buddy with nickname prompt
│  └──────────────────────────────┘  │
│                                    │
│  Selected participants:            │
│  [AL] Alice  ×    [BO] Bob  ×      │  ← chips, removable
│                                    │
│  ── How to split? ─────────────── │
│  [ Equally ] [ By % ] [ Exact ]   │  ← segment control
│                                    │
│  ┌──────────────────────────────┐  │
│  │  You          MYR 40.00      │  │  ← split breakdown list
│  │  Alice        MYR 40.00      │  │     auto-computed or editable
│  │  Bob          MYR 40.00      │  │     per split type
│  └──────────────────────────────┘  │
│                                    │
│  [        Save Expense          ]  │
└────────────────────────────────────┘
```

**Split type behaviour:**

| Mode | UX | Validation |
|------|----|------------|
| **Equally** | Amounts auto-computed, read-only | Sum auto-equals total |
| **By %** | Each participant gets a % input, amounts shown below | % must sum to 100 |
| **Exact** | Each participant gets an amount input | Amounts must sum to total |

**Buddy search/add bar behaviour:**
1. User types email or nickname
2. Existing buddies matching the query appear as suggestions
3. If no match, show "Add [input] as new buddy" row — tapping opens a small inline prompt for nickname (optional), then adds them to the selected list
4. Selected participants shown as dismissible chips above the split section
5. "Paid by" dropdown is populated from selected participants + "You"

**Files to create:**
- `src/screens/main/AddExpenseScreen.tsx`
- `src/components/expense/BuddySearchInput.tsx`
- `src/components/expense/ParticipantChip.tsx`
- `src/components/expense/SplitBreakdown.tsx`
- `src/components/expense/SplitTypeSelector.tsx`

---

### 2.5 Services & Types

**`src/services/api/buddyService.ts`**
```ts
addBuddy(email: string, nickname?: string): Promise<Buddy>
getBuddies(): Promise<Buddy[]>
updateNickname(buddyId: string, nickname: string): Promise<Buddy>
```

**`src/services/api/expenseService.ts`**
```ts
createExpense(payload: CreateExpensePayload): Promise<Expense>
getBalances(): Promise<BalanceSummary>
```

**`src/types/buddy.types.ts`**
```ts
interface Buddy {
  id: string;
  email: string;
  nickname: string | null;
  linkedUserId: string | null;  // null = ghost buddy
}

interface BuddyBalance {
  buddy: Buddy;
  netAmount: number;            // + = they owe me, - = I owe them
  direction: 'TheyOweMe' | 'IOwe' | 'Settled';
}

interface BalanceSummary {
  totalOwedToMe: number;
  totalIOwe: number;
  balances: BuddyBalance[];
}
```

**`src/types/expense.types.ts`**
```ts
type SplitType = 'Equal' | 'Percentage' | 'Exact';

interface Participant {
  buddyId?: string;  // null/undefined = self (logged-in user)
  self?: boolean;
  amount: number;
}

interface CreateExpensePayload {
  description: string;
  amount: number;
  currencyCode: string;         // 'MYR' for now
  splitType: SplitType;
  paidBy: { type: 'Me' } | { type: 'Buddy'; buddyId: string };
  participants: Participant[];
}
```

---

## Implementation Order

### Phase A — Backend: Buddy & Expense Foundation
1. Add domain entities: `Buddy`, `Expense`, `ExpenseSplit`, `SplitType` enum
2. Add EF Core configurations + migration
3. Implement `AddBuddyCommand` + `GetBuddiesQuery`
4. Implement `CreateExpenseCommand` (with split validation: amounts sum = total)
5. Implement `GetBalancesQuery` (compute net per buddy)
6. `BuddiesController` + `ExpensesController`

### Phase B — Frontend: Navigation & Scaffolding
7. Update `navigation/types.ts` with tab + modal param lists
8. Create `MainTabNavigator` with 4 tabs
9. Create `ComingSoonScreen`
10. Update `App.tsx`: modal stack wrapping tab navigator (Add Expense modal registered here)

### Phase C — Frontend: Buddies Screen
11. `AvatarInitials` component
12. `BalanceSummaryCard` component
13. `BuddyRow` component
14. `BuddiesScreen` — wire `buddyService.getBuddies()` + `expenseService.getBalances()`

### Phase D — Frontend: Add Expense Flow
15. `BuddySearchInput` — search existing + inline add with nickname prompt
16. `ParticipantChip` — dismissible chip
17. `SplitTypeSelector` — segment control (Equal / By % / Exact)
18. `SplitBreakdown` — per-participant amount display/input
19. `AddExpenseScreen` — assemble all components, wire `buddyService.addBuddy()` + `expenseService.createExpense()`
20. FAB on `BuddiesScreen` → navigate to `AddExpense` modal
21. On expense save success → close modal + refresh balances

---

## DB Schema (final)

```
Users (existing)
  ├── Buddies
  │     OwnerId → Users.Id
  │     LinkedUserId → Users.Id (nullable)
  │
  └── Expenses
        CreatedByUserId → Users.Id
        PaidByUserId → Users.Id (nullable)
        PaidByBuddyId → Buddies.Id (nullable)
        │
        └── ExpenseSplits
              ExpenseId → Expenses.Id
              UserId → Users.Id (nullable)
              BuddyId → Buddies.Id (nullable)
```

---

*This document reflects all confirmed requirements as of 2026-03-29.*
