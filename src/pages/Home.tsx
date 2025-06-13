import { useState } from 'react';
import { PricingCard } from '../components/PricingCard';
import { PricingToggle } from '../components/PricingToggle';
import { AboutSection } from './AboutSection';
import { AIFeatures } from './AIFeatures';
import { BarChart2 } from 'lucide-react';
import { Parallax } from 'react-parallax';
import Heroimg from '../assets/heroimage.gif';
import useScrollToTop from './hooks/useScrollToTop';

const pricingPlans = [
  {
    name: 'Basic',
    price: 0,
    features: [
      'Basic trade tracking',
      'Simple analytics',
      'CSV import/export',
      'Trade journal',
      'Basic AI insights'
    ],
    buttonText: 'Get Started Free'
  },
  {
    name: 'Pro',
    price: 9.99,
    features: [
      'Advanced analytics',
      'Performance metrics',
      'Priority support',
      'Trade strategies',
      'Multiple portfolios',
      'Advanced AI patterns'
    ],
    buttonText: 'Get Pro',
    recommended: true,
    popular: true
  },
  {
    name: 'Premium',
    price: 14.99,
    features: [
      'Real-time market data',
      'AI trade insights',
      'Risk analysis',
      'API access',
      'Custom reports',
      'Team collaboration',
      'Custom AI training'
    ],
    buttonText: 'Get Premium'
  }
];

export const Home = () => {

  useScrollToTop();

  const [isYearly, setIsYearly] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <Parallax
        bgImage={Heroimg}
        strength={100}
      >
        <div style={{ height: '500px' }}>
          <div className="bg-gray-800 bg-opacity-50 h-full flex flex-col justify-center">
            <div className="max-w-7xl mx-auto px-4 pt-16 pb-24 sm:px-6 lg:px-8">
              <div className="text-center">
                <div className="flex justify-center">
                  <BarChart2 className="h-12 w-12 text-indigo-400" />
                </div>
                <h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                  Master Your Trading Journey
                </h1>
                <p className="max-w-xl mt-5 mx-auto text-xl text-gray-300">
                  Let our AI-powered platform help you identify patterns, optimize your risk/reward ratio, and improve your trading performance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Parallax>

      {/* About Section */}
      <div id="about">
        <AboutSection />
      </div>

      {/* AI Features Section */}
      <div id="aifeature">
        <AIFeatures />
      </div>
      {/* Pricing Section */}
      <div id="pricing" className="max-w-7xl mx-auto px-4 mb-20 pt-24 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            Choose the plan that best fits your trading needs
          </p>
          <PricingToggle isYearly={isYearly} onToggle={() => setIsYearly(!isYearly)} />
        </div>
        <div className="mt-8 grid md:grid-cols-3 gap-8">
          {pricingPlans.map((plan) => (
            <PricingCard
              key={plan.name}
              plan={plan}
              isYearly={isYearly}
              isHovered={hoveredPlan === plan.name}
              onHover={() => setHoveredPlan(plan.name)}
              onLeave={() => setHoveredPlan(null)}
              hoveredPlan={hoveredPlan}
            />
          ))}
        </div>
      </div>
    </div>
  );
};