import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, ArrowRight, AlertTriangle, CheckCircle } from "lucide-react";

interface Train {
  id: string;
  name: string;
  status: 'on-time' | 'delayed' | 'conflict';
  currentLocation: string;
  delay: number;
  nextStation: string;
  eta: string;
}

interface TrainStatusProps {
  trains: Train[];
}

export function TrainStatus({ trains }: TrainStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time': return CheckCircle;
      case 'delayed': return Clock;
      case 'conflict': return AlertTriangle;
      default: return CheckCircle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'text-success';
      case 'delayed': return 'text-warning';
      case 'conflict': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBadge = (status: string, delay: number) => {
    switch (status) {
      case 'on-time': 
        return <Badge className="bg-success/10 text-success border-success/20">On Time</Badge>;
      case 'delayed': 
        return <Badge className="bg-warning/10 text-warning border-warning/20">+{delay}m</Badge>;
      case 'conflict': 
        return <Badge className="bg-destructive/10 text-destructive border-destructive/20 animate-pulse">Conflict</Badge>;
      default: 
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {trains.map((train, index) => {
        const StatusIcon = getStatusIcon(train.status);
        
        return (
          <div key={train.id}>
            <div className="space-y-3 p-4 rounded-lg border border-border/50 bg-card/30 hover:bg-card/50 transition-all duration-200">
              {/* Train Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-primary/10 ${getStatusColor(train.status)}`}>
                    <StatusIcon className="h-4 w-4" />
                  </div>
                  
                  <div>
                    <div className="font-semibold text-foreground text-sm">
                      {train.id}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {train.name}
                    </div>
                  </div>
                </div>
                
                {getStatusBadge(train.status, train.delay)}
              </div>

              {/* Location Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Current:</span>
                  <span className="font-medium text-foreground">{train.currentLocation}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Next:</span>
                  <span className="font-medium text-foreground">{train.nextStation}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">ETA:</span>
                  <span className={`font-mono font-medium ${
                    train.status === 'delayed' ? 'text-warning' : 
                    train.status === 'conflict' ? 'text-destructive' : 
                    'text-foreground'
                  }`}>
                    {train.eta}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progress to {train.nextStation}</span>
                  <span>
                    {train.status === 'delayed' ? `${train.delay}m delay` : 
                     train.status === 'conflict' ? 'Conflict detected' : 
                     'On schedule'}
                  </span>
                </div>
                
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ${
                      train.status === 'on-time' ? 'bg-success' :
                      train.status === 'delayed' ? 'bg-warning' :
                      'bg-destructive animate-pulse'
                    }`}
                    style={{ 
                      width: `${65 + Math.random() * 20}%` // Mock progress
                    }}
                  />
                </div>
              </div>

              {/* Additional Status Info */}
              {train.status === 'conflict' && (
                <div className="mt-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-destructive">
                    <AlertTriangle className="h-3 w-3" />
                    <span className="font-medium">
                      Potential conflict detected at {train.currentLocation}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    AI resolution system is calculating optimal path adjustments
                  </div>
                </div>
              )}

              {train.status === 'delayed' && train.delay > 5 && (
                <div className="mt-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 text-xs text-warning">
                    <Clock className="h-3 w-3" />
                    <span className="font-medium">
                      Significant delay: {train.delay} minutes behind schedule
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Cascading delays may affect connecting services
                  </div>
                </div>
              )}
            </div>
            
            {index < trains.length - 1 && <Separator className="my-4" />}
          </div>
        );
      })}

      {/* Summary Stats */}
      <div className="mt-6 p-4 bg-gradient-surface rounded-lg border border-border/50">
        <div className="text-sm font-medium text-foreground mb-3">
          System Performance
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-success">
              {Math.round((trains.filter(t => t.status === 'on-time').length / trains.length) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">On Time</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-primary">
              {Math.round(trains.reduce((sum, t) => sum + (t.delay || 0), 0) / trains.length)}m
            </div>
            <div className="text-xs text-muted-foreground">Avg Delay</div>
          </div>
          
          <div>
            <div className="text-lg font-bold text-accent">
              {trains.length}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
        </div>
      </div>
    </div>
  );
}