import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TimeDistanceGraph } from "./TimeDistanceGraph";
import { TrackLayout } from "./TrackLayout";
import { ControlPanel } from "./ControlPanel";
import { ConflictAlert } from "./ConflictAlert";
import { TrainStatus } from "./TrainStatus";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Zap, Activity, Clock, Wifi, WifiOff, RefreshCw } from "lucide-react";

interface Train {
  id: string;
  name: string;
  status: 'on-time' | 'delayed' | 'conflict';
  currentLocation: string;
  delay: number;
  nextStation: string;
  eta: string;
}

interface Conflict {
  id: string;
  trains: string[];
  location: string;
  severity: 'low' | 'medium' | 'high';
  aiResolution?: string;
  timeToConflict: number;
}

const mockTrains: Train[] = [
  {
    id: "T001",
    name: "Express Mumbai-Delhi",
    status: "delayed",
    currentLocation: "Section AB",
    delay: 10,
    nextStation: "Station B",
    eta: "14:35"
  },
  {
    id: "T002", 
    name: "Local Delhi-Agra",
    status: "on-time",
    currentLocation: "Station B",
    delay: 0,
    nextStation: "Section BC",
    eta: "14:28"
  },
  {
    id: "T003",
    name: "Freight Delhi-Mumbai", 
    status: "on-time",
    currentLocation: "Section CD",
    delay: 0,
    nextStation: "Station D",
    eta: "15:45"
  }
];

const mockConflicts: Conflict[] = [
  {
    id: "C001",
    trains: ["T001", "T002"],
    location: "Section AB Junction",
    severity: "high",
    aiResolution: "Route T002 via Loop Line at Station B (+3 min delay)",
    timeToConflict: 18
  }
];

export function TrafficDashboard() {
  const {
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
  } = useRealTimeData();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial data load
  useEffect(() => {
    fetchLiveData();
  }, [fetchLiveData]);

  // Show notifications for errors
  useEffect(() => {
    if (error) {
      toast({
        title: "Connection Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleConnectBackend = async () => {
    try {
      await fetchLiveData(true); // Try live data
      toast({
        title: "Connected Successfully",
        description: "Connected to backend and loaded live data",
      });
    } catch {
      await fetchLiveData(false); // Fallback to demo data
      toast({
        title: "Demo Mode",
        description: "Using demo data - backend not available",
      });
    }
  };

  const handleOptimize = async () => {
    await optimizeSchedule();
    toast({
      title: "Schedule Optimized",
      description: "Train schedule has been optimized for efficiency",
    });
  };

  const handleResolveAll = async () => {
    await resolveConflicts();
    toast({
      title: "Conflicts Resolved",
      description: "AI has resolved all detected conflicts",
    });
  };

  const onTimeTrains = trains.filter(t => t.status === 'on-time').length;
  const delayedTrains = trains.filter(t => t.status === 'delayed').length;
  const conflictTrains = trains.filter(t => t.status === 'conflict').length;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Zap className="h-8 w-8 text-primary animate-glow" />
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  AI Traffic Control System
                </h1>
                <p className="text-muted-foreground">
                  Smart India Hackathon 2025 - Railway Operations Center
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-mono font-bold text-primary">
                {currentTime.toLocaleTimeString()}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString()}
              </div>
              <div className="text-xs text-muted-foreground">
                Last Update: {lastUpdate.toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchLiveData()}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button
                variant={isConnected ? "secondary" : "outline"}
                size="sm"
                onClick={handleConnectBackend}
                disabled={loading}
              >
                {isConnected ? <Wifi className="h-4 w-4 mr-1" /> : <WifiOff className="h-4 w-4 mr-1" />}
                {isConnected ? 'Connected' : 'Connect'}
              </Button>
            </div>
            <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
              <Activity className="h-3 w-3" />
              {isConnected ? 'Live' : 'Demo'}
            </Badge>
          </div>
        </div>
        
        <Separator className="mt-6" />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="control-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Activity className="h-4 w-4 text-success" />
              Active Trains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {trains.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {isConnected ? 'Live data' : 'Demo data'}
            </p>
          </CardContent>
        </Card>

        <Card className="control-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              On Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {onTimeTrains}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Running on schedule
            </p>
          </CardContent>
        </Card>

        <Card className="control-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
              Delayed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              {delayedTrains}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Behind schedule
            </p>
          </CardContent>
        </Card>

        <Card className="control-panel">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {conflicts.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Conflict Alerts */}
      {conflicts.length > 0 && (
        <div className="mb-8">
          <ConflictAlert 
            conflicts={conflicts}
            onResolve={(conflictId) => {
              console.log(`Resolving conflict ${conflictId}`);
              handleResolveAll();
            }}
          />
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleResolveAll}
              disabled={loading}
              variant="default"
            >
              {loading ? "Resolving..." : "Resolve All Conflicts"}
            </Button>
          </div>
        </div>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Time-Distance Graph */}
        <div className="lg:col-span-2">
          <Card className="control-panel h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Time-Distance Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimeDistanceGraph trains={trains} />
            </CardContent>
          </Card>
        </div>

        {/* Train Status Panel */}
        <div>
          <Card className="control-panel h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent" />
                Train Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TrainStatus trains={trains} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Track Layout and Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <Card className="control-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-success" />
              Track Layout & Occupancy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TrackLayout trains={trains} />
          </CardContent>
        </Card>

        <Card className="control-panel">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-warning" />
              Control Panel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ControlPanel 
              trains={trains}
              conflicts={conflicts}
              onTrainUpdate={() => {
                // Local update for immediate feedback
                // Real backend sync happens through handleTrainAction
              }}
              onTrainAction={handleTrainAction}
              onOptimizeSchedule={handleOptimize}
              isConnected={isConnected}
              loading={loading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}