import { useState, useEffect } from "react";
import TradingViewWidget from "../components/TradingViewWidget";
import { Collapse } from "react-collapse";
import { Edit, Trash, Plus, GripVertical, Check, Target } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useStrategyContext } from "../../../Context/StrategyContext";
import toast from "react-hot-toast";

interface Step {
  id: string;
  text: string;
  completed: boolean;
}

interface Strategy {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}

const Charts = () => {
  const { user } = useStrategyContext();
  const [isTradeBookOpen, setIsTradeBookOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);

  // Load trade book strategies from Supabase
  useEffect(() => {
    if (user) {
      loadTradeBookStrategies();
    }
  }, [user]);

  const loadTradeBookStrategies = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First check if user has any existing strategies
      const { data: existingStrategies, error: fetchError } = await supabase
        .from('trade_book_strategies')
        .select(`
          id,
          title,
          description,
          position_order,
          trade_book_steps (
            id,
            text,
            completed,
            position_order
          )
        `)
        .eq('user_id', user.id)
        .order('position_order', { ascending: true });

      if (fetchError) {
        console.error('Error fetching trade book strategies:', fetchError);
        // Check if the error is because tables don't exist
        if (fetchError.message.includes('relation "trade_book_strategies" does not exist')) {
          toast.error('Trade book tables not found. Please apply the database migration first.');
        } else {
          toast.error('Failed to load trade book strategies');
        }
        return;
      }

      if (existingStrategies && existingStrategies.length > 0) {
        // Convert database format to component format
        const formattedStrategies = existingStrategies.map(strategy => ({
          id: strategy.id,
          title: strategy.title,
          description: strategy.description || '',
          steps: (strategy.trade_book_steps || [])
            .sort((a, b) => a.position_order - b.position_order)
            .map(step => ({
              id: step.id,
              text: step.text,
              completed: step.completed
            }))
        }));
        
        setStrategies(formattedStrategies);
      } else {
        // Create default strategies for new users
        await createDefaultStrategies();
      }
    } catch (error) {
      console.error('Error loading trade book strategies:', error);
      toast.error('Failed to load trade book strategies');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultStrategies = async () => {
    if (!user) return;

    const defaultStrategiesData = [
      {
        title: "A+ Setup",
        description: "4hr Trendline setup with strong confluence factors.",
        position_order: 0,
        steps: [
          "Identify key support and resistance levels",
          "Wait for a breakout or rejection at key levels",
          "Confirm with volume and candlestick patterns",
          "Place trade with proper risk management"
        ]
      },
      {
        title: "B+ Setup",
        description: "Trend Reversal Top Down analysis with moderate confluence.",
        position_order: 1,
        steps: [
          "Identify trend direction using moving averages",
          "Look for pullbacks to key levels",
          "Confirm with RSI or MACD divergence",
          "Place trade with reduced position size"
        ]
      },
      {
        title: "C+ Setup",
        description: "Low probability setup with minimal confluence factors.",
        position_order: 2,
        steps: [
          "Identify range-bound market conditions",
          "Look for overbought/oversold levels on oscillators",
          "Place trade with tight stop-loss"
        ]
      }
    ];

    try {
      // Insert strategies
      const { data: createdStrategies, error: strategyError } = await supabase
        .from('trade_book_strategies')
        .insert(
          defaultStrategiesData.map(strategy => ({
            user_id: user.id,
            title: strategy.title,
            description: strategy.description,
            position_order: strategy.position_order
          }))
        )
        .select();

      if (strategyError) {
        console.error('Error creating default strategies:', strategyError);
        return;
      }

      // Insert steps for each strategy
      const stepsData: Array<{
        strategy_id: string;
        text: string;
        completed: boolean;
        position_order: number;
      }> = [];
      for (let i = 0; i < createdStrategies.length; i++) {
        const strategy = createdStrategies[i];
        const steps = defaultStrategiesData[i].steps;
        
        steps.forEach((stepText, stepIndex) => {
          stepsData.push({
            strategy_id: strategy.id,
            text: stepText,
            completed: false,
            position_order: stepIndex
          });
        });
      }

      const { error: stepsError } = await supabase
        .from('trade_book_steps')
        .insert(stepsData);

      if (stepsError) {
        console.error('Error creating default steps:', stepsError);
        return;
      }

      // Reload strategies
      await loadTradeBookStrategies();
      toast.success('Trade book initialized with default strategies');
    } catch (error) {
      console.error('Error creating default strategies:', error);
      toast.error('Failed to initialize trade book');
    }
  };

  const toggleTradeBook = () => {
    setIsTradeBookOpen(!isTradeBookOpen);
    // When opening the trade book, automatically expand the first strategy
    if (!isTradeBookOpen && strategies.length > 0) {
      setOpenAccordion(strategies[0].id);
    }
  };

  const toggleAccordion = (accordion: string): void => {
    setOpenAccordion(openAccordion === accordion ? null : accordion);
  };

  const startEditingTitle = (strategyId: string, currentTitle: string) => {
    setEditingStrategy(strategyId);
    setEditingTitle(currentTitle);
  };

  const saveTitle = async (strategyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trade_book_strategies')
        .update({ title: editingTitle })
        .eq('id', strategyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating strategy title:', error);
        toast.error('Failed to update strategy title');
        return;
      }

      setStrategies(prev => 
        prev.map(strategy => 
          strategy.id === strategyId 
            ? { ...strategy, title: editingTitle }
            : strategy
        )
      );
      setEditingStrategy(null);
      setEditingTitle("");
      toast.success('Strategy title updated');
    } catch (error) {
      console.error('Error updating strategy title:', error);
      toast.error('Failed to update strategy title');
    }
  };

  const updateDescription = async (strategyId: string, description: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trade_book_strategies')
        .update({ description })
        .eq('id', strategyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating strategy description:', error);
        return;
      }

      setStrategies(prev => 
        prev.map(strategy => 
          strategy.id === strategyId 
            ? { ...strategy, description }
            : strategy
        )
      );
    } catch (error) {
      console.error('Error updating strategy description:', error);
    }
  };

  const toggleStep = async (strategyId: string, stepId: string) => {
    if (!user) return;

    const strategy = strategies.find(s => s.id === strategyId);
    const step = strategy?.steps.find(s => s.id === stepId);
    if (!step) return;

    const newCompleted = !step.completed;

    try {
      const { error } = await supabase
        .from('trade_book_steps')
        .update({ completed: newCompleted })
        .eq('id', stepId);

      if (error) {
        console.error('Error updating step:', error);
        toast.error('Failed to update step');
        return;
      }

      setStrategies(prev => 
        prev.map(strategy => 
          strategy.id === strategyId 
            ? {
                ...strategy,
                steps: strategy.steps.map(step => 
                  step.id === stepId 
                    ? { ...step, completed: newCompleted }
                    : step
                )
              }
            : strategy
        )
      );
    } catch (error) {
      console.error('Error updating step:', error);
      toast.error('Failed to update step');
    }
  };

  const addStep = async (strategyId: string) => {
    if (!user) return;

    const strategy = strategies.find(s => s.id === strategyId);
    if (!strategy) return;

    const newPositionOrder = strategy.steps.length;

    try {
      const { data, error } = await supabase
        .from('trade_book_steps')
        .insert({
          strategy_id: strategyId,
          text: "New step",
          completed: false,
          position_order: newPositionOrder
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding step:', error);
        toast.error('Failed to add step');
        return;
      }

      setStrategies(prev => 
        prev.map(strategy => 
          strategy.id === strategyId 
            ? {
                ...strategy,
                steps: [...strategy.steps, { id: data.id, text: data.text, completed: data.completed }]
              }
            : strategy
        )
      );
      toast.success('Step added');
    } catch (error) {
      console.error('Error adding step:', error);
      toast.error('Failed to add step');
    }
  };

  const updateStep = async (strategyId: string, stepId: string, text: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trade_book_steps')
        .update({ text })
        .eq('id', stepId);

      if (error) {
        console.error('Error updating step text:', error);
        return;
      }

      setStrategies(prev => 
        prev.map(strategy => 
          strategy.id === strategyId 
            ? {
                ...strategy,
                steps: strategy.steps.map(step => 
                  step.id === stepId 
                    ? { ...step, text }
                    : step
                )
              }
            : strategy
        )
      );
    } catch (error) {
      console.error('Error updating step text:', error);
    }
  };

  const deleteStep = async (strategyId: string, stepId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trade_book_steps')
        .delete()
        .eq('id', stepId);

      if (error) {
        console.error('Error deleting step:', error);
        toast.error('Failed to delete step');
        return;
      }

      setStrategies(prev => 
        prev.map(strategy => 
          strategy.id === strategyId 
            ? {
                ...strategy,
                steps: strategy.steps.filter(step => step.id !== stepId)
              }
            : strategy
        )
      );
      toast.success('Step deleted');
    } catch (error) {
      console.error('Error deleting step:', error);
      toast.error('Failed to delete step');
    }
  };

  const resetStrategy = async (strategyId: string) => {
    if (!user) return;

    const strategy = strategies.find(s => s.id === strategyId);
    if (!strategy) return;

    try {
      const { error } = await supabase
        .from('trade_book_steps')
        .update({ completed: false })
        .in('id', strategy.steps.map(step => step.id));

      if (error) {
        console.error('Error resetting strategy:', error);
        toast.error('Failed to reset strategy');
        return;
      }

      setStrategies(prev => 
        prev.map(strategy => 
          strategy.id === strategyId 
            ? {
                ...strategy,
                steps: strategy.steps.map(step => ({ ...step, completed: false }))
              }
            : strategy
        )
      );
      toast.success('Strategy reset');
    } catch (error) {
      console.error('Error resetting strategy:', error);
      toast.error('Failed to reset strategy');
    }
  };

  const deleteStrategy = async (strategyId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('trade_book_strategies')
        .delete()
        .eq('id', strategyId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting strategy:', error);
        toast.error('Failed to delete strategy');
        return;
      }

      setStrategies(prev => prev.filter(strategy => strategy.id !== strategyId));
      toast.success('Strategy deleted');
    } catch (error) {
      console.error('Error deleting strategy:', error);
      toast.error('Failed to delete strategy');
    }
  };

  const getCompletionPercentage = (steps: Step[]) => {
    if (steps.length === 0) return 0;
    const completedSteps = steps.filter(step => step.completed).length;
    return Math.round((completedSteps / steps.length) * 100);
  };

  const isStrategyComplete = (steps: Step[]) => {
    return steps.length > 0 && steps.every(step => step.completed);
  };

  const hasTradeReadyStrategy = () => {
    return strategies.some(strategy => isStrategyComplete(strategy.steps));
  };

  return (
    <div className="relative h-screen">
      {/* Chart takes full width and height */}
      <div className="absolute inset-0 overflow-hidden">
        <TradingViewWidget />
      </div>
      
      {/* Trade Book Container with Button - Floating overlay that slides together */}
      <div
        className={`fixed right-0 top-0 w-96 h-full transition-transform duration-300 ease-in-out transform ${
          isTradeBookOpen ? "translate-x-0" : "translate-x-full"
        } z-40`}
      >
        {/* Trade Book Toggle Button - Positioned relative to the sliding container */}
        <button
          onClick={toggleTradeBook}
          className={`absolute top-1/2 -left-[38px] transform -translate-y-1/2 ${
            hasTradeReadyStrategy() && !isTradeBookOpen
              ? "bg-green-600 border-green-500"
              : isTradeBookOpen
                ? "bg-gray-800 border-gray-600"
                : "bg-blue-600 border-blue-500"
          } text-white px-2 py-6 rounded-l-lg border-l-2 shadow-lg hover:shadow-xl z-10 text-sm font-medium transition-colors duration-300`}
          style={{ writingMode: 'vertical-lr', textOrientation: 'mixed' }}
        >
          {isTradeBookOpen ? "Close" : "Trade Book"}
        </button>

        {/* Trade Book Panel Content */}
        <div className="w-full h-full bg-gradient-to-t from-gray-800 to-gray-900 border-l border-gray-700 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-4">Trade Book</h2>
            {loading ? (
              <div className="text-center text-gray-400 py-8">
                <p>Loading your trade book...</p>
              </div>
            ) : !user ? (
              <div className="text-center text-gray-400 py-8">
                <p>Please log in to access your trade book</p>
              </div>
            ) : strategies.length === 0 ? (
              <div className="text-center text-gray-400 py-8">
                <p>No strategies found</p>
              </div>
            ) : (
              strategies.map((strategy) => (
                <div key={strategy.id} className="mb-4">
                  <button
                    onClick={() => toggleAccordion(strategy.id)}
                    className={`w-full text-left px-4 py-2 rounded-md flex justify-between items-center ${
                      isStrategyComplete(strategy.steps) 
                        ? "bg-green-600 text-white" 
                        : "bg-blue-500 text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {editingStrategy === strategy.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle(strategy.id);
                            if (e.key === 'Escape') {
                              setEditingStrategy(null);
                              setEditingTitle("");
                            }
                          }}
                          className="bg-transparent border-b border-white text-white focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <span>{strategy.title}</span>
                      )}
                      {isStrategyComplete(strategy.steps) && (
                        <div className="flex items-center gap-1">
                          <Target size={16} className="text-green-300" />
                          <span className="text-xs text-green-300">TRADE READY</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                        {getCompletionPercentage(strategy.steps)}%
                      </span>
                      {editingStrategy === strategy.id ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveTitle(strategy.id);
                          }}
                          className="text-green-300 hover:text-white"
                        >
                          <Check size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditingTitle(strategy.id, strategy.title);
                          }}
                          className="text-blue-300 hover:text-white"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          resetStrategy(strategy.id);
                        }}
                        className="text-yellow-300 hover:text-white"
                        title="Reset all steps"
                      >
                        <GripVertical size={16} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this strategy?')) {
                            deleteStrategy(strategy.id);
                          }
                        }}
                        className="text-red-400 hover:text-red-300"
                        title="Delete strategy"
                      >
                        <Trash size={16} />
                      </button>
                    </div>
                  </button>
                  <Collapse isOpened={openAccordion === strategy.id}>
                    <div className="bg-gray-700 text-white p-4 rounded-md mt-2">
                      <textarea
                        value={strategy.description}
                        onChange={(e) => updateDescription(strategy.id, e.target.value)}
                        className="w-full bg-gray-600 text-white p-2 rounded mb-4 resize-none"
                        rows={2}
                        placeholder="Strategy description..."
                      />
                      
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-semibold">Steps:</h3>
                        <button
                          onClick={() => addStep(strategy.id)}
                          className="bg-green-600 text-white px-2 py-1 rounded text-sm flex items-center gap-1"
                        >
                          <Plus size={14} />
                          Add Step
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {strategy.steps.map((step, index) => (
                          <div key={step.id} className="flex items-center gap-2 group">
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="checkbox"
                                checked={step.completed}
                                onChange={() => toggleStep(strategy.id, step.id)}
                                className="w-4 h-4"
                              />
                              <span className="text-sm text-gray-300 min-w-[1.5rem]">
                                {index + 1}.
                              </span>
                              <input
                                type="text"
                                value={step.text}
                                onChange={(e) => updateStep(strategy.id, step.id, e.target.value)}
                                className={`flex-1 bg-transparent border-b border-gray-600 text-white focus:outline-none focus:border-blue-400 text-sm ${
                                  step.completed ? 'line-through text-gray-400' : ''
                                }`}
                                placeholder="Step description..."
                              />
                            </div>
                            <button
                              onClick={() => deleteStep(strategy.id, step.id)}
                              className="text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {isStrategyComplete(strategy.steps) && (
                        <div className="mt-4 p-2 bg-green-800 rounded text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Check size={16} className="text-green-300" />
                            <span className="text-green-300 font-semibold">Ready to Trade!</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Collapse>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Charts;