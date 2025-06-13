import React from 'react';
import { LineChart, Target, Brain, Shield, Clock, Users } from 'lucide-react';

export const AboutSection = () => {
  const features = [
    {
      icon: LineChart,
      title: 'Advanced Analytics',
      description: 'Track your performance with detailed charts and metrics'
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set and monitor your trading goals with precision'
    },
    {
      icon: Brain,
      title: 'Pattern Recognition',
      description: 'Identify winning patterns in your trading strategy'
    },
    {
      icon: Shield,
      title: 'Risk Management',
      description: 'Monitor and optimize your risk-reward ratios'
    },
    {
      icon: Clock,
      title: 'Trade Journal',
      description: 'Log and review your trades with detailed insights'
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Connect with fellow traders and share experiences'
    }
  ];

  return (
    <section className="bg-gray-900 pt-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">Why Choose Ufulu Tracker?</h2>
            <p className="text-gray-300 max-w-3xl mx-auto">
              At Ufulu Tracker, we believe that successful trading comes from disciplined 
              tracking, analysis, and continuous improvement. Our platform empowers traders 
              to make informed decisions based on their historical performance and helps 
              them develop winning strategies through data-driven insights.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 ">
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
