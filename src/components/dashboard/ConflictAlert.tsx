import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Clock, Zap, CheckCircle, X, ArrowRight } from "lucide-react";

interface Conflict {
  id: string;
  trains: string[];
  location: string;
  severity: 'low' | 'medium' | 'high';
  aiResolution?: string;
  timeToConflict: number;
}

interface ConflictAlertProps {
  conflicts: Conflict[];
  onResolve: (conflictId: string) => void;
}

export function ConflictAlert({ conflicts, onResolve }: ConflictAlertProps) {
  const [expandedConflict, setExpandedConflict] = useState<string | null>(null);
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return Clock;
      default: return AlertTriangle;
    }
  };

  const formatTimeToConflict = (minutes: number) => {
    if (minutes < 1) return "Imminent";
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  return (
    <div className="space-y-4">
      {conflicts.map((conflict) => {
        const SeverityIcon = getSeverityIcon(conflict.severity);
        const isExpanded = expandedConflict === conflict.id;
        
        return (
          <Card 
            key={conflict.id} 
            className="border-l-4 animate-slide-up"
            style={{
              borderLeftColor: conflict.severity === 'high' ? 'hsl(var(--destructive))' : 
                              conflict.severity === 'medium' ? 'hsl(var(--warning))' : 
                              'hsl(var(--primary))'
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    conflict.severity === 'high' ? 'bg-destructive/10 text-destructive' :
                    conflict.severity === 'medium' ? 'bg-warning/10 text-warning' :
                    'bg-primary/10 text-primary'
                  }`}>
                    <SeverityIcon className="h-5 w-5" />
                  </div>
                  
                  <div>
                    <div className="text-lg font-bold text-foreground">
                      Conflict Detected
                    </div>
                    <div className="text-sm text-muted-foreground font-normal">
                      {conflict.location}
                    </div>
                  </div>
                </CardTitle>
                
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={getSeverityColor(conflict.severity)}
                    className="animate-pulse"
                  >
                    {conflict.severity.toUpperCase()} PRIORITY
                  </Badge>
                  
                  <div className="text-right">
                    <div className="text-sm font-mono font-bold text-warning">
                      {formatTimeToConflict(conflict.timeToConflict)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      to conflict
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Affected Trains */}
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-muted-foreground min-w-0">
                  Affected Trains:
                </div>
                <div className="flex items-center gap-2">
                  {conflict.trains.map((trainId, index) => (
                    <div key={trainId} className="flex items-center gap-2">
                      <Badge variant="outline" className="font-mono">
                        {trainId}
                      </Badge>
                      {index < conflict.trains.length - 1 && (
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Resolution */}
              {conflict.aiResolution && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-accent" />
                      <span className="text-sm font-medium text-accent">
                        AI Recommended Resolution
                      </span>
                    </div>
                    
                    <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
                      <p className="text-sm text-foreground font-medium">
                        {conflict.aiResolution}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          Expected impact: Minimal delay • Safety: ✓ Verified
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={() => onResolve(conflict.id)}
                  className="flex items-center gap-2 bg-gradient-primary hover:shadow-glow transition-all duration-300"
                >
                  <CheckCircle className="h-4 w-4" />
                  Accept AI Solution
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => setExpandedConflict(
                    isExpanded ? null : conflict.id
                  )}
                  className="flex items-center gap-2"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Manual Override
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="ml-auto text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Expanded Manual Override Options */}
              {isExpanded && (
                <>
                  <Separator />
                  <div className="space-y-3 animate-slide-up">
                    <div className="text-sm font-medium text-foreground">
                      Manual Resolution Options:
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-3"
                        onClick={() => onResolve(conflict.id)}
                      >
                        <div className="text-left">
                          <div className="font-medium">Hold T001 at Station A</div>
                          <div className="text-xs text-muted-foreground">
                            +5 minute delay
                          </div>
                        </div>
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="justify-start h-auto p-3"
                        onClick={() => onResolve(conflict.id)}
                      >
                        <div className="text-left">
                          <div className="font-medium">Speed up T002</div>
                          <div className="text-xs text-muted-foreground">
                            +2 minute delay
                          </div>
                        </div>
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}