// Clear any existing TradingView localStorage data for a fresh start
console.log('🧹 Clearing TradingView localStorage for fresh start...');

// Clear any existing chart data
const keysToRemove = [];
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  if (key && (key.includes('tv_chart') || key.includes('chart_backup') || key.includes('tradingview'))) {
    keysToRemove.push(key);
  }
}

keysToRemove.forEach(key => {
  localStorage.removeItem(key);
  console.log(`Removed: ${key}`);
});

console.log(`✅ Cleared ${keysToRemove.length} TradingView localStorage entries`);
console.log('🔄 Please refresh the Charts page to see the new simplified widget');
