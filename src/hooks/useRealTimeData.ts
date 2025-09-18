import { useState, useEffect, useCallback } from 'react';
import { apiService } from '@/lib/api';
import type { BackendState, PredictionResponse } from '@/lib/api';

// Transform backend data to frontend format
export const transformBackendToFrontend = (backendState: BackendState) => {
  const trains = backendState.trains.map(train => ({
    id: train.id,
    name: `Train ${train.id}`,
    status: train.current_delay_minutes && train.current_delay_minutes > 0 ? 'delayed' as const : 'on-time' as const,
    currentLocation: train.route_sections[0] || 'Unknown',
    delay: train.current_delay_minutes || 0,
    nextStation: train.route_sections[1] || train.route_sections[0] || 'Terminal',
    eta: new Date(Date.now() + (train.due_time || 0) * 1000).toISOString(),
  }));

  return { trains, sections: backendState.sections };
};

export const transformFrontendToBackend = (trains: any[]): BackendState => {
  return {
    trains: trains.map((train, index) => ({
      id: train.id,
      priority: 1, // Default priority
      planned_departure: 0,
      route_sections: [train.currentLocation, train.nextStation],
      due_time: Math.floor((new Date(train.eta).getTime() - Date.now()) / 1000),
      current_delay_minutes: train.delay,
    })),
    sections: [
      { id: 'S1', platform_capacity: 1 },
      { id: 'S2', platform_capacity: 1 },
      { id: 'S3', platform_capacity: 1 },
    ],
  };
};

export const useRealTimeData = () => {
  const [trains, setTrains] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch live data from backend
  const fetchLiveData = useCallback(async (useLive: boolean = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Get current state
      const backendState = await apiService.getLiveSnapshot(useLive, 50);
      
      // Transform to frontend format
      const { trains: frontendTrains } = transformBackendToFrontend(backendState);
      setTrains(frontendTrains);
      
      // Get predictions for conflicts
      const predictions = await apiService.predictConflicts(backendState);
      
      // Transform conflicts to frontend format
      const frontendConflicts = predictions.predicted_conflicts.map((conflict, index) => ({
        id: `conflict-${index}`,
        trains: conflict.train_ids,
        location: conflict.section_id,
        severity: 'medium' as const,
        timeToConflict: conflict.predicted_conflict_time,
        aiResolution: `Reroute ${conflict.train_ids.join(', ')} through alternative sections`,
      }));
      
      setConflicts(frontendConflicts);
      setIsConnected(true);
      setLastUpdate(new Date());
      
    } catch (err) {
      console.error('Failed to fetch live data:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect to backend');
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, []);

  // Optimize schedule
  const optimizeSchedule = useCallback(async () => {
    try {
      setLoading(true);
      const backendState = transformFrontendToBackend(trains);
      const result = await apiService.optimizeSchedule(backendState);
      
      // Update trains with optimized schedule
      // This would require more complex transformation based on the schedule result
      console.log('Schedule optimized:', result);
      
    } catch (err) {
      console.error('Failed to optimize schedule:', err);
      setError(err instanceof Error ? err.message : 'Failed to optimize schedule');
    } finally {
      setLoading(false);
    }
  }, [trains]);

  // Resolve conflicts
  const resolveConflicts = useCallback(async () => {
    try {
      setLoading(true);
      const backendState = transformFrontendToBackend(trains);
      
      // First get predictions
      const predictions = await apiService.predictConflicts(backendState);
      
      // Then resolve conflicts
      const result = await apiService.resolveConflicts(
        backendState, 
        predictions.predicted_conflicts
      );
      
      console.log('Conflicts resolved:', result);
      
      // Refresh data after resolution
      await fetchLiveData();
      
    } catch (err) {
      console.error('Failed to resolve conflicts:', err);
      setError(err instanceof Error ? err.message : 'Failed to resolve conflicts');
    } finally {
      setLoading(false);
    }
  }, [trains, fetchLiveData]);

  // Train actions
  const handleTrainAction = useCallback(async (trainId: string, action: string) => {
    try {
      setLoading(true);
      
      // Update train locally first for immediate feedback
      setTrains(prev => prev.map(train => {
        if (train.id === trainId) {
          switch (action) {
            case 'hold':
              return { ...train, status: 'held' as const };
            case 'expedite':
              return { ...train, status: 'expedited' as const, delay: Math.max(0, train.delay - 5) };
            case 'reroute':
              return { ...train, status: 'rerouting' as const };
            default:
              return train;
          }
        }
        return train;
      }));
      
      // Then sync with backend
      await fetchLiveData();
      
    } catch (err) {
      console.error('Failed to execute train action:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute action');
    } finally {
      setLoading(false);
    }
  }, [fetchLiveData]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isConnected) {
        fetchLiveData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, fetchLiveData]);

  return {
    trains,
    conflicts,
    isConnected,
    lastUpdate,
    loading,
    error,
    fetchLiveData,
    optimizeSchedule,
    resolveConflicts,
    handleTrainAction,
  };
};