import React, { createContext, useContext, ReactNode } from 'react';
import { useStrategies } from '../pages/userdash/hooks/useStrategies';
import type { Strategy, User } from '../types';

interface StrategyContextType {
  strategies: Strategy[];
  activeStrategy: Strategy | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  createStrategy: (name: string, description?: string) => Promise<Strategy>;
  setActiveStrategyById: (strategyId: string) => Promise<Strategy>;
  deleteStrategy: (strategyId: string) => Promise<void>;
  updateStrategy: (strategyId: string, updates: Partial<Strategy>) => Promise<Strategy>;
  refetch: () => Promise<void>;
  clearError: () => void;
}

const StrategyContext = createContext<StrategyContextType | undefined>(undefined);

interface StrategyProviderProps {
  children: ReactNode;
}

export const StrategyProvider: React.FC<StrategyProviderProps> = ({ children }) => {
  const strategyHook = useStrategies();

  return (
    <StrategyContext.Provider value={strategyHook}>
      {children}
    </StrategyContext.Provider>
  );
};

export const useStrategyContext = () => {
  const context = useContext(StrategyContext);
  if (context === undefined) {
    throw new Error('useStrategyContext must be used within a StrategyProvider');
  }
  return context;
};
