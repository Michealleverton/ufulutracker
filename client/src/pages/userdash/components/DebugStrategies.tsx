import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

// Temporary debugging component - add this to Dashboard.tsx to see what's happening
export const DebugStrategies: React.FC = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const checkStrategies = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setDebugInfo({ error: 'No authenticated user' });
        return;
      }

      // Check profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Check strategies
      const { data: strategies, error: strategiesError } = await supabase
        .from('strategies')
        .select('*')
        .eq('user_id', user.id);

      // Check trades
      const { data: trades, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);

      setDebugInfo({
        userId: user.id,
        email: user.email,
        profile: { data: profile, error: profileError },
        strategies: { data: strategies, error: strategiesError, count: strategies?.length || 0 },
        trades: { data: trades, error: tradesError, count: trades?.length || 0 }
      });
    } catch (error) {
      setDebugInfo({ error: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStrategies();
  }, []);

  if (!debugInfo) return null;

  return (
    <div className="fixed top-4 left-4 bg-black text-white p-4 rounded-lg max-w-lg max-h-96 overflow-auto z-50 text-xs">
      <h3 className="text-lg font-bold mb-2">Debug Info</h3>
      <button 
        onClick={checkStrategies} 
        disabled={loading}
        className="mb-2 px-2 py-1 bg-blue-600 rounded text-white"
      >
        {loading ? 'Loading...' : 'Refresh'}
      </button>
      <pre className="whitespace-pre-wrap">
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div>
  );
};

// To use this, add to your Dashboard.tsx:
// import { DebugStrategies } from './DebugStrategies';
// 
// Then add this component somewhere in your JSX:
// <DebugStrategies />
