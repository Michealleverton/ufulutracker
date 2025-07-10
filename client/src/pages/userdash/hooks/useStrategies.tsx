import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import type { Strategy, User } from '../../../types';

// Helper function to create blank default trades for new strategies
const createDefaultTrades = async (userId: string, strategies: Strategy[]) => {
  try {
    console.log("Creating default blank trades for strategies:", strategies);
    
    const defaultTrades = strategies.map((strategy) => {
      return {
        user_id: userId,
        strategy_id: strategy.id,
        date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        symbol: "",
        type: 'buy' as const,
        price: 0,
        quantity: 0,
        profit: 0,
        notes: ""
      };
    });

    const { data, error } = await supabase
      .from('trades')
      .insert(defaultTrades);

    if (error) {
      console.error("Error creating default trades:", error);
    } else {
      console.log("Default blank trades created successfully:", data);
    }
  } catch (err) {
    console.error("Failed to create default trades:", err);
  }
};

export const useStrategies = () => {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [activeStrategy, setActiveStrategy] = useState<Strategy | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user profile
  const fetchUser = async (forceRefresh = false) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      console.log("Auth user:", authUser);
      if (!authUser) return null;

      console.log("Fetching user profile", forceRefresh ? "with force refresh" : "normally");

      // First try to get existing profile
      let { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      console.log("Profile data:", profile, "Profile error:", error);
      
      // If profile doesn't exist, create it with premium plan for new paying users
      if (error && error.code === 'PGRST116') {
        console.log("Profile doesn't exist, creating one...");
        
        // Check if user just completed a payment by looking at localStorage or URL
        const selectedPlan = localStorage.getItem("selectedPlan") || 'premium';
        const isNewPaidUser = selectedPlan === 'premium' || selectedPlan === 'pro';
        
        const newProfile = {
          id: authUser.id,
          username: authUser.email?.split('@')[0] || 'user',
          plan: isNewPaidUser ? selectedPlan : 'free',
          max_strategies: isNewPaidUser ? (selectedPlan === 'premium' ? 10 : 3) : 1,
        };
        
        const { data: createdProfile, error: createError } = await supabase
          .from('profiles')
          .insert([newProfile])
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating profile:", createError);
          throw createError;
        }
        
        profile = createdProfile;
        console.log("Created profile:", profile);
      } else if (error) {
        console.error("Error fetching profile:", error);
        throw error;
      }
      
      // Ensure paid users have correct max_strategies
      if ((profile.plan === 'premium' || profile.plan === 'pro') && 
          ((profile.plan === 'premium' && profile.max_strategies !== 10) ||
           (profile.plan === 'pro' && profile.max_strategies !== 3))) {
        console.log("Updating profile to fix max_strategies for paid user");
        const correctMaxStrategies = profile.plan === 'premium' ? 10 : 3;
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ max_strategies: correctMaxStrategies })
          .eq('id', authUser.id);
        
        if (updateError) {
          console.error("Error updating profile max_strategies:", updateError);
        } else {
          profile.max_strategies = correctMaxStrategies;
        }
      }
      
      const userData: User = {
        id: profile.id,
        email: authUser.email || '',
        username: profile.username,
        plan: profile.plan || 'free',
        subscription_id: profile.subscription_id,
        subscription_status: profile.subscription_status,
        max_strategies: profile.max_strategies || 
          (profile.plan === 'premium' ? 10 : 
           profile.plan === 'pro' ? 3 : 1),
      };
      
      console.log("User data created:", userData);
      setUser(userData);
      return userData;
    } catch (err) {
      console.error('Error fetching user:', err);
      setError('Failed to fetch user data');
      return null;
    }
  };

  // Fetch all strategies for the current user
  const fetchStrategies = async () => {
    try {
      setLoading(true);
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        console.log("No authenticated user found");
        return;
      }

      console.log("Fetching strategies for user:", authUser.id);

      // First, let's check if the strategies table exists and try to fetch with a small retry
      let attempts = 0;
      let data = null;
      let error = null;
      
      while (attempts < 3) {
        attempts++;
        const result = await supabase
          .from('strategies')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: true });
          
        data = result.data;
        error = result.error;
        
        if (!error || !error.message.includes('relation "strategies" does not exist')) {
          break; // Success or non-table-existence error
        }
        
        if (attempts < 3) {
          console.log(`Attempt ${attempts} failed, retrying in 500ms...`);
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      console.log("Strategies query result:", { data, error });

      if (error) {
        console.error("Error fetching strategies:", error);
        // If table doesn't exist, this means database migrations need to be applied
        if (error.message.includes('relation "public.strategies" does not exist') || 
            error.message.includes('relation "strategies" does not exist')) {
          console.log("Strategies table doesn't exist - database migrations need to be applied");
          setError('Database setup required. Please contact support or apply database migrations.');
          return;
        } else if (error.message.includes('permission denied') || error.code === '42501') {
          console.log("Permission denied - RLS policies might be blocking access");
          setError('Database access denied. Please contact support.');
          return;
        }
        throw error;
      }

      console.log("Fetched strategies:", data);
      setStrategies(data || []);
      
      // If no strategies exist, create default ones for new users
      if (!data || data.length === 0) {
        console.log("No strategies found, creating default strategies...");
        
        // Get the current user data to determine how many strategies to create
        // Force a fresh profile fetch to get the latest subscription data
        console.log("Fetching fresh profile data for strategy creation...");
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('plan, max_strategies')
          .eq('id', authUser.id)
          .single();
          
        console.log("Profile for strategy creation:", profile, "Error:", profileError);
        
        const maxStrategies = profile?.max_strategies || 1;
        const userPlan = profile?.plan || 'free';
        
        console.log(`Creating strategies for ${userPlan} plan with max ${maxStrategies} strategies`);
        
        try {
          // Create strategies based on the user's plan
          let defaultStrategies = [];
          
          // Always create at least one strategy
          defaultStrategies.push({
            user_id: authUser.id,
            name: 'Strategy 1',
            description: 'Your primary trading strategy',
            is_active: true,
          });
          
          // Add additional strategies for paid plans
          if (userPlan === 'pro' && maxStrategies >= 3) {
            defaultStrategies.push(
              {
                user_id: authUser.id,
                name: 'Strategy 2',
                description: 'Secondary trading strategy',
                is_active: false,
              },
              {
                user_id: authUser.id,
                name: 'Strategy 3',
                description: 'Third trading strategy',
                is_active: false,
              }
            );
          } else if (userPlan === 'premium' && maxStrategies >= 10) {
            defaultStrategies.push(
              {
                user_id: authUser.id,
                name: 'Strategy 2',
                description: 'Secondary trading strategy',
                is_active: false,
              },
              {
                user_id: authUser.id,
                name: 'Strategy 3',
                description: 'Third trading strategy',
                is_active: false,
              },
              {
                user_id: authUser.id,
                name: 'Strategy 4',
                description: 'Fourth trading strategy',
                is_active: false,
              }
            );
          }
          
          console.log("Attempting to create strategies:", defaultStrategies);
          
          // Try to create all strategies at once
          const { data: createdStrategies, error: createError } = await supabase
            .from('strategies')
            .insert(defaultStrategies)
            .select();
            
          if (createError) {
            console.error("Error creating strategies:", createError);
            console.error("Create error details:", JSON.stringify(createError, null, 2));
            
            // Check if it's a unique constraint violation (strategies already exist)
            if (createError.message.includes('duplicate key') || 
                createError.message.includes('strategies_name_user_unique') ||
                createError.code === '23505') {
              console.log("Strategies with these names already exist, refetching...");
              
              // Strategies already exist, try to fetch them again
              const { data: existingStrategies, error: refetchError } = await supabase
                .from('strategies')
                .select('*')
                .eq('user_id', authUser.id)
                .order('created_at', { ascending: true });
                
              if (!refetchError && existingStrategies && existingStrategies.length > 0) {
                console.log("Found existing strategies:", existingStrategies);
                setStrategies(existingStrategies);
                const activeStrategy = existingStrategies.find((s: Strategy) => s.is_active) || null;
                setActiveStrategy(activeStrategy);
                return; // Successfully found existing strategies
              } else {
                console.error("Could not refetch existing strategies:", refetchError);
              }
            }
            
            // If all strategies failed for other reasons, try creating just one basic strategy
            console.log("Retrying with single basic strategy...");
            const basicStrategy = {
              user_id: authUser.id,
              name: 'Strategy 1',
              description: 'Your primary trading strategy',
              is_active: true,
            };
            
            const { data: singleStrategy, error: singleError } = await supabase
              .from('strategies')
              .insert([basicStrategy])
              .select();
              
            if (singleError) {
              console.error("Error creating single strategy:", singleError);
              throw singleError;
            }
            
            console.log("Single strategy created successfully:", singleStrategy);
            setStrategies(singleStrategy || []);
            setActiveStrategy(singleStrategy?.[0] || null);
            
            // Create default blank trades for the single strategy
            if (singleStrategy && singleStrategy.length > 0) {
              await createDefaultTrades(authUser.id, singleStrategy);
            }
          } else {
            console.log("All strategies created successfully:", createdStrategies);
            setStrategies(createdStrategies || []);
            const activeStrategy = createdStrategies?.find((s: Strategy) => s.is_active) || null;
            setActiveStrategy(activeStrategy);
            
            // Create default blank trades for each strategy
            if (createdStrategies && createdStrategies.length > 0) {
              await createDefaultTrades(authUser.id, createdStrategies);
            }
          }
        } catch (createErr) {
          console.error("Failed to create any strategies:", createErr);
          console.error("Create error details:", JSON.stringify(createErr, null, 2));
          
          // Only show error message if the strategies table doesn't exist or there's a permission issue
          if (createErr && typeof createErr === 'object' && 'message' in createErr) {
            const errorMessage = (createErr as any).message;
            if (errorMessage.includes('relation "strategies" does not exist') ||
                errorMessage.includes('relation "public.strategies" does not exist')) {
              setError('Database setup incomplete. The strategies table does not exist. Please contact support.');
              return;
            } else if (errorMessage.includes('permission denied') ||
                       errorMessage.includes('row-level security policy') ||
                       (createErr as any).code === '42501') {
              setError('Database access denied. RLS policies may be blocking access. Please contact support.');
              return;
            } else {
              // For other errors, create a fallback strategy
              console.log("Creating fallback strategy due to unknown error...");
              const fallbackStrategy = {
                id: 'temp-strategy-1',
                user_id: authUser.id,
                name: 'Strategy 1',
                description: 'Your main trading strategy',
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setStrategies([fallbackStrategy]);
              setActiveStrategy(fallbackStrategy);
              setError(null); // Don't show error for fallback strategy
              console.log("Using fallback strategy due to creation error");
            }
          } else {
            // Unknown error type, use fallback
            console.log("Unknown error type, using fallback strategy");
            const fallbackStrategy = {
              id: 'temp-strategy-1',
              user_id: authUser.id,
              name: 'Strategy 1', 
              description: 'Your main trading strategy',
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setStrategies([fallbackStrategy]);
            setActiveStrategy(fallbackStrategy);
            setError(null);
          }
        }
      } else {
        // Set active strategy
        const active = data?.find((s: Strategy) => s.is_active) || null;
        console.log("Active strategy:", active);
        setActiveStrategy(active);
      }
    } catch (err) {
      console.error('Error fetching strategies:', err);
      setError('Failed to fetch strategies');
    } finally {
      setLoading(false);
    }
  };

  // Create a new strategy
  const createStrategy = async (name: string, description?: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('No authenticated user');

      console.log("Creating strategy for user:", authUser.id, "Name:", name);

      const { data, error } = await supabase
        .from('strategies')
        .insert([{
          user_id: authUser.id,
          name,
          description,
          is_active: false, // New strategies are not active by default
        }])
        .select()
        .single();

      console.log("Create strategy result:", { data, error });

      if (error) {
        console.error("Error creating strategy:", error);
        throw error;
      }

      setStrategies(prev => [...prev, data]);
      return data;
    } catch (err) {
      console.error('Error creating strategy:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create strategy';
      setError(errorMessage);
      throw err;
    }
  };

  // Set active strategy
  const setActiveStrategyById = async (strategyId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('No authenticated user');

      // First, set all strategies to inactive
      await supabase
        .from('strategies')
        .update({ is_active: false })
        .eq('user_id', authUser.id);

      // Then set the selected strategy to active
      const { data, error } = await supabase
        .from('strategies')
        .update({ is_active: true })
        .eq('id', strategyId)
        .eq('user_id', authUser.id)
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setStrategies(prev => prev.map(s => ({
        ...s,
        is_active: s.id === strategyId
      })));
      setActiveStrategy(data);
      
      return data;
    } catch (err) {
      console.error('Error setting active strategy:', err);
      setError('Failed to set active strategy');
      throw err;
    }
  };

  // Delete a strategy
  const deleteStrategy = async (strategyId: string) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('No authenticated user');

      // Don't allow deleting the last strategy
      if (strategies.length <= 1) {
        throw new Error('Cannot delete your last strategy');
      }

      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', strategyId)
        .eq('user_id', authUser.id);

      if (error) throw error;

      const deletedStrategy = strategies.find(s => s.id === strategyId);
      setStrategies(prev => prev.filter(s => s.id !== strategyId));

      // If we deleted the active strategy, activate the first remaining one
      if (deletedStrategy?.is_active && strategies.length > 1) {
        const remaining = strategies.filter(s => s.id !== strategyId);
        if (remaining.length > 0) {
          await setActiveStrategyById(remaining[0].id);
        }
      }
    } catch (err) {
      console.error('Error deleting strategy:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete strategy');
      throw err;
    }
  };

  // Update strategy
  const updateStrategy = async (strategyId: string, updates: Partial<Strategy>) => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('strategies')
        .update(updates)
        .eq('id', strategyId)
        .eq('user_id', authUser.id)
        .select()
        .single();

      if (error) throw error;

      setStrategies(prev => prev.map(s => s.id === strategyId ? data : s));
      
      if (data.is_active) {
        setActiveStrategy(data);
      }

      return data;
    } catch (err) {
      console.error('Error updating strategy:', err);
      setError('Failed to update strategy');
      throw err;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log("Initializing strategy data...");
        setLoading(true);
        
        // Check if we need to refresh due to recent subscription update
        const needsRefresh = localStorage.getItem('needsStrategiesRefresh');
        if (needsRefresh === 'true') {
          console.log("Detected recent subscription update, forcing refresh...");
          localStorage.removeItem('needsStrategiesRefresh');
          // Add a small delay to ensure all database updates are visible
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        const userData = await fetchUser(needsRefresh === 'true');
        if (userData) {
          await fetchStrategies();
        }
      } catch (err) {
        console.error('Error initializing data:', err);
        setError('Failed to initialize data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  return {
    strategies,
    activeStrategy,
    user,
    loading,
    error,
    createStrategy,
    setActiveStrategyById,
    deleteStrategy,
    updateStrategy,
    refetch: fetchStrategies,
    clearError: () => setError(null),
  };
};
