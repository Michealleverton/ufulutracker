import { useEffect, useState, useRef } from "react";

const FINNHUB_API_KEY = "d1haia1r01qsvr28vb2gd1haia1r01qsvr28vb30"; // Replace with your key

const symbols = ["AAPL", "GOOGL", "MSFT", "AMZN", "TSLA", "META", "NVDA"];

type Quote = { symbol: string; price: number | null; prevClose: number | null };

export const Ticker = () => {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [contentWidth, setContentWidth] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchQuotes = async () => {
      const results = await Promise.all(
        symbols.map(async (symbol) => {
          try {
            const res = await fetch(
              `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${FINNHUB_API_KEY}`
            );
            const data = await res.json();
            return {
              symbol,
              price: data.c ?? null,
              prevClose: data.pc ?? null,
            };
          } catch {
            return { symbol, price: null, prevClose: null };
          }
        })
      );
      setQuotes(results);
    };

    fetchQuotes();
    const interval = setInterval(fetchQuotes, 10000); // update every 10s
    return () => clearInterval(interval);
  }, []);

  // Measure content width after quotes update
  useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth / 2); // since we concat twice
    }
  }, [quotes]);

  // Animation duration based on content width (adjust 100 for speed)
  const duration = contentWidth ? `${contentWidth / 50}s` : "20s";

  const getPercentChange = (price: number | null, prevClose: number | null) => {
    if (!price || !prevClose) return "Closed";
    const change = ((price - prevClose) / prevClose) * 100;
    if (change === 0) return "Closed";
    return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  return (
    <div
      className="w-full bg-gray-800 text-base text-white py-2 overflow-hidden mb-10 relative"
      style={{
        boxShadow:
          "inset 20px 0 20px -20px rgba(0,0,0,0.5), inset -20px 0 20px -20px rgba(0,0,0,0.5)",
      }}
    >
      <div
        ref={contentRef}
        className="flex whitespace-nowrap"
        style={{
          animation: `ticker-ltr ${duration} linear infinite`,
          willChange: "transform",
        }}
      >
        {quotes.concat(quotes).map((q, idx) => (
          <span key={q.symbol + idx} className="mx-8 font-mono">
            {q.symbol}: {q.price ? `$${q.price}` : "N/A"}{" "}
            <span
              className={
                q.prevClose && q.price && q.price - q.prevClose > 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              {q.prevClose && q.price
                ? q.price - q.prevClose > 0
                  ? "▲"
                  : q.price - q.prevClose < 0
                  ? "▼"
                  : ""
                : ""}
              ({getPercentChange(q.price, q.prevClose)})
            </span>
          </span>
        ))}
      </div>
      <style>
        {`
          @keyframes ticker-ltr {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}
      </style>
    </div>
  );
};