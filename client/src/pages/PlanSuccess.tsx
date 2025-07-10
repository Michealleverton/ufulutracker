import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, Settings, BarChart3 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

const PlanSuccess = () => {
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    const fetchUpdatedProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Wait a moment for Stripe webhook to update the profile
          setTimeout(async () => {
            const { data: profile, error } = await supabase
              .from('profiles')
              .select('username, plan, max_strategies')
              .eq('id', user.id)
              .single();
            
            if (profile && !error) {
              setUserPlan(profile.plan);
              setUsername(profile.username);
              
              // Update localStorage with new plan
              localStorage.setItem('selectedPlan', profile.plan);
              
              toast.success(`Plan updated successfully! You now have ${profile.plan} plan with ${profile.max_strategies} strategies.`);
            } else {
              console.error('Error fetching updated profile:', error);
            }
            
            setLoading(false);
          }, 2000); // Give webhook time to process
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error:', error);
        setLoading(false);
      }
    };

    fetchUpdatedProfile();
  }, []);

  const getPlanFeatures = (plan: string) => {
    switch (plan.toLowerCase()) {
      case 'premium':
        return {
          title: 'Premium Plan',
          color: 'text-yellow-400',
          features: [
            'Up to 10 trading strategies',
            'Advanced analytics and insights',
            'AI-powered trading assistant',
            'Priority customer support',
            'Export data capabilities',
            'Custom indicators'
          ]
        };
      case 'pro':
        return {
          title: 'Pro Plan',
          color: 'text-purple-400',
          features: [
            'Up to 3 trading strategies',
            'Enhanced analytics dashboard',
            'AI-powered trading assistant',
            'Email support',
            'Trade journaling tools'
          ]
        };
      default:
        return {
          title: 'Free Plan',
          color: 'text-green-400',
          features: [
            '1 trading strategy',
            'Basic analytics',
            'Community support',
            'Trade logging'
          ]
        };
    }
  };

  const planInfo = getPlanFeatures(userPlan);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
          <p className="text-white">Processing your plan changes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">
            Plan Updated Successfully!
          </h1>
          <p className="text-gray-400">
            Welcome to your {planInfo.title}, {username}!
          </p>
        </div>

        <div className="mb-6 p-4 bg-gray-700 rounded-lg">
          <h2 className={`text-lg font-semibold mb-3 ${planInfo.color}`}>
            {planInfo.title} Features
          </h2>
          <ul className="text-sm text-gray-300 space-y-2">
            {planInfo.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <Link
            to="/dashboard/analytics"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center group"
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            Start Trading
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
          
          <Link
            to="/dashboard/settings"
            className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Settings className="h-5 w-5 mr-2" />
            View Settings
          </Link>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If you don't see your plan changes immediately, they may take a few minutes to sync.
        </p>
      </div>
    </div>
  );
};

export default PlanSuccess;
