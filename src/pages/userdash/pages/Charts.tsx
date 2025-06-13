import { useState } from "react";
import TradingViewWidget from "../components/TradingViewWidget";
import { Collapse } from "react-collapse";
import { Edit, Trash, Eye } from "lucide-react";

const Charts = () => {
  const [isTradeBookOpen, setIsTradeBookOpen] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleTradeBook = () => {
    setIsTradeBookOpen(!isTradeBookOpen);
  };

  const toggleAccordion = (accordion: string): void => {
    setOpenAccordion(openAccordion === accordion ? null : accordion);
  };

  const strategies = [
    {
      id: "A+",
      title: "A+ Setup",
      description: "High probability setup with strong confluence factors.",
      steps: [
        "Identify key support and resistance levels.",
        "Wait for a breakout or rejection at key levels.",
        "Confirm with volume and candlestick patterns.",
        "Place trade with proper risk management.",
      ],
    },
    {
      id: "B+",
      title: "B+ Setup",
      description: "Moderate probability setup with fewer confluence factors.",
      steps: [
        "Identify trend direction using moving averages.",
        "Look for pullbacks to key levels.",
        "Confirm with RSI or MACD divergence.",
        "Place trade with reduced position size.",
      ],
    },
    {
      id: "C+",
      title: "C+ Setup",
      description: "Low probability setup with minimal confluence factors.",
      steps: [
        "Identify range-bound market conditions.",
        "Look for overbought/oversold levels on oscillators.",
        "Place trade with tight stop-loss.",
      ],
    },
    {
      id: "D+",
      title: "D+ Setup",
      description: "Experimental setup for testing new strategies.",
      steps: [
        "Define hypothesis for the trade setup.",
        "Backtest the hypothesis on historical data.",
        "Place trade with minimal risk.",
        "Record results for analysis.",
      ],
    },
  ];

  return (
    <div className="flex relative h-screen">
      <div className="flex w-full h-full">
        <TradingViewWidget />
      </div>
      <div
        className={`fixed right-0 top-0 w-96 h-full bg-gradient-to-t from-gray-800 to-gray-900 border-l border-gray-700 transition-transform transform ${
          isTradeBookOpen ? "translate-x-0" : "translate-x-full"
        } z-20`}
      >
        <button
          onClick={toggleTradeBook}
          className={`absolute left-[3.75rem] top-40 transform -translate-x-full ${
            isTradeBookOpen ? "bg-gray-800" : "bg-blue-500"
          } text-white px-4 py-2 rounded-b-md rotate-90`}
        >
          {isTradeBookOpen ? "Close" : "Open"} Trade Book
        </button>
        <div className="p-4">
          <h2 className="text-xl font-bold text-white mb-4">Trade Book</h2>
          {strategies.map((strategy) => (
            <div key={strategy.id} className="mb-4">
              <button
                onClick={() => toggleAccordion(strategy.id)}
                className="w-full text-left bg-blue-500 text-white px-4 py-2 rounded-md flex justify-between items-center"
              >
                <span>{strategy.title}</span>
                <div className="flex gap-2">
                  <a href="#" className="text-blue-300 hover:text-white">
                    <Edit size={16} />
                  </a>
                  <a href="#" className="text-blue-300 hover:text-white">
                    <Eye size={16} />
                  </a>
                  <a href="#" className="text-blue-300 hover:text-white">
                    <Trash size={16} />
                  </a>
                </div>
              </button>
              <Collapse isOpened={openAccordion === strategy.id}>
                <div className="bg-gray-700 text-white p-4 rounded-md mt-2">
                  <p className="mb-4">{strategy.description}</p>
                  <h3 className="text-lg font-semibold mb-2">Steps:</h3>
                  <ol className="list-decimal list-inside space-y-2">
                    {strategy.steps.map((step, index) => (
                      <li key={index} className="text-sm">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </Collapse>
            </div>
          ))}
          <button className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md mt-4">
            Add New Strategy
          </button>
        </div>
      </div>
    </div>
  );
};

export default Charts;