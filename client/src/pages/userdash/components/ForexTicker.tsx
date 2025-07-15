import { useEffect, useRef, useState } from "react";

const pairs = [
  { from: "USD", to: "CAD" },
  { from: "EUR", to: "USD" },
  { from: "GBP", to: "USD" },
  { from: "USD", to: "JPY" },
  { from: "AUD", to: "USD" },
  { from: "USD", to: "CHF" },
  { from: "GBP", to: "CAD" },
];

type Rate = { pair: string; rate: number | null; prevRate: number | null };

const getPreviousBusinessDay = (date: Date) => {
  const prev = new Date(date);
  do {
    prev.setDate(prev.getDate() - 1);
  } while ([0, 6].includes(prev.getDay())); // 0 = Sunday, 6 = Saturday
  return prev;
};

export const ForexTicker = () => {
  const [rates, setRates] = useState<Rate[]>([]);
  const [contentWidth, setContentWidth] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchRates = async () => {
      const today = new Date();
      const prevBusinessDay = getPreviousBusinessDay(today);
      const ymd = (d: Date) => d.toISOString().split("T")[0];

      const results = await Promise.all(
        pairs.map(async ({ from, to }) => {
          try {
            // Fetch today's rate
            const resToday = await fetch(
              `https://api.frankfurter.app/latest?from=${from}&to=${to}`
            );
            const dataToday = await resToday.json();
            const rate = dataToday.rates[to] ?? null;

            // Fetch previous business day's rate
            const resPrev = await fetch(
              `https://api.frankfurter.app/${ymd(
                prevBusinessDay
              )}?from=${from}&to=${to}`
            );
            const dataPrev = await resPrev.json();
            const prevRate = dataPrev.rates[to] ?? null;

            return {
              pair: `${from}/${to}`,
              rate,
              prevRate,
            };
          } catch {
            return { pair: `${from}/${to}`, rate: null, prevRate: null };
          }
        })
      );
      setRates(results);
    };

    fetchRates();
    const interval = setInterval(fetchRates, 10000); // update every 10s
    return () => clearInterval(interval);
  }, []);

  // Measure content width after rates update
  useEffect(() => {
    if (contentRef.current) {
      setContentWidth(contentRef.current.scrollWidth / 2); // since we concat twice
    }
  }, [rates]);

  // Animation duration based on content width (adjust 100 for speed)
  const duration = contentWidth ? `${contentWidth / 50}s` : "26s";

  const getPercentChange = (rate: number | null, prevRate: number | null) => {
    if (!rate || !prevRate) return "N/A";
    const change = ((rate - prevRate) / prevRate) * 100;
    return `${change > 0 ? "+" : ""}${change.toFixed(2)}%`;
  };

  return (
    <div
      className="w-full bg-gray-800 text-base text-white py-2 px-4 overflow-hidden mb-4 relative"
      style={{
        boxShadow:
          "inset 20px 0 20px -20px rgba(0,0,0,0.5), inset -20px 0 20px -20px rgba(0,0,0,0.5)",
      }}
    >
      <div className="absolute left-4 top-2 text-xs text-gray-400">
        Forex: 🟢 24/5 OPEN
      </div>
      <div
        ref={contentRef}
        className="flex whitespace-nowrap"
        style={{
          animation: `ticker-ltr ${duration} linear infinite`,
          willChange: "transform",
        }}
      >
        {rates.concat(rates).map((r, idx) => (
          <span key={r.pair + idx} className="mx-8 font-mono">
            {r.pair}: {r.rate ? r.rate : "N/A"}{" "}
            <span
              className={
                r.prevRate && r.rate && r.rate - r.prevRate > 0
                  ? "text-green-400"
                  : "text-red-400"
              }
            >
              ({getPercentChange(r.rate, r.prevRate)})
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
