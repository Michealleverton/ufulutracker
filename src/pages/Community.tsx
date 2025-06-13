import { Users, MessageCircle, Share2, Heart, Trophy, Target } from 'lucide-react';
import { FeatureCard } from './userdash/components/FeatureCard';
import useScrollToTop from './hooks/useScrollToTop';


const features = [
  {
    icon: MessageCircle,
    title: 'Discussion Forums',
    description: 'Engage in meaningful discussions about trading strategies and market analysis'
  },
  {
    icon: Share2,
    title: 'Trade Ideas',
    description: 'Share and discover trading opportunities with fellow traders'
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    description: 'Compete with other traders and showcase your performance'
  },
  {
    icon: Heart,
    title: 'Mentorship',
    description: 'Connect with experienced traders for guidance and support'
  }
];

export const Community = () => {

  useScrollToTop();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Users className="h-16 w-16 text-indigo-400 mx-auto mb-6" />
          <h1 className="text-4xl font-bold text-white mb-4">Join Our Trading Community</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Connect with fellow traders, share insights, and grow together in our supportive community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>

        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <Target className="h-12 w-12 text-indigo-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Ready to Join?</h2>
          <p className="text-gray-300 mb-6">
            Start connecting with traders from around the world and take your trading to the next level.
          </p>
          <button className="bg-indigo-600 text-white px-8 py-3 rounded-md hover:bg-indigo-700 transition-colors">
            Join Community
          </button>
        </div>
      </div>
    </div>
  );
};
