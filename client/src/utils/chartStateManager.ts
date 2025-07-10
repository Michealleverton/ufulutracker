// import { supabase } from '../lib/supabase';

export interface ChartLayout {
  id?: string;
  user_id: string;
  layout_name: string;
  chart_data: any;
  created_at?: string;
  updated_at?: string;
}

export class ChartStateManager {
  private userId: string;
  private layoutName: string;
  private localStorageKey: string;

  constructor(userId: string, layoutName: string = 'default') {
    this.userId = userId;
    this.layoutName = layoutName;
    this.localStorageKey = `tv_chart_${userId}_${layoutName}`;
  }

  // Save to localStorage (immediate)
  saveToLocalStorage(chartState: any): boolean {
    try {
      const stateData = {
        chartState,
        timestamp: Date.now(),
        version: '2.1',
        userId: this.userId,
        layoutName: this.layoutName
      };
      localStorage.setItem(this.localStorageKey, JSON.stringify(stateData));
      console.log('✅ Chart state saved to localStorage');
      return true;
    } catch (error) {
      console.error('❌ Error saving chart state to localStorage:', error);
      return false;
    }
  }

  // Load from localStorage
  loadFromLocalStorage(): any | null {
    try {
      const savedState = localStorage.getItem(this.localStorageKey);
      if (savedState) {
        const stateData = JSON.parse(savedState);
        console.log('📥 Chart state loaded from localStorage');
        return stateData.chartState;
      }
    } catch (error) {
      console.error('❌ Error loading chart state from localStorage:', error);
    }
    return null;
  }

  // Save to Supabase (cloud backup) - TODO: Implement when Supabase is ready
  async saveToSupabase(_chartState: any): Promise<boolean> {
    try {
      // TODO: Uncomment when Supabase is properly configured
      /*
      const { error } = await supabase
        .from('chart_layouts')
        .upsert({
          user_id: this.userId,
          layout_name: this.layoutName,
          chart_data: chartState
        }, {
          onConflict: 'user_id,layout_name'
        });

      if (error) {
        console.error('❌ Error saving chart layout to Supabase:', error);
        return false;
      }

      console.log('☁️ Chart state backed up to Supabase');
      */
      console.log('ℹ️ Supabase backup not yet configured');
      return true;
    } catch (error) {
      console.error('❌ Error saving chart layout to Supabase:', error);
      return false;
    }
  }

  // Load from Supabase - TODO: Implement when Supabase is ready
  async loadFromSupabase(): Promise<any | null> {
    try {
      // TODO: Uncomment when Supabase is properly configured
      /*
      const { data, error } = await supabase
        .from('chart_layouts')
        .select('chart_data')
        .eq('user_id', this.userId)
        .eq('layout_name', this.layoutName)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') { // Not found error
          console.error('❌ Error loading chart layout from Supabase:', error);
        }
        return null;
      }

      if (data?.chart_data) {
        console.log('☁️ Chart state loaded from Supabase');
        return data.chart_data;
      }
      */
      console.log('ℹ️ Supabase loading not yet configured');
    } catch (error) {
      console.error('❌ Error loading chart layout from Supabase:', error);
    }
    return null;
  }

  // Hybrid save: localStorage immediately, Supabase as backup
  async save(chartState: any): Promise<void> {
    // Save to localStorage immediately
    this.saveToLocalStorage(chartState);
    
    // Save to Supabase in background (don't await) - disabled for now
    // this.saveToSupabase(chartState).catch(error => {
    //   console.warn('⚠️ Background Supabase save failed:', error);
    // });
  }

  // Hybrid load: Try localStorage first, fallback to Supabase
  async load(): Promise<any | null> {
    // Try localStorage first (faster)
    let chartState = this.loadFromLocalStorage();
    
    if (chartState) {
      return chartState;
    }

    // Fallback to Supabase - disabled for now
    // console.log('📥 No localStorage data found, trying Supabase...');
    // chartState = await this.loadFromSupabase();
    
    // if (chartState) {
    //   // Save to localStorage for faster future access
    //   this.saveToLocalStorage(chartState);
    // }

    return chartState;
  }

  // Get all layouts for current user - TODO: Implement when Supabase is ready
  async getAllLayouts(): Promise<ChartLayout[]> {
    try {
      // TODO: Implement with Supabase
      console.log('ℹ️ getAllLayouts not yet implemented');
      return [];
    } catch (error) {
      console.error('❌ Error fetching chart layouts:', error);
      return [];
    }
  }

  // Delete a layout
  async deleteLayout(layoutName: string): Promise<boolean> {
    try {
      // Remove from localStorage
      const localKey = `tv_chart_${this.userId}_${layoutName}`;
      localStorage.removeItem(localKey);

      // TODO: Remove from Supabase when configured
      /*
      const { error } = await supabase
        .from('chart_layouts')
        .delete()
        .eq('user_id', this.userId)
        .eq('layout_name', layoutName);

      if (error) {
        console.error('❌ Error deleting chart layout:', error);
        return false;
      }
      */

      console.log('🗑️ Chart layout deleted');
      return true;
    } catch (error) {
      console.error('❌ Error deleting chart layout:', error);
      return false;
    }
  }
}

export default ChartStateManager;
