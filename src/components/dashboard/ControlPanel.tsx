import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Settings, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle
} from "lucide-react";

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

interface ControlPanelProps {
  trains: Train[];
  conflicts: Conflict[];
  onTrainUpdate: (trainId: string, updates: Partial<Train>) => void;
  onTrainAction?: (trainId: string, action: string) => Promise<void>;
  onOptimizeSchedule?: () => Promise<void>;
  isConnected?: boolean;
  loading?: boolean;
}

export function ControlPanel({ 
  trains, 
  conflicts, 
  onTrainUpdate, 
  onTrainAction,
  onOptimizeSchedule,
  isConnected = false,
  loading = false
}: ControlPanelProps) {
  const [selectedTrain, setSelectedTrain] = useState<string>("");
  const [simulationRunning, setSimulationRunning] = useState(true);
  const [aiAssistance, setAiAssistance] = useState(true);
  const [autoResolve, setAutoResolve] = useState(false);

  const handleTrainAction = async (action: string) => {
    if (!selectedTrain) return;
    
    // Use backend action if available, otherwise fall back to local update
    if (onTrainAction) {
      await onTrainAction(selectedTrain, action);
    } else {
      const train = trains.find(t => t.id === selectedTrain);
      if (!train) return;

      switch (action) {
        case 'hold':
          onTrainUpdate(selectedTrain, {
            status: 'delayed',
            delay: train.delay + 5
          });
          break;
        case 'expedite':
          onTrainUpdate(selectedTrain, {
            delay: Math.max(0, train.delay - 3)
          });
          break;
        case 'reroute':
          onTrainUpdate(selectedTrain, {
            currentLocation: `${train.currentLocation} (Rerouted)`,
            delay: train.delay + 2
          });
          break;
      }
    }
  };

  const toggleSimulation = () => {
    setSimulationRunning(!simulationRunning);
  };

  const resetSimulation = () => {
    // Reset all trains to initial state
    trains.forEach(train => {
      onTrainUpdate(train.id, {
        status: 'on-time',
        delay: 0
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* Simulation Controls */}
      <Card className="glass-panel">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Play className="h-4 w-4 text-primary" />
            Simulation Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={toggleSimulation}
              variant={simulationRunning ? "default" : "outline"}
              size="sm"
              className="flex items-center gap-2"
            >
              {simulationRunning ? (
                <>
                  <Pause className="h-3 w-3" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Resume
                </>
              )}
            </Button>
            
            <Button
              onClick={resetSimulation}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </Button>
            
            <Badge 
              variant={simulationRunning ? "default" : "secondary"}
              className="ml-auto animate-pulse"
            >
              {simulationRunning ? "Live" : "Paused"}
            </Badge>
          </div>

          <Separator />

          {/* AI Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="ai-assistance" className="text-sm font-medium">
                AI Assistance
              </Label>
              <Switch
                id="ai-assistance"
                checked={aiAssistance}
                onCheckedChange={setAiAssistance}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-resolve" className="text-sm font-medium">
                Auto-resolve Low Priority
              </Label>
              <Switch
                id="auto-resolve"
                checked={autoResolve}
                onCheckedChange={setAutoResolve}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Train Control */}
      <Card className="glass-panel">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="h-4 w-4 text-accent" />
            Train Control
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="train-select" className="text-sm font-medium">
              Select Train
            </Label>
            <Select value={selectedTrain} onValueChange={setSelectedTrain}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a train to control" />
              </SelectTrigger>
              <SelectContent>
                {trains.map((train) => (
                  <SelectItem key={train.id} value={train.id}>
                    <div className="flex items-center gap-2">
                      <span className="font-mono">{train.id}</span>
                      <span className="text-muted-foreground">-</span>
                      <span className="truncate">{train.name}</span>
                      <Badge 
                        variant={train.status === 'on-time' ? 'default' : 
                               train.status === 'delayed' ? 'secondary' : 'destructive'}
                        className="ml-auto text-xs"
                      >
                        {train.status === 'delayed' ? `+${train.delay}m` : train.status}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTrain && (
            <>
              <Separator />
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground">
                  Control Actions
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => handleTrainAction('hold')}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    disabled={loading}
                  >
                    <Clock className="h-3 w-3 mr-2" />
                    {loading ? "Processing..." : "Hold at Current Station (+5m)"}
                  </Button>
                  
                  <Button
                    onClick={() => handleTrainAction('expedite')}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    disabled={loading}
                  >
                    <ArrowRight className="h-3 w-3 mr-2" />
                    {loading ? "Processing..." : "Expedite Journey (-3m)"}
                  </Button>
                  
                  <Button
                    onClick={() => handleTrainAction('reroute')}
                    variant="outline"
                    size="sm"
                    className="justify-start"
                    disabled={loading}
                  >
                    <RotateCcw className="h-3 w-3 mr-2" />
                    {loading ? "Processing..." : "Reroute via Loop Line (+2m)"}
                  </Button>

                  {onOptimizeSchedule && (
                    <Button
                      onClick={onOptimizeSchedule}
                      variant="default"
                      size="sm"
                      className="justify-start mt-2"
                      disabled={loading}
                    >
                      <Zap className="h-3 w-3 mr-2" />
                      {loading ? "Optimizing..." : "Optimize Schedule"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Active Conflicts Summary */}
      {conflicts.length > 0 && (
        <Card className="glass-panel border-l-4 border-l-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Active Conflicts ({conflicts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-3 rounded-lg bg-destructive/5 border border-destructive/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-foreground">
                      {conflict.location}
                    </div>
                    <Badge 
                      variant="destructive" 
                      className="text-xs animate-pulse"
                    >
                      {conflict.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    Trains: {conflict.trains.join(', ')} • 
                    Time to conflict: {conflict.timeToConflict}m
                  </div>
                  
                  {conflict.aiResolution && aiAssistance && (
                    <div className="flex items-start gap-2 mt-2">
                      <Zap className="h-3 w-3 mt-0.5 text-accent flex-shrink-0" />
                      <div className="text-xs text-accent font-medium">
                        {conflict.aiResolution}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card className="glass-panel">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <CheckCircle className="h-4 w-4 text-success" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI Engine</span>
              <Badge variant={isConnected ? "default" : "secondary"}>
                {isConnected ? "Connected" : "Demo Mode"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Simulation</span>
              <Badge variant={simulationRunning ? "default" : "secondary"}>
                {simulationRunning ? "Running" : "Paused"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Backend Status</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Update</span>
              <span className="text-sm font-mono text-foreground">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}