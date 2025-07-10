import React from "react";
import { Check, Star } from "lucide-react";

interface PricingCardProps {
  plan: {
    name: string;
    price: number;
    priceId: string;
    yearlyPriceId: string;
    features: string[];
    buttonText: string;
    recommended?: boolean;
    popular?: boolean;
  };
  isYearly: boolean;
  onHover: () => void;
  onLeave: () => void;
  hoveredPlan: string | null;
  isHovered: boolean;
  onSubscribe?: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({ plan, isYearly, onSubscribe }) => {
  const price = isYearly ? plan.price * 12 * 0.8 : plan.price;
  const currentPriceId = isYearly ? plan.yearlyPriceId : plan.priceId;

  // interface SubscribeResponse {
  //   url: string;
  // }

  const handleSubscribe = async (priceId: string): Promise<void> => {
    console.log(priceId);

    try {
      const response = await fetch(
        `http://localhost:3000/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ priceId }),

        }
      );
      
      const session = await response.json();
      window.location.href = session.url;
    } 
    catch (error) {
      console.log("Error:", error);
    }
  };

  const defaultHandler = () => handleSubscribe(currentPriceId);

  return (
    <div
      className={`relative rounded-lg shadow-lg p-6 bg-gray-800 flex flex-col h-full transform hover:scale-105 transition-transform duration-200 ${
        plan.recommended ? "border-2 border-indigo-400" : ""
      }`}
    >
      {plan.popular && (
        <div className="absolute top-0 inset-x-0">
          <div className="flex items-center justify-center transform -translate-y-1/2 bg-indigo-500 text-white py-1 text-sm font-medium rounded-full max-w-[200px] mx-auto">
            <Star className="h-3 w-3 mr-1" />
            Most Popular
          </div>
        </div>
      )}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
        <div className="mt-4">
          <span className="text-4xl font-bold text-white">
            ${price.toFixed(2)}
          </span>
          {price > 0 && (
            <span className="text-gray-400">
              /{isYearly ? "year" : "month"}
            </span>
          )}
        </div>
      </div>
      <ul className="mt-6 space-y-4 flex-grow">
        {plan.features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <Check className="h-5 w-5 text-indigo-400 mr-2" />
            <span className="text-gray-300">{feature}</span>
          </li>
        ))}
      </ul>
      <button
        onClick={onSubscribe ? onSubscribe : defaultHandler}
        className={`mt-8 w-full py-2 px-4 rounded-md ${
          plan.recommended
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : "bg-gray-700 hover:bg-gray-600 text-white border border-indigo-400"
        }`}
      >
        {plan.buttonText}
      </button>
    </div>
  );
};
