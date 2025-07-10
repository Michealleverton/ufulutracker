const MockTrades = [
    { id: "1", date: "2024-01-01", symbol: "EUR/USD", type: "buy", price: 1.1054, quantity: 1500, profits: 2400, notes: "Bought Forex" },
    { id: "2", date: "2024-01-02", symbol: "GBP/USD", type: "sell", price: 1.2765, quantity: 2000, profits: -1200, notes: "Bought Forex" },
    { id: "3", date: "2024-01-03", symbol: "USD/JPY", type: "buy", price: 149.45, quantity: 3000, profits: 5000, notes: "Bought Forex" },
    { id: "4", date: "2024-01-04", symbol: "AUD/USD", type: "sell", price: 0.6854, quantity: 1000, profits: -600, notes: "Bought Forex" },
    { id: "5", date: "2024-01-05", symbol: "USD/CAD", type: "buy", price: 1.3456, quantity: 2500, profits: 3500, notes: "Bought Forex" },
    { id: "6", date: "2024-01-06", symbol: "NZD/USD", type: "sell", price: 0.6154, quantity: 1200, profits: -800, notes: "Bought Forex" },
    { id: "7", date: "2024-01-07", symbol: "EUR/GBP", type: "buy", price: 0.8556, quantity: 2200, profits: 1600, notes: "Bought Forex" },
    { id: "8", date: "2024-01-08", symbol: "USD/CHF", type: "sell", price: 0.9045, quantity: 1800, profits: -1000, notes: "Bought Forex" },
    { id: "9", date: "2024-01-09", symbol: "EUR/JPY", type: "buy", price: 161.34, quantity: 2800, profits: 4200, notes: "Bought Forex" },
    { id: "10", date: "2024-01-10", symbol: "GBP/JPY", type: "sell", price: 187.12, quantity: 3100, profits: -2000, notes: "Bought Forex" },
    { id: "11", date: "2024-01-11", symbol: "USD/MXN", type: "buy", price: 18.45, quantity: 1700, profits: 2100, notes: "Bought Forex" },
    { id: "12", date: "2024-01-12", symbol: "AUD/JPY", type: "sell", price: 92.56, quantity: 1400, profits: -900, notes: "Bought Forex" },
    { id: "13", date: "2024-01-13", symbol: "NZD/JPY", type: "buy", price: 88.34, quantity: 2600, profits: 3100, notes: "Bought Forex" },
    { id: "14", date: "2024-01-14", symbol: "CAD/JPY", type: "sell", price: 109.87, quantity: 1900, profits: -1500, notes: "Bought Forex" },
    { id: "15", date: "2024-01-15", symbol: "USD/ZAR", type: "buy", price: 19.23, quantity: 3500, profits: 4800, notes: "Bought Forex" },
    // Additional 85 random trades
    ...Array.from({ length: 85 }, (_, i) => {
      const id = (i + 16).toString();
      const date = `2024-01-${(i + 16).toString().padStart(2, '0')}`;
      const symbols = ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD", "NZD/USD", "EUR/GBP", "USD/CHF", "EUR/JPY", "GBP/JPY", "USD/MXN", "AUD/JPY", "NZD/JPY", "CAD/JPY", "USD/ZAR"];
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      const type = Math.random() > 0.5 ? "buy" : "sell";
      const price = (Math.random() * (1.5 - 0.5) + 0.5).toFixed(4);
      const quantity = Math.floor(Math.random() * (3500 - 1000) + 1000);
      const isWin = Math.random() < 0.67;
      const profits = isWin ? Math.floor(Math.random() * 5000) + 1000 : -Math.floor(Math.random() * 2000) - 500;
      const notes = "Bought Forex";
      return { id, date, symbol, type, price, quantity, profits, notes };
    })
  ];
  
  export default MockTrades;
