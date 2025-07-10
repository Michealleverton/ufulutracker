export interface Trade {
  id: string;
  user_id?: string;
  strategy_id?: string;
  date: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  profit?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Strategy {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  username?: string;
  plan: 'free' | 'pro' | 'premium';
  subscription_id?: string;
  subscription_status?: 'active' | 'canceled' | 'past_due' | 'trialing' | null;
  max_strategies: number;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  strategy_id: string;
  date: string;
  title?: string;
  content?: string;
  mood?: 'great' | 'good' | 'neutral' | 'bad' | 'terrible';
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface AnalyticsSnapshot {
  id: string;
  user_id: string;
  strategy_id: string;
  snapshot_date: string;
  total_profit_loss: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  win_rate: number;
  best_trade: number;
  worst_trade: number;
  created_at: string;
  updated_at: string;
}

export interface PricingPlan {
  name: string;
  price: number;
  features: string[];
  buttonText: string;
  recommended?: boolean;
  popular?: boolean;
}

export interface Article {
    title: string;
    description: string;
    url: string;
  }

export interface TradeBookStep {
  id: string;
  strategy_id: string;
  text: string;
  completed: boolean;
  position_order: number;
  created_at?: string;
  updated_at?: string;
}

export interface TradeBookStrategy {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  position_order: number;
  steps: TradeBookStep[];
  created_at?: string;
  updated_at?: string;
}