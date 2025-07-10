import { useEffect, useRef } from 'react';

// Declare the TradingView property on the window object
declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewWidget = () => {
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (widgetRef.current) {
        console.log('TradingView script loaded');

        // Define the save/load adapter for templates
        interface SaveLoadAdapter {
          save: (chart: any) => void;
          load: () => any;
        }

        const saveLoadAdapter: SaveLoadAdapter = {
          save: (chart) => {
            const state = chart.save(); // Save the current chart state
            console.log('Saving template state:', state);
            localStorage.setItem('tradingview-template', JSON.stringify(state)); // Save to localStorage
          },
          load: () => {
            const state = localStorage.getItem('tradingview-template'); // Load from localStorage
            console.log('Loading template state:', state);
            return state ? JSON.parse(state) : null; // Return the parsed state or null if not found
          }
        };

        // Initialize the TradingView widget
        new window.TradingView.widget({
          container_id: 'tradingview-widget',
          width: '100%',
          height: '100%',
          symbol: 'FX:USDCAD', // Default symbol set to USD/CAD
          interval: '15M',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#f1f3f5',
          enable_publishing: true,
          allow_symbol_change: true,
          details: true,
          hotlist: true,
          calendar: true,
          watchlist: ['FX:USDCAD', 'FX:EURUSD', 'FX:GBPUSD'], // Add symbols to the watchlist
          withdateranges: true,
          hide_side_toolbar: false, // Hide the side toolbar
          save_image: true,
          studies_overrides: {},
          overrides: {},
          save_load_adapter: saveLoadAdapter, // Attach the save/load adapter
        });
      }
    };
    document.body.appendChild(script);
  }, []);

  return <div id="tradingview-widget" ref={widgetRef} className="w-full h-full min-h-[400px]" />;
};

export default TradingViewWidget;