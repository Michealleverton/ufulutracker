import { useState } from 'react';
import { PricingCard } from '../components/PricingCard';
import { PricingToggle } from '../components/PricingToggle';
import { AboutSection } from './AboutSection';
import { AIFeatures } from './AIFeatures';
import { BarChart2, Star, Quote } from 'lucide-react';
import { Parallax } from 'react-parallax';
import Heroimg from '../assets/tradingbg.jpg';
import useScrollToTop from './hooks/useScrollToTop';
import { useNavigate } from "react-router-dom";

const pricingPlans = [
	{
		name: 'Basic',
		price: 0,
		priceId: '',
		yearlyPriceId: '',
		features: [
			'Basic trade tracking',
			'Simple analytics',
			'CSV import/export',
			'Trade journal',
			'Basic AI insights',
		],
		buttonText: 'Get Started Free',
	},
	{
		name: 'Pro',
		price: 9.99,
		priceId: 'price_1OuKNjApncs80C2o3yA4dx5K',
		yearlyPriceId: 'price_1Rfw1LApncs80C2oiWyIGsD9', // Replace with your actual yearly Pro price ID
		features: [
			'Advanced analytics',
			'Performance metrics',
			'Priority support',
			'Trade strategies',
			'Multiple portfolios',
			'Advanced AI patterns',
		],
		buttonText: 'Get Pro',
		recommended: true,
		popular: true,
	},
	{
		name: 'Premium',
		price: 14.99,
		priceId: 'price_1OuKLwApncs80C2oPK9ZaJup',
		yearlyPriceId: 'price_1Rfw2jApncs80C2oWUBe16yM', // Replace with your actual yearly Premium price ID
		features: [
			'Real-time market data',
			'AI trade insights',
			'Risk analysis',
			'API access',
			'Custom reports',
			'Team collaboration',
			'Custom AI training',
		],
		buttonText: 'Get Premium',
	},
];

const testimonials = [
	{
		id: 1,
		name: "Sarah Chen",
		role: "Day Trader",
		avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
		content: "Ufulu Tracker completely transformed my trading approach. The AI insights helped me identify patterns I never noticed before, increasing my win rate by 40%.",
		rating: 5,
	},
	{
		id: 2,
		name: "Marcus Rodriguez",
		role: "Forex Trader",
		avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
		content: "The analytics and performance tracking are incredible. I can finally see exactly where my profits and losses come from. Best trading tool I've ever used.",
		rating: 5,
	},
	{
		id: 3,
		name: "Emily Johnson",
		role: "Swing Trader",
		avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
		content: "The risk management features saved me thousands. The platform's insights into my trading psychology have been game-changing for my consistency.",
		rating: 5,
	},
	{
		id: 4,
		name: "David Park",
		role: "Options Trader",
		avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
		content: "Clean interface, powerful analytics, and excellent support. Ufulu Tracker helped me turn my hobby into a profitable trading business.",
		rating: 5,
	},
	{
		id: 5,
		name: "Lisa Thompson",
		role: "Crypto Trader",
		avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
		content: "The AI pattern recognition is spot-on. I've improved my entry and exit timing significantly. Couldn't imagine trading without it now.",
		rating: 5,
	},
];

export const Home = () => {
	useScrollToTop();
	const navigate = useNavigate();

	const [isYearly, setIsYearly] = useState(false);
	const [hoveredPlan, setHoveredPlan] = useState<string | null>(null);

	// General handler for all plans
	const handleSubscribe = (planName: string) => {
		const isLoggedIn = localStorage.getItem("Loggedin") === "true";
		if (isLoggedIn) {
			navigate("/dashboard/settings");
		} else {
			// Map the display plan names to database plan values
			let databasePlanName;
			switch (planName.toLowerCase()) {
				case 'basic':
					databasePlanName = 'free';
					break;
				case 'pro':
					databasePlanName = 'pro';
					break;
				case 'premium':
					databasePlanName = 'premium';
					break;
				default:
					databasePlanName = 'free';
			}
			
			// Store the correct database plan name
			localStorage.setItem("selectedPlan", databasePlanName);
			// Store billing period for payment processing
			localStorage.setItem("selectedBillingPeriod", isYearly ? "yearly" : "monthly");
			navigate("/register");
		}
	};

	return (
		<div className="min-h-screen bg-gray-900 overflow-x-hidden">
			{/* Hero Section */}
			<Parallax bgImage={Heroimg} strength={100}>
				<div style={{ height: '500px', position: 'relative' }}>
					{/* Overlay with 60% opacity */}
					<div className="absolute inset-0 bg-black opacity-60 z-0" />
					<div className="bg-gray-800 bg-opacity-50 h-full flex flex-col justify-center relative z-10">
						<div className="max-w-7xl mx-auto px-4 pt-16 pb-24 sm:px-6 lg:px-8">
							<div className="text-center">
								<div className="flex justify-center">
									<BarChart2 className="h-12 w-12 text-indigo-400" />
								</div>
								<h1 className="mt-4 text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
									Master Your Trading Journey
								</h1>
								<p className="max-w-xl mt-5 mx-auto text-xl text-gray-300">
									Let our AI-powered platform help you identify patterns, optimize your
									risk/reward ratio, and improve your trading performance.
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

			{/* Testimonials Section */}
			<div className="bg-gray-800 py-24">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-extrabold text-white sm:text-4xl">
							Trusted by Traders Worldwide
						</h2>
						<p className="mt-4 text-lg text-gray-300">
							See what successful traders are saying about Ufulu Tracker
						</p>
						<div className="flex justify-center items-center mt-6">
							{[...Array(5)].map((_, i) => (
								<Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
							))}
							<span className="ml-3 text-white font-semibold">4.9/5 from 1,200+ traders</span>
						</div>
					</div>

					{/* Horizontal Auto-Scrolling Carousel */}
					<div className="relative overflow-visible">
						<div className="flex animate-scroll gap-8 w-max">
							{/* Duplicate testimonials for seamless loop */}
							{[...testimonials, ...testimonials].map((testimonial, index) => (
								<div
									key={`${testimonial.id}-${index}`}
									className="bg-gray-900 rounded-xl p-6 shadow-xl border border-gray-700 hover:border-indigo-500 transition-all duration-300 transform hover:scale-105 w-80 flex-shrink-0"
								>
									<div className="flex items-center mb-4">
										{[...Array(testimonial.rating)].map((_, i) => (
											<Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
										))}
									</div>
									<Quote className="h-8 w-8 text-indigo-400 mb-4" />
									<p className="text-gray-300 mb-6 italic">
										"{testimonial.content}"
									</p>
									<div className="flex items-center">
										<img
											src={testimonial.avatar}
											alt={testimonial.name}
											className="w-12 h-12 rounded-full border-2 border-indigo-400"
										/>
										<div className="ml-4">
											<h4 className="text-white font-semibold">{testimonial.name}</h4>
											<p className="text-gray-400 text-sm">{testimonial.role}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Overall stats */}
					<div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
						<div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
							<div className="text-3xl font-bold text-indigo-400 mb-2">98%</div>
							<div className="text-gray-300">Customer Satisfaction</div>
						</div>
						<div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
							<div className="text-3xl font-bold text-green-400 mb-2">$2.3M+</div>
							<div className="text-gray-300">Profits Tracked</div>
						</div>
						<div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
							<div className="text-3xl font-bold text-yellow-400 mb-2">1,200+</div>
							<div className="text-gray-300">Active Traders</div>
						</div>
					</div>
				</div>
			</div>

			{/* Pricing Section */}
			<div
				id="pricing"
				className="max-w-7xl mx-auto px-4 mb-20 pt-24 sm:px-6 lg:px-8"
			>
				<div className="text-center">
					<h2 className="text-3xl font-extrabold text-white sm:text-4xl">
						Simple, transparent pricing
					</h2>
					<p className="mt-4 text-lg text-gray-300">
						Choose the plan that best fits your trading needs
					</p>
					<PricingToggle
						isYearly={isYearly}
						onToggle={() => setIsYearly(!isYearly)}
					/>
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
							onSubscribe={() => handleSubscribe(plan.name)}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

// Add the CSS animation for auto-scrolling
const style = document.createElement('style');
style.textContent = `
	@keyframes scroll {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-50%);
		}
	}
	
	.animate-scroll {
		animation: scroll 30s linear infinite;
	}
	
	.animate-scroll:hover {
		animation-play-state: paused;
	}
`;
document.head.appendChild(style);