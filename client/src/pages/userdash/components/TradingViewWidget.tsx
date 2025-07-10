import { useEffect, useRef } from 'react';
import { useStrategyContext } from '../../../Context/StrategyContext';

// Declare the TradingView property on the window object
declare global {
  interface Window {
    TradingView: any;
  }
}

const TradingViewWidget = () => {
  const widgetRef = useRef<HTMLDivElement>(null);
  const { user } = useStrategyContext();
  const widgetInstanceRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    script.onload = () => {
      if (widgetRef.current) {
        console.log('🚀 TradingView script loaded');

        // Simple, reliable widget configuration focused on functionality
        const widget = new window.TradingView.widget({
          container_id: 'tradingview-widget',
          width: '100%',
          height: '100%',
          symbol: 'FX:USDCAD',
          interval: '15M',
          timezone: 'Etc/UTC',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#131722',
          enable_publishing: false,
          allow_symbol_change: true,
          details: true,
          hotlist: true,
          calendar: true,
          watchlist: ['FX:USDCAD', 'FX:EURUSD', 'FX:GBPUSD', 'FX:USDJPY', 'FX:AUDUSD'],
          withdateranges: true,
          hide_side_toolbar: false,
          save_image: true,
          
          // Let TradingView handle its own persistence
          client_id: user?.id || 'guest_user',
          user_id: user?.id || 'guest_user',
          
          // Auto-save with reasonable delay
          auto_save_delay: 2,
          
          // Minimal restrictions - let TradingView show all its features
          disabled_features: [
            'popup_hints' // Only disable popup hints
          ],
          
          enabled_features: [
            // Essential UI components
            'left_toolbar',
            'header_widget',
            'timeframes_toolbar', 
            'edit_buttons_in_legend',
            'context_menus',
            'control_bar',
            'border_around_the_chart',
            
            // Header controls
            'header_chart_type',
            'header_resolutions',
            'header_interval_dialog_button', 
            'show_interval_dialog_on_key_press',
            'header_symbol_search',
            'symbol_search_hot_key',
            'header_compare',
            'compare_symbol',
            'header_undo_redo',
            'header_fullscreen_button',
            'header_screenshot',
            
            // Drawing and studies
            'drawing_templates',
            'study_templates',
            'study_dialog_search_control',
            'modify_study_inputs',
            'study_buttons_in_legend',
            'show_hide_button_in_legend',
            
            // Chart properties
            'chart_property_page_style',
            'show_chart_property_page',
            'save_chart_properties_to_local_storage',
            
            // Other useful features
            'create_volume_indicator_by_default',
            'show_logo_on_all_charts',
            'side_toolbar_in_fullscreen_mode'
          ],
          
          // Clean styling
          loading_screen: { backgroundColor: '#131722' },
          studies_overrides: {
            "volume.volume.color.0": "#ef5350",
            "volume.volume.color.1": "#26a69a",
            "volume.volume.transparency": 80,
          },
          overrides: {
            // Dark theme colors
            "paneProperties.background": "#131722",
            "paneProperties.backgroundType": "solid",
            "paneProperties.vertGridProperties.color": "#363c4e",
            "paneProperties.horzGridProperties.color": "#363c4e",
            "paneProperties.crossHairProperties.color": "#9598A1",
            "scalesProperties.backgroundColor": "#131722",
            "scalesProperties.textColor": "#d1d4dc",
            "scalesProperties.lineColor": "#363c4e",
            "symbolWatermarkProperties.transparency": 90,
            
            // Candlestick colors
            "mainSeriesProperties.candleStyle.upColor": "#26a69a",
            "mainSeriesProperties.candleStyle.downColor": "#ef5350",
            "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a", 
            "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
            "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
          }
        });

        widgetInstanceRef.current = widget;

        // Simple, non-interfering persistence
        widget.onChartReady(() => {
          console.log('📈 Chart ready! Toolbar should be visible now.');
          
          // Simple localStorage backup system
          const storageKey = `chart_backup_${user?.id || 'guest'}`;
          
          const saveChartBackup = () => {
            try {
              const state = widget.save();
              localStorage.setItem(storageKey, JSON.stringify({
                state,
                timestamp: Date.now(),
                version: '1.0'
              }));
              console.log('💾 Chart backup saved to localStorage');
            } catch (error) {
              console.log('⚠️ Backup save failed:', error);
            }
          };
          
          const loadChartBackup = () => {
            try {
              const backup = localStorage.getItem(storageKey);
              if (backup) {
                const { state, timestamp } = JSON.parse(backup);
                console.log(`📥 Loading chart backup from ${new Date(timestamp)}`);
                
                // Load with a small delay to ensure chart is ready
                setTimeout(() => {
                  widget.load(state);
                  console.log('✅ Chart backup loaded successfully');
                }, 1000);
                return true;
              }
            } catch (error) {
              console.log('⚠️ Backup load failed:', error);
            }
            return false;
          };
          
          // Load backup on startup
          if (!loadChartBackup()) {
            console.log('ℹ️ No backup found - starting with fresh chart');
          }
          
          // Save backup every minute (simple and reliable)
          const backupInterval = setInterval(saveChartBackup, 60000);
          
          // Save on page unload
          const handleBeforeUnload = () => {
            saveChartBackup();
            console.log('🔄 Final backup saved on page unload');
          };
          
          window.addEventListener('beforeunload', handleBeforeUnload);
          
          // Cleanup function
          return () => {
            clearInterval(backupInterval);
            window.removeEventListener('beforeunload', handleBeforeUnload);
          };
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      // Final cleanup save
      if (widgetInstanceRef.current) {
        try {
          const state = widgetInstanceRef.current.save();
          const storageKey = `chart_backup_${user?.id || 'guest'}`;
          localStorage.setItem(storageKey, JSON.stringify({
            state,
            timestamp: Date.now(),
            version: '1.0'
          }));
          console.log('🧹 Component cleanup - final backup saved');
        } catch (error) {
          console.log('⚠️ Cleanup save failed:', error);
        }
      }
    };
  }, [user]);

  return <div id="tradingview-widget" ref={widgetRef} className="w-full h-full min-h-[400px]" />;
};

export default TradingViewWidget;
