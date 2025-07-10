import { useEffect, useRef } from 'react';
import { useStrategyContext } from '../../../Context/StrategyContext';
import ChartStateManager from '../../../utils/chartStateManager';

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
        console.log('TradingView script loaded');

        // Create unique storage key based on user
        const storageKey = user ? `tv_chart_${user.id}` : 'tv_chart_guest';
        
        // Initialize the TradingView widget with full functionality
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
          // Use a unique storage key for this user
          client_id: storageKey,
          user_id: user?.id || 'guest',
          // Enable localStorage features and auto-save
          auto_save_delay: 10, // Auto-save every 10 seconds
          // Make sure all essential features are enabled
          disabled_features: [
            // Only disable features we don't want
            'use_localstorage_for_settings' // We'll handle this manually
          ],
          enabled_features: [
            // Core functionality
            'study_templates',
            'left_toolbar',
            'header_toolbar',
            'timeframes_toolbar',
            'edit_buttons_in_legend',
            'context_menus',
            'control_bar',
            'border_around_the_chart',
            
            // Drawing tools
            'drawing_templates',
            'shape_templates',
            'show_chart_property_page',
            'chart_property_page_style',
            
            // Header features
            'header_chart_type',
            'header_resolutions', 
            'header_interval_dialog_button',
            'show_interval_dialog_on_key_press',
            'header_symbol_search',
            'symbol_search_hot_key',
            'header_compare',
            'compare_symbol',
            'header_undo_redo',
            'header_screenshot',
            'header_fullscreen_button',
            
            // Studies/Indicators
            'study_dialog_search_control',
            'study_market_minimized',
            'show_hide_button_in_legend',
            'modify_study_inputs',
            'study_buttons_in_legend',
            
            // Other useful features
            'show_logo_on_all_charts',
            'side_toolbar_in_fullscreen_mode',
            'header_saveload',
            'create_volume_indicator_by_default'
          ],
          // Chart styling
          loading_screen: { backgroundColor: '#131722' },
          studies_overrides: {
            "volume.volume.color.0": "#ef5350",
            "volume.volume.color.1": "#26a69a",
            "volume.volume.transparency": 80,
          },
          overrides: {
            // Candlestick styling
            "mainSeriesProperties.candleStyle.upColor": "#26a69a",
            "mainSeriesProperties.candleStyle.downColor": "#ef5350",
            "mainSeriesProperties.candleStyle.drawWick": true,
            "mainSeriesProperties.candleStyle.drawBorder": true,
            "mainSeriesProperties.candleStyle.borderColor": "#378658",
            "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
            "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
            
            // Chart background and grid
            "paneProperties.background": "#131722",
            "paneProperties.backgroundType": "solid",
            "paneProperties.vertGridProperties.color": "#363c4e",
            "paneProperties.vertGridProperties.style": 0,
            "paneProperties.horzGridProperties.color": "#363c4e", 
            "paneProperties.horzGridProperties.style": 0,
            "paneProperties.crossHairProperties.color": "#9598A1",
            "paneProperties.crossHairProperties.width": 1,
            "paneProperties.crossHairProperties.style": 2,
            
            // Scale properties
            "scalesProperties.backgroundColor": "#131722",
            "scalesProperties.textColor": "#d1d4dc",
            "scalesProperties.fontSize": 12,
            "scalesProperties.lineColor": "#363c4e",
            
            // Symbol watermark
            "symbolWatermarkProperties.transparency": 90,
            "symbolWatermarkProperties.color": "#434651",
            
            // Volume
            "volumePaneSize": "medium"
          }
        });

        widgetInstanceRef.current = widget;

        // Enhanced chart state persistence
        widget.onChartReady(() => {
          console.log('📈 TradingView chart ready - setting up enhanced persistence');
          
          try {
            const activeChart = widget.activeChart();
            let isLoading = false;
            
            // Initialize the chart state manager
            const chartStateManager = new ChartStateManager(
              user?.id || 'guest',
              'default'
            );
            
            // Enhanced state management
            const ChartController = {
              saveState: async () => {
                if (isLoading) return;
                
                try {
                  console.log('💾 Saving chart state...');
                  const chartState = widget.save();
                  await chartStateManager.save(chartState);
                  console.log('✅ Chart state saved successfully');
                } catch (error) {
                  console.error('❌ Error saving chart state:', error);
                }
              },
              
              loadState: async () => {
                try {
                  isLoading = true;
                  console.log('📥 Loading chart state...');
                  const chartState = await chartStateManager.load();
                  
                  if (chartState) {
                    console.log('� Applying saved chart state...');
                    widget.load(chartState);
                    console.log('✅ Chart state loaded successfully');
                    return true;
                  } else {
                    console.log('ℹ️ No saved chart state found');
                  }
                } catch (error) {
                  console.error('❌ Error loading chart state:', error);
                } finally {
                  setTimeout(() => { isLoading = false; }, 3000);
                }
                return false;
              }
            };

            // Load saved state after chart initialization
            setTimeout(() => {
              ChartController.loadState();
            }, 1500);

            // Set up save triggers with debouncing
            let saveTimeout: NodeJS.Timeout | null = null;
            const debouncedSave = (reason: string) => {
              if (saveTimeout) clearTimeout(saveTimeout);
              saveTimeout = setTimeout(() => {
                console.log(`💾 Auto-save triggered by: ${reason}`);
                ChartController.saveState();
              }, 3000); // 3 second debounce
            };

            // Event listeners for various chart changes
            activeChart.onSymbolChanged().subscribe(null, () => {
              debouncedSave('symbol change');
            });

            activeChart.onIntervalChanged().subscribe(null, () => {
              debouncedSave('interval change');
            });

            // Periodic auto-save (every 2 minutes)
            const autoSaveInterval = setInterval(() => {
              ChartController.saveState();
            }, 120000);

            // Save on page events
            const handleBeforeUnload = () => {
              console.log('🔄 Page unloading - saving chart state...');
              ChartController.saveState();
            };

            const handleVisibilityChange = () => {
              if (document.hidden) {
                console.log('👁️ Tab hidden - saving chart state...');
                ChartController.saveState();
              }
            };

            // Set up event listeners
            window.addEventListener('beforeunload', handleBeforeUnload);
            document.addEventListener('visibilitychange', handleVisibilityChange);

            // Mouse/touch event listeners for drawings
            const chartContainer = document.getElementById('tradingview-widget');
            if (chartContainer) {
              const handleUserInteraction = () => debouncedSave('user interaction');
              chartContainer.addEventListener('mouseup', handleUserInteraction);
              chartContainer.addEventListener('touchend', handleUserInteraction);
            }

            // Cleanup function
            return () => {
              if (saveTimeout) clearTimeout(saveTimeout);
              clearInterval(autoSaveInterval);
              window.removeEventListener('beforeunload', handleBeforeUnload);
              document.removeEventListener('visibilitychange', handleVisibilityChange);
              if (chartContainer) {
                chartContainer.removeEventListener('mouseup', () => debouncedSave('user interaction'));
                chartContainer.removeEventListener('touchend', () => debouncedSave('user interaction'));
              }
            };
            
          } catch (error) {
            console.error('❌ Error setting up chart persistence:', error);
          }
        });
      }
    };

    document.body.appendChild(script);

    // Cleanup on component unmount
    return () => {
      if (widgetInstanceRef.current) {
        try {
          // Final save before unmounting using the chart state manager
          const chartState = widgetInstanceRef.current.save();
          const chartStateManager = new ChartStateManager(
            user?.id || 'guest',
            'default'
          );
          chartStateManager.save(chartState);
          console.log('🔄 Component unmount - chart state saved');
        } catch (error) {
          console.warn('⚠️ Save on unmount failed:', error);
        }
      }
    };
  }, [user]);

  return <div id="tradingview-widget" ref={widgetRef} className="w-full h-full min-h-[400px]" />;
};

export default TradingViewWidget;