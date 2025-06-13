export interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: 'buy' | 'sell';
  price: number;
  quantity: number;
  profit?: number;
  notes?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  plan: 'basic' | 'pro' | 'premium';
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

// Duplicate Trade interface removed