
export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BET = 'BET',
  PRIZE = 'PRIZE'
}

export enum PoolStatus {
  OPEN = 'OPEN',
  AWAITING_RESULT = 'AWAITING_RESULT',
  FINISHED = 'FINISHED'
}

export interface UserMessage {
  id: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  whatsapp: string;
  role: UserRole;
  balance: number;
  withdrawable_balance: number;
  created_at: string | number;
  hidden_pool_ids?: string[];
  messages?: UserMessage[];
}

export interface Pool {
  id: string;
  creator_id: string;
  name: string;
  modality: string;
  deadline: string;
  event_date: string;
  bet_amount: number;
  options: string[];
  status: PoolStatus;
  winner_option?: string;
  created_at: string | number;
}

export interface Bet {
  id: string;
  pool_id: string;
  user_id: string;
  option_selected: string;
  amount: number;
  created_at: string | number;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  receipt_url?: string;
  created_at: string | number;
  reference_id?: string;
}

// Added missing interface AppConfig referenced in db.ts
export interface AppConfig {
  pix_key: string;
  qr_code_url: string;
}

// Added missing interface SystemAlert referenced in db.ts
export interface SystemAlert {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  referenceId?: string;
}
