import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target, Clock, BarChart3 } from 'lucide-react';
import { useStrategyContext } from '../../../Context/StrategyContext';
import { supabase } from '../../../lib/supabase';

interface TradeData {
  id: string;
  date: string;
  symbol: string;
  trade_type: string;
  entry_price: number;
  exit_price: number;
  quantity: number;
  profit: number;
  strategy_id: string;
  user_id: string;
  created_at: string;
}

interface AIInsight {
  type: 'success' | 'warning' | 'info' | 'danger';
  title: string;
  description: string;
  icon: React.ElementType;
  confidence: number;
}

export const AIAnalysisCard: React.FC = () => {
  const { activeStrategy, user } = useStrategyContext();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trades, setTrades] = useState<TradeData[]>([]);

  useEffect(() => {
    if (activeStrategy && user) {
      fetchTradesAndAnalyze();
    }
  }, [activeStrategy, user]);

  const fetchTradesAndAnalyze = async () => {
    if (!activeStrategy || !user) return;
    
    setIsAnalyzing(true);
    
    try {
      // Fetch recent trades for analysis
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('strategy_id', activeStrategy.id)
        .order('date', { ascending: false })
        .limit(100); // Analyze last 100 trades

      if (error) throw error;
      
      if (data) {
        setTrades(data);
        analyzeTradePatterns(data);
      }
    } catch (error) {
      console.error('Error fetching trades for AI analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeTradePatterns = (tradeData: TradeData[]) => {
    const generatedInsights: AIInsight[] = [];

    // 1. Win Rate Analysis
    const winRate = calculateWinRate(tradeData);
    if (winRate > 70) {
      generatedInsights.push({
        type: 'success',
        title: 'Strong Win Rate Performance',
        description: `Your ${winRate.toFixed(1)}% win rate indicates excellent trade selection. Consider increasing position sizes on high-conviction setups.`,
        icon: Target,
        confidence: 85
      });
    } else if (winRate < 40) {
      generatedInsights.push({
        type: 'warning',
        title: 'Win Rate Needs Improvement',
        description: `Your ${winRate.toFixed(1)}% win rate suggests reviewing entry criteria and market timing. Focus on quality over quantity.`,
        icon: AlertTriangle,
        confidence: 90
      });
    }

    // 2. Risk-Reward Pattern Analysis
    const avgRiskReward = calculateAverageRiskReward(tradeData);
    if (avgRiskReward > 2.0) {
      generatedInsights.push({
        type: 'success',
        title: 'Excellent Risk Management',
        description: `Your ${avgRiskReward.toFixed(2)}:1 risk-reward ratio shows disciplined trading. This compensates for any lower win rates.`,
        icon: TrendingUp,
        confidence: 80
      });
    } else if (avgRiskReward < 1.0) {
      generatedInsights.push({
        type: 'danger',
        title: 'Poor Risk-Reward Setup',
        description: `Your ${avgRiskReward.toFixed(2)}:1 ratio is unsustainable. Focus on trades with at least 2:1 reward potential.`,
        icon: AlertTriangle,
        confidence: 95
      });
    }

    // 3. Trading Frequency Analysis
    const tradingFrequency = analyzeTradingFrequency(tradeData);
    if (tradingFrequency.overtrading) {
      generatedInsights.push({
        type: 'warning',
        title: 'Potential Overtrading Detected',
        description: `You're averaging ${tradingFrequency.avgPerDay.toFixed(1)} trades/day. Consider focusing on higher-quality setups to improve consistency.`,
        icon: Clock,
        confidence: 75
      });
    }

    // 4. Emotional Trading Pattern Detection
    const emotionalPatterns = detectEmotionalTrading(tradeData);
    if (emotionalPatterns.revengeTrading) {
      generatedInsights.push({
        type: 'warning',
        title: 'Revenge Trading Pattern Detected',
        description: 'AI detected increased trading activity after losses. Consider implementing cooling-off periods to maintain objectivity.',
        icon: Brain,
        confidence: 70
      });
    }

    // 5. Symbol Performance Analysis
    const symbolPerformance = analyzeSymbolPerformance(tradeData);
    if (symbolPerformance.bestSymbol) {
      generatedInsights.push({
        type: 'info',
        title: `Strong Performance on ${symbolPerformance.bestSymbol}`,
        description: `You have a ${symbolPerformance.bestWinRate.toFixed(1)}% win rate on ${symbolPerformance.bestSymbol}. Consider focusing more on this symbol.`,
        icon: BarChart3,
        confidence: 65
      });
    }

    // 6. Time-Based Performance Analysis
    const timeAnalysis = analyzeTimePatterns(tradeData);
    if (timeAnalysis.bestTimeframe) {
      generatedInsights.push({
        type: 'info',
        title: `Peak Performance During ${timeAnalysis.bestTimeframe}`,
        description: `Your trades during ${timeAnalysis.bestTimeframe} show ${timeAnalysis.improvement.toFixed(1)}% better performance. Consider focusing trading during these hours.`,
        icon: Clock,
        confidence: 60
      });
    }

    setInsights(generatedInsights);
  };

  // Analysis Helper Functions
  const calculateWinRate = (trades: TradeData[]): number => {
    if (trades.length === 0) return 0;
    const winningTrades = trades.filter(trade => trade.profit > 0).length;
    return (winningTrades / trades.length) * 100;
  };

  const calculateAverageRiskReward = (trades: TradeData[]): number => {
    const profitableTrades = trades.filter(trade => trade.profit > 0);
    const losingTrades = trades.filter(trade => trade.profit < 0);
    
    if (losingTrades.length === 0) return 0;
    
    const avgWin = profitableTrades.reduce((sum, trade) => sum + trade.profit, 0) / profitableTrades.length;
    const avgLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.profit, 0) / losingTrades.length);
    
    return avgWin / avgLoss;
  };

  const analyzeTradingFrequency = (trades: TradeData[]) => {
    if (trades.length === 0) return { overtrading: false, avgPerDay: 0 };
    
    const dates = trades.map(trade => new Date(trade.date).toDateString());
    const uniqueDates = [...new Set(dates)];
    const avgPerDay = trades.length / uniqueDates.length;
    
    return {
      overtrading: avgPerDay > 5, // More than 5 trades per day might indicate overtrading
      avgPerDay
    };
  };

  const detectEmotionalTrading = (trades: TradeData[]) => {
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let revengeTrading = false;
    
    for (let i = 1; i < sortedTrades.length; i++) {
      const prevTrade = sortedTrades[i - 1];
      const currentTrade = sortedTrades[i];
      
      // Check if there are multiple trades on the same day after a loss
      if (prevTrade.profit < 0) {
        const sameDay = new Date(prevTrade.date).toDateString() === new Date(currentTrade.date).toDateString();
        const timeDiff = new Date(currentTrade.date).getTime() - new Date(prevTrade.date).getTime();
        const withinHours = timeDiff < (2 * 60 * 60 * 1000); // Within 2 hours
        
        if (sameDay || withinHours) {
          revengeTrading = true;
          break;
        }
      }
    }
    
    return { revengeTrading };
  };

  const analyzeSymbolPerformance = (trades: TradeData[]) => {
    const symbolStats = trades.reduce((stats, trade) => {
      if (!stats[trade.symbol]) {
        stats[trade.symbol] = { total: 0, wins: 0, profit: 0 };
      }
      stats[trade.symbol].total++;
      if (trade.profit > 0) stats[trade.symbol].wins++;
      stats[trade.symbol].profit += trade.profit;
      return stats;
    }, {} as Record<string, { total: number; wins: number; profit: number }>);

    let bestSymbol = '';
    let bestWinRate = 0;

    Object.entries(symbolStats).forEach(([symbol, stats]) => {
      const winRate = (stats.wins / stats.total) * 100;
      if (stats.total >= 5 && winRate > bestWinRate) { // At least 5 trades for significance
        bestSymbol = symbol;
        bestWinRate = winRate;
      }
    });

    return { bestSymbol: bestSymbol || null, bestWinRate };
  };

  const analyzeTimePatterns = (trades: TradeData[]) => {
    const timeStats = trades.reduce((stats, trade) => {
      const hour = new Date(trade.date).getHours();
      let timeframe = '';
      
      if (hour >= 9 && hour < 12) timeframe = 'Morning (9-12)';
      else if (hour >= 12 && hour < 15) timeframe = 'Afternoon (12-3)';
      else if (hour >= 15 && hour < 18) timeframe = 'Late Day (3-6)';
      else timeframe = 'Other Hours';
      
      if (!stats[timeframe]) {
        stats[timeframe] = { total: 0, profit: 0 };
      }
      stats[timeframe].total++;
      stats[timeframe].profit += trade.profit;
      return stats;
    }, {} as Record<string, { total: number; profit: number }>);

    let bestTimeframe = '';
    let bestAvgProfit = -Infinity;

    Object.entries(timeStats).forEach(([timeframe, stats]) => {
      const avgProfit = stats.profit / stats.total;
      if (stats.total >= 3 && avgProfit > bestAvgProfit) { // At least 3 trades
        bestTimeframe = timeframe;
        bestAvgProfit = avgProfit;
      }
    });

    return { 
      bestTimeframe: bestTimeframe || null, 
      improvement: bestAvgProfit > 0 ? Math.abs(bestAvgProfit) : 0 
    };
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500 bg-green-500/10';
      case 'warning': return 'border-yellow-500 bg-yellow-500/10';
      case 'danger': return 'border-red-500 bg-red-500/10';
      default: return 'border-blue-500 bg-blue-500/10';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'danger': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  if (!user || !activeStrategy) {
    return null;
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Brain className="w-6 h-6 text-purple-400" />
        <h3 className="text-xl font-semibold text-white">AI Trading Analysis</h3>
        {isAnalyzing && (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-400"></div>
        )}
      </div>

      {insights.length === 0 && !isAnalyzing && (
        <div className="text-center py-8">
          <Brain className="w-12 h-12 text-gray-500 mx-auto mb-3" />
          <p className="text-gray-400">No sufficient trade data for AI analysis yet.</p>
          <p className="text-sm text-gray-500 mt-1">Complete more trades to unlock AI insights.</p>
        </div>
      )}

      {isAnalyzing && (
        <div className="text-center py-8">
          <div className="animate-pulse">
            <Brain className="w-12 h-12 text-purple-400 mx-auto mb-3" />
            <p className="text-white">Analyzing your trading patterns...</p>
            <p className="text-sm text-gray-400 mt-1">This may take a moment</p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <IconComponent className={`w-5 h-5 mt-0.5 ${getIconColor(insight.type)}`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{insight.title}</h4>
                    <span className="text-xs text-gray-400">
                      {insight.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-sm text-gray-300">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {insights.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            AI analysis based on your last {trades.length} trades • Updated in real-time
          </p>
        </div>
      )}
    </div>
  );
};
