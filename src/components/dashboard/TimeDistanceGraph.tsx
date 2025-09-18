import { useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Train {
  id: string;
  name: string;
  status: 'on-time' | 'delayed' | 'conflict';
  currentLocation: string;
  delay: number;
  nextStation: string;
  eta: string;
}

interface TimeDistanceGraphProps {
  trains: Train[];
}

export function TimeDistanceGraph({ trains }: TimeDistanceGraphProps) {
  const [hoveredTrain, setHoveredTrain] = useState<string | null>(null);

  // Mock data for visualization - in real app this would come from backend
  const stations = ["Station A", "Station B", "Station C", "Station D", "Station E"];
  const timeRange = { start: 14, end: 18 }; // 14:00 to 18:00
  
  // Generate sample paths for trains
  const getTrainPath = (trainId: string) => {
    const baseSpeed = trainId === "T001" ? 0.8 : trainId === "T002" ? 1.2 : 1.0;
    const delay = trains.find(t => t.id === trainId)?.delay || 0;
    const delayOffset = delay * 2; // Convert minutes to graph units
    
    return stations.map((_, index) => ({
      station: index,
      time: timeRange.start + (index * baseSpeed) + (delayOffset / 60),
      trainId
    }));
  };

  const trainPaths = trains.map(train => ({
    train,
    path: getTrainPath(train.id)
  }));

  const getTrainColor = (status: string) => {
    switch (status) {
      case 'on-time': return 'hsl(var(--success))';
      case 'delayed': return 'hsl(var(--warning))';
      case 'conflict': return 'hsl(var(--destructive))';
      default: return 'hsl(var(--primary))';
    }
  };

  return (
    <div className="w-full h-96 relative bg-card/50 rounded-lg border border-border/50 p-4">
      {/* SVG Graph */}
      <svg className="w-full h-full" viewBox="0 0 800 400">
        {/* Grid Lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" className="chart-grid" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Y-axis (Stations) */}
        <g>
          {stations.map((station, index) => {
            const y = 50 + (index * 60);
            return (
              <g key={station}>
                <line 
                  x1="80" 
                  y1={y} 
                  x2="750" 
                  y2={y} 
                  className="chart-axis opacity-20"
                />
                <text 
                  x="75" 
                  y={y + 5} 
                  textAnchor="end" 
                  className="text-xs fill-muted-foreground font-medium"
                >
                  {station}
                </text>
              </g>
            );
          })}
        </g>

        {/* X-axis (Time) */}
        <g>
          {Array.from({ length: 5 }, (_, i) => {
            const hour = timeRange.start + i;
            const x = 80 + (i * 167.5);
            return (
              <g key={hour}>
                <line 
                  x1={x} 
                  y1="50" 
                  x2={x} 
                  y2="350" 
                  className="chart-axis opacity-20"
                />
                <text 
                  x={x} 
                  y="370" 
                  textAnchor="middle" 
                  className="text-xs fill-muted-foreground font-mono"
                >
                  {hour}:00
                </text>
              </g>
            );
          })}
        </g>

        {/* Train Paths */}
        {trainPaths.map(({ train, path }) => {
          const pathPoints = path.map(point => {
            const x = 80 + ((point.time - timeRange.start) / (timeRange.end - timeRange.start)) * 670;
            const y = 50 + (point.station * 60);
            return `${x},${y}`;
          }).join(' ');

          return (
            <g key={train.id}>
              {/* Train path line */}
              <polyline
                points={pathPoints}
                fill="none"
                stroke={getTrainColor(train.status)}
                strokeWidth={hoveredTrain === train.id ? "4" : "3"}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-200"
                style={{
                  filter: hoveredTrain === train.id ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                }}
                onMouseEnter={() => setHoveredTrain(train.id)}
                onMouseLeave={() => setHoveredTrain(null)}
              />
              
              {/* Train position markers */}
              {path.map((point, index) => (
                <circle
                  key={`${train.id}-${index}`}
                  cx={80 + ((point.time - timeRange.start) / (timeRange.end - timeRange.start)) * 670}
                  cy={50 + (point.station * 60)}
                  r={hoveredTrain === train.id ? "6" : "4"}
                  fill={getTrainColor(train.status)}
                  className="transition-all duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredTrain(train.id)}
                  onMouseLeave={() => setHoveredTrain(null)}
                />
              ))}
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="absolute top-4 right-4 space-y-2">
        {trains.map(train => (
          <div 
            key={train.id}
            className={`flex items-center gap-2 px-3 py-1 rounded-lg transition-all duration-200 cursor-pointer
              ${hoveredTrain === train.id 
                ? 'bg-card/80 shadow-glow border border-border/50' 
                : 'bg-card/30 border border-transparent'
              }`}
            onMouseEnter={() => setHoveredTrain(train.id)}
            onMouseLeave={() => setHoveredTrain(null)}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getTrainColor(train.status) }}
            />
            <span className="text-sm font-medium text-foreground">
              {train.id}
            </span>
            <Badge 
              variant={train.status === 'on-time' ? 'default' : 
                     train.status === 'delayed' ? 'secondary' : 'destructive'}
              className="text-xs"
            >
              {train.status === 'on-time' ? 'On Time' : 
               train.status === 'delayed' ? `+${train.delay}m` : 'Conflict'}
            </Badge>
          </div>
        ))}
      </div>

      {/* Hover tooltip */}
      {hoveredTrain && (
        <div className="absolute bottom-4 left-4 bg-popover/95 border border-border/50 rounded-lg p-3 shadow-lg backdrop-blur-sm">
          {(() => {
            const train = trains.find(t => t.id === hoveredTrain);
            return train ? (
              <div className="space-y-1">
                <div className="font-semibold text-sm text-foreground">{train.name}</div>
                <div className="text-xs text-muted-foreground">Current: {train.currentLocation}</div>
                <div className="text-xs text-muted-foreground">Next: {train.nextStation}</div>
                <div className="text-xs text-muted-foreground">ETA: {train.eta}</div>
              </div>
            ) : null;
          })()}
        </div>
      )}
    </div>
  );
}