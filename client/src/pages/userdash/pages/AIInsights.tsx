import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Clock, 
  BarChart3,
  Activity,
  Zap,
  Eye,
  Lightbulb,
  MessageCircle,
  Send,
  ChevronDown,
  Bot,
  User
} from 'lucide-react';
import { useStrategyContext } from '../../../Context/StrategyContext';
import { supabase } from '../../../lib/supabase';
import { GoogleGenerativeAI } from '@google/generative-ai';

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
  category: 'performance' | 'risk' | 'psychology' | 'strategy' | 'timing';
  title: string;
  description: string;
  actionable: string;
  icon: React.ElementType;
  confidence: number;
  priority: 'high' | 'medium' | 'low';
}

interface PerformanceMetrics {
  totalTrades: number;
  winRate: number;
  avgRiskReward: number;
  profitFactor: number;
  maxDrawdown: number;
  consistency: number;
}

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

interface ConversationContext {
  insights: AIInsight[];
  metrics: PerformanceMetrics | null;
  recentTrades: TradeData[];
  strategyName: string;
}

const AIInsights: React.FC = () => {
  const { activeStrategy, user } = useStrategyContext();
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Chat-related state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isAIResponding, setIsAIResponding] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const geminiAPI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

  useEffect(() => {
    if (activeStrategy && user) {
      fetchTradesAndAnalyze();
    }
  }, [activeStrategy, user]);

  const fetchTradesAndAnalyze = async () => {
    if (!activeStrategy || !user) return;
    
    setIsAnalyzing(true);
    
    try {
      // Fetch comprehensive trade data
      const { data, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id)
        .eq('strategy_id', activeStrategy.id)
        .order('date', { ascending: false })
        .limit(200); // Analyze more trades for better insights

      if (error) throw error;
      
      if (data) {
        setTrades(data);
        const calculatedMetrics = calculateMetrics(data);
        setMetrics(calculatedMetrics);
        await generateComprehensiveInsights(data, calculatedMetrics);
      }
    } catch (error) {
      console.error('Error fetching trades for AI analysis:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateMetrics = (tradeData: TradeData[]): PerformanceMetrics => {
    if (tradeData.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        avgRiskReward: 0,
        profitFactor: 0,
        maxDrawdown: 0,
        consistency: 0
      };
    }

    const wins = tradeData.filter(t => t.profit > 0);
    const losses = tradeData.filter(t => t.profit < 0);
    const winRate = (wins.length / tradeData.length) * 100;
    
    const avgWin = wins.length > 0 ? wins.reduce((sum, t) => sum + t.profit, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, t) => sum + t.profit, 0) / losses.length) : 0;
    const avgRiskReward = avgLoss > 0 ? avgWin / avgLoss : 0;
    
    const totalProfit = wins.reduce((sum, t) => sum + t.profit, 0);
    const totalLoss = Math.abs(losses.reduce((sum, t) => sum + t.profit, 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

    // Calculate max drawdown
    let runningTotal = 0;
    let peak = 0;
    let maxDD = 0;
    
    const sortedTrades = [...tradeData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    for (const trade of sortedTrades) {
      runningTotal += trade.profit;
      if (runningTotal > peak) peak = runningTotal;
      const drawdown = peak - runningTotal;
      if (drawdown > maxDD) maxDD = drawdown;
    }

    // Calculate consistency (how often monthly performance is positive)
    const monthlyPerformance = calculateMonthlyPerformance(sortedTrades);
    const positiveMonths = monthlyPerformance.filter(month => month.profit > 0).length;
    const consistency = monthlyPerformance.length > 0 ? (positiveMonths / monthlyPerformance.length) * 100 : 0;

    return {
      totalTrades: tradeData.length,
      winRate,
      avgRiskReward,
      profitFactor,
      maxDrawdown: maxDD,
      consistency
    };
  };

  const calculateMonthlyPerformance = (trades: TradeData[]) => {
    const monthlyData = trades.reduce((acc, trade) => {
      const monthKey = new Date(trade.date).toISOString().slice(0, 7); // YYYY-MM
      if (!acc[monthKey]) acc[monthKey] = 0;
      acc[monthKey] += trade.profit;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(monthlyData).map(([month, profit]) => ({ month, profit }));
  };

  const generateComprehensiveInsights = async (tradeData: TradeData[], metrics: PerformanceMetrics) => {
    const generatedInsights: AIInsight[] = [];

    // 1. Performance Analysis
    if (metrics.winRate > 65) {
      generatedInsights.push({
        type: 'success',
        category: 'performance',
        title: 'Exceptional Win Rate Performance',
        description: `Your ${metrics.winRate.toFixed(1)}% win rate is outstanding. You're demonstrating excellent market timing and entry selection.`,
        actionable: 'Consider increasing position sizes on your highest conviction setups to maximize this edge.',
        icon: Target,
        confidence: 90,
        priority: 'high'
      });
    } else if (metrics.winRate < 35) {
      generatedInsights.push({
        type: 'warning',
        category: 'performance',
        title: 'Win Rate Requires Immediate Attention',
        description: `Your ${metrics.winRate.toFixed(1)}% win rate suggests systematic issues with trade selection or timing.`,
        actionable: 'Review your entry criteria and consider paper trading new setups before implementing them live.',
        icon: AlertTriangle,
        confidence: 95,
        priority: 'high'
      });
    }

    // 2. Advanced Risk Management Analysis
    if (metrics.avgRiskReward > 2.5) {
      generatedInsights.push({
        type: 'success',
        category: 'risk',
        title: 'Superior Risk Management Discipline',
        description: `Your ${metrics.avgRiskReward.toFixed(2)}:1 risk-reward ratio demonstrates exceptional discipline. This gives you a significant mathematical edge.`,
        actionable: 'Your risk management is excellent. Focus on maintaining this discipline while potentially increasing trade frequency.',
        icon: TrendingUp,
        confidence: 85,
        priority: 'medium'
      });
    } else if (metrics.avgRiskReward < 1.2) {
      generatedInsights.push({
        type: 'danger',
        category: 'risk',
        title: 'Critical Risk-Reward Imbalance',
        description: `Your ${metrics.avgRiskReward.toFixed(2)}:1 ratio is mathematically unsustainable long-term.`,
        actionable: 'Immediately implement minimum 2:1 risk-reward rule. Avoid trades that don\'t meet this criteria.',
        icon: AlertTriangle,
        confidence: 98,
        priority: 'high'
      });
    }

    // 3. Consistency Analysis
    if (metrics.consistency > 70) {
      generatedInsights.push({
        type: 'success',
        category: 'psychology',
        title: 'Remarkable Trading Consistency',
        description: `${metrics.consistency.toFixed(1)}% of your months are profitable, indicating excellent emotional control and systematic approach.`,
        actionable: 'Your consistency is excellent. Document your process to maintain this edge during difficult periods.',
        icon: Activity,
        confidence: 80,
        priority: 'medium'
      });
    } else if (metrics.consistency < 40) {
      generatedInsights.push({
        type: 'warning',
        category: 'psychology',
        title: 'Consistency Issues Detected',
        description: `Only ${metrics.consistency.toFixed(1)}% of your months are profitable, suggesting emotional or systematic inconsistencies.`,
        actionable: 'Implement strict rules for position sizing and risk management. Consider reducing trade frequency to focus on quality.',
        icon: Brain,
        confidence: 75,
        priority: 'high'
      });
    }

    // 4. Advanced Pattern Recognition
    const patterns = analyzeAdvancedPatterns(tradeData);
    
    if (patterns.revengeTrading) {
      generatedInsights.push({
        type: 'warning',
        category: 'psychology',
        title: 'Revenge Trading Pattern Identified',
        description: 'AI detected increased trading frequency and size after significant losses, indicating emotional decision-making.',
        actionable: 'Implement mandatory 24-hour cooling off period after any loss exceeding 2% of account. Use alerts to enforce this rule.',
        icon: Brain,
        confidence: 80,
        priority: 'high'
      });
    }

    if (patterns.weekendGap) {
      generatedInsights.push({
        type: 'info',
        category: 'timing',
        title: 'Weekend Gap Trading Opportunity',
        description: 'Your trades show better performance when entered on Monday mornings, likely capturing weekend gap moves.',
        actionable: 'Consider allocating more capital to Monday morning setups and reducing Friday afternoon positions.',
        icon: Clock,
        confidence: 65,
        priority: 'medium'
      });
    }

    // 5. Symbol Specialization Analysis
    const symbolAnalysis = analyzeSymbolSpecialization(tradeData);
    if (symbolAnalysis.specialist) {
      generatedInsights.push({
        type: 'info',
        category: 'strategy',
        title: `Specialization Edge in ${symbolAnalysis.topSymbol}`,
        description: `Your ${symbolAnalysis.winRate.toFixed(1)}% win rate on ${symbolAnalysis.topSymbol} significantly outperforms your overall average.`,
        actionable: `Consider increasing allocation to ${symbolAnalysis.topSymbol} and studying why you perform better on this instrument.`,
        icon: BarChart3,
        confidence: 70,
        priority: 'medium'
      });
    }

    // 6. Market Condition Analysis
    const marketConditions = analyzeMarketConditions(tradeData);
    if (marketConditions.trendingBias) {
      generatedInsights.push({
        type: 'info',
        category: 'strategy',
        title: 'Strong Trending Market Performance',
        description: 'Your performance significantly improves during trending market conditions versus ranging markets.',
        actionable: 'Focus trading during high volatility periods and reduce activity during low volatility consolidation phases.',
        icon: TrendingUp,
        confidence: 60,
        priority: 'low'
      });
    }

    // 7. Profit Factor Insights
    if (metrics.profitFactor > 2.0) {
      generatedInsights.push({
        type: 'success',
        category: 'performance',
        title: 'Exceptional Profit Factor Achievement',
        description: `Your ${metrics.profitFactor.toFixed(2)} profit factor indicates you're generating excellent returns relative to losses.`,
        actionable: 'Your system is working excellently. Focus on scaling up gradually while maintaining the same discipline.',
        icon: Zap,
        confidence: 85,
        priority: 'medium'
      });
    } else if (metrics.profitFactor < 1.2) {
      generatedInsights.push({
        type: 'danger',
        category: 'performance',
        title: 'Critical Profit Factor Warning',
        description: `Your ${metrics.profitFactor.toFixed(2)} profit factor indicates you're barely breaking even after accounting for costs.`,
        actionable: 'Immediately review and tighten entry criteria. Consider reducing position sizes until profitability improves.',
        icon: AlertTriangle,
        confidence: 92,
        priority: 'high'
      });
    }

    // 8. Advanced Drawdown Analysis
    if (metrics.maxDrawdown > 1000) {
      const recentDrawdownTrend = analyzeRecentDrawdownTrend(tradeData);
      generatedInsights.push({
        type: 'warning',
        category: 'risk',
        title: 'Significant Drawdown Alert',
        description: `Your maximum drawdown of $${metrics.maxDrawdown.toFixed(2)} represents significant capital at risk. ${recentDrawdownTrend ? 'Recent trades show concerning drawdown acceleration.' : 'Current drawdown levels appear stable.'}`,
        actionable: recentDrawdownTrend 
          ? 'URGENT: Reduce position sizes by 50% immediately and implement mandatory stop-loss rules.'
          : 'Review position sizing rules and implement protective stops to prevent further drawdown.',
        icon: AlertTriangle,
        confidence: 88,
        priority: 'high'
      });
    }

    // 9. Trading Frequency Analysis
    const frequencyAnalysis = analyzeFrequencyPatterns(tradeData);
    if (frequencyAnalysis.overtrading) {
      generatedInsights.push({
        type: 'warning',
        category: 'psychology',
        title: 'Overtrading Pattern Detected',
        description: `AI detected clusters of ${frequencyAnalysis.avgDailyTrades} trades per active day, suggesting potential overtrading behavior.`,
        actionable: 'Implement a maximum of 3 trades per day rule. Quality over quantity will improve your performance.',
        icon: Activity,
        confidence: 75,
        priority: 'medium'
      });
    }

    // 10. Time-Based Performance Insights
    const timeAnalysis = analyzeTimeBasedPerformance(tradeData);
    if (timeAnalysis.bestTimeWindow) {
      generatedInsights.push({
        type: 'info',
        category: 'timing',
        title: `Peak Performance: ${timeAnalysis.bestTimeWindow}`,
        description: `Your trades during ${timeAnalysis.bestTimeWindow} show ${timeAnalysis.improvement}% better performance than average.`,
        actionable: `Focus your highest conviction trades during ${timeAnalysis.bestTimeWindow}. Consider reducing activity outside this window.`,
        icon: Clock,
        confidence: 70,
        priority: 'medium'
      });
    }

    // 11. Emotional State Prediction
    const emotionalState = predictEmotionalTradingRisk(tradeData);
    if (emotionalState.highRisk) {
      generatedInsights.push({
        type: 'danger',
        category: 'psychology',
        title: 'High Emotional Trading Risk Detected',
        description: `Based on recent trading patterns, AI predicts elevated risk of emotional decision-making in the next ${emotionalState.timeframe}.`,
        actionable: 'Consider taking a 48-hour break from trading. Review and document your trading rules before resuming.',
        icon: Brain,
        confidence: 82,
        priority: 'high'
      });
    }

    // 12. Performance Prediction
    const prediction = generatePerformancePrediction(tradeData, metrics);
    if (prediction.confidence > 60) {
      generatedInsights.push({
        type: prediction.outlook === 'positive' ? 'success' : 'warning',
        category: 'strategy',
        title: `${prediction.timeframe} Performance Outlook: ${prediction.outlook.toUpperCase()}`,
        description: `AI forecasts ${prediction.expectedChange} performance based on current trading patterns and market behavior.`,
        actionable: prediction.outlook === 'positive' 
          ? 'Your current strategy is well-positioned. Consider gradual position size increases.'
          : 'Current patterns suggest caution. Focus on risk management and consider strategy adjustments.',
        icon: TrendingUp,
        confidence: prediction.confidence,
        priority: prediction.outlook === 'positive' ? 'medium' : 'high'
      });
    }

    setInsights(generatedInsights);
  };

  const analyzeAdvancedPatterns = (trades: TradeData[]) => {
    const sortedTrades = [...trades].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    let revengeTrading = false;
    let weekendGap = false;

    // Revenge trading detection
    for (let i = 1; i < sortedTrades.length; i++) {
      const prevTrade = sortedTrades[i - 1];
      const currentTrade = sortedTrades[i];
      
      if (prevTrade.profit < -100) { // Significant loss
        const timeDiff = new Date(currentTrade.date).getTime() - new Date(prevTrade.date).getTime();
        const withinHours = timeDiff < (4 * 60 * 60 * 1000); // Within 4 hours
        
        if (withinHours && Math.abs(currentTrade.quantity) > Math.abs(prevTrade.quantity) * 1.5) {
          revengeTrading = true;
          break;
        }
      }
    }

    // Weekend gap analysis
    const mondayTrades = trades.filter(trade => new Date(trade.date).getDay() === 1);
    const otherDayTrades = trades.filter(trade => new Date(trade.date).getDay() !== 1);
    
    if (mondayTrades.length > 5 && otherDayTrades.length > 5) {
      const mondayAvg = mondayTrades.reduce((sum, t) => sum + t.profit, 0) / mondayTrades.length;
      const otherAvg = otherDayTrades.reduce((sum, t) => sum + t.profit, 0) / otherDayTrades.length;
      weekendGap = mondayAvg > otherAvg * 1.5;
    }

    return { revengeTrading, weekendGap };
  };

  const analyzeSymbolSpecialization = (trades: TradeData[]) => {
    const symbolStats = trades.reduce((stats, trade) => {
      if (!stats[trade.symbol]) {
        stats[trade.symbol] = { total: 0, wins: 0, profit: 0 };
      }
      stats[trade.symbol].total++;
      if (trade.profit > 0) stats[trade.symbol].wins++;
      stats[trade.symbol].profit += trade.profit;
      return stats;
    }, {} as Record<string, { total: number; wins: number; profit: number }>);

    let topSymbol = '';
    let bestWinRate = 0;
    let specialist = false;

    Object.entries(symbolStats).forEach(([symbol, stats]) => {
      const winRate = (stats.wins / stats.total) * 100;
      if (stats.total >= 10 && winRate > bestWinRate) { // At least 10 trades
        topSymbol = symbol;
        bestWinRate = winRate;
      }
    });

    const overallWinRate = (trades.filter(t => t.profit > 0).length / trades.length) * 100;
    specialist = bestWinRate > overallWinRate + 15; // 15% better than overall

    return { specialist, topSymbol, winRate: bestWinRate };
  };

  const analyzeMarketConditions = (trades: TradeData[]) => {
    // Simplified market condition analysis
    // In a real implementation, you'd integrate with market data APIs
    const recentTrades = trades.slice(0, 30); // Last 30 trades
    const avgProfit = recentTrades.reduce((sum, t) => sum + t.profit, 0) / recentTrades.length;
    
    return {
      trendingBias: avgProfit > 50 // Simplified: if recent avg profit > $50, assume trending conditions
    };
  };

  const analyzeRecentDrawdownTrend = (trades: TradeData[]) => {
    const recentTrades = trades.slice(0, 20); // Last 20 trades
    let runningTotal = 0;
    let consecutiveLosses = 0;
    let maxConsecutiveLosses = 0;

    for (const trade of recentTrades) {
      runningTotal += trade.profit;
      if (trade.profit < 0) {
        consecutiveLosses++;
        maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLosses);
      } else {
        consecutiveLosses = 0;
      }
    }

    return runningTotal < -500 && maxConsecutiveLosses >= 4; // Accelerating drawdown
  };

  const analyzeFrequencyPatterns = (trades: TradeData[]) => {
    const tradingDays = new Set(trades.map(t => new Date(t.date).toDateString())).size;
    const avgDailyTrades = trades.length / Math.max(tradingDays, 1);
    
    return {
      overtrading: avgDailyTrades > 5,
      avgDailyTrades: avgDailyTrades.toFixed(1)
    };
  };

  const analyzeTimeBasedPerformance = (trades: TradeData[]) => {
    const timeWindows = {
      'Morning (9-12)': trades.filter(t => {
        const hour = new Date(t.date).getHours();
        return hour >= 9 && hour < 12;
      }),
      'Afternoon (12-16)': trades.filter(t => {
        const hour = new Date(t.date).getHours();
        return hour >= 12 && hour < 16;
      }),
      'Evening (16-20)': trades.filter(t => {
        const hour = new Date(t.date).getHours();
        return hour >= 16 && hour < 20;
      })
    };

    let bestWindow = '';
    let bestPerformance = -Infinity;
    const overallAvg = trades.reduce((sum, t) => sum + t.profit, 0) / trades.length;

    Object.entries(timeWindows).forEach(([window, windowTrades]) => {
      if (windowTrades.length >= 5) {
        const windowAvg = windowTrades.reduce((sum, t) => sum + t.profit, 0) / windowTrades.length;
        if (windowAvg > bestPerformance) {
          bestPerformance = windowAvg;
          bestWindow = window;
        }
      }
    });

    const improvement = bestWindow ? ((bestPerformance - overallAvg) / Math.abs(overallAvg)) * 100 : 0;
    
    return {
      bestTimeWindow: improvement > 25 ? bestWindow : null,
      improvement: improvement.toFixed(1)
    };
  };

  const predictEmotionalTradingRisk = (trades: TradeData[]) => {
    const recentTrades = trades.slice(0, 10);
    let riskScore = 0;

    // Check for loss streaks
    let lossStreak = 0;
    for (const trade of recentTrades) {
      if (trade.profit < 0) {
        lossStreak++;
        if (lossStreak >= 3) riskScore += 30;
      } else {
        break;
      }
    }

    // Check for increasing position sizes after losses
    for (let i = 1; i < recentTrades.length; i++) {
      const current = recentTrades[i];
      const previous = recentTrades[i - 1];
      
      if (previous.profit < 0 && Math.abs(current.quantity) > Math.abs(previous.quantity) * 1.3) {
        riskScore += 25;
      }
    }

    // Check for rapid-fire trading
    let rapidTrades = 0;
    for (let i = 1; i < Math.min(recentTrades.length, 5); i++) {
      const timeDiff = new Date(recentTrades[i-1].date).getTime() - new Date(recentTrades[i].date).getTime();
      if (timeDiff < 30 * 60 * 1000) { // Less than 30 minutes apart
        rapidTrades++;
      }
    }
    if (rapidTrades >= 3) riskScore += 20;

    return {
      highRisk: riskScore >= 50,
      timeframe: riskScore >= 70 ? '24-48 hours' : '2-3 days'
    };
  };

  const generatePerformancePrediction = (trades: TradeData[], metrics: PerformanceMetrics) => {
    const recentTrades = trades.slice(0, 30); // Last 30 trades
    const recentProfit = recentTrades.reduce((sum, t) => sum + t.profit, 0);
    const recentWinRate = (recentTrades.filter(t => t.profit > 0).length / recentTrades.length) * 100;
    
    let score = 0;
    let confidence = 0;

    // Recent trend analysis
    if (recentProfit > 0) score += 30;
    if (recentWinRate > metrics.winRate) score += 20;
    if (metrics.consistency > 60) score += 25;
    if (metrics.profitFactor > 1.5) score += 25;

    confidence = Math.min(95, Math.abs(score - 50) + 50);

    const outlook = score > 60 ? 'positive' : score < 40 ? 'negative' : 'neutral';
    const expectedChange = score > 60 ? 'improved' : score < 40 ? 'challenging' : 'stable';

    return {
      outlook,
      expectedChange,
      timeframe: '2-week',
      confidence: Math.round(confidence)
    };
  };

  // Chat Functions
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const generateChatContext = (): string => {
    const context: ConversationContext = {
      insights,
      metrics,
      recentTrades: trades.slice(0, 10),
      strategyName: activeStrategy?.name || 'Current Strategy'
    };

    return `
You are an expert trading AI assistant helping analyze trading performance. Here's the current context:

STRATEGY: ${context.strategyName}

CURRENT PERFORMANCE METRICS:
- Total Trades: ${context.metrics?.totalTrades || 0}
- Win Rate: ${context.metrics?.winRate?.toFixed(1) || 0}%
- Avg Risk/Reward: ${context.metrics?.avgRiskReward?.toFixed(2) || 0}:1
- Profit Factor: ${context.metrics?.profitFactor?.toFixed(2) || 0}
- Max Drawdown: ${context.metrics?.maxDrawdown?.toFixed(2) || 0}%

RECENT AI INSIGHTS GENERATED:
${context.insights.slice(0, 3).map(insight => 
  `- ${insight.title}: ${insight.description} | Action: ${insight.actionable}`
).join('\n')}

RECENT TRADES SAMPLE:
${context.recentTrades.slice(0, 5).map(trade => 
  `${trade.date}: ${trade.symbol} ${trade.trade_type} - $${trade.profit.toFixed(2)} profit`
).join('\n')}

Guidelines:
1. Be conversational, supportive, and actionable
2. Reference specific data from their performance when relevant
3. Ask follow-up questions to understand their trading psychology
4. Provide concrete steps they can take
5. Be encouraging but honest about areas needing improvement
6. Keep responses focused and not too long
7. Use their actual data to make personalized recommendations
`;
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isAIResponding) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage.trim(),
      role: 'user',
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsAIResponding(true);

    try {
      // Check if API key is available
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        throw new Error('Gemini API key not configured');
      }

      // Try Gemini API first
      console.log('Attempting Gemini API call...');
      const model = geminiAPI.getGenerativeModel({ model: 'gemini-pro' });
      const context = generateChatContext();
      
      const prompt = `${context}\n\nConversation History:\n${chatMessages.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}\n\nUser's question: ${userMessage.content}\n\nProvide a helpful, conversational response based on their trading data. Be specific and reference their actual metrics. Keep under 300 words:`;
      
      console.log('Sending request to Gemini API...');
      const result = await model.generateContent(prompt);
      
      if (!result || !result.response) {
        throw new Error('Invalid response from Gemini API');
      }
      
      const aiResponse = result.response.text();
      console.log('✅ Received response from Gemini API');

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Detailed error generating AI response:', error);
      
      // Use fallback AI response when API fails
      let aiResponse: string;
      
      try {
        aiResponse = generateFallbackResponse(userMessage.content, chatMessages);
        console.log('Using fallback AI response');
      } catch (fallbackError) {
        console.error('Fallback response also failed:', fallbackError);
        aiResponse = "I'm having trouble processing your question right now, but I'm here to help! Could you try rephrasing your question or ask me about your trading performance, risk management, or any specific patterns you've noticed?";
      }
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        role: 'assistant',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAIResponding(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewConversation = () => {
    const welcomeMessage: ChatMessage = {
      id: Date.now().toString(),
      content: `Hi Mike! I'm your personal trading AI coach. I've analyzed your ${activeStrategy?.name || 'current'} strategy with ${trades.length} trades.\n\n🎯 **Quick Stats**: ${metrics?.winRate.toFixed(1)}% win rate, ${metrics?.avgRiskReward.toFixed(2)}:1 R:R\n\nI'm ready to discuss your patterns, psychology, and performance. What would you like to explore?`,
      role: 'assistant',
      timestamp: new Date()
    };
    setChatMessages([welcomeMessage]);
  };

  useEffect(() => {
    if (insights.length > 0 && chatMessages.length === 0) {
      startNewConversation();
    }
  }, [insights]);

  const filteredInsights = selectedCategory === 'all' 
    ? insights 
    : insights.filter(insight => insight.category === selectedCategory);

  const sortedInsights = filteredInsights.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });

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

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-600 text-white';
      case 'medium': return 'bg-yellow-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const calculateOverallHealthScore = (): number | null => {
    if (!metrics) return null;
    
    let score = 0;
    let maxScore = 0;

    // Win Rate (0-30 points)
    if (metrics.winRate >= 60) score += 30;
    else if (metrics.winRate >= 45) score += 20;
    else if (metrics.winRate >= 30) score += 10;
    maxScore += 30;

    // Risk Reward Ratio (0-25 points)
    if (metrics.avgRiskReward >= 2.5) score += 25;
    else if (metrics.avgRiskReward >= 1.8) score += 20;
    else if (metrics.avgRiskReward >= 1.2) score += 10;
    maxScore += 25;

    // Profit Factor (0-25 points)
    if (metrics.profitFactor >= 2.0) score += 25;
    else if (metrics.profitFactor >= 1.5) score += 20;
    else if (metrics.profitFactor >= 1.1) score += 10;
    maxScore += 25;

    // Consistency (0-20 points)
    if (metrics.consistency >= 70) score += 20;
    else if (metrics.consistency >= 50) score += 15;
    else if (metrics.consistency >= 30) score += 8;
    maxScore += 20;

    return Math.round((score / maxScore) * 100);
  };

  const getHealthScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getRiskManagementGrade = (): string => {
    if (!metrics) return 'N/A';
    
    if (metrics.avgRiskReward >= 2.5 && metrics.maxDrawdown < 1000) return 'A+';
    if (metrics.avgRiskReward >= 2.0 && metrics.maxDrawdown < 1500) return 'A';
    if (metrics.avgRiskReward >= 1.5 && metrics.maxDrawdown < 2000) return 'B+';
    if (metrics.avgRiskReward >= 1.2) return 'B';
    return 'C';
  };

  const getPsychologyGrade = (): string => {
    if (!metrics) return 'N/A';
    
    const emotionalRisk = predictEmotionalTradingRisk(trades);
    const hasRevengePattern = analyzeAdvancedPatterns(trades).revengeTrading;
    
    if (metrics.consistency >= 70 && !emotionalRisk.highRisk && !hasRevengePattern) return 'A+';
    if (metrics.consistency >= 60 && !hasRevengePattern) return 'A';
    if (metrics.consistency >= 45) return 'B+';
    if (metrics.consistency >= 30) return 'B';
    return 'C';
  };

  const getPerformanceGrade = (): string => {
    if (!metrics) return 'N/A';
    
    if (metrics.winRate >= 65 && metrics.profitFactor >= 2.0) return 'A+';
    if (metrics.winRate >= 55 && metrics.profitFactor >= 1.5) return 'A';
    if (metrics.winRate >= 45 && metrics.profitFactor >= 1.2) return 'B+';
    if (metrics.winRate >= 35 && metrics.profitFactor >= 1.0) return 'B';
    return 'C';
  };

  const getTopRecommendations = (): string[] => {
    if (!metrics) return [];
    
    const recommendations: string[] = [];

    if (metrics.avgRiskReward < 1.5) {
      recommendations.push('Improve your risk-reward ratio by targeting 2:1 minimum on all trades');
    }
    
    if (metrics.winRate < 45) {
      recommendations.push('Focus on trade quality over quantity - tighten your entry criteria');
    }
    
    if (metrics.maxDrawdown > 1500) {
      recommendations.push('Implement stricter stop-loss rules to reduce maximum drawdown');
    }
    
    if (metrics.consistency < 50) {
      recommendations.push('Work on emotional discipline and consistent position sizing');
    }
    
    if (predictEmotionalTradingRisk(trades).highRisk) {
      recommendations.push('Take a trading break to reset emotional state and review rules');
    }
    
    if (analyzeAdvancedPatterns(trades).revengeTrading) {
      recommendations.push('Implement mandatory cooling-off periods after significant losses');
    }

    return recommendations.slice(0, 3);
  };

  // Enhanced fallback AI response with conversation memory
  const generateFallbackResponse = (question: string, previousMessages: ChatMessage[]): string => {
    const lowerQuestion = question.toLowerCase();
    
    if (!metrics || trades.length === 0) {
      return "I'd love to analyze your trading patterns, but I need some trade data first. Once you've logged a few trades, I'll be able to provide detailed insights about your performance, risk management, and psychology patterns!";
    }

    // Check if this is a follow-up question
    const isFollowUp = previousMessages.length > 2;
    const lastUserMessage = previousMessages.filter(m => m.role === 'user').slice(-2, -1)[0]?.content.toLowerCase() || '';

    // Context-aware responses based on conversation flow
    if (isFollowUp && (lowerQuestion.includes('deeper') || lowerQuestion.includes('more') || lowerQuestion.includes('tell me'))) {
      if (lastUserMessage.includes('pattern')) {
        return `Let me dive deeper into your trading patterns:\n\n🕐 **Time Analysis**: ${analyzeTimeBasedPerformance(trades).bestTimeWindow ? `You perform ${analyzeTimeBasedPerformance(trades).improvement}% better during ${analyzeTimeBasedPerformance(trades).bestTimeWindow}` : 'No clear time-based patterns detected yet'}\n\n📈 **Symbol Performance**: ${analyzeSymbolSpecialization(trades).specialist ? `You're particularly strong with ${analyzeSymbolSpecialization(trades).topSymbol} (${analyzeSymbolSpecialization(trades).winRate.toFixed(1)}% win rate)` : 'Performance seems consistent across different symbols'}\n\n🧠 **Psychology**: ${predictEmotionalTradingRisk(trades).highRisk ? 'I detect elevated emotional trading risk - consider taking a break' : 'Your emotional control is stable'}\n\nWhich of these areas interests you most?`;
      }
      if (lastUserMessage.includes('improve')) {
        const recommendations = getTopRecommendations().slice(0, 2);
        return `Here are specific steps you can take this week:\n\n${recommendations.map((rec, i) => `**${i + 1}. ${rec.split(' ')[0]} Focus**: ${rec}`).join('\n\n')}\n\nStart with one of these - which feels most actionable for you right now?`;
      }
    }

    // Fresh conversation starters
    if (lowerQuestion.includes('pattern') || lowerQuestion.includes('behavior')) {
      const patterns = analyzeAdvancedPatterns(trades);
      const timeAnalysis = analyzeTimeBasedPerformance(trades);
      
      const responses = [
        `Analyzing your ${trades.length} trades, here's what stands out:`,
        `• **Win Rate**: ${metrics.winRate.toFixed(1)}% - ${metrics.winRate > 60 ? 'excellent!' : metrics.winRate > 45 ? 'solid foundation' : 'needs improvement'}`,
        `• **Risk-Reward**: ${metrics.avgRiskReward.toFixed(2)}:1 - ${metrics.avgRiskReward > 2 ? 'outstanding discipline!' : metrics.avgRiskReward > 1.5 ? 'good but can improve' : 'this needs immediate attention'}`,
        patterns.revengeTrading ? '• ⚠️ **Revenge Trading Detected** - You tend to increase position sizes after losses' : '• ✅ **Emotional Control** - No revenge trading patterns detected',
        timeAnalysis.bestTimeWindow ? `• ⏰ **Peak Performance**: ${timeAnalysis.bestTimeWindow} (${timeAnalysis.improvement}% better)` : '',
        `\nWhat would you like to explore first: emotions, timing, or risk management?`
      ];
      return responses.filter(r => r).join('\n');
    }

    if (lowerQuestion.includes('improve') || lowerQuestion.includes('better') || lowerQuestion.includes('fix')) {
      const topRecommendation = getTopRecommendations()[0];
      const urgentIssues = [];
      
      if (metrics.avgRiskReward < 1.2) urgentIssues.push('risk-reward ratio');
      if (metrics.winRate < 40) urgentIssues.push('entry criteria');
      if (predictEmotionalTradingRisk(trades).highRisk) urgentIssues.push('emotional control');

      if (urgentIssues.length > 0) {
        return `🚨 **Priority Alert**: Your ${urgentIssues.join(' and ')} need immediate attention.\n\n**This Week's Action Plan**:\n1. ${topRecommendation}\n\n**Quick Win**: ${urgentIssues[0] === 'risk-reward ratio' ? 'Set a rule to only take trades with 2:1 reward potential' : urgentIssues[0] === 'entry criteria' ? 'Paper trade for 3 days to refine your setup criteria' : 'Take a 24-hour break after any loss over $100'}\n\nReady to commit to this change?`;
      }
      
      return `Your trading shows promise! Here's how to level up:\n\n**#1 Priority**: ${topRecommendation}\n\n**Performance Grades**:\n• Risk Management: ${getRiskManagementGrade()}\n• Psychology: ${getPsychologyGrade()}\n• Performance: ${getPerformanceGrade()}\n\nWhich grade would you like to improve first?`;
    }

    if (lowerQuestion.includes('risk') || lowerQuestion.includes('drawdown') || lowerQuestion.includes('loss')) {
      const riskGrade = getRiskManagementGrade();
      return `**Risk Assessment for Your Trading**:\n\n📊 **Current Stats**:\n• Max Drawdown: $${metrics.maxDrawdown.toFixed(2)}\n• Risk-Reward: ${metrics.avgRiskReward.toFixed(2)}:1\n• Overall Grade: **${riskGrade}**\n\n${riskGrade < 'B' ? '🚨 **Action Required**: Your risk management needs improvement. Consider reducing position sizes by 50% until you achieve consistent 2:1 risk-reward ratios.' : '✅ **Good Foundation**: Your risk management is solid. Focus on consistency.'}\n\nWhat's your biggest concern about risk right now?`;
    }

    if (lowerQuestion.includes('psychology') || lowerQuestion.includes('emotion') || lowerQuestion.includes('feeling') || lowerQuestion.includes('revenge')) {
      const psychGrade = getPsychologyGrade();
      const emotionalRisk = predictEmotionalTradingRisk(trades);
      
      return `**Trading Psychology Analysis**:\n\n🧠 **Mental State**: ${emotionalRisk.highRisk ? '⚠️ High emotional risk detected' : '✅ Stable emotional control'}\n📈 **Consistency**: ${metrics.consistency.toFixed(1)}% of months profitable\n🎯 **Grade**: **${psychGrade}**\n\n${emotionalRisk.highRisk ? '**Immediate Action**: Take a 48-hour trading break. Review your rules and come back refreshed.' : '**Strength**: You maintain good emotional discipline. Keep following your systematic approach.'}\n\nHow do you feel about your trading right now?`;
    }

    if (lowerQuestion.includes('when') || lowerQuestion.includes('time') || lowerQuestion.includes('hour')) {
      const timeAnalysis = analyzeTimeBasedPerformance(trades);
      return `**Timing Analysis**:\n\n${timeAnalysis.bestTimeWindow ? `🕐 **Your Peak Hours**: ${timeAnalysis.bestTimeWindow}\n📈 **Performance Boost**: ${timeAnalysis.improvement}% better than average\n\n💡 **Strategy**: Focus your highest-conviction trades during ${timeAnalysis.bestTimeWindow.toLowerCase()} and reduce activity outside this window.` : `⏰ I don't see clear time-based patterns yet. Try tracking your mood and market conditions during different trading sessions.`}\n\nDo you notice any patterns in when you feel most confident trading?`;
    }

    // Default conversational response
    const randomTips = [
      "Your consistency is the foundation of long-term success",
      "Small improvements compound over time in trading",
      "Focus on process over profits",
      "Every loss is data for improvement"
    ];
    
    return `Great question! With ${trades.length} trades and a ${metrics.winRate.toFixed(1)}% win rate, you're building solid experience.\n\n💡 **Today's Insight**: ${randomTips[Math.floor(Math.random() * randomTips.length)]}.\n\nI can dive deep into your patterns, psychology, risk management, or performance optimization. What's on your mind today?`;
  };

  return (
    <div className="max-w-7xl mx-4 px-2 sm:px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-8 h-8 text-purple-400" />
          <h1 className="text-3xl font-bold text-white">AI Trading Insights</h1>
        </div>
        <p className="text-gray-400 mb-6">
          Advanced AI analysis of your {activeStrategy?.name || 'trading'} strategy performance and behavior patterns
        </p>

        {/* Performance Overview Cards */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Total Trades</div>
              <div className="text-2xl font-bold text-white">{metrics.totalTrades}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Win Rate</div>
              <div className="text-2xl font-bold text-white">{metrics.winRate.toFixed(1)}%</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Risk:Reward</div>
              <div className="text-2xl font-bold text-white">{metrics.avgRiskReward.toFixed(1)}:1</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Profit Factor</div>
              <div className="text-2xl font-bold text-white">{metrics.profitFactor.toFixed(2)}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Max Drawdown</div>
              <div className="text-2xl font-bold text-white">${metrics.maxDrawdown.toFixed(0)}</div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-xs text-gray-400 uppercase tracking-wide">Consistency</div>
              <div className="text-2xl font-bold text-white">{metrics.consistency.toFixed(1)}%</div>
            </div>
          </div>
        )}

        {/* AI Performance Score Dashboard */}
        {metrics && insights.length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">AI Trading Health Score</h3>
                  <p className="text-purple-200 text-sm">Comprehensive analysis of your trading performance</p>
                </div>
              </div>
              {calculateOverallHealthScore() && (
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getHealthScoreColor(calculateOverallHealthScore()!)}`}>
                    {calculateOverallHealthScore()}/100
                  </div>
                  <div className="text-sm text-gray-300">Health Score</div>
                </div>
              )}
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-400">Risk Management</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {getRiskManagementGrade()}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="w-4 h-4 text-purple-400" />
                  <span className="text-sm text-gray-400">Psychology</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {getPsychologyGrade()}
                </div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-gray-400">Performance</span>
                </div>
                <div className="text-lg font-bold text-white">
                  {getPerformanceGrade()}
                </div>
              </div>
            </div>

            {/* Top Recommendations */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-600">
              <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI's Top 3 Recommendations
              </h4>
              <div className="space-y-2 text-sm">
                {getTopRecommendations().map((rec, index) => (
                  <div key={index} className="flex items-start gap-2 text-gray-300">
                    <span className="text-purple-400 font-bold">{index + 1}.</span>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all', 'performance', 'risk', 'psychology', 'strategy', 'timing'].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="space-y-6">
        {isAnalyzing && (
          <div className="text-center py-12">
            <div className="animate-pulse">
              <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">AI Brain at Work</h3>
              <p className="text-gray-400">Analyzing {trades.length} trades for deep insights...</p>
              <div className="mt-4 flex justify-center">
                <div className="flex space-x-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {!isAnalyzing && sortedInsights.length === 0 && (
          <div className="text-center py-12 bg-gray-800 rounded-lg border border-gray-700">
            <Eye className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Insufficient Data for AI Analysis</h3>
            <p className="text-gray-400 mb-4">Complete more trades to unlock powerful AI insights</p>
            <p className="text-sm text-gray-500">Minimum 10 trades needed for basic analysis</p>
          </div>
        )}

        {sortedInsights.map((insight, index) => {
          const IconComponent = insight.icon;
          return (
            <div
              key={index}
              className={`p-6 rounded-lg border ${getInsightColor(insight.type)} transition-all hover:scale-[1.01]`}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-gray-900/50 ${getIconColor(insight.type)}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{insight.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityBadge(insight.priority)}`}>
                        {insight.priority.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-400">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-300 mb-4">{insight.description}</p>
                  <div className="bg-gray-900/50 p-4 rounded-lg border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Lightbulb className="w-4 h-4 text-purple-400" />
                      <span className="text-sm font-medium text-purple-400">Action Plan</span>
                    </div>
                    <p className="text-sm text-gray-300">{insight.actionable}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {sortedInsights.length > 0 && (
        <div className="mt-8 p-6 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">AI Analysis Summary</h3>
          </div>
          <p className="text-gray-300 text-sm">
            Based on analysis of {trades.length} trades from your {activeStrategy?.name || 'current'} strategy. 
            Insights are ranked by priority and confidence level. High-priority items require immediate attention, 
            while medium and low priority insights can be implemented gradually for optimization.
          </p>
          <div className="mt-4 text-xs text-gray-500">
            Last updated: {new Date().toLocaleString()} • Next analysis: Live updates with new trades
          </div>
        </div>
      )}

      {/* AI Chat Interface */}
      <div className="fixed bottom-4 right-4 z-50">
        {!isChatOpen ? (
          <button
            onClick={() => setIsChatOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 group"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>
        ) : (
          <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 w-96 h-[500px] flex flex-col">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-700 bg-gradient-to-r from-purple-600 to-blue-600 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-white" />
                  <h3 className="text-white font-semibold">AI Trading Coach</h3>
                </div>
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  <ChevronDown className="w-5 h-5" />
                </button>
              </div>
              <p className="text-purple-100 text-xs mt-1">
                Ask me anything about your trading insights and performance
              </p>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user' 
                      ? 'bg-blue-600' 
                      : 'bg-gradient-to-r from-purple-600 to-blue-600'
                  }`}>
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-white" />
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <div className={`max-w-[280px] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white ml-auto'
                      : 'bg-gray-700 text-gray-200'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}
              
              {isAIResponding && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-gray-700 p-3 rounded-lg">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your trading insights..."
                  className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                  disabled={isAIResponding}
                />
                <button
                  onClick={sendMessage}
                  disabled={!inputMessage.trim() || isAIResponding}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {/* Quick Start Buttons */}
              {chatMessages.length <= 1 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => setInputMessage("What patterns do you see in my trading?")}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                  >
                    My patterns?
                  </button>
                  <button
                    onClick={() => setInputMessage("How can I improve my risk management?")}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                  >
                    Better risk management
                  </button>
                  <button
                    onClick={() => setInputMessage("What's my biggest weakness right now?")}
                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors"
                  >
                    Biggest weakness?
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIInsights;
