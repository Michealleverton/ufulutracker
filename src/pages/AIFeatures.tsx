import { Bot, LineChart, Target, Shield, Sparkles } from 'lucide-react';

export const AIFeatures = () => {
  const features = [
    {
      icon: LineChart,
      title: 'Pattern Recognition',
      description: 'Your AI assistant analyzes your trading history to identify successful patterns and potential pitfalls.'
    },
    {
      icon: Target,
      title: 'Risk/Reward Optimization',
      description: 'Get personalized suggestions to optimize your risk/reward ratios based on your trading style and goals.'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Receive real-time alerts when your trading patterns deviate from your established risk parameters.'
    },
    {
      icon: Sparkles,
      title: 'Smart Insights',
      description: 'Get AI-powered insights about your trading behavior, market conditions, and potential improvements.'
    }
  ];

  return (
    <section className="bg-gray-900 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Bot className="h-16 w-16 text-indigo-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Your Personal Trading AI Assistant</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet your AI trading companion that learns from your trading style and helps you make better decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map(({ icon: Icon, title, description }) => (
            <div key={title} className="bg-gray-800 p-6 rounded-lg transform hover:scale-105 transition-transform duration-200">
              <div className="flex items-center mb-4">
                <Icon className="h-6 w-6 text-indigo-400 mr-3" />
                <h3 className="text-xl font-semibold text-white">{title}</h3>
              </div>
              <p className="text-gray-300">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
